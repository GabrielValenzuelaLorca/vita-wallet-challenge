class UserSerializer < BaseSerializer
  def as_json
    {
      id: object.id,
      email: object.email,
      created_at: object.created_at
    }
  end
end
