import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import {MaterializeDirective} from "angular2-materialize";

import {BoardsRoutes} from './boards.routes';
import {BoardsComponent} from './boards.component';
import {BoardsAllComponent} from './all/boards.all.component';
import {BoardsCategoryComponent} from './category/boards.category.component';
import {BoardsFormComponent} from './form/boards.form.component';
import {BoardsPostComponent} from './post/boards.post.component';
import {BoardsEditComponent} from './edit/boards.edit.component';

import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	BoardsRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
    	BoardsComponent,
        BoardsCategoryComponent,
        BoardsAllComponent,
        BoardsFormComponent,
        BoardsPostComponent,
        BoardsEditComponent
    ]

})

export class BoardsModule {}