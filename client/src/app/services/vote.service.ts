/*
    This service is used to communicate with the menus to update their votes.
*/

import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/Rx';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class VoteService {
  all:boolean=false;
  boardsVote: EventEmitter<any> = new EventEmitter<any>();
  musicVote: EventEmitter<any> = new EventEmitter<any>();
  videoVote: EventEmitter<any> = new EventEmitter<any>();
  technologyVote: EventEmitter<any> = new EventEmitter<any>();
  componentVote: EventEmitter<any> = new EventEmitter<any>();
  componentAllVote: EventEmitter<any> = new EventEmitter<any>();
  apparelVote: EventEmitter<any> = new EventEmitter<any>();
  constructor() {}
  change(type, id, average_vote,user_voted,vote_type=null){
      
      switch(type){
          case 'boards':
            this.boardsVote.next([id,average_vote,user_voted])
            break;
          case 'music':
             this.musicVote.next([id,average_vote,user_voted])
             break;
          case 'videos':
            this.videoVote.next([id,average_vote,user_voted])
            break;
          case 'technology':
            this.technologyVote.next([id,average_vote,user_voted])
            break;
          case 'apparel':
            this.apparelVote.next([id,average_vote,user_voted])
            break;
          case 'component':
            if(this.all) this.componentAllVote.next([id,average_vote,user_voted,vote_type])
            else this.componentVote.next([id,average_vote,user_voted])
            break;
          case 'allcomponent':

      }
  }
  isAll(flag){
    // this will bet set to true for the profile user component and the search where there are multiple types of posts.
    // on destruction of the components, this will be set back to false.
    this.all = flag;
  }
}
