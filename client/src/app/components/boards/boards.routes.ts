import { Routes, RouterModule }  from '@angular/router';

import {BoardsComponent} from './boards.component';
import {BoardsAllComponent} from './all/boards.all.component';
import {BoardsCategoryComponent} from './category/boards.category.component';
import {BoardsFormComponent} from './form/boards.form.component';
import {BoardsPostComponent} from './post/boards.post.component';
import {BoardsEditComponent} from './edit/boards.edit.component';

const boardsRouters: Routes = [
  {
    path: 'boards',
    component: BoardsComponent,
    children: [
    {
     path: 'form',
     component: BoardsFormComponent
    },
    {
     path: 'edit',
     component: BoardsEditComponent
    },
    {
    path: '',
    component: BoardsAllComponent
    },
    {
     path: ':category',
     component: BoardsCategoryComponent
    },
    {
     path: ':category/:post',
     component: BoardsPostComponent
    },
    {
     path: ':category/:post/:comment',
     component: BoardsPostComponent
    }
   ]
  }
];
export const BoardsRoutes = RouterModule.forChild(boardsRouters);