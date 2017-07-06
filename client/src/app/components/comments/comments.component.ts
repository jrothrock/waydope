import { Component, OnChanges, Input, Compiler, ViewChildren, QueryList, ViewContainerRef, ViewChild, ComponentRef, ComponentFactory, ComponentFactoryResolver, OnDestroy} from '@angular/core';
import { Location } from '@angular/common';
import { Http, Headers } from '@angular/http';
import {CommentsFormComponent} from './form/comments.form.component';
import {AuthService} from '../../services/auth.service';
import {CommentsLoopComponent} from './loop/comments.loop.component';
import {ModalComponent} from '../modal/modal.component';
import {CommentsReportComponent} from './report/comments.report.component';
import {CommentsDeleteComponent} from './delete/comments.delete.component';
import {CommentsAdminComponent} from './admin/comments.admin.component';
import {AdminGuard} from '../../services/admin.guard.service';
import {BackendService} from '../../services/backend.service';
import {CommentService} from '../../services/comment.service';
import 'angular2-materialize';
declare var $;
declare var Materialize;

@Component({
  selector: 'comments',
  templateUrl: 'comments.component.html',
//   entryComponents: [CommentsFormComponent,CommentsComponent,CommentsLoopComponent],
  entryComponents: [CommentsFormComponent,CommentsLoopComponent],
  providers: [ModalComponent,CommentsReportComponent,CommentsAdminComponent,CommentsDeleteComponent,CommentService]
})

export class CommentsComponent implements OnChanges {
	@ViewChildren('replyLink', {read: ViewContainerRef}) replyLinkRefs:QueryList<ViewContainerRef>;
  	@ViewChildren('replyChildren', {read: ViewContainerRef}) replyChildrenRefs:QueryList<ViewContainerRef>;
	@Input() post:any;
  	private componentFactoryForm: ComponentFactory<any>;
  	private componentFactoryChildren: ComponentFactory<any>;
  	private componentFactory: ComponentFactory<any>;
	subscription:any;
	allSubscription:any;
	voteSubscription:any;
	editSubscription:any;
	closeSubscription:any;
	valueSubscription:any;
	reportSubscription:any;
	deleteSubscription:any;
	stickySubscription:any;
  	username:string='';
	comments:any=[];
	addedComment:boolean=false;
	currentlyOpen:boolean=false;
	submittedComment:any;
	id:any;
	type:any;
	category:string;
	subcategory:string;
	url:string;
	noComments:boolean=false;
	coms:any;
	indexZero:number;
	idZero:number;
	valueZero:number;
	datareport:any;
	datadelete:any;
	dataadmin:any;
	loaded:boolean=false;
	isAdmin:boolean=false;
	math:any=Math;
	specific:string;
	constructor(private _http:Http, private _comment: CommentService, private _location: Location, private _backend: BackendService, private _admin: AdminGuard, private _modal: ModalComponent, componentFactoryResolver: ComponentFactoryResolver, compiler: Compiler, private _auth: AuthService,private _report:CommentsReportComponent, private _delete:CommentsDeleteComponent){
		this.componentFactoryForm = componentFactoryResolver.resolveComponentFactory(CommentsFormComponent);
		this.componentFactoryChildren = componentFactoryResolver.resolveComponentFactory(CommentsLoopComponent);
		this.componentFactory = componentFactoryResolver.resolveComponentFactory(CommentsComponent);
		this.username = localStorage.getItem('username') || '';
	};
	ngOnChanges(changes:any){
		var idChanges = changes.post.currentValue;
		if (idChanges) {
			if(idChanges[0] === 'reset'){
				this.comments =[];
				this.loaded = false;
			}
			else{
				this.id = idChanges[1];
				this.type = idChanges[0];
				this.category = idChanges[2];
				this.subcategory = idChanges[3];
				this.coms = [this.type,this.id];
				this.specific = idChanges[4]; // this is the uid for a comment (for a continue thread)
				this.isAdmin = this._admin.isAdmin();
				this.watchAll();
				if(!this.specific) this.getComments();
				else this.getComment();
			}
		}
	};

	watchAll(){
		this.allSubscription = this._comment.specific.subscribe((value) => { 
			
		  
		  this.specific = value;
          this.getComment();
        });
	}

	getComment(){
		var headers = new Headers();
		headers.append('type', this.type);
		headers.append('Authorization', 'Bearer ' + this._auth.getToken())
		headers.append('id', this.specific)
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/comments/comment`,{headers: headers}).subscribe(data => {
			if(data.json().success){
				this.comments = data.json().comments.comments;
				this.loaded = true;
			} else {
				this.loaded = true;
				this.noComments = true;
			}
		});
	}

	getComments(){
		var headers = new Headers();
		headers.append('id', this.id);
		headers.append('type', this.type);
		headers.append('Authorization', 'Bearer ' + this._auth.getToken())
		this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/comments/`,{headers: headers}).subscribe(data => {

			if(data.json().success){
				this.comments = data.json().comments.comments;
				this.loaded = true;
			} else {
				this.loaded = true;
				this.noComments = true;
			}
		});
	}

	allComments(){
		this.specific = null;
		this.loaded = false;
		this.comments = [];
		this._location.go(location.pathname.split('/').splice(0,location.pathname.split('/').length-1).join('/'))
		this.getComments();
	}

	commentReply(id,generation,index,body){
		if(!this.currentlyOpen){
			this.currentlyOpen = true;
			let vcRefs = $(this.replyLinkRefs).toArray();
			let vcRef = vcRefs[0]._results[index];
			let dyanmicComponent = vcRef.createComponent(this.componentFactoryForm, 0);
			let instance = dyanmicComponent.instance;
			instance.parent_id = id;
			instance.id = this.id;
			instance.type = this.type;
			instance.body = body;
			instance.generation = generation + 1;
			this.closeSubscription = instance.close.subscribe((e) => {
				let childrenRefs = $(this.replyChildrenRefs).toArray();
				let childRef = childrenRefs[0]._results[index];
				let addedChild = childRef.createComponent(this.componentFactoryChildren, 0);
				let childInstance = addedChild.instance;
				childInstance.newCommentFlag = true;
				childInstance.newComment = e;
				childInstance.type = this.type;
				childInstance.id = this.id;
				childInstance.isAdmin = this.isAdmin;
            	dyanmicComponent.destroy();
            	this.currentlyOpen = false;
            	dyanmicComponent.destroy();
            	// let vcRefs2 = $(this.view)
            	this.currentlyOpen = false;
        	});
		}
	}

	setVote(vote,type,id,voted,deleted){
		if(deleted){return false}
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":type, "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
    		if(data.json().success){
    			$(`#${type}-votes-${id}`).text(data.json().vote);
    			if(data.json().user_vote === 1 ){
    				$(`#${type}-upvote-${id}`).css({'color':'#ef6837'})
    				$(`#${type}-downvote-${id}`).css({'color':'black'})
    			} else if(data.json().user_vote === -1){
    				$(`#${type}-downvote-${id}`).css({'color':'#ef6837'})
    				$(`#${type}-upvote-${id}`).css({'color':'black'})
    			} else if(data.json().user_vote === null){
    				$(`#${type}-downvote-${id}`).css({'color':'black'})
    				$(`#${type}-upvote-${id}`).css({'color':'black'})
    			}
    		}
    		else if(data.json().status === 401){
          		this._modal.setModal();
      		} else if (data.json().locked){
				Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
			} else if(data.json().archived){
				Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
			}
    	});
	}

	reportInit(comment,reported){
		this.datareport = [comment,'comment',reported];
	}
	deleteInit(comment,admin){
		this.datadelete = [comment,'comment',admin];
	}
	adminInit(comment){
		this.dataadmin=[comment,this.id,this.type,this.category,this.subcategory];
	}
	submitReport(values){
		 var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":values[0], "type":"comment", "foul":values[1]}
		this.reportSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/report/new`, body , {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    	}
	    })
	}

	deleteComment(event){
		let id = event[0] ? event[0] : null;
		let admin = event[1] ? event[1] : null;
		let reason = event[2] ? event[2] : null;
		if(!admin){
			var headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {"id":event[0], "type":'comment'}
			this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/comments/delete`, body , {headers: headers}).subscribe(data => {
				if(data.json().hidden){
						$(`#comment-${id}`).remove();
					} else {
						$(`#comment-actions-${id}`).remove();
						$(`#comment-body-${id}`).text('[Deleted]').css({'margin-top':'20px'});
						$(`#comment-author-${id}`).remove();
					}
			});
		} else {
			var headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {"id":event[0], "type":'comment', 'reason':event[2]}
			this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/comments/remove`, body , {headers: headers}).subscribe(data => {
				$(`#comment-actions-${id}`).remove();
				$(`#comment-body-${id}`).text(data.json().reason).css({'margin-top':'20px'});
				$(`#comment-author-${id}`).remove();
			});
		}
	}
	stickyComment(comment){
		var headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		let stickied = $(`#comment-link-actions-sticky-${comment}`).data('stickied');
		let body = {"id":comment, "stickied":!stickied}
		this.stickySubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/comments/sticky`, body , {headers: headers}).subscribe(data => {
			if(data.json().success){
				let stickied_text = data.json().stickied ? 'Unsticky' : 'Sticky';
				$(`#comment-link-actions-sticky-text-${comment}`).text(stickied_text);
				$(`#comment-link-actions-sticky-${comment}`).data('stickied', data.json().stickied);
				$('.stickied-comment').removeClass('stickied-comment');
				if(!data.json().stickied) Materialize.toast(`<i class='fa fa-thumb-tack transform-tack'></i> Comment successfully stickied`, 3000, 'rounded-success')
			}
		});
	}

	edit(id,generation,index,body){
		if(!this.currentlyOpen){
			
			
			this.currentlyOpen = true;
			let vcRefs = $(this.replyLinkRefs).toArray();
			
			let vcRef = vcRefs[0]._results[index];
			
			let dyanmicComponent = vcRef.createComponent(this.componentFactoryForm, 0);
			let instance = dyanmicComponent.instance;
			instance.comment_id = id;
			instance.id = this.id;
			instance.edit = true;
			instance.type = this.type;
			instance.body = body;
			instance.generation = generation;
			this.closeSubscription = instance.close.subscribe((e) => {
	            dyanmicComponent.destroy();
	            this.currentlyOpen = false;
	            $(`#${e[0]}-body-${e[1]}`).html(`${e[3]}`);
	            this.comments[index].body = e[2];
				this.comments[index].marked = e[3];
	        });
		}
	}
	findZero(array){
		
		
		//this is not scalable code, a quick sort would probably be better.
		for(let i = 0; i < array.length; i++){
			let averageVote = array[i].average_vote;
			
			
			if(this.valueZero == null){
				this.valueZero = averageVote;
				this.indexZero = i;
				this.idZero = array[i].uuid;
			} else {
				if(averageVote < this.valueZero && averageVote > -1){
					this.valueZero = averageVote;
					this.indexZero = i;
					this.idZero = array[i].uuid;
				} else if(averageVote > this.valueZero && averageVote < 0 ) {
					this.valueZero = averageVote;
					this.indexZero = i;
					this.idZero = array[i].uuid;
				}
			}


		}

	}
	submitComment(comment){
		
		this.findZero(this.comments);
		this.submittedComment = comment;
		this.indexZero = this.indexZero? this.indexZero : 0;
		let commentRefs = $(this.replyChildrenRefs).toArray();
		
		let commentRef = commentRefs[0]._results[this.indexZero];
		
		let newComment = commentRef.createComponent(this.componentFactory, 0);
		let commentInstance = newComment.instance;
		commentInstance.comments = [comment];
		commentInstance.addedComment = true;
		commentInstance.id = this.id;
		commentInstance.type = this.type;
		commentInstance.post = this.post;
		commentInstance.coms = this.coms;
		commentInstance.isAdmin = this.isAdmin;
		// apparently, !this.comments == false but this.comments != [] == true. Javascript, are you sure you're Javascript?
		if(this.comments != []) $('#no-comments').css({'display':'none'})
	}
	ngOnDestroy() {
    // prevent memory leak when component destroyed
		if(this.allSubscription) this.allSubscription.unsubscribe();
	    if(this.subscription) this.subscription.unsubscribe();
	    if(this.voteSubscription) this.voteSubscription.unsubscribe();
	    if(this.closeSubscription) this.closeSubscription.unsubscribe();
    	if(this.valueSubscription) this.valueSubscription.unsubscribe();
    	if(this.reportSubscription) this.reportSubscription.unsubscribe();
    	if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
		if(this.stickySubscription) this.stickySubscription.unsubscribe();
    	
  	}

}
