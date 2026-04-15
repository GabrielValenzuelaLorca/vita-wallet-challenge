require "rails_helper"

RSpec.describe BaseSerializer do
  describe "#as_json" do
    it "raises NotImplementedError when called directly" do
      dummy = Object.new
      expect { described_class.new(dummy).as_json }.to raise_error(NotImplementedError)
    end
  end

  describe ".serialize" do
    let(:user) { create(:user, :with_wallets) }
    let(:wallet) { user.wallets.find_by(currency: "USD") }

    it "wraps the serialized object in a data key" do
      result = WalletSerializer.serialize(wallet)
      expect(result).to have_key(:data)
      expect(result[:data]).to include(:id, :currency, :balance)
    end
  end

  describe ".serialize_collection" do
    let(:user) { create(:user, :with_wallets) }

    it "returns data array and meta" do
      result = WalletSerializer.serialize_collection(user.wallets)
      expect(result).to have_key(:data)
      expect(result).to have_key(:meta)
      expect(result[:data]).to be_an(Array)
    end

    it "serializes each item in the collection" do
      result = WalletSerializer.serialize_collection(user.wallets)
      expect(result[:data].length).to eq(user.wallets.count)
      result[:data].each do |item|
        expect(item).to include(:id, :currency, :balance)
      end
    end

    it "passes meta through" do
      result = WalletSerializer.serialize_collection(user.wallets, meta: { page: 1 })
      expect(result[:meta]).to eq({ page: 1 })
    end
  end
end
