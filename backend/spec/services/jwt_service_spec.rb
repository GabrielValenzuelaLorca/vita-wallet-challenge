require "rails_helper"

RSpec.describe JwtService do
  let(:user_id) { 42 }

  describe ".encode" do
    it "returns a non-empty string token" do
      token = described_class.encode(user_id: user_id)
      expect(token).to be_a(String)
      expect(token).not_to be_empty
    end

    it "includes iat in the payload" do
      freeze_time do
        token = described_class.encode(user_id: user_id)
        payload = described_class.decode(token: token)
        expect(payload).to have_key("iat")
        expect(payload["iat"]).to eq(Time.now.to_i)
      end
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

  describe ".token_valid_for_user?" do
    let(:user) { create(:user) }

    context "when tokens_valid_after is nil" do
      it "considers any token valid" do
        payload = { "iat" => 1.hour.ago.to_i }
        expect(described_class.token_valid_for_user?(payload, user)).to be true
      end
    end

    context "when token was issued before tokens_valid_after" do
      it "rejects the token" do
        user.update!(tokens_valid_after: Time.current)
        payload = { "iat" => 1.hour.ago.to_i }
        expect(described_class.token_valid_for_user?(payload, user)).to be false
      end
    end

    context "when token was issued after tokens_valid_after" do
      it "accepts the token" do
        user.update!(tokens_valid_after: 2.hours.ago)
        payload = { "iat" => 1.hour.ago.to_i }
        expect(described_class.token_valid_for_user?(payload, user)).to be true
      end
    end

    context "when token was issued in the exact same second as invalidation" do
      it "rejects the token (strict greater-than)" do
        freeze_time do
          user.update!(tokens_valid_after: Time.current)
          payload = { "iat" => Time.current.to_i }
          expect(described_class.token_valid_for_user?(payload, user)).to be false
        end
      end
    end
  end

  describe ".invalidate_tokens!" do
    let(:user) { create(:user) }

    it "sets tokens_valid_after to current time" do
      freeze_time do
        described_class.invalidate_tokens!(user)
        expect(user.reload.tokens_valid_after).to eq(Time.current)
      end
    end

    it "causes previously issued tokens to become invalid" do
      token = described_class.encode(user_id: user.id)
      payload = described_class.decode(token: token)

      travel_to 1.second.from_now do
        described_class.invalidate_tokens!(user)
        expect(described_class.token_valid_for_user?(payload, user.reload)).to be false
      end
    end

    it "allows tokens issued after invalidation" do
      described_class.invalidate_tokens!(user)

      travel_to 1.second.from_now do
        token = described_class.encode(user_id: user.id)
        payload = described_class.decode(token: token)
        expect(described_class.token_valid_for_user?(payload, user.reload)).to be true
      end
    end
  end
end
