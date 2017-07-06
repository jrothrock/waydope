import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';


@Injectable()
export class NotificationsService {
  notifications:any=[];
  notificationsChange: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}
  change(notifications,logout=null){
    this.notifications = notifications;
    this.notificationsChange.next([this.notifications,logout]);
  }
}