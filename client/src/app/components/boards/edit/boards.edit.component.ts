import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {AuthService} from '../../../services/auth.service';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';

declare var selectize;
declare var $;
declare var marked;
declare var Materialize;

@Component({
  selector: 'boards_edit',
  templateUrl: 'boards.edit.component.html',
  providers: [FormBuilder,AuthService,ModalComponent]
})

export class BoardsEditComponent implements OnInit {
    uploadText: FormGroup;
	uploadLink: FormGroup;
    subscription:any;
    updateSubscription:any;
    type:number;
    title:string;
    id:string;
    description:string;
    marked:string;
    categories:any;
    mainCategory:string;
    originalCategory:string;
    selectize:any;
    link:string;
    postId:number;
    submitted:boolean=false;
    unsupported:boolean=false;
    error:boolean=false;
    username:string;
    insubmit:boolean=false;
	constructor(private _fb:FormBuilder, private _auth: AuthService, private _backend: BackendService, private _http:Http, private _modal:ModalComponent, private _sysMessages: SystemMessagesComponent, private _router: Router){};
	ngOnInit(){
        this.username = localStorage.getItem('username') || '';      
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
        let decoded = decodeURIComponent(window.location.search.substring(1))
        let params = decoded.split("&");
        for(let i = 0;i < params.length; i++){
            let key = params[i].split("=")[0]
            let value = params[i].split("=")[1]
            switch(key){
                case 'type':
                    this.type = value ? parseInt(value) : null;
                    break;
                case 'title':
                    this.title = value ? value : null;
                    if(this.type === 0 && this.title){this.uploadText.patchValue({title:this.title})}
                    else if(this.type === 1 && this.title){this.uploadLink.patchValue({title:this.title})}
                    break;
                case 'category':
                    this.mainCategory = value ? value : null;
                    break;
                case 'id':
                    this.id = value ? value : null;
                    break;
            }
        }
        setTimeout(()=>{
            this.selectizeInit();
            if(this.id) this.pullPost();
            this.watchFormattingButton();
            this.watchDescription();
        },10)
     }
     pullPost(){
        let headersInit = new Headers();
        headersInit.append('id', this.id);
        headersInit.append('category', this.mainCategory);
        headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/news/post`,{headers: headersInit}).subscribe(data => {
            if(data.json().success){
                if(this.username !=  data.json().post.submitted_by){
                    this._sysMessages.setMessages('unathorized');
  					this._router.navigateByUrl(`/boards/${this.mainCategory}/${this.id}`); 
                }
                this.description = data.json().post.description ? data.json().post.description : null;
                this.link = data.json().post.link ? data.json().post.link : null;
                this.marked = data.json().post.marked ? data.json().post.marked : null;
                if(this.description){$('.description-box').addClass('valid');} //would add to both, but that doesn't really matter in this case - as one will be hidden.
                if(this.title){$('#post-title').addClass('active'); $('#title').addClass('valid');}
                if(this.link && this.type === 1){$(`#post-link`).addClass('active'); $('#link').addClass('valid'); this.uploadLink.patchValue({link:this.link})}

                if(this.type === 0 && this.description){this.uploadText.patchValue({description:this.description})}
                else if(this.type === 1 && this.description){this.uploadLink.patchValue({description:this.description})}
                if(this.type === 0 && data.json().post.marked){ $('#output-container-link').css({'display':'block'}); $('#post-output-text').append(data.json().post.marked);}
                else if (this.type === 1 && data.json().post.marked){ $('#output-container-link').css({'display':'block'}); $('#post-output-link').append(data.json().post.marked);}
                this.categories = data.json().post.categories ? data.json().post.categories : null;
                this.mainCategory = data.json().post.main_category ? data.json().post.main_category : null;
                this.originalCategory = this.mainCategory;
                let item = this.mainCategory.slice(0,1).toUpperCase() + this.mainCategory.slice(1);
                this.selectize[0].selectize.createItem(item);
                if(this.selectize && this.selectize[0]) this.selectize[0].selectize.addItem(this.categories);
                if(this.type === 0 && this.categories){this.uploadText.patchValue({genre:this.categories})}
                else if(this.type === 1 && this.categories){this.uploadLink.patchValue({genre:this.categories})}

                this.postId = data.json().post.uuid ? data.json().post.uuid : null;
            }
        })
    }
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
        if(!$('#add-formatting-guide-link').data('open')){
          $('#add-formatting-guide-link').append(component.addGuide(type));
          $('#add-formatting-guide-link').data('open',true);
          $('#formatting-guide-link').addClass('active');
        } else {
          $(`#formatting-guide-type-${type}`).remove();
          $('#add-formatting-guide-link').data('open',false);
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
    $('#description-link, #description-text').keyup(function(e) {
          let type = $(this).data('type')
          if(type === 'link'){
            $('#output-container-link').css({'display':'block'});
            $('#post-output-link').html(marked($(this).val()));
          } else {
            $('#output-container-text').css({'display':'block'});
            $('#post-output-text').html(marked($(this).val()));
          }
    });
  }
    cancelEdit(){
        this._router.navigateByUrl(`/boards/${this.originalCategory}/${this.id}`);
    }
    submitEdit(values,type){
        let fadein = setTimeout(()=>{
            $(`#submit-boards-${type}-edit`).fadeIn().css("display","inline-block");
        },750)
        this.insubmit=true;
        let title = values.title ? values.title : this.title;
        let description = values.description ? values.description : this.description;
        let markedBody = description ? marked(description) : null;
       // 
        var creds = {"title":title, "categories" : this.categories, "edit":true, "main_category": this.mainCategory, "description" : description, "marked": markedBody, "post": this.postId}
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.updateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/news/update`, creds, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
            if(data.json().success){
                this.submitted = true;
                this._sysMessages.setMessages('editPost');
                this._router.navigateByUrl(`/boards/${this.mainCategory}/${data.json().url}`);
            } else if (data.json().error) {
                this.unsupported = true;
            } else if(data.json().status === 401){
                this._sysMessages.setMessages('unathorized');
                this._router.navigateByUrl(`/boards/${this.mainCategory}/${data.json().url}`);
            } else if(data.json().title){
                Materialize.toast("Original title has been altered too much", 3000, 'rounded-failure');
                $('#title').removeClass('valid').addClass('invalid');
            } else if (data.json().time){
                Materialize.toast("Title can't be changed after five minutes", 3000, 'rounded-failure');
                $('#title').removeClass('valid').addClass('invalid');
            } else if(data.json().change){
                Materialize.toast("Title can only be editted once", 3000, 'rounded-failure');
                $('#title').removeClass('valid').addClass('invalid');
            } else {
                this.error = true;
            }
            if(fadein) clearTimeout(fadein);
            $(`#submit-boards-${type}-edit`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.insubmit = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submit-boards-${type}-edit`).css({'display':'none'});
        },15000);
    }
    selectizeInit(){
        var self=this;
        this.selectize = $('.category').selectize({
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
    }
    ngOnDeath(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.updateSubscription) this.updateSubscription.unsubscribe();
    }
}
