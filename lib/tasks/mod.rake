namespace :mod do
    desc "archive posts that are older than 6 months old"
	task :generate => :environment do
        begin
            where_debugging = "database"
            comments = Comment.where('created_at =< ? AND archived = false', 5.minutes.ago).each do |comment|

            where_debugging = "santize"
            sanitized = Comment.santize(comment.body)
            if(!sanitized)
                comment.body = '[Removed]'
                comment.marked = '[Removed]'
                comment.stripped = '[Removed]'
                comment.removed = true
                comment.save
                Comment.createMod(comment.post_id, comment.id, comment.commentable_id, comment.commentable_type, comment.url, comment.title, comment.category, comment.subcategory, comment.post_type)
                end
            end
        rescue => e
            puts "---BEGIN---"
            puts "Error in mod rake for #{where_debugging}"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
        end
	end
end