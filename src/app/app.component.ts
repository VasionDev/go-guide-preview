import { CategoryComponent } from "./category/category.component";
import { WordpressService } from "./services/wordpress.service";
import { DataService } from "./services/data.service";
import { LessonComponent } from "./lesson/lesson.component";
import { LoginComponent } from "./login/login.component";
import { OptionsComponent } from "./options/options.component";
import { Component, OnInit } from "@angular/core";
import { HomeComponent } from "./home/home.component";
import { ResourceComponent } from "./resource/resource.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ExperienceComponent } from "./experience/experience.component";
import { ExperienceLessonComponent } from "./experience-lesson/experience-lesson.component";
import { InviteComponent } from "./invite/invite.component";
import { LibraryComponent } from "./library/library.component";
import { LibraryCategoryComponent } from "./library-category/library-category.component";
import { LibraryItemComponent } from "./library-item/library-item.component";
import { LibrarySearchComponent } from "./library-search/library-search.component";
import { LibraryFavoritesComponent } from "./library-favorites/library-favorites.component";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  myComponent: any;
  allLessonID = [];
  spinner = true;
  experienceLogin = false;
  redirectUrl: any;
  currentLanguage = "en";

  constructor(
    private data: DataService,
    private wp: WordpressService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    localStorage.removeItem("LastLesson");
    // localStorage.removeItem("CompletedTools");
    this.wp.setUserLogin().subscribe(
      (res: any) => {
        const url = JSON.parse(res);
        this.redirectUrl = url.url;
      },
      (err) => {},
      () => {
        this.checkUserAuthentication();
        this.data.$componentName.subscribe((name: any) => {
          if (name === "HomeComponent") {
            this.myComponent = HomeComponent;
          } else if (name === "LessonComponent") {
            this.myComponent = LessonComponent;
          } else if (name === "ResourceComponent") {
            this.myComponent = ResourceComponent;
          } else if (name === "LoginComponent") {
            this.myComponent = LoginComponent;
          } else if (name === "OptionsComponent") {
            this.myComponent = OptionsComponent;
          } else if (name === "ExperienceComponent") {
            this.myComponent = ExperienceComponent;
          } else if (name === "ExperienceLessonComponent") {
            this.myComponent = ExperienceLessonComponent;
          } else if (name === "InviteComponent") {
            this.myComponent = InviteComponent;
          } else if (name === "CategoryComponent") {
            this.myComponent = CategoryComponent;
          } else if (name === "LibraryComponent") {
            this.myComponent = LibraryComponent;
          } else if (name === "LibraryCategoryComponent") {
            this.myComponent = LibraryCategoryComponent;
          } else if (name === "LibraryItemComponent") {
            this.myComponent = LibraryItemComponent;
          } else if (name === "LibrarySearchComponent") {
            this.myComponent = LibrarySearchComponent;
          } else if (name === "LibraryFavoritesComponent") {
            this.myComponent = LibraryFavoritesComponent;
          } else {
            this.myComponent = AppComponent;
          }
        });
      }
    );

    // this.subscribeLessons();
  }

  checkUserAuthentication() {
    this.wp.login().subscribe((user: any) => {
      if (user.mvuser_id !== undefined && user.mvuser_id !== "") {
        localStorage.setItem("UserID", user.mvuser_id);
        localStorage.setItem("UserStatus", user.mvuser_status);
        if (!user.hasOwnProperty("active_smartship")) {
          localStorage.setItem("ActiveSmartship", "");
        } else {
          localStorage.setItem("ActiveSmartship", user.active_smartship);
        }
        console.log(user);
        // console.log(user.mvuser_refCode);
        this.data.saveRefCode(user.mvuser_refCode);
        const value = JSON.parse(user.user_learn_data);
        // console.log(value);
        localStorage.setItem("Index", JSON.stringify(value.indexArray));
        localStorage.setItem("Lesson", JSON.stringify(value.lessonArray));
        localStorage.setItem("signInStatus", JSON.stringify(true));
        localStorage.setItem(
          "completedCategory",
          JSON.stringify(value.categoryCompleted)
        );
        localStorage.setItem("Favorites", JSON.stringify(value.favorites));

        if (
          user.Experience_Session_Token !== undefined &&
          user.Experience_Session_Token !== ""
        ) {
          this.experienceLogin = true;
          localStorage.setItem("experienceStatus", JSON.stringify(true));
        } else {
          localStorage.setItem("experienceStatus", JSON.stringify(""));
        }

        const userInfo = JSON.parse(user.mvuser_info);
        const userLanguage = userInfo.collection[0].language.toLowerCase();
        localStorage.setItem("userLanguage", userLanguage);

        this.subscribeLessons();
      } else {
        window.location.href = this.redirectUrl;
        // this.subscribeLessons();
      }
    });
  }

  subscribeLessons() {
    // console.log('after checking');
    // this.wp.getCategories().subscribe((data: any) => {
    //    console.log(data);
    // });

    this.wp.getPostsWithLanguages().subscribe((postsData) => {
      // this.data.libraryDataChange(libraryData);

      this.data.dataWithLanguagesChange(postsData);
      this.data.languagesChange(Object.keys(postsData));
      this.route.queryParamMap.subscribe((params) => {
        const langParam = params.get("lang");
        if (langParam !== null) {
          this.currentLanguage = params.get("lang");
          if (this.currentLanguage !== "en") {
            this.wp
              .getDownloadModuleWithLanguage(this.currentLanguage)
              .subscribe((library: any) => {
                this.data.libraryDataChange(library);
              });
          }
        } else {
          this.wp.getDownloadModule().subscribe((data: any) => {
            this.data.libraryDataChange(data);
          });
        }
      });
      const postData = JSON.parse(postsData[this.currentLanguage]);

      for (const post of postData) {
        for (const lesson of post.lesson) {
          this.allLessonID.push(lesson.lesson_id);
        }
      }

      const day10Guide = [];
      postData.forEach((post: any) => {
        if (post.hasOwnProperty("category")) {
          post.category.forEach((category: any) => {
            if (category.slug.startsWith("10-day-guide")) {
              day10Guide.push(post);
            }
          });
        }
      });

      this.data.dataChange(day10Guide);
      this.loadComponent();
    });
    // this.wp.getPostsWithLanguages().subscribe(
    //   (data: any) => {
    //     this.data.dataWithLanguagesChange(data);
    //     this.data.languagesChange(Object.keys(data));
    //     this.route.queryParamMap.subscribe((params) => {
    //       const langParam = params.get("lang");
    //       if (langParam !== null) {
    //         this.currentLanguage = params.get("lang");
    //       }
    //     });
    //     const postData = JSON.parse(data[this.currentLanguage]);

    //     for (const post of postData) {
    //       for (const lesson of post.lesson) {
    //         this.allLessonID.push(lesson.lesson_id);
    //       }
    //     }

    //     const day10Guide = [];
    //     postData.forEach((post: any) => {
    //       if (post.hasOwnProperty("category")) {
    //         post.category.forEach((category: any) => {
    //           if (category.slug.startsWith("10-day-guide")) {
    //             day10Guide.push(post);
    //           }
    //         });
    //       }
    //     });

    //     this.data.dataChange(day10Guide);
    //   },
    //   (err) => {},
    //   () => {
    //     this.loadComponent();
    //   }
    // );
  }

  /*loadComponent() {
    this.wp.login().subscribe((user: any) => {
      if (user.mvuser_id !== undefined && user.mvuser_id !== '') {
        const value = JSON.parse(user.user_learn_data);
        localStorage.setItem('Index', JSON.stringify(value.indexArray));
        localStorage.setItem('Lesson', JSON.stringify(value.lessonArray));
        localStorage.setItem('signInStatus', JSON.stringify(true));
        this.subscribeLessons();
      } else {
        window.location.href = this.redirectUrl;
        console.log('checking for user');
      }

      if (user.Experience_Session_Token !== undefined && user.Experience_Session_Token !== '') {
        this.experienceLogin = true;
        localStorage.setItem('experienceStatus', JSON.stringify(true));
      } else {
        localStorage.setItem('experienceStatus', JSON.stringify(''));
      }
    },
    (err) => {},
    () => {
      console.log('checking callback');
      this.spinner = false;
      this.route.queryParamMap.subscribe(params => {

        const pageName = params.get('page');
        const expLessonID = params.get('explesson');
        const lessonID = params.get('lesson');
        if (pageName != null) {
          if ( pageName === 'option') {
            this.data.nameChange('OptionsComponent');
          } else if (pageName === 'experience') {
            if (!this.experienceLogin) {
              window.location.href = `
              https://pg-app-9dfh2kb0auoxwzcgrca8678kjc14dc.scalabl.cloud/v1/authorize?redirectURL=https://challenge.com/preview/member/https://pg-app-9dfh2kb0auoxwzcgrca8678kjc14dc.scalabl.cloud/v1/authorize?redirectURL=https://challenge.com/go/`;
            } else {
              this.data.nameChange('ExperienceComponent');
            }
          }
        } else if (expLessonID != null) {
          this.data.nameChange('ExperienceLessonComponent');
        } else if (lessonID != null) {
          this.data.nameChange('LessonComponent');
        } else {
          this.myComponent = HomeComponent;
        }
      });

      let CompletedLesson = JSON.parse(localStorage.getItem('Lesson'));
      let CompletedPost = JSON.parse(localStorage.getItem('Index'));
      if (CompletedLesson === null && CompletedPost === null) {
        CompletedLesson = [];
        CompletedPost = [];
      }

      CompletedLesson.forEach(lessonID => {
        if ( !this.allLessonID.includes(lessonID)) {
          const removeIndex = CompletedLesson.indexOf(lessonID);
          CompletedLesson.splice(removeIndex, 1);
          CompletedPost.splice(removeIndex, 1);
        }
      });

      // console.log(CompletedLesson, CompletedPost);
      localStorage.setItem('Lesson', JSON.stringify(CompletedLesson));
      localStorage.setItem('Index', JSON.stringify(CompletedPost));

    }
    );
    this.data.$componentName.subscribe((name: any) => {
      if (name === 'HomeComponent') {
        this.myComponent = HomeComponent;
      } else if (name === 'LessonComponent') {
        this.myComponent = LessonComponent;
      } else if (name === 'ResourceComponent') {
        this.myComponent = ResourceComponent;
      } else if (name === 'LoginComponent') {
        this.myComponent = LoginComponent;
      } else if (name === 'OptionsComponent') {
        this.myComponent = OptionsComponent;
      } else if (name === 'ExperienceComponent') {
        this.myComponent = ExperienceComponent;
      } else if (name === 'ExperienceLessonComponent') {
        this.myComponent = ExperienceLessonComponent;
      } else if (name === 'InviteComponent') {
        this.myComponent = InviteComponent;
      } else {
        this.myComponent = AppComponent;
      }
    });
  }*/

  loadComponent() {
    // console.log('checking callback');
    this.spinner = false;
    this.route.queryParamMap.subscribe((params) => {
      const catName = params.get("category");
      const pageName = params.get("page");
      const expLessonID = params.get("explesson");
      const lessonID = params.get("lesson");
      const topicName = params.get("topic");
      const item = params.get("item");
      const module = params.get("module");
      const search = params.get("search");
      const preference = params.get("preference");

      if (pageName != null) {
        if (pageName === "option") {
          this.data.nameChange("OptionsComponent");
        } else if (pageName === "experience") {
          console.log(this.experienceLogin);
          if (!this.experienceLogin) {
            window.location.href = `
            https://pg-app-4sn1wg84isf5h18lb2d73ydf2zhxgr.scalabl.cloud/v1/authorize?redirectURL=https://challenge.com/go/`;
          } else {
            this.data.nameChange("ExperienceComponent");
          }
        }
      } else if (expLessonID != null) {
        this.data.nameChange("ExperienceLessonComponent");
      } else if (lessonID != null) {
        this.data.nameChange("LessonComponent");
      } else if (catName !== null) {
        this.data.nameChange("HomeComponent");
      } else if (item !== null) {
        this.data.nameChange("LibraryItemComponent");
      } else if (topicName !== null) {
        this.data.nameChange("LibraryCategoryComponent");
      } else if (search !== null) {
        this.data.nameChange("LibrarySearchComponent");
      } else if (preference !== null) {
        this.data.nameChange("LibraryFavoritesComponent");
      } else if (module !== null) {
        if (module === "invite") {
          this.data.nameChange("InviteComponent");
        }
        if (module === "library") {
          this.data.nameChange("LibraryComponent");
        }
      } else {
        this.myComponent = CategoryComponent;
      }
    });

    let CompletedLesson = JSON.parse(localStorage.getItem("Lesson"));
    let CompletedPost = JSON.parse(localStorage.getItem("Index"));
    if (CompletedLesson === null && CompletedPost === null) {
      CompletedLesson = [];
      CompletedPost = [];
    }

    CompletedLesson.forEach((lessonID) => {
      if (!this.allLessonID.includes(lessonID)) {
        const removeIndex = CompletedLesson.indexOf(lessonID);
        CompletedLesson.splice(removeIndex, 1);
        CompletedPost.splice(removeIndex, 1);
      }
    });

    // console.log(CompletedLesson, CompletedPost);
    localStorage.setItem("Lesson", JSON.stringify(CompletedLesson));
    localStorage.setItem("Index", JSON.stringify(CompletedPost));

    /*this.data.$componentName.subscribe((name: any) => {
      if (name === 'HomeComponent') {
        this.myComponent = HomeComponent;
      } else if (name === 'LessonComponent') {
        this.myComponent = LessonComponent;
      } else if (name === 'ResourceComponent') {
        this.myComponent = ResourceComponent;
      } else if (name === 'LoginComponent') {
        this.myComponent = LoginComponent;
      } else if (name === 'OptionsComponent') {
        this.myComponent = OptionsComponent;
      } else if (name === 'ExperienceComponent') {
        this.myComponent = ExperienceComponent;
      } else if (name === 'ExperienceLessonComponent') {
        this.myComponent = ExperienceLessonComponent;
      } else if (name === 'InviteComponent') {
        this.myComponent = InviteComponent;
      } else {
        this.myComponent = AppComponent;
      }
    });*/
  }
}
