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
var adminPostData = {
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
  selector: 'admin_posts_modal',
  templateUrl: 'admin.posts.modal.component.html',
  providers: [FormBuilder,AuthService,SystemMessagesComponent]
})

export class AdminPostsModalComponent implements OnChanges {
	reportForm:FormGroup;
    commentsSubscription:any;
    ratingsSubscription:any;
    votesSubscription:any;
    likesSubscription:any;
    @Input() dataadmin:any;
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
            let modal = $('#modal-admin-posts');
            this.postId = dataChange[0];
            this.type = dataChange[1];
            this.category = dataChange[2];
            this.subCategory = dataChange[3];
            adminPostData.setModal(modal);
            modal.modal('open');
            this.watchRatingsHtml()
            this.watchCommentsHtml();
      }
	};
    submitVotes(){
        let headers = new Headers();
        let count = $('#votes-count').val();
        let average = $('#post-average').val();
        let time = $('#votes-time').val();
        let time_type = $('#votes-time-type').val();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.postId, 'type':this.type,'category': this.category, 'subcategory': this.subCategory, count:count, average:average,time:time, "speed":time_type}
        this.votesSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/votes`, creds, {headers: headers}).subscribe(data => {
            
            if(data.json().success){
                Materialize.toast("Votes Successfully Submitted", 3000, 'rounded-success')
                this.resetVotes();
            } else if(data.json().users){
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
            } else if(data.json().status === 403){
                Materialize.toast("See, this is why we can't have nice things...", 3000, 'rounded-failure')
            } else {
                //   $('#content').children('div:first').remove();
            }
        });
        setTimeout(()=>{if(this.votesSubscription) this.votesSubscription.unsubscribe();},20000)
    }

    watchRatingsHtml(){
        let count, average,advanced, simple;
        $('#simple-ratings-count').on('change', ()=>{
            simple = true;
            if(!$('#content').data('simple')){
                $('#content').data('simple',true)
                $('#content').append(this.addSimpleRatingsHtml());
            }  else {
                if(!$('#content').data('advanced')){
                    $('#content').data('advanced',true)
                    $('#content').append(this.addAdvancedRatingsHtml());
                }
            }
        //    this.watchSimpleRatingsHtml();
        });
        $('#advanced-ratings-count').on('change', ()=>{
            advanced = true;
            $('#content').append(this.addAdvancedRatingsHtml());
            // this.watchAdvancedRatingsHtml();
        });
        $('#submit-ratings-button').on('click', ()=>{
            this.submitRatings();
        });
    }

    addAdvancedRatingsHtml(){
         return `
                    <div class='row col' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
                        <h6 class='center'>Advanced Ratings</h6>
                        <div>
                            <div class='col m3'>
                                <label>Lyrics:</label>
                                <input type='text' id='lyrics-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Production:</label>
                                <input type='text' id='production-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Originality:</label>
                                <input type='text' id='originality-ratings-count'/>
                            </div>
                            <div class='col m3'>
                                <label>Deviation:</label>
                                <input type='text' id='advanced-ratings-deviation-count'/>
                            </div>
                        </div>
                    </div>
                `
    }

    addSimpleRatingsHtml(){
         return `
                    <div class='row col' style='border:1px solid rgba(0,0,0,0.2);width: 103%' id='ratings-html'>
                        <h6 class='center'>Simple Ratings</h6>
                        <div>
                            <div class='col m6'>
                                <label>Average:</label>
                                <input type='text' id='simple-ratings-average'/>
                            </div>
                            <div class='col m6'>
                                <label>Deviation:</label>
                                <input type='text' id='simple-ratings-deviation'/>
                            </div>
                        </div>
                    </div>
                `
    }

    // addHaterRatingsHtml(){
    //     return `
    //                 <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
    //                     <h6 class='center'>Update Ratings</h6>
    //                     <div>
    //                         <div class='col m6'>
    //                             <label>Simple Count:</label>
    //                             <input type='text' id='simple-ratings-count'/>
    //                         </div>
    //                         <div class='col m6'>
    //                             <label>Advanced Count:</label>
    //                             <input type='text' id='advanced-ratings-count'/>
    //                         </div>
    //                     </div>
    //                 </div>
    //             `
    // }
    //
    // addFansRatingsHtml(){
    //     return `
    //                 <div class='row col m8 offset-m2' style='border:1px solid rgba(0,0,0,0.2)' id='ratings-html'>
    //                     <h6 class='center'>Update Ratings</h6>
    //                     <div>
    //                         <div class='col m6'>
    //                             <label>Simple Count:</label>
    //                             <input type='text' id='simple-ratings-count'/>
    //                         </div>
    //                         <div class='col m6'>
    //                             <label>Advanced Count:</label>
    //                             <input type='text' id='advanced-ratings-count'/>
    //                         </div>
    //                     </div>
    //                 </div>
    //             `
    // }

    submitLikes(){
        let count = $('#likes-count').val();
        let time = $('#likes-post-time').val();
        let time_type = $('#likes-time-type').val();
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.postId, 'type':this.type,'category': this.category, 'subcategory': this.subCategory, count:count,time:time, "speed":time_type}
        Materialize.toast("This may take awhile", 3000, 'rounded')
  		this.likesSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/likes`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  Materialize.toast("Likes Successfully Submitted", 3000, 'rounded-success')
                  this.resetLikes();
              } else if(data.json().users){
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
              } else if (data.json().status === 415){
                Materialize.toast("Post Type Can't Be News", 3000, 'rounded-failure')
              } else if(data.json().status === 403){
                Materialize.toast("See, this is why we can't have nice things...", 3000, 'rounded-failure')
              } else {
                  $('#content').children('div:first').remove();
              }
        });
        setTimeout(()=>{if(this.likesSubscription) this.likesSubscription.unsubscribe()},20000)
    }
    
    submitRatings(){
        let simple_count = $('#simple-ratings-count').val();
        let advanced_ratings_count = $("#advanced-ratings-count").val();   

        let simple = $('#simple-ratings-average').val();
        let simple_deviation = $('#simple-ratings-deviation').val();

        let lyrics = $('#lyrics-ratings-count').val();
        let production =  $('#production-ratings-count').val();
        let originality = $('#originality-ratings-count').val();
        let advanced_deviation = $('#advanced-ratings-deviation-count').val();
        let advanced = Math.ceil((parseInt(lyrics) + parseInt(production) + parseInt(originality)) / 3)
        
        let time = $('#ratings-time').val();

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.postId, 'type':this.type,'category': this.category, 'subcategory': this.subCategory,simple_count:simple_count,advanced_count:advanced_ratings_count,time:time,
        simple:simple,simple_deviation:simple_deviation,
        advanced:advanced,lyrics:lyrics,production:production,originality:originality,advanced_deviation:advanced_deviation}
  		this.ratingsSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/ratings`, creds, {headers: headers}).subscribe(data => {
              
              if(data.json().success){
                  Materialize.toast("Ratings Successfully Submitted", 3000, 'rounded-success')
                  this.resetRatings();
              } else if(data.json().users){
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
              } else if(data.json().status === 403){
                Materialize.toast("See, this is why we can't have nice things...", 3000, 'rounded-failure')
              } else {
                  $('#content').children('div:first').remove();
              }
        });
        setTimeout(()=>{if(this.ratingsSubscription) this.ratingsSubscription.unsubscribe()},20000)
    }
    watchCommentsHtml(){
        $('#replies-admin-post-count').on('keyup change', ()=>{
            
            let count = $('#replies-admin-post-count').val();
            $('#comment-info-post').css({'display':'initial'});
            $(`#comment-info-post`).children().remove();
            $('#comment-info-post').data('count', count);
            for(let i=0; i < count; i++){
                $("#comment-info-post").append(this.addIndCommentHtml(i))
            }
        })
    }
    submitComments(){
        this.jsonify();  
        $('#submit-post-shit').prop('disabled','disabled');
        let headers = new Headers();
        let count =  $('#comment-info-post').data('count');
        let replies_time = $("#replies-admin-post-time").val();
        let replies_time_type = $("#replies-admin-post-time-type").val();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        let creds = {'id': this.postId, 'post':this.postId ,'type':this.type,'replies_time':replies_time,'speed':replies_time_type,'count':count,'category':this.category,'subcategory':this.subCategory,comments:this.comments,'female_count':this.female_count}
        
        this.commentsSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/admin/bots/comments`, creds, {headers: headers}).subscribe(data => {
            
            if(data.json().success){
                Materialize.toast("Comments Successfully Submitted", 3000, 'rounded-success')
                this.resetComment();
            } else if(data.json().status === 403){
                Materialize.toast("See, this is why we can't have nice things...", 3000, 'rounded-failure')
            } else if(data.json().users) {
                Materialize.toast("Not enough bots for this request.", 3000, 'rounded-failure')
                //   $('#content').children('div:first').remove();
            }
        });
        setTimeout(()=>{ if(this.commentsSubscription) this.commentsSubscription.unsubscribe()},20000)
        $('#submit-post-shit').prop('disabled',false);  
    }
    jsonify(){
        let count = parseInt($('#comment-info-post').data('count'));
        let female_count = 0;
        let jsonObject = {};
        for(let i=0;i<count;i++){
            let body =  $(`#comment-post-body-${i}`).val()
            jsonObject[i]={body: body,
                           reply_to:$(`#reply-to-post-${i}`).val(),
                           user:$(`#user-post-${i}`).val(),
                           female:$(`#user-post-gender-${i}`).val(),
                           marked: marked(body),
                           votes: $(`#votes-post-comment-${i}`).val(),
                           average: $(`#average-post-comment-${i}`).val(),
                           time: $(`#time-post-comment-${i}`).val(),
                           type: $(`#time-type-post-comment-${i}`).val() }
            if($(`#user-post-gender-${i}`).val() === 'true') this.female_count += 1;
        }
        this.comments = jsonObject;
    }
    addIndCommentHtml(index){
        return `
                    <hr style='border:${index === 0 ? 1 : 0}px solid rgba(0,0,0,0.5)'>
                    <div id='comment-post-html-${index}' data-index='${index}' class='row col m12'>
                        <p>${index}:</p>   
                        <div class='row'>
                            <div class='col m4'>Reply to:
                                <input id='reply-to-post-${index}' class='col m12'></input>
                            </div>
                            <div class='col m4'>User:
                                <input id='user-post-${index}' class='col m12'></input>
                            </div>
                             <div class='col m4'>Female?
                                <select id='user-post-gender-${index}' class='col m12' style='display:block'>
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
                                    <input type='text' id='votes-post-comment-${index}'/>
                                </div>
                                <div class='col m3'>
                                    <label>Average:</label>
                                    <input type='text' id='average-post-comment-${index}'>
                                </div>
                                <div class='col m3'>
                                    <label>Time:</label>
                                    <input type='text' id='time-post-comment-${index}'>
                                </div>
                                <div class='col m3'>
                                    <label>Time Type:</label>
                                    <select id='time-type-post-comment-${index}' style='display:block'>
                                      <option value="normal">normal</option>
                                      <option value="slow">slow</option>
                                      <option value="fast">fast</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class='row'>
                            <label for='link' id='song-post-description'>Body - (Markdown and HTML; styling disabled)</label>
                            <textarea [ngClass]="{ 'has-error-body' : uploadText.controls.description.errors?.required && uploadText.controls.description.touched}" id='comment-post-body-${index}' [formControl]="uploadText.controls['description']" class="validate" type='text' data-type='text'></textarea>
                        </div>
                    </div>
                `
    }
    resetComment(){
        $('#comment-info-post').data('count');
        $('#comment-admin-post-time').val('');
        $('#comment-admin-post-count').val('');
        $("#comment-admin-post-average").val('');
        $('#comment-admin-post-time-type').val('');
        $("#replies-admin-post-time").val('');
        $("#replies-admin-post-count").val('');
        $("#replies-admin-post-time-type").val('');
        $(`#comment-info-post`).children().remove();
    }
    resetVotes(){
        $("#votes-count").val('');
        $('#post-average').val('');
        $('#votes-time').val('');
        $("#votes-time-type").val('');
    }
    resetRatings(){
        $("#ratings-time").val('');
        $("#ratings-time-type").val('');
        $("#simple-ratings-count").val('');
        $("#advanced-ratings-count").val('');
        $("#hater-ratings-count").val('');
        $("#fan-ratings-count").val('');
        $(`#content`).children().remove();
        $(`#content`).data('simple',false);
        $(`#content`).data('advanced',false);
    }
    resetLikes(){
        $("#likes-count").val('');
        $("#likes-post-time").val('');
        $("#likes-time-type").val('');
    }
    reset(){
        this.resetComment();
        this.resetVotes();
        this.resetRatings();
        this.resetLikes();
    }
    close(){
        adminPostData.getModal().modal('close');
        this.resetComment();
        adminPostData.clearId();
        adminPostData.clearType();
        adminPostData.clearObservable();
    }
    deleteComment(){
        adminPostData.getObservable().emit([adminPostData.getId()]);;
        adminPostData.clearId();
        adminPostData.clearType();
        adminPostData.clearObservable();
        adminPostData.getModal().modal('close');
    }
}
