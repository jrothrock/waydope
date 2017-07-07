import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {ModalComponent} from '../../modal/modal.component';
import { Location } from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {VoteService} from '../../../services/vote.service';
import {VideoService} from '../../../services/video.service';

declare var $;
declare var videojs;
declare var _setMeta;

@Component({
  selector: 'videos_all',
  templateUrl: 'videos.all.component.html',
  providers:[FormBuilder,ModalComponent]
})

export class VideosAllComponent implements OnInit {
	sortCategories:FormGroup;
	sortVideos:FormGroup;
	categories:any=[]
	display:any=[]
	error:boolean=false;
	subscription:any;
	voteSubscription:any;
	likeSubscription:any;
	sortSubscription:any;
	paginateSubscription:any;
	getRestSubscription:any;
	watchVoteSubscription:any;
	playSubscription:any;
	videos:any=[];
	hovering:boolean=false;
  	hoveringCheck:boolean=false;
  	hoveringIndex:number;
  	hoveringCategory:string;
  	options:any=['Number of Posts','Alphabetically', 'Newest', 'Oldest'];
  	// options:any=['Number of Posts','Number Of Subscribers','Alphabetically', 'Newest', 'Oldest'];
  	optionsValues:any=['Posts','Alphabetically','Newest','Oldest'];
  	// optionsValues:any=['Posts','Subscribers','Alphabetically','Newest','Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typesValues:any=['Descending','Ascending'];
	videosTypes:any=['Highest To Lowest','Lowest To Highest'];
	videosTypesValues:any=['Descending','Ascending'];
	optionsVideo:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
	tabTypes=['videos','categories'];
  	disabledSelects:boolean=false;
  	disabledTimeSelect:boolean=false;
	videosDisabledSelects:boolean=false;
	videosDisabledTimeSelects:boolean=false;
  	offset:number;
  	optionValues:any;
  	timeValues:any;
  	typeValues:any;
  	currentPage:number;
  	pages:number;
  	total:number;
  	numbers:any;
  	all:any;
	videosOffset:number;
	videosOptionValues:any;
	videosTimeValues:any;
	videosTypeValues:any;
	currentPageVideos:number;
  	pagesVideos:number;
  	totalVideos:number;
  	numbersVideos:any;
	videoJSplayer:any=[];
	math:any=Math;
	server_url:string;
	all_ids:any=[];
	post_ids:any=[];
	constructor(private _http:Http, private _vidService:VideoService, private _voteService: VoteService, private _backend: BackendService, private _auth:AuthService, private _modal:ModalComponent, private _fb:FormBuilder,private _location:Location){};
	ngOnInit(){
		_setMeta.setType('videos');
		this.server_url = this._backend.SERVER_URL;
		$('.container').addClass('extended-container');
		this.sortCategories = this._fb.group({
	      'options': ['Posts', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    })
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
					this.sortCategories.patchValue({'options':this.optionValues})
					break;
				case 'time':
					this.timeValues = value;
					this.sortCategories.patchValue({'time':this.timeValues})
					break;
				case 'type':
					this.typeValues = value;
					this.sortCategories.patchValue({'type':this.typeValues})
					break;
				case 'videos_offset':
					this.videosOffset = parseInt(value);
					break;
				case 'videos_order':
					this.videosOptionValues = value;
					this.sortVideos.patchValue({'options':this.videosOptionValues})
					break;
				case 'videos_time':
					this.videosTimeValues = value;
					this.sortVideos.patchValue({'time':this.videosTimeValues})
					break;
				case 'videos_type':
					this.videosTypeValues = value;
					this.sortVideos.patchValue({'type':this.videosTypeValues})
					break;
			}
		}
		if(this.optionValues){
			setTimeout(()=>{
				this.onOptionsChange('categories',this.optionValues)
			}, 5)
		}
		if(this.videosOptionValues){
			setTimeout(()=>{
				this.onOptionsChange('videos',this.videosOptionValues)
			}, 10)
		}
		
		this.currentPage = (this.offset / 20) + 1;
		this.currentPageVideos = (this.videosOffset / 20) + 1;
		this.getVideoCategories();
		this.voteCheck();
	};
	onOptionsChange(type,value) {
		
		let $time = type === 'categories' ? $('#time') : $('#time-videos');
		let $type = type === 'categories' ? $('#type') : $('#type-videos');
		let disabledSelects = type === 'categories' ? this.disabledSelects : this.videosDisabledSelects;
		let disabledTimeSelect = type === 'categories' ? this.disabledTimeSelect : this.videosDisabledTimeSelects;
		let sort = type === 'categories' ? this.sortCategories : this.sortVideos;
    	if(value === 'Newest' || value === 'Oldest'){
			if(type === 'categories'){
				this.disabledTimeSelect = false;
				this.disabledSelects = true;
			} else {
				this.videosDisabledSelects;
				this.videosDisabledTimeSelects;
			}
    		$time.val('');
    		$time.prop('disabled', 'disabled');
    		$type.val('');
    		$type.prop('disabled', 'disabled');
    	} else if(value === 'Alphabetically'){
    		if(disabledSelects){
    			$type.prop('disabled', false); 
				if(type === 'categories') this.disabledSelects = false;
				else this.videosDisabledSelects = false;
    		}
			
			if(type === 'categories'){
				this.disabledTimeSelect = true;
				this.types=['A-Z','Z-A'];
				this.typesValues=['Ascending','Descending'];
			} else {
				this.videosDisabledTimeSelects = true;
				this.videosTypes=['A-Z','Z-A'];
				this.videosTypesValues=['Ascending','Descending'];
			}
    		$time.val('');
    		$time.prop('disabled', 'disabled');
    		setTimeout(()=>{$type.val('Ascending'); this.sortCategories.patchValue({type:'Ascending'}) },1);
    	} else if(this.disabledTimeSelect){
			if(type === 'categories'){
				this.types=['Highest To Lowest','Lowest To Highest'];
    			this.typesValues=['Descending','Ascending'];
				this.disabledTimeSelect = false;
			} else {
				this.videosTypes=['Highest To Lowest','Lowest To Highest'];
    			this.videosTypesValues=['Descending','Ascending'];
				this.videosDisabledTimeSelects = false;
			}
    		$type.val('')
    		$time.val('All Time');
    		$time.prop('disabled', false);
    	} else if(this.disabledSelects) {
			if(type === 'categories'){
				this.types=['Highest To Lowest','Lowest To Highest'];
    			this.typesValues=['Descending','Ascending'];
				this.disabledSelects = false;
			} else {
				this.videosTypes=['Highest To Lowest','Lowest To Highest'];
    			this.videosTypesValues=['Descending','Ascending'];
				this.videosDisabledSelects = false;
			}
    		$time.prop('disabled', false); 
    		$time.val('All Time');
    		$type.prop('disabled', false); 
    		setTimeout(()=>{$type.val('Descending'); this.sortCategories.patchValue({type:'Descending'})},1);
    	}
	}
	getVideoCategories(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		let videosOffset = this.videosOffset ? this.videosOffset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typeValues);
		headers.append('voffset', videosOffset);
		headers.append('vorder', this.videosOptionValues);
		headers.append('vtime', this.videosTimeValues);
		headers.append('vtype', this.videosTypeValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/`, {headers:headers}).subscribe(data => {
			this.categories = data.json().categories;
			this.videos = data.json().videos;
			this.setIds('posts');
			this.offset = this.offset ? this.offset : data.json().offset;
			this.total = data.json().count;
			this.pagesVideos = data.json().video_pages;
			this.pages = data.json().pages;
			this.all = data.json().all;
			this.setIds('all');
			this.totalVideos = data.json().videos_count;
			this.numbers = Array(this.pages).fill(1);
			this.numbersVideos = Array(this.pagesVideos).fill(1);
			this.currentPage = this.currentPage ? this.currentPage : data.json().page;
			this.currentPageVideos = this.currentPageVideos ? this.currentPageVideos : data.json().video_page;
			this.getVideosRest();
			setTimeout(()=>{
				this.transition(0);
				this.displayAll();
			},300)
		},error=>{
			this.error = true;
		});
	};
	setIds(type){
	  if(type === 'all'){
		this.all_ids = [];
		for(let i =0; i < this.all.length; i++){
			this.all_ids.push(this.all[i].uuid);
		}
	  } else { 
		this.post_ids = [];
		for(let i =0; i < this.videos.length; i++){
			this.post_ids.push([]);
			for(let ic = 0; ic < this.videos[i].length; ic++ ){
				this.post_ids[i].push(this.videos[i][ic].uuid);
			}
		}
	  }
	}
	voteChange(id,vote,user_voted){
		let index = this.all_ids.indexOf(id);
		if(index > -1){
			this.all[index].average_vote = vote;
			this.all[index].user_voted = user_voted;
		}

		for(let i =0; i < this.videos.length; i++){
			let index = this.post_ids[i].indexOf(id)
			if(index > -1){
				this.videos[i][index].average_vote = vote;
				this.videos[i][index].user_voted = user_voted;
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
	getSorting(type,values){
		
		if(type === 'categories'){
			this.optionValues = values.options ? values.options:null;
			this.timeValues = values.time ? values.time : null;
			this.typeValues = values.type ? values.type : null;
		} else{
			this.videosOptionValues = values.options ? values.options:null;
			this.videosTimeValues = values.time ? values.time : null;
			this.videosTypeValues = values.type ? values.type : null;
		}
		if(type === 'categories'){
			var headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
					'sort':'categories',
					'options':this.optionValues, 
					'time':this.timeValues, 
					'type':this.typeValues
			});
		} else {
			var headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
					'sort':'videos',
					'videos_options':this.videosOptionValues, 
					'videos_time':this.videosTimeValues, 
					'videos_type':this.videosTypeValues
			});
		}
	    this.sortSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos`, {headers: headers}).subscribe(data => {
			if(type === 'categories'){ 
				this.categories = data.json().categories;
				this.videos = data.json().videos;	
				this.setIds('posts');
			} else {
				this.all = data.json().videos;
				this.setIds('all');
			}
			this.setState();
	      },error=>{

		  });
	}
	transition(index){
		let value = $(`#video-toggle-button-${index}`).data('value');
		if(value === 0){
			$(`#video-toggle-button-${index}`).removeClass('fa-chevron-down').addClass('fa-chevron-up').data('value',1);
			$(`#video-block-${index}`).slideDown( "slow", function(){
				$(`.video-categories-play-button-${index}`).css({'display':'block'});
			});
		} else if(value === 1) {
			$(`.video-categories-play-button-${index}`).css({'display':'none'});
			$(`#video-toggle-button-${index}`).removeClass('fa-chevron-up').addClass('fa-chevron-down').data('value',0);
			$(`#video-block-${index}`).slideUp( "slow" );
		}
	}
	displayAll(){
		$(`#loading-spinner-videos`).css({'display':'none'});
		$(`#video-posts-container-all, #video-posts-container-categories`).fadeIn();
   }
	photoHover(state,category,index){
	    if(state){
	      if((this.hovering && this.hoveringIndex === index && this.hoveringCategory === category) || (this.hovering && !this.hoveringCheck)){
	        $(`#play-button-home-videos-${this.hoveringCategory}-${this.hoveringIndex}`).attr("src","/assets/images/blackbutton.svg");
	        $(`#video-artwork-home-${this.hoveringCategory}-${this.hoveringIndex}`).css({'opacity':0.6});
	      }
	      
	      this.hovering = true;
	      this.hoveringCheck = true;
	      this.hoveringIndex = index;
	      this.hoveringCategory = category;
	      $(`#play-button-home-videos-${category}-${index}`).attr("src","/assets/images/orangebutton.svg");
	      $(`#video-artwork-home-${category}-${index}`).css({'opacity':0.9});
	    }else{
	   		
	      this.hoveringCheck=false;
	      //allows cursor to move over play button without changing the image back
	      setTimeout(()=>{
	        if(!this.hoveringCheck){
	          $(`#play-button-home-videos-${category}-${index}`).attr("src","/assets/images/blackbutton.svg");
	           $(`#video-artwork-home-${category}-${index}`).css({'opacity':0.6});
	          this.hovering = false;
	        }
	      },100)
	    }
	  }
	getOffset(type,page){
		let data = [];
		switch(type){
			case 'start':
				data.push(0);
				data.push(1)
				break;
			case 'back':
				data.push((page-1) * 20);
				data.push(page);
				break;
			case 'next':
				data.push((page-1) * 20);
				data.push(page);
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
	changePage(tab,type,page){
		if(tab === 'genres' && (type === 'back' || type === 'next' )) page = type === 'back' ? this.currentPage - 1 : this.currentPage + 1;
		let pageData = this.getOffset(type,page);
		if(tab === 'videos' && page != this.currentPageVideos) $('.btn-pagination-videos.active').removeClass('active')
		else if (tab === 'categories' && page != this.currentPage) $('.btn-pagination-categories.active').removeClass('active')
		if(tab === 'categories'){
			var headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
					'sort':'categories',
					'offset':pageData[0], 
					'options':this.optionValues, 
					'time':this.timeValues, 
					'type':this.typeValues
			});
		} else {
			var headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature'),
					'sort':'videos',
					'tab':tab,
					'video_offset':pageData[0], 
					'video_options':this.videosOptionValues, 
					'video_time':this.videosTimeValues, 
					'video_type':this.videosTypeValues,
					'offset':pageData[0]	
			});
		}
	    
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos`, {headers: headers}).subscribe(data => {
	    	
				if(tab === 'categories'){
					this.categories = data.json().categories;
					this.videos = data.json().videos;
					this.setIds('posts');
					this.offset = data.json().offset;
					this.currentPage = pageData[1];
					this.transition(0);
				} else {
					this.all = data.json().videos;
					this.setIds('all');
					this.currentPageVideos = pageData[1];
					this.videosOffset = data.json().offset;
				}
	    		this.setState();
	    },error=>{

		});
	}
	setState(){
		let orderString, videosOrderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typeValues ? `&type=${this.typeValues}` : ``;

		let videosOffset = '';
		if(this.videosOffset){ videosOffset = this.offset ? `&videos_offset=${this.videosOffset}` : `?videos_offset=${this.videosOffset}`  } else { videosOffset = ``}
		if(videosOffset || offsetString || orderString){videosOrderString = this.videosOptionValues ? `&videos_order=${this.videosOptionValues}` : ``} else{videosOrderString = this.videosOptionValues ? `?videos_order=${this.videosOptionValues}` : ``}
		let videosTime = this.videosTimeValues ?  `&videos_time=${this.videosTimeValues}` : ``;
		let videosType = this.videosTypeValues ?  `&videos_type=${this.videosTypeValues}` : ``;

	    this._location.replaceState(`/videos${offsetString}${orderString}${timeString}${typeString}${videosOffset}${videosOrderString}${videosTime}${videosType}`)
	}
	likeVideo(id, place, liked, type, value, index, childIndex ){
		
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    let videos = index != 'all' ? this.videos[index][childIndex] : this.all[childIndex];
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
	      
			let count = data.json().likes_count;
			let liked = data.json().user_liked;
	        if(liked){
	            $(`#icon-likes-${place}-${id}`).removeClass('fa-heart-o')
				$(`#icon-likes-${place}-${id}`).addClass(' liked-icon fa-heart');
	            $(`#likes-button-${place}-${id}`).addClass(' liked');
	            $(`#likes-${place}-${id}`).html(count);
	        }
	        if(!liked){
	            $(`#icon-likes-${place}-${id}`).removeClass('liked-icon fa-heart')
				$(`#icon-likes-${place}-${id}`).addClass('fa-heart-o');
	            $(`#likes-button-${place}-${id}`).removeClass('liked');
	            $(`#likes-${place}-${id}`).html(count);
	        }

	    },error=>{
			if(error.status === 401){
	          this._modal.setModal('videos');
	      	}
		});
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
	          this.voteChange(id,data.json().vote,data.json().user_vote)
			  this._voteService.change('videos',id,data.json().vote,data.json().user_vote);
	    },error=>{
			if(error.status === 401){
	            this._modal.setModal('videos');
	        }
		});
	      // upVoteSubscription.unsubscribe();
	}
	marqueeToggle(type,name,id){
    	let textwidth = $(`#video-title-link-${name}-${id}`).width();
    	let item = $(`#video-title-link-${name}-${id}`).parent()
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
	photoClicked(index,childIndex,type,form,id){
		let video = type != 'all' ? this.videos[index][childIndex] : this.all[childIndex];
		// video.clicked = true;
		if(form){
			if(window.outerWidth > 780){
				if(type === 'all'){
					this._vidService.change([this.all[childIndex].upload_url,1])
				} else {
					this._vidService.change([this.videos[index][childIndex].upload_url,1])
				}
			} else {
				video.clicked = true;
				this.initVideo(type,id);
			}
			this.videoPlay(video.main_category, video.url)
		} else {
			if(window.outerWidth > 780){
				if(type === 'all'){
					this._vidService.change([this.all[childIndex].link,0,this.all[childIndex].link_type])
				} else {
					this._vidService.change([this.videos[index][childIndex].link,0,this.videos[index][childIndex].link_type])
				}
			} else {
				video.clicked = true;
			}
		}
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
	initVideo(type, id){
		setTimeout(()=>{  
				// if(this.videoJSplayer) this.videoJSplayer.dispose();
					let video = videojs(`video-${type}-${id}`, {}, function() {
           			 // This is functionally the same as the previous example.
        			});
					video.requestFullscreen();
					this.videoJSplayer.push(video);
		},1)
	}
	getVideosRest(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typeValues);
		this.getRestSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/rest`, {headers:headers}).subscribe(data => {
			if(data.json().success){
				this.videos = this.videos.concat(data.json().videos);
				this.setIds('posts');
			}
		});
	}
	ngOnDestroy(){
		$('.container').removeClass('extended-container');
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.getRestSubscription) this.getRestSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
		if(this.videoJSplayer.length > 0) $.each( this.videoJSplayer, function( i, val ) { val.dispose();}); //not sure if this is neccessary. Check heap.
	}
}
