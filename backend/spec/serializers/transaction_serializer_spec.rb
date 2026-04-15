require "rails_helper"

RSpec.describe TransactionSerializer do
  let(:user) { create(:user) }

  describe "#as_json" do
    context "with a completed transaction" do
      let(:transaction) { create(:transaction, user: user) }
      subject(:serialized) { described_class.new(transaction).as_json }

      it "includes all expected keys" do
        expected_keys = [:id, :kind, :source_currency, :target_currency,
                         :source_amount, :target_amount, :exchange_rate,
                         :status, :rejection_reason, :created_at]
        expect(serialized.keys).to match_array(expected_keys)
      end

      it "serializes source_amount as string" do
        expect(serialized[:source_amount]).to be_a(String)
        expect(serialized[:source_amount]).to eq(transaction.source_amount.to_s("F"))
      end

      it "serializes target_amount as string" do
        expect(serialized[:target_amount]).to be_a(String)
        expect(serialized[:target_amount]).to eq(transaction.target_amount.to_s("F"))
      end

      it "serializes exchange_rate as string" do
        expect(serialized[:exchange_rate]).to be_a(String)
        expect(serialized[:exchange_rate]).to eq(transaction.exchange_rate.to_s("F"))
      end

      it "serializes created_at in ISO8601 format" do
        expect(serialized[:created_at]).to eq(transaction.created_at.iso8601)
        expect { Time.iso8601(serialized[:created_at]) }.not_to raise_error
      end

      it "returns nil rejection_reason for non-rejected transaction" do
        expect(serialized[:rejection_reason]).to be_nil
      end
    end

    context "with a rejected transaction" do
      let(:transaction) { create(:transaction, :rejected, user: user) }
      subject(:serialized) { described_class.new(transaction).as_json }

      it "includes the rejection_reason" do
        expect(serialized[:rejection_reason]).to eq("insufficient_balance")
      end

      it "serializes zero amounts as string" do
        expect(serialized[:target_amount]).to eq("0.0")
      end
    end
  end
end
