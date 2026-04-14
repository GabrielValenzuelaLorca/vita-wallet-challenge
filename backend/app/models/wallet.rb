class Wallet < ApplicationRecord
  CURRENCIES = %w[USD CLP BTC USDC USDT].freeze

  belongs_to :user

  validates :currency, presence: true, inclusion: { in: CURRENCIES }
  validates :currency, uniqueness: { scope: :user_id }
  validates :balance, numericality: { greater_than_or_equal_to: 0 }
end
