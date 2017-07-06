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
  selector: 'videos_edit',
  templateUrl: 'videos.edit.component.html',
  providers: [FormBuilder,AuthService,ModalComponent]
})

export class VideosEditComponent implements OnInit {
    uploadLink: FormGroup;
    uploadVideo: FormGroup;
    subscription:any;
    updateSubscription:any;
    type:number;
    title:string;
    artist:string;
    id:string;
    description:string;
    marked:string;
    categories:any;
    mainCategory:string;
    selectize:any;
    picture:string;
    link:string;
    photoClicked:boolean=false;
    imageFile:any;
    image:any;
    videoId:number;
    submitted:boolean=false;
    unsupported:boolean=false;
    error:boolean=false;
    originalCategory:string;
    username:string;
    uploadComplete:boolean=true;
    insubmit:boolean=false;
    has_uploaded:boolean=false;
	constructor(private _fb:FormBuilder, private _backend: BackendService, private _auth: AuthService, private _http:Http, private _modal:ModalComponent, private _sysMessages: SystemMessagesComponent, private _router: Router){};
	ngOnInit(){
     this.uploadLink = this._fb.group({
        'title': [null, Validators.required],
        'category': [null],
        'description': [null],
        'link': [null, Validators.required]
     })
	 this.uploadVideo = this._fb.group({
        'title': [null, Validators.required],
        'category': [null],
        'description': [null],
        'picture': [null]
      })
    this.username = localStorage.getItem('username') || '';
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
                    if(this.type === 0 && this.title){this.uploadLink.patchValue({title:this.title})}
                    else if(this.type === 1 && this.title){this.uploadVideo.patchValue({title:this.title})}
                    break;
                case 'artist':
                    this.artist = value ? value : null;
                    if(this.type === 0 && this.artist){this.uploadLink.patchValue({artist:this.artist})}
                    else if(this.type === 1 && this.artist){this.uploadVideo.patchValue({artist:this.artist})}
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
            if(this.id) this.pullVideo();
           if(this.type === 1) this.photoChange(); 
           this.watchDescription();
           this.watchFormattingButton();
        },1)
     }
     pullVideo(){
        let headersInit = new Headers();
        headersInit.append('id', this.id);
        headersInit.append('category', this.mainCategory);
        headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
        
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/videos/post`,{headers: headersInit}).subscribe(data => {
            
            if(data.json().success){
                if(this.username !=  data.json().video.submitted_by){
                    this._sysMessages.setMessages('unathorized');
  					this._router.navigateByUrl(`/videos/${this.mainCategory}/${this.id}`); 
                }
                this.description = data.json().video.description ? data.json().video.description : null;
                this.marked = data.json().video.marked ? data.json().video.marked : null; 
                if(this.description){$('.description-box').addClass('valid');}
                if(this.title){$('#video-title').addClass('active'); $('#title').addClass('valid');}

                if(this.type === 0 && this.description){this.uploadLink.patchValue({description:this.description})}
                else if(this.type === 1 && this.description){this.uploadVideo.patchValue({description:this.description})}
                if(this.type === 0 && data.json().video.marked){ $('#output-container-link').css({'display':'block'}); $('#post-output-text').append(data.json().video.marked);}
                else if (this.type === 1 && data.json().video.marked){ $('#output-container-upload').css({'display':'block'}); $('#post-output-upload').append(data.json().video.marked);}

                this.categories = data.json().video.categories ? data.json().video.categories : null;
                if(this.selectize && this.selectize[0]){
                    this.selectize[0].selectize.addOption({value:this.categories,text:this.categories}); 
                    this.selectize[0].selectize.addItem(this.categories);
                } 
                if(this.type === 0 && this.categories){this.uploadLink.patchValue({category:this.categories})}
                else if(this.type === 1 && this.categories){this.uploadVideo.patchValue({category:this.categories})}

                this.mainCategory = data.json().video.main_category ? data.json().video.main_category : null;
                this.originalCategory = this.mainCategory;
                let item = this.mainCategory.slice(0,1).toUpperCase() + this.mainCategory.slice(1);
                this.selectize[0].selectize.createItem(item);
                this.image = data.json().video.upload_artwork_url ? data.json().video.upload_artwork_url : null;
                if(this.type === 1 && this.image){this.uploadVideo.patchValue({picture:this.image})}
                if(this.image) $("#thumbnail").css({'display':'block'});
                this.link = data.json().video.original_link ? data.json().video.original_link : null;
                if(this.type === 0 && this.link){
                    this.uploadLink.patchValue({link:this.link})
                    $("#link").addClass('valid').prop('disabled','disabled');
                    $("#video-link-label").addClass('active');
                }
                this.videoId = data.json().video.uuid ? data.json().video.uuid : null;
            }
        })
    }

    cancelEdit(){
        this._router.navigateByUrl(`/videos/${this.originalCategory}/${this.id}`);
    }

    selectizeInit(){
        var self=this;
        this.selectize = $('.selectize-select').selectize({
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
                    url: `${self._backend.SERVER_URL}/api/v1/categories/videos/search/`,
                    type: 'GET',
                    headers:{'search':encodeURIComponent(query)},
                    error: function() {
                        callback();
                    },
                    success: function(res) {
                        // if(res && res.results && res.results.length > 1){
                        //   let length = res && res.results && res.results.length > 11 ? 10 : res.results.length;
                        //   
                        //   callback(res.results.slice(0, length));
                        // } else {
                        //   callback(res.results);
                        // }
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
    let self = this;
    $('#formatting-guide-link, #formatting-guide-upload').on('click',function(e){
      let type = $(this).data('type');
      
      if(type === 'link'){
        if(!$('#add-formatting-guide-link').data('open')){
          $('#add-formatting-guide-link').append(self.addGuide(type));
          $('#add-formatting-guide-link').data('open',true);
          $('#formatting-guide-link').addClass('active');
        } else {
          $(`#formatting-guide-type-${type}`).remove();
          $('#add-formatting-guide-link').data('open',false);
          $('#formatting-guide-link').removeClass('active')
        }
      } else{
        if(!$('#add-formatting-guide-upload').data('open')){
          $('#add-formatting-guide-upload').append(self.addGuide(type));
          $('#add-formatting-guide-upload').data('open',true);
          $('#formatting-guide-upload').addClass('active');
        } else {
          $(`#formatting-guide-type-${type}`).remove();
          $('#add-formatting-guide-upload').data('open',false);
          $('#formatting-guide-upload').removeClass('active')
        }
      }
    });
  }
  watchDescription(){
    $('#description-link, #description-upload').keyup(function(e) {
          let type = $(this).data('type')
          
          if(type === 'link'){
            $('#output-container-link').css({'display':'block'});
            $('#post-output-link').html(marked($(this).val()));
          } else {
            $('#output-container-upload').css({'display':'block'});
            $('#post-output-upload').html(marked($(this).val()));
          }
    });
  }
    submitEdit(values,type){
        this.insubmit = true;
        let fadein = setTimeout(()=>{
            $(`#submitting-${type}-video-edit`).fadeIn().css("display","inline-block");
        },750)
        let title = values.title? values.title : this.title;
        let artist = values.artist ? values.artist : this.artist;
        let description = values.description ? values.description : this.description;
        let markedBody = description ? marked(description) : null;

        var creds = {"title":title, "categories" : this.categories, "edit":true, "main_category": this.mainCategory, "description" : description,"marked":markedBody, "video": this.videoId}
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.updateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/update`, creds, {headers: headers}).subscribe(data => {
            this.insubmit = false;
            clearTimeout(failedRequest);
            if(data.json().success){
                this.submitted = true;
                if(this.has_uploaded) Materialize.toast("Please allow a minute for the photo to upload/change", 3500, 'rounded');
                this._sysMessages.setMessages('editVideo');
                this._router.navigateByUrl(`/videos/${this.mainCategory}/${data.json().url}`);
            } else if (data.json().error) {
                this.unsupported = true;
            } else if(data.json().status === 401){
                this._modal.setModal();
            } else if(data.json().link){
                Materialize.toast("Link can't be edited after submission", 3000, 'rounded-failure');
                $('.song-title').removeClass('valid').addClass('invalid');
            } else {
                this.error = true;
            }
            if(fadein) clearTimeout(fadein);
            $(`#submitting-${type}-video-edit`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.submitted = false;
        });
        let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $(`#submitting-${type}-video-edit`).css({'display':'none'});
        },15000);
    }
    photoUpload(){
       var self = this;
       
       $(`#photo-upload`).fileupload({
            url: `${self._backend.SERVER_URL}/api/v1/videos/update`,
            formData: {'authorization': `Bearer ${self._auth.getToken()}`, 'photo_upload':1, 'video': self.videoId},
            dataType: 'json',
            add: function (e, data) {
                $('#progress-photo-container').css({visibility:"visible"});
                self.uploadComplete = false;
                data.submit();
            },
            progress: function (e, data) {
                var progress = Math.floor(((parseInt(data.loaded)*0.9)  / (parseInt(data.total))) * 100);
                $('#inner-progress-photo').css({'transform':`translateX(${progress}%)`});
                $('#progress-text-photo').text(progress);
            },
            done: function (e, data) {
                $('#inner-progress-photo').css({'transform':`translateX(100%)`});
                $('#progress-text-photo').text(100);
                if(e) 
                self.uploadComplete = true;
                self.has_uploaded = true;
            }
        });    
    }
    photoChange(){
        
            $(`#photo-upload`).click(()=>{
                this.photoUpload();
                if(this.photoClicked){
                $("#photo-upload").val(null);
                }
                this.photoClicked = true;
                var fileSelector = $("#photo-upload").change(()=>{
                var file = fileSelector[0].files[0];
                
                this.imageFile = file;
                if (FileReader && file) {
                    var fr = new FileReader();
                    fr.onload = ()=> {
                    this.image = fr.result;
                    }
                    fr.readAsDataURL(file);
                } else { //no FileReader support

                }
                });  
            });
        }
    ngOnDeath(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.updateSubscription) this.updateSubscription.unsubscribe();
    }
}
