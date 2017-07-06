module Json
  class Builder
    
    def self.build(query="", user=nil,mobile=false)
      start_time = Time.now
      @user = user
      @max= mobile ? 6 : 9
      # puts @user.to_s + ' this is the user.uuid for the @user'
      result = {:comments => []}
      @comments = Comment.find_by_sql(query)
      ActiveRecord::Associations::Preloader.new.preload(@comments, :replies)
      @comments.each_with_index do |comment,index|
        comment = commentActions(comment)
        result[:comments] << build_inner_json(comment,index)
        # puts comment.time_ago
      end
      end_time = Time.now
      elapsed_time = end_time - start_time
      # puts 'elapsed time in seconds'
      # puts elapsed_time
      result
    end

    def self.build_inner_json(comment,index)
      temp = comment.as_json.merge!(:children => [], :user_voted => nil)
      sortedcomments = comment.replies.select{|reply| reply.hidden == false}.sort_by {|c| c.average_vote}
      sortedcomments.reverse.each_with_index do |reply,i|
        newreply = recurse(temp[:children],reply,i,2)
        temp[:children] << newreply
      end
      temp
    end

    def self.recurse(chain, comment, index,generation)
      comment = commentActions(comment)
      if generation < @max
        thechillin = comment.as_json.merge!(:children => [], :user_voted => nil)
         sorted = comment.replies.select{|reply| reply.hidden == false}.sort_by {|c| c.average_vote}
         sorted.reverse.each_with_index do |child, i|
            thechillin[:children] << recurse(sorted, child, i,generation+1)
         end
      else
        thechillin = comment.as_json.merge!(:children => [], :user_voted => nil, load_more:true)
      end
      thechillin
    end

    # def self.count(comment)
    #   puts 'in count'
    #   replies = comment.replies
    #   if replies
    #     count = replies.length
    #     replies.each do |reply|
    #       count += count(reply)
    #     end
    #     count
    #   else
    #     return 0
    #   end 
    # end

    def self.commentActions(comment)
      comment.time_ago = time_ago_in_words(comment.created_at).gsub('about ','') + ' ago'
      if comment.removed || comment.deleted || comment.hidden
          comment.submitted_by = nil
          comment.created_at = nil
          comment.time_ago = nil
          comment.admin = nil
          comment.seller = nil
          comment.submitter = nil
        end
      return comment
    end

    def self.user_voted(comment)
      comment_votes_hash = comment.votes
      value_return = comment_votes_hash.key?(@user) ? comment_votes_hash[@user] : nil
    end

  end
end
