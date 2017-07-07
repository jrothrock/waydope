import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Location } from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';

declare var $;
declare var WaveSurfer;
declare var Materialize;
declare var _setMeta;

@Component({
  selector: 'music_all',
  templateUrl: 'music.all.component.html',
  providers: [FormBuilder,AuthService, ModalComponent]
})

export class MusicAllComponent implements OnInit {
	sortGenre:FormGroup;
	sortMusic:FormGroup;
  	genres:any=[];
  	songs:any=[]; // songs is for the songs in the genres tab.
	all:any=[]; // all is for the songs in the all music tab.
	error:boolean=false;
	submittedMusic:boolean=false;
	subscription:any;
	playSubscription:any;
	voteSubscription:any;
	likeSubscription:any;
	sortSubscription:any;
	sortMusicSubscription:any;
	paginateSubscription:any;
	paginateMusicSubscription:any;
	getRestSubscription:any;
	watchVoteSubscription:any;
	downloadSubscription:any;
	hovering:boolean=false;
 	hoveringCheck:boolean=false;
  	hoveringIndex:number;
  	hoveringCategory:string;
  	wavesurfer:any=[];
  	audioPlaying:boolean=false;
  	currentlyPlaying:number;
  	currentlyPlayingId:number;
  	currentlyPlayingType:string;
  	loadingPlayer:boolean=false;
  	options:any=['Number of Posts','Alphabetically', 'Newest', 'Oldest'];
	optionsMusic:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
  	// options:any=['Number of Posts','Number Of Subscribers','Alphabetically', 'Newest', 'Oldest'];
  	optionsValues:any=['Posts','Alphabetically','Newest','Oldest'];
  	// optionsValues:any=['Posts','Subscribers','Alphabetically','Newest','Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typesValues:any=['Descending','Ascending'];
	musicTypes:any=['Highest To Lowest','Lowest To Highest'];
	musicTypesValues:any=['Descending','Ascending'];
	tabTypes=['music','genres'];
  	disabledSelects:boolean=false;
  	disabledTimeSelect:boolean=false;
	musicDisabledSelects:boolean=false;
	musicDisabledTimeSelects:boolean=false;
  	offset:number;
	musicOffset:number;
  	optionValues:any;
  	timeValues:any;
  	typeValues:any;
	musicOptionValues:any;
  	musicTimeValues:any;
  	musicTypeValues:any;
  	currentPage:number;
  	pages:number;
  	total:number;
  	numbers:any;
	currentPageMusic:number;
  	pagesMusic:number;
  	totalMusic:number;
  	numbersMusic:any;
	math:any=Math;
	server_url:string;
	all_ids:any=[];
	post_ids:any=[];
	downloading:boolean=false;
	elapsed_time:any;
	constructor(private _http:Http, private _voteService: VoteService, private _backend: BackendService, private _router: Router, private _auth: AuthService,private _modal: ModalComponent,private _fb:FormBuilder, private _location: Location){};
	ngOnInit(){
		_setMeta.setType('music');
		this.server_url = this._backend.SERVER_URL;
		$('.container').addClass('extended-container');
		this.sortGenre = this._fb.group({
	      'options': ['Posts', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    });
		this.sortMusic = this._fb.group({
	      'options': ['Votes', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    });
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
					this.sortGenre.patchValue({'options':this.optionValues})
					break;
				case 'time':
						this.timeValues = value;
						this.sortGenre.patchValue({'time':this.timeValues})			
					break;
				case 'type':
						this.typeValues = value;
						this.sortGenre.patchValue({'type':this.typeValues})
					break;
				case 'music_offset':
					this.musicOffset = parseInt(value);
					break;
				case 'music_order':
					this.musicOptionValues = value;
					this.sortMusic.patchValue({'options':this.musicOptionValues})
					break;
				case 'music_time':
					this.musicTimeValues = value;
					this.sortMusic.patchValue({'time':this.musicTimeValues})
					break;
				case 'music_type':
					this.musicTypeValues = value;
					this.sortMusic.patchValue({'type':this.musicTypeValues})
					break;
			}
		}
		if(this.optionValues){
			setTimeout(()=>{
				this.onOptionsChange('genres',this.optionValues)
			}, 5)
		}
		if(this.musicOptionValues){
			setTimeout(()=>{
				this.onOptionsChange('music',this.musicOptionValues)
			}, 10)
		}
		this.currentPage = (this.offset / 20) + 1;
		this.currentPageMusic = (this.musicOffset / 20) + 1;
		this.getMusic();
		this.voteCheck();
	};
	getMusic(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
		let musicOffset = this.musicOffset ? this.musicOffset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typeValues);
		headers.append('moffset', musicOffset);
		headers.append('morder', this.musicOptionValues);
		headers.append('mtime', this.musicTimeValues);
		headers.append('mtype', this.musicTypeValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/music`, {headers:headers}).subscribe(data => {
				this.genres = data.json().genres;
				this.songs = data.json().songs;
				this.setIds('posts');
				this.offset = this.offset ? this.offset : data.json().offset;
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.all = data.json().all;
				this.setIds('all');
				this.pagesMusic = data.json().music_pages;
				this.totalMusic = data.json().music_count; 
				this.numbers = Array(this.pages).fill(1);
				this.numbersMusic = Array(this.pagesMusic).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
				this.currentPageMusic = this.currentPageMusic ? this.currentPageMusic : data.json().music_page;
				this.getSongsRest();			
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
		for(let i =0; i < this.songs.length; i++){
			this.post_ids.push([]);
			for(let ic = 0; ic < this.songs[i].length; ic++ ){
				this.post_ids[i].push(this.songs[i][ic].uuid);
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

		for(let i =0; i < this.songs.length; i++){
			let index = this.post_ids[i].indexOf(id)
			if(index > -1){
				this.songs[i][index].average_vote = vote;
				this.songs[i][index].user_voted = user_voted;
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

	// it's times like these where I wish I could pass pointers instead of the value
	// putting them in objects would just look weird too
	onOptionsChange(type,value) {
		let $time = type === 'genres' ? $('#time') : $('#time-music');
		let $type = type === 'genres' ? $('#type') : $('#type-music');
		// let types = type === 'genres' ? this.types : this.musicTypes;
		// let typesValues = type === 'genres' ? this.typesValues : this.musicTypesValues;
		let disabledSelects = type === 'genres' ? this.disabledSelects : this.musicDisabledSelects;
		let disabledTimeSelect = type === 'genres' ? this.disabledTimeSelect : this.musicDisabledTimeSelects;
		let sort = type === 'genres' ? this.sortGenre : this.sortMusic;
    	if(value === 'Newest' || value === 'Oldest'){
			if(type === 'genres'){
				this.disabledTimeSelect = false
				this.disabledSelects = true;
			} else {
				this.musicDisabledTimeSelects = false
				this.musicDisabledSelects = true;
			}
    		$time.val('');
    		$time.prop('disabled', 'disabled');
    		$type.val('');
    		$type.prop('disabled', 'disabled');
    	} else if(value === 'Alphabetically'){
    		if(disabledSelects){
    			$type.prop('disabled', false); 
				if(type === 'genres') this.disabledSelects = false
				else this.musicDisabledSelects = false;
    		}

			if(type === 'genres') {
				this.disabledTimeSelect = true;
				this.types=['A-Z','Z-A'];
				this.typesValues=['Ascending','Descending'];
			}
			else { 
				this.musicDisabledTimeSelects = true;
				this.musicTypes=['A-Z','Z-A'];
				this.musicTypesValues=['Ascending','Descending'];
			}
    		$time.val('');
    		$time.prop('disabled', 'disabled');
    		setTimeout(()=>{$type.val('Ascending'); sort.patchValue({type:'Ascending'}) },1);
    	} else if(disabledTimeSelect){
			if(type === 'genres'){
    			this.types=['Highest To Lowest','Lowest To Highest'];
    			this.typesValues=['Descending','Ascending'];
				this.disabledTimeSelect = false;
			} else {
				this.musicTypes=['Highest To Lowest','Lowest To Highest'];
    			this.musicTypesValues=['Descending','Ascending'];
				this.musicDisabledTimeSelects = false;
			}
    		$type.val('')
    		$time.val('All Time');
    		$time.prop('disabled', false);
    	} else if(disabledSelects) {
			if(type === 'genres'){
				this.types=['Highest To Lowest','Lowest To Highest'];
    			this.typesValues=['Descending','Ascending'];
				this.disabledSelects = false;
			} else {
				this.musicTypes=['Highest To Lowest','Lowest To Highest'];
    			this.musicTypesValues=['Descending','Ascending'];
				this.musicDisabledSelects = false;
			}
    		$time.prop('disabled', false); 
    		$time.val('All Time');
    		$type.prop('disabled', false); 
    		setTimeout(()=>{$type.val('Descending'); sort.patchValue({type:'Descending'})},1);
    	}
	}


   displayAll(){
		$(`#loading-spinner-music`).css({'display':'none'});
		$(`#music-posts-container-all, #music-posts-container-genres`).fadeIn();
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

	searchArtist(artist){
		this._router.navigateByUrl(`/search?category=All&search=${artist}`);
	}

    waveSurferCreate(type,index,url,id){
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
	        container: `#waveform-${type}-${id}`,
	        waveColor: '#ddd',
			height:height,
	        progressColor: '#ff6100',
	        barWidth: 2,
	        normalize:true,
	      });
	    this.wavesurfer.push(surfer);
	    let newid = this.wavesurfer.length - 1;
	    $(`#song-${type}-${id}`).data('place',newid);
	    this.loadingPlayer = true;
	    this.wavesurfer[newid].load(`${url}`);
	    this.wavesurfer[newid].on('ready',()=>{
	    	this.playAudio(type,id,url,newid);
			let time = this.wavesurfer[newid].getDuration()
			let minutes = Math.floor(time / 60)
			let seconds = Math.floor(time % 60)
			$(`#duration-${type}-${id}`).text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
			$(`#song-playing-time-${type}-${id}`).css({'display':'block'})
	    });
  	}

    marqueeToggle(type,name,index){
    	let textwidth = $(`#music-title-link-${name}-${index}`).width();
    	let item = $(`#music-title-link-${name}-${index}`).parent()
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

    getSorting(type,values){
		if(type === 'genres'){
			this.optionValues = values.options ? values.options:null;
			this.timeValues = values.time ? values.time : null;
			this.typeValues = values.type ? values.type : null;
		} else{
			this.musicOptionValues = values.options ? values.options:null;
			this.musicTimeValues = values.time ? values.time : null;
			this.musicTypeValues = values.type ? values.type : null;
		}
    	if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause()
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = type === 'genres' ? {'sort':'genres','options':this.optionValues, 'time':this.timeValues, 'type':this.typeValues } : 
		{'sort':'music','music_options':this.musicOptionValues, 'music_time':this.musicTimeValues, 'music_type':this.musicTypeValues }
	    this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music`, body, {headers: headers}).subscribe(data => {
			if(type === 'genres'){ 
				this.genres = data.json().genres;
				this.songs = data.json().songs;	
				this.setIds('songs');
			} else {
				this.all = data.json().songs;
				this.setIds('all');
			}
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
		// the front end keeps returning NAN for currentPage +/- 1. Even though if you put the currentPage it shows a number. IDK why.
		if(tab === 'genres' && (type === 'back' || type === 'next' )) page = type === 'back' ? this.currentPage - 1 : this.currentPage + 1;
		let pageData = this.getOffset(type,page);
		if(tab === 'music' && page != this.currentPageMusic) $(`.btn-pagination-music.active`).removeClass('active')
		else if(tab === 'genres' && page != this.currentPage) $(`.btn-pagination-genres.active`).removeClass('active')
		var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = tab === 'genres' ? {'sort':'genres','offset':pageData[0], 'options':this.optionValues, 'time':this.timeValues, 'type':this.typeValues} : {'sort':tab,'music_offset':pageData[0], 'music_options':this.musicOptionValues, 'music_time':this.musicTimeValues, 'music_type':this.musicTypeValues}
		this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music`, body, {headers: headers}).subscribe(data => {
			if(tab === 'genres'){
				this.genres = data.json().genres;
				this.songs = data.json().songs;
				this.setIds('songs');
				this.offset = data.json().offset;
				this.transition(0);
				this.currentPage = pageData[1];
			} else {
				this.all = data.json().songs;
				this.setIds('all');
				this.currentPageMusic = pageData[1];
				this.musicOffset = data.json().offset;
			}
			this.setState();
	    },error=>{

		});
	}
	setState(){
		let orderString, musicOrderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typeValues ? `&type=${this.typeValues}` : ``;

		let musicOffset = '';
		if(this.musicOffset){ musicOffset = this.offset ? `&music_offset=${this.musicOffset}` : `?music_offset=${this.musicOffset}`  } else { musicOffset = ``}
		if(musicOffset || offsetString || orderString){musicOrderString = this.musicOptionValues ? `&music_order=${this.musicOptionValues}` : ``} else{musicOrderString = this.musicOptionValues ? `?music_order=${this.musicOptionValues}` : ``}
		let musicTime = this.musicTimeValues ?  `&music_time=${this.musicTimeValues}` : ``;
		let musicType = this.musicTypeValues ?  `&music_type=${this.musicTypeValues}` : ``;

	    this._location.replaceState(`/music${offsetString}${orderString}${timeString}${typeString}${musicOffset}${musicOrderString}${musicTime}${musicType}`)
	}

	transition(index){
		let value = $(`#song-toggle-button-${index}`).data('value');
		if(value === 0){
			$(`#song-toggle-button-${index}`).removeClass('fa-chevron-down').addClass('fa-chevron-up').data('value',1);
			$(`#song-block-${index}`).slideDown( "slow", function(){
				$(`.music-categories-play-button-${index}`).css({'display':'block'});
			});
			//the downvote button sticks during the slide... --- this may have to do with it being position relative. Doesn't happen on videos.
			setTimeout(()=>{
				$(`.music-categories-downvote-${index}`).css({'display':'block'});
			},475)
		} else if(value === 1) {
			$(`.music-categories-downvote-${index}`).css({'display':'none'});
			$(`.music-categories-play-button-${index}`).css({'display':'none'});
			$(`#song-toggle-button-${index}`).removeClass('fa-chevron-up').addClass('fa-chevron-down').data('value',0);
			$(`#song-block-${index}`).slideUp( "slow" );
		}
	}

	like(id, liked, type, value, index, childIndex ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    let songs = index != 'all' ? this.songs[index][childIndex] : this.all[childIndex];
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
			if(!liked){
				$(`#icon-likes-${id}`).addClass(' liked-icon fa-heart');
				$(`#icon-likes-${id}`).removeClass('fa-heart-o');
				$(`#likes-button-${id}`).addClass(' liked');
				$(`#likes-${id}`).html(`${value + 1}`);
				songs.likes_count = songs.likes_count + 1;
				songs.user_liked = !songs.user_liked;
			}
			if(liked){
				$(`#icon-likes-${id}`).addClass('fa-heart-o');
				$(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
				$(`#likes-button-${id}`).removeClass('liked');
				$(`#likes-${id}`).html(`${value - 1}`);
				songs.likes_count = songs.likes_count - 1;
				songs.user_liked = !songs.user_liked;
			}
	    },error=>{
			if(error.status === 401){
	          this._modal.setModal('music');
			} else if (error.locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(error.archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
		});
	}

	photoClicked(index,childIndex,name,form,id){
		let song = name != 'all'? this.songs[index][childIndex] : this.all[childIndex]
	 	song.clicked = true;
	 	if(form){
	 		setTimeout(()=>{
	 			this.waveSurferCreate(name,childIndex, song.upload_url,id);
				this.songPlay(song.main_genre,song.url)
	 		},50);
	 	}
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
	          	  this._modal.setModal('music');
				} else if (error.json().locked){
					Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
				} else if(error.json().archived){
					Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
				}
		  });
	      // upVoteSubscription.unsubscribe();
	}
	checkVolume(type,id,category,click=false){
		if(type && !click){
			$(`#${category}-${id}-volume-range`).on("change mousemove", ()=> {
			let index = $(`#song-${category}-${id}`).data('place');
			if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range`).val())/100)
			});
		} else if(!click) {
			$(`#${category}-${id}-volume-range`).unbind("change mousemove");
		} else{
			let index = $(`#song-${category}-${id}`).data('place');
			if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range`).val())/100)
		}
	}
	download(genre,url,title,type){
		if(!this.downloading){
			let headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {}
			this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${genre}/${url}/download`, body, {headers: headers}).subscribe(data => { 
				if(type===1){
					// (<any>window).location = data.json().url;
					let tag = document.createElement('a');
					tag.setAttribute('href', data.json().url);
					tag.setAttribute('target', "_blank");
					tag.setAttribute('download', title);
					tag.click();
				}
				this.downloading=false;
			},error=>{

			});
		}
	}
	loop(id,category){
		let index = $(`#song-${category}-${id}`).data('place');
		let wavesurfer = this.wavesurfer[index];
		let loop = $(`#song-${category}-${id}-repeat`).data('loop');
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
	transformRating(average_rating){
	    return `translateX(${average_rating}%)`
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
	getSongsRest(){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken());
		let offset = this.offset ? this.offset.toString() : null;
		headers.append('offset', offset);
		headers.append('order', this.optionValues);
		headers.append('time', this.timeValues);
		headers.append('type', this.typeValues);
		this.getRestSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/music/rest`, {headers:headers}).subscribe(data => {
			if(data.json().success){
				this.songs = this.songs.concat(data.json().songs);
				this.setIds('posts');
			}
		});
	}
	ngOnDestroy() {
	    // prevent memory leak when component destroyed
	    $('.container').removeClass('extended-container');
	    if(this.subscription) this.subscription.unsubscribe();
	    if(this.voteSubscription) this.voteSubscription.unsubscribe();
	    if(this.likeSubscription) this.likeSubscription.unsubscribe();
	    if(this.sortSubscription) this.sortSubscription.unsubscribe();
		if(this.sortMusicSubscription) this.sortMusicSubscription.unsubscribe();
	    if(this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.paginateMusicSubscription) this.paginateMusicSubscription.unsubscribe();
		if(this.getRestSubscription) this.getRestSubscription.unsubscribe();
	    if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].pause();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
	}
}
