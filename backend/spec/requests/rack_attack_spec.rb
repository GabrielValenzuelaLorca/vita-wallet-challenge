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
    it "allows up to 5 login attempts per minute" do
      5.times do
        post "/auth/login", params: { email: "test@example.com", password: "wrong" }
        expect(response.status).not_to eq(429)
      end
    end

    it "blocks the 6th login attempt within 60 seconds" do
      6.times do
        post "/auth/login", params: { email: "test@example.com", password: "wrong" }
      end

      expect(response.status).to eq(429)
      body = JSON.parse(response.body)
      expect(body["error"]["code"]).to eq("rate_limited")
      expect(body["error"]["message"]).to eq("Too many requests. Try again later.")
    end
  end

  describe "registration throttle" do
    it "blocks the 4th registration attempt within 60 seconds" do
      4.times do |index|
        post "/auth/register", params: { email: "user#{index}@example.com", password: "password123" }
      end

      expect(response.status).to eq(429)
    end
  end
end
