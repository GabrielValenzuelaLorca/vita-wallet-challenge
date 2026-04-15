require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:wallets).dependent(:destroy) }
    it { is_expected.to have_many(:transactions).dependent(:restrict_with_error) }
  end

  describe "destruction" do
    it "prevents deletion when user has transactions" do
      user = create(:user, :with_wallets)
      create(:transaction, user: user)

      expect(user.destroy).to be false
      expect(user.errors[:base]).to be_present
    end
  end

  describe "validations" do
    subject { build(:user) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to have_secure_password }
  end

  describe "#authenticate" do
    let(:user) { create(:user, password: "password123") }

    it "returns the user with correct password" do
      expect(user.authenticate("password123")).to eq(user)
    end

    it "returns false with wrong password" do
      expect(user.authenticate("wrongpassword")).to be false
    end
  end

end
