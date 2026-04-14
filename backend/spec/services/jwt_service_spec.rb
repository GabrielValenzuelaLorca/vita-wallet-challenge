require "rails_helper"

RSpec.describe JwtService do
  let(:user_id) { 42 }

  describe ".encode" do
    it "returns a non-empty string token" do
      token = described_class.encode(user_id: user_id)
      expect(token).to be_a(String)
      expect(token).not_to be_empty
    end
  end

  describe ".decode" do
    it "returns payload with user_id for a valid token" do
      token = described_class.encode(user_id: user_id)
      payload = described_class.decode(token: token)
      expect(payload).to include("user_id" => user_id)
    end

    it "returns nil for an invalid token" do
      payload = described_class.decode(token: "invalid.token.string")
      expect(payload).to be_nil
    end

    it "returns nil for a tampered token" do
      token = described_class.encode(user_id: user_id)
      tampered_token = token + "tampered"
      payload = described_class.decode(token: tampered_token)
      expect(payload).to be_nil
    end

    it "returns nil for an expired token" do
      token = described_class.encode(user_id: user_id)
      travel_to 25.hours.from_now do
        payload = described_class.decode(token: token)
        expect(payload).to be_nil
      end
    end

    it "contains the correct user_id in the payload" do
      token = described_class.encode(user_id: 99)
      payload = described_class.decode(token: token)
      expect(payload["user_id"]).to eq(99)
    end
  end
end
