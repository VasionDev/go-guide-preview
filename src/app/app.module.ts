import { HttpClient } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { NgCircleProgressModule } from "ng-circle-progress";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { OptionsComponent } from "./options/options.component";
import { LessonComponent } from "./lesson/lesson.component";
import { ResourceComponent } from "./resource/resource.component";
import { ModalComponent } from "./modal.component";
import { ModalService } from "./services/modal.service";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { MouseWheelDirective } from "./mouse-wheel.directive";
import { ExperienceComponent } from "./experience/experience.component";
import { ExperienceLessonComponent } from "./experience-lesson/experience-lesson.component";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { SidebarModule } from "ng-sidebar";
import { InviteComponent } from "./invite/invite.component";
import { AlertModule } from "ngx-bootstrap/alert";
import { ClipboardModule } from "ngx-clipboard";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CategoryComponent } from "./category/category.component";
import { LibraryComponent } from "./library/library.component";
import { LibraryCategoryComponent } from "./library-category/library-category.component";
import { LibraryItemComponent } from "./library-item/library-item.component";
import { SearchPipe } from "./search.pipe";
import { LibrarySearchComponent } from "./library-search/library-search.component";
import { LibraryFavoritesComponent } from "./library-favorites/library-favorites.component";

const routes: Routes = [{ path: "", component: HomeComponent }];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    OptionsComponent,
    LessonComponent,
    ResourceComponent,
    ModalComponent,
    MouseWheelDirective,
    ExperienceComponent,
    ExperienceLessonComponent,
    InviteComponent,
    CategoryComponent,
    LibraryComponent,
    LibraryCategoryComponent,
    LibraryItemComponent,
    SearchPipe,
    LibrarySearchComponent,
    LibraryFavoritesComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SlickCarouselModule,
    RouterModule.forRoot(routes),
    NgCircleProgressModule.forRoot({}),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    ButtonsModule.forRoot(),
    ProgressbarModule.forRoot(),
    SidebarModule.forRoot(),
    AlertModule.forRoot(),
    ClipboardModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  entryComponents: [
    HomeComponent,
    OptionsComponent,
    LoginComponent,
    LessonComponent,
    ResourceComponent,
    ExperienceComponent,
    ExperienceLessonComponent,
    InviteComponent,
    CategoryComponent,
    LibraryComponent,
    LibraryCategoryComponent,
    LibraryItemComponent,
    LibrarySearchComponent,
    LibraryFavoritesComponent,
  ],
  providers: [ModalService],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
