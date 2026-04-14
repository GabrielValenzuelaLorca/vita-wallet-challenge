class BaseSerializer
  attr_reader :object, :options

  def initialize(object, options = {})
    @object = object
    @options = options
  end

  def as_json
    raise NotImplementedError, "Subclasses must implement #as_json"
  end

  def self.serialize(object, options = {})
    { data: new(object, options).as_json }
  end

  def self.serialize_collection(collection, meta: {}, **options)
    {
      data: collection.map { |item| new(item, options).as_json },
      meta: meta
    }
  end
end
