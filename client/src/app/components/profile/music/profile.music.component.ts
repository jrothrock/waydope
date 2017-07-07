import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers} from '@angular/http';
import { Location } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import {VoteService} from '../../../services/vote.service';

declare var $;

declare var WaveSurfer;

@Component({
  selector: 'profile_music',
  templateUrl: 'profile.music.component.html'
})

export class ProfileMusicComponent implements OnInit {
    sortMusic:FormGroup;
    music:any=[];
	error:boolean=true;
	loaded:boolean=false;
    subscription:any;
	likeSubscription:any;
    sortSubscription:any;
    paginateSubscription:any;
	voteSubscription:any;
	routeSubscription:any;
	watchVoteSubscription:any;
	downloadSubscription:any;
	playSubscription:any;
    user:string=null;
	iscurrentUser:boolean=false;
    totalCount:number;
	hovering:boolean=false;
 	hoveringCheck:boolean=false;
  	hoveringIndex:number;
  	hoveringCategory:string;
  	audioPlaying:boolean=false;
  	wavesurfer:any=[];
  	currentlyPlaying:any;
  	currentlyPlayingId:number;
  	loadingPlayer:boolean=false;
  	options:any=['Votes','Rating','Likes','Alphabetically', 'Newest', 'Oldest'];
  	timings:any=['Day','Week','Month','Year','All Time'];
  	types:any=['Highest To Lowest','Lowest To Highest'];
  	typeValues:any=['Descending','Ascending'];
  	featureds:any=['Include', 'Exclude'];
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
	downloading:boolean=false;
	constructor(private _fb: FormBuilder, private _voteService : VoteService, private _backend: BackendService, private _http: Http, private _location: Location, private _modal: ModalComponent, private _route: ActivatedRoute, private _router: Router, private _auth: AuthService, private _sysMessages: SystemMessagesComponent){};
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
		this.sortMusic = this._fb.group({
	      'options': ['Votes', Validators.required],
	      'time': ['All Time', Validators.required],
	      'type': ['Descending', Validators.required]
	    })
        this.routeSubscription = this._route.params.subscribe(params => {this.user = params['user']});
        this.iscurrentUser = localStorage.getItem('username') === this.user ? true : false;
        this.getMusic();
		this.voteCheck();
    };
    getMusic(){
		let headersInit = new Headers();
		headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
		let offset = this.offset ? this.offset.toString() : null;
        headersInit.append('user', this.user);
		headersInit.append('offset', offset);
		headersInit.append('order', this.optionValues);
		headersInit.append('time', this.timeValues);
		headersInit.append('type', this.typesValues);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${this.user}/music`,{headers: headersInit}).subscribe(data => {
				this.totalCount = data.json().posts.length;
				this.music = data.json().posts;
				this.setIds();
				this.offset = this.offset ? this.offset : data.json().offset;
				this.total = data.json().count;
				this.pages = data.json().pages;
				this.numbers = Array(this.pages).fill(1);
				this.currentPage = this.currentPage ? this.currentPage : data.json().page;
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				})
		},error=>{
			if(error.status === 404){
				this.loaded = true;
				setTimeout(()=>{
					this.displayAll();
				})
			} else {
				this.error = true;
			}
		});
	}

	voteChange(id,vote,user_voted){
		let index = this.ids.indexOf(id);
		if(index > -1){
			this.music[index].average_vote = vote;
			this.music[index].user_voted = user_voted;
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
		for(let i =0; i < this.music.length; i++){
			this.ids.push(this.music[i].uuid);
		}
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

	stopAudio(id){
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].playPause();
		$(`#song-${this.currentlyPlayingId}`).data('value',0);
        $(`#song-play-icon-${this.currentlyPlayingId}`).removeClass('fa-pause').addClass('fa-play');
        this.audioPlaying = false;
	}

	startAudio(id,place){
		$(`#song-${id}`).data('value',1);
        $(`#song-play-icon-${id}`).removeClass('fa-play').addClass('fa-pause');
        this.audioPlaying = true;
        this.currentlyPlaying = place;
        this.currentlyPlayingId = id;
        this.wavesurfer[place].playPause()
        if(this.loadingPlayer) this.loadingPlayer = false;
	}

	playAudio(id,url,index=null){
        // this error occurs in the same way the wavesurfer create does. Try block is current patch.
    try{
	  if((!this.loadingPlayer && index === null) || (this.loadingPlayer && index != null)){
	      let value = $(`#song-${id}`).data('value');
	      let place = index ? index : $(`#song-${id}`).data('place');
	      if((this.currentlyPlaying != null) && (this.currentlyPlaying != place)){
	      	this.stopAudio(id);
	      	this.startAudio(id,place);
	      }	else if(value===0) {
	       this.startAudio(id,place);
	      } else {
	       this.stopAudio(id);
	      }
	      this.wavesurfer[place].on('finish', ()=>{
	      	$(`#song-${id}`).data('value',0);
	        $(`#song-play-icon-${id}`).removeClass('fa-pause').addClass('fa-play');
	        this.audioPlaying = false;
	      });
		  this.wavesurfer[place].on('audioprocess', (data)=>{
			    // this will help cut back on the cpu usage a little
			if(Math.floor(data) != this.elapsed_time){
				this.elapsed_time = Math.floor(data);
				let minutes = Math.floor(data / 60)
				let seconds = Math.floor(data % 60)
				$(`#current-time-${id}`).text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds }`);
			}
			})
	   }
     } catch(err) {
            
        }
    }

   	waveSurferCreate(id,url){
        // wavesurfer will throw an error if the user hovers over the photo and proceeds to leave the component
        // before the animation is finished. This should later be dealt with by adding params to prevent this,
        // but this try block is fine for now.
        try {
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
                container: `#song-waveform-${id}`,
                waveColor: '#ddd',
                progressColor: '#ff6100',
				height:height,
                barWidth: 2,
                normalize:true,
            });
            this.wavesurfer.push(surfer);
            let newid = this.wavesurfer.length - 1;
            $(`#song-${id}`).data('place',newid);
            this.loadingPlayer = true;
            this.wavesurfer[newid].load(`${url}`);
            this.wavesurfer[newid].on('ready',()=>{
                this.playAudio(id,url,newid);
				let time = this.wavesurfer[newid].getDuration()
				let minutes = Math.floor(time / 60)
				let seconds = Math.floor(time % 60)
				$(`#duration-${id}`).text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
				$(`#song-playing-time-${id}`).css({'display':'block'})
            });
            }
        catch(err) {
            
        }
  	}
	checkVolume(type,id,category,click=false){
		if(type && !click){
			$(`#${id}-volume-range`).on("change mousemove", ()=> {
				let index = $(`#song-${id}`).data('place');
				if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${id}-volume-range`).val())/100)
			});
		} else if(!click) {
			$(`#${id}-volume-range`).unbind("change mousemove");
		} else {
			let index = $(`#song-${id}`).data('place');
			if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${id}-volume-range`).val())/100)
		}
	}
	download(genre,url,title,type){
		if(!this.downloading){
			this.downloading=true;
			let headers = new Headers({
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {}
			this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/${genre}/${url}/download`, body, {headers: headers}).subscribe(data => {
				// (<any>window).location = data.json().url;
				if(type === 1){
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
	loop(id){
		let index = $(`#song-${id}`).data('place');
		let wavesurfer = this.wavesurfer[index];
		let loop = $(`#song-${id}-repeat`).data('loop')
		if(!loop){
		wavesurfer.un('finish');
		wavesurfer.on('finish',()=>{
			this.startAudio(id,index);
		});
		$(`#song-${id}-repeat`).addClass('active');
		let loop = $(`#song-${id}-repeat`).data('loop',1)
		} else {
		wavesurfer.un('finish');
		$(`#song-${id}-repeat`).removeClass('active');
		let loop = $(`#song-${id}-repeat`).data('loop',0)
		this.wavesurfer[index].on('finish', ()=>{
			$(`#song-${id}`).data('value',0);
			$(`#song-play-icon-${id}`).removeClass('fa-pause').addClass('fa-play');
			this.audioPlaying = false;
		});
		}
	}

  	like(id, liked, type, value, index ){
	    var headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "liked" : liked, "type" : type}
	    this.likeSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/likes`, body, {headers: headers}).subscribe(data => {
	      	let song = this.music[index];
			song.user_liked = data.json().user_liked;
			song.likes_count = data.json().likes_count;
	        if(song.user_liked){
				$(`#icon-likes-${id}`).addClass('liked-icon fa-heart');
	            $(`#icon-likes-${id}`).removeClass('fa-heart-o');
	            $(`#likes-button-${id}`).addClass('liked');
	            $(`#likes-${id}`).html(song.likes_count);
	        }
	        if(!song.user_liked){
	            $(`#icon-likes-${id}`).addClass('fa-heart-o');
	            $(`#icon-likes-${id}`).removeClass('liked-icon fa-heart');
	            $(`#likes-button-${id}`).removeClass('liked');
	            $(`#likes-${id}`).html(song.likes_count);
                if(this.iscurrentUser){
                    setTimeout(()=>{
						if(!song.user_liked){
							$(`#${id}-music`).fadeOut(()=>{
								this.music.splice(index,1);
							})
						}
                    },1500)
				}
              }
	    },error=>{
			if(error.status === 401){
	          	this._modal.setModal('user', this.user, 'music');
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
	              this._modal.setModal('user', this.user, 'music');
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
	    var body = {'user':this.user,'options':this.optionValues, 'time':this.timeValues, 'type':this.typesValues}
	      this.sortSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/music/sort`, body, {headers: headers}).subscribe(data => {
	        if(data.json().success){
	     		this.music = data.json().posts;	
				this.setIds();
	     		this.offset = data.json().offset;
	     		this.setState();
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
	    var body = {'user':this.user}
	    this.paginateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/${this.user}/music`, body, {headers: headers}).subscribe(data => {
			this.music = data.json().posts;
			this.setIds();
			this.offset = data.json().offset;
			this.currentPage = pageData[1];
			this.setState();
	    });
	}
    displayAll(){
            $(`#loading-spinner-profile-music`).css({'display':'none'});
            $(`#music-profile-container`).fadeIn();
    }
	setState(){
		let orderString;
		let offsetString = this.offset > 0 ? `?offset=${this.offset}` : ``;
	    if(offsetString){orderString = this.optionValues ? `&order=${this.optionValues}` : ``;}else{orderString = this.optionValues ? `?order=${this.optionValues}` : ``;}
	    let timeString = this.timeValues ? `&time=${this.timeValues}` : ``;
	    let typeString = this.typesValues ? `&type=${this.typesValues}` : ``;
	    this._location.replaceState(`/user/${this.user}/music${offsetString}${orderString}${timeString}${typeString}`)
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
	photoClicked(index,form,value=true){
		let song = this.music[index];
		song.clicked = value;
		if(form){
	 		setTimeout(()=>{
				this.waveSurferCreate(song.uuid,song.upload_url);
				this.songPlay(song.genre,song.url);
			},50);
		}
	}
	searchArtist(artist){
		this._router.navigateByUrl(`/search?category=All&search=${artist}`);
	}
	marqueeToggle(type,id){
    	let textwidth = $(`#music-title-link-${id}`).width();
    	let item = $(`#music-title-link-${id}`).parent()
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
		if(this.playSubscription) this.playSubscription.unsubscribe();
	}
}
