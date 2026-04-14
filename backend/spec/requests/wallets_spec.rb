require "rails_helper"

RSpec.describe "Wallets endpoints", type: :request do
  describe "GET /balances" do
    context "without authorization header" do
      it "returns 401" do
        get "/balances"

        expect(response).to have_http_status(:unauthorized)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("unauthorized")
      end
    end

    context "with invalid token" do
      it "returns 401" do
        get "/balances", headers: { "Authorization" => "Bearer invalid.token.here" }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with valid token" do
      let(:user) { create(:user, :with_wallets) }
      let(:token) { JwtService.encode(user_id: user.id) }
      let(:headers) { { "Authorization" => "Bearer #{token}" } }

      it "returns 200" do
        get "/balances", headers: headers

        expect(response).to have_http_status(:ok)
      end

      it "returns data envelope with wallet array" do
        get "/balances", headers: headers

        body = JSON.parse(response.body)
        expect(body).to have_key("data")
        expect(body["data"]).to be_an(Array)
      end

      it "returns exactly 5 wallets for a user with all currencies" do
        get "/balances", headers: headers

        body = JSON.parse(response.body)
        expect(body["data"].length).to eq(5)
      end

      it "returns wallets with correct shape" do
        get "/balances", headers: headers

        body = JSON.parse(response.body)
        body["data"].each do |wallet_data|
          expect(wallet_data).to have_key("id")
          expect(wallet_data).to have_key("currency")
          expect(wallet_data).to have_key("balance")
        end
      end

      it "returns balance as a string for precision preservation" do
        get "/balances", headers: headers

        body = JSON.parse(response.body)
        body["data"].each do |wallet_data|
          expect(wallet_data["balance"]).to be_a(String)
        end
      end

      it "includes all expected currencies" do
        get "/balances", headers: headers

        body = JSON.parse(response.body)
        currencies = body["data"].map { |wallet| wallet["currency"] }
        expect(currencies).to match_array(Wallet::CURRENCIES)
      end

      it "does not include wallets from other users" do
        other_user = create(:user, :with_wallets)
        get "/balances", headers: headers

        body = JSON.parse(response.body)
        wallet_ids = body["data"].map { |wallet| wallet["id"] }
        other_wallet_ids = other_user.wallets.pluck(:id)
        expect(wallet_ids & other_wallet_ids).to be_empty
      end
    end
  end
end
