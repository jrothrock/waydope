import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';


@Injectable()
export class CommentService {
  specific: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}
  viewSpecific(string){
      this.specific.next(string);
  }
}