import { WordpressService } from "./../services/wordpress.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "./../services/data.service";
import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

declare let apiUrl: any;

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.css"],
})
export class CategoryComponent implements OnInit {
  postsData: any;
  currentLanguage = "en";
  categories = [];
  userStatus = "";
  menuOpened = false;
  userLoggedIn = true;
  logoutTo: any = "";
  activeSmartship = "";

  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private wp: WordpressService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadLanguageStatus();
    this.loadSignInStatus();
  }

  loadLanguageStatus() {
    this.route.queryParamMap.subscribe((params) => {
      const langParam = params.get("lang");
      if (langParam !== null) {
        this.currentLanguage = langParam;
      } else {
        this.currentLanguage = "en";
      }

      this.translate.use(this.currentLanguage);
      this.loadCategoryData();
      this.getCategoriesWithPosts();
      // this.saveCategoryCompletedData();
    });
  }

  loadSignInStatus() {
    this.logoutTo = apiUrl;
    const tempUserStatus = localStorage.getItem("UserStatus");
    const tempActiveSmartship = localStorage.getItem("ActiveSmartship");
    if (tempUserStatus !== null) {
      this.userStatus = tempUserStatus;
      this.userLoggedIn = true;
    }
    if (tempActiveSmartship !== null) {
      this.activeSmartship = tempActiveSmartship;
    }
  }

  loadCategoryData() {
    this.categories = [];
    this.data.currentDataWithLanguages.subscribe((data: any) => {
      this.postsData = JSON.parse(data[this.currentLanguage]);

      this.postsData.forEach((post: any) => {
        if (post.hasOwnProperty("category")) {
          post.category.forEach((category: any) => {
            if (
              !this.categories.some((item) => item.catSlug === category.slug)
            ) {
              this.categories.push({
                catName: category.name,
                catSlug: category.slug,
                catColor1: category.bg_color_1,
                catColor2: category.bg_color_2,
                catImage: category.image,
                customer: category.customer,
                promoter: category.promoter,
                champion: category.champion,
                champion_rank_7: category.champion_rank_7,
                champion_rank_8: category.champion_rank_8,
                active_smartship: category.active_smartship,
              });
            }
          });
        }
      });
    });
  }

  getCategoriesWithPosts() {
    const categoriesWithPosts = [];
    this.categories.forEach((mainCategory: any) => {
      const tempPosts = [];
      this.postsData.forEach((post: any) => {
        if (post.hasOwnProperty("category")) {
          post.category.forEach((category: any) => {
            if (category.slug === mainCategory.catSlug) {
              tempPosts.push(post);
            }
          });
        }
      });
      categoriesWithPosts.push({
        category: mainCategory.catSlug,
        posts: tempPosts,
      });
    });
    this.categories.forEach((category) => {
      categoriesWithPosts.forEach((tempCategory) => {
        if (tempCategory.category === category.catSlug) {
          category.posts = tempCategory.posts;
        }
      });
    });
  }

  saveCategoryCompletedData() {
    const tempCompletedCategory = localStorage.getItem("completedCategory");
    const tempIndex = JSON.parse(localStorage.getItem("Index"));
    const tempLesson = JSON.parse(localStorage.getItem("Lesson"));
    const tempUserID = localStorage.getItem("UserID");

    const tempCategoryCount = [];
    this.categories.forEach((category: any) => {
      tempCategoryCount.push({
        categorySlug: category.catSlug,
        completedCount: 0,
      });
    });

    if (tempCompletedCategory === "undefined") {
      if (tempUserID !== null) {
        this.wp
          .saveData({
            userId: tempUserID,
            indexArray: tempIndex,
            lessonArray: tempLesson,
            categoryCompleted: tempCategoryCount,
          })
          .subscribe(
            (res: any) => {
              const successValue = JSON.parse(res);
              if (successValue.success === true) {
                console.log("cateogry saved");
              } else {
                console.log("not saved");
              }
            },
            (err: any) => {
              console.log("add", err);
            }
          );
      }
    }
  }

  getCategoryPosts(catSlug: string) {
    const currentGuide = [];

    this.postsData.forEach((post: any) => {
      if (post.hasOwnProperty("category")) {
        post.category.forEach((category: any) => {
          if (category.slug.startsWith(catSlug)) {
            currentGuide.push(post);
          }
        });
      }
    });

    this.data.dataChange(currentGuide);

    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: { lang: this.currentLanguage, category: catSlug },
      });
    } else {
      this.router.navigate(["/"], { queryParams: { category: catSlug } });
    }
    this.data.nameChange("HomeComponent");
  }

  getCatStyle(color1: any, color2: any) {
    return (
      "linear-gradient(53.42deg, " + color1 + " 0%, " + color2 + " 86.08%)"
    );
  }

  getCompletePercentage(posts: any[]) {
    let allLength = posts.length;
    let totalLesson = 0;
    let completePercent = "";
    let intersectionLessonID = [];
    let completedLesson = JSON.parse(localStorage.getItem("Lesson"));
    const currentAllLessonID = [];

    while (allLength > 0) {
      totalLesson = totalLesson + posts[--allLength].lesson.length;
    }

    posts.forEach((post) => {
      post.lesson.forEach((element: any) => {
        if (!currentAllLessonID.includes(element.lesson_id)) {
          currentAllLessonID.push(element.lesson_id);
        }
      });
    });

    intersectionLessonID = completedLesson.filter((value: any) =>
      currentAllLessonID.includes(value)
    );

    completedLesson = intersectionLessonID;

    if (completedLesson !== null) {
      completePercent = (
        (100 * completedLesson.length) /
        totalLesson
      ).toFixed();
    } else {
      completedLesson = [];
    }

    return completePercent;
  }

  getActiveUser(cat: any) {
    let tempUser = false;
    let tempSmartship = false;
    Object.entries(cat).forEach(([key, value]) => {
      if (key === this.userStatus) {
        if (value === "on") {
          tempUser = true;
        }
      }
      if (key === "active_smartship") {
        if (value === "on") {
          if (this.activeSmartship === "1") {
            tempSmartship = true;
          }
        }
      }
    });
    if (tempUser || tempSmartship) {
      return true;
    } else {
      return false;
    }
  }

  getRequiredAvailability(cat: any) {
    const requiredAvailability = [];
    Object.entries(cat).forEach(([key, value]) => {
      if (key !== this.userStatus) {
        if (value === "on") {
          let availableCatName = "";
          if (key === "customer") {
            availableCatName = "Customer";
          }
          if (key === "promoter") {
            availableCatName = "Promoter";
          }
          if (key === "champion") {
            availableCatName = "Champions (Rank 6+)";
          }
          if (key === "champion_rank_7") {
            availableCatName = "Pro Champs (Rank 7+)";
          }
          if (key === "champion_rank_8") {
            availableCatName = "Prime Time Prüvers (Rank 8+)";
          }
          requiredAvailability.push(availableCatName);
        }
      }
      if (key === "active_smartship") {
        if (value === "on") {
          if (this.activeSmartship === "") {
            requiredAvailability.push("Active SmartShip");
          }
        }
      }
    });
    return requiredAvailability;
  }

  toggleSidebar() {
    this.menuOpened = !this.menuOpened;
  }

  onClickSignOut() {
    localStorage.removeItem("signInStatus");
    localStorage.removeItem("Index");
    localStorage.removeItem("Lesson");
    localStorage.removeItem("UserID");
    this.wp.logout().subscribe((data: any) => {
      window.location.href = this.logoutTo;
    });
  }

  categoryTitleShortener(title: string) {
    let newTitle: string;
    if (title.length > 30) {
      newTitle = title.substr(0, 30) + "...";
    } else {
      newTitle = title;
    }
    return newTitle;
  }
}
