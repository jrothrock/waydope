import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize';
import {AuthService} from '../../../services/auth.service';
import {MusicAllComponent} from '../all/music.all.component';
import {ModalComponent} from '../../modal/modal.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';

declare var selectize;
declare var $;
declare var marked;
declare var Materialize;

@Component({
  selector: 'music_edit',
  templateUrl: 'music.edit.component.html',
  providers: [FormBuilder,AuthService,MusicAllComponent,ModalComponent]
})

export class MusicEditComponent implements OnInit {
    uploadLink: FormGroup;
    uploadSong: FormGroup;
    subscription:any;
    updateSubscription:any;
    type:number;
    title:string;
    artist:string;
    id:string;
    description:string;
    marked:string;
    genres:any;
    mainGenre:string;
    selectize:any;
    picture:string;
    link:string;
    photoClicked:boolean=false;
    imageFile:any;
    image:any;
    songId:number;
    submitted:boolean=false;
    unsupported:boolean=false;
    error:boolean=false;
    originalGenre:string;
    username:string;
    server_url:string;
    uploadComplete:boolean=true;
    has_uploaded:boolean=false;
    insubmit:boolean=false;
	constructor(private _fb:FormBuilder, private _backend:BackendService, private _auth: AuthService, private _http:Http, private _modal:ModalComponent, private _sysMessages: SystemMessagesComponent, private _router: Router){};
	ngOnInit(){
    this.server_url = this._backend.SERVER_URL;
    this.username = localStorage.getItem('username') || '';        
    this.uploadLink = this._fb.group({
	      'title': [null, Validators.required],
	      'artist': [null, Validators.required],
	      'genre': [null],
	      'description': [null],
	      'link': [null, Validators.required]
	    })
    this.uploadSong = this._fb.group({
        'title': [null, Validators.required],
        'artist': [null, Validators.required],
        'download_type' : [null, Validators.required],
        'download_text' : [null],
        'download_link' : [null],
        'genre': [null],
        'description': [null],
        'picture': [null]
      });
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
                    else if(this.type === 1 && this.title){this.uploadSong.patchValue({title:this.title})}
                    break;
                case 'artist':
                    this.artist = value ? value : null;
                    if(this.type === 0 && this.artist){this.uploadLink.patchValue({artist:this.artist})}
                    else if(this.type === 1 && this.artist){this.uploadSong.patchValue({artist:this.artist})}
                    break;
                case 'genre':
                    this.mainGenre = value ? value : null;
                    break;
                case 'id':
                    this.id = value ? value : null;
                    // if(this.id) this.pullSong();
                    break;
            }
        }
        setTimeout(()=>{
            this.selectizeInit();
            if(this.id) this.pullSong();
            if(this.type === 1) this.photoChange(); 
            this.watchFormattingButton();
            this.watchDescription();
            this.watchRadios();
        },50)
     }

     pullSong(){
        let headersInit = new Headers();
        headersInit.append('id', this.id);
        headersInit.append('genre', this.mainGenre);
        headersInit.append('Authorization', 'Bearer ' + this._auth.getToken()); headersInit.append('Signature', window.localStorage.getItem('signature'))
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/music/song`,{headers: headersInit}).subscribe(data => {
            if(data.json().success){
                if(this.username !=  data.json().song.submitted_by){
                    this._sysMessages.setMessages('unathorized');
  					this._router.navigateByUrl(`/music/${this.mainGenre}/${this.id}`); 
                }
                this.description = data.json().song.description ? data.json().song.description : null;
                this.marked = data.json().song.marked ? data.json().song.marked : null;
                if(this.description){$('.description-box').addClass('valid');} 
                if(this.title){$('#song-title').addClass('active'); $('#title').addClass('valid');}
                if(this.artist){$('#song-artist').addClass('active'); $('#artist').addClass('valid');}

                if(this.type === 0 && this.description){this.uploadLink.patchValue({description:this.description})}
                else if(this.type === 1 && this.description){this.uploadSong.patchValue({description:this.description})}
                if(this.type === 0 && data.json().song.marked){ $('#output-container-link').css({'display':'block'}); $('#post-output-text').append(data.json().song.marked);}
                else if (this.type === 1 && data.json().song.marked){ $('#output-container-upload').css({'display':'block'}); $('#post-output-upload').append(data.json().song.marked);}
                this.mainGenre = data.json().song.main_genre ? data.json().song.main_genre : null;
                this.originalGenre = this.mainGenre;
                this.genres = data.json().song.genres ? data.json().song.genres : null;
                let download_type = data.json().song.download;
                
                
                if(this.type===1 && download_type != null){
                    this.uploadSong.patchValue({'download_type':download_type})
                    if(download_type ===0){
                        setTimeout(()=>{
                            $("#download-no").prop('checked',true)
                            $("#download_text").prop('disabled','disabled');
                            $("#download_link").prop('disabled','disabled');
                        },20)

                    }   
                    else if(download_type === 1){
                        setTimeout(()=>{
                            $("#download-yes").prop('checked',true)
                        },20)
                    }
                    else{
                        setTimeout(()=>{
                            $("#download-yes-url").prop('checked',true)
                            if(data.json().song.download_text){
                                this.uploadSong.patchValue({'download_text':data.json().song.download_text})
                                $("#download_text").prop('disabled',false);
                                $("#download_text").addClass("valid");
                                $("#download_text_label").addClass("active");
                            }
                            if(data.json().song.download_url){
                                this.uploadSong.patchValue({'download_link':data.json().song.download_url})
                                $("#download_link").prop('disabled',false);
                                $("#download_link").addClass("valid");
                                $("#download_link_label").addClass("active");
                            }
                        },20)
                    }
                } 

                let item = this.mainGenre.slice(0,1).toUpperCase() + this.mainGenre.slice(1);
                this.selectize[0].selectize.createItem(item);
                if(this.type === 0 && this.genres){this.uploadLink.patchValue({genre:this.genres})}
                else if(this.type === 1 && this.genres){this.uploadSong.patchValue({genre:this.genres})}

                this.picture = data.json().song.upload_artwork_url ? data.json().song.upload_artwork_url : null;
                if(this.type === 1 && this.picture){this.uploadSong.patchValue({picture:this.picture})}

                this.link = data.json().song.original_link ? data.json().song.original_link : null;
                if(this.type === 0 && this.link){
                    this.uploadLink.patchValue({link:this.link})
                    $("#link").addClass('valid').prop('disabled','disabled');
                    $("#song-link").addClass("active");

                }

                this.songId = data.json().song.uuid ? data.json().song.uuid : null;
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
  watchRadios(){
    $('#download_text').prop('disabled','disabled');
    $('#download_link').prop('disabled','disabled');
    $('.has-download').click(function() {
        if($('#download-yes-url').is(':checked')) { 
          $('#download_text').prop('disabled',false); $('#download_link').prop('disabled',false)
         }
        else {
          $('#download_text').prop('disabled','disabled').val('').removeClass('valid'); $('#download_text_label').removeClass('active');
          $('#download_link').prop('disabled','disabled').val('').removeClass('valid'); $('#download_link_label').removeClass('active'); 
        }
    });
  }
  watchFormattingButton(){
    let component = this;
    $('#formatting-guide-link, #formatting-guide-upload').on('click',function(e){
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
        if(!$('#add-formatting-guide-upload').data('open')){
          $('#add-formatting-guide-upload').append(component.addGuide(type));
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

    cancelEdit(){
        this._router.navigateByUrl(`/music/${this.originalGenre}/${this.id}`);
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
                    url: `${self._backend.SERVER_URL}/api/v1/categories/music/search/`,
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
            self.genres = this.getValue().split(",").map(function(category){ return category.toString().toLowerCase()});
            },
            onChange(value){
            self.mainGenre = value.split(",",1).toString().toLowerCase();
            }
        });
    }
    submitEdit(values,type){
        this.insubmit = true;
        let fadein = setTimeout(()=>{
            $(`#submit-music-edit-${type}`).fadeIn().css("display","inline-block");
        },750)
        let title = values.title? values.title : this.title;
        let artist = values.artist ? values.artist : this.artist;
        let description = values.description ? values.description : this.description;
        let markedBody = description ? marked(description) : null;
        var creds = {"download":values.download_type, "download_text": values.download_text, "download_url": values.download_link, "title":title, "artist" : artist, "genres" : this.genres, "edit":true, "main_genre": this.mainGenre, "description" : description, "marked":markedBody, "song": this.songId}
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.updateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/update`, creds, {headers: headers}).subscribe(data => {
            clearTimeout(failedRequest);
            if(data.json().success){
                this.submitted = true;
                if(this.has_uploaded) Materialize.toast("Please allow a minute for the photo to upload/change", 3500, 'rounded');
                this._sysMessages.setMessages('editSong');
                this._router.navigateByUrl(`/music/${this.mainGenre}/${data.json().url}`);
            } else if (data.json().error) {
                this.unsupported = true;
            } else if(data.json().status === 401){
                this._sysMessages.setMessages('unathorized');
                this._router.navigateByUrl(`/music/${this.mainGenre}/${data.json().url}`);
            } else if(data.json().title){
                Materialize.toast("Original title has been altered too much", 3000, 'rounded-failure');
                $('.song-title').removeClass('valid').addClass('invalid');
            } else if (data.json().time){
                Materialize.toast("Title can't be changed after five minutes", 3000, 'rounded-failure');
                $('.song-title').removeClass('valid').addClass('invalid');
            } else if(data.json().change){
                Materialize.toast("Title can only be editted once", 3000, 'rounded-failure');
                $('.song-title').removeClass('valid').addClass('invalid');
            } else if(data.json().link){
                Materialize.toast("Link can't be edited after submission", 3000, 'rounded-failure');
                $('.song-title').removeClass('valid').addClass('invalid');
            } else {
                this.error = true;
            }
            if(fadein) clearTimeout(fadein);
            $(`#submit-music-edit`).css({'display':'none'});
            $('.waves-ripple').remove();
            this.insubmit = false;
        });
       let failedRequest = setTimeout(()=>{
           $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            $('#submit-music-edit').css({'display':'none'});
       },15000);
    }
    photoUpload(){
       var self = this;
       $(`#photo-upload`).fileupload({
            url: `${self._backend.SERVER_URL}/api/v1/music/update`,
            formData: {'authorization': `Bearer ${self._auth.getToken()}`, 'photo_upload':1, 'song': self.songId},
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
