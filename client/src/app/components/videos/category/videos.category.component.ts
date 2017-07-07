import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import { Location } from '@angular/common';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {VoteService} from '../../../services/vote.service';
import {LightBoxComponent} from '../../lightbox/lightbox.component';
import {VideoService} from '../../../services/video.service';

declare var $;
declare var videojs;
declare var _setMeta;
@Component({
  selector: 'videos_category',
  templateUrl: 'videos.category.component.html',
  providers:[FormBuilder,ModalComponent],
  entryComponents:[LightBoxComponent]
})

export class VideosCategoryComponent implements OnInit {
	sortVideos:FormGroup;
	category:any;
	videos:any=[];
	error:boolean=true;
	subscription:any;
	likeSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	playSubscription:any;
	totalCount:number;
	offset:number;
	loaded:boolean=false;
	hovering:boolean=false;
	hoveringCheck:boolean=false;
	hoveringIndex:number;
	sortSubscription:any;
	options:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typeValues:any=['Descending','Ascending'];
  	featuredsValue:any=[0,1];
  	disabledTimeSelect:boolean=false;
	disabledSelects:boolean=false;
  	optionValues:any;
  	timeValues:any;
  	typesValues:any;
  	currentPage:number;
  	pages:number;
  	total:number;
  	numbers:any;
	videoJSplayer:any=[];
	math:any=Math;
	server_url:string;
	ids:any=[];
	constructor(private _auth:AuthService, private _vidService:VideoService, private _voteService : VoteService, private _backend: BackendService, private _http: Http,private _route: ActivatedRoute,private _modal:ModalComponent, private _fb: FormBuilder, private _location : Location){};
	ngOnInit(){
		this.server_url = this._backend.SERVER_URL;
		$('.container').addClass('extended-container');
		this.sortVideos = this._fb.group({
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
					this.sortVideos.patchValue({'order':this.optionValues})
					break;
				case 'time':
					this.timeValues = value;
					this.sortVideos.patchValue({'time':this.timeValues})
					break;
				case 'type':
					this.typesValues = value;
					this.sortVideos.patchValue({'type':this.typeValues})
					break;
			}
		}
		
		this.currentPage = (this.offset / 20) + 1;
		this.routeSubscription = this._route.params.subscribe(params => {this.category = params['category']});
		_setMeta.setCategory('videos',this.category);
		this.getVideos();
		this.voteCheck();
	};

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
    		setTimeout(()=>{$('#type').val('Ascending'); this.sortVideos.patchValue({type:'Ascending'}) },1);
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
    		setTimeout(()=>{$('#type').val('Descending'); this.sortVideos.patchValue({type:'Descending'})},1);
    		this.disabledSelects = false;
    	}
	}

	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		if(index > -1){
			this.videos[index].average_vote = vote;
			this.videos[index].user_voted = user_voted;
		}
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
		for(let i =0; i < this.videos.length; i++){
			this.ids.push(this.videos[i].uuid);
		}
	}

	getVideos(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('Category', this.category);
		let offset = this.offset ? this.offset.toString() : '0';
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/${this.category}/`, {headers:headers}).subscribe(data => {
			this.totalCount = data.json().videos.length;
			this.videos = data.json().videos;
			this.setIds();
			this.offset = this.offset ? this.offset : data.json().offset;
			this.total = data.json().count;
			this.pages = data.json().pages;
			this.numbers = Array(this.pages).fill(1);
			this.currentPage = this.currentPage ? this.currentPage : data.json().page;
			setTimeout(()=>{
				this.displayAll();
			},150)
		},error=>{
			if(error.status === 404){
				this.videos = false; 
				setTimeout(()=>{
					this.displayAll();
				},150)
			} else {
				this.error = true;
			}
		});
	};

	likeVideo(id, liked, type, value, sectionType, index ){
	    
	    
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
	      	let video = this.videos[index]; 
	        if(!liked){
	            $(`#icon-likes-${sectionType}-${id}`).addClass(' liked-icon fa-heart');
	            $(`#icon-likes-${sectionType}-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-${sectionType}-${id}`).addClass(' liked');
	            $(`#likes-${sectionType}-${id}`).html(`${value + 1}`);
	            video.likes_count = video.likes_count + 1;
	            video.user_liked = !video.user_liked;
	        }
	        if(liked){
	            $(`#icon-likes-${sectionType}-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-${sectionType}-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-${sectionType}-${id}`).removeClass('liked');
	            $(`#likes-${sectionType}-${id}`).html(`${value - 1}`);
	            video.likes_count = video.likes_count - 1;
	            video.user_liked = !video.user_liked;
	        }
	    },error=>{
			if(error.status === 401){
	          this._modal.setModal('videos', this.category);
	      	}
		});
	}

	photoHover(state,index){
	    if(state){
	      if((this.hovering && this.hoveringIndex === index) || (this.hovering && !this.hoveringCheck)){
	        $(`#play-button-home-videos-${this.hoveringIndex}`).attr("src","/assets/images/blackbutton.svg");
	        $(`#video-artwork-home-${this.hoveringIndex}`).css({'opacity':0.6});
	      }
	      
	      this.hovering = true;
	      this.hoveringCheck = true;
	      this.hoveringIndex = index;
	      $(`#play-button-home-videos-${index}`).attr("src","/assets/images/orangebutton.svg");
	      $(`#video-artwork-home-${index}`).css({'opacity':0.9});
	    }else{
	   		
	      this.hoveringCheck=false;
	      //allows cursor to move over play button without changing the image back
	      setTimeout(()=>{
	        if(!this.hoveringCheck){
	          $(`#play-button-home-videos-${index}`).attr("src","/assets/images/blackbutton.svg");
	           $(`#video-artwork-home-${index}`).css({'opacity':0.6});
	          this.hovering = false;
	        }
	      },100)
	    }
	  }

	setVote(vote,id,type,average_vote,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":"videos", "vote":vote, "already_voted":voted}
		this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			  let change;
			  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			  else if(vote === 1 && !voted) change = 1;
			  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			  else if(vote === -1 && !voted) change = -1;
           	  this.voteChange(id,average_vote+change,data.json().user_vote)
			  this._voteService.change('videos',id,average_vote+change,data.json().user_vote);
        },error=>{
			if(error.status === 401){
              this._modal.setModal('videos', this.category);
          	}
		});
	}
	getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		// if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
				'options':this.optionValues, 
				'time':this.timeValues, 
				'type':this.typesValues
	    });
		this.sortSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/${this.category}`, {headers: headers}).subscribe(data => {
			this.videos = data.json().videos;	
			this.offset = data.json().offset;
			this.setState();
		},error=>{

		});
	}
	displayAll(){
		$(`#loading-spinner-videos-category`).css({'display':'none'});
		$(`#videos-category-container`).fadeIn();
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
	changePage(type,page){
		let pageData = this.getOffset(type,page);
		if(page != this.currentPage) $('.btn-pagination.active').removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
				'offset':pageData[0], 
				'options':this.optionValues, 
				'time':this.timeValues, 
				'type':this.typesValues
	    });
	    this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/${this.category}`, {headers: headers}).subscribe(data => {
	    		this.videos = data.json().posts;
				this.setIds();
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];
	    		
				if(this.videoJSplayer.length > 0){ $.each( this.videoJSplayer, function( i, val ) { val.dispose();}); this.videoJSplayer=[]; }
	    		this.setState();
	    },error=>{

		});
	}
	setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
	    this._location.replaceState(`/videos/${this.category}${offsetString}${orderString}${timeString}${typeString}`)
	}
	marqueeToggle(type,id){
    	let textwidth = $(`#video-home-link-${id}`).width();
    	let item = $(`#video-home-link-${id}`).parent()
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
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
	videoPlay(category,url){
		let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let body = {}
		this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/${category}/${url}/play`, body, {headers: headers}).subscribe(data => {
		});
	}
	photoClicked(index,form,id){
		let video =  this.videos[index];
		// video.clicked = true;
		if(form){
			// this.initVideo(id);
			if(window.outerWidth > 700){
				this._vidService.change([this.videos[index].upload_url,1])
			} else {
				video.clicked = true;
				this.initVideo(id);
			}
		} else {
			if(window.outerWidth > 700){
				this._vidService.change([this.videos[index].link,0,this.videos[index].link_type])
			} else {
				video.clicked = true;
			}
		}
		this.videoPlay(video.main_category,video.url)
	}
	initVideo(id){
		setTimeout(()=>{  
				// if(this.videoJSplayer) this.videoJSplayer.dispose();
					let video = videojs(`video-${id}`, {}, function() {
           			 // This is functionally the same as the previous example.
        			});
					video.requestFullscreen();
					this.videoJSplayer.push(video);
		},1)
	}
	ngOnDestroy(){
		$('.container').removeClass('extended-container');
		if(this.subscription) this.subscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
		if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();});
	}
}
