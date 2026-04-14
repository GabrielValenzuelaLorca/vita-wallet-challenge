# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2026_04_14_205934) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "transactions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "source_currency", null: false
    t.string "target_currency", null: false
    t.decimal "source_amount", precision: 20, scale: 8, null: false
    t.decimal "target_amount", precision: 20, scale: 8, null: false
    t.decimal "exchange_rate", precision: 30, scale: 18, null: false
    t.string "status", default: "pending", null: false
    t.string "rejection_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "status"], name: "index_transactions_on_user_id_and_status"
    t.index ["user_id"], name: "index_transactions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "wallets", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "currency", null: false
    t.decimal "balance", precision: 20, scale: 8, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "currency"], name: "index_wallets_on_user_id_and_currency", unique: true
    t.index ["user_id"], name: "index_wallets_on_user_id"
  end

  add_foreign_key "transactions", "users"
  add_foreign_key "wallets", "users"
end
