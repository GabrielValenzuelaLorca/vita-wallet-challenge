class Transaction < ApplicationRecord
  STATUSES = %w[pending completed rejected].freeze
  KINDS = %w[exchange deposit recharge transfer].freeze

  belongs_to :user

  validates :source_currency, :target_currency, :source_amount,
            :target_amount, :exchange_rate, :status, :kind, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :kind, inclusion: { in: KINDS }
end
