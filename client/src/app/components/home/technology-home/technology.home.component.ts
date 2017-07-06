import { Component, OnInit, OnChanges, Input, OnDestroy, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {PhotosService} from '../../../services/photos.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {VoteService} from '../../../services/vote.service';
import { Router } from '@angular/router';
import 'angular2-materialize';
declare var $;
declare var Materialize;
declare var CloudZoom;
@Component({
  selector: 'technology-home',
  templateUrl: 'technology.home.component.html',
})

export class TechnologyHomeComponent implements OnChanges {
	@Input() technology:any;
	voteSubscription:any;
	likeSubscription:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	technology_posts:any=[];
	categories:any=['hot','new','featured'];
	height:number;
	width:number;
	math:any=Math; // allows the usage of Math in the view
	zoomedPhoto:any;
	count:any=[];
	currentPosts:any=[];
	currentPage:any=[];
	window:any=window;
	server_url:string;
	ids:any=[];
	current_ids:any=[];
	constructor(private _auth: AuthService, private _voteService: VoteService, private _backend: BackendService, private _http: Http, private _modal: ModalComponent, private _router: Router, private _lb: LightBoxComponent,private _photoService:PhotosService, private _ngZone: NgZone){
		this.server_url = this._backend.SERVER_URL;
		this.voteCheck();
	};
	ngOnChanges(changes:any):void{
	 var technologyChange:any = changes.technology.currentValue;
      if (technologyChange) {
		// need different pointers;
		this.technology_posts = [technologyChange[0],technologyChange[1],technologyChange[2]];
		this.currentPosts = [technologyChange[0],technologyChange[1],technologyChange[2]];
		this.setIds();
        this.count = [];
        this.currentPage = Array(4).fill(0);
        for(let i = 0; i < this.technology_posts.length; i++){
          if(this.count.length <6){
            if(this.technology_posts && this.technology_posts[i] && this.technology_posts[i].length) this.count.push(this.technology_posts[i][0].total_count);
            else this.count.push(0);
          }
        }
		setTimeout(()=>{
			$('#tab-output-technology').addClass('active-home');
		},25)
		setTimeout(()=>{
			this.getImageWidth();
		},200)
      }
	};
	marqueeToggle(type,name,index){
      let textwidth = $(`#technology-title-link-${name}-${index}`).width();
      
      let item = $(`#technology-title-link-${name}-${index}`).parent()
      let parentwidth = item.width();
		let scrolldistance = textwidth - parentwidth;
		let time;
		if(scrolldistance < 50){
			time = 300;
		} else if(scrolldistance < 150){
			time = 1500;
		} else if (scrolldistance < 350){
			time = 2500;
		} else if (scrolldistance < 450){
			time = 3500;
		} else {
			time = 4500;
		}
		item.stop();
		if(type === 1 && (textwidth > parentwidth)){
			item.animate({scrollLeft:scrolldistance},time,'linear');
		} else if (type === 0) {
			item.animate({scrollLeft:0},'medium','swing');
		}
  };
	setVote(vote,id,type,average_vote,voted){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"technology", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
    		if(data.json().success){
				let change;
				if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				else if(vote === 1 && !voted) change = 1;
				else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				else if(vote === -1 && !voted) change = -1;
    			this.voteChange(id,average_vote+change,data.json().user_vote)
				this._voteService.change('technology',id,average_vote+change,data.json().user_vote);
    		}
    		else if(data.json().status === 401){
          		this._modal.setModal('home');
			} else if (data.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(data.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
    	});
    	// upVoteSubscription.unsubscribe();
	}
	setIds(){
		this.ids = [];
		for(let i =0; i < this.technology_posts.length; i++){
			if(this.technology_posts.length && this.technology_posts[i]){
				this.ids.push([]);
				for(let ic= 0; ic < this.technology_posts[i].length; ic++){
					this.ids[i].push(this.technology_posts[i][ic].uuid);
				}
			}
		}
		for(let i  = 0;i< this.currentPosts;i++){
			if(this.currentPosts.length && this.currentPosts[i]){
				this.current_ids.push([]);
				for(let ic= 0; ic < this.currentPosts[i].length; ic++){
					this.current_ids[i].push(this.currentPosts[i][ic].uuid);
				}
			}
		}
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.technology_posts.length; i++){
			if(this.ids[i]){
				
				let index = this.ids[i].indexOf(id);
				if(index > -1){
				this.technology_posts[i][index].average_vote = vote;
				this.technology_posts[i][index].user_voted = user_voted;
				}
			}
		}
		for(let i =0; i < this.currentPosts.length; i++){
			if(this.current_ids[i]){
				
				let current_index = this.current_ids[i].indexOf(id);
				if(current_index > -1){
					this.currentPosts[i][current_index].average_vote = vote;
					this.currentPosts[i][current_index].user_voted = user_voted;
				}
			}
		}
	}
	getImgSize(imgSrc,offset) {
		let newImg = new Image();

		newImg.onload = () => {
			this.height = newImg.height;
			this.width = newImg.width;
				$('#main-photo-technology-container').append(`
					<div id='zoomed-main-photo-technology' class='zoomed-photo' style='position:absolute;left:800px; top:${offset-100}px;background: url("${imgSrc}") no-repeat;height:${this.height}px; width:${this.width}px;z-index:99;background-size:100%'></div> 
				`)
		}
		newImg.src = imgSrc; // this must be done AFTER setting onload
	}
	getPosts(index,category){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('Type', 'technology');
		headers.append('offset', (this.currentPage[index] * 4 + 4).toString());
		headers.append('category', category);
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/home/paginate`, {headers:headers}).subscribe(data => {
			if(data.json().success){
				this.technology_posts[index] = this.technology_posts[index].concat(data.json().posts);
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.technology_posts[index].slice(this.currentPage[index] * 3, this.currentPage[index] * 3 + 3)
				this.setIds();
			}
		});
	}
	paginate(type,index){
		if(type === 'next'){
			if(((this.currentPage[index] * 4 + 4)  === this.technology_posts[index].length) && (this.technology_posts[index].length < this.count[index])){
				this.getPosts(index,this.categories[index]);
			} else {
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.technology_posts[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
			}
		} else {
			if(this.currentPage[index] > 0){
				this.currentPage[index] -= 1;
				this.currentPosts[index] = this.technology_posts[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
			}
		}
	}
	photoZoom(category,id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
			let position = window.outerWidth < 768 ? 'inside' : 4;
            let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'};  
			if(id === 3) options = {zoomPosition:13,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
			this._ngZone.runOutsideAngular(() => {
              this.zoomedPhoto = new CloudZoom($(`#main-photo-technology-${category}-${id}`),options);
              let self = this;
              $(`#main-photo-technology-${category}-${id}`).bind('cloudzoom_end_zoom', function(){
                self.zoomedPhoto.destroy();
                $(this).unbind();
              })
        	});
            // this.zoomedPhoto = new CloudZoom($(`#main-photo-technology-${category}-${id}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
	getImageWidth(){
		let container_width = $(`#main-photo-technology-container-${this.categories[0]}-0`).width()
		let container_height = $(`#main-photo-technology-container-${this.categories[0]}-0`).height()
		for(let i = 0; i < this.technology_posts.length;i++){
			if(this.technology_posts && this.technology_posts[i]){
				let category = this.categories[i];
				for(let id = 0;id < this.technology_posts[i].length;id++){
				// 	let image_object = new Image();
				// 	image_object.src = $(`#main-photo-technology-${category}-${id}`).attr("src");
				// 	let native_width = image_object.width;
				// 	let native_height = image_object.height;
				// 	if(native_height > native_width && native_height > container_height){
				// 		let multiplier = container_height / native_height
				// 		let new_width = native_width * multiplier;
				// 		$(`#main-photo-technology-${category}-${id}`).height(container_height).width(new_width)
				// 	} else if (native_height > native_width && native_height <= container_height) {
				// 		$(`#main-photo-technology-${category}-${id}`).height(native_height).width(native_width)
				// 	} else if (native_width > native_height && native_width > container_width){
				// 		let multiplier = container_width / native_width;
				// 		let new_height = (native_height * multiplier);
				// 		let width = new_height > container_height ? ((container_height/new_height)*container_width) : container_width;
				// 		let height = new_height > container_height ? container_height : new_height;
				// 		$(`#main-photo-technology-${category}-${id}`).height(height).width(width);
				// 	} else if(native_height === native_width && native_height > container_height) {
				// 		$(`#main-photo-technology-${category}-${id}`).height(container_width).width(container_height)
				// 	} else {
						$(`#main-photo-technology-${category}-${id}`).height('100%').width('100%')
				// 	}
					$(`#main-photo-technology-${category}-${id}`).css({'display':'block'});
				}
			}
		}
    }
	getRestImageWidth(){
		for(let i = 0; i < this.technology_posts.length;i++){
			if(this.technology_posts && this.technology_posts[i]){
				let category = this.categories[i];
				for(let id = 0;id < this.technology_posts[i].length;id++){
					if(this.technology_posts[i][id].photos){
						for(let ic = 0;ic < this.technology_posts[i][id].photos.length;ic++ ){
							// 
							// let image_object = new Image();
							// image_object.src = $(`#rest-photos-technology-${category}-${id}-${ic}`).attr("src");
							// let native_width = image_object.width;
							// let native_height = image_object.height;
							// if(native_height > native_width && native_height > 50){
							// 	let multiplier = 50 / native_height
							// 	let new_width = native_width * multiplier;
							// 	$(`#rest-photos-technology-${category}-${id}-${ic}`).height(50).width(new_width)
							// } else if (native_height > native_width && native_height <= 50) {
							// 	$(`#rest-photos-technology-${category}-${id}-${ic}`).height(native_height).width(native_width)
							// } else if (native_width > native_height && native_width > 75){
							// 	let multiplier = 75 / native_width;
							// 	let new_height = native_height * multiplier;
							// 	$(`#rest-photos-technology-${category}-${id}-${ic}`).height(new_height).width(115);
							// 	$('')
							// } else {
							// 	$(`#rest-photos-technology-${category}-${id}-${ic}`).height(native_height).width(native_width)
							// }
								$(`#rest-photos-technology-${category}-${id}-${ic}`).height("100%").width("100%");
							$(`#rest-photos-technology-${category}-${id}-${ic}`).css({'display':'initial'});
						}
					}
				}
			}
		}
	}
	like(id, liked, type, value, category, parentIndex, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
		this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      if(data.json().success){
	      	let post = this.technology_posts[parentIndex][index]
	        if(data.json().success && !liked){
	            $(`#${category}-icon-likes-${id}`).addClass(' liked-icon fa-heart');
	            $(`#${category}-icon-likes-${id}`).removeClass('fa-heart-o');
	            $(`#${category}-likes-button-${id}`).addClass(' liked');
	            $(`#${category}-likes-${id}`).html(`${value + 1}`);
	            post.likes_count = post.likes_count + 1;
	            post.user_liked = !post.user_liked;
	        }
	        if(data.json().success && liked){
	            $(`#${category}-icon-likes-${id}`).addClass('fa-heart-o');
	            $(`#${category}-icon-likes-${id}`).removeClass('liked-icon fa-heart');
	            $(`#${category}-likes-button-${id}`).removeClass('liked');
	            $(`#${category}-likes-${id}`).html(`${value - 1}`);
	            post.likes_count = post.likes_count - 1;
	            post.user_liked = !post.user_liked;
	        }

	      }
	      else if(data.json().status === 401){
	          this._modal.setModal('apparel');
	      } else if (data.json().locked){
			  Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
		  } else if(data.json().archived){
			  Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
		  }
	    });
	}
	changePhoto(category,parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-technology-${category}-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-technology-${category}-${parentIndex}-${photoIndex}`);
		/////test
		let src = $(newactive).attr('src');
		$(`#main-photo-technology-${category}-${parentIndex}`).attr('src', src);
		$(oldactive).removeClass('active-photo');
		$(newactive).addClass('active-photo');
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	ngOnDestroy(){
		if(this.zoomedPhoto) this.zoomedPhoto.destroy();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
	}
}
