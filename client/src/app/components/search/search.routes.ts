import { Routes, RouterModule }  from '@angular/router';

import {SearchComponent} from './search.component';
import {SearchAllComponent} from './all/search.all.component';

const searchRouters: Routes = [
  {
    path: 'search',
    component: SearchComponent,
    children: [
    {
    path: '',
    component: SearchAllComponent
    }
   ]
  }
];
export const SearchRoutes = RouterModule.forChild(searchRouters);