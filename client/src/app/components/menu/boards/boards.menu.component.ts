import { Component, OnInit,EventEmitter, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import { Router } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';

declare var $;
declare var Materialize;

@Component({
  selector: 'boards_menu',
  templateUrl: 'boards.menu.component.html',
  providers:[ModalComponent]
})

export class BoardsMenuComponent implements OnInit {
	close = new EventEmitter();
	open = new EventEmitter();
	subscription:any;
	voteSubscription:any;
	watchVoteSubscription:any;
	offset:number=0;
	error:boolean=false;
	posts:any=[]
	all:any=[];
	loaded:boolean=false;
	names:any=['hot','new','featured'];
	names2:any=['all','business','science','technology','sports'];
	initiated:boolean=false;
	math:any=Math;
	system_url: string;
	marqueeing:boolean=false;
	item:any; // this is marquee object.
	ids:any=[];
	currentTab:any='hot';
	constructor(private _http: Http, private _voteService: VoteService, private _backend: BackendService, private _auth: AuthService, private _router: Router, private _modal: ModalComponent){};
	ngOnInit(){
		this.getPosts();
		this.voteCheck();
	};
	getPosts(){
		this.system_url = this._backend.SERVER_URL;
		var headers = new Headers();
		$('ul#boards-menu-tabs').tabs('select_tab', 'menu-tab-name-all');
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('subs', this.names);
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/menus/boards/`, {headers:headers}).subscribe(data => {
			if(data.json().success){
				this.posts = data.json().posts;
				for(let i = 0; i < this.posts.length; i++){
					this.ids.push([])
					for(let ic = 0; ic < this.posts[i].length; ic++){
						this.ids[i].push(this.posts[i][ic].uuid);
					}
				}
				
				this.loaded = true;
				//fixes the FOUC from all the stuff immediately showing up
				setTimeout(()=>{
					this.initiated=true;
					setTimeout(()=>{
						$(`.menu-boards-container`).addClass('active-menu')
					},5)
				},10)
				if(this.subscription) this.subscription.unsubscribe();
				
			} else {
				this.error = true;
			}
		});
	}
	voteCheck(){
		this.watchVoteSubscription = this._voteService.boardsVote.subscribe((value) => { 
			
			if(value.length){
				this.voteChange(value[0],value[1],value[2]);
			}
		});
		
	}
	mouseLeft(){
		this.close.emit('message');
		setTimeout(()=>{
			$(`#menu-tab-boards-${this.currentTab}, #menu-tab-name-boards-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-boards-hot, #menu-tab-name-boards-hot`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-boards`).css({'display':'none'});
			$(`#menu-hot-boards`).css({'display':'block'});
			this.currentTab = 'hot'
		},20)
	}
	mouseEnter(){
		this.open.emit('message');
	}
	hoveringItem(name){
		if(name != this.currentTab){
			$(`#menu-tab-boards-${this.currentTab}, #menu-tab-name-boards-${this.currentTab}`).removeClass('active-tab').find('a').removeClass('active');
			$(`#menu-tab-boards-${name}, #menu-tab-name-boards-${name}`).addClass("active-tab").find('a').addClass('active');
			$(`#menu-${this.currentTab}-boards`).css({'display':'none'});
			$(`#menu-${name}-boards`).css({'display':'block'});
			this.currentTab = name;
		}
	}
	clickedLink(type,category=null,url=null){
		
		//basically, check to see if it is already on the component, if so, move to the dummy component - which reroutes back - in order to reload the component.
		if(type === 'header'){
			this._router.navigateByUrl(`/boards`);
		} else if(type === 'category'){
			this._router.navigateByUrl(`/boards/${category}`);
		} else if (type === 'user'){
			this._router.navigateByUrl(`/user/${category}`);
		} else {
			this._router.navigateByUrl(`/boards/${category}/${url}`);
		}
		if(this.marqueeing){this.item.stop(); this.item.scrollLeft(0);}
		this.close.emit('message');
	}
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.ids.length; i++){
			let index = this.ids[i].indexOf(id);
			if(index > -1){
				this.posts[i][index].average_vote = vote;
				this.posts[i][index].user_voted = user_voted;
			}
		}
	}
	setVote(vote,id,type,average_vote,voted){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"news", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
    		if(data.json().success){
				let change;
				if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				else if(vote === 1 && !voted) change = 1;
				else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				else if(vote === -1 && !voted) change = -1;
				this.voteChange(id,average_vote+change,data.json().user_vote)
				this._voteService.change('component',id,average_vote+change,data.json().user_vote,'boards');
    		}
    		else if(data.json().status === 401){
          		this._modal.setModal();
      		} else if (data.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(data.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
      		if(this.voteSubscription) this.voteSubscription
    	});
	}
	marqueeToggle(type,name,index){
    	let textwidth = $(`#boards-menu-title-link-${name}-${index}`).width();
    	this.item = $(`#boards-menu-title-link-${name}-${index}`).parent()
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
		this._router.navigateByUrl(`/boards/${name}`);
	}
	giveDataName(name){
		return `menu-${name}-boards`
	}
	ngOnDestroy(){
		if(this.subscription) this.subscription.unsubscribe();
		if(this.voteSubscription) this.voteSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
	}
}
