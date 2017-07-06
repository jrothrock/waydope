###
#
# Bot queue types (alphabetical):
# 1 : comments
# 2 : likes
# 3 : ratings
# 4 : votes
#
####

class Bot < ApplicationRecord
    self.table_name = "bot_queue"
    def self.type(types)
        case types
		when 'apparel'
			return 'products'
		when 'technology'
			return 'products'
		when 'news'
			return 'news_posts'
		when 'music'
			return 'songs'
		when 'videos'
			return 'videos'
        when 'comments'
            return 'comments'
		else
			return 'news_posts'
		end
    end
    def self.pick_random_line(file)
        chosen_line = nil
        File.foreach(file).each_with_index do |line, number|
            chosen_line = line if rand < 1.0/(number+1)
        end
        return chosen_line
    end

    def self.logIt(index,count,type)
        ## elapsed is a percentage of how many comments have gone through
        ## ie. this is the 6th comment of 12 so 0.5
        puts index
        puts count
        # y = 1/(1 + e^(-12*(x-0.5)))
        #value = 0.59 + (1.735*(index/count) - 0.9)**5
        
        # y = e^((4.7x-1.3)^5-2)
        #value = Math::E ** (((4.7*(index/count.to_f)-1.3)**5) - 2)
        # y = 0.02+5e^(20(1.2x-0.7)^5-3)
        # value = 0.02 + (5 * Math::E ** ((20 * ((1.2*(index/count.to_f))-0.7)**5)-3) )

        #value = 0.02 + (10 * Math::E ** ((20 * ((0.965*(index/count.to_f)-0.62)**3)-3.2))


        # y = (-e^(x-0.65)^4) + (2.3^(0.89x)^3) + 0.2
        if type === "slow"
            value = (-7** ((index/count.to_f)-0.45)**4) + (1.1**((2.07*(index/count.to_f))**3))-0.7
        elsif type === "fast"
            value = (-50** ((index/count.to_f)-0.34)**4) + (2.4**((1.083*(index/count.to_f))**3)) + 0.055
        else
            value = (-Math::E** ((index/count.to_f)-0.65)**4 ) + (2.3**((0.89*(index/count.to_f))**3)) + 0.2
        end


        # y = 1/(1 +  e^(-12*(x-0.5)))
        # value = 1/(1+Math::E**(-12*((index/count)-0.5)))
        puts value
        return value

    end
    def self.getNames(count)
        #
        # this is taken from here:
        # http://stackoverflow.com/questions/11007111/ruby-whats-an-elegant-way-to-pick-a-random-line-from-a-text-file
        #
        filename = "#{Rails.root}/lib/assets/usernames.txt"
        usernames={}.to_h
        count.times do |time|
            begin 
                username = pick_random_line(filename).strip()
                if(usernames.key?(username) || User.unscoped.where("username = ?", username).any?) then raise 'Duplicate username, retry' end
                usernames[username] = true
            rescue
                retry
            end
        end
        return usernames
    end

    def self.doComment(comment,hash)
        puts hash
        begin
            post = findPost(comment)
            user = User.where('uuid = ?', comment.user_uuid).first
            # puts comment.value
            values = comment.value
            new_comment = Comment.new
            puts hash.key?("#{comment.reply_to}_#{comment.group_id}")
            puts hash["#{comment.reply_to}_#{comment.group_id}"]
            new_comment.parent_uuid = hash.key?("#{comment.reply_to}_#{comment.group_id}") ? hash["#{comment.reply_to}_#{comment.group_id}"] : comment.reply_to
            new_comment.upvotes = 1
            new_comment.average_vote = 1
            new_comment.votes = {comment.user_uuid => 1}
            new_comment.body = values.key?("body") ? values["body"] : ''
            new_comment.stripped = values.key?("marked") ? ActionView::Base.full_sanitizer.sanitize(values["marked"]) : '' ## remove all html tags
            new_comment.marked = values.key?("marked") ? ActionController::Base.helpers.sanitize(values["marked"]) : ''
            new_comment.commentable_type = getType(comment.post_type)
            new_comment.commentable_uuid = comment.post_id
            new_comment.url = post.url
            new_comment.title = post.title
            new_comment.post_id = comment.post_id
            #new_comment.notified = comment.reply_to ? false : true
            new_comment.notified = true
            new_comment.uuid = Comment.setUUID
        #  new_comment.admin = user && user.admin ? true : false
        #   new_comment.seller = user && user.seller ? true : false
        #   new_comment.styled = comment.admin || comment.seller || comment.submitter ? true : false
        #   new_comment.submitter = post.submitted_by === user.username ? true : false
            new_comment.category = comment.post_category
            new_comment.subcategory = (comment.post_type === 'apparel' || comment.post_type === 'technology') && comment.post_subcategory ? comment.post_subcategory : nil
            new_comment.post_type = comment.post_type
            new_comment.submitted_by = user.username

            post.comment_count += 1

            new_comment.save && post.save
            PurgecacheWorker.perform_async('comment',new_comment.commentable_uuid,new_comment.post_type)
			PurgecacheWorker.perform_async(post.post_type,post.uuid,post.post_type)
            puts new_comment.as_json
            Bot.where('reply_to = ? AND group_id = ?', comment.reply_id.to_s, comment.group_id).update_all(reply_to:new_comment.uuid)
            if post.post_type === 'music'
                createVoteBot('comments',post.main_genre,nil, new_comment.id,values["votes"],values["average"],values["time"],values["speed"])
            elsif post.post_type === 'apparel' || post.post_type === 'technology'
                createVoteBot('comments',post.main_category,post.sub_category,new_comment.id,values["votes"],values["average"],values["time"],values["speed"])
            else
                createVoteBot('comments',post.main_category,nil,new_comment.id,values["votes"],values["average"],values["time"],values["speed"])
            end
            return [new_comment.uuid]
        rescue => e
            puts "---BEGIN---"
            puts "Error in queue rake inside doComment"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
    end

    def self.doLike(like)
        begin
            post = findPost(like)
            user = User.where('uuid = ?', like.user_uuid).first
            
            post_hash = post.likes
            post_hash[user.uuid] = true
            post.likes = post_hash
            post.likes_count += 1
            
            likes_ip_hash = post.likes_ip
            begin
                random_ip = Array.new(4){rand(256)}.join('.')
                if (likes_ip_hash.key?(random_ip)) 
                    raise "Create new key" 
                end
                rescue
                    retry
            end
            likes_ip_hash[random_ip] = 1
            post.likes_ip = likes_ip_hash
            likes_hash = post.likes
            likes_hash[user.uuid] = true
            post.likes = likes_hash

        # user_hash = user[like.post_type]
        #  user_hash[post.id] = true
        #  puts user_hash
        #  user[post.post_type] = user_hash
            user_liked = true
            post.save && user.save
            PurgecacheWorker.perform_async(post.post_type,post.uuid)
        rescue => e
            puts "---BEGIN---"
            puts "Error in queue rake inside doLike"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
    end

    def self.doRating(rating)
        begin
            post = findPost(rating)
            user = User.where('uuid = ?', rating.user_uuid).first

            ratings_ip_hash = post.ratings_ip
            begin
                random_ip = Array.new(4){rand(256)}.join('.')
                if (ratings_ip_hash.key?(random_ip)) 
                    raise "Create new key"
                end
                rescue
                    retry
            end
            ratings_ip_hash[random_ip] = 1
            post.ratings_ip = ratings_ip_hash

            values = rating.value
            type = rating.post_type
            lyrics = values["lyrics"] && values["lyrics"].to_i > -1 && values["lyrics"].to_i < 101 ? values["lyrics"].to_i : nil
            originality = values["originality"].to_i && values["originality"].to_i > -1 && values["originality"].to_i < 101 ? values["originality"].to_i : nil
            production = values["production"].to_i && values["production"].to_i > -1 && values["production"].to_i < 101 ? values["production"].to_i : nil
            whinyness = values["whinyness"].to_i && values["production"].to_i > -1 && values["production"].to_i < 101 ? values["whinyness"].to_i : nil
            rating = values["simpleRating"].to_i && values["simpleRating"].to_i > -1 && values["simpleRating"].to_i < 101 ? values["simpleRating"].to_i : nil
            if !rating || rating == 0 
                rating = values["advancedRating"].to_i && values["advancedRating"].to_i > -1 && values["advancedRating"].to_i < 101 ? values["advancedRating"].to_i : nil 
            end
            if !rating || rating == 0 
                rating = values["rating"].to_i && values["rating"].to_i > -1 && values["rating"].to_i < 101 ? values["rating"].to_i : nil 
            end
            puts 'rating'
            puts rating
                
        if type === 'music'
            puts 'type music'
                    if values["advancedRating"].to_i != 0
                        puts values["advancedRating"].to_i
                        puts 'in advanced rating'
                         if lyrics
                            post.average_lyrics_rating = ((post.average_lyrics_rating*post.average_lyrics_rating_count)+lyrics)/(post.average_lyrics_rating_count+1)
                            post.average_lyrics_rating_count += 1
                            # post.average_lyrics_rating_variance = (post.average_lyrics_rating_variance ** 2 + (lyrics-post.average_lyrics_rating).abs ** 2) / post.average_lyrics_rating_count
                            # post.average_lyrics_rating_deviation = Math.sqrt(post.average_lyrics_rating_variance)
                        end
                        if production
                            post.average_production_rating = ((post.average_production_rating * post.average_production_rating_count)+production)/(post.average_production_rating_count + 1)
                            post.average_production_rating_count += 1
                            # post.average_production_rating_variance = (post.average_production_rating_variance ** 2 + (production-post.average_production_rating).abs ** 2) / post.average_production_rating_count
                            # post.average_production_rating_deviation = Math.sqrt(post.average_production_rating_variance)
                        end
                        if originality
                            post.average_originality_rating = ((post.average_originality_rating * post.average_originality_rating_count)+originality)/(post.average_originality_rating_count+1)
                            post.average_originality_rating_count += 1
                            # post.average_originality_rating_variance = (post.average_originality_rating_variance ** 2 + (originality - post.average_originality_rating).abs ** 2)/ post.average_originality_rating_count
                            # post.average_originality_rating_deviation = Math.sqrt(post.average_originality_rating_variance)
                        end
                        if rating
                            post.average_advanced_rating = ((post.average_advanced_rating * post.average_advanced_rating_count) + rating) / (post.average_advanced_rating_count + 1)
                            post.average_advanced_rating_count += 1
                            # post.average_advanced_rating_variance = (post.average_advanced_rating_variance ** 2 + (rating- post.average_advanced_rating).abs ** 2)/ post.average_advanced_rating_count
                            # post.average_advanced_rating_deviation = Math.sqrt(post.average_advanced_rating_variance)
                        end
                    end
                    if values["simpleRating"].to_i != 0 && rating
                        puts 'in simple'
                        post.average_simplified_rating = ((post.average_simplified_rating * post.average_simplified_rating_count)+rating) / (post.average_simplified_rating_count + 1)
                        post.average_simplified_rating_count += 1
                        # post.average_simplified_rating_variance = (post.average_simplified_rating_variance ** 2 + (rating- post.average_simplified_rating).abs ** 2)/ post.average_simplified_rating_count
                        # post.average_simplified_rating_deviation = Math.sqrt(post.average_simplified_rating_variance)
                    end
                    if rating
                        puts 'if rating'
                        post.average_rating = ((post.average_rating * post.ratings_count)+rating.to_i)/(post.ratings_count + 1)
                        post.ratings_count += 1
                        # post.average_rating_variance += (post.average_rating_variance ** 2 + (rating-post.average_rating).abs ** 2) / post.ratings_count
                        # post.average_rating_deviation = Math.sqrt(post.average_rating_variance)
                        user.ratings << [rating,type,post.uuid]
                        # user.ratings_songs_ids << post.id
                        user.ratings_songs << rating
                        user.average_rating = ((user.average_rating * user.ratings_count)+rating.to_i)/(user.ratings_count+1)
                        # user.average_rating_songs = ((user.average_rating_songs * user.ratings_songs_count)+rating.to_i)/(user.ratings_songs_count+1)
                        # user.ratings_count += 1
                        # user.ratings_songs_count +=1
                    end
            elsif type === 'apparel' && type === 'technology'
                puts 'in type apparel rating'
                if rating
                    post.average_rating = ((post.average_rating * post.ratings_count) + rating.to_i)/(post.ratings_count + 1)
                    user.ratings << [rating,type,post.uuid]
                    post.ratings_count += 1
                    post.average_rating_variance += (post.average_rating_variance ** 2 + (rating-post.average_rating).abs ** 2) / post.ratings_count
                    post.average_rating_deviation = sqrt.(post.average_rating_variance)
                    if params[:fit]
                        if  post.fit === '{}'  
                            post.fit = {'small'=>0,
                                        'a little small' => 0,
                                        'perfect' => 0,
                                        'a little big' => 0,
                                        'big' => 0
                                        }
                        end 
                        post_fit_hash = post.fit
                        if post_fit_hash.key?(params[:fit].downcase) then post_fit_hash[params[:fit].to_s.downcase] = (post_fit_hash[params[:fit].to_s].to_i + 1) end
                        post.fit_count = post_fit_hash.key?(params[:fit]) ? (post.fit_count + 1) : post.fit_count
                        post.fit = post_fit_hash
                    end
                end
            else 
                puts 'in type else rating'
                if values["simpleRating"].to_i && rating
                    post.average_simplified_rating = ((post.average_simplified_rating + post.average_simplified_rating_count)+rating) / (post.average_simplified_rating_count + 1)
                    post.average_simplified_rating_count += 1
                    # post.average_simplified_rating_variance = (post.average_simplified_rating_variance ** 2 + (rating- post.average_simplified_rating).abs ** 2)/ post.average_simplified_rating_count
                    # post.average_simplified_rating_deviation = Math.sqrt(post.average_simplified_rating_variance)
                end
                if rating
                    post.average_rating = ((post.average_rating * post.ratings_count)+rating.to_i)/(post.ratings_count + 1)
                    post.ratings_count += 1
                    # post.average_rating_variance += (post.average_rating_variance ** 2 + (rating-post.average_rating).abs ** 2) / post.ratings_count
                    # post.average_rating_deviation = Math.sqrt(post.average_rating_variance)
                    user.ratings << [rating,type,post.uuid]
                    user.ratings_songs_ids << post.uuid
                    user.ratings_songs << rating
                    user.average_rating = ((user.average_rating * user.ratings_count)+rating.to_i)/(user.ratings_count+1)
                    user.average_rating_songs = ((user.average_rating_songs * user.ratings_songs_count)+rating.to_i)/(user.ratings_songs_count+1)
                    user.ratings_count += 1
                    user.ratings_songs_count +=1
                end
            end
            ratings_hash = post.ratings
            ratings_hash[user.uuid] = rating
            post.ratings = ratings_hash

            post.save && user.save
            PurgecacheWorker.perform_async(post.post_type,post.uuid)
        rescue => e
            puts "---BEGIN---"
            puts "Error in queue rake inside doRating"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
    end
    
    def self.deviation(index,count,average,deviation)
        # some what random, can definitely be improved on.

        average = average.to_i
        deviation = deviation.to_i
        prng = Random.new
        rating = prng.rand((average-(deviation/2).floor)..(average+(deviation/2).ceil))
        rand1 = prng.rand(0..1)
        mod1 = rand1 ? 3 : 4
        mod2 = rand1 ? 4 : 5
        if index === 0
            rand0 = prng.rand(0..100)
            if rand0 < 15
                rating = 50
            elsif rand0 < 30
                rating = average - (100 - average)
            elsif rand0 < 50
                rating = 100
            else
                # keeping this else, and comment, for readability. It will just return rating from above.
            end
        elsif index % mod1 === 0
            rating = 100
        elsif index % mod2 === 0
            rand2 = prng.rand(0..100)
            if rand2 > 25
                rating = average - (100 - average)
            else
                average = 50
            end
        end
        return rating
    end

    def self.doVote(vote)
        begin
            post = findPost(vote)
            puts vote.user_uuid
            puts post
            user = User.where('uuid = ?', vote.user_uuid).first
            puts vote.value

            votes_ip_hash = post.votes_ip
            begin
                random_ip = Array.new(4){rand(256)}.join('.')
                if (votes_ip_hash.key?(random_ip)) then raise "Create new key" end
                rescue
                    retry
            end
            votes_ip_hash[random_ip] = 1
            post.votes_ip = votes_ip_hash

            values = vote.value
            actual_vote = values["vote"].to_i


            if actual_vote === 1
                post.upvotes +=1
            elsif actual_vote === -1
                post.downvotes +=1
            end

            post.votes[user.uuid] = actual_vote
            # user.votes << [vote,type,post.id]
            post.votes_count += 1
            user.votes_count += 1

            post.average_vote = post.upvotes - post.downvotes
            user.average_vote = ((user.average_vote * user.votes_count) + actual_vote.to_i)/(user.votes_count + 1)

            if post.save && user.save
                puts 'saved'
            else
                puts 'didnt save'
            end
            # I don't think there is reply type (that comes from the bot queue), I just copied it from create comment, but I'll leave it for now.
            post_type = vote.post_type === 'apparel' || vote.post_type === 'technology' ? 'products' : vote.post_type
            if(post.class.to_s === "Comment")
                PurgecacheWorker.perform_async('comment',post.commentable_uuid,post.post_type)
            else
                PurgecacheWorker.perform_async(post_type,id,post.post_type)
            end
            KarmaWorker.perform_async(post_type,post.as_json,actual_vote)
        rescue => e
            puts "---BEGIN---"
            puts "Error in queue rake inside doVote"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
    end

    private

    def self.getType(name)
        puts name
        if name === 'music'
            return 'Song'
        elsif name === 'videos'
            return 'Video'
        elsif name === 'news'
            return 'News_post'
        elsif name === 'apparel'
            return 'Apparel'
        elsif name === 'technology'
            return 'Technology'
        elsif name === 'comments'
            return 'Comment'
        end
    end

    def self.findPost(queue)
        # puts queue.post_type
        if queue.post_type === 'music'
            post = Song.where("uuid = ?", queue.post_id).first
        elsif queue.post_type === 'videos'
            post = Video.where("uuid = ?", queue.post_id).first
        elsif queue.post_type === 'news'
            post = NewsPost.where("uuid = ?", queue.post_id).first
        elsif queue.post_type === 'apparel'
            post = Product.where("uuid = ?", queue.post_id).first
        elsif queue.post_type === 'technology'
            post = Product.where("uuid = ?", queue.post_id).first
        elsif queue.post_type === 'comments'
			post = Comment.where("uuid = ?", queue.post_id).first
		end
    end

    def self.createVoteBot(type_param,category_param,subcategory_param,id_param,count_param,average_param,time_param,speed)
        # puts "type #{type_param}"
        # puts "category #{category_param}"
        # puts "subcategory #{subcategory_param}"
        # puts "id #{id_param}"
        # puts "count #{count_param}"
        # puts "average #{average_param}"
        # puts "time #{time_param}"
        count_param = count_param && count_param != '' ? count_param.to_i : 1
        average_param = average_param && average_param != '' ? average_param.to_i : 1
        time_param = time_param && time_param != '' ? time_param.to_i : 1
        db_type = type(type_param)
        # puts "db_type #{db_type}"
        category = db_type === 'comments' ? 'category' : 'main_category'
        category = db_type === 'songs' ? 'main_genre' : category
        sub_category = db_type === 'comments' ? 'subcategory' : 'sub_category'
        if db_type === 'products'
            # Product model is irrelevant here, it could be a product, song, video, or news_post.
            post = Product.find_by_id(id_param)
        elsif db_type === 'comments'
            post = Comment.find_by_id(id_param.to_s)
        else
            # Product model is irrelevant here, it could be a product, song, video, or news_post.
            sanitized_query = Product.escape_sql(["SELECT p.* FROM #{db_type} p WHERE #{category} = ? AND id = ?", category_param, id_param])
            post = Product.find_by_sql(sanitized_query).first
        end
        # puts post.as_json
        upvotes = ((count_param.to_i - average_param.to_i) / 2) + average_param.to_i
        downvotes = count_param.to_i - upvotes
        # puts 'upvotes'
        # puts upvotes
        # puts 'count param'
        # puts count_param
        # puts 'downvotes'
        # puts downvotes
        chance_of_up = upvotes > downvotes ? ((upvotes.to_f/count_param.to_f) * 100).ceil : ((upvotes.to_f/count_param.to_f) * 100).floor
        # puts chance_of_up
        chance_of_down = 100 - chance_of_up.to_f
        # puts chance_of_down
        weighted_vote = []
        100.times do |i|
            if(chance_of_up > 0)
                vote = 1
                chance_of_up -= 1
            else
                vote = -1
            end
            weighted_vote.push(vote)
        end
        count = count_param.to_i
        users = User.where("human = false").order("RANDOM()").limit(count_param.to_i)
        interval = time_param.to_i * 60 *60
        current_run_time = Time.now
        group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
        count.times do |i|
            bot = Bot.new
            bot.group_id = group
            bot.queue_type = 4
            bot.post_type = db_type != 'comments' ? post.post_type : 'comments'
            if i === 0
                if chance_of_up > chance_of_down
                    check_vote = 1
                elsif chance_of_down > chance_of_up
                    check_vote = -1
                else
                    check_vote = weighted_vote[rand(100)]
                end
            elsif i === 1
                if chance_of_up > 70
                    check_vote = 1
                elsif chance_of_down > 70
                    check_vote = -1
                else
                    check_vote = weighted_vote[rand(100)]
                end
            else
                check_vote = weighted_vote[rand(100)]
            end
            vote = 0
            if (upvotes > 0) && downvotes > 0
                if check_vote === 1
                    upvotes -= 1
                else
                    downvotes -=1
                end
                vote = check_vote
            elsif upvotes > 0 && downvotes === 0
                vote = 1
                upvotes -= 1
            else 
                vote = -1
                downvotes -= 1
            end
            bot.value = {"vote" => vote}
            # puts users[i].username
            bot.user_uuid = users[i].uuid
            # I have no idea why seven hours needs to be taken off.
            bot.run_at = current_run_time + (interval * Bot.logIt(i+1,count,speed))
            bot.post_id = post.uuid
            bot.post_category = db_type != 'comments' && db_type != 'songs' ? post.main_category : nil
            bot.post_category = db_type === 'songs' ? post.main_genre : bot.post_category
            bot.post_subcategory = db_type != 'comments' && subcategory_param && post && post.sub_category ? post.sub_category : nil
            bot.save
        end
    end
end
