import { Routes, RouterModule }  from '@angular/router';

import {MusicComponent} from './music.component';
import {MusicAllComponent} from './all/music.all.component';
import {MusicCategoryComponent} from './category/music.category.component';
import {MusicFormComponent} from './form/music.form.component';
import {MusicPostComponent} from './post/music.post.component';
import {MusicEditComponent} from './edit/music.edit.component';
const musicRouters: Routes = [
  {
    path: 'music',
    component: MusicComponent,
    children: [
    {
     path: 'form',
     component: MusicFormComponent
    },
    {
      path: 'edit',
      component: MusicEditComponent
    },
    {
    path: '',
    component: MusicAllComponent
    },
    {
     path: ':genre',
     component: MusicCategoryComponent
    },
    {
     path: ':genre/:post',
     component: MusicPostComponent
    },
    {
     path: ':genre/:post/:comment',
     component: MusicPostComponent
    }
   ]
  }
];
export const MusicRoutes = RouterModule.forChild(musicRouters);