class ExchangeController < ApplicationController
  before_action :authenticate_user!

  def create
    permitted = exchange_params

    unless permitted[:source_currency].present? && permitted[:target_currency].present? && permitted[:amount].present?
      return render_error(code: "invalid_params", message: "source_currency, target_currency, and amount are required")
    end

    result = ExchangeService.execute(
      user: current_user,
      source_currency: permitted[:source_currency],
      target_currency: permitted[:target_currency],
      source_amount: permitted[:amount]
    )

    if result[:success]
      render_success(data: TransactionSerializer.new(result[:transaction]).as_json, status: :created)
    else
      render_error(code: result[:error_code], message: result[:error_message])
    end
  end

  private

  def exchange_params
    if params.key?(:exchange)
      params.require(:exchange).permit(:source_currency, :target_currency, :amount)
    else
      params.permit(:source_currency, :target_currency, :amount)
    end
  end
end
