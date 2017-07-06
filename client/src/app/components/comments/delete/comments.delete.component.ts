import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import 'angular2-materialize';
import {CommentsLoopComponent} from '../loop/comments.loop.component';
import {CommentsComponent} from '../comments.component';
declare var $;

//So once the class has left ngOnChanges, all values end up getting reset. To understand this, uncomment the 'this.deleteReplyOutput' in ngChanges
// and in deleteComment. As you can see, it loses its subscription. This closure fixes this.
// This also occured when not using the @input and instead calling the setDeleteModal from comments and comments.loop.
var deleteData = {
  type:null,
  id:0,
  observable:{},
  setType:function(type){
    this.type = type;
  },
  getType:function(){
    return this.type;
  },
  clearType:function(){
    this.type=null;
  },
  getId:function(){
    return this.id;
  },
  setId:function(id){
    this.id = id;
  },
  clearId:function(){
    this.id = null;
  },
	setAuth:function(auth){
		this.auth = auth;
	},
	getAuth:function(){
		return this.auth;
	},
	clearAuth:function(auth){
		this.auth = null;
	},
  setObservable:function(ob){
  	this.observable = ob;
  },
  getObservable:function(){
  	return this.observable;
  },
  clearObservable:function(){
  	this.observable = {};
  }
}

@Component({
  selector: 'comments_delete',
  templateUrl: 'comments.delete.component.html',
  providers: [AuthService,SystemMessagesComponent]
})

export class CommentsDeleteComponent implements OnChanges {
	@Input() datadelete:any;
	@Output() deleteCommentOutput = new EventEmitter();
	@Output() deleteReplyOutput = new EventEmitter();
	type:any=[];
	id:any=[];
	reason:string;
	optionsRemove:any=['spam','stupid','hate','removal - this will just say [Removed]'];
	constructor(private _router: Router,private _auth :AuthService, private _sysMessages: SystemMessagesComponent){
	}
	ngOnChanges(changes:any):void{
	  var dataChange:any = changes.datadelete.currentValue;
      if (dataChange) {
				$('.modal').modal();
      	deleteData.setId(dataChange[0]);
      	deleteData.setType(dataChange[1]);
				deleteData.setAuth(dataChange[2]);
				let observable = dataChange[1] === 'reply' ? this.deleteReplyOutput : this.deleteCommentOutput;
				deleteData.setObservable(observable);
				if(dataChange[2]){
						$('#modal-admin').css({'display':'block'})
						$('#modal-delete').get(0).className = 'modal remove'
					} else{ 
						$('#modal-normal').css({'display':'block'});
					}
      	$('#modal-delete').modal('open');
      }
	};
	// setDeleteModal(type,id){
	// 	// this.type = type;  -- doesn't work, still remains []
	// 	// this.id = id; -- doesn't work, still remains []
	// 	deleteData.setType(type);
	// 	deleteData.setId(id);
	// 	$('#modal3').modal('open);
	// }
	closeReport(){
		$('#modal-delete').modal('close');
		deleteData.clearId();
		deleteData.clearType();
		deleteData.clearObservable();
		$('#modal-admin').css({'display':'none'})
		$('#modal-normal').css({'display':'none'})
	}
	deleteComment(){
		deleteData.getObservable().emit([deleteData.getId(),deleteData.getAuth(),this.reason]);
		deleteData.clearId();
		deleteData.clearType();
		deleteData.clearObservable();
		$('#modal-delete').modal('close');
		$('#modal-admin').css({'display':'none'})
		$('#modal-normal').css({'display':'none'})
	}
}