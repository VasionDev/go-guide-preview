import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-library-favorites",
  templateUrl: "./library-favorites.component.html",
  styleUrls: ["./library-favorites.component.css"],
})
export class LibraryFavoritesComponent implements OnInit {
  favoritesPosts = [];
  categories = [];
  currentLanguage = "";

  constructor(
    private data: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadFavoritesData();
  }

  loadFavoritesData() {
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
      const favorites = JSON.parse(localStorage.getItem("Favorites"));
      if (favorites !== null) {
        const tempFavorites = [];
        favorites.forEach((favorite: any) => {
          if (this.categories) {
            this.categories.forEach((category: any) => {
              category.cat_posts.forEach((post: any) => {
                if (post.post_id === +favorite) {
                  if (
                    !tempFavorites.some(
                      (item: any) => item.post_id === post.post_id
                    )
                  ) {
                    tempFavorites.push(post);
                  }
                }
              });
            });
          }
        });
        this.favoritesPosts = tempFavorites;
      }
    });
  }

  onCLickPost(post: any) {
    const topicName = this.getTopicName(post.post_id);
    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: {
          lang: this.currentLanguage,
          module: "library",
          topic: topicName,
          item: post.post_id,
        },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: {
          module: "library",
          topic: topicName,
          item: post.post_id,
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

  onClickBack() {
    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: { lang: this.currentLanguage, module: "library" },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: { module: "library" },
      });
    }
  }
}
