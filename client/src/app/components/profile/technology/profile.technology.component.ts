import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import { Location } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {PhotosService} from '../../../services/photos.service';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {ModalComponent} from '../../modal/modal.component';
import {VoteService} from '../../../services/vote.service';

declare var $;
declare var CloudZoom;

@Component({
  selector: 'profile_technology',
  templateUrl: 'profile.technology.component.html'
})

export class ProfileTechnologyComponent implements OnInit {
    sortPosts:FormGroup;
    subscription:any;
    paginateSubscription:any;
    sortSubscription:any;
	likeSubscription:any;
	bioSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
	watchVoteSubscription:any;
    user:string=null;
    offset:any;
    technology:any=[];
    optionValues:any;
    timeValues:any;
    typesValues:any;
    currentPage:number;
	iscurrentUser:boolean=false;
    options:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
    timings:any=['Day','Week','Month','Year','All Time'];
    types:any=['Highest To Lowest','Lowest To Highest'];
    typeValues:any=['Descending','Ascending'];
    disabledTimeSelect:boolean;
    disabledSelects:boolean;
    totalCount:number;
    total:number;
    pages:number;
    numbers:any;
    loaded:boolean;
    height:number;
    width:number;
	zoomedPhoto:any;
	math:any=Math;
	server_url:string;
	ids:any=[];
	constructor(private _fb: FormBuilder, private _voteService: VoteService, private _backend: BackendService, private _http: Http, private _location: Location, private _photoService: PhotosService, private _modal: ModalComponent, private _route: ActivatedRoute, private _router: Router, private _auth: AuthService, private _sysMessages: SystemMessagesComponent){};
	ngOnInit(){
		this.server_url = this._backend.SERVER_URL;
        $('.container').addClass('extended-container');
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
					break;
				case 'time':
					this.timeValues = value;
					break;
				case 'type':
					this.typesValues = value;
					break;
			}
		}
		this.currentPage = (this.offset / 20) + 1;
		this.sortPosts = this._fb.group({
	      'options': ['Votes', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required],
	      'featured': [1, Validators.required]
	    })
        this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
        this.iscurrentUser = localStorage.getItem('username') === this.user ? true : false;
        this.getTechnology();
		this.voteCheck();
  };
  getTechnology(){
        let headersInit = new Headers();
        headersInit.append('user', this.user);
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		headersInit.append('offset', offset);
		headersInit.append('order', this.optionValues);
		headersInit.append('time', this.timeValues);
		headersInit.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${this.user}/technology`,{headers: headersInit}).subscribe(data => {
				this.totalCount = data.json().posts.length;
				this.offset = this.offset ? this.offset : data.json().offset;
                this.technology = data.json().posts;
				this.setIds();
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
				this.loaded = true;
                setTimeout(()=>{
                this.getImageWidth();
				this.displayAll();
                },150)
		}, errors=>{
			if(errors.status === 404){
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				},150)
			} 
		});
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
  getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'user':this.user,"featured":null, 'options':values.options, 'time':values.time, 'type':values.type}
        this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/${this.user}/technology`, body, {headers: headers}).subscribe(data => {
			this.technology = data.json().posts;
			this.setIds();
			this.offset = data.json().offset;
			this.currentPage = data.json().page;
			this.setState();
		});
	}
  changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'user':this.user,'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
		this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/${this.user}/technology`, body, {headers: headers}).subscribe(data => {
			this.technology = data.json().posts;
			this.setIds();
			this.offset = data.json().offset;
			this.currentPage = pageData[1];
			this.setState();
	    },error=>{

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
				data.push((this.currentPage-2) * 20);
				data.push(this.currentPage - 1);
				break;
			case 'next':
				data.push((this.currentPage) * 20);
				data.push(this.currentPage + 1);
				break;
			case 'end':
				data.push((this.pages - 1) * 20);
				data.push(this.pages);
				break;
			case 'page':
				data.push((page - 1) * 20);
				data.push(page)
				break;
		}
		return data;
	}
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
  setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
        let url = `/user/${this.user}/technology${offsetString}${orderString}${timeString}${typeString}`
	    this._location.replaceState(url);
	}
  marqueeToggle(type,id){
    let textwidth = $(`#technology-title-link-${id}`).width();
    let item = $(`#technology-title-link-${id}`).parent()
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
  like(id, liked, type, value, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
	      	let post = this.technology[index]
	        if(!liked){
	            $(`#icon-likes-${id}`).addClass(' liked-icon fa-heart');
	            $(`#icon-likes-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-${id}`).addClass(' liked');
	            $(`#likes-${id}`).html(`${value + 1}`);
	            post.likes_count = post.likes_count + 1;
	            post.user_liked = !post.user_liked;
	        }
	        if(liked){
	            $(`#icon-likes-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-${id}`).removeClass('liked');
	            $(`#likes-${id}`).html(`${value - 1}`);
	            post.likes_count = post.likes_count - 1;
	            post.user_liked = !post.user_liked;
	        }

	    },errors =>{
			if(errors.status === 401){
	          	this._modal.setModal('user', this.user, 'technology');
	     	}
		});
	}
	setVote(vote,id,type,average_vote,voted){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"technology", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			let change;
			if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			else if(vote === 1 && !voted) change = 1;
			else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			else if(vote === -1 && !voted) change = -1;
			this.voteChange(id,average_vote+change,data.json().user_vote)
			this._voteService.change('technology',id,average_vote+change,data.json().user_vote);
    	}, errors => {
			if(errors.status === 401){
          		this._modal.setModal('user', this.user, 'technology');
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
  displayAll(){
       $(`#loading-spinner-technology-profile`).css({'display':'none'})
       $(`#technology-posts-container`).fadeIn();
  }
	getImageWidth(){
      for(let id = 0; id < this.technology.length; id++){
            // let image_object = new Image();
            // image_object.src = $(`#main-photo-technology-${id}`).attr("src");
			
			// 			let native_width = image_object.width;
			// 			let native_height = image_object.height;

            // if(native_height > native_width && native_height > 148){
            //     let multiplier = 148 / native_height
            //     let new_width = native_width * multiplier;
            //     $(`#main-photo-technology-${id}`).height(148).width(new_width)
            // } else if (native_height > native_width && native_height <= 148) {
            //     $(`#main-photo-technology-${id}`).height(native_height).width(native_width)
            // } else if (native_width > native_height && native_width > 300){
            //     let multiplier = 300 / native_width;
            //     let new_height = (native_height * multiplier) < 149 ? (native_height * multiplier) : 148;
            //     $(`#main-photo-technology-${id}`).height(new_height).width(300);
            // } else {
            //     $(`#main-photo-technology-${id}`).height(native_height).width(native_width)
            // }
            $(`#main-photo-technology-${id}`).css({'display':'block'});
            // this.displayAll();
      }
  }
	changePhoto(parentIndex,photoIndex){
		let oldactive = $(`.rest-photos-${parentIndex}.active-photo`);
		let newactive = $(`#rest-photos-technology-${parentIndex}-${photoIndex}`);
        
		let src = $(newactive).attr('src');
		$(`#main-photo-technology-${parentIndex}`).attr('src', src);
		$(oldactive).removeClass('active-photo');
		$(newactive).addClass('active-photo');
	}
  transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  }
  photoZoom(id){
	if(this.zoomedPhoto) this.zoomedPhoto.destroy();
	let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'};  
	if(id + 1 % 4 === 0 && id != 0) options = {zoomPosition:13,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
	this.zoomedPhoto = new CloudZoom($(`#main-photo-technology-${id}`),options);
	// $(this.zoomedPhoto).attr('height',200).attr('width',200)
  }
  ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
    if(this.sortSubscription) this.sortSubscription.unsubscribe();
    if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
    if(this.likeSubscription) this.likeSubscription.unsubscribe();
    if(this.routeSubscription) this.routeSubscription.unsubscribe();
    if(this.voteSubscription) this.voteSubscription.unsubscribe();
  }
}
