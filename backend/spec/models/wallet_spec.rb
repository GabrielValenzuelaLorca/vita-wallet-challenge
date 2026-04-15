require "rails_helper"

RSpec.describe Wallet, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:currency) }
    it { is_expected.to validate_inclusion_of(:currency).in_array(Wallet::CURRENCIES) }
    it { is_expected.to validate_numericality_of(:balance).is_greater_than_or_equal_to(0) }
  end

  describe "decimal precision" do
    it "stores balance with 8 decimal places" do
      wallet = create(:wallet, :btc, balance: BigDecimal("0.05000000"))
      expect(wallet.reload.balance).to eq(BigDecimal("0.05"))
      expect(wallet.balance).to be_a(BigDecimal)
    end
  end
end
