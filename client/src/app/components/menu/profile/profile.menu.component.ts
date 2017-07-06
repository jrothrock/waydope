import { Component, OnInit,EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import 'angular2-materialize';
@Component({
  selector: 'profile_menu',
  templateUrl: 'profile.menu.component.html',
})

export class ProfileMenuComponent implements OnInit {
	close = new EventEmitter();
	open = new EventEmitter();
	offset:number=0;
	currentUser:string;
	constructor(){
    };
	ngOnInit(){
		this.currentUser = localStorage.getItem('username') || '';
	};
	mouseLeft(){
		this.close.emit('message');
	}
	mouseEnter(){
		this.open.emit('message');
	}
	clickedLink(){
		this.close.emit('message');
	}
}