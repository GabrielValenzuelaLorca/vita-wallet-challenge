require "rails_helper"

RSpec.describe ExchangeService do
  let(:user) { create(:user, :with_wallets) }
  let(:stub_prices) { StubPriceClient::STUB_PRICES }

  before do
    allow(PriceService).to receive(:fetch_prices).and_return(stub_prices)
  end

  describe ".execute" do
    context "happy path: fiat to crypto (USD -> BTC)" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "10"
        )
      end

      it "returns success: true" do
        expect(result[:success]).to be true
      end

      it "returns a completed Transaction" do
        expect(result[:transaction]).to be_a(Transaction)
        expect(result[:transaction].status).to eq("completed")
      end

      it "debits the source wallet by the exact source amount" do
        result
        source_wallet = user.wallets.find_by!(currency: "USD").reload
        expect(source_wallet.balance).to eq(BigDecimal("90"))
      end

      it "credits the target wallet with the correct target amount" do
        result
        # StubPriceClient: btc.usd_sell = "0.00001333333333" (BTC per 1 USD).
        # fiat → crypto: target = source_amount * sell_rate
        btc_per_usd = BigDecimal(stub_prices["btc"]["usd_sell"])
        expected_btc = (BigDecimal("10") * btc_per_usd).round(8)
        target_wallet = user.wallets.find_by!(currency: "BTC").reload
        expect(target_wallet.balance).to eq(BigDecimal("100") + expected_btc)
      end

      it "persists a positive exchange rate on the Transaction" do
        transaction = result[:transaction]
        expect(transaction.exchange_rate).to be_a(BigDecimal)
        expect(transaction.exchange_rate).to be_positive
      end

      it "has no rejection_reason" do
        expect(result[:transaction].rejection_reason).to be_nil
      end

      it "stores amounts as BigDecimal in the database" do
        transaction = result[:transaction].reload
        expect(transaction.source_amount).to be_a(BigDecimal)
        expect(transaction.target_amount).to be_a(BigDecimal)
        expect(transaction.exchange_rate).to be_a(BigDecimal)
      end

      it "ensures source_amount on Transaction matches the requested amount" do
        expect(result[:transaction].source_amount).to eq(BigDecimal("10"))
      end
    end

    context "happy path: crypto to fiat (BTC -> USD)" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "BTC", target_currency: "USD", source_amount: "0.001"
        )
      end

      it "returns success with completed transaction" do
        expect(result[:success]).to be true
        expect(result[:transaction].status).to eq("completed")
      end

      it "calculates target_amount as source / sell_rate" do
        # crypto → fiat: target = source_amount / sell_rate
        # sell_rate = btc.usd_sell = BTC per 1 USD
        btc_per_usd = BigDecimal(stub_prices["btc"]["usd_sell"])
        expected_usd = (BigDecimal("0.001") / btc_per_usd).round(8)

        expect(result[:transaction].target_amount).to eq(expected_usd)
      end

      it "debits BTC wallet and credits USD wallet" do
        result
        btc_wallet = user.wallets.find_by!(currency: "BTC").reload
        usd_wallet = user.wallets.find_by!(currency: "USD").reload

        expect(btc_wallet.balance).to eq(BigDecimal("100") - BigDecimal("0.001"))
        expect(usd_wallet.balance).to be > BigDecimal("100")
      end
    end

    context "happy path: crypto to crypto (BTC -> USDC) via cross-rate" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "BTC", target_currency: "USDC", source_amount: "0.001"
        )
      end

      it "returns success with completed transaction" do
        expect(result[:success]).to be true
        expect(result[:transaction].status).to eq("completed")
      end

      it "updates both wallets correctly" do
        result
        btc_wallet = user.wallets.find_by!(currency: "BTC").reload
        usdc_wallet = user.wallets.find_by!(currency: "USDC").reload

        expect(btc_wallet.balance).to eq(BigDecimal("100") - BigDecimal("0.001"))
        expect(usdc_wallet.balance).to be > BigDecimal("100")
      end

      it "calculates cross-rate through USD" do
        # BTC → USDC: pivot through USD.
        # source_in_usd = BTC / btc.usd_sell
        # target_in_usdc = source_in_usd * usdc.usd_sell
        btc_per_usd = BigDecimal(stub_prices["btc"]["usd_sell"])
        usdc_per_usd = BigDecimal(stub_prices["usdc"]["usd_sell"])
        source_in_usd = BigDecimal("0.001") / btc_per_usd
        expected_usdc = (source_in_usd * usdc_per_usd).round(8)

        expect(result[:transaction].target_amount).to eq(expected_usdc)
      end
    end

    context "happy path: fiat to fiat (USD -> CLP) via cross-rate" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "USD", target_currency: "CLP", source_amount: "10"
        )
      end

      it "returns success with completed transaction" do
        expect(result[:success]).to be true
        expect(result[:transaction].status).to eq("completed")
      end

      it "updates both wallets correctly" do
        result
        usd_wallet = user.wallets.find_by!(currency: "USD").reload
        clp_wallet = user.wallets.find_by!(currency: "CLP").reload

        expect(usd_wallet.balance).to eq(BigDecimal("90"))
        expect(clp_wallet.balance).to be > BigDecimal("100")
      end

      it "calculates cross-rate through USDC" do
        # USD → CLP: pivot through USDC.
        # source is already USD (source_in_usd = 10 USD).
        # target_in_clp = source_in_usd / usdc.clp_sell (USDC per 1 CLP → invert to CLP per 1 USDC)
        usdc_per_clp = BigDecimal(stub_prices["usdc"]["clp_sell"])
        expected_clp = (BigDecimal("10") / usdc_per_clp).round(8)

        expect(result[:transaction].target_amount).to eq(expected_clp)
      end
    end

    context "insufficient balance" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "200"
        )
      end

      it "returns success: false with insufficient_balance error" do
        expect(result[:success]).to be false
        expect(result[:error_code]).to eq("insufficient_balance")
      end

      it "creates a rejected Transaction with rejection_reason" do
        transaction = result[:transaction]
        expect(transaction).to be_a(Transaction)
        expect(transaction.status).to eq("rejected")
        expect(transaction.rejection_reason).to eq("insufficient_balance")
      end

      it "does not change the source wallet balance" do
        result
        source_wallet = user.wallets.find_by!(currency: "USD").reload
        expect(source_wallet.balance).to eq(BigDecimal("100"))
      end

      it "does not change the target wallet balance" do
        result
        target_wallet = user.wallets.find_by!(currency: "BTC").reload
        expect(target_wallet.balance).to eq(BigDecimal("100"))
      end
    end

    context "zero amount" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "0"
        )
      end

      it "returns success: false with invalid_amount error" do
        expect(result[:success]).to be false
        expect(result[:error_code]).to eq("invalid_amount")
      end

      it "does not create a Transaction" do
        expect { result }.not_to change(Transaction, :count)
      end
    end

    context "negative amount" do
      let(:result) do
        described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "-5"
        )
      end

      it "returns success: false with invalid_amount error" do
        expect(result[:success]).to be false
        expect(result[:error_code]).to eq("invalid_amount")
      end

      it "does not create a Transaction" do
        expect { result }.not_to change(Transaction, :count)
      end
    end

    context "invalid currencies" do
      it "returns error for unknown source currency" do
        result = described_class.execute(
          user: user, source_currency: "EUR", target_currency: "BTC", source_amount: "10"
        )

        expect(result[:success]).to be false
        expect(result[:error_code]).to eq("invalid_currencies")
        expect(result[:transaction]).to be_nil
      end

      it "returns error when source equals target" do
        result = described_class.execute(
          user: user, source_currency: "USD", target_currency: "USD", source_amount: "10"
        )

        expect(result[:success]).to be false
        expect(result[:error_code]).to eq("invalid_currencies")
        expect(result[:transaction]).to be_nil
      end

      it "does not create a Transaction for invalid input" do
        expect {
          described_class.execute(
            user: user, source_currency: "EUR", target_currency: "BTC", source_amount: "10"
          )
        }.not_to change(Transaction, :count)
      end
    end

    context "price fetch failure" do
      before do
        allow(PriceService).to receive(:fetch_prices)
          .and_raise(PriceClient::ApiError.new("timeout", code: :timeout))
      end

      let(:result) do
        described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "10"
        )
      end

      it "returns success: false with price_fetch_failed error" do
        expect(result[:success]).to be false
        expect(result[:error_code]).to eq("price_fetch_failed")
      end

      it "creates a rejected Transaction with rejection_reason" do
        transaction = result[:transaction]
        expect(transaction).to be_a(Transaction)
        expect(transaction.status).to eq("rejected")
        expect(transaction.rejection_reason).to eq("price_fetch_failed")
      end

      it "does not change wallet balances" do
        result
        source_wallet = user.wallets.find_by!(currency: "USD").reload
        target_wallet = user.wallets.find_by!(currency: "BTC").reload

        expect(source_wallet.balance).to eq(BigDecimal("100"))
        expect(target_wallet.balance).to eq(BigDecimal("100"))
      end
    end

    context "decimal precision" do
      it "handles very small amounts without floating point drift" do
        result = described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "0.00000001"
        )

        expect(result[:success]).to be true
        expect(result[:transaction].source_amount).to eq(BigDecimal("0.00000001"))
      end

      it "produces target_amount matching manual BigDecimal calculation (DB precision)" do
        source_amount = BigDecimal("100")
        # StubPriceClient: btc.usd_sell = BTC per 1 USD.
        # fiat → crypto: target = source * sell_rate
        btc_per_usd = BigDecimal(stub_prices["btc"]["usd_sell"])
        expected_target = (source_amount * btc_per_usd).round(8)

        result = described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "100"
        )

        expect(result[:transaction].reload.target_amount).to eq(expected_target)
      end

      it "maintains 8+ decimal places in the exchange rate" do
        result = described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "10"
        )

        rate_string = result[:transaction].exchange_rate.to_s("F")
        decimal_part = rate_string.split(".").last
        expect(decimal_part.length).to be >= 8
      end
    end

    # When Phase 2 fails for an UN-rescued reason (DB error, crash, etc.) the
    # transaction is intentionally left in :pending with the source funds
    # already debited. This is the recoverable state the team asked for: the
    # debit prevents a concurrent caller from double-spending the same balance,
    # and a recovery job (out of scope for this challenge) would later either
    # retry the credit or refund.
    context "Phase 2 DB failure (recoverable pending state)" do
      def stub_target_save_to_fail(user_record, currency)
        target_wallet = user_record.wallets.find_by!(currency: currency)
        allow(target_wallet).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(target_wallet))
        allow(user_record.wallets).to receive(:lock).and_return(user_record.wallets)
        original_find_by = user_record.wallets.method(:find_by!)
        allow(user_record.wallets).to receive(:find_by!) do |**args|
          args[:currency] == currency ? target_wallet : original_find_by.call(**args)
        end
      end

      it "leaves the source wallet debited so the pending transaction can be recovered" do
        stub_target_save_to_fail(user, "BTC")

        expect {
          described_class.execute(
            user: user, source_currency: "USD", target_currency: "BTC", source_amount: "10"
          )
        }.to raise_error(ActiveRecord::RecordInvalid)

        source_wallet = user.wallets.reload.find_by!(currency: "USD")
        expect(source_wallet.balance).to eq(BigDecimal("90"))
      end

      it "leaves the transaction in :pending status (not completed, not rejected)" do
        stub_target_save_to_fail(user, "BTC")

        expect {
          described_class.execute(
            user: user, source_currency: "USD", target_currency: "BTC", source_amount: "10"
          )
        }.to raise_error(ActiveRecord::RecordInvalid)

        expect(Transaction.where(status: "completed").count).to eq(0)
        pending = Transaction.where(status: "pending").last
        expect(pending).not_to be_nil
        expect(pending.source_currency).to eq("USD")
        expect(pending.source_amount).to eq(BigDecimal("10"))
      end
    end

    # Verifies the two-phase mechanic explicitly: Phase 1 must commit before
    # Phase 2 runs, so by the time `fetch_prices` is called the source wallet
    # is already debited and a pending Transaction exists.
    context "two-phase mechanic" do
      it "debits and creates a pending transaction before fetching prices, then refunds on price-fetch failure" do
        source_wallet = user.wallets.find_by!(currency: "USD")
        observed_balance_during_fetch = nil
        observed_pending_count = nil

        allow(PriceService).to receive(:fetch_prices) do
          observed_balance_during_fetch = source_wallet.reload.balance
          observed_pending_count = Transaction.where(status: "pending").count
          raise PriceClient::ApiError.new("timeout", code: :timeout)
        end

        result = described_class.execute(
          user: user, source_currency: "USD", target_currency: "BTC", source_amount: "10"
        )

        # Phase 1 had committed by the time Phase 2 reached fetch_prices.
        expect(observed_balance_during_fetch).to eq(BigDecimal("90"))
        expect(observed_pending_count).to eq(1)

        # Refund + reject ran after the failure: balance is back to original
        # and the same Transaction record is now :rejected.
        expect(source_wallet.reload.balance).to eq(BigDecimal("100"))
        expect(result[:success]).to be false
        expect(result[:transaction].reload.status).to eq("rejected")
        expect(result[:transaction].rejection_reason).to eq("price_fetch_failed")
      end
    end
  end
end
