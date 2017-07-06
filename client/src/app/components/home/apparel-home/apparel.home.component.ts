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
  selector: 'apparel-home',
  templateUrl: 'apparel.home.component.html'
})

export class ApparelHomeComponent implements OnChanges {
	@Input() apparel:any;
	voteSubscription:any;
	likeSubscription:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	apparel_posts:any=[];
	count:any=[];
	currentPosts:any=[];
	currentPage:any=[];
	categories:any=['hot','new','featured'];
	loaded:boolean=false;
	height:number;
	width:number;
	math:any=Math; // allows the usage of Math in the view
	zoomedPhoto:any;
	window:any=window;
	server_url:string;
	ids:any=[];
	current_ids:any=[];
	constructor(private _auth: AuthService, private _voteService : VoteService, private _backend: BackendService, private _http: Http, private _modal: ModalComponent, private _router: Router, private _lb: LightBoxComponent,private _photoService:PhotosService, private _ngZone: NgZone){
		this._ngZone.runOutsideAngular(() => {
      		requestAnimationFrame(() => {
      		});
		});
		this.voteCheck();
	};
	ngOnChanges(changes:any):void {
	  this.server_url = this._backend.SERVER_URL;
      let apparelChange = changes.apparel.currentValue;
      if (apparelChange) {
		// stupid pointers...
		this.apparel_posts = [apparelChange[0],apparelChange[1],apparelChange[2]];
		this.currentPosts = [apparelChange[0],apparelChange[1],apparelChange[2]];
		this.setIds();
		this.count = [];
		this.currentPage = Array(4).fill(0);
		for(let i = 0; i < this.apparel_posts.length; i++){
			if(this.count.length < 4){
				if(this.apparel_posts && this.apparel_posts[i] && this.apparel_posts[i].length) this.count.push(this.apparel_posts[i][0].total_count);
				else this.count.push(0);
			}
		}	
        this.loaded = true;
		setTimeout(()=>{
			$("#tab-output-apparel").addClass('active-home');
		},25)
		setTimeout(()=>{
			this.getImageWidth();
			this.getRestImageWidth();
		},200)
        
      }
  }
	getPosts(index,category){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('Type', 'apparel');
		headers.append('offset', (this.currentPage[index] * 4 + 4).toString());
		headers.append('category', category);
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/home/paginate`, {headers:headers}).subscribe(data => {
			
			if(data.json().success){
				this.apparel_posts[index] = this.apparel_posts[index].concat(data.json().posts);
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.apparel_posts[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
				this.setIds();
				
			}
		});
	}
	setIds(){
		this.ids = [];
		
		for(let i =0; i < this.apparel_posts.length; i++){
			if(this.apparel_posts.length && this.apparel_posts[i]){
				this.ids.push([]);
				for(let ic= 0; ic < this.apparel_posts[i].length; ic++){
					this.ids[i].push(this.apparel_posts[i][ic].uuid);
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
		for(let i =0; i < this.apparel_posts.length; i++){
			if(this.ids[i]){
				let index = this.ids[i].indexOf(id);
				if(index > -1){
					this.apparel_posts[i][index].average_vote = vote;
					this.apparel_posts[i][index].user_voted = user_voted;
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
	paginate(type,index){
		if(type === 'next'){
			if(((this.currentPage[index] * 4 + 4)  === this.apparel_posts[index].length) && (this.apparel_posts[index].length < this.count[index])){
				this.getPosts(index,this.categories[index]);
			} else {
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.apparel_posts[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
			}
		} else {
			if(this.currentPage[index] > 0){
				this.currentPage[index] -= 1;
				this.currentPosts[index] = this.apparel_posts[index].slice(this.currentPage[index] * 4, this.currentPage[index] * 4 + 4)
			}
		}
		this.getImageWidth();
		this.getRestImageWidth();
	}
	marqueeToggle(type,name,index){
      let textwidth = $(`#apparel-title-link-${name}-${index}`).width();
      
      let item = $(`#apparel-title-link-${name}-${index}`).parent()
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
		var body = {"id":id, "type":"apparel", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
    		if(data.json().success){
				let change;
				if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				else if(vote === 1 && !voted) change = 1;
				else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				else if(vote === -1 && !voted) change = -1;
    			this.voteChange(id,(average_vote+change),data.json().user_vote)
				this._voteService.change('apparel',id,data.json().vote,data.json().user_vote);
    		}
    		if(data.json().status === 401){
          		this._modal.setModal('home');
      		} else if (data.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(data.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
    	});
    	// upVoteSubscription.unsubscribe();
	}
	like(id, liked, type, value, parentIndex, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
		this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      if(data.json().success){
	      	let post = this.currentPosts[parentIndex][index]
			post.likes_count = data.json().likes_count
			post.user_liked = data.json().user_liked
	        if(post.user_liked){
	            $(`#icon-likes-${id}`).addClass(' liked-icon fa-heart');
	            $(`#icon-likes-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-${id}`).addClass(' liked');
	            $(`#likes-${id}`).html(post.likes_count);
	        }
	        if(!post.user_liked){
	            $(`#icon-likes-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-${id}`).removeClass('liked');
	            $(`#likes-${id}`).html(post.likes_count);
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
	photoZoom(category,id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
			let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'};  
			if(id === 3) options = {zoomPosition:13,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
			// this is supposed to help with cpu
			this._ngZone.runOutsideAngular(() => {
				this.zoomedPhoto = new CloudZoom($(`#main-photo-apparel-${category}-${id}`),options);
				let self = this;
				$(`#main-photo-apparel-${category}-${id}`).bind('cloudzoom_end_zoom', function(){
					self.zoomedPhoto.destroy();
					$(this).unbind();
				})
        	});
			// this.zoomedPhoto = new CloudZoom($(`#main-photo-apparel-${category}-${id}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
	getImgSize(imgSrc,offset) {
		let newImg = new Image();

		newImg.onload = () => {
			this.height = newImg.height;
			this.width = newImg.width;
				$('#main-photo-apparel-container').append(`
					<div id='zoomed-main-photo-apparel' class='zoomed-photo' style='position:absolute;left:800px; top:${offset-100}px;background: url("${imgSrc}") no-repeat;height:${this.height}px; width:${this.width}px;z-index:99;background-size:100%'></div> 
				`)
		}
		newImg.src = imgSrc; // this must be done AFTER setting onload
	}
	getImageWidth(){
		// let container_width = $(`#main-photo-apparel-container-${this.categories[0]}-0`).width()
		// let container_height = $(`#main-photo-apparel-container-${this.categories[0]}-0`).height()
		// for(let i = 0; i < this.currentPosts.length;i++){
		// 	if(this.currentPosts && this.currentPosts[i]){
		// 		let category = this.categories[i];
		// 		for(let id = 0;id < this.currentPosts[i].length;id++){
		// 			// let image_object = new Image();
		// 			// image_object.src = $(`#main-photo-apparel-${category}-${id}`).attr("src");
		// 			// let native_width = image_object.width;
		// 			// let native_height = image_object.height;
		// 			// if(native_height > native_width && native_height > container_height){
		// 			// 	let multiplier = container_height / native_height
		// 			// 	let new_width = native_width * multiplier;
		// 			// 	$(`#main-photo-apparel-${category}-${id}`).height(container_height).width(new_width)
		// 			// } else if (native_height > native_width && native_height <= container_height) {
		// 			// 	$(`#main-photo-apparel-${category}-${id}`).height(native_height).width(native_width)
		// 			// } else if (native_width > native_height && native_width > container_width){
		// 			// 	let multiplier = container_width / native_width;
		// 			// 	let new_height = (native_height * multiplier);
		// 			// 	let width = new_height > container_height ? ((container_height/new_height)*container_width) : container_width;
		// 			// 	let height = new_height > container_height ? container_height : new_height;
		// 			// 	$(`#main-photo-apparel-${category}-${id}`).height(height).width(width);
		// 			// } else if(native_height === native_width && native_height > container_height) {
		// 			// 	$(`#main-photo-apparel-${category}-${id}`).height(container_width).width(container_height)
		// 			// } else {
		// 				// $(`#main-photo-apparel-${category}-${id}`).height('100%').width('100%')
		// 			// }
		// 			// $(`#main-photo-apparel-${category}-${id}`).css({'display':'block'});
		// 		}
		// 	}
		// }
    }
	getRestImageWidth(){
		for(let i = 0; i < this.currentPosts.length;i++){
			if(this.currentPosts && this.currentPosts[i]){
				let category = this.categories[i];
				for(let id = 0;id < this.currentPosts[i].length;id++){
					if(this.currentPosts[i][id].photos){
						for(let ic = 0;ic < this.currentPosts[i][id].photos.length;ic++ ){
							// 
							// let image_object = new Image();
							// image_object.src = $(`#rest-photos-apparel-${category}-${id}-${ic}`).attr("src");
							// 			let native_width = image_object.width;
							// 			let native_height = image_object.height;
							// if(native_height > native_width && native_height > 50){
							// 	let multiplier = 50 / native_height
							// 	let new_width = native_width * multiplier;
							// 	$(`#rest-photos-apparel-${category}-${id}-${ic}`).height(50).width(new_width)
							// } else if (native_height > native_width && native_height <= 50) {
							// 	$(`#rest-photos-apparel-${category}-${id}-${ic}`).height(native_height).width(native_width)
							// } else if (native_width > native_height && native_width > 75){
							// 	let multiplier = 75 / native_width;
							// 	let new_height = (native_height * multiplier);
							// 	$(`#rest-photos-apparel-${category}-${id}-${ic}`).height(new_height).width(75);
							// } else {
							// 	let native_width = '100%';
							// 	let native_height = '100%';
							// 	$(`#rest-photos-apparel-${category}-${id}-${ic}`).height(native_height).width(native_width)
							// }
							$(`#rest-photos-apparel-${category}-${id}-${ic}`).height("100%").width("100%")
							$(`#rest-photos-apparel-${category}-${id}-${ic}`).css({'display':'initial'});
						}
					}
				}
			}
		}
	}
	changePhoto(category,parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-apparel-${category}-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-apparel-${category}-${parentIndex}-${photoIndex}`);
		let src = $(newactive).attr('src');
		$(`#main-photo-apparel-${category}-${parentIndex}`).attr('src', src);
		$(oldactive).removeClass('active-photo');
		$(newactive).addClass('active-photo');
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	ngOnDestroy() {
    // prevent memory leak when component destroyed
		if (this.zoomedPhoto) this.zoomedPhoto.destroy();
		if (this.likeSubscription) this.likeSubscription.unsubscribe();
	    if (this.voteSubscription) this.voteSubscription.unsubscribe();
		if (this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
    }
}
