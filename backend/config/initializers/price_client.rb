Rails.application.config.after_initialize do
  Rails.application.config.price_client = if Rails.env.production?
                                             PriceClient.new
                                           else
                                             StubPriceClient.new
                                           end
end
