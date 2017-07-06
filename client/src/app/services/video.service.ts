import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class VideoService {
  video:any=[];
  videoChange: EventEmitter<string> = new EventEmitter<string>();
  constructor() {}
  change(video){
    this.video = video;
    this.videoChange.next(this.video);
  }
}