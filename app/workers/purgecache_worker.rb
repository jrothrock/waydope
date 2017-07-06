class PurgecacheWorker
    include Sidekiq::Worker
    def perform(type,id,comment_type=nil)
        puts 'in comment purge'
        puts type
        puts id
        puts comment_type
       App.purge_cache(type,id,comment_type)
    end
end
