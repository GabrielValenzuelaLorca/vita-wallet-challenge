require "rails_helper"

RSpec.describe "Prices endpoints", type: :request do
  describe "GET /prices" do
    context "without authorization header" do
      it "returns 401" do
        get "/prices"

        expect(response).to have_http_status(:unauthorized)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("unauthorized")
      end
    end

    context "with valid token" do
      let(:user) { create(:user) }
      let(:token) { JwtService.encode(user_id: user.id) }
      let(:headers) { { "Authorization" => "Bearer #{token}" } }

      before do
        Rails.cache.clear
        Rails.application.config.price_client = StubPriceClient.new
      end

      it "returns 200" do
        get "/prices", headers: headers

        expect(response).to have_http_status(:ok)
      end

      it "returns price data in envelope" do
        get "/prices", headers: headers

        body = JSON.parse(response.body)
        expect(body).to have_key("data")
        expect(body["data"]).to be_a(Hash)
      end

      it "includes BTC prices with sell/buy rates per fiat" do
        get "/prices", headers: headers

        body = JSON.parse(response.body)
        expect(body["data"]).to have_key("btc")
        expect(body["data"]["btc"]).to have_key("usd_sell")
      end

      it "includes USDC and USDT prices" do
        get "/prices", headers: headers

        body = JSON.parse(response.body)
        expect(body["data"]).to have_key("usdc")
        expect(body["data"]).to have_key("usdt")
      end
    end

    context "when PriceService raises an error" do
      let(:user) { create(:user) }
      let(:token) { JwtService.encode(user_id: user.id) }
      let(:headers) { { "Authorization" => "Bearer #{token}" } }

      before do
        allow(PriceService).to receive(:fetch_prices).and_raise(
          PriceClient::ApiError.new("External API unavailable", code: :timeout)
        )
      end

      it "returns 503" do
        get "/prices", headers: headers

        expect(response).to have_http_status(:service_unavailable)
      end

      it "returns error envelope with price_service_unavailable code" do
        get "/prices", headers: headers

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("price_service_unavailable")
        expect(body.dig("error", "message")).to include("External API unavailable")
      end
    end
  end
end
