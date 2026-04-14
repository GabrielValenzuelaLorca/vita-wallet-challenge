class CreateTransactions < ActiveRecord::Migration[7.0]
  def change
    create_table :transactions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :source_currency, null: false
      t.string :target_currency, null: false
      t.decimal :source_amount, precision: 20, scale: 8, null: false
      t.decimal :target_amount, precision: 20, scale: 8, null: false
      t.decimal :exchange_rate, precision: 30, scale: 18, null: false
      t.string :status, null: false, default: "pending"
      t.string :rejection_reason

      t.timestamps
    end

    add_index :transactions, [:user_id, :status]
  end
end
