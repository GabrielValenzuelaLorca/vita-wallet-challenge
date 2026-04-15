require "rails_helper"

RSpec.describe "Rack::Attack throttling", type: :request do
  before do
    Rack::Attack.enabled = true
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.reset!
  end

  after do
    Rack::Attack.enabled = false
  end

  describe "login throttle" do
    it "lets the first 5 attempts reach the controller (not throttled) and blocks the 6th with 429" do
      statuses = 6.times.map do
        post "/auth/login", params: { email: "test@example.com", password: "wrong" }
        response.status
      end

      # First 5 reach the controller and return 401 (wrong password) — not 429.
      expect(statuses.first(5)).to all(eq(401))
      # The 6th hits the throttle limit and returns 429 with our envelope.
      expect(statuses.last).to eq(429)

      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("rate_limited")
      expect(body["error"]["message"]).to eq("Too many requests. Try again later.")
    end
  end

  describe "registration throttle" do
    it "lets the first 3 registrations through and blocks the 4th with 429" do
      statuses = 4.times.map do |index|
        post "/auth/register", params: { email: "user#{index}@example.com", password: "password123" }
        response.status
      end

      # First 3 succeed (201). Limit is 3/min so the 4th gets throttled.
      expect(statuses.first(3)).to all(eq(201))
      expect(statuses.last).to eq(429)
    end
  end
end
