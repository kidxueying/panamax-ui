require 'active_resource'

class BaseResource < ActiveResource::Base

  DOCKER_INDEX_BASE_URL = 'https://registry.hub.docker.com/'

  self.site = PanamaxApi::URL

  def write_attributes(attributes)
    attributes.each do |key, val|
      setter = "#{key}="
      self.public_send(setter, val) if self.respond_to?(setter)
    end
  end

  def _deleted
    false
  end
end
