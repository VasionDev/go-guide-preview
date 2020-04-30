import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-library-favorites",
  templateUrl: "./library-favorites.component.html",
  styleUrls: ["./library-favorites.component.css"],
})
export class LibraryFavoritesComponent implements OnInit {
  favoritesPosts = [];
  categories = [];

  constructor(private data: DataService, private router: Router) {}

  ngOnInit() {
    this.loadFavoritesData();
  }

  loadFavoritesData() {
    this.data.currentLibraryData.subscribe((data: any) => {
      this.categories = data.category_info;
    });
    const favorites = JSON.parse(localStorage.getItem("Favorites"));
    if (favorites !== null) {
      const tempFavorites = [];
      favorites.forEach((favorite: any) => {
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
      });
      this.favoritesPosts = tempFavorites;
    }
  }

  onCLickPost(post: any) {
    const topicName = this.getTopicName(post.post_id);
    this.router.navigate(["/"], {
      queryParams: {
        module: "library",
        topic: topicName,
        item: post.post_id,
      },
    });
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
    this.router.navigate(["/"], {
      queryParams: { module: "library" },
    });
  }
}
