require "#{Rails.root}/app/uploaders/artwork_uploader"
require 'carrierwave'
require 'taglib'
require 'open-uri'
class SonguploadWorker
	include Sidekiq::Worker
	# @queue = :soundcloud
	def perform
		songs = Song.where('uploaded = true AND worked = false AND form = 1').all

		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)

		songs.each do |song|

			name_parts = song.link.split('/').last.split('.') # split the url to get the song name then split it by name and extension - ie ["song", "mp3"]
			if name_parts.length > 2
				name_parts = [name_parts[0...name_parts.length-1].join('.'),name_parts[name_parts.length-1]]
			end
			puts name_parts
			obj = s3.bucket(Rails.application.secrets.aws_bucket).object(song.link)
			unless File.directory?("#{Rails.root}/public/#{song.song.store_dir}")
				FileUtils.mkdir_p("#{Rails.root}/public/#{song.song.store_dir}")
			end
			Dir.chdir("#{Rails.root}/public/#{song.song.store_dir}")
			obj.get(response_target: "#{Rails.root}/public/#{song.song.store_dir}/#{name_parts[0]}_reduced.#{name_parts[1]}")
			path = "#{Rails.root}/public/#{song.song.store_dir}/#{name_parts[0]}_reduced.#{name_parts[1]}"
			fd = File.dirname(path)
			# these shouldn't be neccessary, as amazon does the first round of blocks.
				# this also doesn't work well as the mime type is application/octect-stream
			# type = Song.getFileType(path)
			# puts type
			# if type != false
				Song.read_tags(song,path,name_parts[0])
				name = File.basename(path,name_parts.last) 
				temp_output = fd + '/' + name + '_original.' + name_parts.last
				temp = FileUtils.cp path, temp_output
				mp3 = path.gsub(/#{name_parts.last}$/, "mp3")
				mp3_convert = %x[ffmpeg -i #{temp_output} -codec:a libmp3lame -vn -ar 44100 -ac 2 -ab 128k #{mp3} -y]
				puts mp3_convert
				Song.read_tags(song,path,name_parts[0])
			# end
			# if type != 'ogg' && type != false
			# 	ogg = path.gsub(/#{type}$/, "ogg")
			# 	convert = %x[ffmpeg -i #{path} -c:a libvorbis -q:a 4 #{ogg} -n]
			# 	puts convert
			# end
			# if type === false
				# puts 'failed'
			# end

			Song.uploadSong(song,name_parts[0],s3)
			# Song.removeDir(song)
			Song.purge_cache
			NotificationuploadWorker.perform_async(song.as_json)
		end
	end
end
