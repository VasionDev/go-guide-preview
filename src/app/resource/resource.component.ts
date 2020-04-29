import { DataService } from "./../services/data.service";
import { WordpressService } from "./../services/wordpress.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

declare let apiUrl: any;

@Component({
  selector: "app-resource",
  templateUrl: "./resource.component.html",
  styleUrls: ["./resource.component.css"],
})
export class ResourceComponent implements OnInit {
  posts: any;
  indexLesson: any;
  indexPost: any;
  redirectUrl: any;
  userLoggedIn: any;
  logoutTo: any = "";
  homeParam = "";
  catParam = "";

  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private wp: WordpressService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.logoutTo = apiUrl;
    this.data.currentData.subscribe((data: any) => {
      this.posts = data;
    });

    this.route.queryParamMap.subscribe((params) => {
      this.indexPost = params.get("module");
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
  }

  onClickLeft() {
    if (this.homeParam !== "") {
      this.router.navigate(["/"], {
        queryParams: { lang: this.homeParam, category: this.catParam },
      });
      this.data.nameChange("HomeComponent");
    } else {
      this.router.navigate(["/"]);
      this.data.nameChange("HomeComponent");
    }
  }

  onClickLesson() {
    this.data.nameChange("LessonComponent");
  }

  onNavigate(link: any) {
    window.open(link, "_blank");
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

  onClickHome() {
    this.router.navigate(["/"]);
    this.data.nameChange("HomeComponent");
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
          url: window.location.href,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch((err) => {
          console.log(`Couldn't share because of`, err.message);
        });
    } else {
      // Fallback
      console.log("Fallback");
    }
  }
}
