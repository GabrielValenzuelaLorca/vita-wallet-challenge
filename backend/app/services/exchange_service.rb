class ExchangeService
  # Two-phase exchange flow.
  #
  # Phase 1 (synchronous, commits to DB):
  #   - Lock the source wallet
  #   - Validate balance
  #   - Debit the source wallet
  #   - Persist a Transaction in :pending state
  # Phase 2 (synchronous, can fail):
  #   - Fetch prices
  #   - Compute target amount via RateCalculator
  #   - Credit the target wallet
  #   - Move the Transaction to :completed
  #
  # If Phase 2 fails because of a price-provider error, we refund the source
  # wallet and move the Transaction to :rejected. If Phase 2 fails for any
  # other reason (DB error, crash, lost connection) the Transaction is left in
  # :pending with the source funds already debited; a recovery job (out of
  # scope for this challenge) would pick it up and either retry or refund.
  # Leaving funds debited is intentional — it preserves the audit trail and
  # prevents the same balance from being double-spent by a concurrent request.
  class << self
    def execute(user:, source_currency:, target_currency:, source_amount:)
      validation_result = validate_input(user: user, source_currency: source_currency,
                                         target_currency: target_currency, source_amount: source_amount)
      return validation_result unless validation_result[:success]

      source_amount_decimal = BigDecimal(source_amount.to_s)

      reservation = reserve_balance(user: user, source_currency: source_currency,
                                    target_currency: target_currency,
                                    source_amount_decimal: source_amount_decimal)
      return reservation unless reservation[:success]

      pending_transaction = reservation[:transaction]

      begin
        complete_exchange(user: user, transaction: pending_transaction, target_currency: target_currency)
      rescue PriceClient::ApiError
        refund_and_reject(user: user, transaction: pending_transaction,
                          reason: "price_fetch_failed",
                          error_message: "Could not fetch exchange rates")
      end
    end

    private

    def validate_input(user:, source_currency:, target_currency:, source_amount:)
      unless Wallet::CURRENCIES.include?(source_currency) && Wallet::CURRENCIES.include?(target_currency)
        return error_result(error_code: "invalid_currencies",
                            error_message: "Source and target currencies must be valid (#{Wallet::CURRENCIES.join(', ')})")
      end

      if source_currency == target_currency
        return error_result(error_code: "invalid_currencies",
                            error_message: "Source and target currencies must differ")
      end

      unless user.wallets.exists?(currency: source_currency) && user.wallets.exists?(currency: target_currency)
        return error_result(error_code: "invalid_currencies",
                            error_message: "User must have wallets for both currencies")
      end

      amount_decimal = BigDecimal(source_amount.to_s)
      unless amount_decimal.positive?
        return error_result(error_code: "invalid_amount",
                            error_message: "Amount must be positive")
      end

      { success: true }
    end

    # Phase 1: lock + debit + create pending tx. Commits as a single DB
    # transaction so a concurrent caller cannot read the old balance.
    def reserve_balance(user:, source_currency:, target_currency:, source_amount_decimal:)
      ActiveRecord::Base.transaction do
        source_wallet = user.wallets.lock.find_by!(currency: source_currency)

        unless source_wallet.balance >= source_amount_decimal
          rejected = create_rejected_transaction(
            user: user, source_currency: source_currency, target_currency: target_currency,
            source_amount: source_amount_decimal, rejection_reason: "insufficient_balance"
          )
          next { success: false, transaction: rejected,
                 error_code: "insufficient_balance",
                 error_message: "Insufficient balance in #{source_currency} wallet" }
        end

        source_wallet.balance -= source_amount_decimal
        source_wallet.save!

        pending_tx = Transaction.create!(
          user: user,
          source_currency: source_currency,
          target_currency: target_currency,
          source_amount: source_amount_decimal,
          target_amount: 0,
          exchange_rate: 0,
          status: "pending"
        )

        { success: true, transaction: pending_tx }
      end
    end

    # Phase 2: fetch quote + credit target + complete tx.
    def complete_exchange(user:, transaction:, target_currency:)
      prices = PriceService.fetch_prices

      result = RateCalculator.call(
        source_currency: transaction.source_currency,
        target_currency: target_currency,
        source_amount: transaction.source_amount,
        prices: prices
      )

      ActiveRecord::Base.transaction do
        target_wallet = user.wallets.lock.find_by!(currency: target_currency)
        target_wallet.balance += result[:target_amount]
        target_wallet.save!

        transaction.update!(
          target_amount: result[:target_amount],
          exchange_rate: result[:exchange_rate],
          status: "completed"
        )
      end

      { success: true, transaction: transaction }
    end

    # Compensating action for a recoverable Phase 2 failure (currently only
    # price-provider errors).
    def refund_and_reject(user:, transaction:, reason:, error_message:)
      ActiveRecord::Base.transaction do
        source_wallet = user.wallets.lock.find_by!(currency: transaction.source_currency)
        source_wallet.balance += transaction.source_amount
        source_wallet.save!

        transaction.update!(status: "rejected", rejection_reason: reason)
      end

      { success: false, transaction: transaction,
        error_code: reason, error_message: error_message }
    end

    def create_rejected_transaction(user:, source_currency:, target_currency:, source_amount:, rejection_reason:)
      Transaction.create!(
        user: user,
        source_currency: source_currency,
        target_currency: target_currency,
        source_amount: source_amount,
        target_amount: 0,
        exchange_rate: 0,
        status: "rejected",
        rejection_reason: rejection_reason
      )
    end

    def error_result(error_code:, error_message:)
      { success: false, transaction: nil, error_code: error_code, error_message: error_message }
    end
  end
end
