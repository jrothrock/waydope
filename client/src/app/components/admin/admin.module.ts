import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {AdminRoutes} from './admin.routes';
import {AdminComponent} from './admin.component';
import {AdminUsersComponent} from './users/admin.users.component';
import {AdminBotsComponent} from './bots/admin.bots.component';
import {AdminUserDetailsComponent} from './users/user-details/admin.user.details.component';
import {AdminMainComponent} from './main/admin.main.component';
import {AdminSidebarComponent} from './sidebar/admin.sidebar.component';
import {AdminMusicComponent} from './music/admin.music.component';
import {AdminMusicDetailsComponent} from './music/music-details/admin.music.details.component';
import {AdminNewsComponent} from './news/admin.news.component';
import {AdminNewsDetailsComponent} from './news/news-details/admin.news.details.component';
import {AdminVideosComponent} from './videos/admin.videos.component';
import {AdminVideoDetailsComponent} from './videos/video-details/admin.video.details.component';
import {AdminMessageComponent} from './messages/admin.messages.component';
import {AdminMessageDetailsComponent} from './messages/message-details/admin.message.details.component';
import {AdminApplicationsComponent} from './applications/admin.applications.component';
import {AdminApplicationDetailsComponent} from './applications/application-details/admin.application.details.component';
import {AdminPartnersComponent} from './partners/admin.partners.component';
import {AdminPartnerDetailsComponent} from './partners/partner-details/admin.partner.details.component';
import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';
import {AdminNewPostsComponent} from './new/posts/admin.new.posts.component';
import {AdminNewFlagsComponent} from './new/flags/admin.new.flags.component';
import {AdminNewReportsComponent} from './new/reports/admin.new.reports.component';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	AdminRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
    	AdminComponent,
    	AdminUsersComponent,
        AdminBotsComponent,
    	AdminUserDetailsComponent,
    	AdminMainComponent,
        AdminSidebarComponent,
        AdminMusicComponent,
        AdminMusicDetailsComponent,
        AdminNewsComponent,
        AdminNewsDetailsComponent,
        AdminVideosComponent,
        AdminVideoDetailsComponent,
        AdminMessageComponent,
        AdminMessageDetailsComponent,
        AdminApplicationsComponent,
        AdminApplicationDetailsComponent,
        AdminPartnersComponent,
        AdminPartnerDetailsComponent,
        AdminNewFlagsComponent,
        AdminNewReportsComponent,
        AdminNewPostsComponent
    ]

})

export class AdminModule {}