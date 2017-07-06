import { Routes, RouterModule }  from '@angular/router';
import {ProfileComponent} from './profile.component';
import {ProfileComponentUsers} from './users/profile.users.component';
import {ProfileSettingsComponent} from './settings/profile.settings.component';
import {ProfileOrdersComponent} from './orders/profile.orders.component';
import {ProfileOrderComponent} from './orders/order/profile.order.component';
import {ProfileMusicComponent} from './music/profile.music.component';
import {ProfileTechnologyComponent} from './technology/profile.technology.component';
import {ProfileApparelComponent} from './apparel/profile.apparel.component';
import {ProfileCommentsComponent} from './comments/profile.comments.component';
import {ProfileVideosComponent} from './videos/profile.videos.component';

const profileRouters: Routes = [
  {
    path: 'user',
    component: ProfileComponent,
    children: [
    {
     path: ':user',
     component: ProfileComponentUsers
    },
   {
    path: '',
    component: ProfileComponentUsers
    },
    {
     path: ':user/settings',
     component: ProfileSettingsComponent
    },
    {
     path: ':user/comments',
     component: ProfileCommentsComponent
    },
    {
     path: ':user/music',
     component: ProfileMusicComponent
    },
    {
     path: ':user/videos',
     component: ProfileVideosComponent
    },
    {
     path: ':user/apparel',
     component: ProfileApparelComponent
    },
    {
     path: ':user/technology',
     component: ProfileTechnologyComponent
    },
    {
     path: ':user/orders',
     component: ProfileOrdersComponent
    },
    {
     path: ':user/orders/:order',
     component: ProfileOrderComponent
    }
   ]
  }
];
export const ProfileRoutes = RouterModule.forChild(profileRouters);