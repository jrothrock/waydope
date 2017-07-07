import { Component, OnInit, OnChanges, Input, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Location } from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {PhotosService} from '../../../services/photos.service';
import {ModalComponent} from '../../modal/modal.component';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {BackendService} from '../../../services/backend.service';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {SystemPostsModalComponent} from '../../system/posts/modal.component'
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';
declare var $;
declare var Materialize;
declare var CloudZoom;
declare var _setMeta;

@Component({
  selector: 'apparel_all',
  templateUrl: 'apparel.all.component.html',
  providers: [ModalComponent]
})

export class ApparelAllComponent implements OnInit {
  sortPosts:FormGroup;
  subscription:any;
  sortSubscription:any;
  likeSubscription:any;
  paginateSubscription:any;
  voteSubscription:any;
  height:number;
  width:number;
  apparel:any=[];
  offset:number;
  optionValues:any;
  timeValues:any;
  typesValues:any;
  options:any=['Votes','Likes','Alphabetically', 'Newest', 'Oldest'];
  timings:any=['Day','Week','Month','Year','All Time'];
  types:any=['Highest To Lowest','Lowest To Highest'];
  typeValues:any=['Descending','Ascending'];
  all:any;
  total:number;
  pages:number;
  numbers:any=[];
  currentPage:number;
  error:boolean=false;
  loaded:boolean=false;
  disabledTimeSelect:boolean=false;
  disabledSelects:boolean=false;
	zoomedPhoto:any;
	math:any=Math;
	watchVoteSubscription:any;
	ids:any=[];
  constructor(private _auth: AuthService, private _voteService : VoteService, private _backend: BackendService, private _fb: FormBuilder, private _location: Location, private _http: Http, private _modal: ModalComponent, private _router: Router, private _lb: LightBoxComponent,private _photoService:PhotosService){};
	ngOnInit(){
		_setMeta.setType('apparel');
    this.sortPosts = this._fb.group({
      'options': ['Votes', Validators.required],
      'time': ['All Time', Validators.required],
      'type': ['Descending', Validators.required]
    })
    let decoded = decodeURIComponent(window.location.search.substring(1))
		let params = decoded.split("&");
		for(let i = 0;i < params.length; i++){
			let key = params[i].split("=")[0]
			let value = params[i].split("=")[1]
			switch(key){
				case 'offset':
					this.offset = parseInt(value);
					break;
				case 'order':
					this.optionValues = value;
          this.sortPosts.patchValue({options:this.optionValues});
          setTimeout(()=>{
            this.onOptionsChange(this.optionValues);
          },100)
					break;
				case 'time':
					this.timeValues = value;
          this.sortPosts.patchValue({time:this.timeValues});
					break;
				case 'type':
					this.typesValues = value;
          this.sortPosts.patchValue({type:this.typesValues});
					break;
			}
		}
    this.getApparel();
		this.voteCheck();
  };

  getApparel(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/apparel/`, {headers:headers}).subscribe(data => {
				this.apparel = data.json().posts;
				this.setIds();
				this.offset = this.offset ? this.offset : data.json().offset;
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
        this.loaded = true;
        setTimeout(()=>{
          this.getImageWidth();
					this.getRestImageWidth();
					this.displayAll();
        },150)
		},error=>{
			if (error.status == 404) {
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				},150);
			} else {
				this.error = true;
        setTimeout(()=>{
          this.displayAll();
        },150) 
			}
		});
	};
  like(id, liked, type, value, index ){
		
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      	let post = this.apparel[index]
					
	        if(data.json().success && !liked){
	            $(`#icon-likes-${id}`).addClass(' liked-icon fa-heart');
	            $(`#icon-likes-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-${id}`).addClass(' liked');
	            $(`#likes-${id}`).html(`${value + 1}`);
	            post.likes_count = post.likes_count + 1;
	            post.user_liked = !post.user_liked;
	        }
	        if(data.json().success && liked){
	            $(`#icon-likes-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-${id}`).removeClass('liked');
	            $(`#likes-${id}`).html(`${value - 1}`);
	            post.likes_count = post.likes_count - 1;
	            post.user_liked = !post.user_liked;
	        }
	    },error=>{
				if(error.status === 401){
	        this._modal.setModal('apparel');
	      } else if (error.json().locked){
					Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
				} else if(error.json().archived){
					Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
				}
			});
	}
  getOffset(type,page){
		let data = [];
		switch(type){
			case 'start':
				data.push(0);
				data.push(1)
				break;
			case 'back':
				data.push((page-2) * 20);
				data.push(page - 1);
				break;
			case 'next':
				data.push((page) * 20);
				data.push(page + 1);
				break;
			case 'end':
				data.push((page - 1) * 20);
				data.push(page);
				break;
			case 'page':
				data.push((page - 1) * 20);
				data.push(page)
				break;
		}
		return data;
	}

	voteCheck(){
		this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	setIds(){
		this.ids = [];
		for(let i =0; i < this.apparel.length; i++){
			this.ids.push(this.apparel[i].uuid);
		}
	}
	changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
			this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/apparel/paginate`, body, {headers: headers}).subscribe(data => {
					this.setIds();
	    		this.apparel = data.json().posts;
					this.setIds();
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];
	    		this.setState();
	    });
	}
  getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		var headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {"featured":null, 'options':values.options, 'time':values.time, 'type':values.type}
    this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/apparel/sort`, body, {headers: headers}).subscribe(data => {
      this.apparel = data.json().posts;
			this.setIds();
      this.offset = data.json().offset;
      this.currentPage = data.json().page;
      this.setState();
    });
	}
	setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
	    this._location.replaceState(`/apparel${offsetString}${orderString}${timeString}${typeString}`)
	}
  onOptionsChange(value) {
    	if(value === 'Newest' || value === 'Oldest'){
    		this.disabledTimeSelect = false;
    		$('#time').val('');
    		$('#time').prop('disabled', 'disabled');
    		$('#type').val('');
    		$('#type').prop('disabled', 'disabled');
    		this.disabledSelects = true;
    	} else if(value === 'Alphabetically'){
    		if(this.disabledSelects){
    			$('#type').prop('disabled', false); 
    			this.disabledSelects = false;
    		}
    		this.disabledTimeSelect = true;
    		$('#time').val('');
    		$('#time').prop('disabled', 'disabled');
    		this.types=['A-Z','Z-A'];
    		this.typeValues=['Ascending','Descending'];
    		setTimeout(()=>{$('#type').val('Ascending'); this.sortPosts.patchValue({type:'Ascending'}) },1);
    	} else if(this.disabledTimeSelect){
    		this.types=['Highest To Lowest','Lowest To Highest'];
    		this.typeValues=['Descending','Ascending'];
    		$('#type').val('')
    		$('#time').val('All Time');
    		$('#time').prop('disabled', false);
    		this.disabledTimeSelect = false;
    	} else if(this.disabledSelects) {
    		this.types=['Highest To Lowest','Lowest To Highest'];
    		this.typeValues=['Descending','Ascending'];
    		$('#time').prop('disabled', false); 
    		$('#time').val('All Time');
    		$('#type').prop('disabled', false); 
    		setTimeout(()=>{$('#type').val('Descending'); this.sortPosts.patchValue({type:'Descending'})},1);
    		this.disabledSelects = false;
    	}
	}
  marqueeToggle(type,index){
		let textwidth = $(`#apparel-title-link-${index}`).width();
		let item = $(`#apparel-title-link-${index}`).parent()
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
	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		
		if(index > -1){
			this.apparel[index].average_vote = vote;
			this.apparel[index].user_voted = user_voted;
		}
	}
	setVote(vote,id,type,average_vote,voted){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"apparel", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
					let change;
					if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
					else if(vote === 1 && !voted) change = 1;
					else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
					else if(vote === -1 && !voted) change = -1;
					this.voteChange(id,average_vote+change,data.json().user_vote)
					this._voteService.change('apparel',id,average_vote+change,data.json().user_vote);
    	},error=>{
				if(error.status === 401){
          this._modal.setModal('home');
      	} else if (error.json().locked){
					Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
				} else if(error.json().archived){
					Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
				}
			});
    	// upVoteSubscription.unsubscribe();
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
	photoZoom(id){

            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'};  
						if(id + 1 % 4 === 0) options = {zoomPosition:13,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-apparel-${id}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
  }
  displayAll(){
			 $(`#loading-spinner-apparel`).css({'display':'none'});
			 $(`#apparel-posts-container`).fadeIn();
  }
	getImageWidth(){
			let container_width = $(`#main-photo-apparel-container-0`).width()
			let container_height = $(`#main-photo-apparel-container-0`).height()
			
			
			if(this.apparel && this.apparel.length){
				for(let id = 0; id < this.apparel.length; id++){
						// 	let image_object = new Image();
						// 	image_object.src = $(`#main-photo-apparel-${id}`).attr("src");

				
						// 	let native_width = image_object.width;
						// 	let native_height = image_object.height;
						// 	
						// 	
						// if(native_height > native_width && native_height > container_height){
						// 	let multiplier = container_height / native_height
						// 	let new_width = native_width * multiplier;
						// 	$(`#main-photo-apparel-${id}`).height(container_height).width(new_width)
						// } else if (native_height > native_width && native_height <= container_height) {
						// 	$(`#main-photo-apparel-${id}`).height(native_height).width(native_width)
						// } else if (native_width > native_height && native_width > container_width){
						// 	let mulitple = native_height / native_width;
						// 	let height = (container_height * mulitple);
						// 	$(`#main-photo-apparel-${id}`).height(height).width(container_width);
						// } else if(native_height === native_width && native_height > container_height) {
						// 	$(`#main-photo-apparel-${id}`).height(container_width).width(container_height)
						// } else {
						// 	
							$(`#main-photo-apparel-${id}`).height('100%').width('100%')
						// }
						$(`#main-photo-apparel-${id}`).css({'display':'block'});
						this.displayAll();
					}
			}
  }
	getRestImageWidth(){
		for(let id = 0; id < this.apparel.length;id++){
			if(this.apparel && this.apparel[id] && this.apparel[id].photos){
				for(let ic = 0;ic < this.apparel[id].photos.length;ic++ ){
					// let image_object = new Image();
					// image_object.src = $(`#rest-photos-apparel-${id}-${ic}`).attr("src");
					// let native_width = image_object.width;
					// let native_height = image_object.height;
					// if(native_height > native_width && native_height > 50){
					// 	let multiplier = 50 / native_height
					// 	let new_width = native_width * multiplier;
					// 	$(`#rest-photos-apparel-${id}-${ic}`).height(50).width(new_width)
					// } else if (native_height > native_width && native_height <= 50) {
					// 	$(`#rest-photos-apparel-${id}-${ic}`).height(native_height).width(native_width)
					// } else if (native_width > native_height && native_width > 75){
					// 	let multiplier = 75 / native_width;
					// 	let new_height = native_height * multiplier;
					// 	$(`#rest-photos-apparel-${id}-${ic}`).height(new_height).width(75);
					// 	$('')
					// } else {
					// 	$(`#rest-photos-apparel-${id}-${ic}`).height(native_height).width(native_width)
					// }
					$(`#rest-photos-apparel-${id}-${ic}`).css({'display':'initial'});
				}
			}
		}
	}
	changePhoto(parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-apparel-${parentIndex}-${photoIndex}`);
		/////test
		let src = $(newactive).attr('src');
		$(`#main-photo-apparel-${parentIndex}`).attr('src', src);
		$(oldactive).removeClass('active-photo');
		$(newactive).addClass('active-photo');
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	ngOnDestroy() {
    // prevent memory leak when component destroyed
			if(this.zoomedPhoto) this.zoomedPhoto.destroy();
      if(this.subscription) this.subscription.unsubscribe();
      if(this.sortSubscription) this.sortSubscription.unsubscribe();
	    if(this.voteSubscription) this.voteSubscription.unsubscribe();
      if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
      if(this.likeSubscription) this.likeSubscription.unsubscribe();
			if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
    }
}
