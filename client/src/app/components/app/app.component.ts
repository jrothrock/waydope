import { Component, OnInit, OnDestroy, ViewChild ,Compiler, ComponentRef, ComponentFactory, ViewChildren, QueryList, ComponentFactoryResolver, ViewContainerRef, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {AuthService} from '../../services/auth.service';
import {PhotosService} from '../../services/photos.service';
import {NotificationsService} from '../../services/notifications.service';
import {CartService} from '../../services/cart.service';
import {HomeComponent} from '../home/home.component';
import { Router } from '@angular/router';
import {AdminGuard} from '../../services/admin.guard.service';
import {SellerGuard} from '../../services/seller.guard.service'
import {SystemMessagesComponent} from '../system/messages/messages.component';
import {BoardsMenuComponent} from '../menu/boards/boards.menu.component';
import {MusicMenuComponent} from '../menu/music/music.menu.component';
import {VideosMenuComponent} from '../menu/videos/videos.menu.component';
import {ApparelMenuComponent} from '../menu/apparel/apparel.menu.component';
import {TechnologyMenuComponent} from '../menu/technology/technology.menu.component';
import {LightBoxComponent} from '../lightbox/lightbox.component';
import {ProfileMenuComponent} from '../menu/profile/profile.menu.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {NotificationsComponent} from '../notifications/notifications.component';
import {CartModalComponent} from '../cart/modal/cart.modal.component';
import {ModalComponent} from '../modal/modal.component';
import {ModalUpdateComponent} from '../modal/update/modal.update.component';
import {MessagesModalComponent} from '../messages/modal/messages.modal.component';
import {MessagesService} from '../../services/messages.service';
import {BackendService} from '../../services/backend.service';
import { environment } from '../../../environments/environment';
import {VoteService} from '../../services/vote.service';
import {VideoService} from '../../services/video.service';

declare var backstretch;
declare var $;
declare var Materialize;
declare var CloudZoom;

@Component({
  selector: 'waydope',
  templateUrl: 'app.component.html',
  // styleUrls: ['./main.scss', './materialize_sizes_overwrites.scss'],
  providers: [FormBuilder, VoteService,LightBoxComponent, VideoService, BackendService, AuthService,SellerGuard, CartService, MessagesModalComponent, MessagesService, SystemMessagesComponent,CartModalComponent, AdminGuard,PhotosService,NotificationsService,NotificationsComponent,ModalComponent],
  entryComponents: [BoardsMenuComponent,MusicMenuComponent,VideosMenuComponent,ApparelMenuComponent,TechnologyMenuComponent,ProfileMenuComponent]
})
export class AppComponent implements OnInit {
  message:FormGroup;
  @ViewChild('boards', {read: ViewContainerRef}) viewContainerRef;
  @ViewChildren('board', {read: ViewContainerRef}) viewContainerRefs:QueryList<ViewContainerRef>;
  private boardsMenuFactory: ComponentFactory<any>;
  private musicMenuFactory: ComponentFactory<any>;
  private videosMenuFactory: ComponentFactory<any>;
  private apparelMenuFactory: ComponentFactory<any>;
  private technologyMenuFactory: ComponentFactory<any>;
  private profileMenuFactory: ComponentFactory<any>;
  prod:boolean;
  component:any;
  boardComponent:any;
  musicComponent:any;
  videosComponent:any;
  apparelComponent:any;
  technologyComponent:any;
  profileComponent:any;
  isLoggedIn:boolean=false;
  currentUser:string=null;
  extendedMenuOpen:boolean=false;
  isAdmin:any;
  isSeller:any;
  closeSubscription:any;
  openSubscription:any;
  subscription:any;
  pollSubscription:any;
  pollMessagesSubscription:any;
  messageSubscription:any;
  cartSubscription:any;
  getCartSubscription:any;
  watchCartSubscription:any;
  conversationSubscription:any;
  notificationsSubscription:any;
  messageOpenSubscription:any;
  trackLeftSubscription:any;
  cartChangeSubscription:any;
  replySubscription:any;
  routeSubscription:any;
  loginSubscription:any;
  scrollSubscription:any;
  inboxSubscription:any;
  outboxSubscription:any;
  watchSessionSubscription:any;
  getSessionSubscription:any;
  watchSessionEndSubscription:any;
  close:boolean=false;
  open:boolean=false;
  defaultNews:any=['all'];
  defaultMusic:any=['all'];
  defaultVideos:any=['all'];
  options:any=['All','Boards','Music','Videos','Apparel','Technology'];
  hovering:string;
  instance:any;
  search:any;
  cartId:number;
  notifications:any=[];
  items:any=[];
  itemsIds:any=[];
  quantities:any=[];
  order:any;
  unreadNotificationCount:number=0;
  newNotifications:boolean=false;
  newMessages:boolean=false;
  boardComponentOpened:boolean=false;
  videosComponentOpened:boolean=false;
  musicComponentOpened:boolean=false;
  apparelComponentopened:boolean=false;
  profileComponentopened:boolean=false;
  technologyComponentopened:boolean=false;
  notificationsComponentOpened:boolean=false;
  cartComponentOpened:boolean=false;
  messagesComponentOpened:boolean=false;
  width:number=window.outerWidth;
  $drop_downs:any;
  $notification_box:any;
  $messages_box:any;
  inbox:any=[];
  outbox:any=[];
  conversation:any=[];
  currentConversationId:number;
  loadingConversation:boolean=true;
  messageTabs:any=['inbox','outbox','compose'];
  zoomedPhoto:any;
  notificationsOffset:number=10;
  notificationsTotal:number=0;
  currentNotificationPage:number=0;
  notificationPages:number=0;
  pollingNotifications:boolean=false;
  otherUser:string;
  inbox_ids:any=[];
  outbox_ids:any=[];
  unreadInbox:number=0;
  totalInbox:number=0;
  totalOutbox:number=0;
  totalConversation:number=0;
  pagesInbox:number=0;
  pagesOutbox:number=0;
  pagesConversation:number=0;
  currentPageInbox:number=0;
  currentPageOutbox:number=0;
  currentPageConversation:number=0;
  inboxOffset:number=10;
  outboxOffset:number=10;
  conversationOffset:number=0;
  pollingConversation:boolean=false;
  pollingInbox:boolean=false;
  pollingOutbox:boolean=false;
  menuTiming:boolean=false;
  menuTimeout:any;
  sizes:any=[];
  colors:any=[];
  totals:any=[];
  sub_totals:any=[];
  taxes:any=[];
  shippings:any=[];
  prices:any=[];
  Object:any=Object;
  titles:any=[];
  ids:any=[];
  indexLookUp:any=[];
  item_ids:any=[];
  isHovering:boolean=false;
  hoveringType:string;
  constructor(private _auth: AuthService, private _backend: BackendService, private _cartService: CartService, private _fb:FormBuilder, private _http:Http, private _router: Router, private _modal: ModalComponent, private _notificationService: NotificationsService, private _notification: NotificationsComponent, private _systemMessages: SystemMessagesComponent, private _messages: MessagesModalComponent, private _messagesService : MessagesService, private _admin: AdminGuard, componentFactoryResolver: ComponentFactoryResolver, compiler: Compiler, private _seller : SellerGuard, private _cart: CartModalComponent, private _ngZone: NgZone) {
        this.prod = environment.production;
        this.boardsMenuFactory = componentFactoryResolver.resolveComponentFactory(BoardsMenuComponent);
        this.musicMenuFactory = componentFactoryResolver.resolveComponentFactory(MusicMenuComponent);
        this.videosMenuFactory = componentFactoryResolver.resolveComponentFactory(VideosMenuComponent);
        this.apparelMenuFactory = componentFactoryResolver.resolveComponentFactory(ApparelMenuComponent);
        this.technologyMenuFactory = componentFactoryResolver.resolveComponentFactory(TechnologyMenuComponent);
        this.profileMenuFactory = componentFactoryResolver.resolveComponentFactory(ProfileMenuComponent);
        this.search = this._fb.group({
	      'category': ['All', Validators.required],
	      'search': [null, Validators.required]
	    })
      this.routeSubscription = _router.events.subscribe(s => {
        // if(s["state"] && !this.isAdmin){
        //   let bits = s["url"].split('/')
        //   if(bits.length != 4){
        //     this._router.navigateByUrl("music/electronic/come-around");
        //   } else if(bits[1] != "music"){
        //     this._router.navigateByUrl("music/electronic/come-around");
        //   }
        // }
        if(s && s["state"]){
          if(!localStorage.getItem("signature")) this.getSessionToken();
          document.body.scrollTop = 0; // make sure we always start at the top of the page.
          //apparently, this now needs a setTimeout... one of the 10,000
          setTimeout(()=>{
            this.changeSearchCategory(window.location.pathname);
          },2)
        }
     })
     if(window.outerWidth > 1023) setTimeout(()=>{$.backstretch("/assets/images/background.jpg",{fade:700});},1500);
     else $("body").addClass('background-small');

     // this is used if the outbox changes on the modal
     // it's slightly redundant as the subscription will trigger when a change is sent from this component to the modal
     // this should be improved on later.
    this.notificationsSubscription = this._notificationService.notificationsChange.subscribe((value) => { 
      
       this.notifications = value[0]; 
    });
    this.messageSubscription = this._messagesService.messagesChange.subscribe(data=>{
      this.inbox = data[0];
      this.outbox = data[1];
    })
    this.watchSessionSubscription = this._auth.watchSession.subscribe(data=>{
      if(data) this.logout(true);
    });
    this.cartChangeSubscription = this._cartService.cartChange.subscribe(values=>{
      
       this.quantities = [];
       this.sizes =[];
       this.colors =[];
       this.titles = [];
       this.prices = [];
       this.shippings = [];
       this.totals = [];
       this.sub_totals = [];
       this.ids = [];
      
      if(this.zoomedPhoto) this.zoomedPhoto.destroy();
      if(values[0] === 'clear'){
       return;
      } else if(values[0] && values[1]){
      
        setTimeout(()=>{
          this.items = values[0] ? values[0] : this.items; 
          this.order = values[1] ? values[1] : this.order;
          if(values[1] && values[1].properties){
            let quantity = [];
            for(let i = 0; i < Object.keys(this.order["properties"]).length; i++){
              let id = Object.keys(this.order["properties"])[i]
              for(let is = 0; is < Object.keys(this.order["properties"][id]).length; is++){
                let sizes = Object.keys(this.order["properties"][id])[is]
                for(let ic = 0; ic < Object.keys(this.order["properties"][id][sizes]).length; ic++){
                  let colors = Object.keys(this.order["properties"][id][sizes])[ic]
                  if(this.order["properties"][id][sizes][colors]["quantity"]) this.quantities.push(this.order["properties"][id][sizes][colors]["quantity"])
                  if(this.order["properties"][id][sizes][colors]["price"]) this.prices.push(this.order["properties"][id][sizes][colors]["price"])
                  if(this.order["properties"][id][sizes][colors]["tax"]) this.taxes.push(this.order["properties"][id][sizes][colors]["tax"])
                  if(this.order["properties"][id][sizes][colors]["total"]) this.totals.push(this.order["properties"][id][sizes][colors]["total"])
                  if(this.order["properties"][id][sizes][colors]["shipping"]) this.shippings.push(this.order["properties"][id][sizes][colors]["shipping"])
                  if(this.order["properties"][id][sizes][colors]["sub_total"]) this.sub_totals.push(this.order["properties"][id][sizes][colors]["sub_total"])
                  this.ids.push(id);
                  this.titles.push({i:i, title:`${this.items[this.item_ids.indexOf(id)].title}, ${sizes}, ${colors}`, index:this.item_ids.indexOf(id)})
                  this.indexLookUp.push(`${id}, ${sizes}, ${colors}`)
                }
              }
            }
            if(!this.titles.length) this.clearCart();
            // JSON.parse(values[1].quantities, (key, value) => {
            //     if(typeof value === 'number') quantity.push(value);
            // });
          }
        },5)
      }
    })
  }

  ngOnInit() {
    this.message = this._fb.group({
        'receiver': [null, Validators.required],
        'body': [null, Validators.required]
    })
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 && navigator.userAgent.indexOf("Mobi") != -1)  { 
      document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
      });
    }
    this.messageOpenSubscription = this._messagesService.messageOpen.subscribe(data=>{
      if(window.outerWidth < 768){
        this.showMessages();
        $("#messages-side-menu-tab-container").tabs('select_tab', 'compose-messages-side-menu');
        this.message.patchValue({'receiver':data[0]});
        $("#message-recipient-side-menu").addClass("valid");
      } else {
        this.showMessages(data[0]);
      }
    });
    
    this.currentUser = window.localStorage.getItem('username') || '';
    this.isLoggedIn = this._auth.checkToken();
    
    this.isAdmin = this._admin.isAdmin();
    this.isSeller = this._seller.isSeller();
    if(this._auth.check('_cart')) this.getCart();
    
    this.backToTop();
    this.fadeBackground();
    this.watchMenuToggle();
    if(this._auth.checkToken()) this.getNotifications();
    this.pollNotifications();
    this.pollMessages();
    this.watchCart();
    this.watchResize();
    this.userLeft();
    if(!window.localStorage.getItem('signature')) this.getSessionToken();
    // if(!localStorage.getItem('video_subs')){
    //       window.localStorage.setItem('news_subs', JSON.stringify(this.defaultNews.concat(['business','science','sports','technology'])));
    //       window.localStorage.setItem('music_subs', JSON.stringify(this.defaultMusic.concat(['electronic','hiphop','house','trap'])));
    //       window.localStorage.setItem('video_subs', JSON.stringify(this.defaultMusic.concat(['funny','feelgood','real','ohshit'])));
    // }
  }

  userLeft(){
    var headers = new Headers();
    headers.append('user', this.currentUser);
    headers.append('left','true')
    let body = {left:true }
    $(window).bind('beforeunload', ()=> {
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      window.localStorage.removeItem("signature")
      this.watchSessionEndSubscription = this._http.put(`${this._backend.SERVER_URL}/api/v1/track`, body, {headers: headers}).subscribe(data => {
        });
    });
  }

  getSessionToken(){
    var headers = new Headers();
    headers.append('user', this.currentUser);
    headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
    let body = {}
    this.getSessionSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/track/`, body, {headers: headers}).subscribe(data => {
        if(data.json().success) window.localStorage.setItem('signature',data.json().session)
        if(this.watchSessionSubscription) this.watchSessionSubscription.unsubscribe();
    });
  }



  logout(session=false) {
      this._auth.logout()
        .then(() => { 
          if(!session) this._systemMessages.setMessages('loggedout'); 
          if(session) this._systemMessages.setMessages('sessionEnd'); 
          this.isLoggedIn = this._auth.checkToken();
          this.isAdmin = false;
          this.isSeller = false;
          // this._messages.setMessages('loggedout');
          // window.localStorage.setItem('news_subs', JSON.stringify(this.defaultNews.concat(['business','science','sports','technology'])));
          // window.localStorage.setItem('music_subs', JSON.stringify(this.defaultMusic.concat(['electronic','hiphop','house','trap'])));
          // window.localStorage.setItem('video_subs', JSON.stringify(this.defaultMusic.concat(['funny','feel-good','real','ohshit'])));
          this._router.navigate(['/switch', 'home', window.pageYOffset],{ skipLocationChange: true }); //reloads the home component.
          this.destroyComponents();
          document.title = `Way Dope`;
          $('#unread-notifications,#unread-notifications-menu').css({'display':'none'});
          $('#unread-notifications-text,#unread-notifications-text-menu').css({'display':'none'});
          $('#unread-messages,#unread-messages-menu').css({'display':'none'});
          $('#unread-messages-text,#unread-messages-text-menu').css({'display':'none'});
          this.newNotifications=false;
          this.newMessages=false
          this._notificationService.change([],true);
          this._messagesService.change([],[],true);
        }
      );

  }
  destroyComponents(){
      if(this.apparelComponent){this.apparelComponent.destroy(); this.apparelComponentopened = false; this.apparelComponent = null;}
      if(this.musicComponent){this.musicComponent.destroy(); this.musicComponentOpened = false; this.musicComponent = null;}
      if(this.videosComponent){this.videosComponent.destroy(); this.videosComponentOpened = false; this.videosComponent = null;}
      if(this.boardComponent){this.boardComponent.destroy(); this.boardComponentOpened = false; this.boardComponent = null;}
      if(this.technologyComponent){this.technologyComponent.destroy(); this.technologyComponentopened = false; this.technologyComponent = null;}
    }

    public setLoggedIn(event=null){
      // the event null may not be needed, but is sent from the modal
      
      this.isLoggedIn = this._auth.checkToken();
      this.currentUser = localStorage.getItem('username') || '';
      
      this.isAdmin = this._admin.isAdmin();
      this.isSeller = this._seller.isSeller();
      this.getNotifications();
      this.destroyComponents();
      this.pollNotifications();
      this.pollMessages();
      // this.getNotifications();
    }

    isCurrentRoute(route){
      return this._router.url === route;
    }

   public cartClose(url=null){
       $('#side-menu-toggle').click();
        if(url){
            this._router.navigateByUrl(url);
        }
    }

    addDropDown(value,type){
      this.isHovering = true; 
      this.hoveringType = type;
      if(!this.menuTiming && value === 1){
        this.menuTiming = true;
        this.menuTimeout = setTimeout(()=>{
            this.menuTiming = false;
            if(this.extendedMenuOpen === true){
              this.closeDropDown(null);
            }
            this.extendedMenuOpen = true;
            let vcRefs = $(this.viewContainerRefs).toArray();
            
            switch (type) {
              case 'boards':
                this.instance = this.boardComponent ? this.boardComponent.instance : null;
                this.component = 'boards';
                if(!this.boardComponentOpened){
                  this.boardComponentOpened = true;
                  this.boardComponent = this.viewContainerRef.createComponent(this.boardsMenuFactory, 0);
                  if(!this.instance) this.instance = this.boardComponent.instance;
                  let offset = $(`#${type}-menu`).offset();
                  
                  
                  this.instance.offset = offset.left;
                  this.$drop_downs = $(".menu-drop-down")
                  if($(window).scrollTop() > 35) this.$drop_downs.css({'position':'fixed','margin-top':'64px'})
                } else {$(`#boards-drop-down`).css({'display':'block'});}
                break;
              case 'music': 
                this.instance = this.musicComponent ? this.musicComponent.instance : null;
                this.component = 'music';
                if(!this.musicComponentOpened){
                  
                  this.musicComponentOpened = true;
                  this.musicComponent = this.viewContainerRef.createComponent(this.musicMenuFactory, 0);
                  if(!this.instance) this.instance = this.musicComponent.instance;
                  let offset = $(`#${type}-menu`).offset();
                  this.instance.offset = offset.left;
                  this.$drop_downs = $(".menu-drop-down")
                  if($(window).scrollTop() > 35) this.$drop_downs.css({'position':'fixed','margin-top':'64px'})
                } else {$(`#music-drop-down`).css({'display':'block'});}
                break;
              case 'videos':
                this.instance = this.videosComponent ? this.videosComponent.instance : null;
                this.component = 'videos';
                if(!this.videosComponentOpened){
                  this.videosComponentOpened = true;
                  this.videosComponent = this.viewContainerRef.createComponent(this.videosMenuFactory, 0);
                  if(!this.instance) this.instance = this.videosComponent.instance;
                  let offset = $(`#${type}-menu`).offset();
                  this.instance.offset = offset.left;
                  this.$drop_downs = $(".menu-drop-down")
                  if($(window).scrollTop() > 35) this.$drop_downs.css({'position':'fixed','margin-top':'64px'})
                } else {$(`#videos-drop-down`).css({'display':'block'});}
                break;
              case 'apparel':
                this.instance = this.apparelComponent ? this.apparelComponent.instance : null;
                this.component = 'apparel';
                if(!this.apparelComponentopened){
                  this.apparelComponentopened = true;
                  this.apparelComponent =  this.viewContainerRef.createComponent(this.apparelMenuFactory, 0);
                  if(!this.instance) this.instance = this.apparelComponent.instance;
                  let offset = $(`#${type}-menu`).offset();
                  this.instance.offset = offset.left;
                  this.$drop_downs = $(".menu-drop-down")
                  if($(window).scrollTop() > 35) this.$drop_downs.css({'position':'fixed','margin-top':'64px'})
                } else {$(`#apparel-drop-down`).css({'display':'block'});}
                break;
              case 'technology':
                this.instance = this.technologyComponent ? this.technologyComponent.instance : null;
                this.component = 'technology';
                if(!this.technologyComponentopened){
                  this.technologyComponentopened = true;
                  this.technologyComponent = this.viewContainerRef.createComponent(this.technologyMenuFactory, 0);
                  if(!this.instance) this.instance = this.technologyComponent.instance;
                  let offset = $(`#${type}-menu`).offset();
                  this.instance.offset = offset.left;
                  this.$drop_downs = $(".menu-drop-down")
                  if($(window).scrollTop() > 35) this.$drop_downs.css({'position':'fixed','margin-top':'64px'})
                } else {$(`#technology-drop-down`).css({'display':'block'});}
                break;
              case 'profile':
                this.instance = this.profileComponent ? this.profileComponent.instance : null;
                this.component = 'profile';
                if(!this.profileComponentopened){
                  this.profileComponentopened = true;
                  this.profileComponent = this.viewContainerRef.createComponent(this.profileMenuFactory, 0);
                  if(!this.instance) this.instance = this.profileComponent.instance;
                  let offset = $(`#${type}-menu`).offset();
                  let window_mult;
                  this.$drop_downs = $(".menu-drop-down")
                  if($(window).scrollTop() > 35) this.$drop_downs.css({'position':'fixed','margin-top':'64px'})
                  if(window.outerWidth > 1500){
                    window_mult = 0.12;
                  } else if (window.outerWidth < 1500 && window.outerWidth > 1000){
                    window_mult = 0.20;
                  }
                  this.instance.offset = (offset.left - (window.outerWidth * window_mult)) + $('#profile-menu').width();
                  
                } else {
                  
                  $(`#profile-drop-down`).css({'display':'block'});}
                break;
              default:
                return false;
            }
            this.openSubscription = this.instance.open.subscribe((e)=> {
            
            this.open = true;
            this.hovering = $(`#${this.component}-menu-tab`);
            if (this.openSubscription) this.openSubscription.unsubscribe();
            })
            this.closeSubscription = this.instance.close.subscribe((e) => {
              setTimeout(()=>{
                if(!this.isHovering || (this.hoveringType != this.component)){
                  this.close = true;
                  this.closeDropDown(null);
                }
              },20)
            })
          // else if(value === 2){
          //   //basically a monkey patch to stop the component from closing when moving from the tab to component
          //   //but close when they move off the tab to the right (going towards 'Way Dope')
          //   if(!this.open){
          //     setTimeout(()=>{
          //       if(!this.open){
          //         this.closeDropDown();
          //         this.open = false;
          //       }
          //     },100)
          //   } else {
          //     setTimeout(()=>{
          //     if(this.close){
          //       this.closeDropDown();
          //       this.close = false;
          //     }
          //   },100)
          //   }
          // }
          
        },100)
      } else if (value ===0 && this.menuTiming){
          clearTimeout(this.menuTimeout)
          this.menuTiming = false;
      }
      if(value === 0){
          this.isHovering=false;
          this.hoveringType=null;
      }
    }

    closeDropDown(url){
      // if(this.component) this.component.destroy();
      $(`#${this.component}-drop-down`).css({'display':'none'});
      if(this.closeSubscription) this.closeSubscription.unsubscribe();
      if(this.openSubscription) this.openSubscription.unsubscribe();
      this.extendedMenuOpen === false;
    }
    pollNotifications(){
      if(this._auth.checkToken()){
        var headers = new Headers();
        headers.append('user', this.currentUser);
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.pollSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${this.currentUser}/notifications`, {headers: headers}).subscribe(data => {
            
            
            if(data.json().success){
              if(data.json().ssn) window.localStorage.setItem("waydope_ssn_required","true");
              if(data.json().notifications.length && data.json().notifications[0].count){
                $('#unread-notifications,#unread-notifications-menu').css({'display':'block'});
                $('#unread-notifications-text,#unread-notifications-text-menu').css({'display':'block'});
                if(!this.unreadNotificationCount || data.json().notifications.length > this.unreadNotificationCount) $('#unread-notifications-text,#unread-notifications-text-menu').text(data.json().notifications[0].count);
                this.notifications = data.json().notifications;
                this.unreadNotificationCount = data.json().notifications[0].count;
                this.notificationsTotal = this.notifications && this.notifications[0] ? this.notifications[0].total : 0;
                this.notificationPages = this.notificationsTotal ? Math.ceil(this.notificationsTotal / 10) - 1 : 0;
                this.newNotifications = true;
                document.title = `Way Dope (${data.json().notifications[0].count})`;
                setTimeout(()=>{
                  if($(window).scrollTop() > 35) $("#notification-icon").addClass("active");
                },5)
              }
              if(this.pollSubscription) this.pollSubscription.unsubscribe();
            } else {
              // this.error = true;
            }
          });
          setTimeout(()=>{if(this.pollSubscription) this.pollSubscription.unsubscribe(); this.pollNotifications()},60000);
          
          
      }
    }
    pollMessages(){
       if(this._auth.checkToken()){
        var headers = new Headers();
        headers.append('user', this.currentUser);
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.pollMessagesSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${this.currentUser}/messages`, {headers: headers}).subscribe(data => {
          
            if(data.json().success){
              if(data.json().messages.length && data.json().messages[0].count){
                $('#unread-messages,#unread-messages-menu').css({'display':'block'});
                $('#unread-messages-text,#unread-messages-text-menu').css({'display':'block'});
                $('#unread-messages-text,#unread-messages-text-menu').text(data.json().messages[0].count);
                document.title = `Way Dope (${data.json().messages[0].count})`;
                this.newMessages = true;
                this._messagesService.change(data.json().messages,this.outbox);
              }
              if(this.pollMessagesSubscription) this.pollMessagesSubscription.unsubscribe();
            } else {
              // this.error = true;
            }
          });
          // this is done outside the subscription just in case something happens. - for some reason, the 60000 only ends up being 33 seconds (approx.). So what do us programmers logically do? Double it.
          setTimeout(()=>{if(this.pollMessagesSubscription) this.pollMessagesSubscription.unsubscribe(); this.pollMessages()},60000);
      }
    }
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // this gets the notifications AND messages !!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    getNotifications(){
        var headers = new Headers();
        headers.append('user', this.currentUser);
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.subscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/${this.currentUser}/notifications/all`, {headers: headers}).subscribe(data => {
            if(data.json().success){
              
              if(data.json().notifications.length && data.json().notifications[0].count){
                $('#unread-notifications,#unread-notifications-menu').css({'display':'block'});
                $('#unread-notifications-text,#unread-notifications-text-menu').css({'display':'block'});
                $('#unread-notifications-text,#unread-notifications-text-menu').text(data.json().notifications[0].count);
                document.title = `Way Dope (${data.json().notifications[0].count})`;
                this.newNotifications = true;
                this.unreadNotificationCount = data.json().notifications[0].count;
              }
              this.inbox = data.json().inbox;
              this.outbox = data.json().outbox;
              this.setIds();
              if(data.json().inbox.length && data.json().inbox[0].count){
                $('#unread-messages,#unread-messages-menu').css({'display':'block'});
                $('#unread-messages-text,#unread-messages-text-menu').css({'display':'block'});
                $('#unread-messages-text,#unread-messages-text-menu').text(data.json().inbox[0].count);
                document.title = `Way Dope (${data.json().inbox[0].count})`;
                this.newMessages = true;
              }
              this.notifications = data.json().notifications;
              this.notificationsTotal = this.notifications && this.notifications[0] ? this.notifications[0].total : 0;
              this.notificationPages = this.notificationsTotal ? Math.ceil(this.notificationsTotal / 10) - 1 : 0;
              this.currentNotificationPage = 0;
              this.notificationsOffset = 10;
              if(this.subscription) this.subscription.unsubscribe();
            } else {
              // this.error = true;
            }
          });
    }
    changeSearchCategory(url){
      let category = url.split('/').length > 1 ? url.split('/')[1] : null ; // it should always be greater than 1, but still, it shall be used.
       switch(category){
         case 'boards':
          this.search.patchValue({category:'Boards'});
         break;
         case 'music':
          this.search.patchValue({category:'Music'});
         break;
         case 'videos':
          this.search.patchValue({category:'Videos'});
         break;
         case 'apparel':
          this.search.patchValue({category:'Apparel'});
         break;
         case 'technology':
          this.search.patchValue({category:'Technology'});
         break;
         default:
          this.search.patchValue({category:'All'});
      }
    }
    showMessages(user=null){
      if(this._auth.checkToken()){
        if(window.innerWidth > 1023){
          this._messagesService.change(this.inbox,this.outbox,null,user);
          this._messages.setBox();
          if(this.cartComponentOpened){this._cart.cartClose(); this.cartComponentOpened = false;}
          if(this.notificationsComponentOpened){this._notification.notificationsClose(); this.notificationsComponentOpened = false}
          this.messagesComponentOpened = true;
          this.newMessages=false;
          document.title = `Way Dope`;
          this.$messages_box = $('.messages-box');
          if($(window).scrollTop() > 35) this.$messages_box.css({'position':'fixed','margin-top':'-35px'})
        } else {
          $('#side-menu-toggle').data('type','messages');
          $('#messages-side-menu').css({display:'block'});
          $('#messages-side-menu-tab-container').tabs('select_tab', 'inbox-messages-side-menu');
          this.toggleSideMenu();
          this.infiniteScrollMessages();
        }

        $('#unread-messages,#unread-messages-menu').css({'display':'none'});
        $('#unread-messages-text,#unread-messages-text-menu').css({'display':'none'});
      } else {
        this._modal.setModal();
      }
    }
    getConversation(id){
      if(!this.pollingConversation){
        this.pollingConversation = true;
        let headers = new Headers();
        headers.append('id', id);
        headers.append('offset',this.conversationOffset.toString());
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.conversationSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/messages/read`, {headers: headers}).subscribe(data => { 
          if(data.json().success){
            
            let $container = $("#conversation-side-menu").get(0)
                if(this.conversation.length){
                    let scroll = $container.scrollTop;
                    let height = $container.scrollHeight;
                    let convo = data.json().conversation
                    this.conversation = convo.concat(this.conversation);
                    setTimeout(()=>{
                        let new_height = $container.scrollHeight;
                        $container.scrollTop = new_height - height - scroll;
                    },5)
                    $("#convo-spinner-container,#spinner-conversation").css({'display':'none'});
                }
                else{
                    this.conversation = data.json().conversation; 
                    setTimeout(()=>{
                        $container.scrollTop = $container.scrollHeight;
                    },5)
                    let index = this.inbox_ids.indexOf(id);
                    this.otherUser = this.conversation[0].sender === this.currentUser ? this.conversation[0].receiver : this.conversation[0].sender;
                    if(index > -1 && !this.inbox[index].read){
                        setTimeout(()=>{
                            this.inbox[index].read = true;
                            this.inbox[0].count -= 1;
                            this._messagesService.change(this.inbox,this.outbox);
                        },700)
                    }
                }
                this.currentConversationId = id;
                this.loadingConversation = false;
                this.totalConversation = this.conversation.length ? this.conversation[0].total : null;
                this.conversationOffset = data.json().offset;
                this.currentPageConversation = (this.conversationOffset / 10);
                this.pagesConversation = Math.ceil(this.totalConversation/10);
          } else {
            Materialize.toast("Conversation wasn't found", 3000, 'rounded-failure')
            setTimeout(()=>{
              this.conversation = [];
              this.currentConversationId = null;
              this.loadingConversation = true;
            },450)
            this.readConversation(null);
          }
           setTimeout(()=>{
                this.pollingConversation = false;
            },5)
        });
      }
    }
    submitReply(receiver,sender){
      
      let $container = $('#conversation-side-menu')
      let value = $('#reply-body').val();
      let headers = new Headers();
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      let body = {receiver:this.otherUser, body:value}
      this.replySubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/messages/new`, body, {headers: headers}).subscribe(data => {
        
        if(data.json().success){
          let index = this.outbox_ids.indexOf(data.json().message.conversation_id)
          this.conversation.push(data.json().message);
          this.outbox[index] = data.json().message;
          $('#reply-body').val('');
          $('#reply-body').blur();
        }
      });
    }
    setIds(){
        this.inbox_ids=[];
        for(let i =0;i<this.inbox.length;i++){
            this.inbox_ids.push(this.inbox[i].conversation_id);
        }
        this.outbox_ids=[];
        for(let i =0; i< this.outbox.length;i++){
            this.outbox_ids.push(this.outbox[i].conversation_id)
        }
    }
    infiniteScrollMessages(){
      let component = this;
      let $outer = $("#message-container-menu")
      let $convo = $('#conversation-side-menu');
      if($outer.get(0).scrollHeight - $outer.height()) {
          let type = $("#messages-side-menu-tab-container > li > a.active").attr('href').toString().replace(/-messages-side-menu|#/g,"");
          setTimeout(()=>{
            if(type === 'inbox') this.getInboxMessages();
            if(type === 'outbox') this.getOutboxMessages();
            if(type === 'conversation') this.getConversationMessages();
          },300)
      }
      $outer.scroll(()=>{
        
        if(($outer.get(0).scrollHeight - $outer.height()) - $outer.scrollTop() < 50){
            let type = $("#messages-side-menu-tab-container > li > a.active").attr('href').toString().replace(/-messages-side-menu|#/g,"");
            if(type === 'inbox') this.getInboxMessages();
            if(type === 'outbox') this.getOutboxMessages();
        }
	    }); 
      $convo.scroll(()=>{
          if($convo.scrollTop() < 150){
              this.getConversationMessages();
          }
      })
    }
    getInboxMessages(){
        if(this.pagesInbox > 1 && this.currentPageInbox < this.pagesInbox){
            this.getInbox();
        }
    }
    getOutboxMessages(){
        if(this.pagesOutbox > 1 && this.currentPageOutbox < this.pagesOutbox){
            this.getOutbox();
        }
    }
    getConversationMessages(){
        if(this.pagesConversation > 1 && this.currentPageConversation < this.pagesConversation){
            $("#convo-spinner-container").css({'display':'block'});
            $("#spinner-conversation").css({'display':'initial'});
            this.getConversation(this.currentConversationId);
        }
    }
    getInbox(){
      if(!this.pollingInbox){
        this.pollingInbox = true;
        let headers = new Headers();
        headers.append('offset',this.inboxOffset.toString());
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.inboxSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/messages/inbox`, {headers: headers}).subscribe(data => {
            
            if(data.json().success){
            if(this.inbox && data.json().messages.length) this.inbox = this.inbox.concat(data.json().messages);
            else if(data.json().messages.length) this.inbox = data.json().messages;
            this.setIds();
            this.inboxOffset = data.json().offset;
            this.currentPageInbox = (this.inboxOffset / 10);
            }
            this.pollingInbox = false;
        });
      }
    }
     getOutbox(){
      if(!this.pollingOutbox){
        
        this.pollingOutbox = true;
        let headers = new Headers();
        headers.append('offset',this.outboxOffset.toString());
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.outboxSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/messages/outbox`, {headers: headers}).subscribe(data => {
            
            if(data.json().success){
            if(this.outbox && data.json().messages.length) this.outbox = this.outbox.concat(data.json().messages);
            else if(data.json().messages) this.outbox = data.json().messages;
            for(let i =0; i < data.json().messages;i++){
                let index = this.outbox.indexOf(data.json().messages[i]);
                if(index > -1) this.outbox.splice(index,1)
            }
            this.outboxOffset = data.json().offset;
            this.currentPageOutbox = (this.outboxOffset / 10);
        }
        this.pollingOutbox = false;
        });
      }
    }
    readConversation(id){
      let $container = $('#message-container-menu')
      let $conversation = $('#conversation-side-menu')
      let toggled = $container.data('inner');
      
      
      if(toggled){
        $container.css({'left':'0%'}).data('inner',false)
        $conversation.css({'left':'100%'});
      } else {
        $container.css({'left':'-100%'}).data('inner',true)
        $conversation.css({'left':'0%'});
      }
      if(this.currentConversationId != id && id !=null){
        this.loadingConversation = true;
        this.getConversation(id);
      } else {
          setTimeout(()=>{
            this.currentConversationId = null;
            this.currentPageConversation = 0;
            this.pagesConversation = 0;
            this.totalConversation = 0;
            this.conversationOffset = 0;
            this.conversation = [];
          },700)
      }
    }
    showNotifications(){
      if(this._auth.checkToken()){

        if(window.innerWidth > 1023){
          this._notificationService.change(this.notifications);
          this._notification.setBox();
          if(this.cartComponentOpened){this._cart.cartClose(); this.cartComponentOpened = false;}
          if(this.messagesComponentOpened){this._messages.close(); this.messagesComponentOpened = false}
          this.notificationsComponentOpened = true;
          this.newNotifications=false;
          document.title = `Way Dope`;
          this.$notification_box = $('.notification-box');
          if($(window).scrollTop() > 35) this.$notification_box.css({'position':'fixed','margin-top':'-35px'})
        } else {
          $('#side-menu-toggle').data('type','notifications');
          $('#notifications-side-menu').css({display:'block'});
          this.toggleSideMenu();
        }

        $('#unread-notifications,#unread-notifications-menu').css({'display':'none'});
        $('#unread-notifications-text,#unread-notifications-text-menu').css({'display':'none'});
        this.notificationsOpened();
        this.infiniteScroll();

      } else {
        this._modal.setModal();
      }
    }
    getCart(){
      this.cartId = parseInt(this._auth.getCookie('_cart'));
      var headers = new Headers();
      headers.append('cart', this.cartId.toString());
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      this.getCartSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/cart`, {headers: headers}).subscribe(data => {
            
            if(data.json().success){
              this.items = data.json().order.products;
              $('#shopping-cart-icon,#shopping-cart-icon-menu').css({'display':'block'});
              $('#shopping-cart-icon-text,#shopping-cart-icon-text-menu').css({'display':'block'});
              $('#shopping-cart-icon-text,#shopping-cart-icon-text-menu').text(this.items.length);
              this.order = data.json().order;
              
              this._cartService.change(this.items,this.order);
              if(this.getCartSubscription) this.getCartSubscription.unsubscribe();
              // if(data.json().notifications.length && data.json().notifications[0].count){
              //   $('#unread-notifications,#unread-notifications-menu').css({'display':'block'});
              //   $('#unread-notifications-text,#unread-notifications-text-menu').css({'display':'block'});
              //   $('#unread-notifications-text,#unread-notifications-text-menu').text(data.json().notifications[0].count);
              //   document.title = `Way Dope (${data.json().notifications[0].count})`;
              //   this.newNotifications = true;
              //   this.unreadNotificationCount = data.json().notifications[0].count;
              // }
              // this.notifications = data.json().notifications;
              // if(this.subscription) this.subscription.unsubscribe();
            } else {
              document.cookie = `_cart=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/${this.prod ? ";domain=waydope.com" : ''}`;
              this.cartId = null;
              // this.error = true;
            }
          });
    }

    ///set up cookies and having the cart update when someone adds to cart.
    /// by the way, if a delete request fails, the GUI will show it's deleted, but it's won't be.
    // this also does this for the edit page in the cart. Needs to be fixed.
    createCart(values={},buynow=false){
      var headers = new Headers();
      let creds = {'items':this.itemsIds,'quantities': [values["quantity"]], "sizes": [values["size"]], "colors": [values["color"]]}
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      this.cartSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/cart/new`,creds, {headers: headers}).subscribe(data => {
        
        if(data.json().success){
                    
          this._auth.setCookie('_cart', data.json().order.uuid, 3);
          this.cartId = data.json().order.uuid;
          this.order = data.json().order;
          if(buynow) this._router.navigateByUrl("/cart#review");
          this._cartService.change(this.items,this.order);
        } else if(data.json().status === 409) {
          Materialize.toast("Can't add an item to the cart that hasn't been approved.", 3000, 'rounded-failure')
          // this.error = true;
        }
      });
    }
    updateCart(item,values,buynow=false){
      
       var headers = new Headers();
        let creds = {item:item,quantity:values["quantity"],"size":values["size"],"color":values["color"]}
        headers.append('cart', this.cartId.toString());
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.cartSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/cart/update`, creds,{headers: headers}).subscribe(data => {
          
          if(data.json().success){
              this.order = data.json().order;
              if(buynow) this._router.navigateByUrl("/cart#review");
              this._cartService.change(this.items,this.order);
            } else if(data.json().status === 401) {
              this.createCart();
            }
        });

    }
    clearCart(){
       this.order = null;
       this.cartId = null;
       this.indexLookUp = [];
       this.titles = [];
       this.items = [];
       this.itemsIds = [];
       this.quantities = [];
       this.sizes =[];
       this.colors =[];
       this.titles = [];
       this.prices = [];
       this.shippings = [];
       this.totals = [];
       this.sub_totals = [];
       this.ids = [];
      document.cookie = `_cart=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/${this.prod ? ";domain=waydope.com" : ''}`;
      $('#shopping-cart-icon,#shopping-cart-icon-menu').css({'display':'none'});
      $('#shopping-cart-icon-text,#shopping-cart-icon-text-menu').css({'display':'none'});
      this._cartService.change('clear','clear');
    }
    watchCart(){
       this.watchCartSubscription = this._cartService.itemsChange.subscribe((value) => { 
            if(value && value[0] === 'clear'){
              this.clearCart();
              return; 
            }
            if(value && value[0]==='destroy') this.cartId = null;
            if(value && value[0] && value[0].uuid){
              if(!this.itemsIds.includes(value[0].uuid)){
                  this.itemsIds.push(value[0].uuid)
                  this.item_ids.push(value[0].uuid)
                  this.items.push(value[0]);
              } else {
                let index = this.itemsIds.indexOf(value[0].id)
                if(value[1]["quantity"] != null && value[1]["quantity"] === 0){
                  let index = this.indexLookUp.indexOf(`${value[0].id}, ${value[1].size}, ${value[1].color}`);
                  let id = this.ids[index];
                  this.ids.splice(index,1);
                  this.titles.splice(index,1);
                  if(this.ids.indexOf(id) === -1){
                    let itemIndex = this.itemsIds.indexOf(id);
                    this.items.splice(itemIndex,1);
                    this.item_ids.splice(itemIndex,1);
                    this.itemsIds.splice(itemIndex,1);
                  }
                }
              }
              
              
              
              
              

              
            }
            if(!this.cartId && !value[2]){
              this.createCart(value[1],value[3]);
            } else if (this.cartId && !value[2]) {
              this.updateCart(value[0].uuid,value[1],value[3])
            }
            $('#shopping-cart-icon,#shopping-cart-icon-menu').css({'display':'block'});
            $('#shopping-cart-icon-text,#shopping-cart-icon-text-menu').css({'display':'block'});
            $('#shopping-cart-icon-text,#shopping-cart-icon-text-menu').text(this.items.length);
            setTimeout(()=>{
              if($(window).scrollTop() > 35 && window.innerWidth > 1023) $('#shopping-icon').addClass('active');
            },150)
        });
    }
    showCart(){
      if(window.innerWidth > 1023){
          this._cart.setCart();
          if(this.notificationsComponentOpened) this._notification.notificationsClose();
          // if(this.messagesComponentOpened){this._messages.close(); this.messagesComponentOpened = false}
          this.cartComponentOpened = true;
          this.$notification_box = $('.notification-box');
          if($(window).scrollTop() > 35) this.$notification_box.css({'position':'fixed','margin-top':'-35px'})
      } else {
        $('#side-menu-toggle').data('type','cart');
        $('#shopping-cart-side-menu').css({display:'block'});
        this.toggleSideMenu();
        setTimeout(()=>{
          this.getImageWidth();
        })
      }
    }
    getImageWidth(){
        for(let id = 0; id < this.items.length;id++){
          // let image_object = new Image();
          // image_object.src = $(`#main-photo-cart-menu-${id}`).attr("src");

          
          // let native_width = image_object.width;
          // let native_height = image_object.height;

          // if(native_height > native_width && native_height > 148){
          //     let multiplier = 148 / native_height
          //     let new_width = native_width * multiplier;
          //     $(`#main-photo-cart-menu-${id}`).height(148).width(new_width)
          // } else if (native_height > native_width && native_height <= 148) {
          //     $(`#main-photo-cart-menu-${id}`).height(native_height).width(native_width)
          // } else if (native_width > native_height && native_width > 300){
          //     let multiplier = 300 / native_width;
          //     let new_height = (native_height * multiplier) < 149 ? (native_height * multiplier) : 148;
          //     $(`#main-photo-cart-menu-${id}`).height(new_height).width(300);
          // } else {
          //     $(`#main-photo-cart-menu-${id}`).height(native_height).width(native_width)
          // }
          $(`#main-photo-cart-menu-${id}`).css({'display':'initial'});
        }
    }
  submitSearch(values){
    if(window.location.pathname === '/search'){
      localStorage.setItem("category", values.category);
      localStorage.setItem("search", values.search);
      
      
      this._router.navigateByUrl(`/switch/search?category=${values.category}&search=${values.search}`, { skipLocationChange: true });
    } else {
      this._router.navigateByUrl(`/search?category=${values.category}&search=${values.search}`);
    }
    this.search.patchValue({search:''})
    $(`#search`).blur();
    if(window.innerWidth < 550)  this.toggleSideMenu();
	};
  submitMessage(values){
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      let creds = {receiver:values.receiver,body:values.body}; 
      this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/messages/new`, creds, {headers: headers}).subscribe(data => {
        if(data.json().success){
          let index = this.outbox_ids.indexOf(data.json().message.conversation_id)
          if(index === -1){
              this.outbox.unshift(data.json().message);
              this.outbox_ids.unshift(data.json().message.conversation_id)
              this.totalOutbox += 1;
          } else{
              this.outbox[index] = data.json().message;
          }
          Materialize.toast("Message Successfully Sent", 3000, 'rounded-success')
          $(`#message-recipient-side-menu, #message-body-side-menu`).removeClass('valid');
          this.message.reset();
          this._messagesService.change(this.inbox,this.outbox);
        }
        else if(data.json().status === 404){
           Materialize.toast("No User Found By That Name", 3000, 'rounded-failure');
        } else if(data.json().status === 410){
           Materialize.toast("This User Has Been Banned", 3000, 'rounded-failure');
        }
      });
  }
    exitLink(type,category,subcategory,url,comment){
        
        if(type === 'user'){
            // category is the user in this case.
            this._router.navigateByUrl(`/user/${category}`)
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
        this.toggleSideMenu();
    }
  toggleMainMenu(){
    // this is a pretty dumb feature. It used to work, doesn't now.
    // if it seams like not to bad of a feature in the future, I'll add it back.

    // if(!$('#submenus-select').is(':checked')){
    //   $('#main-non-inner-menu').css({'display':'block'});
    //   $('#main-side-menu').css({'display':'none'});
    //   let main = $('#settings-toggle').data('main',false);
    // } else {
    //   $('#main-side-menu').css({'display':'block'});
    //   $('#main-non-inner-menu').css({'display':'none'});
    //   let main = $('#settings-toggle').data('main',true);
    // }
  }

  // this was written on 3 am mode. Please refactor.
  toggleInnerMenu(category,innerCategory=null){
    let settings = category === 'settings' ? $('#settings-toggle').data('open') : null;
    let inner = $('#settings-toggle').data('inner');
    let main = $('#settings-toggle').data('main');
    if(category === 'home' || settings){
      if(!settings){ inner = null; $('#settings-toggle').data('inner',null)}
      if(!inner && main){$('#main-side-menu').css({'left':'0%'});}
      else if(!inner && !main){$('#main-non-inner-menu').css({'left':'0%'});}
      $(`#${innerCategory}-inner-menu`).css({'left':'100%'});
      if(settings){
        $('#cog').removeClass('turned-cog'); 
        $('#settings-toggle').data('open',false)
        if(inner){$(`#${inner}-inner-menu`).css({'left':'0%'}); };
      }
    } else {
      if(main){$('#main-side-menu').css({'left':'-100%'});}
      else{$('#main-non-inner-menu').css({'left':'-100%'});}
      $(`#${category}-inner-menu`).css({'left':'0%'});
      if(category === 'settings'){ 
        $('#cog').addClass('turned-cog'); 
        $('#settings-toggle').data('open',true)
        if(inner) $(`#${inner}-inner-menu`).css({'left':'-100%'});
      } else {
        $('#settings-toggle').data('inner',category); 
      }
    }
  }
  checkEnter(event){
    if(event.keyCode == 13) {
      this.submitSearch(this.search.value)
    }
  }
  watchMenuToggle(){
    $('#side-menu-toggle').on('click',()=>{
      if(!$('#side-menu-toggle').data('toggled')){
        $('#side-menu-toggle').data('type','menu')
        $('#side-menu-container').css({'display':'block'});
      }
      this.toggleSideMenu();
    });
  }
  notificationsOpened(){
        if(this.notifications && this.notifications[0]){
            let count = this.notifications[0].count ? this.notifications[0].count  : null;
            let ids = []
            if(count){
                var headers = new Headers();
                headers.append('Content-Type', 'application/json');
                headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
                let creds = {} 
                this.subscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/users/${this.currentUser}/notifications`, creds, {headers: headers}).subscribe(data => {
                    setTimeout(()=>{
                        if(this.subscription) this.subscription.unsubscribe();
                    },10000)
                });       
            }
        }
    }
  notificationLink(type,category,subcategory,url){
    if(window.location.pathname.split('/').length === 3){
            if(window.location.pathname.split('/')[1] === '${type}'){ this._router.navigate(['/switch', type, category, url], { skipLocationChange: true });}
            else this._router.navigateByUrl(`/${type}/${category}/${url}`);
        } else if(window.location.pathname.split('/').length === 4) {
            if(window.location.pathname.split('/')[1] === '${type}'){ this._router.navigate(['/switch', type, category, subcategory, url], { skipLocationChange: true });}
            else this._router.navigateByUrl(`/${type}/${category}/${subcategory}/${url}`);
        } else {
            if(!subcategory) this._router.navigateByUrl(`/${type}/${category}/${url}`);
            else this._router.navigateByUrl(`/${type}/${category}/${subcategory}/${url}`);
      }
    this.toggleSideMenu()
  }
  photoZoom(id){
            if(this.zoomedPhoto) this.zoomedPhoto.destroy();
            let options = {zoomPosition:3,disableZoom:'false',autoInside:768,zoomSizeWindow:'image'}; 
            // this is supposed to help with cpu.
            this._ngZone.runOutsideAngular(() => {
              this.zoomedPhoto = new CloudZoom($(`#main-photo-cart-menu-${id}`),options);
              let self = this;
              $(`#main-photo-cart-menu-${id}`).bind('cloudzoom_end_zoom', function(){
                self.zoomedPhoto.destroy();
                $(this).unbind();
              })
        	  });
            // this.zoomedPhoto = new CloudZoom($(`#main-photo-cart-menu-${id}`),options);
            // $(this.zoomedPhoto).attr('height',200).attr('width',200)
  }
  toggleSideMenu(){
    let width;
    if(window.outerWidth > 1023 || window.outerWidth < 500) width = window.innerWidth * 0.85;
    else width = 300;
    if(!$('#side-menu-toggle').data('toggled')){
        $(".pushmenu").css({'width':width});
        $(".pushmenu").css({"left": '0'});
        $(document).on('touchmove', function(e) {
            e.preventDefault();
        });
        $("#side-menu-toggle").data('toggled',true);
        $('#second-menu-toggle-bar').css({
          left: '-=50',
          opacity: 0
        });
        $('#first-menu-toggle-bar,#third-menu-toggle-bar').addClass('active')
      } else {
        $(document).unbind('touchmove');
        $(".pushmenu").css({"left": `-=${width}`});
        $("html").css({'position':'initial','width':'100%'});
        $("#side-menu-toggle").data('toggled',false);
        $('#second-menu-toggle-bar').css({
          left: '+=50',
          opacity: 1
        });
        $('#first-menu-toggle-bar,#third-menu-toggle-bar').removeClass('active');
        setTimeout(()=>{
          let type = $("#side-menu-toggle").data('type')
         
          if(type === 'menu') $('#side-menu-container').css({display:'none'});
          else if (type === 'notifications') $('#notifications-side-menu').css({display:'none'});
          else if(type === 'cart') $('#shopping-cart-side-menu').css({display:'none'});
          else if(type === 'messages') $('#messages-side-menu').css({'display':'none'});
        },300)
      }
  }

    backToTop() {
      // selectors
      let $window = $(window);
      let $back_to_top = $('#back-to-top');
      let $navbar_faded = $("#navbar-faded");
      let $outer_container = $(".outer-container");
      
      ///
      let is_scrolled = false;
      let self = this;
      $window.scroll(function(){
        let $scrollTop = $(this).scrollTop();
        if ($scrollTop > 35 && !is_scrolled) {
          // fade the icons in
          is_scrolled = true;
          if(self.width > 1023) $('#messages-icon, #notification-icon, #back-to-top, #shopping-icon').addClass('active');
          else $('#back-to-top').addClass('active');
          if(self.width > 1023){
            if(self.width <= 1090 ) $('.brand-logo').css({'display':'none'});
            $navbar_faded.addClass("navbar-fixed");
            $navbar_faded.css({"margin-top":'-65px'});
            $outer_container.css({"margin-top":'144px'});
            if(self.$drop_downs) self.$drop_downs.css({'position':'fixed','margin-top':'64px'});
            if(self.$notification_box) self.$notification_box.css({'position':'fixed','margin-top':'-35px'});
            if(self.$messages_box) self.$messages_box.css({'position':'fixed','margin-top':'-35px'});
          }
        } else if($scrollTop <= 35 && is_scrolled) {
          // fade the icons out
          if(self.width > 1023) $('#notification-icon, #back-to-top, #shopping-icon').removeClass('active');
          else $('#back-to-top').removeClass('active');
          is_scrolled = false;
          if(self.width > 1023){
            if(self.width <= 1090 ) $('.brand-logo').css({'display':'initial'});
            $navbar_faded.removeClass("navbar-fixed");
            if(self.width > 1023) $navbar_faded.css({"margin-top":'-30px'});
            else $navbar_faded.css({"margin-top":'-45px'});
            $outer_container.css({"margin-top":'45px'});
            if(self.$drop_downs) self.$drop_downs.css({'position':'absolute','margin-top':'0px'});
            if(self.$notification_box) self.$notification_box.css({'position':'absolute','margin-top':'0px'});
            if(self.$messages_box) self.$messages_box.css({'position':'absolute','margin-top':'0px'});
          }
        }
      });
      $back_to_top.on('click', function(e){
        $window.bind("mousewheel", function() {
          $('html, body').stop();
        });
        e.preventDefault();
        $('html, body').animate({scrollTop : 0},900);
        return false;
      });
    }
    fadeBackground(){
      setTimeout(function(){ 
        $('.background').addClass('active');
      }, 700);
    }
    watchResize(){
      $(window).resize(() => {
        this.width = window.outerWidth; 
      });
    }
    infiniteScroll(){
      let component = this;
      let $outer = $("#notifications-container-side-menu")
      if($outer.get(0).scrollHeight - $outer.height() < 50 && this.currentNotificationPage < this.notificationPages) {
      setTimeout(()=>{
            this.getMoreNotifications();
          },300)
      }
      $outer.scroll(()=>{
        if(($outer.get(0).scrollHeight - $outer.height()) - $outer.scrollTop() < 50 && this.currentNotificationPage < this.notificationPages) this.getMoreNotifications();
      }); 
    }
    getMoreNotifications(){
        if(!this.pollingNotifications){
            $('#loading-spinner-notifications-side-menu').css({'display':'block'});
            this.pollingNotifications = true;
            var headers = new Headers();
            headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
            headers.append('offset', this.notificationsOffset.toString());
            this.scrollSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/users/notifications`, {headers: headers}).subscribe(data => {
                
                if(data.json().success){
                    this.notifications = this.notifications.concat(data.json().notifications)
                    $('#loading-spinner-notifications-side-menu').css({'display':'none'});
                    this.currentNotificationPage = data.json().page;
                    this.notificationsOffset = data.json().offset + 10;
                } else {
                    
                }
                this.pollingNotifications = false;
            });
        }
    }
    ngOnDestroy(){
      if(this.zoomedPhoto) this.zoomedPhoto.destroy();
      if(this.subscription) this.subscription.unsubscribe();
      if(this.pollSubscription) this.pollSubscription.unsubscribe();
      if(this.cartSubscription) this.cartSubscription.unsubscribe();
      if(this.getCartSubscription) this.getCartSubscription.unsubscribe();
      if(this.watchCartSubscription) this.watchCartSubscription.unsubscribe();
      if(this.routeSubscription) this.routeSubscription.unsubscribe();
      if(this.pollMessagesSubscription) this.pollMessagesSubscription.unsubscribe();
      if(this.messageSubscription) this.messageSubscription.unsubscribe();
      if(this.conversationSubscription) this.conversationSubscription.unsubscribe();
      if(this.replySubscription) this.replySubscription.unsubscribe();
      if(this.scrollSubscription) this.scrollSubscription.unsubscribe();
      if(this.notificationsSubscription) this.notificationsSubscription.unsubscribe();
      if(this.inboxSubscription) this.inboxSubscription.unsubscribe();
      if(this.outboxSubscription) this.outboxSubscription.unsubscribe();
      if(this.messageOpenSubscription) this.messageOpenSubscription.unsubscribe();
      if(this.watchSessionSubscription) this.watchSessionSubscription.unsubscribe();
      if(this.trackLeftSubscription) this.trackLeftSubscription.unsubscribe();
      if(this.getSessionSubscription) this.getSessionSubscription.unsubscribe();
      if(this.cartChangeSubscription) this.cartChangeSubscription.unsubscribe();
    }
}
