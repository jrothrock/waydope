require 'fuzzystringmatch'
class Api::V1::Music::MusicController < ApplicationController
	#### ADD TOP THREE POSTS TO A COLUMN IN EACH CATEGORIES PULL, THEN HAVE A WORKER GO AND CHANGE THEM - DO A COLUMN FOR  ###
	include ActionView::Helpers::DateHelper
	def index
		offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
		sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
		order = sanitizedOrder ? sanitizedOrder : "mg.count DESC, mg.created_at DESC"

		music_offset = request.headers["moffset"].to_i % 20 === 0 && request.headers["moffset"].to_i > 0 ? request.headers["moffset"].to_i : 0
		sanitizedTime = Song.sanitizeTime(request.headers["mtime"].to_s)
		music_time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["morder"].to_s,request.headers["mtype"].to_s)
		music_order = sanitizedOrder ? sanitizedOrder : "s.hotness DESC, s.average_vote DESC, s.created_at DESC"
			#
			#for some weird reason you can't do the '?' in the order and have to do #{} instead. throws some no constant error. No idea.
			#
		genres = $redis.get("music_all_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_categories")
		if genres.nil?
			sanitized_query = MusicGenre.escape_sql(["SELECT count(*) OVER () AS total_count, mg.* FROM music_genres mg WHERE created_at >= ? GROUP BY mg.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
			genres = MusicGenre.find_by_sql(sanitized_query).to_json
			$redis.set("music_all_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_categories",genres)
			$redis.rpush("music_all_keys", "music_all_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_categories")
		end
		genres = JSON.parse(genres)

		all_songs = $redis.get("music_all_#{music_offset}_#{music_time.strftime("%Y%m%d")}_#{music_order.parameterize}_all")
		if all_songs.nil?
			sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{music_order} OFFSET ? LIMIT 20", music_time.to_s,music_offset]) 
			all_songs = Song.find_by_sql(sanitized_query).to_json
			$redis.set("music_all_#{music_offset}_#{music_time.strftime("%Y%m%d")}_#{music_order.parameterize}_all",all_songs)
			$redis.rpush("music_all_keys", "music_all_#{music_offset}_#{music_time.strftime("%Y%m%d")}_#{music_order.parameterize}_all")
		end
		all_songs = JSON.parse(all_songs)

		Song.userCheck([all_songs], request.headers["Authorization"])

		page = offset > 0 ? offset / 20 : 1
		count = genres && genres.first ? genres.first["total_count"] : 0
		pages = (count / 20.0).ceil

		music_page = music_offset > 0 ? music_offset / 20 : 1
		music_count = all_songs && all_songs.first ? all_songs.first["total_count"] : 1
		music_pages = (music_count / 20.0).ceil

		if genres != []
			postIds = []
			firsttd = genres[0]  && genres[0]['top_day'].length != 0 ? genres[0]['top_day'] : []
			secondtd = genres[1] && genres[1]['top_day'].length != 0 ? genres[1]['top_day'] : []
			thirdtd = genres[2] && genres[2]['top_day'].length != 0 ? genres[2]['top_day'] : []
			fourthtd = genres[3] && genres[3]['top_day'].length != 0 ? genres[3]['top_day'] : []
			postIds.concat(firsttd).concat(secondtd).concat(thirdtd).concat(fourthtd)
			postIds.to_json
			fl = firsttd.length != 0 ? firsttd.length : 0
			sl = secondtd.length != 0 ? secondtd.length + fl : 0 + fl
			tl = thirdtd.length != 0 ? thirdtd.length + sl : 0 + sl
			fol = fourthtd.length != 0 ? fourthtd.length + tl : 0 + tl
			if postIds != []
				posts = $redis.get("music_all_#{time.strftime("%Y%m%d")}_#{order.parameterize}_all_posts")
				if posts.nil?
					records = Song.where(uuid: (postIds.split(',').to_a)).select_with(App.getGoodColumns('music')).group_by(&:uuid)
					posts = postIds.map{|id| records[id].first}.to_json
					$redis.set("music_all_#{time.strftime("%Y%m%d")}_#{order.parameterize}_all_posts",posts)
					$redis.rpush("music_all_keys", "music_all_#{time.strftime("%Y%m%d")}_#{order.parameterize}_all_posts")
				end
				posts = JSON.parse(posts)
				Song.userCheck([posts.to_a], request.headers["Authorization"])
				sortedposts = []
				# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
				sortedposts << posts[0...fl].to_a
				sortedposts << posts[fl...sl].to_a
				sortedposts << posts[sl...tl].to_a
				sortedposts << posts[tl...fol].to_a

				ids = all_songs.map{|song|song["id"]}
				# render json:{genres:genres, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}, status: :ok
				render json:{genres:genres, songs:sortedposts, page:page, offset: 0, count:count, pages:pages, all:all_songs, music_count:music_count, music_pages:music_pages, music_page: music_page,ids:ids}, status: :ok
			else 
				render json:{genres:genres, songs:[],page:page, offset: 0, count:count, pages:pages,  all:all_songs, music_count:music_count, music_pages:music_pages, music_page: music_page}, status: :ok
			end
		else
			render json: {}, status: :not_found
		end
	end

	def read
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user && user.admin
			song = Song.where('url = ? AND main_genre = ?', params["song"], params["genre"]).first
		else
			song = Song.where('url = ? AND main_genre = ?', params["song"], params["genre"]).select_with(App.getGoodColumns('music',false,nil,true)).first
		end
		if song
			if !song.removed
				if user
					song.user_liked = song.likes.key?(user.uuid) ? true : false
					song_votes_hash = song.votes
					song_ratings_hash = song.ratings
					song.user_voted = song_votes_hash.key?(user.uuid) ? song_votes_hash[user.uuid] : nil
					song.user_reported = song.report_users.include?(user.uuid) ? true : false
					song.user_rated = song_ratings_hash.key?(user.uuid) ? true : false
					song.likes = nil
					song.votes = nil
					song.report_users = nil
					song.ratings = nil
				end
				song.time_ago = time_ago_in_words(song.created_at) + ' ago'
				render json: {song:song}, status: :ok
				user_id = user ? user.id : nil
				ViewcountWorker.perform_async(song.uuid,user_id,'music',request.remote_ip)
			else
				render json:{}, status: :gone
			end
		else
			render json: {}, status: :not_found
		end
	end

	def create
		if (params[:post_type].to_i == 1 && (params[:file] && params[:file].content_type && !Song.sanitizeUpload(params[:file].content_type)))
			render json:{status:415, success:false, message:'unsupported media type'}
			return false
		end
		puts params[:authorization]
		if request.headers["Authorization"]
			auth = request.headers["Authorization"]
		elsif params[:authorization]
			auth = params[:authorization]
		else
			render json: {}, status: :unauthorized
			return false
		end
		user = User.find_by_token(auth.split(' ').last)
		if user
			time = Time.now.strftime('%H%M%ST%m%d%Y')
			song = Song.new 
			song.artist = params[:artist] ? params[:artist] : "temp-#{time}"
			song.main_genre = params[:main_genre] ? params[:main_genre].parameterize : "temp-hold-genre"
			song.main_genre_display = params[:main_genre] ? params[:main_genre].titleize : "temp hold genre"
			song.genres = params[:genres] ? params[:genres].map(&:parameterize) : ["temp-#{time}"]
			song.og_url_name = params[:title] ? params[:title].parameterize.gsub('_','-') : "temp-#{time}"
			if params[:title]
				song.url = Song.findUrl(song,params[:title])
			else
				song.url = song.og_url_name
			end
			song.title = params[:title] ? params[:title] : "temp-#{time}"
			song.description = params[:description] ? params[:description] : '' ## kept the same so it shows the marked text when the song is edited
			song.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : '' ## remove all html tags
			song.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : ''	## remove scripts and on* javascript
			song.download = params[:download] ? params[:download] : 0
			song.download_url = params[:download_url] ? ActionView::Base.full_sanitizer.sanitize(params[:download_url]) : "temp-#{time}"
			song.download_text = params[:download_url] ? ActionView::Base.full_sanitizer.sanitize(params[:download_text]) : "temp-#{time}"
			song.user_id = user.id
			song.likes_count = 1
			song.likes = {user.uuid => true}
			song.likes = {user.uuid => true}
			song.average_vote = 1
			song.upvotes = 1
			song.votes_count = 1
			song.flagged = false
			song.uuid = Song.setUUID
			song.removed = false
			song.votes = {user.uuid => 1}
			song.human_votes = {user.uuid => 1}
			song.submitted_by = user.username
			if params[:post_type].to_i == 0
				# puts 'here3'
				song.original_link = params[:link]
				song.link = params[:link]
				song.form = 0
				# song.other_link = [embed[0].gsub("\"", '\'').to_s]
				song.link_type = Song.sanitizeLink(params[:link])
				song.uploaded = true
				# song.other_art = [embed[1]]
				# song.post_link = [embed[2]]
			elsif params[:post_type].to_i == 1
				# puts 'here2'
				# file = params[:file] ? params[:file] : params[:song]
				# song.song = file
				song.file_name = params[:file_name] ? params[:file_name] : 'download.mp3'
				song.form = 1
				# song.link_link = 'na'
				song.link = 'na'
			else 
				puts 'here1'
				render json: {message:'need post_type parameter'}, status: :bad_request
				return false
			end
			if  params[:post_type].to_i == 0 && song.link_type === 0
				render json: {error:true, message:'unsupported media type'}, status: :unsupported_media_type
				return false
			end
			if song.save
				if song.form === 0
					render json: {id:song.uuid,url:song.url}, status: :created
				else 
					@store = song.song.store_dir
					string_to_sign
					render :json => {
						:policy => @policy,
						:signature => sig,
						:key => Rails.application.secrets.aws_access_key_id,
						:success=>true,
						:store=> @store,
						:time => @time_policy,
						:time_date => @date_stamp,
						:song_id => song.uuid,
						:genre => song.main_genre,
						:url => song.url
					}
				end
				user_hash = user.songs
				user_hash[song.uuid] = true
				user.songs = user_hash
				user.average_vote = ((user.average_vote * user.votes_count) + 1)/(user.votes_count + 1)
				if user.music_votes
					votes_hash = user.music_votes
					votes_hash[song.uuid.to_s] = 1
					user.music_votes = votes_hash
				else
					user.music_votes = {song.uuid => 1}
				end
				user.votes_count += 1
				user.save!
				if song.form === 0
					SongembedWorker.perform_async
					SongcategorizeWorker.perform_async
				elsif song.form === 1
					# Songuploadp1Worker.perform_async
				end
			else
				render json: {}, status: :internal_server_error
				Rails.logger.info(song.errors.inspect) 
			end
		else
			render json: {}, status: :unauthorized
		end

	end

	### This right here, update method, is why, I think, people suggest to other to use the fat models, slim controllers.
	# Then just break everything else currently in the Model into POROs.

	def update
	### this uses both request headers and params due to jQuerys file upload. Maybe able to set headers in it though, just haven't really looked.
		if request.headers["Authorization"]
			auth = request.headers["Authorization"]
		elsif params[:authorization]
			auth = params[:authorization]
		else
			render json: {}, status: :unauthorized
			return false
		end
		user = User.find_by_token(auth.split(' ').last)
		if user 
			song = params[:song] ? Song.where("uuid = ?", params[:song]).first : nil
			if song 
				if params[:photo_upload]
					if(song.artwork && song.artwork.url) then song.artwork = params[:file] ? params[:file] : song.artwork end
					if(!song.artwork || !song.artwork.url) then song.artwork = params[:file] ? params[:file] : nil end 
					if song.save
						render json:{artwork:song.artwork.url}, status: :ok
						SongphotoWorker.perform_async(song.uuid)
						return true
					else
						render json:{}, status: :internal_server_error
						Rails.logger.info(song.errors.inspect) 
						return false
					end
				end
				
				if params[:edit]
					if params[:title] != song.title
						if (Time.now - song.created_at) > (5*60)
							render json:{title:false, time:true, change:true, message:"title can't be changed after the first five minutes"}, status: :bad_reqest
							return false
						elsif song.title_change && song.title_change > 0
							render json:{title:false, time:false, change:true, message:"title can only be edited once"}, status: :bad_reqest
							return false
						elsif FuzzyStringMatch::JaroWinkler.create( :native ).getDistance(song.title, params[:title]) < 0.92
							render json:{title:true, time:false, change:false, message:"title has been altered too much"}, status: :bad_reqest
							return false
						else
							song.title = params[:title]
							song.title_change = 1
						end
					end
					if params[:link] && params[:link] != song.original_link
						render json:{new_link:true, message:"can't change the link after it has been uploaded"}, status: :bad_request
						return false
					end
					song.artist = params[:artist] ? params[:artist] : song.artist
					song.old_genre = params[:main_genre] != song.main_genre ? song.main_genre : nil
					song.main_genre = params[:main_genre] ? params[:main_genre].parameterize : song.main_genre
					song.main_genre_display = params[:main_genre] ? params[:main_genre].titleize : song.main_genre_display
					song.genres = params[:genres] ? params[:genres].map(&:parameterize) : song.genres
					if params[:title] && params[:title].parameterize != song.og_url_name
						song.og_url_name = params[:title] ? params[:title].parameterize.gsub('_','-') : song.og_url_name
						song.url = Song.findUrl(song,params[:title])
					end
					song.title = params[:title] ? params[:title] : song.title
					puts params[:description]
					song.description = params[:description] ? params[:description] : song.description ## kept the same so it shows the marked text when the song is edited
					song.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : song.stripped ## remove all html tags
					song.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : song.marked	## remove scripts and on* javascript
					song.download = params[:download] ? params[:download] : song.download
					song.download_url = params[:download_url] ? ActionView::Base.full_sanitizer.sanitize(params[:download_url]) : song.download_url
					song.download_text = params[:download_url] ? ActionView::Base.full_sanitizer.sanitize(params[:download_text]) : song.download_url
					song.categorized = false
					## tough one with the description. If people delete description then it may send in null -
					if song.save
						render json:{url: song.url}, status: :ok
						SongcategorizeWorker.perform_async
						if song.worked then PurgecacheWorker.perform_async(song.post_type,song.uuid) end
						return true
					else
						render json:{}, status: :internal_server_error
						Rails.logger.info(song.errors.inspect)
						return false 
					end
				end
				## If neither a photo upload, or edit of a song. Done when the person clicks 'submit' on a new song that's been uploaded.
				song.og_url_name = params[:title] ? params[:title].parameterize : song.og_url_name
				song.artist = params[:artist] ? params[:artist] : song.artist
				song.main_genre = params[:main_genre] ? params[:main_genre].parameterize : song.main_genre
				song.main_genre_display = params[:main_genre] ? params[:main_genre].titleize : song.main_genre_display
				song.genres = params[:genres] ? params[:genres].map(&:parameterize) : song.genres
				song.url = Song.findUrl(song,params[:title])
				song.title = params[:title] ? params[:title] : song.title
				song.download = params[:download] ? params[:download] : song.download
				song.download_url = params[:download_url] ? ActionView::Base.full_sanitizer.sanitize(params[:download_url]) : song.download_url
				song.download_text = params[:download_url] ? ActionView::Base.full_sanitizer.sanitize(params[:download_text]) : song.download_url
				song.description = params[:description] ? params[:description] : song.description ## kept the same so it shows the marked text when the song is edited
				song.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : song.stripped ## remove all html tags
				song.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : song.marked	## remove scripts and on* javascript
				song.uploaded = true
				puts 'outside edit'
				if song.form then song.link = params[:key] end
				song.categorized = false #just in case.
				if song.save
					render json:{url:song.url}, status: :ok
					if song.form
						 SonguploadWorker.perform_async
					end
					SongcategorizeWorker.perform_async
				else
					render json:{}, status: :internal_server_error
					Rails.logger.info(song.errors.inspect) 
				end
			else
				render json:{id:params[:song]}, status: :not_found
			end
		else
			render json:{}, status: :unauthorized
		end
	end

	def delete
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user 
			song = params[:song] ? Song.where("uuid = ?", params[:song]).first : nil

				if !song
					render json: {}, status: :not_found
					return false
				end

				if song.user_id != user.id
					render json: {}, status: :unauthorized
					return false
				end

				if song && song.comment_count < 1
					song.in_deletion = true
					song.deleted = true
					if song.save
						render json: {}, status: :ok
						SongdeleteWorker.perform_async
					else
						render json: {}, status: :internal_server_error
						Rails.logger.info(song.errors.inspect)
					end
				end

				if song && song.comment_count >= 1
					# song.deleted = true
					# song.hidden = song.comments.where('hidden = false').exists? ? false : true
					song.in_deletion = true
					song.hidden = true
					song.deleted_submitted_by = song.submitted_by
					song.deleted_description = song.description
					song.deleted_user_id = song.user_id
					song.submitted_by = '[Deleted]'
					song.user_id = 0		
					if song.save
						render json:{hidden:song.hidden}, status: :ok
						SongdeleteWorker.perform_async
					else
						render json:{}, status: :internal_server_error
						Rails.logger.info(song.errors.inspect)
					end
				end
		else
			render json: {status: 401, success:false}
		end
	end

	private

	def string_to_sign
		
		@time = Time.now.utc
		@time_policy = @time.strftime('%Y%m%dT000000Z')
		@date_stamp = @time.strftime('%Y%m%d')

		 ret = {"expiration" => 10.hours.from_now.utc.iso8601,
				"conditions" =>  [
					{"bucket" => Rails.application.secrets.aws_bucket},
					{"x-amz-credential": "#{Rails.application.secrets.aws_access_key_id}/#{@date_stamp}/us-west-2/s3/aws4_request"},
					{"x-amz-algorithm": "AWS4-HMAC-SHA256"},
					{"x-amz-date": @time_policy },
					["starts-with", "$key", "uploads"], 
					["content-length-range", 0, 2147483648]
				]
			}

		@policy = Base64.encode64(ret.to_json).gsub(/\n|\r/, '')

	end

	def getSignatureKey
		kDate = OpenSSL::HMAC.digest('sha256', ("AWS4" +  Rails.application.secrets.aws_secret_access_key), @date_stamp)
		kRegion = OpenSSL::HMAC.digest('sha256', kDate, 'us-west-2')
		kService = OpenSSL::HMAC.digest('sha256', kRegion, 's3')
		kSigning = OpenSSL::HMAC.digest('sha256', kService, "aws4_request")
	end

	def sig
		# sig = Base64.encode64(OpenSSL::HMAC.digest('sha256', getSignatureKey,  @policy)).gsub(/\n|\r/, '')
		sig = OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha256'), getSignatureKey, @policy).gsub(/\n|\r/, '')
	end
	
end
