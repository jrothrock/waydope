import { Routes, RouterModule }  from '@angular/router';

import {VideosComponent} from './videos.component';
import {VideosAllComponent} from './all/videos.all.component';
import {VideosCategoryComponent} from './category/videos.category.component';
import {VideoFormComponent} from './form/video.form.component';
import {VideosPostComponent} from './post/videos.post.component';
import {VideosEditComponent} from './edit/videos.edit.component';

const videoRouters: Routes = [
  {
    path: 'videos',
    component: VideosComponent,
    children: [
    {
    path: 'form',
    component: VideoFormComponent
    },
    {
    path: 'edit',
    component: VideosEditComponent
    },
    {
    path: '',
    component: VideosAllComponent,
    },
    {
     path: ':category',
     component: VideosCategoryComponent
    },
    {
     path: ':category/:post',
     component: VideosPostComponent
    },
    {
     path: ':category/:post/:comment',
     component: VideosPostComponent
    }
   ]
  }
];
export const VideoRoutes = RouterModule.forChild(videoRouters);