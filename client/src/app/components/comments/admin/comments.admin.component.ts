import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';
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
declare var Materialize;
declare var marked;

//So once the class has left ngOnChanges, all values end up getting reset. To understand this, uncomment the 'this.deleteReplyOutput' in ngChanges
// and in deleteComment. As you can see, it loses its subscription. This closure fixes this.
// This also occured when not using the @input and instead calling the setDeleteModal from comments and comments.loop.
var adminCommentsData = {
  type:null,
  id:'',
  postID:'',
  category:'',
  subCategory:'',
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
  getPostId:function(){
    return this.postID;
  },
  setPostId:function(id){
    this.postID = id;
  },
  clearPostId:function(){
    this.postID = null;
  },
  getCategory:function(){
    return this.category;
  },
  setCategory:function(category){
    this.category = category;
  },
  clearCategory:function(){
    this.category = null;
  },
  getSubCategory:function(){
    return this.subCategory;
  },
  setSubCategory:function(category){
    this.subCategory = category;
  },
  clearSubCategory:function(){
    this.subCategory = null;
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
  selector: 'comments_admin',
  templateUrl: 'comments.admin.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class CommentsAdminComponent implements OnChanges {
    reportForm:FormGroup;
    commentsSubscription:any;
    @Input() dataadmin:any;
    id:string;
    postId:number;
    subCategory:string;
    category:string;
    type:string;
    has_reported:boolean=false;
    female_count:number=0;
    comments:any;
    constructor(private _fb: FormBuilder, private _http: Http, private _backend:BackendService, private _router: Router, private _auth :AuthService, private _sysMessages: SystemMessagesComponent){
		this.reportForm = this._fb.group({
	      'foul': [null, Validators.required]
	    })
	}
	ngOnChanges(changes:any):void{
	  let dataChange:any = changes.dataadmin.currentValue;
      if (dataChange) {
          
            $('.modal').modal();
            let modal = $('#modal-admin-comments');
            this.id = dataChange[0];
            console.log('id');
            console.log(this.id);
            this.postId = dataChange[1];
            this.type = dataChange[2];
            this.category = dataChange[3];
            this.subCategory = dataChange[4];
            adminCommentsData.setModal(modal);
            modal.modal('open');
            this.watchCommentsHtml();
            adminCommentsData.setId(dataChange[0]);
            adminCommentsData.setPostId(dataChange[1]);
            adminCommentsData.setType(dataChange[2]);
            adminCommentsData.setCategory(dataChange[3]);
            adminCommentsData.setSubCategory(dataChange[4])
      }
	};
    watchCommentsHtml(){
        $('#replies-admin-count').on('keyup change', ()=>{
            let count = $('#replies-admin-count').val();
            if(count) $(`#comment-admin-modal-replies-input-container`).css({'border-bottom':'2px solid rgba(0,0,0,0.1)'})
            $('#comment-info').css({'display':'initial'});
            $(`#comment-info`).children().remove();
            $('#comment-info').data('count', count);
            for(let i=0; i < count; i++){
                $("#comment-info").append(this.addIndCommentHtml(i))
            }
        })
    }
    submitComments(){
        this.jsonify();  
        $('#submit-comment-shit').prop('disabled','disabled');
        let headers = new Headers();
        let count =  $('#comment-info').data('count');
        let time = $('#comment-admin-time').val();
        let votes = $('#comment-admin-count').val();
        let average = $("#comment-admin-average").val();
        let time_type = $('#comment-admin-time-type').val();
        let replies_time = $("#replies-admin-time").val();
        let replies_time_type = $("#replies-admin-time-type").val();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'comment': adminCommentsData.getId(), 'post':adminCommentsData.getPostId() ,'type':adminCommentsData.getType(),'average':average,'replies_time':replies_time,'replies_time_type':replies_time_type,'votes':votes,'time':time,'time_type':time_type,'count':count,'category':adminCommentsData.getCategory(),'subcategory':adminCommentsData.getSubCategory(),comments:this.comments,'female_count':this.female_count}
        
        this.commentsSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/comment`, creds, {headers: headers}).subscribe(data => {
                if(data.json().success){
                    Materialize.toast("Comments Successfully Submitted", 3000, 'rounded-success')
                    this.closeComments();
                } else if(data.json().users) {
                    Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
                  //   $('#content').children('div:first').remove();
                }
                setTimeout(()=>{
                  this.commentsSubscription.unsubscribe();
                },60000)
        });
        $('#submit-comment-shit').prop('disabled',false);  
    }
    jsonify(){
        let count = parseInt($('#comment-info').data('count'));
        let female_count = 0;
        let jsonObject = {};
        for(let i=0;i<count;i++){
            let body =  $(`#comment-body-${i}`).val()
            jsonObject[i]={body: body,
                           reply_to:$(`#reply-to-${i}`).val(),
                           user:$(`#user-${i}`).val(),
                           female:$(`#user-gender-${i}`).val(),
                           marked: marked(body),
                           votes: $(`#votes-comment-${i}`).val(),
                           average: $(`#average-comment-${i}`).val(),
                           time: $(`#time-comment-${i}`).val(),
                           type: $(`#time-type-comment-${i}`).val() }
            if($(`#user-gender-${i}`).val() === 'true') this.female_count += 1;
        }
        this.comments = jsonObject;
    }
    addIndCommentHtml(index){
        return `
                    <hr style='border:${index === 0 ? 1 : 0}px solid rgba(0,0,0,0.5)'>
                    <div id='comment-html-${index}' data-index='${index}' class='row col m12'>
                        <p>${index}:</p>   
                        <div class='row'>
                            <div class='col m4'>Reply to:
                                <input id='reply-to-${index}' class='col m12'></input>
                            </div>
                            <div class='col m4'>User:
                                <input id='user-${index}' class='col m12'></input>
                            </div>
                             <div class='col m4'>Female?
                                <select id='user-gender-${index}' class='col m12' style='display:block'>
                                    <option value="false">False</option>
                                    <option value="true">True</option>
                                </select>
                            </div>
                        </div>
                        <div class='row'>
                            Comment Votes:
                            <div>
                                <div class='col m3'>
                                    <label>Count:</label>
                                    <input type='text' id='votes-comment-${index}'/>
                                </div>
                                <div class='col m3'>
                                    <label>Average:</label>
                                    <input type='text' id='average-comment-${index}'>
                                </div>
                                <div class='col m3'>
                                    <label>Time:</label>
                                    <input type='text' id='time-comment-${index}'>
                                </div>
                                <div class='col m3'>
                                    <label>Time Type:</label>
                                    <select id='time-type-comment-${index}' style='display:block'>
                                      <option value="regular">regular</option>
                                      <option value="slow">slow</option>
                                      <option value="fast">fast</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class='row'>
                            <label for='link' id='song-description'>Body - (Markdown and HTML; styling disabled)</label>
                            <textarea [ngClass]="{ 'has-error-body' : uploadText.controls.description.errors?.required && uploadText.controls.description.touched}" id='comment-body-${index}' [formControl]="uploadText.controls['description']" class="validate" type='text' data-type='text'></textarea>
                        </div>
                    </div>
                `
    }
    resetModal(){
        let count =  $('#comment-info').data('count');
        let time = $('#comment-admin-time').val('');
        let votes = $('#comment-admin-count').val('');
        let average = $("#comment-admin-average").val('');
        let time_type = $('#comment-admin-time-type').val('');
        let replies_time = $("#replies-admin-time").val('');
        let replies_time_type = $("#replies-admin-time-type").val('');
        $(`#comment-info`).children().remove();
        $('#replies-admin-count').unbind('keyup change');
    }
	closeComments(){
		adminCommentsData.getModal().modal('close');
        this.resetModal();
		adminCommentsData.clearId();
		adminCommentsData.clearType();
		adminCommentsData.clearObservable();
	}
	deleteComment(){
		adminCommentsData.getObservable().emit([adminCommentsData.getId()]);;
		adminCommentsData.clearId();
		adminCommentsData.clearType();
		adminCommentsData.clearObservable();
		adminCommentsData.getModal().modal('close');
	}
}
