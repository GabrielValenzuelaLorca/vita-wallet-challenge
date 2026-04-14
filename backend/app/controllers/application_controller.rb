class ApplicationController < ActionController::API
  private

  def authenticate_user!
    token = extract_bearer_token
    payload = JwtService.decode(token: token) if token

    if payload.nil?
      render_error(code: "unauthorized", message: "Invalid or expired token", status: :unauthorized)
      return
    end

    @current_user = User.find_by(id: payload["user_id"])
    return if @current_user

    render_error(code: "unauthorized", message: "Invalid or expired token", status: :unauthorized)
  end

  def current_user
    @current_user
  end

  def extract_bearer_token
    header = request.headers["Authorization"]
    return nil unless header&.start_with?("Bearer ")

    header.split(" ").last
  end

  def render_success(data:, meta: {}, status: :ok)
    render json: { data: data, meta: meta }, status: status
  end

  def render_error(code:, message:, status: :unprocessable_entity)
    render json: { error: { code: code, message: message } }, status: status
  end
end
