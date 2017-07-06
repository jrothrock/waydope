namespace :queue do
desc "loop through queue"
	task :generate => :environment do
        begin
            if(!Bot.where(:in_queue=>true).exists?)
                where_debugging = "database"
                Bot.where(:run_at => 5.minutes.ago..2.minutes.from_now).update_all(:in_queue=>true)
                queue = Bot.where("in_queue = true").order("id ASC")
                # the queue hash is used due to the update_all in the doComment not affecting stuff already queuried into the queue variable
                # the queue hash will hold the comment id of the job, so the other jobs can set their parent id to it.
                # Ex: this is only necessary when a parent and child have been pulled at the same time. The child needs to know the parents Id which gets stored in the hash.
                queue_hash={}
                queue.each do |job|
                    puts 'job'
                    puts job.as_json
                    puts 'job'
                    case job.queue_type
                        when 1
                        where_debugging = "comment"
                        id = Bot.doComment(job,queue_hash)
                        queue_hash["#{job.reply_id}_#{job.group_id}"] = id[0]
                        when 2
                            where_debugging = "like"
                            Bot.doLike(job)
                        when 3
                            where_debugging = "rating"
                            Bot.doRating(job)
                        when 4
                            where_debugging = "vote"
                            Bot.doVote(job)
                    end
                    job.delete
                end
            end
        rescue => e
            puts "---BEGIN---"
            puts "Error in queue rake for #{where_debugging}"
            puts "Time: #{Time.now}"
            puts e
            puts e.backtrace
            puts "---END---"
            if queue
                queue.update_all(in_queue:false)
            end
        end
	end
end