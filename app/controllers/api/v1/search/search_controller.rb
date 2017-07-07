class Api::V1::Search::SearchController < ApplicationController
	def index
      puts request.headers["search"]
      type = request.headers["category"].downcase
      offset = request.headers["offset"].to_i ? request.headers["offset"].to_i : 0
      case type
		when 'all'
            #########
            # THIS NEEDS TO BE FIGURED OUT. Either by the association method, Joins method second medium, or the hash sort method.     
            #########

            ###
            #The Association way
            ### 
            # results = PgSearch.multisearch(request.headers['search']).includes(:searchable)

            ###
            #The joins method
            ###
            # results = PgSearch.multisearch(request.headers['search']).joins("RIGHT JOIN pg_search_documents.id.searchable_type on pg_search_documents.id.searchable_id = pg_search_documents.id.searchable_type.id")
            # results = PgSearch.multisearch(request.headers['search']).joins("RIGHT JOIN searchable_type on searchable_id = searchable_type.id")
		
            ###
            #the hash method
            ###
            ### This removes the n+1 issue, but I'm struggling trying to sort it via the order array. It would probably be easier to use sort_by, but will be slower.
            # objects = []
            # types = []
            # order = []
            # posts = []
            # results = PgSearch.multisearch(request.headers['search'])
            # results.each do |result|
            #     order << result.searchable_id.to_i
            #     if objects.length && types.include?(result.searchable_type)
            #         objects.each do |object|
            #             if object && object[0] && object[0] === result.searchable_type then object[1] << result.searchable_id end
            #         end
            #     else
            #         objects << [result.searchable_type, [result.searchable_id]]
            #         types << result.searchable_type
            #     end
            # end
            # types.each_with_index do |type,index|
            #     tempposts = Object.const_get(type).find(objects[index][1])
            #     tempposts.each do |post|
            #         posts << post
            #     end
            # end
            # hash_object = posts.each_with_object({}) do |obj, hash| 
            #   hash[obj.id] = obj
            # end
            # order.map { |index| hash_object[index] }
            # order.reverse

            ### The N+1 slow mother fucking way.
            total =  PgSearch.multisearch(request.headers['search']).count
            results = PgSearch.multisearch(request.headers['search']).offset(offset).limit(20).map do |result|
                if result.searchable_type != 'Product'
                    object = Object.const_get(result.searchable_type).select_with(App.getGoodColumns(App.typeGetDB(result.searchable_type))).find(result.searchable_id)
                else
                   object= Object.const_get(result.searchable_type).select_with(App.getGoodColumns(App.typeGetDB(result.searchable_type,result.searchable_id))).find(result.searchable_id).as_json
                end
            end
		when 'boards'
            total =  NewsPost.where("flagged = false AND removed = false").search(request.headers['search']).count
			results = NewsPost.where("flagged = false AND removed = false").search(request.headers['search']).select_with(App.getGoodColumns("news")).offset(offset).limit(20)
		when 'music'
            total =  Song.where("flagged = false AND worked = true AND uploaded = true AND removed = false").search(request.headers['search']).count
			results = Song.where("flagged = false AND worked = true AND uploaded = true AND removed = false").select_with(App.getGoodColumns("music")).search(request.headers['search']).offset(offset).limit(20)
		when 'videos'
            total =  Video.where("flagged = false AND worked = true AND uploaded = true AND removed = false").search(request.headers['search']).count
			results = Video.where("flagged = false AND worked = true AND uploaded = true AND removed = false").select_with(App.getGoodColumns("videos")).search(request.headers['search']).offset(offset).limit(20)
		when 'apparel'
		    # results = ::Product.search(request.headers['search'])
            total =  ::Product.where("post_type = 'apparel' AND worked = true AND uploaded = true AND flagged = false AND removed = false").search(request.headers['search']).count
            results = ::Product.where("post_type = 'apparel' AND worked = true AND uploaded = true AND flagged = false AND removed = false").select_with(App.getGoodColumns("apparel")).search(request.headers['search']).offset(offset).limit(20).as_json(include: :photos).to_a
        when 'technology'
            # results = ::Product.search(request.headers['search'])
            total =  ::Product.where("post_type = 'technology' AND worked = true AND uploaded = true AND flagged = false AND removed = false").search(request.headers['search']).count
            results = ::Product.where("post_type = 'technology' AND worked = true AND uploaded = true AND flagged = false AND removed = false").select_with(App.getGoodColumns("technology")).search(request.headers['search']).offset(offset).limit(20).as_json(include: :photos).to_a
		else
            render json: {message:'category parameter is required.'}, status: :bad_request
			return false
		end
        if results
            pages = ((total / 20.to_f)).ceil
            current_page = (offset / 20.to_f).floor + 1
            offset = offset
            user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
            results.each do |post|
                if post.class != Hash
                    if post.post_type === 'news' 
                        if user
                            post_votes_hash = post.votes
                            post.user_voted = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
                        end
                        post.time_ago = time_ago_in_words(post.created_at).gsub('about ','') + ' ago'
                        post.votes = nil
                        post.ratings = nil
                        post.report_users = nil
                    else 
                        if user
                            post.user_liked = post.likes.key?(user.uuid) ? true : false
                            post_votes_hash = post.votes
                            post.user_voted = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
                        end
                        post.time_ago = time_ago_in_words(post.created_at).gsub('about ','') + ' ago'
                        post.votes = nil
                        post.likes = nil
                        post.ratings = nil
                        post.report_users = nil
                    end
                else
                    if user
                        post["user_liked"] = post["likes"].key?(user.uuid) ? true : false
                        post_votes_hash = post["votes"]
                        post["user_voted"] = post_votes_hash.key?(user.uuid) ? post_votes_hash[user.uuid] : nil
                    end
                    if post["post_type"] === 'apparel' || post["post_type"] === 'technology'
                        post["price"] = number_to_currency(post["price"])
                        post["sale_price"] = number_to_currency(post["sale_price"])
                        post["shipping"] = number_to_currency(post["shipping"])
                    end
                    post["votes"] = nil
                    post["likes"] = nil
                    post["ratings"] = nil
                    post["report_users"] = nil
                end
            end
            render json:{results:results,total:total,pages:pages,current_page:current_page,offset:offset}, status: :ok
        else 
            render json:{}, status: :not_found
        end
    end
end
