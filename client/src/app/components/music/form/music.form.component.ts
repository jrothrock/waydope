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
import {MusicAllComponent} from '../all/music.all.component';
import {BackendService} from '../../../services/backend.service';
import {ModalComponent} from '../../modal/modal.component';
import {SystemMessagesComponent} from '../../system/messages/messages.component';

declare var jsmediatags;

// declare let ActionCable:any;
declare var $;
declare var marked;
declare var Materialize;

@Component({
  selector: 'music_form',
  templateUrl: 'music.form.component.html',
  providers: [FormBuilder,AuthService,MusicAllComponent,ModalComponent]
})

export class MusicFormComponent implements OnInit {
	uploadLink: FormGroup;
  uploadSong: FormGroup;
  subscription:any;
  editSubscription:any;
  updateSubscription:any;
  deleteSubscription:any;
	error:boolean=false;
	powers = ['Electronic','Hip-hop','House','Trap'];
  unsupported:boolean=false;
  mainGenre:string;
  genres:any;
  title:string;
  artist:string;
  edit:boolean=false;
  clicked:boolean=false;
  tags:any=[];
  upload:boolean=false;
  song:any={};
  image:any;
  imageFile:any;
  photoClicked:boolean=false;
  changePhoto:boolean=false;
  songId:number;
  songDelete:boolean=false;
  submitted:boolean=false;
  key:any;
  policy:any;
  signature:any;
  file_name:string;
  store_dir:string;
  upload_time:any;
  time_date:any;
  upload_date:any;
  amz_key:string;
  uploadComplete:boolean=false;
  insubmit:boolean=false;
  indeletion:boolean=false;
  linkTitle:string;
  linkArtist:string;
  linkLink:string;
  url:string;
  og_category:string;
	constructor(private _http: Http, private _backend:BackendService, private _auth: AuthService, private _fb: FormBuilder, private _router: Router, private _sysMessages: SystemMessagesComponent, private _modal: ModalComponent){};
	ngOnInit(){
    this.uploadLink = this._fb.group({
	      'title': [null],
	      'artist': [null],
	      'genre': [null],
	      'description': [null],
	      'link': [null]
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
      })
      $(`#song-upload`).click(()=>{
      if(this.clicked){
        $("#song-upload").val(null);
        this.file_name = null;
      }
      this.clicked = true;
      var fileSelector = $("#song-upload").change(()=>{
        var file = fileSelector[0].files[0];
        if(file.size < 2000000000){
          this.file_name = file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'_').replace(/(^_|_$)/g,'');
          
          this.upload = true;
          this.animateForm();
          setTimeout(()=>{
            this.watchInputs();
            this.watchRadios();
            this.getTags(file);
          },50)
        } else {
          $("#song-upload").val(null);
          Materialize.toast("Make file size is 2GB", 3000, 'rounded-failure');
        }
     });
    });
    var self=this;
    $(`#song-upload`).fileupload({
        url: `https://${self._backend.BUCKET}.s3.amazonaws.com`,
        dataType: 'multipart/form-data',
        add: function (e, data) {
          var data_add = data;
          $.ajax({
            url: `${self._backend.SERVER_URL}/api/v1/music`,
            data: {'authorization': `Bearer ${self._auth.getToken()}`, post_type: 1, file_name:data.files[0].name},
            type: 'POST',
            success: function(data) {
                self.amz_key = data.key;
                self.policy = data.policy;
                self.signature = data.signature;
                self.store_dir = data.store;
                self.upload_time = data.time;
                self.og_category = data.genre;
                self.upload_date = data.time_date;
                self.url = data.url;
                self.key = `${self.store_dir}/${self.file_name}`;
                self.songId = data.song_id;
                data_add.submit();
            },
            error:function(error){
               if(error.status == 415){self.cancelUpload(); self._sysMessages.setMessages('unsupported');}
               else if(error.status === 401){self.cancelUpload(); self._modal.setModal('music','form'); }
            }
          });
        },
        submit: function (e, data) {
          data.formData = {key:`${self.store_dir}/${self.file_name}`, "Policy":self.policy,"X-Amz-Signature":self.signature,"X-Amz-Credential":`${self.amz_key}/${self.upload_date}/us-west-2/s3/aws4_request`,"X-Amz-Algorithm":"AWS4-HMAC-SHA256", "X-Amz-Date":self.upload_time};
        },
        progress: function (e, data) {
          var progress = Math.floor(((parseInt(data.loaded)*0.9)  / (parseInt(data.total))) * 100);
          $('#inner-progress').css({'transform':`translateX(${progress}%)`});
          $('#progress-text').text(progress);
        },
        done: function (e, data) {
            $('#inner-progress').css({'transform':`translateX(100%)`});
            $('#progress-text').text(100);
            if(e) 
            self.uploadComplete = true;
        }
    });

    this.selectizeInit();
    this.watchLinkInput();
    this.watchDescription();
    this.watchFormattingButton();
	};

  selectizeInit(){
        var self=this;
        $('.selectize-select').selectize({
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

  animateForm(){
    // $('.song-upload-label').animate({'margin-top':"toggle"},2000);
    // $('.song-upload-container').animate({'border':'toggle'},2000);
    $('.song-upload-container').removeClass('active');
    $('.song-upload-label').removeClass('active').addClass('form');
    setTimeout(()=>{
      this.selectizeInit();
      this.photoChange();
      this.watchDescription();
      this.watchFormattingButton();
      $('.song-upload-form').css({'display':'block'});
    },50);
  }

  photoUpload(){
       var self = this;
       $(`#photo-upload`).fileupload({
        url: `${self._backend.SERVER_URL}/api/v1/music/${self.og_category}/${self.url}`,
        formData: {'authorization': `Bearer ${self._auth.getToken()}`, 'photo_upload':1, 'song': self.songId},
        dataType: 'json',
        type: "PUT",
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
  watchLinkInput(){
    $('#title').change(()=>{
      this.linkTitle = $('#title').val();
    })
    $('#artist').change(()=>{
      this.linkArtist = $('#artist').val();
    })
    $('#link-link').change(()=>{
      this.linkLink = $('#link-link').val();
    })
  }
  watchInputs(){
    $('#title-upload').change(()=>{
      this.title = $('#title-upload').val();
    })
    $('#artist-upload').change(()=>{
      this.artist = $('#artist-upload').val();
    })
  }

  getTags(file){
    var self = this;
    this.song = file;
    jsmediatags.read(file, {
      onSuccess(tag) {
      self.tags = tag.tags
      self.imageFile = self.tags.picture;
      self.image = self.tags.picture && self.tags.picture.data ? `data:image/${self.tags.picture.format};base64,${self.convertData(self.tags.picture.data)}` : '';
      if(self.tags && self.tags.title){ $('#song-title-upload').addClass('active'); $('#title-upload').addClass('valid'); self.uploadSong.patchValue({title:self.tags.title}); self.title = self.tags.title} 
      if(self.tags && self.tags.artist){ $('#song-artist-upload').addClass('active'); $('#artist-upload').addClass('valid'); self.uploadSong.patchValue({artist:self.tags.artist}); self.artist = self.tags.artist; }
      }
    });
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

  cancelUpload(){
    $('.song-upload-container').addClass('active');
    $('.song-upload-label').addClass('active').removeClass('form');
    setTimeout(()=>{
      $('.song-upload-form').css({'display':'none'});
    },50);
    this.upload = false;
    this.mainGenre = null;
    this.deleteSong();
  }

	submitMusic(values){
    this.insubmit = true;
    
    
		var headers = new Headers();
    var post_type = this.upload ? 1 : 0;
		var creds;
    let markedBody = values.description ? marked(values.description) : null;
    if(this.upload && !this.songId){
      creds = {"title":values.title, "artist" : values.artist, "genres" : this.genres, "main_genre": this.mainGenre, "link": values.link, "description" : values.description, "marked": markedBody, "artwork": this.imageFile, "song": this.song, "post_type": post_type}
    } else if (this.songId){
      this.updateMusic(values);
      return true;
    } else {
      creds = {"title": values.title, "artist" : values.artist, "genres" : this.genres, "main_genre": this.mainGenre, "link" : values.link, "description" : values.description, "marked": markedBody, 'post_type':post_type}
    }
    let fadein = setTimeout(()=>{
      $('#submit-music-link').fadeIn().css("display","inline-block");
    },750)
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
  		this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/music/new`, creds, {headers: headers}).subscribe(data => {
          clearTimeout(failedRequest);
          this.submitted = true;
  				this._sysMessages.setMessages('submittedMusic');
  				this._router.navigateByUrl(`/music/${this.mainGenre}/${data.json().url}`);
          if(fadein) clearTimeout(fadein);
          $('#submit-music-link').css({'display':'none'});
          $('.waves-ripple').remove();
          this.insubmit = false;
  		},error=>{
          if (error.json().error) {
  		      this.unsupported = true;
  				} else if(error.status === 401){
              this._modal.setModal();
          } else {
            this.error = true;
          }
      });
      let failedRequest = setTimeout(()=>{
        $('.waves-ripple').remove();
        this.insubmit = false;
        Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
        $('#submit-music-link').css({'display':'none'});
      },15000);
	}

  updateMusic(values){
    let fadein = setTimeout(()=>{
      $('#submit-music-upload').fadeIn();
    },750)
    let title = values.title? values.title : this.tags.title;
    let artist = values.artist ? values.artist : this.tags.artist;
    let markedBody = values.description ? marked(values.description) : null;
    var creds = {"title":title, "artist" : artist, "genres" : this.genres, "main_genre": this.mainGenre, "description" : values.description, "marked": markedBody, "download":values.download_type, "download_text": values.download_text, "download_url": values.download_link, "song": this.songId, "key": this.key};
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
    this.updateSubscription = this._http.put(`${this._backend.SERVER_URL}/api/v1/music/${this.og_category}/${this.url}`, creds, {headers: headers}).subscribe(data => {
      clearTimeout(failedRequest)
      this.submitted = true;
      this._sysMessages.setMessages('submittedSong');
      this._router.navigateByUrl(`/music/${this.mainGenre}/${data.json().url}`);
      if(fadein) clearTimeout(fadein);
      $('#submit-music-upload').css({'display':'none'});
      $('.waves-ripple').remove();
      this.insubmit = false;
    },error=>{
        if (error.json().error) {
          this.unsupported = true;
        } else if(error.status === 401){
          this._modal.setModal();
        } else {
          this.error = true;
        }
    });
    let failedRequest = setTimeout(()=>{
        $('.waves-ripple').remove();
        this.insubmit = false;
        Materialize.toast("Something failed on our end. Please try again.", 3000, 'rounded-failure');
        $('#submit-music-upload').css({'display':'none'});
    },15000);
  }

  deleteSong(){
    if(!this.indeletion){
      this.indeletion = true;
      var headers = new Headers();
      var creds = {"song": this.songId, "upload":true}
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      this.deleteSubscription = this._http.delete(`${this._backend.SERVER_URL}/api/v1/music/${this.og_category}/${this.url}`, {headers: headers}).subscribe(data => {
        clearTimeout(deleteRequest);
        this.songDelete = true;
        if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
      },error=>{

      });
      let deleteRequest = setTimeout(()=>{
          Materialize.toast("Failed to delete song on our end. Please try again.", 3500, 'rounded-failure');
      },15000);
    }
  }

  convertData(data){ //turn array buffer into base64.
    var binary = '';
    var bytes = new Uint8Array( data );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    this.uploadSong.patchValue({picture:true});
    return window.btoa( binary );
  }

  private hasValue(){
    if(!this.mainGenre) return null;
    return true;
  }

  ngOnDestroy(){
    if(this.songId && !this.songDelete && !this.submitted) this.deleteSong();
    if(this.subscription) this.subscription.unsubscribe();
    if(this.updateSubscription) this.updateSubscription.unsubscribe();
    if(this.editSubscription) this.editSubscription.unsubscribe();
  }

}
