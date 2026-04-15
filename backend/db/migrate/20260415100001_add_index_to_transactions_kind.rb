class AddIndexToTransactionsKind < ActiveRecord::Migration[7.0]
  def change
    add_index :transactions, [:user_id, :kind]
  end
end
