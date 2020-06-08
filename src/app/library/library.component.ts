import { Component, OnInit } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-library",
  templateUrl: "./library.component.html",
  styleUrls: ["./library.component.css"],
})
export class LibraryComponent implements OnInit {
  categories = [];
  recentPosts = [];
  searchQuery = "";
  menuOpened = false;
  currentLanguage = "";

  constructor(
    private data: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadLibraryData();
  }

  loadLibraryData() {
    this.route.queryParamMap.subscribe((params) => {
      const langParam = params.get("lang");
      if (langParam !== null) {
        this.currentLanguage = langParam;
      } else {
        this.currentLanguage = "en";
      }
    });
    this.data.currentLibraryData.subscribe((data: any) => {
      this.categories = data.category_info;
      this.recentPosts = data.recent_posts;
    });

    const userLanguage = localStorage.getItem("userLanguage");
    if (userLanguage !== null) {
      if (userLanguage !== "en") {
        this.router.navigate(["/"], {
          queryParams: { lang: userLanguage, module: "library" },
        });
      }
    }
  }

  onClickLibraryItem(category: any) {
    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: {
          lang: this.currentLanguage,
          module: "library",
          topic: category.cat_slug,
        },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: { module: "library", topic: category.cat_slug },
      });
    }
  }

  getPostDate(date: string) {
    let formattedDate = "";
    const splitDateAndTime = date.split(" ");
    const splitDate = splitDateAndTime[0].split("-");
    formattedDate = splitDate[2] + "/" + splitDate[1] + "/" + splitDate[0];
    return formattedDate;
  }

  toggleSidebar() {
    this.menuOpened = !this.menuOpened;
  }

  onSearch(query: string) {
    if (query !== "") {
      if (this.currentLanguage !== "en") {
        this.router.navigate(["/"], {
          queryParams: {
            lang: this.currentLanguage,
            module: "library",
            search: query,
          },
        });
      } else {
        this.router.navigate(["/"], {
          queryParams: { module: "library", search: query },
        });
      }
    }
  }

  onClickRecentPost(post: any) {
    const topicName = this.getTopicName(post.ID);
    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: {
          lang: this.currentLanguage,
          module: "library",
          topic: topicName,
          item: post.ID,
        },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: {
          module: "library",
          topic: topicName,
          item: post.ID,
        },
      });
    }
  }

  getTopicName(postID: number) {
    let tempCatName = "";
    this.categories.forEach((category: any) => {
      category.cat_posts.forEach((post: any) => {
        if (post.post_id === postID) {
          tempCatName = category.cat_slug;
        }
      });
    });
    return tempCatName;
  }

  onCLickFavorite() {
    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: {
          lang: this.currentLanguage,
          module: "library",
          preference: "favorites",
        },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: { module: "library", preference: "favorites" },
      });
    }
  }
}
