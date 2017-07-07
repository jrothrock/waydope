import { Component, OnInit,EventEmitter, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';
import { Router } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';

declare var $;
declare var CloudZoom;
declare var Materialize;

@Component({
  selector: 'technology_menu',
  templateUrl: 'technology.menu.component.html',
  providers:[ModalComponent]
})

export class TechnologyMenuComponent implements OnInit {
	close = new EventEmitter();
	open = new EventEmitter();
	subscription:any;
	voteSubscription:any;
	watchVoteSubscription:any;
	offset:number=0;
	names:any=['hot','new','featured'];
	technology:any=[];
	loaded:boolean=false;
	initiated:boolean=false;
	zoomedPhoto:any;
	math:any=Math;
	server_url:string;
	magnificationOpen:boolean=false;
	marqueeing:boolean=false;
	item:any; // this is the marquee object.
	ids:any=[];
	currentTab:any='hot';
	constructor(private _http:Http, private _voteService: VoteService, private _backend: BackendService, private _auth:AuthService,private _router: Router, private _modal: ModalComponent){};
	ngOnInit(){
		this.getPosts();
		this.voteCheck();
	};
	getPosts(){
		this.server_url = this._backend.SERVER_URL;
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/menus/technology/`, {headers:headers}).subscribe(data => {
			this.technology = data.json().posts;
			for(let i = 0; i < this.technology.length; i++){
				this.ids.push([])
				for(let ic = 0; ic < this.technology[i].length; ic++){
					this.ids[i].push(this.technology[i][ic].uuid);
				}
			}
			this.loaded = true;
			setTimeout(()=>{
				this.initiated=true;
				setTimeout(()=>{
					this.getImageWidth();
					$(`.menu-technology-container`).addClass('active-menu')
				},10)
			},20)
			if(this.subscription) this.subscription.unsubscribe();
		});
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.technologyVote.subscribe((value) => { 
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
	}
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.ids.length; i++){
			let index = this.ids[i].indexOf(id);
			if(index > -1){
				this.technology[i][index].average_vote = vote;
				this.technology[i][index].user_voted = user_voted;
			}
		}
	}
	hoveringItem(name){
		if(name != this.currentTab){
			$(`#menu-tab-technology-${this.currentTab}, #menu-tab-name-technology-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-technology-${name}, #menu-tab-name-technology-${name}`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-technology`).css({'display':'none'});
			$(`#menu-${name}-technology`).css({'display':'block'});
			this.currentTab = name;
		}
	}
	mouseLeft(){
		if(!this.magnificationOpen){
			if(this.zoomedPhoto) this.zoomedPhoto.closeZoom()
			this.close.emit('message');
			setTimeout(()=>{
				$(`#menu-tab-technology-${this.currentTab}, #menu-tab-name-technology-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
				$(`#menu-tab-technology-hot, #menu-tab-name-technology-hot`).addClass("active-tab").find('a').addClass('active');
				$(`#menu-${this.currentTab}-technology`).css({'display':'none'});
				$(`#menu-hot-technology`).css({'display':'block'});
				this.currentTab = 'hot';
			},20)
		}
	}
	mouseEnter(){
		this.open.emit('message');
	}
	clickedLink(type,category=null,url=null,subcategory=null){
		if(type === 'header'){
			this._router.navigateByUrl(`/technology`);
		} else if(type === 'category'){
			this._router.navigateByUrl(`/technology/${category}`); 
		} else if(type === 'subcategory'){
			this._router.navigateByUrl(`/technology/${category}/${url}`); 
		} else if(type === 'user'){
			this._router.navigateByUrl(`/user/${category}`);
		} else {
			this._router.navigateByUrl(`/technology/${category}/${subcategory}/${url}`);
		}
		if(this.marqueeing){this.item.stop(); this.item.scrollLeft(0);}
		this.close.emit('message');
	}
	getImageWidth(){
		let container_width = $(`#main-photo-technology-menu-container-0-0`).width()
		let container_height = $(`#main-photo-technology-menu-container-0-0`).height()
        for(let i = 0; i < this.names.length;i++){
			for(let id = 0; id < this.technology[i].length; id++){
				// let image_object = new Image();
				
				// image_object.src = $(`#main-photo-technology-menu-${i}-${id}`).attr("src");

				// let native_width = image_object.width;
				// let native_height = image_object.height;

				// if(native_height > native_width && native_height > container_height){
				// 	let multiplier = container_height / native_height
				// 	let new_width = native_width * multiplier;
				// 	$(`#main-photo-technology-menu-${i}-${id}`).height(container_height).width(new_width)
				// } else if (native_height > native_width && native_height <= container_height) {
				// 	$(`#main-photo-technology-menu-${i}-${id}`).height(native_height).width(native_width)
				// } else if (native_width > native_height && native_width > container_width){
				// 	let multiplier = container_width / native_width;
				// 	let new_height = native_height * multiplier;
				// 	$(`#main-photo-technology-menu-${i}-${id}`).height(new_height).width(container_width);
				// } else {
					// $(`#main-photo-technology-menu-${i}-${id}`).height(native_height).width(native_width)
				// }
				$(`#main-photo-technology-menu-${i}-${id}`).height("100%").width("100%")
				$(`#main-photo-technology-menu-${i}-${id}`).css({'display':'initial'});
			}
        }
    }
	setVote(vote,id,type,average_vote,voted){
	    var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":id, "type":"technology", "vote":vote}
	      this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
			  let change;
			  if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
			  else if(vote === 1 && !voted) change = 1;
			  else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
			  else if(vote === -1 && !voted) change = -1;
	          this.voteChange(id,average_vote+change,data.json().user_vote);
			  this._voteService.change('component',id,average_vote+change,data.json().user_vote,'technology');
	    },error=>{
			if(error.status === 401){
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
	photoZoom(i,id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:12,disableZoom:'false'}; 
            this.zoomedPhoto = new CloudZoom($(`#main-photo-technology-menu-${i}-${id}`),options);
			$(`#main-photo-technology-menu-${i}-${id}`).bind('cloudzoom_start_zoom',()=>{
				this.magnificationOpen = true;
			});
			$(`#main-photo-technology-menu-${i}-${id}`).bind('cloudzoom_end_zoom',()=>{
				this.magnificationOpen = false;
				$(`#main-photo-technology-menu-${i}-${id}`).unbind("cloudzoom_start_zoom").unbind("cloudzoom_end_zoom")
			});
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
    }
	marqueeToggle(type,name,index){
    	let textwidth = $(`#technology-menu-title-link-${name}-${index}`).width();
    	this.item = $(`#technology-menu-title-link-${name}-${index}`).parent()
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
	menuClick(name){
		this.close.emit('message');
		this._router.navigateByUrl(`/technology/${name}`);
	}
	giveDataName(name){
		return `menu-${name}-technology`
	}
	ngOnDestroy(){
		if(this.zoomedPhoto) this.zoomedPhoto.destroy();
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
	}
}
