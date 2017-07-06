import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {ApparelRoutes} from './apparel.routes';

import {SharedModule} from '../../share.module';
import {ApparelComponent} from './apparel.component';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';
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

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	ApparelRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
    	ApparelComponent,
        ApparelAllComponent,
        ApparelCategoryComponent,
        ApparelPostComponent,
        ApparelFormComponent,
        ApparelEditComponent,
        // AccessoriesComponent,
        // OuterwearComponent,
        // PantsComponent,
        // ShirtsComponent,
        // ShoesComponent
    ]

})

export class ApparelModule {}