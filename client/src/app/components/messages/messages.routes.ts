import { Routes, RouterModule }  from '@angular/router';
import {MessagesComponent} from './messages.component';
import {MessagesInboxComponent} from './inbox/messages.inbox.component';
import {MessagesOutboxComponent} from './outbox/messages.outbox.component';
import {MessagesComposeComponent} from './compose/messages.compose.component';

const messagesRouters: Routes = [
  {
    path: 'messages',
    component: MessagesComponent,
    children: [
    {
        path: '',
        redirectTo: 'inbox',
        pathMatch: 'full'
    },
    {
     path: 'inbox',
     component: MessagesInboxComponent
    },
    {
     path: 'outbox',
     component: MessagesOutboxComponent
    },
    {
     path: 'compose',
     component: MessagesComposeComponent
    }
   ]
  }
];
export const MessagesRoutes = RouterModule.forChild(messagesRouters);