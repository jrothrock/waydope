# this is for an individual comment, sent from the comments admin modal.
class Api::V1::Admin::Bots::PostController < ApplicationController
    def create
        user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            type = Bot.type(params[:type])
            category = type != 'songs' ? 'main_category' : 'main_genre'
            if params[:subcategory]
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE main_category = ? AND sub_category = ? AND uuid = ?",params[:category], params[:subcategory], params[:post]]) 
		        post = Product.find_by_sql(sanitized_query).first
            else
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE #{category} = ? AND uuid = ?",params[:category], params[:post]])
		        post = Product.find_by_sql(sanitized_query).first
            end

            comment = Comment.where("uuid = ?", params[:comment]).first
            if params[:votes].to_i > 0
                upvotes = ((params[:votes].to_i - params[:average].to_i) / 2) + params[:average].to_i
                downvotes = params[:votes].to_i - upvotes
                chance_of_up = ((upvotes.to_f/params[:votes].to_f) * 100).round
                puts chance_of_up
                chance_of_down = 100 - chance_of_up
                puts chance_of_down
                weighted_vote = []
                100.times do |i|
                    if(chance_of_up > 0)
                        vote = 1
                        chance_of_up -= 1
                    else
                        vote = 0
                    end
                    weighted_vote.push(vote)
                end
                count = params[:votes] && params[:votes].to_i
                users = User.where("human = false").order("RANDOM()").limit(params[:votes].to_i)
                if users.length === params[:votes].to_i
                    interval = params[:time].to_i * 60 *60
                    current_run_time = Time.now
                    group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                    count.times do |i|
                        bot = Bot.new
                        bot.group_id = group
                        bot.queue_type = 4
                        bot.post_type = 'comments'
                        check_vote = weighted_vote[rand(100)]
                        vote = 0
                        if (upvotes - check_vote.to_i) > 0
                            vote = check_vote
                            upvotes -= check_vote.to_i
                        else
                            vote = 0
                        end
                        bot.value = {"vote" => vote}
                        puts users[i].username
                        bot.user_uuid = users[i].uuid
                        # I have no idea why seven hours needs to be taken off.
                        bot.run_at = current_run_time + (interval * Bot.logIt(i+1,count))
                        bot.post_id = comment.uuid
                        bot.post_category = nil
                        bot.post_subcategory =  nil
                        bot.save
                    end
                else
                ## not sure on the correct status, could be a 400.
                    render json:{status:409,users:true,success:false}
                    return false
                end
            else
                render json:{status:400, success:false, message:'needs to include vote params'}
                return false
            end
            if post 
                puts params[:comments].as_json
                if params[:count].to_i > 0 && params[:comments].length > 0
                    if params[:female_count].to_i > 0
                        males = User.where("human = false").order("RANDOM()").limit(params[:count].to_i - params[:female_count].to_i)
                        females = User.where("human = false AND gender = 'female'").order("RANDOM()").limit(params[:female_count].to_i)
                        users = males.concat(females)
                    else 
                        users = User.where("human = false").order("RANDOM()").limit(params[:count].to_i)
                    end
                    if users.length === params[:count].to_i
                        comments = params[:comments].as_json
                        interval = params[:replies_time].to_i ? params[:replies_time].to_i * 60 * 60 : 0

                        current_run_time = Time.current
                        group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                        users_hash = {}
                        comments.each_with_index do |(key,value),index|
                            bot = Bot.new
                            bot.queue_type = 1
                            bot.group_id = group
                            bot.reply_id = key
                            bot.post_type = post.post_type
                            bot.user_uuid = value["user"] != '' ? users_hash[value["user"]] : users[index].uuid
                            users_hash[key] = bot.user_uuid
                            bot.reply_to = value["reply_to"] != '' ? value["reply_to"] : comment.id
                            bot.value = {"marked" => value["marked"], "body"=>value["body"], "votes"=>value["votes"], "average"=>value["average"], "time"=>value["time"]}
                            bot.run_at = interval ? current_run_time + (interval * Bot.logIt(index+1,params[:count])) : (Time.now + 60)
                            puts 'time difference'
                            puts bot.run_at - Time.now
                            bot.post_id = post.uuid
                            bot.post_category = type != 'songs' ? post.main_category : post.main_genre
                            bot.post_subcategory = params[:subcategory] && post && post.sub_category ? post.sub_category : nil
                            bot.save
                            puts bot.as_json
                        end

                        render json:{status:200, success:true}
                    else 
                        render json:{status:409,success:false,users:true}
                    end
                else
                    render json:{status:400, success:false, message:'needs to include comments params'}
                end

            else
                render json:{status:404, success:false}
            end
        else
            render json:{status:403, success:false}
        end
    end
end
