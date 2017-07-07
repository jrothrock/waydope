import { Component, OnInit, OnDestroy, AfterViewInit,ChangeDetectionStrategy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {LightBoxComponent} from '../lightbox/lightbox.component';
import {ModalComponent} from '../modal/modal.component';
import {AuthService} from '../../services/auth.service';
import {BackendService} from '../../services/backend.service';
declare var $;
declare var _setMeta;
var scrollData = {
  scroll:0,
  getScroll(){
    return this.scroll;
  },
  setScroll(scroll){
    this.scroll = scroll;
  },
  clearScroll(){
    this.scroll = 0;
  }
}

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  providers: [ModalComponent,BackendService],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  registered:boolean = false;
  loggedout:boolean = false;
  signedin:boolean = false;
  unathorized:boolean = false;
  contact:boolean = false;
  partner:boolean = false;
  music:any=[];
  error:boolean=false;
  name:string;
  news:any=[];
  videos:any=[];
  apparel:any=[];
  technology:any=[];
  subscription:any;
  
  constructor(private _http: Http, private _backend: BackendService, private _auth: AuthService, private _modal: ModalComponent) {}

  ngOnInit() {
    _setMeta.setHome();

    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
    this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/home`, {headers: headers}).subscribe(data => {
        
        this.music = data.json().music;
        this.news = data.json().news;
        this.videos = data.json().videos;
        this.apparel = data.json().apparel;
        this.technology = data.json().technology;
    },error=>{
        this.error = true;
    });
    
  }

  getScroll(){
    if(scrollData.getScroll() != 0){
      
      window.scrollTo(0,parseInt(scrollData.getScroll()));
      // $('html, body').scrollTo(0,scrollData.getScroll());
      // window.scrollY = parseInt(scrollData.getScroll());
      // window.pageYOffset = parseInt(scrollData.getScroll());
      scrollData.clearScroll();
    } else {
      window.scrollTo(0,0);
    }
  }

  public setScroll(scroll){
    scrollData.setScroll(scroll);
  }

  // ngAfterViewInit(){
  //   this.getScroll();
  // }

   ngOnDestroy() {
    // prevent memory leak when component destroyed
    if(this.subscription) this.subscription.unsubscribe();
    this.music = [];
    this.news = [];
    this.videos = [];
    
  }
}
