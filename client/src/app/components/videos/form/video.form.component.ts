import { Component, OnInit } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import 'angular2-materialize'; 
import {SystemMessagesComponent} from '../../system/messages/messages.component';
import {AuthService} from '../../../services/auth.service';
import {ModalComponent} from '../../modal/modal.component';
// declare let ActionCable:any;
declare var $;
declare var marked;
declare var Materialize;

@Component({
  selector: 'video_form',
  templateUrl: 'video.form.component.html',
  providers: [FormBuilder,AuthService,ModalComponent,SystemMessagesComponent]
})

export class VideoFormComponent implements OnInit {
  videoSubscription:any;
  deleteSubscription:any;
  updateSubscription:any;
  uploadLink: FormGroup;
	uploadVideo: FormGroup;
	error:boolean=false;
	powers = ['feel-good','funny','ohshit'];
  categories:any;
  mainCategory:string;
  unsupported:boolean=false;
  upload:boolean=false;
  clicked:boolean=false;
  videoId:number;
  photoClicked:boolean;
  tags:any;
  imageFile:any;
  image:any;
  fileName:string;
  videoDelete:boolean=false;
  submitted:boolean=false;
  video:any;
  amz_key:any;
  policy:any;
  signature:any;
  store_dir:any;
  upload_time:any;
  upload_date:any;
  key:any;
  uploadComplete:boolean=false;
  insubmit:boolean=false;
	constructor(private _http: Http, private _backend: BackendService, private _auth: AuthService, private _fb: FormBuilder, private _router: Router, private _modal: ModalComponent, private _sysMessages: SystemMessagesComponent){};
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
    var self = this;
    $(`#video-upload`).click(()=>{
      if(this.clicked){
        $("#video-upload").val(null);
      }
      this.clicked = true;
      var fileSelector = $("#video-upload").change(()=>{
        var file = fileSelector[0].files[0];
        if(file.size < 2000000000){
          this.video = file;
          this.fileName = file.name;
          this.upload = true;
          this.animateForm();
          try{
            setTimeout(()=>{
              var fileURL = URL.createObjectURL(file)
              if($('video').get(0)) $('video').get(0).src = fileURL;
              setTimeout(()=>{
                this.getVideoImage();
              },25)
            },400)
          } catch(e){
            console.error(e);
          }
        } else {
          $("#video-upload").val(null);
          Materialize.toast("Max upload size is 2GB", 3000, 'rounded-success');
        }
     });
    });
    $(`#video-upload`).fileupload({
        url: `https://${self._backend.BUCKET}.s3.amazonaws.com`,
        dataType: 'json',
        // forceIframeTransport: true,
        autoUpload: true,
        // maxChunkSize: 10000000,
        add: function (e, data) {
          var data_add = data;
          $.ajax({
            url: `${self._backend.SERVER_URL}/api/v1/videos/new`,
            data: {'authorization': `Bearer ${self._auth.getToken()}`, post_type: 1, file_name:this.file_name},
            type: 'POST',
            success: function(data) {
              
              if(data.success){
                
                self.amz_key = data.key;
                self.policy = data.policy;
                self.signature = data.signature;
                self.store_dir = data.store;
                self.upload_time = data.time;
                self.upload_date = data.time_date;
                self.key = `${self.store_dir}/${self.fileName}`;
                self.videoId = data.video_id;
                data_add.submit();
               }
              else if(data.status == 415){self.cancelUpload(); self._sysMessages.setMessages('unsupported');}
              else if(data.status === 401){self.cancelUpload(); self._modal.setModal('videos','form');}
            }
          });
        },
        submit: function (e, data) {
          data.formData = {key:`${self.store_dir}/${self.fileName}`, "Policy":self.policy,"X-Amz-Signature":self.signature,"X-Amz-Credential":`${self.amz_key}/${self.upload_date}/us-west-2/s3/aws4_request`,"X-Amz-Algorithm":"AWS4-HMAC-SHA256", "X-Amz-Date":self.upload_time};
        },
        progress: function (e, data) {
         var progress = Math.floor(((parseInt(data.loaded)*0.9)  / (parseInt(data.total))) * 100);
          $('#inner-progress').css({'transform':`translateX(${progress}%)`});
          $('#progress-text').text(progress);
        },
        done: function (e, data) {
            // $.each(data.result.files, function (index, file) {
            //     $('<p/>').text(file.name).appendTo(document.body);
            // });
            $('#inner-progress').css({'transform':`translateX(100%)`});
            $('#progress-text').text(100);
            if(e) 
            self.uploadComplete = true;
        }
    });
      this.selectizeInit();
      this.watchFormattingButton();
      this.watchDescription();
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
                url: `${self._backend.SERVER_URL}/api/v1/categories/videos/search/`,
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
              $('#thumbnail-img-src')
                .attr('src', fr.result)
                .width(200)
                .height(140);
                
                
              $('#canvas').css({'display':'none'});
              $('#thumbnail').css({'display':'block'});
            }
            fr.readAsDataURL(file);
          } else { //no FileReader support

          }
        });  
      });
  }
  animateForm(){
    // $('.video-upload-label').animate({'margin-top':"toggle"},2000);
    // $('.video-upload-container').animate({'border':'toggle'},2000);
    $('.video-upload-container').removeClass('active');
    $('.video-upload-label').removeClass('active').addClass('form');
    setTimeout(()=>{
      this.selectizeInit();
      this.photoChange();
      this.watchFormattingButton();
      this.watchDescription();
      $('.video-upload-form').css({'display':'block'});
      setTimeout(()=>{
        if(this.fileName){ $('#video-title-upload').addClass('active'); $('#title-upload').addClass('valid'); this.uploadVideo.patchValue({title:this.fileName})}
      },250);  
    },50);
  }

  cancelUpload(){
    $('.video-upload-container').addClass('active');
    $('.video-upload-label').addClass('active').removeClass('form');
    setTimeout(()=>{
      $('.video-upload-form').css({'display':'none'});
    },50);
    this.upload = false;
    if(this.videoId) this.deleteVideo();
  }

  deleteVideo(){
    var headers = new Headers();
    var creds = {"video": this.videoId}
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
    this.deleteSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/delete`, creds, {headers: headers}).subscribe(data => {
      if(data.json().success){
        this.videoDelete = true;
        if(this.deleteSubscription) this.deleteSubscription.unsubscribe();
      }
    });
  }

  getVideoImage(){
    let canvas = $('#canvas').get(0);
    let video = $('video').get(0);
    if(video){
      setTimeout(()=>{
        let duration = $('video').get(0).duration
        if(duration) $('video').get(0).currentTime = (duration/3)
      },50)
      setTimeout(()=>{
        let heightCheck = video.videoHeight > video.videoWidth ? true : false;
        let multiple = heightCheck ? video.videoWidth / video.videoHeight : video.videoHeight / video.videoWidth;
        let height = heightCheck && multiple ? 200 : 200 * multiple; 
        let width = heightCheck && multiple ? 200 * multiple : 200;

        
        
        
        
        
        canvas.getContext('2d').drawImage(video,0,0,width,height);//this need tinkering
        // canvas.toDataURL("image/png");
        video.pause();
        // this doesn't really solve why it doesn't work, but it should end up working eventually.
         if(canvas.toDataURL() == $("#blank-canvas").get(0).toDataURL()) this.getVideoImage()
      },200)
   }
  }

  updateVideo(values){
    let fadein = setTimeout(()=>{
      $('#submit-video-upload').fadeIn().css("display","inline-block");
    },750)
    $('#submitting-upload-video').css({'display':'initial'});
    let title = values.title? values.title : this.fileName;
    let markedBody = values.description ? marked(values.description) : null;
    var creds = {"title":title, "categories" : this.categories, "main_category": this.mainCategory, "description" : values.description, "marked": markedBody, "artwork": this.imageFile, "video": this.videoId, "key": this.key}
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
    this.updateSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/update`, creds, {headers: headers}).subscribe(data => {
      clearTimeout(failedRequest);
      if(data.json().success){
        this.submitted = true;
        this._sysMessages.setMessages('submittedVideo');
        this._router.navigateByUrl(`/videos/${this.mainCategory}/${data.json().url}`);
      } else if (data.json().error) {
        this.unsupported = true;
      } else if(data.json().status === 401){
        this._modal.setModal('videos','form');
      } else {
        this.error = true;
      }
      if(fadein) clearTimeout(fadein);
      $('#submit-video-upload').css({'display':'none'});
      $('.waves-ripple').remove();
      this.insubmit = false;
    });
    let failedRequest = setTimeout(()=>{
      $('.waves-ripple').remove();
      this.insubmit = false;
      Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
      $('#submit-video-video').css({'display':'none'});
    },15000);
  }

	submitVideo(values){
    this.insubmit = true;
		var headers = new Headers();
    var post_type = this.upload ? 1 : 0;
    var creds;
    if(this.upload && !this.videoId){
      creds = {"title":values.title, "categories" : this.categories, "main_category": this.mainCategory, "link": values.link, "description" : values.description, "artwork": this.imageFile, "video": this.video, "post_type": post_type}
    } else if (this.videoId){
      this.updateVideo(values);
      return true;
    } else {
      creds = {"title": values.title, "categories" : this.categories, "main_category": this.mainCategory, "link" : values.link, "description" : values.description, "post_type": post_type}
    }
    let fadedIn;
    let fadeInTimeout = setTimeout(()=>{
      $('#submit-video-link').fadeIn();
      fadedIn = true;
    },750)
    $('#submitting-link-video').css({'display':'initial'});
  		headers.append('Content-Type', 'application/json');
  		headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      this.videoSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/videos/new`, creds, {headers: headers}).subscribe(data => {
          if(fadeInTimeout) clearTimeout(fadeInTimeout)
          clearTimeout(failedRequest);
  				if(data.json().success){
            this._sysMessages.setMessages('submittedVideo');
  					this._router.navigateByUrl(`/videos/${this.mainCategory}/${data.json().url}`);
  				} else if (data.json().error) {
            this.unsupported = true;
  				} else if(data.json().status === 401){
              this._modal.setModal('videos','form');
          } else {
            this.error = true;
          }
          this.insubmit = false;
  		});
      let failedRequest = setTimeout(()=>{
            $('.waves-ripple').remove();
            this.insubmit = false;
            Materialize.toast("Something failed on our end. Please try again.", 3500, 'rounded-failure');
            if(fadedIn) $('#submit-video-link').css({'display':'none'});
      },15000);
	}
  ngOnDestroy(){
    if(this.videoId && !this.videoDelete && !this.submitted) this.deleteVideo();
    if(this.videoSubscription) this.videoSubscription.unsubscribe();
    if(this.updateSubscription) this.updateSubscription.unsubscribe();
  }
}
