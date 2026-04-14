class TransactionSerializer < BaseSerializer
  def as_json
    {
      id: object.id,
      source_currency: object.source_currency,
      target_currency: object.target_currency,
      source_amount: object.source_amount.to_s("F"),
      target_amount: object.target_amount.to_s("F"),
      exchange_rate: object.exchange_rate.to_s("F"),
      status: object.status,
      rejection_reason: object.rejection_reason,
      created_at: object.created_at.iso8601
    }
  end
end
