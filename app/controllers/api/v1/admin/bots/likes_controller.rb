class Api::V1::Admin::Bots::LikesController < ApplicationController
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
                if post.post_type != 'news'
                    if params[:count]
                        count = params[:count].to_i
                        users = User.where("human = false").order("RANDOM()").limit(params[:count])
                        if users.length === count
                            interval = params[:time].to_i * 60 *60
                            current_run_time = Time.now
                            group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                            speed = params[:speed] ? params[:speed] : 'normal'
                            count.times do |i|
                                bot = Bot.new
                                bot.queue_type = 2
                                bot.group_id = group
                                bot.post_type = post.post_type
                                bot.value = {'like' => 1}
                                bot.user_uuid = users[i].uuid
                                bot.run_at = current_run_time + (interval * Bot.logIt(i+1,count,speed))
                                bot.post_id = post.uuid
                                bot.post_category = type != 'songs' ? post.main_category : post.main_genre
                                bot.post_subcategory = post && (type === 'technology' || type === 'apparel') ? post.sub_category : nil
                                bot.save
                            end

                            render json:{status:200, success:true}
                        else
                            render json:{status:409, success:false, users:true}
                        end
                    else
                        render json:{status:415, success:false, message:'needs to include count param - for likes'}
                    end
                else
                    render json:{status:400, success:false, message:"post can't be news"}
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
