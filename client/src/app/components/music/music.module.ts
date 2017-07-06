import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {MusicRoutes} from './music.routes';

import {SharedModule} from '../../share.module';
import {MusicComponent} from './music.component';
import { FormsModule,ReactiveFormsModule }    from '@angular/forms';

import {MusicFormComponent} from './form/music.form.component';
import {MusicAllComponent} from './all/music.all.component';
import {MusicCategoryComponent} from './category/music.category.component';
import {MusicPostComponent} from './post/music.post.component';
import {MusicEditComponent} from './edit/music.edit.component';


@NgModule({
	imports: [
    	CommonModule,
    	SharedModule,
    	MusicRoutes,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
    	MusicComponent,
        MusicAllComponent,
        MusicCategoryComponent,
        MusicFormComponent,
        MusicPostComponent,
        MusicEditComponent
    ]

})

export class MusicModule {}