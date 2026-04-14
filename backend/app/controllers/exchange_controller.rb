class ExchangeController < ApplicationController
  before_action :authenticate_user!

  def create
    result = ExchangeService.execute(
      user: current_user,
      source_currency: exchange_params[:source_currency],
      target_currency: exchange_params[:target_currency],
      source_amount: exchange_params[:amount]
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
