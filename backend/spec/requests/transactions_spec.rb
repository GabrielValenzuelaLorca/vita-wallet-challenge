require "rails_helper"

RSpec.describe "Transactions endpoints", type: :request do
  describe "GET /transactions" do
    context "without authorization header" do
      it "returns 401" do
        get "/transactions"

        expect(response).to have_http_status(:unauthorized)
        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("unauthorized")
      end
    end

    context "with invalid token" do
      it "returns 401" do
        get "/transactions", headers: { "Authorization" => "Bearer invalid.token.here" }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with valid token" do
      let(:user) { create(:user, :with_wallets) }
      let(:token) { JwtService.encode(user_id: user.id) }
      let(:headers) { { "Authorization" => "Bearer #{token}" } }

      def build_transaction(user:, status: "completed", rejection_reason: nil, created_at: Time.current)
        user.transactions.create!(
          source_currency: "USD",
          target_currency: "BTC",
          source_amount: BigDecimal("10"),
          target_amount: BigDecimal("0.0001"),
          exchange_rate: BigDecimal("0.00001"),
          status: status,
          rejection_reason: rejection_reason,
          created_at: created_at
        )
      end

      context "empty history" do
        it "returns 200 with empty data array and meta total 0" do
          get "/transactions", headers: headers

          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body["data"]).to eq([])
          expect(body.dig("meta", "total")).to eq(0)
          expect(body.dig("meta", "page")).to eq(1)
          expect(body.dig("meta", "per_page")).to eq(20)
        end
      end

      context "with transactions" do
        before do
          build_transaction(user: user, status: "completed", created_at: 3.hours.ago)
          build_transaction(user: user, status: "rejected", rejection_reason: "insufficient_balance", created_at: 2.hours.ago)
          build_transaction(user: user, status: "pending", created_at: 1.hour.ago)
        end

        it "returns 200 with data envelope" do
          get "/transactions", headers: headers

          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body).to have_key("data")
          expect(body).to have_key("meta")
          expect(body["data"]).to be_an(Array)
        end

        it "returns transactions in descending created_at order" do
          get "/transactions", headers: headers

          body = JSON.parse(response.body)
          statuses = body["data"].map { |transaction| transaction["status"] }
          expect(statuses).to eq(%w[pending rejected completed])
        end

        it "returns each transaction with all serialized fields" do
          get "/transactions", headers: headers

          body = JSON.parse(response.body)
          first_transaction = body["data"].first
          expected_fields = %w[id source_currency target_currency source_amount target_amount exchange_rate status rejection_reason created_at]
          expected_fields.each do |field|
            expect(first_transaction).to have_key(field)
          end
        end

        it "returns amount fields as strings for precision preservation" do
          get "/transactions", headers: headers

          body = JSON.parse(response.body)
          first_transaction = body["data"].first
          expect(first_transaction["source_amount"]).to be_a(String)
          expect(first_transaction["target_amount"]).to be_a(String)
          expect(first_transaction["exchange_rate"]).to be_a(String)
        end

        it "does not return other users' transactions" do
          other_user = create(:user, :with_wallets)
          build_transaction(user: other_user, status: "completed")

          get "/transactions", headers: headers

          body = JSON.parse(response.body)
          expect(body["data"].length).to eq(3)
          expect(body.dig("meta", "total")).to eq(3)
        end
      end

      context "pagination" do
        before do
          5.times { |index| build_transaction(user: user, status: "completed", created_at: index.hours.ago) }
        end

        it "defaults to page 1 with per_page 20" do
          get "/transactions", headers: headers

          body = JSON.parse(response.body)
          expect(body.dig("meta", "page")).to eq(1)
          expect(body.dig("meta", "per_page")).to eq(20)
          expect(body.dig("meta", "total")).to eq(5)
          expect(body["data"].length).to eq(5)
        end

        it "honors custom page and per_page params" do
          get "/transactions", headers: headers, params: { page: 2, per_page: 2 }

          body = JSON.parse(response.body)
          expect(body.dig("meta", "page")).to eq(2)
          expect(body.dig("meta", "per_page")).to eq(2)
          expect(body.dig("meta", "total")).to eq(5)
          expect(body["data"].length).to eq(2)
        end

        it "caps per_page at 100" do
          get "/transactions", headers: headers, params: { per_page: 9999 }

          body = JSON.parse(response.body)
          expect(body.dig("meta", "per_page")).to eq(100)
        end

        it "returns empty data when page is beyond total" do
          get "/transactions", headers: headers, params: { page: 99, per_page: 20 }

          body = JSON.parse(response.body)
          expect(body["data"]).to eq([])
          expect(body.dig("meta", "total")).to eq(5)
        end
      end

      context "status filter" do
        before do
          build_transaction(user: user, status: "completed", created_at: 3.hours.ago)
          build_transaction(user: user, status: "completed", created_at: 2.hours.ago)
          build_transaction(user: user, status: "rejected", rejection_reason: "insufficient_balance", created_at: 1.hour.ago)
        end

        it "returns only completed when status=completed" do
          get "/transactions", headers: headers, params: { status: "completed" }

          body = JSON.parse(response.body)
          expect(body["data"].length).to eq(2)
          expect(body["data"].map { |transaction| transaction["status"] }.uniq).to eq(["completed"])
          expect(body.dig("meta", "total")).to eq(2)
        end

        it "returns only rejected when status=rejected" do
          get "/transactions", headers: headers, params: { status: "rejected" }

          body = JSON.parse(response.body)
          expect(body["data"].length).to eq(1)
          expect(body["data"].first["status"]).to eq("rejected")
          expect(body["data"].first["rejection_reason"]).to eq("insufficient_balance")
        end

        it "returns 422 with invalid_status when status is unknown" do
          get "/transactions", headers: headers, params: { status: "bogus" }

          expect(response).to have_http_status(:unprocessable_entity)
          body = JSON.parse(response.body)
          expect(body.dig("error", "code")).to eq("invalid_status")
        end

        it "returns all transactions when status param is absent" do
          get "/transactions", headers: headers

          body = JSON.parse(response.body)
          expect(body["data"].length).to eq(3)
        end
      end
    end
  end
end
