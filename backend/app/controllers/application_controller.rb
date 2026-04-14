class ApplicationController < ActionController::API
  private

  def render_success(data:, meta: {}, status: :ok)
    render json: { data: data, meta: meta }, status: status
  end

  def render_error(code:, message:, status: :unprocessable_entity)
    render json: { error: { code: code, message: message } }, status: status
  end
end
