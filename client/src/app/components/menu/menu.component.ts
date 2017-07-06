import { Component, OnInit, ViewChild ,Compiler, ComponentRef, ComponentFactory, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import {AdminGuard} from '../../services/admin.guard.service';
import {SystemMessagesComponent} from '../system/messages/messages.component';
import {AuthService} from '../../services/auth.service';

import {BoardsMenuComponent} from './boards/boards.menu.component';
import {MusicMenuComponent} from './music/music.menu.component';
import {VideosMenuComponent} from './videos/videos.menu.component';
import {ApparelMenuComponent} from './apparel/apparel.menu.component';
import {TechnologyMenuComponent} from './technology/technology.menu.component';
import {ProfileMenuComponent} from './profile/profile.menu.component';
declare var $;
@Component({
  selector: 'menu',
  templateUrl: 'menu.component.html',
  entryComponents: [BoardsMenuComponent,MusicMenuComponent,VideosMenuComponent,ApparelMenuComponent,TechnologyMenuComponent,ProfileMenuComponent],
  providers: [AuthService, SystemMessagesComponent, AdminGuard]
})

export class MenuComponent implements OnInit {
	@ViewChild('boards', {read: ViewContainerRef}) viewContainerRef;
    private boardsMenuFactory: ComponentFactory<any>;
    private musicMenuFactory: ComponentFactory<any>;
    private videosMenuFactory: ComponentFactory<any>;
    private apparelMenuFactory: ComponentFactory<any>;
    private technologyMenuFactory: ComponentFactory<any>;
    private profileMenuFactory: ComponentFactory<any>;
	  isLoggedIn:boolean=false;
    currentUser:string=null;
    isAdmin:any;
    component:any;
    extendedMenuOpen:boolean=false;
    closeSubscription:any;
	constructor(private _auth: AuthService, private _router: Router, private _sysMessages: SystemMessagesComponent, private _admin: AdminGuard, private componentFactoryResolver: ComponentFactoryResolver){
		this.boardsMenuFactory = componentFactoryResolver.resolveComponentFactory(BoardsMenuComponent);
        this.musicMenuFactory = componentFactoryResolver.resolveComponentFactory(MusicMenuComponent);
        this.videosMenuFactory = componentFactoryResolver.resolveComponentFactory(VideosMenuComponent);
        this.apparelMenuFactory = componentFactoryResolver.resolveComponentFactory(ApparelMenuComponent);
        this.technologyMenuFactory = componentFactoryResolver.resolveComponentFactory(TechnologyMenuComponent);
        this.technologyMenuFactory = componentFactoryResolver.resolveComponentFactory(ProfileMenuComponent);
	};
	ngOnInit(){
	    this.currentUser = localStorage.getItem('username') || '';
	    this.isLoggedIn = this._auth.checkToken();
	};

	logout() {
        this._auth.logout()
          .then(() => { 
            this.isLoggedIn = false;
            this.isAdmin = false;
            this._sysMessages.setMessages('loggedout'); 
            // this._messages.setMessages('loggedout');
            this._router.navigate(['/switch', 'home', window.pageYOffset]); //reloads the home component.
          }
        );
    }

    public setLoggedIn(){
      this.isLoggedIn = this._auth.checkToken();
      this.currentUser = localStorage.getItem('username') || '';
      this.isAdmin = this._admin.isAdmin();
    }

    isCurrentRoute(route){
      return this._router.url === route;
    }
    addDropDown(value,type){
        if(value === 1){
          if(this.extendedMenuOpen === true){
            this.component.destroy();
          }
          this.extendedMenuOpen = true;
          switch (type) {
            case 'boards':
              this.component = this.viewContainerRef.createComponent(this.boardsMenuFactory, 0)
              break;
            case 'music': 
              this.component = this.viewContainerRef.createComponent(this.musicMenuFactory, 0)
              break;
            case 'videos':
              this.component = this.viewContainerRef.createComponent(this.videosMenuFactory, 0)
              break;
            case 'apparel':
              this.component = this.viewContainerRef.createComponent(this.apparelMenuFactory, 0)
              break;
            case 'technology':
              this.component = this.viewContainerRef.createComponent(this.technologyMenuFactory, 0)
              break;
            case 'profile':
              this.component = this.viewContainerRef.createComponent(this.profileMenuFactory, 0)
              break;
            default:
              return false;
          }
          let instance = this.component.instance;
          this.closeSubscription = instance.close.subscribe((e) => {
            this.component.destroy();
            this.extendedMenuOpen = false;
            if(this.closeSubscription) this.closeSubscription.unsubscribe();
          })
         } else if(value === 0) {
           // this.component.destroy();
           // this.extendedMenuOpen = false;
         }
    }
    closeDropDown(){
      if(this.component) this.component.destroy();
    }
}
