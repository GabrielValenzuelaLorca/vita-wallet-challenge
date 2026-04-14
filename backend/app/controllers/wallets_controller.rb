class WalletsController < ApplicationController
  before_action :authenticate_user!

  def index
    wallets = current_user.wallets
    render_success(data: WalletSerializer.serialize_collection(wallets)[:data])
  end
end
