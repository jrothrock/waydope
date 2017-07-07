class Api::V1::Admin::Bots::RatingsController < ApplicationController
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
                if params[:simple_count] || params[:advanced_count]
                    simple_count = params[:simple_count].to_i
                    advanced_count = params[:advanced_count].to_i
                    count = simple_count + advanced_count
                    users = User.where("human = false").order("RANDOM()").limit(count.to_i)
                    speed = params[:speed] ? params[:speed] : 'normal'
                    if count === users.length
                        interval = params[:time].to_i * 60 *60
                        current_run_time = Time.now
                        group = Bot.maximum(:group_id) ? Bot.maximum(:group_id).to_i + 1 : 1
                        # fill array with either 1 or two depending on if it is a simple or advanced bot. Then shuffle it.
                        count_array = Array.new(simple_count,1)
                        count_array.fill(2, count_array.size, advanced_count)
                        count_array.shuffle
                        puts' count array'
                        puts count_array
                        puts' count array'
                        # this is done, as sometimes people will be too lazy to actually say whether it has lyrics or not.
                        # or want to troll and say it has lyrics when it doesn't.
                        if params[:lyrics]
                            song_lyrics_chance = rand(72..100)
                        else
                            song_lyrics_chance = rand(0..7)
                        end
                        count.times do |i|
                            bot = Bot.new
                            bot.queue_type = 3
                            bot.group_id = group
                            bot.user_uuid = users[i].uuid
                            bot.post_type = post.post_type
                            bot.run_at = current_run_time + (interval * Bot.logIt(i+1,count,speed))
                            bot.post_id = post.uuid
                            bot.post_category = type != 'songs' ? post.main_category : post.main_genre
                            bot.post_subcategory = params[:subcategory] && post && post.sub_category ? post.sub_category : nil
                            if count_array[i] === 1
                                value = Bot.deviation(i,simple_count,params[:simple],params[:simple_deviation])
                                bot.value = {"simpleRating" => value}
                            else
                                 if params[:lyrics]
                                    has_lyrics = rand(0..100)
                                    if has_lyrics < song_lyrics_chance
                                        Bot.deviation(i,simple_count,params[:originality],params[:advanced_deviation])
                                    else
                                        lyrics_value = nil
                                    end
                                    
                                 else
                                    has_lyrics = rand(0..100)
                                    if has_lyrics < song_lyrics_chance 
                                        troll = rand(0..100)
                                        if troll > 50
                                            lyrics_value=50
                                        else
                                            lyrics_value = params[:lyrics] ? Bot.deviation(i,simple_count,params[:lyrics],params[:advanced_deviation]) : nil
                                        end
                                    end
                                 end
                                 originality_value = params[:originality] ? Bot.deviation(i,simple_count,params[:originality],params[:advanced_deviation]) : nil
                                 production_value = params[:production] ? Bot.deviation(i,simple_count,params[:production],params[:advanced_deviation]) : nil
                                 advanced_rating = (lyrics_value + originality_value + production_value) / 3
                                 bot.value = {"lyrics" => lyrics_value, "originality" => originality_value,"production" => production_value, "advancedRating" => advanced_rating }
                            end
                            bot.save
                        end
                        render json:{}, status: :ok
                    else
                        # again, not the greatest status code.
                        render json:{success:false}, status: :conflict
                    end
                else
                    render json:{message:'needs to include comments params'}, status: :bad_request
                end

            else
                render json:{}, status: :not_found
            end
        else
            render json:{}, status: :forbidden
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
