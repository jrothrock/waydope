import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import {MessagesService} from '../../../services/messages.service';
import {AuthService} from '../../../services/auth.service';
import 'angular2-materialize';
import { Router } from '@angular/router';
import {BackendService} from '../../../services/backend.service';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

declare var $;
declare var Materialize;

@Component({
  selector: 'messages_modal',
  templateUrl: 'messages.modal.component.html'
})

export class MessagesModalComponent implements OnInit {
    message:FormGroup;
    subscription:any;
    submitSubscription:any;
    conversationSubscription:any;
    inboxSubscription:any;
    outboxSubscription:any;
    replySubscription:any;
    loaded:boolean=false;
    inbox:any=[];
    outbox:any=[];
    conversation:any=[];
    names:any=['inbox','outbox','compose'];
    loadingConversation:boolean=false;
    currentConversationId:number;
    currentUser:string;
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
	constructor(private _messagesService: MessagesService, private _backend: BackendService, private _fb:FormBuilder, private _auth: AuthService, private _http: Http, private _router:Router){
        this.message = this._fb.group({
            'receiver': [null, Validators.required],
            'body': [null, Validators.required]
        })
        this.subscription = this._messagesService.messagesChange.subscribe((value) => {
             
            
            this.loaded = true;
            this.inbox = value[0]; 
            this.outbox = value[1];
            if(value[3]){
                 this.message.patchValue({'receiver':value[3]});
                 // being in the constructor, we need the view to init
                 setTimeout(()=>{
                    $("#message-receiver").addClass('valid');
                    $("#messages-tab-container").tabs('select_tab', 'compose-messages');
                 },20)
            }
            if(!this.inbox && !this.outbox && this.currentConversationId){
                this.conversation = [];
                this.currentConversationId=null;
            }
            this.unreadInbox = this.inbox.length && this.inbox[0].count ? this.inbox[0].count : 0;
            this.totalInbox = this.inbox.length && this.inbox[0].total ? this.inbox[0].total : 0;
            this.pagesInbox = Math.ceil(this.totalInbox / 10);
            this.currentPageInbox = 0;
            if(!this.totalOutbox) this.totalOutbox = this.outbox.length && this.outbox[0].total ? this.outbox[0].total : 0;
            this.pagesOutbox = Math.ceil(this.totalOutbox/10);
            this.currentPageOutbox =0;
            if(value.length > 2 && value[2] === true) this.close(); 
            this.setIds();
        });
    };
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
	ngOnInit(){
        this.currentUser = localStorage.getItem('username') || '';
        this.infiniteScroll();
    };
    exitLink(type,category,subcategory,url){
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
        this.close();
    }
    public close(){
        $('body').css({'width':'initial', 'overflow':'initial'});
        // may want to change from fades.
        $('#lightbox-messages').removeClass('active');
    }
    submitMessage(value){
        let headers = new Headers({
	              'Content-Type': 'application/json',
	              'Authorization': 'Bearer ' + this._auth.getToken(),  'Signature': window.localStorage.getItem('signature')
	    });
	    let body = {"receiver" : value.receiver, "body" : value.body}
	    this.submitSubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/messages/new`, body, {headers: headers}).subscribe(data => {
            
                let index = this.outbox_ids.indexOf(data.json().message.conversation_id)
                if(index === -1){
                    this.outbox.unshift(data.json().message);
                    this.outbox_ids.unshift(data.json().message.conversation_id)
                    this.totalOutbox += 1;
                } else {
                    this.outbox[index] = data.json().message;
                }
                Materialize.toast("Message Sent Successfully", 3000, 'rounded-success')
                $(`#message-receiver, #message-body`).removeClass('valid');
                this.message.reset();
                this._messagesService.change(this.inbox,this.outbox);
        }, error=>{
            if(error.status === 404){
                Materialize.toast("No User Found By That Name", 3000, 'rounded-failure');
            } else if(error.status === 410){
                Materialize.toast("This User Has Been Banned", 3000, 'rounded-failure');
            }
        });
    }
    getConversation(id,offset=0){
      if(!this.pollingConversation){
        this.pollingConversation = true;
        let headers = new Headers();
        headers.append('id', id);
        headers.append('offset',this.conversationOffset.toString());
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.conversationSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/messages/read`, {headers: headers}).subscribe(data => {
            
            if(data.json().success){
                let $container = $("#conversation-messages").get(0)
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
                    let index = this.inbox_ids.indexOf(id);
                    this.otherUser = this.conversation[0].sender === this.currentUser ? this.conversation[0].receiver : this.conversation[0].sender;
                    if(index > -1 && !this.inbox[index].read){
                        setTimeout(()=>{
                            this.inbox[index].read = true;
                            this.inbox[0].count -= 1;
                            this._messagesService.change(this.inbox,this.outbox);
                        },700)
                    }
                    setTimeout(()=>{
                        $container.scrollTop = $container.scrollHeight;
                    },5)
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
    getInbox(){
      if(!this.pollingInbox){
        this.pollingInbox = true;
        let headers = new Headers();
        headers.append('offset',this.inboxOffset.toString());
        headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
        this.inboxSubscription = this._http.get(`${this._backend.SERVER_URL}/api/v1/messages/inbox`, {headers: headers}).subscribe(data => {
            
            if(this.inbox && data.json().messages.length) this.inbox = this.inbox.concat(data.json().messages);
            else if(data.json().messages.length) this.inbox = data.json().messages;
            this.setIds();
            this.inboxOffset = data.json().offset;
            this.currentPageInbox = (this.inboxOffset / 10);
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
            
            if(this.outbox && data.json().messages.length) this.outbox = this.outbox.concat(data.json().messages);
            else if(data.json().messages) this.outbox = data.json().messages;
            for(let i =0; i < data.json().messages;i++){
                let index = this.outbox.indexOf(data.json().messages[i]);
                if(index > -1) this.outbox.splice(index,1)
            }
            this.outboxOffset = data.json().offset;
            this.currentPageOutbox = (this.outboxOffset / 10);
        this.pollingOutbox = false;
        });
      }
    }
    infiniteScroll(){
      let component = this;
      let $outer = $("#message-container")
      let $convo = $('#conversation-messages');
      if($outer.get(0).scrollHeight - $outer.height()) {
          let type = $("#messages-tab-container > li > a.active").attr('href').toString().replace(/-messages|#/g,"");
          setTimeout(()=>{
            if(type === 'inbox') this.getInboxMessages();
            if(type === 'outbox') this.getOutboxMessages();
            if(type === 'conversation') this.getConversationMessages();
          },300)
      }
      $outer.scroll(()=>{
        if(($outer.get(0).scrollHeight - $outer.height()) - $outer.scrollTop() < 50){
            let type = $("#messages-tab-container > li > a.active").attr('href').toString().replace(/-messages|#/g,"");
            if(type === 'inbox') this.getInboxMessages();
            if(type === 'outbox') this.getOutboxMessages();
        }
	  }); 
      $convo.scroll(()=>{
        //    
        //   
        //   
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
    submitReply(receiver,sender){
      
      
      this.currentUser = localStorage.getItem('username') || '';
      let $container = $('#conversation-container')
      let value = $('#reply-body').val();
      let headers = new Headers();
      headers.append('Authorization', 'Bearer ' + this._auth.getToken()); headers.append('Signature', window.localStorage.getItem('signature'))
      let body = {receiver:this.otherUser, body:value}
      
      this.replySubscription = this._http.post(`${this._backend.SERVER_URL}/api/v1/messages/new`, body, {headers: headers}).subscribe(data => {
        
          let index = this.outbox_ids.indexOf(data.json().message.conversation_id)
          this.conversation.push(data.json().message);
          this.outbox[index] = data.json().message;
          $('#reply-body').val('');
          $('#reply-body').blur();
      });
    }
    readConversation(id){
      let $container = $('#message-container')
      let $conversation = $('#conversation-messages')
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
    public setBox(){ 
        $('#lightbox-messages').addClass('active');
        $('#messages-tab-container').css({width:'95%'})
        $('#messages-tab-container').tabs('select_tab', 'inbox-messages');
      
        // $('body').css({'width':window.innerWidth, 'overflow':'hidden'});
        // $('body').append(`<div id='dark-overlay' class='dark-overlay' style='z-index:1002;display:block;opacity:0.5;'></div>`)
    }
    // this may not matter, but if a reload triggers all the current components to destroy, then this is very important.
    ngOnDestroy(){
        if(this.subscription) this.subscription.unsubscribe();
        if(this.submitSubscription) this.submitSubscription.unsubscribe();
        if(this.conversationSubscription) this.conversationSubscription.unsubscribe();
        if(this.inboxSubscription) this.inboxSubscription.unsubscribe();
        if(this.outboxSubscription) this.outboxSubscription.unsubscribe();
        if(this.replySubscription) this.replySubscription.unsubscribe();
    }
}
