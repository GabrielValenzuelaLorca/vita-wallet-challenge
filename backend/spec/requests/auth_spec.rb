require "rails_helper"

RSpec.describe "Auth endpoints", type: :request do
  describe "POST /auth/register" do
    let(:valid_params) { { email: "register@example.com", password: "password123" } }

    context "with valid params" do
      it "returns 201 with token and user data" do
        post "/auth/register", params: valid_params

        expect(response).to have_http_status(:created)

        body = JSON.parse(response.body)
        expect(body.dig("data", "token")).to be_present
        expect(body.dig("data", "user", "email")).to eq("register@example.com")
        expect(body.dig("data", "user")).not_to have_key("password_digest")
      end

      it "creates a user in the database" do
        expect { post "/auth/register", params: valid_params }
          .to change(User, :count).by(1)
      end
    end

    context "with duplicate email" do
      before { create(:user, email: "register@example.com") }

      it "returns 422 with error envelope" do
        post "/auth/register", params: valid_params

        expect(response).to have_http_status(:unprocessable_entity)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("validation_failed")
        expect(body.dig("error", "message")).to be_present
      end
    end

    context "with missing password" do
      it "returns 422 with invalid_params error envelope" do
        post "/auth/register", params: { email: "nopass@example.com" }

        expect(response).to have_http_status(:unprocessable_entity)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("invalid_params")
      end
    end
  end

  describe "POST /auth/login" do
    let!(:user) { create(:user, email: "login@example.com", password: "password123") }

    context "with valid credentials" do
      it "returns 200 with token and user data" do
        post "/auth/login", params: { email: "login@example.com", password: "password123" }

        expect(response).to have_http_status(:ok)

        body = JSON.parse(response.body)
        expect(body.dig("data", "token")).to be_present
        expect(body.dig("data", "user", "email")).to eq("login@example.com")
      end
    end

    context "with wrong password" do
      it "returns 401 with invalid_credentials code" do
        post "/auth/login", params: { email: "login@example.com", password: "wrongpassword" }

        expect(response).to have_http_status(:unauthorized)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("invalid_credentials")
      end
    end

    context "with non-existent email" do
      it "returns 401" do
        post "/auth/login", params: { email: "ghost@example.com", password: "password123" }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /auth/me" do
    context "with valid token" do
      let(:user) { create(:user) }
      let(:token) { JwtService.encode(user_id: user.id) }

      it "returns 200 with current user data" do
        get "/auth/me", headers: { "Authorization" => "Bearer #{token}" }

        expect(response).to have_http_status(:ok)

        body = JSON.parse(response.body)
        expect(body.dig("data", "user", "id")).to eq(user.id)
        expect(body.dig("data", "user", "email")).to eq(user.email)
      end
    end

    context "without authorization header" do
      it "returns 401" do
        get "/auth/me"

        expect(response).to have_http_status(:unauthorized)

        body = JSON.parse(response.body)
        expect(body.dig("error", "code")).to eq("unauthorized")
      end
    end

    context "with invalid token" do
      it "returns 401" do
        get "/auth/me", headers: { "Authorization" => "Bearer invalid.token.here" }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with expired token" do
      let(:user) { create(:user) }
      let(:token) { JwtService.encode(user_id: user.id) }

      it "returns 401" do
        token_value = token
        travel_to 25.hours.from_now do
          get "/auth/me", headers: { "Authorization" => "Bearer #{token_value}" }
          expect(response).to have_http_status(:unauthorized)
        end
      end
    end
  end
end
