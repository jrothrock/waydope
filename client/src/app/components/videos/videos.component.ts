import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'videos',
  templateUrl: 'videos.component.html',
})

export class VideosComponent implements OnInit {
	isLoggedIn:boolean = false;
	constructor(private _auth:AuthService){};
	ngOnInit(){
		this.isLoggedIn = this._auth.checkToken();
	};
}
