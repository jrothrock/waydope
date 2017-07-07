import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import 'angular2-materialize';
import {ModalComponent} from '../../modal/modal.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';
// declare let ActionCable:any;
declare var $;
declare var marked;
declare var Materialize;

@Component({
  selector: 'boards_form',
  templateUrl: 'boards.form.component.html',
  providers: [FormBuilder,AuthService,ModalComponent,SystemMessagesComponent]
})

export class BoardsFormComponent implements OnInit {
  uploadText: FormGroup;
	uploadLink: FormGroup;
  subscription:any;
	error:boolean=false;
	powers = ['business','science','technology','sports'];
  unsupported:boolean=false;
  dataEvent = new EventEmitter();
  eventSubscription:any;
  categories:any;
  mainCategory:string;
  insubmit:boolean=false;
	constructor(private _http: Http, private _backend: BackendService, private _auth: AuthService, private _fb: FormBuilder, private _router: Router, private _modal: ModalComponent, private _sysMessages:SystemMessagesComponent){};
	ngOnInit(){
    const self = this; //The class falls out of scope in selectize and actioncable
    this.uploadLink = this._fb.group({
        'title': [null, Validators.required],
        'category': [null],
        'link': [null, Validators.required]
    })
		this.uploadText = this._fb.group({
	      'title': [null, Validators.required],
	      'category': [null],
	      'description': [null, Validators.required]
	  })

    $('.category').selectize({
        plugins: ['restore_on_backspace','remove_button','drag_drop'],
        delimiter: ',',
        persist: false,
        openOnFocus: true,
        hideSelected:true,
        selectOnTab:true,
        addPrecedence:true,
        // maxItems: 5,
        closeAfterSelect:true,
        valueField: 'title',
        labelField: 'title',
        searchField: 'title',
        options: [],
        create: function(input)
        {
          return({title:input});
        },
        render: {
            option: function (item, escape) {
                return '<div>' + escape(item.title) + '</div>';
            }
        },
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: `${self._backend.SERVER_URL}/api/v1/categories/boards/search/`,
                type: 'GET',
                headers:{'search':encodeURIComponent(query)},
                error: function() {
                    callback();
                },
                success: function(res) {
                    callback(res.results);
                }
            });
        },
        onBlur(){
          self.categories = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
        },
        onChange(value){
          self.mainCategory = value.split(",",1).toString().toLowerCase();
        }
    });
  
    this.watchDescription();
    this.watchFormattingButton();
	};
  addGuide(type){
    return `
            <div class='row col ps12 m8 offset-m2' style='border:1px solid rgba(0,0,0,0.1);margin-top:10px' id='formatting-guide-type-${type}'>
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
  watchFormattingButton(){
    let component = this;
    $('#formatting-guide-link,#formatting-guide-text').on('click',function(e){
      let type = $(this).data('type');
      if(type === 'link'){
        if(!$('#add-formatting-guide').data('open')){
          $('#add-formatting-guide').append(component.addGuide(type));
          $('#add-formatting-guide').data('open',true);
          $('#formatting-guide-link').addClass('active');
        } else {
          $(`#formatting-guide-type-${type}`).remove();
          $('#add-formatting-guide').data('open',false);
          $('#formatting-guide-link').removeClass('active')
        }
      } else{
        if(!$('#add-formatting-guide-text').data('open')){
          $('#add-formatting-guide-text').append(component.addGuide(type));
          $('#add-formatting-guide-text').data('open',true);
          $('#formatting-guide-text').addClass('active');
        } else {
          $(`#formatting-guide-type-${type}`).remove();
          $('#add-formatting-guide-text').data('open',false);
          $('#formatting-guide-text').removeClass('active')
        }
      }
    });
  }
  watchDescription(){
    $('#description, #description-text').keyup(function(e) {
          let type = $(this).data('type')
          if(type === 'link'){
            $('#output-container').css({'display':'block'});
            $('#post-output-link').html(marked($(this).val()));
          } else {
            $('#output-container-text').css({'display':'block'});
            $('#post-output-text').html(marked($(this).val()));
          }
    });
  }
	submitNews(values,type){
    this.insubmit = true;
    let fadein = setTimeout(()=>{
            $(`#submit-boards-${type}`).fadeIn().css("display","inline-block");
    },750)
		var headers = new Headers();
    var post_type = type === 'link' ? 1 : 0;
    var creds;
    let markedBody = values.description ? marked(values.description) : null;
    if(post_type){
       creds = {"title": values.title, "categories" : this.categories, "main_category": this.mainCategory, "link" : values.link, "description":values.description, "marked":markedBody, "post_type":1}
    } else {
      creds = {"title": values.title, "categories" : this.categories, "main_category": this.mainCategory,  "description":values.description, "marked":markedBody, "post_type":0}
    }
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/news/new`, creds, {headers: headers}).subscribe(data => {
          clearTimeout(failedRequest);
          this._sysMessages.setMessages('submittedPost');
  				this._router.navigateByUrl(`/boards/${this.mainCategory}/${data.json().url}`);
          if(fadein) clearTimeout(fadein);
          $(`#submit-boards-${type}`).css({'display':'none'});
          $('.waves-ripple').remove();
          this.insubmit = false;
  		},error=>{
          if (error.json().error) {
  					this.unsupported = true;
  				} else if(error.json().status === 401){
              this._modal.setModal();
          } else if(error.json().status === 415){
            Materialize.toast("Link is not valid", 3000, 'rounded-failure');
          } else {
            this.error = true;
          }
      });
      let failedRequest = setTimeout(()=>{
        $('.waves-ripple').remove();
        this.insubmit = false;
        Materialize.toast("Something failed on our end. Please try again.", 3000, 'rounded-failure');
        $(`#submit-boards-${type}`).css({'display':'none'});
      },15000);
	}
  ngOnDestroy(){
    if(this.subscription) this.subscription.unsubscribe();
  }
}
