import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

declare var $;
declare var marked;
declare var Materialize;

import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
import {BackendService} from '../../../services/backend.service';

@Component({
  selector: 'comments_form',
  templateUrl: 'comments.form.component.html',
  providers: [ModalComponent]
})

export class CommentsFormComponent implements OnInit {
  @Input() post:any;
  @Output() submittedComment = new EventEmitter();
  close = new EventEmitter();
  // type:string='post';
  comment_id:number=0;
  parent_id:number=null;
  generation:number=0;
  type:string;
  uploadComment: FormGroup;
  submitted:boolean;
  id:any;
  subscription:any;
  edit:boolean=false;
  body:string;
  marked:string;
  constructor(private _http:Http, private _backend: BackendService, private _fb: FormBuilder, private _auth: AuthService, private _modal: ModalComponent){};
  ngOnInit(){
    this.uploadComment = this._fb.group({
        'body': [null, Validators.required],
    })
  };

  submitComment(values){
    if(!this.submitted && !this.edit){
    this.submitted = true;
    let spinner, spinnerTimeout;
    spinnerTimeout = setTimeout(()=>{
      spinner = true;
      $('#submit-comment').fadeIn().css("display","inline");;
    },750)
    var headers = new Headers();
    let markedBody = values.body ? marked(values.body) : null;
    let creds;
    if(!this.parent_id){
      creds = {"type":this.post[0], "id": this.post[1], "body" : values.body, "marked":markedBody}
    } else if(this.parent_id != null) {
      creds = {"parent_uuid":this.parent_id, "generation":this.generation, "type":this.type, "id": this.id, "body" : values.body, "marked":markedBody}
    }
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/comments/new`, creds, {headers: headers}).subscribe(data => {
          clearTimeout(failedRequest);
          if(spinnerTimeout) clearTimeout(spinnerTimeout)
          if(spinner) $('#submit-comment').css({'display':'none'});
          if(data.json().success){
            this.submitted = false;
            $('.waves-ripple').remove();
            this.uploadComment.reset()
            let emittedValues = data.json().comment
            this.submittedComment.emit(emittedValues);
            this.close.emit(emittedValues);
            $('#root-comment-body').val('');
            $('#root-comment-body').blur();
            // this.uploadComment.valid = false;
            // this._music.setMessages('submittedMusic');
            // this._router.navigateByUrl('/music');
          } 
          if(data.json().status === 401){
              this._modal.setModal();
          } else if (data.json().locked){
            $('#root-comment-body').val('');
            $('#root-comment-body').blur();
            Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
          } else if(data.json().archived){
            $('#root-comment-body').val('');
            $('#root-comment-body').blur();
            Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
          }
      });
      let failedRequest = setTimeout(()=>{
          $('.waves-ripple').remove();
          this.submitted = false;
          Materialize.toast("Something failed on our end. Please try again.", 3000, 'rounded-failure');
          $(`#submit-comment`).css({'display':'none'});
      },15000);
    } 
  }
  addGuide(type){
    return `
            <div class='row col ps12 m8 offset-m2' style='border:1px solid rgba(0,0,0,0.1);margin-top:10px' id='formatting-guide${type ? '-' + type : ''}'>
              <span class='center'>Guide</span>
              <hr>
              <div class='input col ps6' style='padding:0px !important'>
                <div class='format-box'>Input</div>
                <div class='format-box'>*italics* or _italics_</div>
                <div class='format-box'>**bold** or __bold__</div>
                <div class='format-box'>[link to waydope.com](https://waydope.com)</div>
                <div class='format-box'>![image name](https://img.com/img.png)</div>
                <div class='format-box'># h1 ## h2 ### h3</div>
              </div>
              <div class='output col ps6' style='padding:0px !important'>
                <div class='format-box'>Output</div>
                <div class='format-box'><i>italics</i></div>
                <div class='format-box'><b>bold</b></div>
                <div class='format-box'><a href='https://waydope.com'>link to waydope.com</a></div>
                <div class='format-box'><img src='https://waydope.com/assets/images/favicon.ico' alt='image name'/></div>
                <div class='format-box'><h1 style='display:inline'>h1</h1> <h2 style='display:inline'>h2</h2> <h3 style='display:inline'>h3</h3></div>
              </div>
            </div>
            `
  }
  formattingButton(type){
    if(!$(`#add-formatting-guide-link${type ? '-' + type : ''}`).data('open')){
      $(`#add-formatting-guide-link${type ? '-' + type : ''}`).append(this.addGuide(type));
      $(`#add-formatting-guide-link${type ? '-' + type : ''}`).data('open',true);
      $(`#formatting-guide-link${type ? '-' + type : ''}`).addClass('active');
    } else {
      $(`#formatting-guide${type ? '-' + type : ''}`).remove();
      $(`#add-formatting-guide-link${type ? '-' + type : ''}`).data('open',false);
      $(`#formatting-guide-link${type ? '-' + type : ''}`).removeClass('active');
    }
  }
  
  submitEdit(values){
    this.submitted = true;
    let spinnerTimeout,spinner;
    spinnerTimeout = setTimeout(()=>{
      spinner = true;
      $('#submit-edit').fadeIn().css("display","inline");
    },750)
    if(this.edit){
      let body = values.body != null ? values.body : this.body;
      let markedBody = values.body != null ? marked(values.body) : marked(this.body);  
      let creds = {"id": this.comment_id, "body" : body, "marked": markedBody};
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      if(this.generation > 0) {
        this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/comments/reply/edit`, creds, {headers: headers}).subscribe(data => {
          // $(`${data.json().type}-body-${data.json().id}`).text(`${data.json().reply}`);
          clearTimeout(failedRequest);
          if(spinnerTimeout) clearTimeout(spinnerTimeout);
          if(spinner) $('#submit-edit').css({'display':'none'});
          if(data.json().success){
            this.submitted = false;
            let emittedValues = [data.json().type, data.json().id, data.json().body, data.json().marked];
            this.close.emit(emittedValues);
          } else if (data.json().locked){
            // $('#root-comment-body').val('');
            // $('#root-comment-body').blur();
            Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
          } else if(data.json().archived){
            // $('#root-comment-body').val('');
            // $('#root-comment-body').blur();
            Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
          }
        });
      } else {
        this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/comments/edit`, creds, {headers: headers}).subscribe(data => {
          clearTimeout(failedRequest);
          if(data.json().success){
            this.submitted = false;
            $('#submit-edit').css({'display':'none'});
            let emittedValues = [data.json().type, data.json().id, data.json().body, data.json().marked]
            this.close.emit(emittedValues);
          } else if (data.json().locked){
            // $('#root-comment-body').val('');
            // $('#root-comment-body').blur();
            Materialize.toast("<i class='fa fa-lock'></i> This post has been locked", 3000, 'rounded')
          } else if(data.json().archived){
            // $('#root-comment-body').val('');
            // $('#root-comment-body').blur();
            Materialize.toast("<i class='fa fa-archive'></i>  This post has been archived", 3000, 'rounded')
          }
        });
      }
    } 
    let failedRequest = setTimeout(()=>{
          $('.waves-ripple').remove();
          this.submitted = false;
          Materialize.toast("Something failed on our end. Please try again.", 3000, 'rounded-failure');
          $(`#submit-edit`).css({'display':'none'});
      },15000); 
  }

  ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
  }
}
