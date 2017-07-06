import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import {MaterializeDirective} from "angular2-materialize";

import {DevelopersComponent} from './developers.component';
import {DevelopersAPIComponent} from './api/developers.api.component';
import {DevelopersCreditsComponent} from './credits/developers.credits.component';
import {DevelopersMainComponent} from './main/developers.main.component';
import {DevelopersRoutes} from './developers.routes';

import {SharedModule} from '../../../share.module';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	DevelopersRoutes,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        DevelopersComponent,
        DevelopersAPIComponent,
        DevelopersMainComponent,
        DevelopersCreditsComponent
    ]

})

export class DevelopersModule {}