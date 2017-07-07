import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {NotificationsService} from '../../services/notifications.service';
import {AuthService} from '../../services/auth.service';
import {BackendService} from '../../services/backend.service';
import 'angular2-materialize';
import { Router } from '@angular/router';
declare var $;

@Component({
  selector: 'notifications',
  templateUrl: 'notifications.component.html',
})

export class NotificationsComponent implements OnInit {
    subscription:any;
    scrollSubscription:any;
    loaded:boolean=false;
    notifications:any=[];
    offset:number=10;
    currentPage:number=0;
    pages:number=0;
    total:number=0;
    polling:boolean=false;
    unread:number=0;
	constructor(private notificationService: NotificationsService, private _backend: BackendService, private _auth: AuthService, private _http: Http, private _router:Router){
        this.subscription = notificationService.notificationsChange.subscribe((value) => { 
            
            this.loaded = true;
            this.notifications = value[0]; 
            this.total = this.notifications[0] ? this.notifications[0].total : 0;
            this.unread = this.notifications[0] ? this.notifications[0].count : 0;
            this.pages = this.total ? Math.ceil(this.total / 10) - 1 : 0;
            this.currentPage = 0;
            this.offset = 10;
            if(value[1]===true){
                this.notificationsClose();
            }
            // setTimeout(()=>{
            //     let options = {minMagnification: 10,disableZoom:'false'}; // This would be your options object.
            //     // $('#myImage').CloudZoom(options);                  // jQuery way.
            //     this.myInstance = new CloudZoom($('#main-lightbox-photo'),options);
            //     this.checkMainPhoto();
            // },25);
        });
    };
	ngOnInit(){
        this.infiniteScroll();
    };
    infiniteScroll(){
      let component = this;
      let $outer = $("#notifications-outer-container")
      if($outer.get(0).scrollHeight - $outer.height() < 50 && this.currentPage < this.pages) {
          setTimeout(()=>{
            this.getNotifications();
          },300)
      }
      $outer.scroll(()=>{
        if(($outer.get(0).scrollHeight - $outer.height()) - $outer.scrollTop() < 50 && this.currentPage < this.pages) this.getNotifications();
	  }); 
    }
    getNotifications(){
        if(!this.polling){
            $('#loading-spinner-notifications').css({'display':'block'});
            this.polling = true;
            var headers = new Headers();
            let currentUser = localStorage.getItem("username")
            headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
            headers.append('offset', this.offset.toString());
            this.scrollSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${currentUser}/notifications`, {headers: headers}).subscribe(data => {
                
                if(data.json().success){
                    this.notifications = this.notifications.concat(data.json().notifications)
                    $('#loading-spinner-notifications').css({'display':'none'});
                    this.currentPage = data.json().page;
                    this.offset = data.json().offset + 10;
                } else {
                    
                }
                this.polling = false;
            });
        }
    }
    exitLink(type,category,subcategory,url,comment){
        
        if(type === 'user'){
            // category is the user in this case.
            this._router.navigateByUrl(`/user/${category}`)
        } else if (type === 'ssn'){
            this._router.navigateByUrl(`/user/${window.localStorage.getItem("username")}/settings`)
        }
        else if(window.location.pathname.split('/').length === 4){
            
            if(window.location.pathname.split('/')[1] === '${type}'){ this._router.navigate(['/switch', type, category, url,comment], { skipLocationChange: true });}
            else this._router.navigateByUrl(`/${type}/${category}${subcategory ? '/' + subcategory : ''}/${url}${comment ? '/' + comment : ''}`);
        } else if(window.location.pathname.split('/').length === 5) {
            
            if(window.location.pathname.split('/')[1] === '${type}'){ this._router.navigate(['/switch', type, category, subcategory, url,comment], { skipLocationChange: true });}
            else this._router.navigateByUrl(`/${type}/${category}${subcategory ? '/' + subcategory : ''}/${url}${comment ? '/' + comment : ''}`);
        } else {
            
            if(!subcategory) this._router.navigateByUrl(`/${type}/${category}/${url}${comment ? '/' + comment : ''}`);
            else this._router.navigateByUrl(`/${type}/${category}/${subcategory}/${url}${comment ? '/' + comment: ''}`);
        }
        this.notificationsClose();
    }
    readComments(){
        for(let i =0; i< this.unread;i++){
            if(this.notifications[i]) this.notifications[i].read=true;
            if(this.notifications[i]) this.notifications[i].count=0;
        }
        this.unread = 0;
        
        
        this.notificationService.change(this.notifications)
    }
    public notificationsClose(){
        if(this.unread) this.readComments();
        $('body').css({'width':'initial', 'overflow':'initial'});
        // may want to change from fades.
        $('#lightbox-notifications').removeClass('active');
        setTimeout(()=>{
            $('#lightbox-notifications').css({'display':'none'});
        },1250)
    }
    public setBox(){ 
        $('#lightbox-notifications').css({'display':'block'});
        setTimeout(()=>{
            $('#lightbox-notifications').addClass('active');
        },10)
        // $('body').css({'width':window.innerWidth, 'overflow':'hidden'});
        // $('body').append(`<div id='dark-overlay' class='dark-overlay' style='z-index:1002;display:block;opacity:0.5;'></div>`)
    }
    // this may not matter, but if a reload triggers all the current components to destroy, then this is very important.
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.scrollSubscription) this.scrollSubscription.unsubscribe();
    }
}
