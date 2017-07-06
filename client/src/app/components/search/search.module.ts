import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {SearchRoutes} from './search.routes';
import {SharedModule} from '../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

import {SearchComponent} from './search.component';
import {SearchAllComponent} from './all/search.all.component';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	SearchRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
    	SearchComponent,
        SearchAllComponent
    ]

})

export class SearchModule {}