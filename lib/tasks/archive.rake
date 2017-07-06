namespace :archive do
    desc "archive posts that are older than 6 months old"
	task :generate => :environment do
        begin
            where_debugging = "posts"
            posts = Post.where('created_at =< ? AND archived = false', 6.months.ago).each do |post|
                comments = Comment.where('commentable_id = ? AND post_type = ?', post.id, post.post_type).update_all(:archived => true)
                post.archived = true
                post.save
            end

            where_debugging = "songs"
            songs = Song.where('created_at =< ? AND archived = false', 6.months.ago).each do |post|
                comments = Comment.where('commentable_id = ? AND post_type = ?', post.id, post.post_type).update_all(:archived => true)
                post.archived = true
                post.save
            end

            where_debugging = "videos"
            videos = Video.where('created_at =< ? AND archived = false', 6.months.ago).each do |post|
                comments = Comment.where('commentable_id = ? AND post_type = ?', post.id, post.post_type).update_all(:archived => true)
                post.archived = true
                post.save
            end

            where_debugging = "products"
            products = Product.where('created_at =< ? AND archived = false', 6.months.ago).each do |post|
                comments = Comment.where('commentable_id = ? AND post_type = ?', post.id, post.post_type).update_all(:archived => true)
                post.archived = true
                post.save
            end
        rescue => e
            puts "---BEGIN---"
            puts "Error in archive rake for #{where_debugging}"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
	end
end