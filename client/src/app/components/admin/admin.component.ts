import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import {AdminGuard} from '../../services/admin.guard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'admin',
  templateUrl: 'admin.component.html'
})

export class AdminComponent implements OnInit {
	constructor(private _admin: AdminGuard, private _router: Router){};
	ngOnInit(){
		if(!this._admin.isAdmin()){this._router.navigate(['/']);}
	};
}