import { Component, OnInit, OnChanges, Input, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import { Router } from '@angular/router';
import {VoteService} from '../../../services/vote.service';
import 'angular2-materialize';
declare var $;
declare var Materialize;
@Component({
  selector: 'boards-home',
  templateUrl: 'boards.home.component.html',
})

export class BoardsHomeComponent implements OnChanges {
	@Input() boards:any;
	paginateSubscription:any;
	watchVoteSubscription:any;
	all:any;
	names:any=['hot','new','featured'];
    posts:any=[];
	count:any=[];
	currentPosts:any=[];
	currentPage:any=[];
	firstSubBoards:any;
	secondSubBoards:any;
	thirdSubBoards:any;
	fourthSubBoards:any;
	voteSubscription:any;
	loaded:boolean=false;
	math:any=Math; // allows the usage of Math in the view
	ids:any=[];
	current_ids:any=[];
	constructor(private _auth: AuthService, private _voteService: VoteService, private _backend:BackendService, private _http: Http, private _modal: ModalComponent, private _router: Router){
		this.voteCheck();
	};
	ngOnChanges(changes:any):void{
		
		var boardsChange:any = changes.boards.currentValue;
		if (boardsChange.length) {
			// need different pointers;
            this.posts = [boardsChange[0],boardsChange[1],boardsChange[2]];
			
			this.currentPosts = [boardsChange[0],boardsChange[1],boardsChange[2]];
			
			this.setIds();
			this.count = [];
			this.currentPage = Array(3).fill(0);
			for(let i = 0; i < this.posts.length; i++){
				if(this.count.length <4){
					if(this.posts && this.posts[i] && this.posts[i].length) this.count.push(this.posts[i][0].total_count);
					else this.count.push(0);
				}
			}
			this.loaded=true;
			setTimeout(()=>{
				$('#tab-output-boards').addClass('active-home');
			},25)
		}
	};
	setIds(){
		this.ids = [];
		
		for(let i =0; i < this.posts.length; i++){
			if(this.posts.length && this.posts[i]){
				this.ids.push([]);
				for(let ic= 0; ic < this.posts[i].length; ic++){
					this.ids[i].push(this.posts[i][ic].uuid);
				}
			}
		}
		for(let i  = 0;i< this.currentPosts;i++){
			if(this.currentPosts.length && this.currentPosts[i]){
				this.current_ids.push([]);
				for(let ic= 0; ic < this.currentPosts[i].length; ic++){
					this.current_ids[i].push(this.currentPosts[i][ic].uuid);
				}
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
	voteChange(id,vote,user_voted){
		for(let i =0; i < this.posts.length; i++){
			if(this.ids[i]){
				let index = this.ids[i].indexOf(id);
				if(index > -1){
					this.posts[i][index].average_vote = vote;
					this.posts[i][index].user_voted = user_voted;
				}
			}
		}
		for(let i =0; i < this.currentPosts.length; i++){
			if(this.current_ids[i]){
				let current_index = this.current_ids[i].indexOf(id);
				if(current_index > -1){
					this.currentPosts[i][current_index].average_vote = vote;
					this.currentPosts[i][current_index].user_voted = user_voted;
				}
			}
		}
	}
	setVote(vote,id,type,average_vote,voted){
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":"news", "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes`, body, {headers: headers}).subscribe(data => {
				let change;
				if(vote === 1 && voted) change = voted === 1 ? -1 : 2;
				else if(vote === 1 && !voted) change = 1;
				else if(vote === -1 && voted) change = voted === -1 ? +1 : -2;
				else if(vote === -1 && !voted) change = -1;
    			this.voteChange(id,average_vote+change,data.json().user_vote)
				this._voteService.change('boards',id,average_vote+change,data.json().user_vote);
    	},error=>{
			if(error.status === 401){
          		this._modal.setModal('home');
      		} else if (error.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(error.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
		});
    	// upVoteSubscription.unsubscribe();
	}
	getPosts(index,category){
		var headers = new Headers();
		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
		headers.append('Type', 'news');
		headers.append('offset', (this.currentPage[index] * 5 + 5).toString());
		headers.append('category', category)
		this.paginateSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/home/paginate`, {headers:headers}).subscribe(data => {
				this.posts[index] = this.posts[index].concat(data.json().posts);
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.posts[index].slice(this.currentPage[index] * 5, this.currentPage[index] * 5 + 5)
				this.setIds();
		});
	}
	paginate(type,index){
		if(type === 'next'){
			if(((this.currentPage[index] * 5 + 5)  === this.posts[index].length) && (this.posts[index].length < this.count[index])){
				this.getPosts(index,this.names[index]);
			} else {
				this.currentPage[index] += 1;
				this.currentPosts[index] = this.posts[index].slice(this.currentPage[index] * 5, this.currentPage[index] * 5 + 5)
			}
		} else {
			if(this.currentPage[index] > 0){
				this.currentPage[index] -= 1;
				this.currentPosts[index] = this.posts[index].slice(this.currentPage[index] * 5, this.currentPage[index] * 5 + 5)
			}
		}
	}

	tabClick(name){
		this._router.navigateByUrl(`/boards/${name}`);
	}

	ngOnDestroy() {
    	// prevent memory leak when component destroyed
	    if (this.voteSubscription) this.voteSubscription.unsubscribe();
		if (this.paginateSubscription) this.paginateSubscription.unsubscribe();
		if(this.watchVoteSubscription) this.watchVoteSubscription.unsubscribe();
    }
}
