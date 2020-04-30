import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { WordpressService } from "./../services/wordpress.service";
import { DataService } from "./../services/data.service";
import { PlatformLocation } from "@angular/common";
import {
  trigger,
  transition,
  animate,
  style,
  state,
} from "@angular/animations";

declare let apiUrl: any;
declare let twitterShareText: any;

@Component({
  selector: "app-invite",
  templateUrl: "./invite.component.html",
  styleUrls: ["./invite.component.css"],
  animations: [
    // the fade-in/fade-out animation.
    trigger("simpleFadeAnimation", [
      // the "in" style determines the "resting" state of the element when it is visible.
      state("in", style({ opacity: 1 })),

      // fade in when created. this could also be written as transition('void => *')
      transition(":enter", [style({ opacity: 0 }), animate(600)]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(":leave", animate(3000, style({ opacity: 0 }))),
    ]),
  ],
})
export class InviteComponent implements OnInit {
  inviteEmail: any;
  invitePageURL: any;
  emailMessage: any = "";
  locationOrigin: any;
  userLoggedIn: any;
  redirectUrl: any;
  loadingState = false;
  showMessage = false;
  refCode: any = "";
  copiedLink = false;
  logoutTo: any = "";
  twitterText: any = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService,
    private wp: WordpressService,
    private platformLocation: PlatformLocation
  ) {}

  ngOnInit() {
    this.logoutTo = apiUrl;
    this.twitterText = twitterShareText;

    let urlInfo = apiUrl.split("//");
    this.refCode = this.data.refCode;

    /*console.log((this.platformLocation as any).location);
    console.log((this.platformLocation as any).location.href);
    console.log((this.platformLocation as any).location.origin);*/

    this.invitePageURL = "https://" + this.refCode + "." + urlInfo[1];

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

  inviteByEmail() {
    //console.log(this.inviteEmail);
    this.emailMessage = "";
    this.loadingState = true;
    let response = "";
    if (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.inviteEmail)
    ) {
      let mailData = {
        email_to: this.inviteEmail,
        share_url: this.invitePageURL,
      };
      // let mailDataS = JSON.stringify(mailData);
      this.wp.sendMail(mailData).subscribe(
        (res: any) => {
          // console.log(res);
          let result = JSON.parse(res);
          if (result.act == "success") {
            response = "Email sent";
          } else {
            response = "Email not sent";
          }
        },
        (err) => {},
        () => {
          this.getEmailNotification(response);
          setTimeout(() => {
            this.showMessage = false;
          }, 3000);
        }
      );
    } else {
      // console.log('invalid');
      response = "Invalid Email Address";
      this.getEmailNotification(response);
      setTimeout(() => {
        this.showMessage = false;
      }, 3000);
    }
  }

  getEmailNotification(response) {
    setTimeout(() => {
      this.loadingState = false;
      this.emailMessage = response;
      this.inviteEmail = "";
      this.showMessage = true;
    }, 2000);
  }

  shareLinkOnSocial(name) {
    let shareLink = "";

    let inviteEncodedPageURL = encodeURIComponent(this.invitePageURL);
    if (name == "facebook") {
      shareLink =
        "https://www.facebook.com/sharer/sharer.php?u=" + inviteEncodedPageURL;
    } else {
      shareLink =
        "https://twitter.com/share?text=" +
        this.twitterText +
        "&url=" +
        inviteEncodedPageURL;
    }
    window.open(shareLink, "", "width=600, height=400, scrollbars=no");
  }

  onClickBack() {
    this.route.queryParamMap.subscribe((params) => {
      const pageName = params.get("page");
      const lessonID = params.get("lesson");

      if (pageName != null) {
        this.data.nameChange("ExperienceComponent");
      } else if (lessonID != null) {
        this.data.nameChange("LessonComponent");
      } else {
        // this.data.nameChange("CategoryComponent");
      }
    });
    this.router.navigate(["/"]);
    // this.data.nameChange("CategoryComponent");
  }

  onClickHome() {
    this.data.nameChange("HomeComponent");
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
  }

  copiedUniqueLink(event) {
    // console.log(event.isSuccess);
    this.copiedLink = event.isSuccess;
    setTimeout(() => {
      this.copiedLink = false;
    }, 3000);
  }
}
