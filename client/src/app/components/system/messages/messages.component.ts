import { Component, OnInit, OnChanges   } from '@angular/core';
import { Http } from '@angular/http';

var messageData = {
  messages:null,
  index:0,
  setMessages:function(message){
    this.messages = message;
  },
  getMessages:function(){
    return this.messages;
  },
  clearMessages:function(){
    this.messages=null;
  },
  getIndex:function(){
    return this.index + 1;
  },
  setIndex:function(){
    this.index += 1;
  },
  clearIndex:function(){
    this.index -= 1;
  }
}

declare var $;

@Component({
  selector: 'system_messages',
  templateUrl: 'messages.component.html',
})

export class SystemMessagesComponent implements OnInit {
  name:string;
  message:boolean=false;
  timer:any;

	constructor(){};
	ngOnInit(){}


	checkMessages(){
    if(messageData.getMessages()){
      switch(messageData.getMessages()){
        case 'registered':
          this.setName();
          this.messages('#messages-registered',3500)
          break;
        case 'loggedout':
          this.messages('#messages-loggedout',3500);
          break;
        case 'signedin':
          this.setName();
          this.messages('#messages-loggedin',3500)
          break;
        case 'unathorized':
          this.messages('#messages-unathorized',3500)
          break;
        case 'contact':
          this.messages('#messages-contact',3500)
          break;
        case 'partner':
          this.messages('#messages-partner',3500)
          break;
        case 'submittedSong':
          this.messages('#messages-song',3500)
          break;
        case 'editSong':
          this.messages('#messages-edit-song',3500)
          break;
        case 'deleteSong':
          this.messages('#messages-delete-song',3500)
          break;
        case 'noSong':
          this.messages('#messages-no-song',4000)
          break;
        case 'submittedVideo':
          this.messages('#messages-video',3500)
          break;
        case 'editVideo':
          this.messages('#messages-edit-video',3500)
          break;
        case 'deleteVideo':
          this.messages('#messages-delete-video',3500)
          break;
        case 'noVideo':
          this.messages('#messages-no-video',4000)
          break;
        case 'submittedPost':
          this.messages('#messages-post',3500)
          break;
        case 'editPost':
          this.messages('#messages-post',3500)
          break;
        case 'deletePost':
          this.messages('#messages-post',3500)
          break;
        case 'noPost':
          this.messages('#messages-no-post',4000)
          break;
        case 'noApparel':
          this.messages('#messages-no-apparel',4000);
          break;
        case 'noTechnology':
          this.messages('#messages-no-technology',4000);
          break;
        case 'updateInfo':
          this.messages('#messages-profile-info',3500)
          break;
        case 'updatedBio':
          this.messages('#messages-profile-bio',3500)
          break;
        case 'locked':
          this.messages('#messages-locked',6000)
          break;
        case 'unsupported':
          this.messages('#messages-unsupported',3500);
          break;
        case 'needInfo':
          this.messages('#messages-need-info',3500);
          break;
        case 'addedTracking':
          this.messages('#messages-tracking',3500);
          break;
        case 'updateVotes':
          this.messages('#messages-update-votes', 3500);
          break;
        case 'submittedTechnology':
          this.messages('#message-submitted-technology',3500);
          break;
        case 'updatedTechnology':
          this.messages('#messages-updated-technology', 3500);
          break;
        case 'submittedApparel':
          this.messages('#messages-submitted-apparel', 3500);
          break;
        case 'updatedApparel':
          this.messages('#messages-updated-apparel',3500);
          break;
        case 'verifiedEmail':
          this.messages('#messages-verified-email',3500);
          break;
        case 'failedEmailVerify':
          this.messages('#messages-failed-email-verify',3500);
          break;
        case 'noUser':
          this.messages('#messages-no-user',4000);
          break;
        case 'sessionEnd':
          this.messages('#messages-session-end',4000);
          break;
        case 'removedPost':
          this.messages('#messages-removed-post', 4000);
          break;
      }
      messageData.clearMessages();
    }    
  }
  setMessages(message){
    messageData.setMessages(message);
    this.checkMessages();
  }
  clearMessage(value,duration){
     setTimeout(() => {
        $(value).fadeOut();
        messageData.clearIndex();
      }, duration);
  }
  getLoggedIn(){
    return `Successfully logged in. Welcome, ${localStorage.getItem('username')}.`
  }
  getRegistered(){
    return `Successfully registered. Welcome, ${localStorage.getItem('username')}.`
  }
  messages(value,duration){
    $(value).attr('style',`display:block;z-index:${messageData.getIndex()} !important`);
    messageData.setIndex();
    this.clearMessage(value,duration);
  }
  setName(){
    this.name = localStorage.getItem('username');
  }
}