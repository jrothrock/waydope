### Need to come up with a way to weight all the songs
class Api::V1::Music::GenreController < ApplicationController
	def index
		if request.headers["Genre"]
			offset = request.headers["offset"] && request.headers["offset"].to_i % 15 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"

			songs = $redis.get("music_category_#{request.headers["Genre"]}_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_posts")
			puts 'redis genre pull'
			puts songs.nil?
			if songs.nil?
				if request.headers["Genre"] === 'hot'
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif request.headers["Genre"] === 'new'
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				elsif request.headers["Genre"] === 'featured'
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
				else
					sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE main_genre = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 20", request.headers["Genre"], time.to_s,offset]) 
				end
				songs = Song.find_by_sql(sanitized_query).to_json
				$redis.set("music_category_#{request.headers["Genre"]}_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_posts",songs)
				$redis.rpush("music_all_keys","music_category_#{request.headers["Genre"]}_#{offset}_#{time.strftime("%Y%m%d")}_#{order.parameterize}_posts")
			end
			songs = JSON.parse(songs)

			# songs = Song.find_by_genre(request.headers["Category"],23).order('average_vote DESC, comment_count DESC')
			count = songs && songs.first ? songs.first["count"] : 0
			page = offset > 0 ? offset/20 : 1
			pages = (count / 20.0).ceil
			checked = Song.userCheck([songs], request.headers["Authorization"])
			if songs != []	
				render json:{status:200, success:true, songs:checked[0], offset:15, count:count, pages:pages, page:1}
			else
				render json:{status:404,success:false}
			end
		else 
			render json:{status:400, success:false, message:'genre param is required.'}
		end
	end

	def read
		if (!params[:genre] || !params[:options])
			render json:{status:400, success:false, message:'Genre and options params are required'}
			return false
		end
		time = Song.sanitizeTime(params[:time].to_s)
		order = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
		if (!order || !time)
			render json:{status:400, success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}
			return false
		end
		if params[:genre].to_s != 'all'
			songs = Song.where('main_genre = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false', params[:genre],time).select_with(App.getGoodColumns('music')).limit(15).order(order)
		else
			songs = Song.where('created_at >= ? AND worked = true AND uploaded = true AND flagged = false', time, ids).select_with(App.getGoodColumns('music')).limit(15).order(order)
		end
		Song.userCheck([songs], request.headers["Authorization"])
		if songs
			render json: {status:200, success:true, songs:songs, offset:0, page:1}
		else
			render json: {status:404, success:false}
		end
	end

	def update
		if (!params[:genre] || !params[:offset])
			render json:{status:400, success:false, message:'Genre and options params are required.'}
			return false
		end
		offset = params[:offset] && params[:offset].to_i % 15 === 0 ? params[:offset].to_i : nil
		sanitizedTime = Song.sanitizeTime(params[:time].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s) 
		order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, created_at DESC"
		if request.headers["Genre"] === 'hot'
			sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE main_genre = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 15",request.headers["Genre"], time.to_s,offset]) 
			posts = Song.find_by_sql(sanitized_query)
		elsif request.headers["Genre"] === 'new'
			sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE main_genre = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 15",request.headers["Genre"], time.to_s,offset]) 
			posts = Song.find_by_sql(sanitized_query)
		elsif request.headers["Genre"] === 'featured'
			sanitized_query = Song.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE main_genre = ? AND created_at >= ? AND worked = true AND uploaded = true AND flagged = false GROUP BY s.id ORDER BY #{order} OFFSET ? LIMIT 15",request.headers["Genre"], time.to_s,offset]) 
			posts = Song.find_by_sql(sanitized_query)
		else
			posts = Song.where('created_at >= ? AND worked = true AND uploaded = true AND flagged = false', time).select_with(App.getGoodColumns('music')).offset(offset).limit(15).order(order)
		end
		Song.userCheck([posts], request.headers["Authorization"])
		if posts
			render json:{status:200, success:true, songs:posts, offset:offset}
		else
			render json:{status:404, success:false}
		end
	end
end
