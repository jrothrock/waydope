class Api::V1::Videos::CategoryController < ApplicationController
	def index
		if request.headers["Category"]
			# by setting the modulo 23, it would make it super unfriendly to other API users. DEFINITELY needs to be changed. This is due to having 3 featured, 4 rows of 5.
			offset = request.headers["offset"] && request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, created_at DESC"
			videos = $redis.get("videos_category_#{request.headers["Category"]}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
			if videos.nil?
				if request.headers["Category"] === 'hot'
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif request.headers["Category"] === 'new'
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif request.headers["Category"] === 'featured'
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				else
					sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE main_category = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20",request.headers["Category"],time.to_s,offset]) 
				end
				videos = Video.find_by_sql(sanitized_query).to_json
				$redis.set("videos_category_#{request.headers["Category"]}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts",videos)
			end
			videos = JSON.parse(videos)
			puts videos
			count = videos && videos.first ? videos.first["count"] : 0
			page = offset > 0 ? offset / 20 : 1
			pages = (count / 20.0).ceil
			checked = Video.userCheck([videos], request.headers["Authorization"])
			if videos !=[]
				render json:{status:200, success:true, videos:checked[0], offset:20, page:page, pages:pages, count:count}
			else
				render json:{status:404,success:false}
			end
		else
			render json:{status:400, success:false, message:'Category params is required.'}
		end
	end

	def read
		if (!params[:category] || !params[:options])
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		time = Song.sanitizeTime(params[:time].to_s)
		order = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
		if (!order || !time)
			render json:{status:400, success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}
			return false
		end
		if request.headers["Category"] === 'hot'
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} LIMIT 20", time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		elsif request.headers["Category"] === 'new'
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} LIMIT 20", time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		elsif request.headers["Category"] === 'featured'
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true GROUP BY v.id ORDER BY #{order} LIMIT 20", time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		else
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE main_category = ? created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true GROUP BY v.id ORDER BY #{order} LIMIT 20", request.headers["Category"], time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		end
		Video.userCheck([videos], request.headers["Authorization"])
		if videos
			render json: {status:200, success:true, videos:videos, offset:0, page:1}
		else
			render json: {status:404, success:false}
		end
	end

	def update
		if (!params[:category] || !params[:offset])
			render json:{status:400, success:false, message:'Category and options params are required.'}
			return false
		end
		### add the 3 to the offset due to the featured.
		offset = params[:offset] && params[:offset].to_i % 20 === 0 ? params[:offset].to_i : 0
		puts offset
		sanitizedTime = Song.sanitizeTime(params[:time].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s) 
		order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, created_at DESC"
		### only need to limit 20 here due to the featured videos always staying. 23 - 3(featured).
		puts params[:category]
		if request.headers["Category"] === 'hot'
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		elsif request.headers["Category"] === 'new'
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		elsif request.headers["Category"] === 'featured'
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", request.headers["Category"], time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		else
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER (),  #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE main_category = ? created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true GROUP BY v.id ORDER BY #{order} OFFSET ? LIMIT 20", request.headers["Category"], time.to_s,offset]) 
			posts = Video.find_by_sql(sanitized_query)
		end
		Video.userCheck([posts], request.headers["Authorization"])
		if posts
			render json:{status:200, success:true, posts:posts, offset:offset}
		else
			render json:{status:404, success:false}
		end
	end
end
