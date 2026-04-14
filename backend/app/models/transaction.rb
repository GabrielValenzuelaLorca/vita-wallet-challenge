class Transaction < ApplicationRecord
  STATUSES = %w[pending completed rejected].freeze

  belongs_to :user

  validates :source_currency, :target_currency, :source_amount,
            :target_amount, :exchange_rate, :status, presence: true
  validates :status, inclusion: { in: STATUSES }
end
