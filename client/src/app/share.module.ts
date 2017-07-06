import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {HttpModule} from "@angular/http";
import { CommonModule }   from '@angular/common';
import {SafeStyle} from './pipes/safe-style.pipe';
import {SafeUrl} from './pipes/safe-url.pipe';
import {Safe} from './pipes/safe-html.pipe';
import {CommentsComponent} from './components/comments/comments.component';
import {CommentsLoopComponent} from './components/comments/loop/comments.loop.component';
import {CommentsFormComponent} from './components/comments/form/comments.form.component';
import {CommentsReportComponent} from './components/comments/report/comments.report.component';
import {CommentsDeleteComponent} from './components/comments/delete/comments.delete.component';
import {CommentsAdminComponent} from './components/comments/admin/comments.admin.component';
import {MaterializeModule} from "angular2-materialize";
import {SystemPostsModalComponent} from './components/system/posts/modal.component'
import {AdminPostsModalComponent} from './components/system/admin/admin.posts.modal.component'
import {LightBoxComponent} from './components/lightbox/lightbox.component';

@NgModule({
    imports: [
    	CommonModule,
        HttpModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MaterializeModule,
    ],
    declarations: [
    	Safe,
        SafeUrl,
        SafeStyle,
        CommentsLoopComponent,
        CommentsComponent,
        CommentsFormComponent,
        CommentsReportComponent,
        CommentsDeleteComponent,
        CommentsAdminComponent,
        AdminPostsModalComponent,
        SystemPostsModalComponent,
        LightBoxComponent
    ],
    exports: [
    	Safe,
        SafeUrl,
        SafeStyle,
        CommentsLoopComponent,
        CommentsComponent,
        CommentsFormComponent,
        CommentsReportComponent,
        CommentsDeleteComponent,
        CommentsAdminComponent,
        SystemPostsModalComponent,
        AdminPostsModalComponent,
        MaterializeModule,
        LightBoxComponent
    ]
})
export class SharedModule {}