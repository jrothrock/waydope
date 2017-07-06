import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import {AuthService} from '../../services/auth.service';
// import {CommentsLoopComponent} from '../comments/loop/comments.loop.component';

@Component({
  selector: 'music',
  templateUrl: 'music.component.html',
  entryComponents: []
})

export class MusicComponent implements OnInit {
	isLoggedIn:boolean=false;
	submittedMusic:boolean = false;
	constructor(private _auth:AuthService){};

	ngOnInit(){
		this.isLoggedIn = this._auth.checkToken();
	};
}
