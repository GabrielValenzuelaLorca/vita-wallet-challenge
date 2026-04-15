class AddKindToTransactions < ActiveRecord::Migration[7.0]
  def change
    add_column :transactions, :kind, :string, null: false, default: "exchange"
  end
end
