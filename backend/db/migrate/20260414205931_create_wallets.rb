class CreateWallets < ActiveRecord::Migration[7.0]
  def change
    create_table :wallets do |t|
      t.references :user, null: false, foreign_key: true
      t.string :currency, null: false
      t.decimal :balance, precision: 20, scale: 8, null: false, default: 0

      t.timestamps
    end

    add_index :wallets, [:user_id, :currency], unique: true
  end
end
