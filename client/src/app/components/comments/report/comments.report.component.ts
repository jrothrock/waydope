import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import 'angular2-materialize';
declare var $;

//So once the class has left ngOnChanges, all values end up getting reset. To understand this, uncomment the 'this.deleteReplyOutput' in ngChanges
// and in deleteComment. As you can see, it loses its subscription. This closure fixes this.
// This also occured when not using the @input and instead calling the setDeleteModal from comments and comments.loop.
var reportData = {
  type:null,
  id:0,
  observable:{},
  modal:{},
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
  setObservable:function(ob){
  	this.observable = ob;
  },
  getObservable:function(){
  	return this.observable;
  },
  clearObservable:function(){
  	this.observable = {};
  },
  setModal:function(modal){
  	this.modal = modal;
  },
  getModal:function(){
  	return this.modal;
  },
  clearModal:function(){
  	this.modal = {};
  }
}

@Component({
  selector: 'comments_report',
  templateUrl: 'comments.report.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class CommentsReportComponent implements OnChanges {
	@Input() datareport:any;
	@Output() reportCommentOutput: EventEmitter<any> = new EventEmitter();
	@Output() reportReplyOutput: EventEmitter<any> = new EventEmitter();
	reportForm:FormGroup;
	type:string;
	id:number;
	has_reported:boolean=false;
	constructor(private _fb: FormBuilder, private _router: Router, private _auth :AuthService, private _sysMessages: SystemMessagesComponent){
		this.reportForm = this._fb.group({
	      'foul': [null, Validators.required]
	    })
	}
	ngOnChanges(changes:any):void{
	  let dataChange:any = changes.datareport.currentValue;
      if (dataChange) {
				$('.modal').modal();
      	reportData.setId(dataChange[0]);
      	reportData.setType(dataChange[1]);
				let observable = dataChange[1] === 'reply' ? this.reportReplyOutput : this.reportCommentOutput;
				reportData.setObservable(observable);
				let modal = dataChange[2] === false ? $('#modal-report') : $('#modal-has-reported');
				reportData.setModal(modal);
      	modal.modal('open');
      }
	};
	closeReport(){
		reportData.getModal().modal('close');
		reportData.clearId();
		reportData.clearType();
		reportData.clearObservable();
	}
	submitReport(values){
		reportData.getObservable().emit([reportData.getId(),values.foul]);;
		reportData.clearId();
		reportData.clearType();
		reportData.clearObservable();
		reportData.getModal().modal('close');
	}
}