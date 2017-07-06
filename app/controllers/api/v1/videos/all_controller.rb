class Api::V1::Videos::AllController < ApplicationController
	def index
		offset = request.headers["offset"].to_i % 1 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
		sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
		order = sanitizedOrder ? sanitizedOrder : "vc.count DESC"
			#
			#for some weird reason you can't do the '?' in the order and have to do #{} instead. throws some no constant error. No idea.
			#
		categories = $redis.get("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories_rest")
		if categories.nil?
			sanitized_query = VideoCategory.escape_sql(["SELECT count(*) OVER () AS total_count, vc.* FROM video_categories vc WHERE created_at >= ? GROUP BY vc.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
			categories = VideoCategory.find_by_sql(sanitized_query).to_json
			$redis.set("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories_rest",categories)
			$redis.rpush("videos_all_keys", "videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories_rest")
		end
		categories = JSON.parse(categories)
		if categories != []
			postIds = []
			#### THIS NEEDS TO BE REFACTORED. IT SMELLS.
			fifth = categories[4]  && categories[4]['top_day'].length != 0 ? categories[4]['top_day'] : []
			sixth = categories[5]  && categories[5]['top_day'].length != 0 ? categories[5]['top_day'] : []
			seventh = categories[6]  && categories[6]['top_day'].length != 0 ? categories[6]['top_day'] : []
			eighth = categories[7]  && categories[7]['top_day'].length != 0 ? categories[7]['top_day'] : []
			ninth = categories[8]  && categories[8]['top_day'].length != 0 ? categories[8]['top_day'] : []
			tenth = categories[9]  && categories[9]['top_day'].length != 0 ? categories[9]['top_day'] : []
			eleventh = categories[10]  && categories[10]['top_day'].length != 0 ? categories[10]['top_day'] : []
			twelth = categories[11]  && categories[11]['top_day'].length != 0 ? categories[11]['top_day'] : []
			thirteenth = categories[12]  && categories[12]['top_day'].length != 0 ? categories[12]['top_day'] : []
			fourteenth = categories[13]  && categories[13]['top_day'].length != 0 ? categories[13]['top_day'] : []
			fifteenth = categories[14]  && categories[14]['top_day'].length != 0 ? categories[14]['top_day'] : []
			sixteenth = categories[15]  && categories[15]['top_day'].length != 0 ? categories[15]['top_day'] : []
			seventeenth = categories[16]  && categories[16]['top_day'].length != 0 ? categories[16]['top_day'] : []
			eighteenth = categories[17]  && categories[17]['top_day'].length != 0 ? categories[17]['top_day'] : []
			nineteenth = categories[18]  && categories[18]['top_day'].length != 0 ? categories[18]['top_day'] : []
			twentyith = categories[19]  && categories[19]['top_day'].length != 0 ? categories[19]['top_day'] : []
			postIds.concat(fifth).concat(sixth).concat(seventh).concat(eighth).concat(tenth).concat(eleventh).concat(twelth).concat(thirteenth).concat(fourteenth).concat(fifteenth).concat(sixteenth).concat(seventeenth).concat(eighteenth).concat(nineteenth).concat(twentyith)
			postIds.to_json
			fifth_l = fifth.length != 0 ? fifth.length : 0
			sixth_l = sixth.length != 0 ? sixth.length + fifth_l : 0 + fifth_l
			seventh_l = seventh.length != 0 ? seventh.length + sixth_l : 0 + sixth_l
			eighth_l = eighth.length != 0 ? eighth.length + seventh_l : 0 + seventh_l
			ninth_l = ninth.length != 0 ? ninth.length + eighth_l : 0 + eighth_l
			tenth_l = tenth.length != 0 ? tenth.length + ninth_l : 0 + ninth_l
			eleventh_l = eleventh.length != 0 ? eleventh.length + tenth_l : 0 + tenth_l
			twelth_l = twelth.length != 0 ? twelth.length + eleventh_l : 0 + eleventh_l
			thirteenth_l = thirteenth.length != 0 ? thirteenth.length + twelth_l : 0 + twelth_l
			fourteenth_l = fourteenth.length != 0 ? fourteenth.length + thirteenth_l : 0 + thirteenth_l
			fifteenth_l = fifteenth.length != 0 ? fifteenth.length + fourteenth_l : 0 + fourteenth_l
			sixteenth_l = sixteenth.length != 0 ? sixteenth.length + fifteenth_l : 0 + fifteenth_l
			seventeenth_l = seventeenth.length != 0 ? seventeenth.length + sixteenth_l : 0 + sixteenth_l
			eighteenth_l = eighteenth.length != 0 ? eighteenth.length + seventeenth_l : 0 + seventeenth_l
			nineteenth_l = nineteenth.length != 0 ? nineteenth.length + eighteenth_l : 0 + eighteenth_l
			twentyith_l = twentyith.length != 0 ? twentyith.length + nineteenth_l : 0 + nineteenth_l
			if postIds != []
				puts postIds
				posts = $redis.get("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_rest")
				if posts.nil?
					records = Video.where(uuid: (postIds.split(',').to_a)).select_with(App.getGoodColumns('videos')).group_by(&:uuid)
					posts = postIds.map{|id| records[id].first}.to_json
					puts posts.as_json
					$redis.set("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_rest",posts)
					$redis.rpush("videos_all_keys","videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_rest")
				end
				posts = JSON.parse(posts)
				Video.userCheck([posts.to_a], request.headers["Authorization"])
				sortedposts = []
				# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
				# sortedposts << posts[0...fl].to_a
				# sortedposts << posts[fl...sl].to_a
				# sortedposts << posts[sl...tl].to_a
				# sortedposts << posts[tl...fol].to_a
				sortedposts << posts[0...fifth_l].to_a
				sortedposts << posts[fifth_l...sixth_l].to_a
				sortedposts << posts[sixth_l...seventh_l].to_a
				sortedposts << posts[seventh_l...eighth_l].to_a
				sortedposts << posts[eighth_l...ninth_l].to_a
				sortedposts << posts[ninth_l...tenth_l].to_a
				sortedposts << posts[tenth_l...eleventh_l].to_a
				sortedposts << posts[eleventh_l...twelth_l].to_a
				sortedposts << posts[twelth_l...thirteenth_l].to_a
				sortedposts << posts[thirteenth_l...fourteenth_l].to_a
				sortedposts << posts[fourteenth_l...fifteenth_l].to_a
				sortedposts << posts[fifteenth_l...sixteenth_l].to_a
				sortedposts << posts[sixteenth_l...seventeenth_l].to_a
				sortedposts << posts[seventeenth_l...eighteenth_l].to_a
				sortedposts << posts[eighteenth_l...nineteenth_l].to_a
				sortedposts << posts[nineteenth_l...twentyith_l].to_a
				# render json:{status:200, success:true, genres:genres, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}
				render json:{success:true, videos:sortedposts}, status: :ok
			else 
				render json:{success:true, videos:[]}, status: :ok
			end
		else
			render json: {success:false}, status: :not_found
		end
	end
	
	def read
		if (!params[:sort] || (params[:sort] != 'videos' && params[:sort] != 'categories'))
			render json:{status:400, success:false, message:'Sort param is required - must be either, "videos" or "categories" '}
			return false
		end
		if params[:sort] === 'categories'
			if (!params[:options])
				render json:{success:false, message:'Options param are required'}, status: :bad_request
				return false
			end
			time = Song.sanitizeTime(params[:time].to_s)
			order = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
			if (!order || !time)
				render json:{success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}, status: :bad_request
				return false
			end
			categories = VideoCategory.where('created_at >= ? AND flagged = false AND removed = false',time).order(order).limit(20)
			if categories != []
				puts categories
				puts categories[0]
				postIds = []
				firsttd = categories[0] && categories[0]['top_day'].length != 0 ? categories[0]['top_day'] : []
				secondtd = categories[1] && categories[1]['top_day'].length != 0 ? categories[1]['top_day'] : []
				thirdtd = categories[2] && categories[2]['top_day'].length != 0 ? categories[2]['top_day'] : []
				fourthtd = categories[3] && categories[3]['top_day'].length != 0 ? categories[3]['top_day'] : []
				postIds.concat(firsttd).concat(secondtd).concat(thirdtd).concat(fourthtd)
				postIds.to_json
				fl = firsttd.length != 0 ? firsttd.length : 0
				sl = secondtd.length != 0 ? secondtd.length + fl : 0 + fl
				tl = thirdtd.length != 0 ? thirdtd.length + sl : 0 + sl
				fol = fourthtd.length != 0 ? fourthtd.length + tl : 0 + tl
				if postIds != []
					puts postIds
					records = Video.where(id: (postIds.split(',').to_a)).select_with(App.getGoodColumns('videos')).group_by(&:id)
					posts = postIds.map{|id| records[id.to_i].first}
					Video.userCheck([posts.to_a], request.headers["Authorization"])
					sortedposts = []
					sortedposts << posts[0...fl].to_a
					sortedposts << posts[fl...sl].to_a
					sortedposts << posts[sl...tl].to_a
					sortedposts << posts[tl...fol].to_a
					render json:{success:true, categories:categories, offset:0, page:1, videos:sortedposts}, status: :ok
				else 
					render json:{success:true, categories:categories, videos:[], page:1, offset:0}, status: :ok
				end
			else
				render json: {success:false}, status: :not_found
			end
		else
			if (!params[:videos_options])
				render json:{status:400, success:false, message:'Options param are required'}
				return false
			end
			time = Song.sanitizeTime(params[:videos_time].to_s)
			order = Song.sanitizeOrder(params[:videos_options].to_s,params[:videos_type].to_s)
			if (!order || !time)
				render json:{status:400, success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}
				return false
			end
			videos = Video.where('created_at >= ? AND flagged = false AND removed = false',time).select_with(App.getGoodColumns('videos')).order(order).limit(20)
			Video.userCheck([videos], request.headers["Authorization"])
			if videos != []
				render json:{status:200, success:true, videos: videos}
			else
				render json: {status:404,success:false}
			end	
		end
	end

	def update
		if (!params[:sort] || (params[:sort] != 'videos' && params[:sort] != 'categories'))
			render json:{status:400, success:false, message:'Sort parameter is required'}
			return false
		end
		if params[:sort] === 'categories'
			if !params[:offset]
				render json:{success:false, message:'Offset params are required.'}, status: :bad_request
				return false
			end
			offset = params[:offset] && params[:offset].to_i % 1 === 0 ? params[:offset].to_i : nil
			puts offset
			sanitizedTime = Song.sanitizeTime(params[:time].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s) 
			order = sanitizedOrder ? sanitizedOrder : 'count DESC'
			categories = VideoCategory.where('created_at >= ?', time).offset(offset).limit(20).order(order)
			if categories != []
				puts categories
				puts categories[0]
				# puts categories[0]['top_day']
				postIds = []
				firsttd = categories[0] && categories[0]['top_day'].length != 0 ? categories[0]['top_day'] : []
				secondtd = categories[1] && categories[1]['top_day'].length != 0 ? categories[1]['top_day'] : []
				thirdtd = categories[2] && categories[2]['top_day'].length != 0 ? categories[2]['top_day'] : []
				fourthtd = categories[3] && categories[3]['top_day'].length != 0 ? categories[3]['top_day'] : []
				postIds.concat(firsttd).concat(secondtd).concat(thirdtd).concat(fourthtd)
				postIds.to_json
				fl = firsttd.length != 0 ? firsttd.length : 0
				sl = secondtd.length != 0 ? secondtd.length + fl : 0 + fl
				tl = thirdtd.length != 0 ? thirdtd.length + sl : 0 + sl
				fol = fourthtd.length != 0 ? fourthtd.length + tl : 0 + tl
				if postIds != []
					puts postIds
					records = Video.where(id: (postIds.split(',').to_a)).select_with(App.getGoodColumns('videos')).group_by(&:id)
					posts = postIds.map{|id| records[id.to_i].first}
					Video.userCheck([posts.to_a], request.headers["Authorization"])
					sortedposts = []
					# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
					sortedposts << posts[0...fl].to_a
					sortedposts << posts[fl...sl].to_a
					sortedposts << posts[sl...tl].to_a
					sortedposts << posts[tl...fol].to_a


					# render json:{status:200, success:true, categories:categories, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}
					render json:{success:true, categories:categories, videos:sortedposts, offset:offset, status:200}
				else 
					render json:{success:true, categories:categories, videos:[], offset:offset, status:200}
				end
			else
				render json: {success:false}, status: :not_found
			end
		else
			if (!params[:offset])
				render json:{status:400, success:false, message:'Video offset param is required'}
				return false
			end
			offset = params[:offset].to_i % 1 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i  : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(params[:time].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(params[:videos_options].to_s,params[:videos_type].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, created_at DESC"
			videos = Video.where('worked = true AND deleted = false AND created_at >= ?',time).select_with(App.getGoodColumns('videos')).order(order).limit(20).offset(offset)
			Video.userCheck([videos], request.headers["Authorization"])
			ids = videos.map(&:id)
			if videos != []
				render json:{status:200, success:true, videos: videos, offset:offset, ids:ids}
			else
				render json: {status:404,success:false}
			end
		end
	end
end
