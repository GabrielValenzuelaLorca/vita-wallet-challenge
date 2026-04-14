require "rails_helper"

RSpec.describe PriceClient do
  subject(:client) { described_class.new }

  let(:api_url) { PriceClient::API_URL }

  describe "#fetch_prices" do
    context "when API returns valid JSON" do
      let(:valid_response) do
        {
          "BTC" => { "USD" => "67432.50", "CLP" => "62500000.00" },
          "USDC" => { "USD" => "1.00", "CLP" => "925.00" }
        }.to_json
      end

      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: valid_response,
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "returns parsed price hash" do
        result = client.fetch_prices

        expect(result).to be_a(Hash)
        expect(result["BTC"]["USD"]).to eq("67432.50")
      end
    end

    context "when API returns data wrapped in a data key" do
      let(:wrapped_response) do
        {
          "data" => {
            "BTC" => { "USD" => "67432.50" }
          }
        }.to_json
      end

      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: wrapped_response,
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "extracts prices from data key" do
        result = client.fetch_prices

        expect(result["BTC"]["USD"]).to eq("67432.50")
      end
    end

    context "when API times out" do
      before do
        stub_request(:get, api_url).to_timeout
      end

      it "raises ApiError with timeout code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:timeout)
        end
      end
    end

    context "when API returns 500" do
      before do
        stub_request(:get, api_url).to_return(status: 500, body: "Internal Server Error")
      end

      it "raises ApiError with server_error code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:server_error)
          expect(error.message).to include("500")
        end
      end
    end

    context "when API returns invalid JSON" do
      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: "not json at all",
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "raises ApiError with invalid_response code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:invalid_response)
        end
      end
    end

    context "when API returns unexpected structure" do
      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: "[1, 2, 3]",
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "raises ApiError with invalid_response code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:invalid_response)
        end
      end
    end
  end
end
