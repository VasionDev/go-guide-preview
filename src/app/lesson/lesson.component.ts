import { WordpressService } from "./../services/wordpress.service";
import { DataService } from "./../services/data.service";
import { ModalService } from "./../services/modal.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { trigger, transition, animate, style } from "@angular/animations";
import { TranslateService } from "@ngx-translate/core";

let IndexArray = [];
let LessonArray = [];
declare let apiUrl: any;

@Component({
  selector: "app-lesson",
  templateUrl: "./lesson.component.html",
  styleUrls: ["./lesson.component.css"],
  animations: [
    trigger("slideInOut", [
      transition(":enter", [
        style({ transform: "translateX(-100%)" }),
        animate("200ms ease-in", style({ transform: "translateX(0%)" }))
      ])
    ])
  ]
})
export class LessonComponent implements OnInit {
  indexLesson: any;
  indexPost: any;
  posts: any;
  count = 0;
  completed = false;
  completedToolName: any;
  completedLesson: any[] = [];
  completedIndex: any[] = [];
  incompleteLesson: any[] = [];
  redirectUrl: any;
  userLoggedIn: any;
  inviteEmail: any;
  invitePageURL: any;
  emailMessage: any = "";
  systemOS: any;
  logoutTo: any = "";
  remainSingleLesson: any = "";
  homeParam = "";
  catParam = "";

  constructor(
    private data: DataService,
    private wp: WordpressService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.logoutTo = apiUrl;
    this.getMobileOperatingSystem();

    this.data.currentData.subscribe((data: any) => {
      this.posts = data;
    });

    this.route.queryParamMap.subscribe(params => {
      this.indexPost = +params.get("module");
      this.indexLesson = params.get("lesson");
      this.homeParam = params.get("lang");
      this.catParam = params.get("category");

      if (this.homeParam === null) {
        this.translate.use("en");
      } else {
        this.translate.use(this.homeParam);
      }
    });

    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });

    const user = JSON.parse(localStorage.getItem("signInStatus"));
    if (user === null || user === "") {
      this.userLoggedIn = false;
    } else {
      this.userLoggedIn = true;
    }

    this.completedTask();
    window.scrollTo(0, 0);
  }

  closeModal(id: string) {
    this.modalService.close(id);
    this.emailMessage = "";
  }

  onClickResource() {
    this.data.nameChange("ResourceComponent");
  }

  onClickComplete(value: boolean) {
    if (value) {
      this.completeChange(this.indexPost, this.indexLesson);
    } else {
      this.completeRemove(this.indexPost, this.indexLesson);
    }
  }

  onClickNewComplete(postID: any, lessonID: any, lessonList: any) {
    this.completeChange(this.indexPost, this.indexLesson);
    const currentCompletedLessons = JSON.parse(localStorage.getItem("Lesson"));
    if (currentCompletedLessons.includes(lessonID)) {
      console.log(lessonID, "already exists");
      for (const lesson of lessonList) {
        if (!currentCompletedLessons.includes(lesson.lesson_id)) {
          if (this.homeParam !== "en") {
            this.router.navigate(["/"], {
              queryParams: {
                lang: this.homeParam,
                category: this.catParam,
                module: postID,
                lesson: lesson.lesson_id
              }
            });
          } else {
            this.router.navigate(["/"], {
              queryParams: {
                category: this.catParam,
                module: postID,
                lesson: lesson.lesson_id
              }
            });
          }
          break;
        }
      }
    } else {
      if (this.homeParam !== "en") {
        this.router.navigate(["/"], {
          queryParams: {
            lang: this.homeParam,
            category: this.catParam,
            module: postID,
            lesson: lessonID
          }
        });
      } else {
        this.router.navigate(["/"], {
          queryParams: {
            category: this.catParam,
            module: postID,
            lesson: lessonID
          }
        });
      }
    }
    window.scrollTo(0, 0);
  }

  lessonTitleShortener(title: string) {
    let newTitle: string;
    if (title.length > 30) {
      newTitle = title.substr(0, 30) + "...";
    } else {
      newTitle = title;
    }
    return newTitle;
  }

  onClickSignOut() {
    localStorage.removeItem("signInStatus");
    localStorage.removeItem("Index");
    localStorage.removeItem("Lesson");
    localStorage.removeItem("UserID");
    // this.router.navigate(['/']);
    this.wp.logout().subscribe((data: any) => {
      // this.data.nameChange('AppComponent');
      window.location.href = this.logoutTo;
    });

    /*this.router.navigateByUrl('/?lesson', { skipLocationChange: false }).then(() => {
      this.router.navigate(['/']);
      this.data.nameChange('AppComponent');
    });*/
  }

  onClickCompleteAll(postIndex: any, postID: any) {
    const lessonLists = this.posts[postIndex].lesson;
    const completeLesson = JSON.parse(localStorage.getItem("Lesson"));
    if (completeLesson != null) {
      for (let i = 0; i < lessonLists.length - 1; i++) {
        if (!completeLesson.includes(lessonLists[i].lesson_id)) {
          this.incompleteLesson.push(lessonLists[i]);
        }
      }
    } else {
      this.incompleteLesson = lessonLists.slice(0, lessonLists.length - 1);
    }

    if (!this.incompleteLesson.length) {
      this.completeChange(this.indexPost, this.indexLesson);
      this.completedToolName = this.posts[postIndex].learnTitle;
      this.modalService.open("lesson-modal");

      if (postIndex < this.posts.length - 1) {
        localStorage.setItem(
          "LastLesson",
          JSON.stringify(this.posts[postIndex + 1].learnID)
        );
      }
    }
  }

  onClickCompleteLastLesson(postIndex: any, postID: any) {
    this.completeChange(this.indexPost, this.indexLesson);
    this.completedToolName = this.posts[postIndex].learnTitle;
    localStorage.removeItem("LastLesson");
    this.modalService.open("lesson-modal");
  }

  getTheLesson(learnID: any, lessonID: any) {
    this.incompleteLesson = [];
    this.router.navigate(["/"], {
      queryParams: { module: learnID, lesson: lessonID }
    });
  }

  onClickLeft() {
    if (this.homeParam !== "") {
      this.router.navigate(["/"], {
        queryParams: { lang: this.homeParam, category: this.catParam }
      });
      this.data.nameChange("HomeComponent");
    } else {
      this.router.navigate(["/"]);
      this.data.nameChange("HomeComponent");
    }
  }

  completedTask() {
    this.completedLesson = JSON.parse(localStorage.getItem("Lesson"));
    this.completedIndex = JSON.parse(localStorage.getItem("Index"));

    if (this.completedIndex !== null && this.completedLesson !== null) {
      const indexes = [];
      let indexOfArray: number;
      for (
        indexOfArray = 0;
        indexOfArray < this.completedIndex.length;
        indexOfArray++
      ) {
        if (this.completedIndex[indexOfArray] === this.indexPost) {
          indexes.push(indexOfArray);
        }
      }
      let newIndex: number;
      for (newIndex = 0; newIndex < indexes.length; newIndex++) {
        if (this.completedLesson[indexes[newIndex]] === this.indexLesson) {
          this.completed = true;
        }
      }
    }
  }

  completeChange(completedIndex: any, completedLesson: any) {
    LessonArray = JSON.parse(localStorage.getItem("Lesson"));
    IndexArray = JSON.parse(localStorage.getItem("Index"));
    if (LessonArray === null && IndexArray === null) {
      IndexArray = [];
      LessonArray = [];
    }

    if (!LessonArray.includes(completedLesson)) {
      IndexArray.push(completedIndex);
      LessonArray.push(completedLesson);
    }

    localStorage.setItem("Lesson", JSON.stringify(LessonArray));
    localStorage.setItem("Index", JSON.stringify(IndexArray));
    const UserId = localStorage.getItem("UserID");
    if (UserId !== null) {
      this.wp
        .saveData({
          userId: UserId,
          indexArray: IndexArray,
          lessonArray: LessonArray
        })
        .subscribe(
          (res: any) => {
            // console.log(res);
            const value = JSON.parse(res);
            if (value.success === true) {
              this.completed = true;
              console.log("saved");
            } else {
              this.completed = false;
            }
          },
          (err: any) => {
            console.log("add", err);
            this.completed = false;
          }
        );
    } else {
      console.log("userID not found");
      this.completed = true;
    }
  }

  completeRemove(removedIndex: any, removedLesson: any) {
    LessonArray = JSON.parse(localStorage.getItem("Lesson"));
    IndexArray = JSON.parse(localStorage.getItem("Index"));
    if (LessonArray === null && IndexArray === null) {
      IndexArray = [];
      LessonArray = [];
    }
    const indexRemoved = IndexArray.indexOf(removedIndex);
    if (indexRemoved > -1) {
      IndexArray.splice(indexRemoved, 1);
    }
    const lessonRemoved = LessonArray.indexOf(removedLesson);
    if (lessonRemoved > -1) {
      LessonArray.splice(lessonRemoved, 1);
    }
    localStorage.setItem("Lesson", JSON.stringify(LessonArray));
    localStorage.setItem("Index", JSON.stringify(IndexArray));
    const UserId = localStorage.getItem("UserID");
    if (UserId !== null) {
      this.wp
        .saveData({
          userId: UserId,
          indexArray: IndexArray,
          lessonArray: LessonArray
        })
        .subscribe(
          (res: any) => {
            const value = JSON.parse(res);
            if (value.success === true) {
              this.completed = false;
            } else {
              this.completed = true;
            }
          },
          (err: any) => {
            console.log("remove", err);
            this.completed = true;
          },
          () => this.data.nameChange("HomeComponent")
        );
    } else {
      console.log("userID not found");
      this.completed = false;
      setTimeout(() => this.data.nameChange("HomeComponent"), 1000);
    }
  }

  /*openInviteModal() {
    this.modalService.open('invite-modal');
  }*/

  onInviteLesson() {
    this.data.nameChange("InviteComponent");
  }

  /*inviteByEmail() {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.inviteEmail)) {

      this.invitePageURL = 'https://challenge.com/preview/member'+this.router.url;
      console.log(this.inviteEmail, this.invitePageURL);
      let mailData = {'email_to' : this.inviteEmail, 'share_url' : this.invitePageURL};
      this.wp.sendMail(mailData).subscribe((res:any) => {

        let result = JSON.parse(res);
        if(result.act == 'success') {
          this.emailMessage = 'Email send successfully';
        } else {
          this.emailMessage = 'Email not send';
        }
      });
    }else {
      this.emailMessage = 'Invalid Email Address';
    }
  }*/

  /*shareLinkOnSocial(name) {
    let shareLink = ''
    this.invitePageURL = 'https://challenge.com/preview/member'+this.router.url;
    this.invitePageURL = encodeURIComponent(this.invitePageURL);
    if(name == 'facebook') {
      shareLink = 'https://www.facebook.com/sharer/sharer.php?u='+this.invitePageURL;
    } else {
      shareLink = 'https://twitter.com/share?url='+this.invitePageURL;
    }

    window.open(shareLink, '', 'width=600, height=400, scrollbars=no');
  }*/

  getMobileOperatingSystem() {
    let userAgent = navigator.userAgent || navigator.vendor;

    if (/windows phone/i.test(userAgent)) {
    } else if (/android/i.test(userAgent)) {
      this.systemOS =
        "https://play.google.com/store/apps/details?id=com.pruvit&hl=en";
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      this.systemOS =
        "https://itunes.apple.com/us/app/pruvit-pulse/id1097690467?mt=8";
    } else {
      this.systemOS =
        "https://itunes.apple.com/us/app/pruvit-pulse/id1097690467?mt=8";
    }
  }

  shareNavigatorAPI() {
    let newVariable: any;

    newVariable = window.navigator;
    console.log(window.location.href);

    if (newVariable && newVariable.share) {
      // Web Share API is supported
      console.log("Web Share API is supported");
      newVariable
        .share({
          title: "Challenge Member",
          text: "",
          url: window.location.href
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(err => {
          console.log(`Couldn't share because of`, err.message);
        });
    } else {
      // Fallback
      console.log("Fallback");
    }
  }

  getNextLesson(postID: any, nextLesson: any, lessonList: any) {
    let nextLessonTitle = "";
    // console.log(nextLesson.lesson_id)
    let currentCompletedLessons = JSON.parse(localStorage.getItem("Lesson"));
    if (currentCompletedLessons.includes(nextLesson.lesson_id)) {
      // console.log('included');
      for (const lesson of lessonList) {
        if (
          !currentCompletedLessons.includes(lesson.lesson_id) &&
          lesson.lesson_id != this.indexLesson
        ) {
          nextLessonTitle = this.lessonTitleShortener(lesson.ques);
          break;
        }
      }
    } else {
      nextLessonTitle = this.lessonTitleShortener(nextLesson.ques);
    }
    if (
      nextLessonTitle == "" &&
      !currentCompletedLessons.includes(this.indexLesson)
    ) {
      this.remainSingleLesson = this.indexLesson;
      console.log("last lesson", this.remainSingleLesson);
    }
    return nextLessonTitle;
  }
}
