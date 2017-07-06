import { NgModule }       from '@angular/core';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

import {ProfileRoutes} from './profile.routes';
import { ProfileComponent } from './profile.component';
import {ProfileComponentUsers} from './users/profile.users.component';
import {ProfileSettingsComponent} from './settings/profile.settings.component';
import {ProfileOrdersComponent} from './orders/profile.orders.component';
import {ProfileOrderComponent} from './orders/order/profile.order.component';
import {ProfileMusicComponent} from './music/profile.music.component';
import {ProfileTechnologyComponent} from './technology/profile.technology.component';
import {ProfileApparelComponent} from './apparel/profile.apparel.component';
import {ProfileCommentsComponent} from './comments/profile.comments.component';
import {ProfileVideosComponent} from './videos/profile.videos.component';
import {LightBoxComponent} from '../lightbox/lightbox.component';
import {SharedModule} from '../../share.module';
import { CommonModule }   from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutes,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ProfileComponent,
    ProfileComponentUsers,
    ProfileSettingsComponent,
    ProfileOrdersComponent,
    ProfileOrderComponent,
    ProfileMusicComponent,
    ProfileTechnologyComponent,
    ProfileApparelComponent,
    ProfileCommentsComponent,
    ProfileVideosComponent
  ]

  // providers: [
  //   CrisisService,
  //   CrisisDetailResolve
  // ]
})

export class ProfileModule {}
