class AuthService
  class << self
    def register(email:, password:)
      user = User.create!(email: email, password: password)
      token = JwtService.encode(user_id: user.id)
      { user: user, token: token }
    end

    def authenticate(email:, password:)
      user = User.find_by(email: email)
      return nil unless user&.authenticate(password)

      token = JwtService.encode(user_id: user.id)
      { user: user, token: token }
    end
  end
end
