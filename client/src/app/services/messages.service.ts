import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class MessagesService {
  inbox:any=[];
  outbox:any=[];
  messagesChange: EventEmitter<any> = new EventEmitter<any>();
  messageOpen: EventEmitter<any> = new EventEmitter<any>();
  constructor(){}
  change(inbox, outbox,logout=null,user=null){
    this.inbox = inbox;
    this.outbox = outbox;
    this.messagesChange.next([inbox, outbox,logout,user]);
  }
  open(user){
      this.messageOpen.next([user]);
  }
}