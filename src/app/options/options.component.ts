import { WordpressService } from "./../services/wordpress.service";
import { DataService } from "./../services/data.service";
import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalService } from "./../services/modal.service";
import { TranslateService } from "@ngx-translate/core";

declare let apiUrl: any;

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.css"],
})
export class OptionsComponent implements OnInit {
  menuOpened: boolean = false;
  userLoggedIn = false;
  @Input() openedIn: boolean;
  currentPage: any;
  redirectUrl: any;
  countryList: any;
  inviteEmail: any;
  invitePageURL: any;
  emailMessage: any = "";
  logoutTo: any = "";
  languages = [];
  dataWithLanguages: any;
  selectedLanguage = "";
  selectedCategory = "";
  categories = [];
  moduleName = "";

  constructor(
    private data: DataService,
    private wp: WordpressService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // console.log(this.languages);
    this.logoutTo = apiUrl;
    this.openedIn = false;
    if (JSON.parse(localStorage.getItem("signInStatus")) !== null) {
      this.userLoggedIn = JSON.parse(localStorage.getItem("signInStatus"));
    }
    this.route.queryParams.subscribe((res) => {
      this.selectedLanguage = res.lang;
      if (this.selectedLanguage === undefined) {
        this.selectedLanguage = "en";
      }
      this.translate.use(this.selectedLanguage);

      if (res.page) {
        this.currentPage = res.page;
      } else {
        this.currentPage = "";
      }
      if (res.module === undefined) {
        this.moduleName = "";
      } else {
        this.moduleName = res.module;
      }
    });

    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });

    this.wp.getActiveCountryList().subscribe((res: any) => {
      this.countryList = JSON.parse(res);
    });

    this.data.currentLanguages.subscribe((data: any) => {
      if (data) {
        this.languages = data;
      }
    });

    this.data.currentDataWithLanguages.subscribe((data: any) => {
      if (data) {
        this.dataWithLanguages = data;
        const postData = JSON.parse(
          this.dataWithLanguages[this.selectedLanguage]
        );
        this.makeCategoryWithLanguages(postData);
      }
    });
  }

  makeCategoryWithLanguages(postData: any) {
    this.categories = [];
    postData.forEach((post: any) => {
      if (post.hasOwnProperty("category")) {
        post.category.forEach((category: any) => {
          if (!this.categories.some((item) => item.catSlug === category.slug)) {
            this.categories.push({
              catName: category.name,
              catSlug: category.slug,
            });
          }
        });
      }
    });

    this.categories.forEach((category: any) => {
      if (category.catSlug.startsWith("10-day-guide")) {
        this.selectedCategory = category.catSlug;
      }
    });
  }

  isCategoryItemActive(catSlug: string) {
    if (this.selectedCategory === catSlug) {
      return true;
    } else {
      return false;
    }
  }

  onClickDone() {
    this.data.nameChange("HomeComponent");
  }

  onHomePage() {
    this.router.navigate(["/"]);
    this.data.nameChange("HomeComponent");
  }

  onExperiencePage() {
    this.router.navigate(["/"], { queryParams: { page: "experience" } });
    this.data.nameChange("ExperienceComponent");
  }

  onClickSignOut() {
    localStorage.removeItem("signInStatus");
    localStorage.removeItem("Index");
    localStorage.removeItem("Lesson");
    localStorage.removeItem("UserID");
    this.wp.logout().subscribe((data: any) => {
      // this.data.nameChange('AppComponent');
      window.location.href = this.logoutTo;
    });
  }

  toggleSidebar() {
    this.menuOpened = !this.menuOpened;
  }

  onInvite() {
    this.data.nameChange("InviteComponent");
  }

  getLanguageName(language: string) {
    let languageName = "";
    if (language === "en") {
      languageName = "English";
    }
    if (language === "zh-hant") {
      languageName = "Chinese (Traditional)";
    }
    if (language === "zh-hans") {
      languageName = "Chinese (Simplified)";
    }
    if (language === "es") {
      languageName = "Spanish";
    }
    if (language === "de") {
      languageName = "German";
    }
    if (language === "it") {
      languageName = "Italian";
    }
    return languageName;
  }

  getLanguageIcon(language: string) {
    let languageFlag = "";
    if (language === "zh-hant" || language === "zh-hans") {
      languageFlag = "https://image.flaticon.com/icons/svg/2151/2151303.svg";
    } else if (language === "es") {
      languageFlag = "https://image.flaticon.com/icons/svg/206/206600.svg";
    } else if (language === "de") {
      languageFlag = "https://image.flaticon.com/icons/svg/2151/2151319.svg";
    } else if (language === "it") {
      languageFlag = "https://image.flaticon.com/icons/svg/2151/2151340.svg";
    } else {
      languageFlag = "https://image.flaticon.com/icons/svg/330/330425.svg";
    }
    return languageFlag;
  }

  getFlagIcon(language: any) {
    let iconName = "";
    if (language === "zh-hant" || language === "zh-hans") {
      iconName = "flag-icon-chinese";
    } else if (language === "es") {
      iconName = "flag-icon-spanish";
    } else if (language === "de") {
      iconName = "flag-icon-german";
    } else if (language === "it") {
      iconName = "flag-icon-italian";
    } else {
      iconName = "flag-icon-us";
    }
    return iconName;
  }

  onClickLanguage(language: any) {
    // this.selectedLanguage = language;
    // const postData = JSON.parse(this.dataWithLanguages[this.selectedLanguage]);
    // this.makeCategoryWithLanguages(postData);

    // const day10Guide = [];
    // if (postData !== null) {
    //   postData.forEach((post: any) => {
    //     if (post.hasOwnProperty("category")) {
    //       post.category.forEach((category: any) => {
    //         if (category.slug.startsWith("10-day-guide")) {
    //           day10Guide.push(post);
    //         }
    //       });
    //     }
    //   });
    // }

    // this.data.dataChange(day10Guide);
    // console.log(language);
    if (
      language === "zh-hant" ||
      language === "zh-hans" ||
      language === "es" ||
      language === "de" ||
      language === "it"
    ) {
      if (this.moduleName === "library") {
        this.router.navigate(["/"], {
          queryParams: { lang: language, module: "library" },
        });
      } else {
        this.router.navigate(["/"], { queryParams: { lang: language } });
      }
    } else {
      if (this.moduleName === "library") {
        this.router.navigate(["/"], { queryParams: { module: "library" } });
      } else {
        this.router.navigate(["/"]);
      }
    }
  }

  /*openInviteModal() {
    this.modalService.open('invite-modal');
    this.menuOpened = false;
  }*/

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
  }

  shareLinkOnSocial(name) {
    let shareLink = ''
    this.invitePageURL = 'https://challenge.com/preview/member'+this.router.url;
    this.invitePageURL = encodeURIComponent(this.invitePageURL);
    if(name == 'facebook') {
      shareLink = 'https://www.facebook.com/sharer/sharer.php?u='+this.invitePageURL;
    } else {
      shareLink = 'https://twitter.com/share?url='+this.invitePageURL;
    }

    window.open(shareLink, '', 'width=600, height=400, scrollbars=no');
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }*/

  onLogin() {
    window.open(this.redirectUrl, "_self");
  }

  onGetHelp() {
    window.open("https://support.justpruvit.com/hc/en-us");
  }

  onCLickCategory(slug: string) {
    this.selectedCategory = slug;
    const postData = JSON.parse(this.dataWithLanguages[this.selectedLanguage]);

    const categoryData = [];
    postData.forEach((post: any) => {
      if (post.hasOwnProperty("category")) {
        post.category.forEach((category: any) => {
          if (category.slug === slug) {
            categoryData.push(post);
          }
        });
      }
    });

    this.data.dataChange(categoryData);
  }

  onClickOption() {
    if (this.selectedLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: { lang: this.selectedLanguage },
      });
    } else {
      this.router.navigate(["/"]);
    }
  }

  onClickLibrary() {
    if (this.selectedLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: { lang: this.selectedLanguage, module: "library" },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: { module: "library" },
      });
    }
  }
}
