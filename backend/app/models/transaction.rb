class Transaction < ApplicationRecord
  STATUSES = %w[pending completed rejected].freeze
  KINDS = %w[exchange deposit recharge transfer].freeze

  belongs_to :user

  validates :source_currency, :target_currency, :source_amount,
            :target_amount, :exchange_rate, :status, :kind, presence: true
  validates :source_amount, :target_amount, :exchange_rate,
            numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: STATUSES }
  validates :kind, inclusion: { in: KINDS }
  validates :source_currency, :target_currency, inclusion: { in: Wallet::CURRENCIES }
end
