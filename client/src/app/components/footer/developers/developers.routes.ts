import { Routes, RouterModule }  from '@angular/router';
import {DevelopersComponent} from './developers.component';
import {DevelopersAPIComponent} from './api/developers.api.component';
import {DevelopersMainComponent} from './main/developers.main.component';
import {DevelopersCreditsComponent} from './credits/developers.credits.component';

const developersRouters: Routes = [
  {
    path: 'developers',
    component: DevelopersComponent,
    children: [
    {
     path: '',
     component: DevelopersMainComponent
    },
    {
     path: 'api',
     component: DevelopersAPIComponent
    },
    {
     path: 'credits',
     component: DevelopersCreditsComponent
    }
   ]
  }
];
export const DevelopersRoutes = RouterModule.forChild(developersRouters);