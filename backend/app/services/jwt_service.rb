class JwtService
  ALGORITHM = "HS256"
  TOKEN_EXPIRATION = 24.hours

  class << self
    def encode(user_id:)
      payload = {
        user_id: user_id,
        exp: TOKEN_EXPIRATION.from_now.to_i
      }
      JWT.encode(payload, secret_key, ALGORITHM)
    end

    def decode(token:)
      decoded = JWT.decode(token, secret_key, true, algorithm: ALGORITHM)
      decoded.first
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end

    private

    def secret_key
      Rails.application.secret_key_base
    end
  end
end
