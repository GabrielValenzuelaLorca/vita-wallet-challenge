Rack::Attack.throttle("logins/ip", limit: 5, period: 60.seconds) do |request|
  request.ip if request.path == "/auth/login" && request.post?
end

Rack::Attack.throttle("registrations/ip", limit: 3, period: 60.seconds) do |request|
  request.ip if request.path == "/auth/register" && request.post?
end

Rack::Attack.throttle("req/ip", limit: 300, period: 5.minutes) do |request|
  request.ip
end

Rack::Attack.throttled_responder = lambda do |_request|
  [
    429,
    { "Content-Type" => "application/json" },
    [{ error: { code: "rate_limited", message: "Too many requests. Try again later." } }.to_json]
  ]
end
