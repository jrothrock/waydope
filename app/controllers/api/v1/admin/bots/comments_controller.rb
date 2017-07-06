# this is for post comments, sent from the bots admin backend.
class Api::V1::Admin::Bots::CommentsController < ApplicationController
    def create
        user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            type = Bot.type(params[:type])
            category = type != 'songs' ? 'main_category' : 'main_genre'
            if params[:subcategory]
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE main_category = ? AND sub_category = ? AND uuid = ?",params[:category], params[:subcategory], params[:id]]) 
		        post = Product.find_by_sql(sanitized_query).first
            else
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE #{category} = ? AND uuid = ?",params[:category], params[:id]])
		        post = Product.find_by_sql(sanitized_query).first
            end
            
            if post 
                if params[:comments]
                    if params[:female_count].to_i > 0
                        males = User.where("human = false").order("RANDOM()").limit(params[:count].to_i - params[:female_count].to_i)
                        females = User.where("human = false AND gender = 'female'").order("RANDOM()").limit(params[:female_count].to_i)
                        users = males.concat(females)
                    else 
                        users = User.where("human = false").order("RANDOM()").limit(params[:count].to_i)
                    end
                    if users.length === params[:count].to_i
                        comments = params[:comments].as_json
                        interval = params[:replies_time].to_f * 60.0 * 60.0

                        current_run_time = Time.current
                        group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                        users_hash = {}
                        speed = params[:speed] ? params[:speed] : 'normal'
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
                                    user_value = users_hash[value["user"].to_s] 
                                end
                            end
                            bot.user_uuid = user_value ? user_value : users[index].uuid
                            users_hash[key.to_s] = bot.user_uuid
                            bot.reply_to = value["reply_to"] != ''? value["reply_to"] : nil 
                            bot.value = {"marked" => value["marked"], "body"=>value["body"], "votes"=>value["votes"], "average"=>value["average"], "time"=>value["time"]}
                            bot.run_at = interval ? current_run_time + (interval.to_f * Bot.logIt(index+1,params[:count],speed)) : Time.now + 60
                            bot.post_id = post.uuid
                            bot.post_category = type != 'songs' ? post.main_category : post.main_genre
                            bot.post_subcategory = params[:subcategory] && post && post.sub_category ? post.sub_category : nil
                            bot.save
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
