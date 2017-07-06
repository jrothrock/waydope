import { NgModule }       from '@angular/core';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

import {VideoRoutes} from './videos.routes';
import {VideosComponent} from './videos.component';
import {VideosAllComponent} from './all/videos.all.component';
import {VideosCategoryComponent} from './category/videos.category.component';
import {VideoFormComponent} from './form/video.form.component';
import {VideosPostComponent} from './post/videos.post.component';
import {VideosEditComponent} from './edit/videos.edit.component';
import {SharedModule} from '../../share.module';
import { CommonModule }   from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    VideoRoutes,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    VideosAllComponent,
    VideosComponent,
    VideosCategoryComponent,
    VideoFormComponent,
    VideosPostComponent,
    VideosEditComponent
  ]

  // providers: [
  //   CrisisService,
  //   CrisisDetailResolve
  // ]
})

export class VideosModule {}
