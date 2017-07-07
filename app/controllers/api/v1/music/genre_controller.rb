### Need to come up with a way to weight all the songs
class Api::V1::Music::GenreController < ApplicationController
	def index
		if params["genre"]
			offset = request.headers["offset"] && request.headers["offset"].to_i % 15 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"

			songs = $redis.get("music_category_#{params["genre"]}_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_posts")
			puts 'redis genre pull'
			puts songs.nil?
			if songs.nil?
				if params["genre"] === 'hot'
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif params["genre"] === 'new'
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif params["genre"] === 'featured'
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				else
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE main_genre = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", params["genre"], time.to_s,offset]) 
				end
				songs = Song.find_by_sql(sanitized_query).to_json
				$redis.set("music_category_#{params["genre"]}_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_posts",songs)
				$redis.rpush("music_all_keys","music_category_#{params["genre"]}_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_posts")
			end
			songs = JSON.parse(songs)

			# songs = Song.find_by_genre(request.headers["Category"],23).order('average_vote DESC, comment_count DESC')
			count = songs && songs.first ? songs.first["count"] : 0
			page = offset > 0 ? offset/20 : 1
			pages = (count / 20.0).ceil
			checked = Song.userCheck([songs], request.headers["Authorization"])
			if songs != []	
				render json:{songs:checked[0], offset:15, count:count, pages:pages, page:1}, status: :ok
			else
				render json:{}, status: :not_found
			end
		else 
			render json:{message:'genre param is required.'}, status: :bad_request
		end
	end
end
