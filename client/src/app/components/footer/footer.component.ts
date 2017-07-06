import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'footer',
  templateUrl: 'footer.component.html',
})

export class FooterComponent implements OnInit {
	constructor(){};
	ngOnInit(){
	};
	date(){
		return new Date().getFullYear()
	}
}