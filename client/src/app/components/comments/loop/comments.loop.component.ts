import { Component, OnInit, Input,Compiler, ViewChildren, ViewContainerRef, QueryList, ViewChild, ComponentRef, ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { Location } from '@angular/common';
import { Http, Headers } from '@angular/http';
import {CommentsFormComponent} from '../form/comments.form.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {CommentService} from '../../../services/comment.service';
import {CommentsReportComponent} from '../report/comments.report.component';
import {CommentsDeleteComponent} from '../delete/comments.delete.component';
import {CommentsAdminComponent} from '../admin/comments.admin.component';
import 'angular2-materialize';
declare var $;
declare var Materialize;

@Component({
  selector: 'commentsLoop',
  templateUrl: 'comments.loop.component.html',
  entryComponents: [CommentsFormComponent]
})

export class CommentsLoopComponent implements OnInit {
	@Input() childComments:any;
	@Input() type:string;
	@Input() id:string;
	@Input() category:string;
	@Input() subcategory:string;
	@Input() url:string;
	@Input() isAdmin:boolean;
	@ViewChildren('replyLink', {read: ViewContainerRef}) replyLinkRefs:QueryList<ViewContainerRef>;
	@ViewChildren('replyChildren', {read: ViewContainerRef}) replyChildrenRefs:QueryList<ViewContainerRef>;
	currentlyOpen:boolean=false;
	subscription:any;
	voteSubscription:any;
	closeSubscription:any;
	valueSubscription:any;
	reportSubscription:any;
	deleteSubscription:any;
	username:string;
	newCommentFlag:boolean=false;
	newComment:any;
  	private componentFactory: ComponentFactory<any>;
  	private componentFactoryChildren: ComponentFactory<any>;
  	datareport:any;
  	datadelete:any;
	dataadmin:any;
	math:any=Math;
	constructor(private _http:Http, private _comment: CommentService, private _location: Location, private _backend: BackendService, private _modal:ModalComponent, componentFactoryResolver: ComponentFactoryResolver, compiler: Compiler, private _auth: AuthService, private _report:CommentsReportComponent, private _delete:CommentsDeleteComponent){
		this.componentFactory = componentFactoryResolver.resolveComponentFactory(CommentsFormComponent);
		this.componentFactoryChildren = componentFactoryResolver.resolveComponentFactory(CommentsLoopComponent);
		this.username = localStorage.getItem('username') || '';
	};
	
	ngOnInit(){
		console.log('post id is:')
		console.log(this.id);
	};

	commentReply(id,generation,child,index){
		if(!this.currentlyOpen){
			this.currentlyOpen = true;
			let vcRefs = $(this.replyLinkRefs).toArray();
			let vcRef = vcRefs[0]._results[index];
			let dyanmicComponent = vcRef.createComponent(this.componentFactory, 0);
			let instance = dyanmicComponent.instance;
			instance.comment_id = id;
			if(child) instance.parent_id = child;
			instance.id = this.id;
			instance.type = this.type;
			instance.generation = generation;
			this.closeSubscription = instance.close.subscribe((e) => {
				let childrenRefs = $(this.replyChildrenRefs).toArray();
				let childRef = childrenRefs[0]._results[index];
				let addedChild = childRef.createComponent(this.componentFactoryChildren, 0);
				let childInstance = addedChild.instance;
				childInstance.newCommentFlag = true;
				childInstance.newComment = e;
				childInstance.type = this.type;
				childInstance.id = this.id;
            	dyanmicComponent.destroy();
            	this.currentlyOpen = false;
       	    });
		}
	}

	setVote(vote, type, id, voted, deleted){
		if(deleted){return false}
		var headers = new Headers({
	          'Content-Type': 'application/json',
	          'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
		});
		var body = {"id":id, "type":type, "vote":vote, "already_voted":voted}
    	this.voteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/votes/vote`, body, {headers: headers}).subscribe(data => {
    		if(data.json().success){
    			$(`#${type}-votes-${id}`).text(data.json().vote);
    			if(data.json().user_vote === 1){
    				$(`#${type}-upvote-${id}`).css({'color':'#ef6837'});
    				$(`#${type}-downvote-${id}`).css({'color':'black'});
    			} else if (data.json().user_vote === -1){
    				$(`#${type}-downvote-${id}`).css({'color':'#ef6837'});
    				$(`#${type}-upvote-${id}`).css({'color':'black'});
    			} else if(data.json().user_vote === null){
    				$(`#${type}-downvote-${id}`).css({'color':'black'})
    				$(`#${type}-upvote-${id}`).css({'color':'black'})
    			}
    		}
    		if(data.json().status === 401){
          		this._modal.setModal();
      		}
		});
	}
	submitReport(values){
		 var headers = new Headers({
	            'Content-Type': 'application/json',
	            'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    var body = {"id":values.id, "type":"reply", "foul":values.foul}
	    this.reportSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/report/new`, body , {headers: headers}).subscribe(data => {
	    	if(data.json().success){
	    	}
	    })
	}
	continueComments(id){
		this._location.go(`${location.pathname}/${id}`);
		this._comment.viewSpecific(id);
		// var headers = new Headers();
		// headers.append('id', id);
		// headers.append('type', this.type);
		// headers.append('Authorization', 'Bearer ' + this._auth.getToken())
		// this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/comments/comment`,{headers: headers}).subscribe(data => {
		// 	
		// 	this._location.go(`${location.pathname}/${id}`);
		// 	// if(data.json().success){
		// 	// 	this.comments = data.json().comments.comments;
		// 	// 	this.loaded = true;
		// 	// } else {
		// 	// 	this.loaded = true;
		// 	// 	this.noComments = true;
		// 	// }
		// });
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
			let body = {"id":event[0], "type":'reply'}
			this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/comments/delete`, body , {headers: headers}).subscribe(data => {
				if(data.json().hidden){
						$(`#reply-${id}`).remove();
					} else {
						$(`#reply-actions-${id}`).remove();
						$(`#reply-body-${id}`).text('[Deleted]').css({'margin-top':'20px'});
						$(`#reply-author-${id}`).remove();
					}
			});
		} else {
			var headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
			});
			let body = {"id":event[0], "type":'reply', 'reason':event[2]}
			this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/comments/remove`, body , {headers: headers}).subscribe(data => {
				$(`#reply-actions-${id}`).remove();
				$(`#reply-body-${id}`).text(data.json().reason).css({'margin-top':'20px'});
				$(`#reply-author-${id}`).remove();
			});
		}
	}
	reportInit(comment,reported){
		this.datareport = [comment,'reply',reported];
	}
	deleteInit(comment,admin){
		this.datadelete = [comment,'reply',admin];
	}
	adminInit(comment,admin){
		console.log([comment,this.id,this.type,this.category,this.subcategory]);
		this.dataadmin=[comment,this.id,this.type,this.category,this.subcategory];
	}
	edit(id,generation,child,index,body){
		if(!this.currentlyOpen){
			let vcRefs = $(this.replyLinkRefs).toArray();
			let vcRef = vcRefs[0]._results[index];
			let dyanmicComponent = vcRef.createComponent(this.componentFactory, 0);
			let instance = dyanmicComponent.instance;
			instance.comment_id = id;
			if(child) instance.parent_id = child;
			instance.id = this.id;
			instance.edit = true;
			instance.type = this.type;
			instance.body = body;
			this.currentlyOpen = true;
			instance.generation = generation;
			this.closeSubscription = instance.close.subscribe((e) => {
	            dyanmicComponent.destroy();
	            this.currentlyOpen = false;
	            $(`#${e[0]}-body-${e[1]}`).html(`${e[3]}`);
				if(this.childComments) this.childComments.children[index].body = e[2]; // the if is used to get rid of a problem with new replies being edited.
	            if(this.childComments) this.childComments.children[index].marked = e[3]; // the if is used to get rid of a problem with new replies being edited.
	        });
	    }
	}
	ngOnDestroy() {
    	// prevent memory leak when component destroyed
		if(this.subscription) this.subscription.unsubscribe();
    	if(this.voteSubscription) this.voteSubscription.unsubscribe();
    	if(this.closeSubscription) this.closeSubscription.unsubscribe();
    	if(this.valueSubscription) this.valueSubscription.unsubscribe();
    	if(this.reportSubscription) this.reportSubscription.unsubscribe();
    	if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
  	}    	
}
