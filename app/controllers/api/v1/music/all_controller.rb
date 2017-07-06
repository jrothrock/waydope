class Api::V1::Music::AllController < ApplicationController
	# this is to get the rest of boards as the first call only grabs the first five (music#index)
	def index
		offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
		sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
		order = sanitizedOrder ? sanitizedOrder : "mg.count DESC"
			#
			#for some weird reason you can't do the '?' in the order and have to do #{} instead. throws some no constant error. No idea.
			#
		categories = $redis.get("music_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories_rest")
		if categories.nil?
			sanitized_query = MusicGenre.escape_sql(["SELECT count(*) OVER () AS total_count, mg.* FROM music_genres mg WHERE created_at >= ? GROUP BY mg.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
			categories = MusicGenre.find_by_sql(sanitized_query).to_json
			$redis.set("music_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories_rest",categories)
			$redis.rpush("music_all_keys", "music_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories_rest")
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
				posts = $redis.get("music_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_rest")
				if posts.nil?
					records = Song.where(uuid: (postIds.split(',').to_a)).select_with(App.getGoodColumns('music')).group_by(&:uuid)
					posts = postIds.map{|id| records[id].first}.to_json
					$redis.set("music_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_rest",posts)
					$redis.rpush("music_all_keys", "music_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_rest")
				end
				posts = JSON.parse(posts)
				Song.userCheck([posts.to_a], request.headers["Authorization"])
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
				render json:{status:200, success:true, songs:sortedposts}
			else 
				render json:{status:200, success:true, songs:[]}
			end
		else
			render json: {status:404,success:false}
		end
	end

	def read
		if (!params[:sort] || (params[:sort] != 'music' && params[:sort] != 'genres'))
			render json:{status:400, success:false, message:'type parameter - being either genres or music - must be present'}
			return false
		end
		if params[:sort] === 'genres'
			if (!params[:options])
				render json:{status:400, success:false, message:'Options param are required'}
				return false
			end
			time = Song.sanitizeTime(params[:time].to_s)
			order = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
			if (!order || !time)
				render json:{status:400, success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}
				return false
			end
			genres = MusicGenre.where('created_at >= ?',time)
			if genres != []
				puts genres
				puts genres[0]
				# puts genres[0]['top_day']
				postids = genres[0]['top_day']
				fl = postids.length != 0 ? genres[0]['top_day'].length : 0
				sl = genres[1]['top_day'].length != 0 ? (genres[1]['top_day'].length) + fl : 0 + fl
				tl = genres[2]['top_day'].length != 0 ? (genres[2]['top_day'].length) + sl : 0 + sl
				fol = genres[3]['top_day'].length != 0 ? (genres[3]['top_day'].length)+ tl : 0 + tl
				postids.concat(genres[1]['top_day']).concat(genres[2]['top_day']).concat(genres[3]['top_day'])
				postids.to_json
				if postids != []
					puts postids
					records = Song.where(uuid: (postids.split(',').to_a)).select_with(App.getGoodColumns('music')).group_by(&:uuid)
					posts = postids.map{|id| records[id.to_i].first}
					Song.userCheck([posts.to_a], request.headers["Authorization"])
					sortedposts = []
					# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
					sortedposts << posts[0...fl].to_a
					sortedposts << posts[fl...sl].to_a
					sortedposts << posts[sl...tl].to_a
					sortedposts << posts[tl...fol].to_a
					# render json:{status:200, success:true, genres:genres, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}
					ids = sortedposts.map{|song| song["id"]}
					render json:{status:200, success:true, genres:genres, songs:sortedposts,length: postids.length, first:fl, second: sl, third: tl, fourth: fol, first_genre:genres[0], second_genre:genres[1], third_genre:genres[2], fourth_genre:genres[3], ogs:postids, ogposts: posts,ids:ids}
				else 
					render json:{status:200, success:true, genres:genres, songs:[]}
				end
			else
				render json: {status:404,success:false}
			end
		else
			if (!params[:music_options])
				render json:{status:400, success:false, message:'Options param are required'}
				return false
			end
			puts params[:offset]
			time = Song.sanitizeTime(params[:music_time].to_s)
			order = Song.sanitizeOrder(params[:music_options].to_s,params[:music_type].to_s)
			if (!order || !time)
				render json:{status:400, success:false, message:'You fucked some shit up fam. More precisely, in either your time, rank, or type params.'}
				return false
			end
			songs = Song.where('worked = true AND uploaded = true AND deleted = false AND created_at >= ? AND flagged = false AND removed = false',time).select_with(App.getGoodColumns('music')).order(order).limit(20)
			Song.userCheck([songs], request.headers["Authorization"])
			if songs != []
				render json:{status:200, success:true, songs: songs}
			else
				render json: {status:404,success:false}
			end	
		end
	end

	def update
		if (!params[:sort] || (params[:sort] != 'music' && params[:sort] != 'genres'))
			render json:{status:400, success:false, message:'type parameter - being either genres or music - must be present'}
			return false
		end
		if params[:sort] === 'genres'
			if (!params[:offset])
				render json:{status:400, success:false, message:'Offset param is required'}
				return false
			end
			offset = params[:offset].to_i % 20 === 0 && params[:offset].to_i > 0 ? params[:offset].to_i  : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(params[:time].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(params[:options].to_s,params[:type].to_s)
			order = sanitizedOrder ? sanitizedOrder : "count DESC, created_at DESC"
			genres = MusicGenre.where('created_at >= ?',time).order(order).limit(20).offset(offset)
			if genres != []
				puts genres
				puts genres[0]
				# puts genres[0]['top_day']

				first_genre_tops = genres[0]['top_day']
				second_genre_tops = genres[1] && genres[1]['top_day'] ? genres[1]['top_day'] : []
				third_genre_tops = genres[2] && genres[2]['top_day'] ? genres[2]['top_day'] : []
				fourth_genre_tops = genres[3] && genres[3]['top_day'] ? genres[3]['top_day'] : []

				fl = first_genre_tops.length ? first_genre_tops.length : 0
				sl = second_genre_tops.length ? (second_genre_tops.length) + fl : 0 + fl
				tl = third_genre_tops.length ? (third_genre_tops.length) + sl : 0 + sl
				fol = fourth_genre_tops.length ? (fourth_genre_tops.length)+ tl : 0 + tl
				postids = first_genre_tops.concat(second_genre_tops).concat(third_genre_tops).concat(fourth_genre_tops)
				postids.to_json
				if postids != []
					puts postids
					records = Song.where(uuid: (postids.split(',').to_a)).select_with(App.getGoodColumns('music')).group_by(&:uuid)
					posts = postids.map{|id| records[id.to_i].first}
					Song.userCheck([posts.to_a], request.headers["Authorization"])
					sortedposts = []
					# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
					sortedposts << posts[0...fl].to_a
					sortedposts << posts[fl...sl].to_a
					sortedposts << posts[sl...tl].to_a
					sortedposts << posts[tl...fol].to_a
					# render json:{status:200, success:true, genres:genres, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}
					render json:{status:200, success:true, genres:genres, songs:sortedposts,length: postids.length, first:fl, second: sl, third: tl, fourth: fol, first_genre:genres[0], second_genre:genres[1], third_genre:genres[2], fourth_genre:genres[3], ogs:postids, ogposts: posts, offset:offset}
				else 
					render json:{status:200, success:true, genres:genres, songs:[], offset:offset}
				end
			else
				render json: {status:404,success:false}
			end
		else
			if (!params[:music_offset])
				render json:{status:400, success:false, message:'Music Offset param is required'}
				return false
			end
			offset = params[:music_offset].to_i % 20 === 0 && params[:music_offset].to_i > 0 ? params[:music_offset].to_i  : 0 # not a terrible sanitation honestly.
			puts offset
			sanitizedTime = Song.sanitizeTime(params[:time].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(params[:music_options].to_s,params[:music_type].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, created_at DESC"
			songs = Song.where('uploaded = true AND deleted = false AND worked = true AND created_at >= ? AND flagged = false AND removed = false',time).select_with(App.getGoodColumns('music')).order(order).limit(20).offset(offset)
			Song.userCheck([songs], request.headers["Authorization"])
			ids = songs.map(&:id)
			if songs != []
				render json:{status:200, success:true, songs: songs, offset:offset,ids:ids}
			else
				render json: {status:404,success:false}
			end
		end
	end
end
