require 'sidekiq'
require 'redis'
require 'sidekiq/api'
module CarrierWave
  module MiniMagick
    # check for images that are larger than you probably want, protect against photo-bombing (DOS from JPEG specifications.)
    def validate_dimensions
      manipulate! do |img|
        if img.dimensions.any?{|i| i > 8000 }
          raise CarrierWave::ProcessingError, "dimensions too large"
        end
        img
      end
    end

    def quality(percentage)
      manipulate! do |img|
        img.quality(percentage.to_s)
        img = yield(img) if block_given?
        img.push        '+profile'
        img.+           "!xmp,*"
        img.profile     "path/to/color_profiles/sRGB_v4_ICC_preference_displayclass.icc"
        img
      end
    end

    def resize_image
      manipulate! do |img|
        if img.width > img.height && img.width > 1000
          height = (1000 * (img.height/img.width))
          width = 1000
        elsif img.height > img.width && img.height > 1000
          width = (1000 * (img.width/img.height))
          height = 1000
        elsif img.height === img.width && img.height > 1000
          width = 1000
          height = 1000
        else
          width = img.width
          height = img.height 
        end
        if height === 0 && width != 0
          height = width
        else
          height = 1000
        end
        if width === 0 && height != 0
          width = height
        else
          height = 1000
        end
        puts 'height and width'
        puts height
        puts width
        img.combine_options do |c|
          c.quality(40)
          c.resize      "#{width}x#{height}"
        end


        # if img.width > img.height && img.width > 600
        #     img.height === 600 * (img.height/img.width)
        #     img.width === 600
        # elsif img.height > img.width && img.height > 600
        #     img.width === 600 * (img.width/img.height)
        #     img.height === 600
        # end
        img
      end
    end

  end
end

# CarrierWave.configure do |config|
#   config.fog_credentials = {
#     :provider               => 'AWS',       # required
#     :aws_access_key_id      => Rails.application.secrets.aws_access_key_id,       # required
#     :aws_secret_access_key  => Rails.application.secrets.aws_secret_access_key,       # required
#     :region                 => 'us-west-2'  # optional, defaults to 'us-east-1'
#   }
#   config.fog_directory  = Rails.application.secrets.aws_bucket # required
#   # see https://github.com/jnicklas/carrierwave#using-amazon-s3
#   # for more optional configuration
# end