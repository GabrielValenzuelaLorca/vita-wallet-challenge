require "rails_helper"

RSpec.describe "Exchange endpoints", type: :request do
  describe "POST /exchange" do
    context "without authorization header" do
      it "returns 401" do
        post "/exchange", params: { exchange: { source_currency: "USD", target_currency: "BTC", amount: "10" } }, as: :json

        expect(response).to have_http_status(:unauthorized)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("unauthorized")
      end
    end

    context "with invalid token" do
      it "returns 401" do
        post "/exchange",
             params: { exchange: { source_currency: "USD", target_currency: "BTC", amount: "10" } },
             headers: { "Authorization" => "Bearer invalid.token.here" },
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with valid token" do
      let(:user) { create(:user, :with_wallets) }
      let(:token) { JwtService.encode(user_id: user.id) }
      let(:headers) { { "Authorization" => "Bearer #{token}" } }

      before do
        allow(PriceService).to receive(:fetch_prices).and_return(StubPriceClient::STUB_PRICES)
      end

      context "successful exchange" do
        let(:exchange_params) do
          { exchange: { source_currency: "USD", target_currency: "BTC", amount: "10" } }
        end

        it "returns 201" do
          post "/exchange", params: exchange_params, headers: headers, as: :json

          expect(response).to have_http_status(:created)
        end

        it "returns data envelope with transaction fields" do
          post "/exchange", params: exchange_params, headers: headers, as: :json

          body = JSON.parse(response.body)
          expect(body).to have_key("data")

          transaction_data = body["data"]
          expect(transaction_data).to have_key("id")
          expect(transaction_data).to have_key("source_currency")
          expect(transaction_data).to have_key("target_currency")
          expect(transaction_data).to have_key("source_amount")
          expect(transaction_data).to have_key("target_amount")
          expect(transaction_data).to have_key("exchange_rate")
          expect(transaction_data).to have_key("status")
          expect(transaction_data).to have_key("rejection_reason")
          expect(transaction_data).to have_key("created_at")
        end

        it "returns all amount fields as strings for precision preservation" do
          post "/exchange", params: exchange_params, headers: headers, as: :json

          body = JSON.parse(response.body)
          transaction_data = body["data"]

          expect(transaction_data["source_amount"]).to be_a(String)
          expect(transaction_data["target_amount"]).to be_a(String)
          expect(transaction_data["exchange_rate"]).to be_a(String)
        end

        it "returns status completed" do
          post "/exchange", params: exchange_params, headers: headers, as: :json

          body = JSON.parse(response.body)
          expect(body.dig("data", "status")).to eq("completed")
        end

        it "returns correct currencies" do
          post "/exchange", params: exchange_params, headers: headers, as: :json

          body = JSON.parse(response.body)
          expect(body.dig("data", "source_currency")).to eq("USD")
          expect(body.dig("data", "target_currency")).to eq("BTC")
        end
      end

      context "rejection: insufficient balance" do
        it "returns 422 with insufficient_balance error" do
          post "/exchange",
               params: { exchange: { source_currency: "USD", target_currency: "BTC", amount: "200" } },
               headers: headers,
               as: :json

          expect(response).to have_http_status(:unprocessable_entity)

          body = JSON.parse(response.body)
          expect(body.dig("error", "code")).to eq("insufficient_balance")
        end
      end

      context "rejection: invalid currencies" do
        it "returns 422 when source equals target" do
          post "/exchange",
               params: { exchange: { source_currency: "USD", target_currency: "USD", amount: "10" } },
               headers: headers,
               as: :json

          expect(response).to have_http_status(:unprocessable_entity)

          body = JSON.parse(response.body)
          expect(body.dig("error", "code")).to eq("invalid_currencies")
        end

        it "returns 422 for unknown currency" do
          post "/exchange",
               params: { exchange: { source_currency: "EUR", target_currency: "BTC", amount: "10" } },
               headers: headers,
               as: :json

          expect(response).to have_http_status(:unprocessable_entity)

          body = JSON.parse(response.body)
          expect(body.dig("error", "code")).to eq("invalid_currencies")
        end
      end

      context "rejection: missing params" do
        it "returns error when exchange key is missing" do
          post "/exchange", params: {}, headers: headers, as: :json

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context "integration test: full end-to-end flow" do
        let(:user_with_balance) do
          integration_user = create(:user)
          integration_user.wallets.create!(currency: "USD", balance: BigDecimal("1000"))
          integration_user.wallets.create!(currency: "BTC", balance: BigDecimal("0.05"))
          integration_user.wallets.create!(currency: "CLP", balance: BigDecimal("0"))
          integration_user.wallets.create!(currency: "USDC", balance: BigDecimal("0"))
          integration_user.wallets.create!(currency: "USDT", balance: BigDecimal("0"))
          integration_user
        end
        let(:integration_token) { JwtService.encode(user_id: user_with_balance.id) }
        let(:integration_headers) { { "Authorization" => "Bearer #{integration_token}" } }

        it "executes exchange and verifies DB state, then rejects insufficient balance" do
          # Step 1: Exchange 100 USD -> BTC
          post "/exchange",
               params: { exchange: { source_currency: "USD", target_currency: "BTC", amount: "100" } },
               headers: integration_headers,
               as: :json

          expect(response).to have_http_status(:created)
          body = JSON.parse(response.body)
          expect(body.dig("data", "status")).to eq("completed")

          # Verify DB state
          usd_wallet = user_with_balance.wallets.find_by!(currency: "USD").reload
          btc_wallet = user_with_balance.wallets.find_by!(currency: "BTC").reload

          expect(usd_wallet.balance).to eq(BigDecimal("900"))

          btc_price_in_usd = BigDecimal("67432.50")
          expected_btc_received = (BigDecimal("100") / btc_price_in_usd).round(8)
          expect(btc_wallet.balance).to eq(BigDecimal("0.05") + expected_btc_received)

          # Verify Transaction record
          transaction = Transaction.last
          expect(transaction.user_id).to eq(user_with_balance.id)
          expect(transaction.source_currency).to eq("USD")
          expect(transaction.target_currency).to eq("BTC")
          expect(transaction.source_amount).to eq(BigDecimal("100"))
          expect(transaction.status).to eq("completed")

          # Step 2: Try to exchange 2000 USD (more than remaining 900)
          post "/exchange",
               params: { exchange: { source_currency: "USD", target_currency: "BTC", amount: "2000" } },
               headers: integration_headers,
               as: :json

          expect(response).to have_http_status(:unprocessable_entity)
          body = JSON.parse(response.body)
          expect(body.dig("error", "code")).to eq("insufficient_balance")

          # Verify wallets unchanged from previous state
          expect(usd_wallet.reload.balance).to eq(BigDecimal("900"))
          expect(btc_wallet.reload.balance).to eq(BigDecimal("0.05") + expected_btc_received)
        end
      end
    end
  end
end
