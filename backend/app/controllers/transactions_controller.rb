class TransactionsController < ApplicationController
  before_action :authenticate_user!

  MAX_PER_PAGE = 100
  DEFAULT_PER_PAGE = 20

  def index
    if params[:status].present? && !Transaction::STATUSES.include?(params[:status])
      return render_error(
        code: "invalid_status",
        message: "status must be one of: #{Transaction::STATUSES.join(", ")}"
      )
    end

    page = [params[:page].to_i, 1].max
    per_page = params[:per_page].to_i
    per_page = DEFAULT_PER_PAGE if per_page <= 0
    per_page = [per_page, MAX_PER_PAGE].min

    scope = current_user.transactions.order(created_at: :desc)
    scope = scope.where(status: params[:status]) if params[:status].present?

    total = scope.count
    transactions = scope.limit(per_page).offset((page - 1) * per_page)

    result = TransactionSerializer.serialize_collection(
      transactions,
      meta: { page: page, per_page: per_page, total: total }
    )

    render_success(data: result[:data], meta: result[:meta])
  end
end
