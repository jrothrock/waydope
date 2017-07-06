class ActiveRecord::Base
	def self.escape_sql(obj)
		self.send(:sanitize_sql_array, obj)
	end
end
