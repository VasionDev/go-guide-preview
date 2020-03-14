import { WordpressService } from "./../services/wordpress.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "./../services/data.service";
import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

declare let apiUrl: any;

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.css"]
})
export class CategoryComponent implements OnInit {
  postsData: any;
  currentLanguage = "en";
  categories = [];
  userStatus = "";
  menuOpened = false;
  userLoggedIn = true;
  logoutTo: any = "";

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
    this.route.queryParamMap.subscribe(params => {
      const langParam = params.get("lang");
      if (langParam !== null) {
        this.currentLanguage = langParam;
      } else {
        this.currentLanguage = "en";
      }

      this.translate.use(this.currentLanguage);
      this.loadCategoryData();
      this.getCategoriesWithPosts();
    });
  }

  loadSignInStatus() {
    this.logoutTo = apiUrl;
    const tempUserStatus = localStorage.getItem("UserStatus");
    if (tempUserStatus !== null) {
      this.userStatus = tempUserStatus;
      this.userLoggedIn = true;
    }
  }

  loadCategoryData() {
    this.categories = [];
    this.data.currentDataWithLanguages.subscribe((data: any) => {
      this.postsData = JSON.parse(data[this.currentLanguage]);

      this.postsData.forEach((post: any) => {
        if (post.hasOwnProperty("category")) {
          post.category.forEach((category: any) => {
            if (!this.categories.some(item => item.catSlug === category.slug)) {
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
                active_smartship: category.active_smartship
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
        posts: tempPosts
      });
    });
    this.categories.forEach(category => {
      categoriesWithPosts.forEach(tempCategory => {
        if (tempCategory.category === category.catSlug) {
          category.posts = tempCategory.posts;
        }
      });
    });
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
        queryParams: { lang: this.currentLanguage, category: catSlug }
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

    posts.forEach(post => {
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
    let catAvailability = false;
    Object.entries(cat).forEach(([key, value]) => {
      if (key === this.userStatus) {
        if (value === "on") {
          catAvailability = true;
        }
      }
    });
    return catAvailability;
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
          if (key === "active_smartship") {
            availableCatName = "Active SmartShip";
          }
          requiredAvailability.push(availableCatName);
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
