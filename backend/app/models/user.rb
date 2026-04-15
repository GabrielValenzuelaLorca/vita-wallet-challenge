class User < ApplicationRecord
  has_secure_password

  has_many :wallets, dependent: :destroy
  has_many :transactions, dependent: :restrict_with_error

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: :password_digest_changed?
end
