# this is for an individual comment, sent from the comments admin modal.
class Api::V1::Admin::Bots::CommentController < ApplicationController
    def create
        user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            type = Bot.type(params[:type])
            category = type != 'songs' ? 'main_category' : 'main_genre'
            if params[:subcategory]
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE post_type = ? AND main_category = ? AND sub_category = ? AND uuid = ?",params[:type], params[:category], params[:subcategory], params[:post]]) 
		        post = Product.find_by_sql(sanitized_query).first
            else
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE #{category} = ? AND uuid = ?",params[:category], params[:post]])
		        post = Product.find_by_sql(sanitized_query).first
            end

            comment = Comment.where("uuid = ?", params[:comment]).first

            if post 
                if params[:votes].to_i > 0
                    votes_happened = true
                    upvotes = ((params[:votes].to_i - params[:average].to_i) / 2) + params[:average].to_i
                    downvotes = params[:votes].to_i - upvotes
                    chance_of_up = ((upvotes.to_f/params[:votes].to_f) * 100).round
                    puts chance_of_up
                    chance_of_down = 100 - chance_of_up
                    puts chance_of_down
                    weighted_vote = []
                    100.times do |i|
                        if(chance_of_up > i)
                            vote = 1
                        else
                            vote = -1
                        end
                        weighted_vote.push(vote)
                    end
                    count = params[:votes].to_i
                    users = User.where("human = false").order("RANDOM()").limit(params[:votes].to_i)
                    if users.length === params[:votes].to_i
                        interval = params[:time].to_f * 60.0 *60.0
                        current_run_time = Time.now
                        group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                        speed = params[:replies_time_type] ? params[:replies_time_type] : 'normal'
                        count.times do |i|
                            bot = Bot.new
                            bot.group_id = group
                            bot.queue_type = 4
                            bot.post_type = 'comments'
                            if i === 0
                                if chance_of_up > chance_of_down
                                    check_vote = 1
                                elsif chance_of_down > chance_of_up
                                    check_vote = -1
                                else
                                    check_vote = weighted_vote[rand(weighted_vote.length)]
                                end
                            elsif i === 1
                                if chance_of_up > 70
                                    check_vote = 1
                                elsif chance_of_down > 70
                                    check_vote = -1
                                else
                                    check_vote = weighted_vote[rand(weighted_vote.length)]
                                end
                            else
                                check_vote = weighted_vote[rand(weighted_vote.length)]
                            end
                            vote = 0
                            if upvotes > 0 && downvotes > 0
                                if check_vote === 1
                                    upvotes -= 1
                                    weighted_vote.shift
                                else
                                    downvotes -=1
                                    weighted_vote.pop
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
                            bot.user_uuid = users[i].uuid
                            # I have no idea why seven hours needs to be taken off.
                            bot.run_at = current_run_time + (interval.to_f * Bot.logIt(i+1,count,speed).to_f)
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
                end
                puts params[:comments].as_json
                if (params[:count].to_i > 0 && params[:comments].length > 0) || votes_happened
                    if (params[:count].to_i > 0 && params[:comments].length > 0)
                        if params[:female_count].to_i > 0
                            males = User.where("human = false").order("RANDOM()").limit(params[:count].to_i - params[:female_count].to_i)
                            females = User.where("human = false AND gender = 'female'").order("RANDOM()").limit(params[:female_count].to_i)
                            users = males.concat(females)
                        else 
                            users = User.where("human = false").order("RANDOM()").limit(params[:count].to_i)
                        end
                        if users.length === params[:count].to_i
                            comments = params[:comments].as_json
                            interval = params[:replies_time].to_f ? params[:replies_time].to_i * 60 * 60 : 0

                            current_run_time = Time.current
                            group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                            users_hash = {}
                            speed = params[:speed] ? params[:speed] : "normal"
                            comments.each_with_index do |(key,value),index|
                                bot = Bot.new
                                bot.queue_type = 1
                                bot.group_id = group
                                bot.reply_id = key.to_s
                                bot.post_type = post.post_type
                                if value["user"] && value["user"] != ''
                                    if !(value["user"]=~ /\d/) && /\A\d+\z/.match(value["user"])
                                        user = User.where("username = ? AND (human = false OR ?)", value["user"], value["user"].downcase === user.username.downcase).first
                                        user_value = user ? user.uuid : nil
                                    else
                                        user_value = users_hash[value["user"]] 
                                    end
                                end
                                bot.user_uuid = user_value ? user_value : users[index].uuid
                                users_hash[key] = bot.user_uuid
                                bot.reply_to = value["reply_to"] != '' ? value["reply_to"] : params[:comment].to_s
                                bot.value = {"marked" => value["marked"], "body"=>value["body"], "votes"=>value["votes"], "average"=>value["average"], "time"=>value["time"], "speed"=>value["speed"]}
                                bot.run_at = interval ? current_run_time + (interval * Bot.logIt(index+1,params[:count],speed)) : (Time.now + 60)
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
                        render json:{status:200, success:true}
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
