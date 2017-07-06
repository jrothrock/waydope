import { Routes, RouterModule }  from '@angular/router';
import {AdminComponent} from './admin.component';
import {AdminMainComponent} from './main/admin.main.component';
import {AdminUsersComponent} from './users/admin.users.component';
import {AdminBotsComponent} from './bots/admin.bots.component';
import {AdminUserDetailsComponent} from './users/user-details/admin.user.details.component';
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
import {AdminNewPostsComponent} from './new/posts/admin.new.posts.component';
import {AdminNewFlagsComponent} from './new/flags/admin.new.flags.component';
import {AdminNewReportsComponent} from './new/reports/admin.new.reports.component';
const adminRouters: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
        {
         path: 'users',
         component: AdminUsersComponent
        },
        {
         path: 'bots',
         component: AdminBotsComponent
        },
        {
         path: 'messages',
         component: AdminMessageComponent
        },
        {
         path: 'messages/:id',
         component: AdminMessageDetailsComponent
        },
        {
         path: 'users/:id',
         component: AdminUserDetailsComponent
        },
        {
         path: 'music',
         component: AdminMusicComponent
        },
        {
         path: 'music/:id',
         component: AdminMusicDetailsComponent
        },
        {
         path: 'news',
         component: AdminNewsComponent
        },
        {
         path: 'news/:id',
         component: AdminNewsDetailsComponent
        },
        {
         path: 'videos',
         component: AdminVideosComponent
        },
        {
         path: 'videos/:id',
         component: AdminVideoDetailsComponent
        },
        {
         path: 'applications',
         component: AdminApplicationsComponent
        },
        {
         path: 'applications/:id',
         component: AdminApplicationDetailsComponent
        },
        {
         path: 'partners',
         component: AdminPartnersComponent
        },
        {
         path: 'partners/:id',
         component: AdminPartnerDetailsComponent
        },
        {
          path: 'posts',
          component: AdminNewPostsComponent
        },
        {
          path: 'flags',
          component: AdminNewFlagsComponent
        },
        {
          path: 'reports',
          component: AdminNewReportsComponent
        },
        {
        path: '',
        component: AdminMainComponent
        }
   ]
  }
];
export const AdminRoutes = RouterModule.forChild(adminRouters);