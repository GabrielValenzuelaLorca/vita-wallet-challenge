require "rails_helper"

RSpec.describe UserSerializer do
  let(:user) { create(:user) }

  describe "#as_json" do
    subject(:serialized) { described_class.new(user).as_json }

    it "exposes id" do
      expect(serialized[:id]).to eq(user.id)
    end

    it "exposes email" do
      expect(serialized[:email]).to eq(user.email)
    end

    it "exposes created_at" do
      expect(serialized).to have_key(:created_at)
    end

    it "does not expose password_digest" do
      expect(serialized).not_to have_key(:password_digest)
    end

    it "does not expose tokens_valid_after" do
      expect(serialized).not_to have_key(:tokens_valid_after)
    end

    it "only contains expected keys" do
      expect(serialized.keys).to match_array([:id, :email, :created_at])
    end
  end
end
