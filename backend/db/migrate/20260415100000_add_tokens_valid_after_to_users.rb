class AddTokensValidAfterToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :tokens_valid_after, :datetime, null: true
  end
end
