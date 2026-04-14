require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:wallets).dependent(:destroy) }
    it { is_expected.to have_many(:transactions).dependent(:destroy) }
  end

  describe "validations" do
    subject { User.new(email: "test@example.com", password: "password123") }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to have_secure_password }
  end

  describe "seed data" do
    it "demo user exists with correct wallets" do
      Rails.application.load_seed unless User.exists?(email: "demo@vitawallet.com")
      user = User.find_by!(email: "demo@vitawallet.com")
      expect(user.wallets.count).to eq(5)
      expect(user.wallets.pluck(:currency).sort).to eq(%w[BTC CLP USD USDC USDT])
    end
  end
end
