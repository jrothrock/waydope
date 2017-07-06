import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';


@Injectable()
export class PhotosService {
  photos:any=[];
  photosChange: EventEmitter<string> = new EventEmitter<string>();
  constructor() {}
  change(photos){
    this.photos = photos;
    this.photosChange.next(this.photos);
  }
}