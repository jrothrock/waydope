import { Routes, RouterModule }  from '@angular/router';

import {ApparelComponent} from './apparel.component';
import {ApparelAllComponent} from './all/apparel.all.component';
import {ApparelCategoryComponent} from './category/apparel.category.component';
import {ApparelPostComponent} from './post/apparel.post.component';
import {ApparelFormComponent} from './form/apparel.form.component';
import {ApparelEditComponent} from './edit/apparel.edit.component';
// import {AccessoriesComponent} from './accessories/accessories.component';
// import {OuterwearComponent} from './outerwear/outerwear.component';
// import {PantsComponent} from './pants/pants.component';
// import {ShirtsComponent} from './shirts/shirts.component';
// import {ShoesComponent} from './shoes/shoes.component';

const apparelRouters: Routes = [
  {
    path: 'apparel',
    component: ApparelComponent,
    children: [
    {
     path: 'form',
     component: ApparelFormComponent
    },
    {
     path: 'edit',
     component: ApparelEditComponent
    },
    {
    path: '',
    component: ApparelAllComponent
    },
    {
     path: ':category',
     component: ApparelCategoryComponent
    },
    {
     path: ':category/:subcategory',
     component: ApparelCategoryComponent
    },
    {
     path: ':category/:subcategory/:post',
     component: ApparelPostComponent
    },
    {
     path: ':category/:subcategory/:post/:comment',
     component: ApparelPostComponent
    }
   ]
  }
];
export const ApparelRoutes = RouterModule.forChild(apparelRouters);