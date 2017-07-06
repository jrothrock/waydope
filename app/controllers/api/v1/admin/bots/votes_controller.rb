class Api::V1::Admin::Bots::VotesController < ApplicationController
    def create
        user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            type = Bot.type(params[:type])
            category = type === 'comments' ? 'category' : 'main_category'
            category = type === 'songs' ? 'main_genre' : category
            sub_category = type === 'comments' ? 'subcategory' : 'sub_category'
            if params[:subcategory]
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE #{category} = ? AND #{sub_category} = ? AND uuid = ?",params[:category], params[:subcategory], params[:id]]) 
		        post = Product.find_by_sql(sanitized_query).first
            else
                # Product model is irrelevant here, it could be a product, song, video, or news_post.
                sanitized_query = Product.escape_sql(["SELECT p.* FROM #{type} p WHERE #{category} = ? AND uuid = ?", params[:category], params[:id]])
		        post = Product.find_by_sql(sanitized_query).first
            end
            if post 
                if params[:count]
    
                    upvotes = ((params[:count].to_i - params[:average].to_i) / 2) + params[:average].to_i
                    downvotes = params[:count].to_i - upvotes
                    chance_of_up = ((upvotes.to_f/params[:count].to_f) * 100).round
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
                    count = params[:count].to_i
                    users = User.where("human = false").order("RANDOM()").limit(params[:count].to_i)
                    speed = params[:speed] ? params[:speed] : 'normal'
                    if users.length === params[:count].to_i
                        interval = params[:time].to_i * 60 * 60
                        current_run_time = Time.now
                        group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                        count.times do |i|
                            bot = Bot.new
                            bot.group_id = group
                            bot.queue_type = 4
                            bot.post_type = type != 'comments' ? post.post_type : 'comments'
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
                            puts users[i].username
                            bot.user_uuid = users[i].uuid
                            # I have no idea why seven hours needs to be taken off.
                            bot.run_at = current_run_time + (interval * Bot.logIt(i+1,count,speed))
                            bot.post_id = post.uuid
                            bot.post_category = type != 'comments' && type != 'songs' ? post.main_category : nil
                            bot.post_category = type === 'songs' ? post.main_genre : bot.post_category
                            bot.post_subcategory = type != 'comments' && params[:subcategory] && post && post.sub_category ? post.sub_category : nil
                            bot.save
                        end
                        render json:{status:200, success:true}
                    else
                    ## not sure on the correct status, could be a 400.
                        render json:{status:409,users:true,success:false}
                    end
                else
                    render json:{status:400, success:false, message:'needs to include vote params'}
                end

            else
                render json:{status:404, success:false}
            end
        else
            render json:{status:403, success:false}
        end
    end
end

# create_table "bot_queue", force: :cascade do |t|
#     t.integer  "queue_type",       default: 1,  null: false
#     t.string   "post_type",        default: "", null: false
#     t.string   "value_string"
#     t.boolean  "value_boolean"
#     t.integer  "value_integer"
#     t.integer  "user_uuid"
#     t.datetime "run_at"
#     t.integer  "reply_to"
#     t.string   "marked_comment"
#     t.integer  "post_id",                       null: false
#     t.string   "post_category",    default: "", null: false
#     t.string   "post_subcategory", default: "", null: false
#   end
