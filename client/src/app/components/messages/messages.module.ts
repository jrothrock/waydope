import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import {MaterializeDirective} from "angular2-materialize";

import {MessagesComponent} from './messages.component';
import {MessagesInboxComponent} from './inbox/messages.inbox.component';
import {MessagesOutboxComponent} from './outbox/messages.outbox.component';
import {MessagesComposeComponent} from './compose/messages.compose.component';
import {MessagesRoutes} from './messages.routes';

import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	MessagesRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        MessagesComponent,
        MessagesInboxComponent,
        MessagesOutboxComponent,
        MessagesComposeComponent
    ]

})

export class MessagesModule {}