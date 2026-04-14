require "rails_helper"

RSpec.describe AuthService do
  describe ".register" do
    let(:email) { "newuser@example.com" }
    let(:password) { "securepass123" }

    it "creates a new user in the database" do
      expect { described_class.register(email: email, password: password) }
        .to change(User, :count).by(1)
    end

    it "returns a hash with :user and :token keys" do
      result = described_class.register(email: email, password: password)
      expect(result).to include(:user, :token)
      expect(result[:user]).to be_a(User)
      expect(result[:token]).to be_a(String)
    end

    it "raises ActiveRecord::RecordInvalid for duplicate email" do
      create(:user, email: email)
      expect { described_class.register(email: email, password: password) }
        .to raise_error(ActiveRecord::RecordInvalid)
    end

    it "raises ActiveRecord::RecordInvalid for short password" do
      expect { described_class.register(email: email, password: "short") }
        .to raise_error(ActiveRecord::RecordInvalid)
    end

    it "returns a token decodable by JwtService with correct user_id" do
      result = described_class.register(email: email, password: password)
      payload = JwtService.decode(token: result[:token])
      expect(payload["user_id"]).to eq(result[:user].id)
    end
  end

  describe ".authenticate" do
    let!(:user) { create(:user, email: "auth@example.com", password: "password123") }

    it "returns a hash with :user and :token for valid credentials" do
      result = described_class.authenticate(email: "auth@example.com", password: "password123")
      expect(result).to include(:user, :token)
      expect(result[:user]).to eq(user)
    end

    it "returns nil for wrong password" do
      result = described_class.authenticate(email: "auth@example.com", password: "wrongpassword")
      expect(result).to be_nil
    end

    it "returns nil for non-existent email" do
      result = described_class.authenticate(email: "nonexistent@example.com", password: "password123")
      expect(result).to be_nil
    end
  end
end
