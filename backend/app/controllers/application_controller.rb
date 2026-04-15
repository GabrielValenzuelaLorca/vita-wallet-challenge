class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
  rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
  rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid

  private

  def authenticate_user!
    token = extract_bearer_token
    payload = JwtService.decode(token: token) if token

    if payload.nil?
      render_error(code: "unauthorized", message: "Invalid or expired token", status: :unauthorized)
      return
    end

    @current_user = User.find_by(id: payload["user_id"])

    unless @current_user && JwtService.token_valid_for_user?(payload, @current_user)
      @current_user = nil
      render_error(code: "unauthorized", message: "Invalid or expired token", status: :unauthorized)
      return
    end
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

  def handle_record_not_found(error)
    render_error(code: "not_found", message: error.message, status: :not_found)
  end

  def handle_parameter_missing(error)
    render_error(code: "invalid_params", message: error.message, status: :unprocessable_entity)
  end

  def handle_record_invalid(error)
    render_error(code: "validation_failed", message: error.record.errors.full_messages.join(", "), status: :unprocessable_entity)
  end
end
