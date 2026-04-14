class WalletSerializer < BaseSerializer
  def as_json
    {
      id: object.id,
      currency: object.currency,
      balance: object.balance.to_s("F")
    }
  end
end
