import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {TechnologyRoutes} from './technology.routes';
import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

import {TechnologyComponent} from './technology.component';
import {TechnologyAllComponent} from './all/technology.all.component';
import {TechnologyCategoryComponent} from './category/technology.category.component';
import {TechnologyEditComponent} from './edit/technology.edit.component';
import {TechnologyFormComponent} from './form/technology.form.component';
import {TechnologyPostComponent} from './post/technology.post.component';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	TechnologyRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
    	TechnologyComponent,
        TechnologyAllComponent,
        TechnologyCategoryComponent,
        TechnologyEditComponent,
        TechnologyFormComponent,
        TechnologyPostComponent
    ]

})

export class TechnologyModule {}