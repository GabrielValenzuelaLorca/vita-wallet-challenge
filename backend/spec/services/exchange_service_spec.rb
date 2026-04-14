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
        btc_price_in_usd = BigDecimal("67432.50")
        expected_btc = (BigDecimal("10") / btc_price_in_usd).round(8)
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

      it "calculates target_amount as source * price" do
        btc_price_in_usd = BigDecimal("67432.50")
        expected_usd = BigDecimal("0.001") * btc_price_in_usd

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
        btc_in_usd = BigDecimal("67432.50")
        usdc_in_usd = BigDecimal("1.00")
        source_in_usd = BigDecimal("0.001") * btc_in_usd
        expected_usdc = source_in_usd / usdc_in_usd

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
        usdc_clp = BigDecimal("925.00")
        expected_clp = BigDecimal("10") * usdc_clp

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
        btc_price_in_usd = BigDecimal("67432.50")
        expected_target = (source_amount / btc_price_in_usd).round(8)

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

    context "atomicity / rollback on DB error" do
      it "rolls back source wallet debit if target wallet save fails" do
        # Ensure user and wallets are created before stubbing
        user_record = user
        target_wallet = user_record.wallets.find_by!(currency: "BTC")
        save_call_count = 0

        allow(target_wallet).to receive(:save!).and_wrap_original do |method, *args|
          save_call_count += 1
          raise ActiveRecord::RecordInvalid.new(target_wallet) if save_call_count >= 1
          method.call(*args)
        end

        # Stub the lock query to return our instrumented target wallet
        allow(user_record.wallets).to receive(:lock).and_return(user_record.wallets)
        original_find_by = user_record.wallets.method(:find_by!)
        allow(user_record.wallets).to receive(:find_by!) do |**args|
          if args[:currency] == "BTC"
            target_wallet
          else
            original_find_by.call(**args)
          end
        end

        expect {
          described_class.execute(
            user: user_record, source_currency: "USD", target_currency: "BTC", source_amount: "10"
          )
        }.to raise_error(ActiveRecord::RecordInvalid)

        source_wallet = user_record.wallets.reload.find_by!(currency: "USD")
        expect(source_wallet.balance).to eq(BigDecimal("100"))
      end

      it "does not create a completed Transaction on DB error" do
        user_record = user
        target_wallet = user_record.wallets.find_by!(currency: "BTC")

        allow(target_wallet).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(target_wallet))

        allow(user_record.wallets).to receive(:lock).and_return(user_record.wallets)
        original_find_by = user_record.wallets.method(:find_by!)
        allow(user_record.wallets).to receive(:find_by!) do |**args|
          if args[:currency] == "BTC"
            target_wallet
          else
            original_find_by.call(**args)
          end
        end

        expect {
          described_class.execute(
            user: user_record, source_currency: "USD", target_currency: "BTC", source_amount: "10"
          )
        }.to raise_error(ActiveRecord::RecordInvalid)

        expect(Transaction.where(status: "completed").count).to eq(0)
      end
    end
  end
end
