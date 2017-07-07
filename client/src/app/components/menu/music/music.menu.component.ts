import { Component, OnInit,EventEmitter, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';

declare var $;
declare var Materialize;
declare var WaveSurfer;


@Component({
  selector: 'music_menu',
  templateUrl: 'music.menu.component.html',
  providers:[ModalComponent]
})

export class MusicMenuComponent implements OnInit {
	close = new EventEmitter();
	open = new EventEmitter();
	subscription:any;
	voteSubscription:any;
	watchVoteSubscription:any;
	downloadSubscription:any;
	playSubscription:any;
	offset:number=0;
	names:any=['hot','new','featured'];
	songs:any=[];
	loaded:boolean=false;
	error:boolean=false;
	initiated:boolean=false;
	audioPlaying:boolean=false;
	wavesurfer:any=[];
	currentlyPlaying:any;
	currentlyPlayingId:number;
	currentlyPlayingType:string;
	loadingPlayer:boolean=false;
	math:any=Math;
	server_url:string;
	marqueeing:boolean=false;
	item:any; // this is the marquee object.
	ids:any=[];
	downloading:boolean=false;
	elapsed_time:any;
	currentTab:string='hot'
	constructor(private _http:Http, private _voteService: VoteService, private _backend: BackendService, private _route: ActivatedRoute, private _auth:AuthService,private _router: Router, private _modal: ModalComponent){};
	ngOnInit(){
		this.getPosts();
		this.voteCheck();
	};
	getPosts(){
		this.server_url = this._backend.SERVER_URL;
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/menus/music/`, {headers:headers}).subscribe(data => {
				this.songs = data.json().posts;
				for(let i = 0; i < this.songs.length; i++){
					this.ids.push([])
					for(let ic = 0; ic < this.songs[i].length; ic++){
						this.ids[i].push(this.songs[i][ic].uuid);
					}
				}
				this.loaded = true;
				setTimeout(()=>{
					this.initiated=true;
					setTimeout(()=>{
						$(`.marquee`).each(function(){this.stop();})
						$(`.menu-music-container`).addClass('active-menu')
					},5)
				},20)
				if(this.subscription) this.subscription.unsubscribe();
		});
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.musicVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.ids.length; i++){
			let index = this.ids[i].indexOf(id);
			if(index > -1){
				this.songs[i][index].average_vote = vote;
				this.songs[i][index].user_voted = user_voted;
			}
		}
	}
	mouseLeft(){
		this.close.emit('message');
		setTimeout(()=>{
			$(`#menu-tab-music-${this.currentTab},#menu-tab-name-music-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-music-hot, #menu-tab-name-music-hot`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-music`).css({'display':'none'});
			$(`#menu-hot-music`).css({'display':'block'});
			this.currentTab = 'hot';
		},19)
	}
	mouseEnter(){
		this.open.emit('message');
	}
	hoveringItem(name){
		if(name != this.currentTab){
			$(`#menu-tab-music-${this.currentTab}, #menu-tab-name-music-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-music-${name}, #menu-tab-name-music-${name}`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-music`).css({'display':'none'});
			$(`#menu-${name}-music`).css({'display':'block'});
			this.currentTab = name;
		}
	}
	clickedLink(type,genre=null,url=null){
		//basically, check to see if it is already on the component, if so, move to the dummy component - which reroutes back - in order to reload the component.
		if(type === 'header'){
				this._router.navigateByUrl(`/music`);
		} else if(type === 'genre'){
				this._router.navigateByUrl(`/music/${genre}`);
		} else if (type === 'user'){
			this._router.navigateByUrl(`/user/${genre}`);
		} else {
				this._router.navigateByUrl(`/music/${genre}/${url}`);
		}
		if(this.marqueeing){this.item.stop(); this.item.scrollLeft(0);}
		this.close.emit('message');
	}
	photoHover(state,category,index){
	    if(state){
	      $(`#play-button-menu-${category}-${index}`).attr("src","/assets/images/orangebutton.svg");
	      $(`#music-artwork-menu-${category}-${index}`).css({'opacity':0.9});
	    }else{
	      $(`#play-button-menu-${category}-${index}`).attr("src","/assets/images/blackbutton.svg");
	      $(`#music-artwork-menu-${category}-${index}`).css({'opacity':0.6});
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
			this.voteChange(id,average_vote+change,data.json().user_vote);
			this._voteService.change('component',id,average_vote+change,data.json().user_vote,'music');
	    }, error=>{
			if (error.status === 401){
	              this._modal.setModal();
	        } else if (error.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(error.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
		},()=>{
			if(this.voteSubscription) this.voteSubscription.unsubscribe();
		});
    }
	checkVolume(type,id,category,click=false){
		if(type && !click) {
			$(`#${category}-${id}-volume-range-menu`).on("change mousemove", ()=> {
				let index = $(`#song-${category}-${id}-menu`).data('place');
				if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range-menu`).val())/100)
			});
		} else if(!click) {
			$(`#${category}-${id}-volume-range-menu`).unbind("change mousemove");
		} else {
			let index = $(`#song-${category}-${id}-menu`).data('place');
			if(index != null) this.wavesurfer[index].setVolume(parseInt($(`#${category}-${id}-volume-range-menu`).val())/100)
		}
	}
 	download(id,title,type){
		 if(!this.downloading){
				let headers = new Headers({
										'Content-Type': 'application/json',
										'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
					});
					let body = {"song":id}
					this.downloadSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/download`, body, {headers: headers}).subscribe(data => {
						if(data.json().success){  
							
							// (<any>window).location = data.json().url;
							if(type === 1){
								let tag = document.createElement('a');
								tag.setAttribute('href', data.json().url);
								tag.setAttribute('target', "_blank");
								tag.setAttribute('download', title);
								tag.click();
							}
							this.downloading=false;
						}
					});
			 }
	}
  loop(id,category){
    let index = $(`#song-${category}-${id}-menu`).data('place');
    let wavesurfer = this.wavesurfer[index];
    let loop = $(`#song-${category}-${id}-repeat-menu`).data('loop')
    if(!loop){
      wavesurfer.un('finish');
      wavesurfer.on('finish',()=>{
          this.startAudio(category,id,index);
      });
      $(`#song-${category}-${id}-repeat-menu`).addClass('active');
      let loop = $(`#song-${category}-${id}-repeat-menu`).data('loop',1)
    } else {
      wavesurfer.un('finish');
      $(`#song-${category}-${id}-repeat-menu`).removeClass('active');
      let loop = $(`#song-${category}-${id}-repeat-menu`).data('loop',0)
      this.wavesurfer[index].on('finish', ()=>{
          $(`#song-${category}-${id}-menu`).data('value',0);
          $(`#play-icon-${category}-${id}-menu`).removeClass('fa-pause').addClass('fa-play');
          this.audioPlaying = false;
      });
    }
  }

  songPlay(id){
		let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"id":id}
	    this.playSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/song/play`, body, {headers: headers}).subscribe(data => {
		});
	}

    marqueeToggle(type,name,index){
    	let textwidth = $(`#music-menu-title-link-${name}-${index}`).width();
    	this.item = $(`#music-menu-title-link-${name}-${index}`).parent()
    	let parentwidth = this.item.width();
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
    	this.item.stop();
    	if(type === 1 && (textwidth > parentwidth)){
				this.marqueeing = true;
    		this.item.animate({scrollLeft:scrolldistance},time,'linear');
    	} else if (type === 0) {
    		this.item.animate({scrollLeft:0},'medium','swing',()=>{
					this.marqueeing = false;
				});
    	}
    };

    stopAudio(type,id){
		if(this.audioPlaying) this.wavesurfer[this.currentlyPlaying].playPause();
		$(`#song-${this.currentlyPlayingType}-${this.currentlyPlayingId}-menu`).data('value',0);
        $(`#play-icon-${this.currentlyPlayingType}-${this.currentlyPlayingId}-menu`).removeClass('fa-pause').addClass('fa-play');
        this.audioPlaying = false;
	}
	searchArtist(artist){
		this._router.navigateByUrl(`/search?category=All&search=${artist}`);
		this.close.emit('message');
	}

	startAudio(type,id,place){
		$(`#song-${type}-${id}-menu`).data('value',1);
        $(`#play-icon-${type}-${id}-menu`).removeClass('fa-play').addClass('fa-pause');
        this.audioPlaying = true;
        this.currentlyPlaying = place;
        this.currentlyPlayingId = id;
        this.currentlyPlayingType = type;
        this.wavesurfer[place].playPause()
        if(this.loadingPlayer) this.loadingPlayer = false;
	}

	playAudio(type,id,url,index=null){
	  if((!this.loadingPlayer && index === null) || (this.loadingPlayer && index != null)){
	      let value = $(`#song-${type}-${id}-menu`).data('value');
	      let place = index ? index : $(`#song-${type}-${id}-menu`).data('place');
	      if((this.currentlyPlaying != null) && (this.currentlyPlaying != place)){
	      	this.stopAudio(type,id);
	      	this.startAudio(type,id,place);
	      }	else if(value===0) {
	       this.startAudio(type,id,place);
	      } else {
	       this.stopAudio(type,id);
	      }
	      this.wavesurfer[place].on('finish', ()=>{
	      	$(`#song-${type}-${id}-menu`).data('value',0);
	        $(`#play-icon-${type}-${id}-menu`).removeClass('fa-pause').addClass('fa-play');
	        this.audioPlaying = false;
	      });
				this.wavesurfer[place].on('audioprocess', (data)=>{
			// this will help cut back on the cpu usage a little
					if(Math.floor(data) != this.elapsed_time){
						this.elapsed_time = Math.floor(data);
						let minutes = Math.floor(data / 60)
						let seconds = Math.floor(data % 60)
						$(`#current-time-${type}-${id}-menu`).text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds }`);
					}
				})
	  }
    }

   	waveSurferCreate(type,index,url){
	    let surfer = WaveSurfer.create({
	        container: `#waveform-${type}-${index}-menu`,
	        waveColor: '#ddd',
			height: 80,
	        progressColor: '#ff6100',
	        barWidth: 2,
	        normalize:true,
	      });
	    this.wavesurfer.push(surfer);
	    let newid = this.wavesurfer.length - 1;
	    $(`#song-${type}-${index}-menu`).data('place',newid);
	    this.loadingPlayer = true;
		this.wavesurfer[newid].load(`${url}`);
	    this.wavesurfer[newid].on('ready',()=>{
	    	this.playAudio(type,index,url,newid);
			let time = this.wavesurfer[newid].getDuration()
			let minutes = Math.floor(time / 60)
			let seconds = Math.floor(time % 60)
			$(`#duration-${type}-${index}-menu`).text(`${minutes}:${seconds < 10 ? '0'+seconds : seconds }`);
			$(`#song-playing-time-${type}-${index}-menu`).css({'display':'block'})
	    });
  	}


	photoClicked(type,index,childIndex,form,url){
		this.songs[index][childIndex].clicked = true;
		if(this.songs[index][childIndex].form) $(`#menu-vote-actions-music-${type}-${childIndex}`).addClass('clicked-music-voting');
		else $(`#menu-vote-actions-music-${type}-${childIndex}`).addClass('clicked-music-voting-embed');
		
		if(form){
	 		setTimeout(()=>{
				this.waveSurferCreate(type,childIndex,this.songs[index][childIndex].upload_url);
				this.songPlay(this.songs[index][childIndex].id);
			},50);
		}
	}
	menuClick(name){
		this.close.emit('message');
		// let url = name != 'all' ? `/music/${name}` : '/music';
		this._router.navigateByUrl(`/music/${name}`);
	}
	giveDataName(name){
		return `menu-${name}-music`
	}
	ngOnDestroy(){
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
		if(this.downloadSubscription) this.downloadSubscription.unsubscribe();
		if(this.playSubscription) this.playSubscription.unsubscribe();
	}
}
