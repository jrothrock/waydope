class Api::V1::Photos::PhotosController < ApplicationController

    def create
        if request.headers["Authorization"]
			auth = request.headers["Authorization"]
		elsif params[:authorization]
			auth = params[:authorization]
		else
			render json: {status:401, success:false, message:'Need to include authorization header or params.'}
			return false
		end
        user = auth ? User.find_by_token(auth.split(' ').last) : nil
        if user
            Product.transaction do
                product = params[:id] ? ::Product.where("uuid = ?", params[:id]).first : nil
                if product
                    #product.lock!
                    puts product.post_type.capitalize
                    if product.photos.length < 4
                        photo = product.photos.create!(:photo => params[:file], :photoable_id => product.id, :user_uuid => user.uuid, :uuid => Photo.setUUID, :created_at=>Time.now, :updated_at =>Time.now)
                        if product.sorted
                            product.sorting << photo.uuid.to_s
                        end
                        begin 
                            if product.save
                                render json:{status:200,success:true,photos:product.photos.map{|photo| photo.as_json.except("id")}}
                            end
                            rescue ActiveRecord::StaleObjectError
                                render json:{status:409, success:false, message:'Stale Object error, this record has most likely been updated recently.'} 
                        end
                    else
                        render json:{status:422, success:false, message:'More than 4 photos have been uploaded.'}
                    end
                else
                    render json:{status:404, success:false, message:'No record found'}
                end
            end  
        else 
            render json:{status:401, success:false, message: "No user was found with that token."}
        end
    end

    def delete
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            photo = Photo.where("uuid = ?", params[:photo]).includes(:photoable).first
            product = photo.photoable
            if product && photo
                if product.user_id === user.id && photo.user_uuid === user.uuid
                    ### these lines need to be removed after moving to production
                    index = product.photos.find_index{|pho| pho.uuid === photo.uuid}
                    if index != nil
                        fd = File.dirname(product.photos[index].photo.url)
                        directory = "public" + fd
                        FileUtils.rm_rf(directory)
                        upload_ids = product.upload_urls.map {|url| url.split('photo')[2].split('/')[4]}
                        index = upload_ids.index(photo.uuid.to_s)
                        puts index
                        product.upload_artwork_url_nsfw_ids = product.upload_artwork_url_nsfw_ids - [params[:photo]]
                        if index != nil then ProductphotodeleteWorker.perform_async(product.upload_urls[index]) end
                        if index != nil && product.sorting && !!product.sorting[index] then product.sorting.delete_at(index) end
                        if product.nsfw && nsfw_index then product.upload_urls_nsfw.delete_at(index) end
                        if index != nil && product.upload_urls && !!product.upload_urls[index] then product.upload_urls.delete_at(index) end
                        if product.photos.delete(photo) && product.save
                            render json:{status:204, success:true}
                        else
                            render json:{status:500, success:false}
                        end
                    else
                        render json:{status:404, success:false, message:"photo does not belong to that product."}
                    end
                else
                    render json:{status:401, success:false, message:"this user doesn't have access to those."}
                end
            else
                render json:{status:404, success:false, message:"The product and/or photo ID's are incorrect"}
            end
        else
            render json:{status:401, success:false, message:'no user found'}
        end
    end
    
end
