class PricesController < ApplicationController
  before_action :authenticate_user!

  def index
    prices = PriceService.fetch_prices
    render_success(data: prices)
  rescue PriceClient::ApiError => error
    render_error(
      code: "price_service_unavailable",
      message: error.message,
      status: :service_unavailable
    )
  end
end
