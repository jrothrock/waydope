class BoardsChannel < ActionCable::Channel::Base
  	def subscribed
  		stop_all_streams
  		stream_from 'boards'
  		@subscribed = true
  	end
  	 def receive(data)
    	ActionCable.server.broadcast "boards", data
  	end
  	def unsubscribed
    # Any cleanup needed when channel is unsubscribed
   	    stop_all_streams
   	    @subscribed = false
  	end

  	def start
	    @run = true
	    tick
	end

	def stop
	  @run = false
	end

	def tick
	  loop do
	    logger.info ">>> Tick!"
	    broadcast(random_number: rand(1..100))
	    sleep 1
	    break unless @subscribed && @run
	  end
	end

	def tock(data)
	  logger.info ">>> Tock! #{data}"
	end

	private

	def broadcast(data)
	  ActionCable.server.broadcast "boards", data
	end
end
