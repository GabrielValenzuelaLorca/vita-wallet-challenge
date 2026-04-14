require "rails_helper"

RSpec.describe WalletSerializer do
  let(:user) { create(:user, :with_wallets) }
  let(:wallet) { user.wallets.find_by(currency: "BTC") }

  describe "#as_json" do
    subject(:serialized) { described_class.new(wallet).as_json }

    it "returns id, currency, and balance" do
      expect(serialized).to include(:id, :currency, :balance)
    end

    it "returns balance as a string" do
      expect(serialized[:balance]).to be_a(String)
    end

    it "preserves balance precision" do
      expect(serialized[:balance]).to eq("100.0")
    end

    it "returns the correct currency" do
      expect(serialized[:currency]).to eq("BTC")
    end

    it "does not include sensitive user fields" do
      expect(serialized.keys).to match_array([:id, :currency, :balance])
    end
  end

  describe ".serialize_collection" do
    subject(:collection) { described_class.serialize_collection(user.wallets) }

    it "wraps items in data array with meta" do
      expect(collection).to have_key(:data)
      expect(collection).to have_key(:meta)
    end

    it "returns all wallets" do
      expect(collection[:data].length).to eq(Wallet::CURRENCIES.length)
    end

    it "serializes each wallet with correct keys" do
      collection[:data].each do |wallet_data|
        expect(wallet_data.keys).to match_array([:id, :currency, :balance])
      end
    end
  end
end
