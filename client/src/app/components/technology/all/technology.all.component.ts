import { Component, OnInit, OnChanges, Input, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Location } from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {PhotosService} from '../../../services/photos.service';
import {ModalComponent} from '../../modal/modal.component';
import { Router } from '@angular/router';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {VoteService} from '../../../services/vote.service';

declare var $;
declare var CloudZoom;
declare var _setMeta;

@Component({
  selector: 'technology_all',
  templateUrl: 'technology.all.component.html',
  providers: [ModalComponent]
})

export class TechnologyAllComponent implements OnInit {
  sortPosts:FormGroup;
  subscription:any;
  likeSubscription:any;
  voteSubscription:any;
  sortSubscription:any;
  paginateSubscription:any;
	watchVoteSubscription:any;
  technology:any=[];
  height:number;
  width:number;
  all:any;
  total:number;
  pages:number;
  numbers:any=[];
  currentPage:number;
  error:boolean=false;
  loaded:boolean=false;
  offset:number;
  optionValues:any;
  timeValues:any;
  typesValues:any;
  options:any=['Votes','Likes','Alphabetically', 'Newest', 'Oldest'];
  timings:any=['Day','Week','Month','Year','All Time'];
  types:any=['Highest To Lowest','Lowest To Highest'];
  typeValues:any=['Descending','Ascending'];
  disabledTimeSelect:boolean=false;
  disabledSelects:boolean=false;
	math:any=Math;
	zoomedPhoto:any;
	server_url:string;
	ids:any=[];
  constructor(private _auth: AuthService, private _voteService: VoteService, private _backend:BackendService, private _fb:FormBuilder, private _location: Location,  private _http: Http, private _modal: ModalComponent, private _router: Router,private _photoService:PhotosService){};
	ngOnInit(){
		_setMeta.setType('technology');
		this.server_url = this._backend.SERVER_URL;
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
    this.getTechnology();
		this.voteCheck();
  };
	setIds(){
		this.ids = [];
		for(let i =0; i < this.technology.length; i++){
			this.ids.push(this.technology[i].uuid);
		}
	}

	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		
		if(index > -1){
			this.technology[index].average_vote = vote;
			this.technology[index].user_voted = user_voted;
		}
	}

	voteCheck(){
		this.watchVoteSubscription = this._voteService.componentVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
  getTechnology(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/technology/`, {headers:headers}).subscribe(data => {
			if(data.json().success){
				this.technology = data.json().posts;
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
			} else if (data.json().status === 404){
				this.loaded = true;
				setTimeout(()=>{
            this.displayAll();
        },150)
			} else {
				this.error = true;
        setTimeout(()=>{
            this.displayAll();
        },150)
			}
		});
	};
  marqueeToggle(type,index){
    let textwidth = $(`#technology-title-link-${index}`).width();
    let item = $(`#technology-title-link-${index}`).parent()
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
	changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
    });
    var body = {'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
    this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/technology/paginate`, body, {headers: headers}).subscribe(data => {
      if(data.json().success){
        this.technology = data.json().posts;
				this.setIds();
        this.offset = data.json().offset;
        this.currentPage = pageData[1];
        this.setState();
      }
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
		this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/technology/sort`, body, {headers: headers}).subscribe(data => {
      if(data.json().success){
      this.technology = data.json().posts;
			this.setIds();
      this.offset = data.json().offset;
      this.currentPage = data.json().page;
      this.setState();
      }
    });
	}
	setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
	    this._location.replaceState(`/technology${offsetString}${orderString}${timeString}${typeString}`)
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
  like(id, liked, type, value, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes/new`, body, {headers: headers}).subscribe(data => {
	      if(data.json().success){
	      	let post = this.technology[index]
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

	      }
	      if(data.json().status === 401){
	          this._modal.setModal('technology');
	      }
	    });
	}
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
    		if(data.json().status === 401){
          		this._modal.setModal('home');
      		}
    	});
    	// upVoteSubscription.unsubscribe();
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
	photoZoom(id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'};  
						if(id +1 % 4 === 0) options = {zoomPosition:13,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-technology-${id}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
  }
  displayAll(){
       $(`#loading-spinner-technology-all`).css({'display':'none'});
       $(`#technology-posts-container`).fadeIn();
  }
	getImageWidth(){
			let container_width = $(`#main-photo-technology-container-0`).width()
			let container_height = $(`#main-photo-technology-container-0`).height()
			if(this.technology && this.technology.length){
				for(let id = 0; id < this.technology.length; id++){
						// 	let image_object = new Image();
						// 	image_object.src = $(`#main-photo-technology-${id}`).attr("src");

				
						// 	let native_width = image_object.width;
						// 	let native_height = image_object.height;

						// if(native_height > native_width && native_height > container_height){
						// 	let multiplier = container_height / native_height
						// 	let new_width = native_width * multiplier;
						// 	$(`#main-photo-technology-${id}`).height(container_height).width(new_width)
						// } else if (native_height > native_width && native_height <= container_height) {
						// 	$(`#main-photo-technology-${id}`).height(native_height).width(native_width)
						// } else if (native_width > native_height && native_width > container_width){
						// 	let multiplier = container_width / native_width;
						// 	let new_height = (native_height * multiplier);
						// 	let width = new_height > container_height ? ((container_height/new_height)*container_width) : container_width;
						// 	let height = new_height > container_height ? container_height : new_height;
						// 	$(`#main-photo-technology-${id}`).height(height).width(width);
						// } else if(native_height === native_width && native_height > container_height) {
						// 	$(`#main-photo-technology-${id}`).height(container_width).width(container_height)
						// } else {
							// $(`#main-photo-technology-${id}`).height('100%').width('100%')
						// }
						$(`#main-photo-technology-${id}`).css({'display':'block'});
						this.displayAll();
					}
			}
  }
	getRestImageWidth(){
		for(let id = 0; id < this.technology.length;id++){
			if(this.technology && this.technology[id] && this.technology[id].photos){
				for(let ic = 0;ic < this.technology[id].photos.length;ic++ ){
					// let image_object = new Image();
					// image_object.src = $(`#rest-photos-technology-${id}-${ic}`).attr("src");
					// let native_width = image_object.width;
					// let native_height = image_object.height;
					// if(native_height > native_width && native_height > 50){
					// 	let multiplier = 50 / native_height
					// 	let new_width = native_width * multiplier;
					// 	$(`#rest-photos-technology-${id}-${ic}`).height(50).width(new_width)
					// } else if (native_height > native_width && native_height <= 50) {
					// 	$(`#rest-photos-technology-${id}-${ic}`).height(native_height).width(native_width)
					// } else if (native_width > native_height && native_width > 75){
					// 	let multiplier = 75 / native_width;
					// 	let new_height = native_height * multiplier;
					// 	$(`#rest-photos-technology-${id}-${ic}`).height(new_height).width(75);
					// 	$('')
					// } else {
					// 	$(`#rest-photos-technology-${id}-${ic}`).height(native_height).width(native_width)
					// }
					$(`#rest-photos-technology-${id}-${ic}`).css({'display':'initial'});
				}
			}
		}
	}
	changePhoto(parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-technology-${parentIndex}-${photoIndex}`);
		/////test
		let src = $(newactive).attr('src');
		$(`#main-photo-technology-${parentIndex}`).attr('src', src);
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
	    if(this.voteSubscription) this.voteSubscription.unsubscribe();
      if(this.likeSubscription) this.likeSubscription.unsubscribe();
      if(this.sortSubscription) this.sortSubscription.unsubscribe();
      if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
			if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
    }
}
