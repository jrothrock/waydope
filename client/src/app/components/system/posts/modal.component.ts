import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import 'angular2-materialize';
import {CommentsLoopComponent} from '../../comments/loop/comments.loop.component';
import {CommentsComponent} from '../../comments/comments.component';
declare var $;

//So once the class has left ngOnChanges, all values end up getting reset. To understand this, uncomment the 'this.deleteReplyOutput' in ngChanges
// and in deleteComment. As you can see, it loses its subscription. This closure fixes this.
// This also occured when not using the @input and instead calling the setDeleteModal from comments and comments.loop.
var notifyPostData = {
  notifyType:null,
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
    setNotifyType:function(type){
        this.notifyType = type;
    },
    getNotifyType:function(){
        return this.notifyType;
    },
    clearNotifyType:function(type){
        this.notifyType = null;
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
  selector: 'system_posts_modal',
  templateUrl: 'modal.component.html',
})

export class SystemPostsModalComponent implements OnChanges {
	@Input() datanotify:any;
	@Output() lockPostOutput = new EventEmitter();
	@Output() lockSongOutput = new EventEmitter();
  @Output() lockVideoOutput = new EventEmitter();
  @Output() lockApparelOutput = new EventEmitter();
  @Output() lockTechnologyOutput = new EventEmitter();
  
  @Output() removePostOutput = new EventEmitter();
	@Output() removeSongOutput = new EventEmitter();
  @Output() removeVideoOutput = new EventEmitter();
  @Output() removeApparelOutput = new EventEmitter();
  @Output() removeTechnologyOutput = new EventEmitter();

	type:any=[];
	id:any=[];
	reason:string;
	optionsRemove:any=['spam','stupid','hate','removal - this will just say [Removed]'];
  inited:boolean=false;
	constructor(private _router: Router,private _auth :AuthService, private _sysMessages: SystemMessagesComponent){}
	ngOnChanges(changes:any):void{
    if(!this.inited){ $('.modal').modal(); this.inited = true;}
	  var dataChange:any = changes.datanotify.currentValue;
      if (dataChange) {
      	
      	notifyPostData.setId(dataChange[0]);
      	notifyPostData.setType(dataChange[1]);
		    notifyPostData.setNotifyType(dataChange[2]);
        let observable;
        if(dataChange[3] && dataChange[3] === 'lock'){
          observable = dataChange[1] === 'news' ? this.lockPostOutput:null;
          observable = dataChange[1] === 'music' ? this.lockSongOutput : observable;
          observable = dataChange[1] === 'videos' ? this.lockVideoOutput : observable;
          observable = dataChange[1] === 'apparel' ? this.lockApparelOutput : observable;
          observable = dataChange[1] === 'technology' ? this.lockTechnologyOutput : observable;
        } else if(dataChange[3] && dataChange[3] === 'remove') {
          observable = dataChange[1] === 'news' ? this.removePostOutput:null;
          observable = dataChange[1] === 'music' ? this.removeSongOutput : observable;
          observable = dataChange[1] === 'videos' ? this.removeVideoOutput : observable;
          observable = dataChange[1] === 'apparel' ? this.removeApparelOutput : observable;
          observable = dataChange[1] === 'technology' ? this.removeTechnologyOutput : observable;
        }
        notifyPostData.setObservable(observable);
        if(dataChange[2] === 'check'){
          if(dataChange[3]==='lock') $('#modal-lock-check').css({'display':'block'});
          else $('#modal-remove-check').css({'display':'block'})
        } else if(dataChange[2] === 'locked'){ 
            $('#modal-locked').css({'display':'block'});
        } else if (dataChange[2] === 'archived'){
            $('#modal-archived').css({'display':'block'});
        } else {
            $('#modal-flagged').css({'display':'block'});
        }
      	$('#modal-notify').modal('open');
        
      	// 
      }
	};
	// setDeleteModal(type,id){
	// 	 //shows values as expected.
	// 	// this.type = type;  -- doesn't work, still remains []
	// 	// this.id = id; -- doesn't work, still remains []
	// 	notifyPostData.setType(type);
	// 	notifyPostData.setId(id);
	// 	$('#modal3').openModal();
	// }
	closeModal(){
		$('#modal-notify').modal('close');
		notifyPostData.clearId();
		notifyPostData.clearType();
		notifyPostData.clearObservable();
		$('#modal-locked').css({'display':'none'})
		$('#modal-lock-check').css({'display':'none'})
    $('#modal-remove-check').css({'display':'none'})
    $('#modal-archived').css({'display':'none'})
    $('#modal-flagged').css({'display':'none'});
	}
	lockPost(){
		// 
		notifyPostData.getObservable().emit([true]);
		notifyPostData.clearId();
		notifyPostData.clearType();
		notifyPostData.clearObservable();
		$('#modal-notify').modal('close');
		$('#modal-locked').css({'display':'none'})
    $('#modal-flagged').css({'display':'none'});
		$('#modal-lock-check').css({'display':'none'})
    $('#modal-remove-check').css({'display':'none'})
    $('#modal-archived').css({'display':'none'})
	}
  removePost(){
		// 
		notifyPostData.getObservable().emit([true]);
		notifyPostData.clearId();
		notifyPostData.clearType();
		notifyPostData.clearObservable();
		$('#modal-notify').modal('close');
		$('#modal-locked').css({'display':'none'})
		$('#modal-remove-check').css({'display':'none'})
    $('#modal-archived').css({'display':'none'})
    $('#modal-flagged').css({'display':'none'});
	}
}
