import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import 'angular2-materialize';

declare var $;

@Component({
  selector: 'messages',
  templateUrl: 'messages.component.html',
})

export class MessagesComponent implements OnInit {
    names:any=['inbox','outbox','compose']
	constructor(private _router: Router, private _location: Location){};
	ngOnInit(){
         let tab = window.location.pathname.split('/')[2];
         $('ul.message-tabs').tabs('select_tab', `${tab}-messages`);
         if(tab != 'inbox'){
             setTimeout(()=>{
                $(`#messages-tab-inbox`).removeClass('active');
                $(`#messages-tab-${tab}`).addClass('active');
             },10)
         }
	};
    changeRoute(route){
        this._router.navigateByUrl(`/messages/${route}`, { skipLocationChange: true })
        history.replaceState('', '', `/messages/${route}`);
    }
}