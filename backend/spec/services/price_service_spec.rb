require "rails_helper"

RSpec.describe PriceService do
  let(:stub_client) { StubPriceClient.new }
  let(:expected_prices) { StubPriceClient::STUB_PRICES }

  before do
    Rails.cache.clear
  end

  describe ".fetch_prices" do
    context "with injected client" do
      it "returns prices from the client" do
        result = described_class.fetch_prices(client: stub_client)

        expect(result).to eq(expected_prices)
      end
    end

    context "cache behavior" do
      let(:spy_client) { instance_double(StubPriceClient) }
      let(:memory_store) { ActiveSupport::Cache::MemoryStore.new }

      before do
        allow(spy_client).to receive(:fetch_prices).and_return(expected_prices)
        allow(Rails).to receive(:cache).and_return(memory_store)
      end

      it "calls the client on first invocation" do
        described_class.fetch_prices(client: spy_client)

        expect(spy_client).to have_received(:fetch_prices).once
      end

      it "returns cached result on second call within TTL" do
        described_class.fetch_prices(client: spy_client)
        described_class.fetch_prices(client: spy_client)

        expect(spy_client).to have_received(:fetch_prices).once
      end

      it "calls client again after TTL expires" do
        described_class.fetch_prices(client: spy_client)

        travel_to(31.seconds.from_now) do
          described_class.fetch_prices(client: spy_client)
        end

        expect(spy_client).to have_received(:fetch_prices).twice
      end
    end

    context "when client raises ApiError" do
      let(:failing_client) { instance_double(StubPriceClient) }

      before do
        allow(failing_client).to receive(:fetch_prices).and_raise(
          PriceClient::ApiError.new("API timeout", code: :timeout)
        )
      end

      it "re-raises PriceClient::ApiError" do
        expect { described_class.fetch_prices(client: failing_client) }
          .to raise_error(PriceClient::ApiError, "API timeout")
      end

      it "preserves the error code" do
        expect { described_class.fetch_prices(client: failing_client) }
          .to raise_error(PriceClient::ApiError) { |error| expect(error.code).to eq(:timeout) }
      end
    end

    context "with default configured client" do
      before do
        Rails.application.config.price_client = stub_client
      end

      it "uses the configured client when none is injected" do
        result = described_class.fetch_prices

        expect(result).to eq(expected_prices)
      end
    end
  end
end
