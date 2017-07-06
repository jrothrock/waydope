import { Routes, RouterModule }  from '@angular/router';

import {TechnologyComponent} from './technology.component';
import {TechnologyAllComponent} from './all/technology.all.component';
import {TechnologyCategoryComponent} from './category/technology.category.component';
import {TechnologyEditComponent} from './edit/technology.edit.component';
import {TechnologyFormComponent} from './form/technology.form.component';
import {TechnologyPostComponent} from './post/technology.post.component';

const technologyRouters: Routes = [
  {
    path: 'technology',
    component: TechnologyComponent,
    children: [
    {
     path: 'form',
     component: TechnologyFormComponent
    },
    {
      path: 'edit',
      component: TechnologyEditComponent
    },
    {
    path: '',
    component: TechnologyAllComponent
    },
    {
     path: ':category',
     component: TechnologyCategoryComponent
    },
    {
     path: ':category/:subcategory',
     component: TechnologyCategoryComponent
    },
    {
     path: ':category/:subcategory/:post',
     component: TechnologyPostComponent
    },
    {
     path: ':category/:subcategory/:post/:comment',
     component: TechnologyPostComponent
    }
   ]
  }
];
export const TechnologyRoutes = RouterModule.forChild(technologyRouters);