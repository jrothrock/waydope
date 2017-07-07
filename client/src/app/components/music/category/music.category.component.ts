import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { Location } from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {VoteService} from '../../../services/vote.service';
declare var $;
declare var WaveSurfer;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'music_category',
  templateUrl: 'music.category.component.html',
  providers:[FormBuilder,ModalComponent]
})

export class MusicCategoryComponent implements OnInit {
	sortMusic:FormGroup;
	category:any;
	songs:any=[];
	error:boolean=true;
	subscription:any;
	playSubscription:any;
	voteSubscription:any;
	sortSubscription:any;
	likeSubscription:any;
	routeSubscription:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	downloadSubscription:any;
	totalCount:number;
	hovering:boolean=false;
 	hoveringCheck:boolean=false;
  	hoveringIndex:number;
  	hoveringCategory:string;
  	audioPlaying:boolean=false;
  	wavesurfer:any=[];
  	currentlyPlaying:any;
  	currentlyPlayingId:number;
  	currentlyPlayingType:string;
  	loadingPlayer:boolean=false;
  	options:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typeValues:any=['Descending','Ascending'];
  	featuredsValue:any=[0,1];
  	offset:number;
  	disabledTimeSelect:boolean=false;
  	disabledSelects:boolean=false;
  	optionValues:any;
  	timeValues:any;
  	typesValues:any;
  	currentPage:number;
  	pages:number;
  	total:number;
  	numbers:any;
	math:any=Math;
	server_url:string;
	ids:any=[];
	elapsed_time:any;
	constructor(private _auth:AuthService, private _voteService : VoteService, private _backend: BackendService, private _router: Router, private _http: Http,private _route: ActivatedRoute, private _modal: ModalComponent, private _fb: FormBuilder, private _location: Location){};
	ngOnInit(){
		this.server_url = this._backend.SERVER_URL;
		$('.container').addClass('extended-container');
		let decoded = decodeURIComponent(window.location.search.substring(1))
		let params = decoded.split("&");
		this.sortMusic = this._fb.group({
	      'options': ['Votes', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    })
		for(let i = 0;i < params.length; i++){
			let key = params[i].split("=")[0]
			let value = params[i].split("=")[1]
			switch(key){
				case 'offset':
					this.offset = parseInt(value);
					break;
				case 'order':
					this.optionValues = value;
					this.sortMusic.patchValue({'options':this.optionValues})
					break;
				case 'time':
					this.timeValues = value;
					this.sortMusic.patchValue({'time':this.timeValues})
					break;
				case 'type':
					this.typesValues = value;
					this.sortMusic.patchValue({'type':this.typesValues})
					break;
			}
		}
		this.currentPage = (this.offset / 20) + 1;
		this.routeSubscription = this._route.params.subscribe(params => {this.category = params['genre']});
		this.getMusic();
		_setMeta.setCategory('music',this.category);
		this.voteCheck();
	};
	getMusic(){
		let headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		headersInit.append('offset', offset);
		headersInit.append('order', this.optionValues);
		headersInit.append('time', this.timeValues);
		headersInit.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/music/${this.category}`,{headers: headersInit}).subscribe(data => {
			this.totalCount = data.json().songs.length;
			this.songs = data.json().songs;
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
				this.songs = false; //this is done so that the *ngif doesn't have to double bang in the view.
				setTimeout(()=>{
					this.displayAll();
				},150)
			} else {
				this.error = true;
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
    		setTimeout(()=>{$('#type').val('Ascending'); this.sortMusic.patchValue({type:'Ascending'}) },1);
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
    		setTimeout(()=>{$('#type').val('Descending'); this.sortMusic.patchValue({type:'Descending'})},1);
    		this.disabledSelects = false;
    	}
	}

	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		if(index > -1){
			this.songs[index].average_vote = vote;
			this.songs[index].user_voted = user_voted;
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
		for(let i =0; i < this.songs.length; i++){
			this.ids.push(this.songs[i].uuid);
		}
	}

	stopAudio(type,id){
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].playPause();
		$(`#song-${this.currentlyPlayingType}-${this.currentlyPlayingId}`).data('value',0);
        $(`#play-icon-${this.currentlyPlayingType}-${this.currentlyPlayingId}`).removeClass('fa-pause').addClass('fa-play');
        this.audioPlaying = false;
	}

	startAudio(type,id,place){
		$(`#song-${type}-${id}`).data('value',1);
        $(`#play-icon-${type}-${id}`).removeClass('fa-play').addClass('fa-pause');
        this.audioPlaying = true;
        this.currentlyPlaying = place;
        this.currentlyPlayingId = id;
        this.currentlyPlayingType = type;
        this.wavesurfer[place].playPause()
        if(this.loadingPlayer) this.loadingPlayer = false;
	}

	playAudio(type,id,url,index=null){
	  if((!this.loadingPlayer && index === null) || (this.loadingPlayer && index != null)){
	      let value = $(`#song-${type}-${id}`).data('value');
	      let place = index ? index : $(`#song-${type}-${id}`).data('place');
	      if((this.currentlyPlaying != null) && (this.currentlyPlaying != place)){
	      	this.stopAudio(type,id);
	      	this.startAudio(type,id,place);
	      }	else if(value===0) {
	       this.startAudio(type,id,place);
	      } else {
	       this.stopAudio(type,id);
	      }
	      this.wavesurfer[place].on('finish', ()=>{
	      	$(`#song-${type}-${id}`).data('value',0);
	        $(`#play-icon-${type}-${id}`).removeClass('fa-pause').addClass('fa-play');
	        this.audioPlaying = false;
	      });
		this.wavesurfer[place].on('audioprocess', (data)=>{
					// this will help cut back on the cpu usage a little
			if(Math.floor(data) != this.elapsed_time){
				this.elapsed_time = Math.floor(data);
				let minutes = Math.floor(data / 60)
				let seconds = Math.floor(data % 60)
				$(`#current-time-${type}-${id}`).text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds }`);
			}
		   })
	   }
    }

   	waveSurferCreate(type,index,url){
		let height;
		if(window.outerWidth <= 500){
			height=60;
		} else if(window.outerWidth > 500 && window.outerWidth < 768){
			height = 100;
		} else if(window.outerWidth > 768 && window.outerWidth < 800){
			height=80;
		} else if (window.outerWidth > 800 && window.outerWidth < 1000){
			height = 100;
		} else if(window.outerWidth >= 1000){
			height = 110;
		} 
	    let surfer = WaveSurfer.create({
	        container: `#waveform-${type}-${index}`,
	        waveColor: '#ddd',
	        progressColor: '#ff6100',
			height: height,
	        barWidth: 2,
	        normalize:true,
	      });
	    this.wavesurfer.push(surfer);
	    let newid = this.wavesurfer.length - 1;
	    $(`#song-${type}-${index}`).data('place',newid);
	    this.loadingPlayer = true;
	    this.wavesurfer[newid].load(`${url}`);
	    this.wavesurfer[newid].on('ready',()=>{
	    	this.playAudio(type,index,url,newid);
			let time = this.wavesurfer[newid].getDuration()
			let minutes = Math.floor(time / 60)
			let seconds = Math.floor(time % 60)
			$(`#duration-${type}-${index}`).text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
			$(`#song-playing-time-${type}-${index}`).css({'display':'block'})
	    });
  	}
	checkVolume(type,id,category,click=false){
		if(type && !click){
			$(`#${category}-${id}-volume-range`).on("change mousemove", ()=> {
			let index = $(`#song-${category}-${id}`).data('place');
			if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range`).val())/100)
			});
		} else if(!click) {
			$(`#${category}-${id}-volume-range`).unbind("change mousemove");
		} else {
			let index = $(`#song-${category}-${id}`).data('place');
			if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range`).val())/100)
		}
	}
	download(genre,url,title,type){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {}
		this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${genre}/${url}/download`, body, {headers: headers}).subscribe(data => {
			// (<any>window).location = data.json().url;
			let tag = document.createElement('a');
			tag.setAttribute('href', data.json().url);
			tag.setAttribute('target', "_blank");
			tag.setAttribute('download', title);
			tag.click();
		},error=>{

		});
	}
	loop(id,category){
		let index = $(`#song-${category}-${id}`).data('place');
		let wavesurfer = this.wavesurfer[index];
		let loop = $(`#song-${category}-${id}-repeat`).data('loop')
		if(!loop){
		wavesurfer.un('finish');
		wavesurfer.on('finish',()=>{
			this.startAudio(category,id,index);
		});
		$(`#song-${category}-${id}-repeat`).addClass('active');
		let loop = $(`#song-${category}-${id}-repeat`).data('loop',1)
		} else {
		wavesurfer.un('finish');
		$(`#song-${category}-${id}-repeat`).removeClass('active');
		let loop = $(`#song-${category}-${id}-repeat`).data('loop',0)
		this.wavesurfer[index].on('finish', ()=>{
			$(`#song-${category}-${id}`).data('value',0);
			$(`#play-icon-${category}-${id}`).removeClass('fa-pause').addClass('fa-play');
			this.audioPlaying = false;
		});
		}
	}

  	like(id, liked, type, value, sectionType, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
	      	let song = this.songs[index];
	        if(!liked){
	            $(`#icon-likes-${id}`).addClass(' liked-icon fa-heart');
	            $(`#icon-likes-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-${id}`).addClass(' liked');
	            $(`#likes-${id}`).html(`${value + 1}`);
	            song.likes_count = song.likes_count + 1;
	            song.user_liked = !song.user_liked;
	        }
	        if(liked){
	            $(`#icon-likes-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-${id}`).removeClass('liked');
	            $(`#likes-${id}`).html(`${value - 1}`);
	            song.likes_count = song.likes_count - 1;
	            song.user_liked = !song.user_liked;
	        }
	    },error=>{
			if(error.status === 401){
	          this._modal.setModal('music', this.category);
			} else if (error.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(error.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
		});
	}
	songPlay(genre,url){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {}
	    this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${genre}/${url}/play`, body, {headers: headers}).subscribe(data => {
		});
	}
	transformRating(average_rating){
    	return `translateX(${average_rating}%)`
  	}
  	setVote(vote,id,type,average_vote,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":"music", "vote":vote, "already_voted":voted}
		  this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			  let change;
			  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			  else if(vote === 1 && !voted) change = 1;
			  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			  else if(vote === -1 && !voted) change = -1;
	          this.voteChange(id,average_vote+change,data.json().user_vote)
			  this._voteService.change('music',id,average_vote+change,data.json().user_vote);
	      },error=>{
			  if(error.status === 401){
	            this._modal.setModal('music', this.category);
			  } else if (error.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			  } else if(error.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			  }
		  });
	      // upVoteSubscription.unsubscribe();
	}
	getSorting(values){
		this.optionValues = values.options ? values.options:null;
		this.timeValues = values.time ? values.time : null;
		this.typesValues = values.type ? values.type : null;
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues, 'genre':this.category}
	      this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/genre/sort`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
	     		this.songs = data.json().songs;	
				this.setIds();
	     		this.offset = data.json().offset;
	     		this.setState();
	        }
	      });
	}
	displayAll(){
		$(`#loading-spinner-music-category`).css({'display':'none'});
		$(`#music-category-container`).fadeIn();
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
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {'genre': this.category, 'offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
	    this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/genre/paginate`, body, {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    		this.songs = data.json().songs;
				this.setIds();
	    		this.offset = data.json().offset;
	    		this.currentPage = pageData[1];
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
	    this._location.replaceState(`/music/${this.category}${offsetString}${orderString}${timeString}${typeString}`)
	}
	photoHover(state,category,index){
	    if(state){
	      if((this.hovering && this.hoveringIndex === index && this.hoveringCategory === category) || (this.hovering && !this.hoveringCheck)){
	        $(`#play-button-home-${this.hoveringCategory}-${this.hoveringIndex}`).attr("src","/assets/images/blackbutton.svg");
	        $(`#music-artwork-home-${this.hoveringCategory}-${this.hoveringIndex}`).css({'opacity':0.6});
	      }
	      this.hovering = true;
	      this.hoveringCheck = true;
	      this.hoveringIndex = index;
	      this.hoveringCategory = category;
	      $(`#play-button-home-${category}-${index}`).attr("src","/assets/images/orangebutton.svg");
	      $(`#music-artwork-home-${category}-${index}`).css({'opacity':0.9});
	    }else{
	      this.hoveringCheck=false;
	      //allows cursor to move over play button without changing the image back
	      setTimeout(()=>{
	        if(!this.hoveringCheck){
	          $(`#play-button-home-${category}-${index}`).attr("src","/assets/images/blackbutton.svg");
	           $(`#music-artwork-home-${category}-${index}`).css({'opacity':0.6});
	          this.hovering = false;
	        }
	      },100)
	    }
	}
	photoClicked(type,index,form,value=true){
		let song = this.songs[index];
		song.clicked = value;
		if(form){
	 		setTimeout(()=>{
				this.waveSurferCreate(type,index,song.upload_url);
				this.songPlay(song.main_genre,song.url)
			},50);
		}
	}
	flipInit(id,type,form){
		$(`#card-${id}`).flip({trigger:'click'});
	}
	flipCard(id,type,form){
		$(`#card-${id}`).flip({'trigger':'manual'});
		setTimeout(()=>{
			$(`#card-${id}`).flip(true);
		let isflipped = $(`#card-${id}`).data('flipped');
		if(!isflipped){
			$(`#card-${id}`).data('flipped',1);
			setTimeout(()=>{
				this.photoClicked(type,id,form,true);
			},500)
		} else {
			// this.photoClicked(type,id,form,true);
		}
		// $(`#card-${id}`).flip();

		},50)
	}
	searchArtist(artist){
		this._router.navigateByUrl(`/search?category=All&search=${artist}`);
	}
	marqueeToggle(type,index){
    	let textwidth = $(`#music-title-link-${index}`).width();
    	let item = $(`#music-title-link-${index}`).parent()
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
	ngOnDestroy(){
		$('.container').removeClass('extended-container');
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.likeSubscription) this.likeSubscription.unsubscribe();
		if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.routeSubscription) this.routeSubscription.unsubscribe();
		if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
	}

}
