class Api::V1::Videos::CategoryController < ApplicationController
	def index
		if params["category"]
			# by setting the modulo 23, it would make it super unfriendly to other API users. DEFINITELY needs to be changed. This is due to having 3 featured, 4 rows of 5.
			offset = request.headers["offset"] && request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, created_at DESC"
			videos = $redis.get("videos_category_#{params['category']}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
			if videos.nil?
				if params["category"] === 'hot'
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif params["category"] === 'new'
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif params["category"] === 'featured'
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				else
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE main_category = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20",params["category"],time.to_s,offset]) 
				end
				videos = Video.find_by_sql(sanitized_query).to_json
				$redis.set("videos_category_#{params['category']}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts",videos)
			end
			videos = JSON.parse(videos)
			puts videos
			count = videos && videos.first ? videos.first["count"] : 0
			page = offset > 0 ? offset / 20 : 1
			pages = (count / 20.0).ceil
			checked = Video.userCheck([videos], request.headers["Authorization"])
			if videos !=[]
				render json:{videos:checked[0], offset:20, page:page, pages:pages, count:count}, status: :ok
			else
				render json:{}, status: :not_found
			end
		else
			render json:{message:'Category params is required.'}, status: :bad_request
		end
	end
end
