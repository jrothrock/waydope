class ArtworkUploader < CarrierWave::Uploader::Base
  include CarrierWave::MiniMagick
  process :validate_dimensions
  # process :convert => 'png'
  # process :quality
  process :resize_image
  storage :file
  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick
  # after :store, :begin_upload
  # Choose what kind of storage to use for this uploader:
  # include CarrierWaveDirect::Uploader
  # storage :fog
  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.created_at.strftime("%F").gsub('-','/')}/#{model.uuid}"
  end

  def filename
    if original_filename
      extension = File.extname(original_filename)
      "#{original_filename.chomp(extension)}_artwork_#{Time.now.strftime("%S%M%HT%d%m%Y")}#{extension}"
    end
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end
  # Process files as they are uploaded:
  # process scale: [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # # end

  # private

  # def begin_upload
  #   if !model.form
  #     key = Rails.application.secrets.aws_access_key_id
  #     secret =  Rails.application.secrets.aws_secret_access_key
  #     credentials = Aws::Credentials.new(key, secret)
  #     s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
  #     Video.uploadPhoto(model,s3,true)
  #   end
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process resize_to_fit: [50, 50]
  # end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_whitelist
  #   %w(jpg jpeg gif png)
  # end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

end
