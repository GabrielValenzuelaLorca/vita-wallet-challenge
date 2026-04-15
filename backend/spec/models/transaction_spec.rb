require "rails_helper"

RSpec.describe Transaction, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { build(:transaction) }

    it { is_expected.to validate_presence_of(:source_currency) }
    it { is_expected.to validate_presence_of(:target_currency) }
    it { is_expected.to validate_presence_of(:source_amount) }
    it { is_expected.to validate_presence_of(:target_amount) }
    it { is_expected.to validate_presence_of(:exchange_rate) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_presence_of(:kind) }

    it { is_expected.to validate_inclusion_of(:status).in_array(Transaction::STATUSES) }
    it { is_expected.to validate_inclusion_of(:kind).in_array(Transaction::KINDS) }
    it { is_expected.to validate_inclusion_of(:source_currency).in_array(Wallet::CURRENCIES) }
    it { is_expected.to validate_inclusion_of(:target_currency).in_array(Wallet::CURRENCIES) }

    it { is_expected.to validate_numericality_of(:source_amount).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:target_amount).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:exchange_rate).is_greater_than_or_equal_to(0) }

    it "rejects negative source_amount" do
      transaction = build(:transaction, source_amount: BigDecimal("-1"))
      expect(transaction).not_to be_valid
      expect(transaction.errors[:source_amount]).to be_present
    end

    it "rejects negative target_amount" do
      transaction = build(:transaction, target_amount: BigDecimal("-1"))
      expect(transaction).not_to be_valid
      expect(transaction.errors[:target_amount]).to be_present
    end

    it "rejects negative exchange_rate" do
      transaction = build(:transaction, exchange_rate: BigDecimal("-0.5"))
      expect(transaction).not_to be_valid
      expect(transaction.errors[:exchange_rate]).to be_present
    end

    it "accepts zero amounts (for rejected transactions)" do
      transaction = build(:transaction, :rejected, target_amount: BigDecimal("0"), exchange_rate: BigDecimal("0"))
      expect(transaction).to be_valid
    end
  end

  describe "constants" do
    it "exposes STATUSES" do
      expect(Transaction::STATUSES).to eq(%w[pending completed rejected])
    end

    it "exposes KINDS" do
      expect(Transaction::KINDS).to eq(%w[exchange deposit recharge transfer])
    end
  end
end
