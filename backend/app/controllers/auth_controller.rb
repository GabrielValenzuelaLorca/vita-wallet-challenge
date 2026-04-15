class AuthController < ApplicationController
  before_action :authenticate_user!, only: [:me, :logout]

  def register
    result = AuthService.register(email: auth_params[:email], password: auth_params[:password])
    serialized_user = UserSerializer.new(result[:user]).as_json
    render_success(data: { token: result[:token], user: serialized_user }, status: :created)
  end

  def login
    result = AuthService.authenticate(email: auth_params[:email], password: auth_params[:password])

    if result.nil?
      render_error(code: "invalid_credentials", message: "Invalid email or password", status: :unauthorized)
    else
      serialized_user = UserSerializer.new(result[:user]).as_json
      render_success(data: { token: result[:token], user: serialized_user })
    end
  end

  def me
    render_success(data: { user: UserSerializer.new(current_user).as_json })
  end

  # Invalidates every JWT issued for the current user up to this point in
  # time by bumping `tokens_valid_after`. The client should also discard the
  # token locally; this just makes it impossible for stolen copies to keep
  # working until the natural 24h expiration.
  def logout
    JwtService.invalidate_tokens!(current_user)
    head :no_content
  end

  private

  def auth_params
    params.require(:email)
    params.require(:password)
    params.permit(:email, :password)
  end
end
