import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';

import { AceEditorModule } from 'ng2-ace-editor';
import { AcordionComponent } from './elements/blocks/acordion/acordion.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AutoloadModulesService } from './services/autoload-modules-service/autoload-modules.service';
import { BreadcrumbComponent } from '@components/breadcrumb/breadcrumb.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonComponent } from './elements/forms/button/button.component';
import { CheckboxComponent } from './elements/forms/checkbox/checkbox.component';
import { ClickOutsideModule } from 'ng4-click-outside';
import { CollapsibleModule } from 'angular2-collapsible';
import { ContextMenuComponent } from '@components/context-menu/context-menu.component';
import { ContextMenuModule } from 'ngx-contextmenu';
import { DebugPipe } from '@pipes/debug/debug.pipe';
import { DynFormModule } from 'app/elements/forms/dynform/dyn-form.module';
import { EditorComponent } from '@components/editor/editor.component';
import { EditorService } from '@services/editor-service/editor.service';
import { EditorViewComponent } from './components/editor/views/editor-view/editor-view.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ImageModalComponent } from './elements/xedit/image/image-modal/image-modal.component';
import { ImagesModule } from 'lib/images';
import { InputAcordionComponent } from './elements/forms/input-acordion/input-acordion.component';
import { KeysPipe } from '@pipes/keys/keys.pipe';
import { ListboxComponent } from './elements/forms/listbox/listbox.component';
import { MetadataViewComponent } from './components/editor/views/metadata-view/metadata-view.component';
import { MultiInputAcordionComponent } from './elements/forms/multi-input-acordion/multi-input-acordion.component';
import { MultiInputComponent } from '@elements/forms/multi-input/multi-input.component';
import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NodeFactoryService } from './factories/node-factory.service';
import { NodeService } from './services/node-service/node.service';
import { PropertiesAreaComponent } from '@components/editor/properties-area/properties-area.component';
import { PropertiesGlobalViewComponent } from '@components/taskbar/properties-global-view/properties-global-view.component';
import { PropertiesLocalViewComponent } from '@components/editor/properties-area/properties-local-view/properties-local-view.component';
import { PropertiesToolbarComponent } from './components/editor/properties-area/properties-toolbar/properties-toolbar.component';
import { ResourceService } from './services/resource/resource.service';
import { RuntimeHtmlCompilerComponent } from './core/runtime-html-compiler/runtime-html-compiler.component';
import { SafeHtmlPipe } from './pipes/inner-html/safe-html.pipe';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { StateControllerComponent } from './components/taskbar/state-controller/state-controller.component';
import { StateService } from '@services/state-service/state.service';
import { TaskbarComponent } from '@components/taskbar/taskbar.component';
import { TextViewComponent } from '@components/editor/views/text-view/text-view.component';
import { TreeComponent } from './elements/blocks/tree/tree.component';
import { TreeModalComponent } from './elements/blocks/tree-modal/tree-modal.component';
import { TreeModule } from 'angular-tree-component';
import { UrlPipe } from '@pipes/url/url.pipe';
import { XDamModule } from '@ximdex/xdam';
import { XdamComponent } from './elements/xdam/xdam.component';

@NgModule({
    declarations: [
        AppComponent,
        TaskbarComponent,
        EditorComponent,
        PropertiesLocalViewComponent,
        PropertiesGlobalViewComponent,
        TextViewComponent,
        UrlPipe,
        DebugPipe,
        KeysPipe,
        ContextMenuComponent,
        BreadcrumbComponent,
        PropertiesAreaComponent,
        MultiInputComponent,
        MultiInputAcordionComponent,
        InputAcordionComponent,
        AcordionComponent,
        ButtonComponent,
        CheckboxComponent,
        ListboxComponent,
        StateControllerComponent,
        TreeModalComponent,
        TreeComponent,
        MetadataViewComponent,
        EditorViewComponent,
        RuntimeHtmlCompilerComponent,
        PropertiesToolbarComponent,
        ImageModalComponent,
        SafeHtmlPipe,
        XdamComponent
    ],
    imports: [
        /* 3rd party components */
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        AceEditorModule,
        NgxLoadingModule.forRoot({
            animationType: ngxLoadingAnimationTypes.circleSwish,
            backdropBackgroundColour: 'rgba(0, 0, 0, 0.5)',
            primaryColour: '#00a397',
            secondaryColour: '#00a397',
            tertiaryColour: '#00a397'
        }),
        ContextMenuModule.forRoot(),
        ClickOutsideModule,
        AngularDraggableModule,
        CollapsibleModule,
        HttpClientModule,
        SimpleNotificationsModule.forRoot(),
        TreeModule.forRoot(),
        NgxSmartModalModule.forRoot(),
        FontAwesomeModule,
        DynFormModule,
        ImagesModule,
        XDamModule
    ],
    providers: [EditorService, StateService, ResourceService, AutoloadModulesService, NodeService, NodeFactoryService],
    bootstrap: [AppComponent]
})
export class AppModule {}
