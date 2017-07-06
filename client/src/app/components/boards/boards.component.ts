import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'boards',
  templateUrl: 'boards.component.html',
})

export class BoardsComponent implements OnInit {
	isLoggedIn:boolean=false;
	constructor(private _auth: AuthService){};
	ngOnInit(){
		this.isLoggedIn = this._auth.checkToken();
	};
}
