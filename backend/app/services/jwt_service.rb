class JwtService
  ALGORITHM = "HS256"
  TOKEN_EXPIRATION = 24.hours

  class << self
    def encode(user_id:)
      payload = {
        user_id: user_id,
        iat: Time.now.to_i,
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

    def token_valid_for_user?(payload, user)
      return true if user.tokens_valid_after.nil?

      # Strict greater-than: a token issued in the same second as the
      # invalidation must be considered expired. Otherwise calling
      # invalidate_tokens! and the JWT it was meant to revoke could share
      # a wall-clock second and the revocation would be a no-op.
      issued_at = payload["iat"].to_i
      issued_at > user.tokens_valid_after.to_i
    end

    def invalidate_tokens!(user)
      user.update!(tokens_valid_after: Time.current)
    end

    private

    def secret_key
      Rails.application.secret_key_base
    end
  end
end
