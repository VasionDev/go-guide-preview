import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-library-search",
  templateUrl: "./library-search.component.html",
  styleUrls: ["./library-search.component.css"],
})
export class LibrarySearchComponent implements OnInit {
  categories = [];
  categoriesPosts = [];
  filteredTopicArray = [];
  searchParam = "";
  itemSelected = "";
  currentLanguage = "";

  constructor(
    private router: Router,
    private data: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadLibraryData();
  }

  loadLibraryData() {
    this.route.queryParamMap.subscribe((params) => {
      this.searchParam = params.get("search");
      const langParam = params.get("lang");
      if (langParam !== null) {
        this.currentLanguage = langParam;
      } else {
        this.currentLanguage = "en";
      }
    });
    this.data.currentLibraryData.subscribe((data: any) => {
      this.categories = data.category_info;

      const tempPosts = [];
      if (this.categories) {
        this.categories.forEach((category: any) => {
          category.cat_posts.forEach((post: any) => {
            if (!tempPosts.some((item) => item.post_id === post.post_id)) {
              tempPosts.push(post);
            }
          });
        });
      }
      if (this.searchParam !== null) {
        this.categoriesPosts = tempPosts.filter(
          (x: any) =>
            x.post_title
              .toLowerCase()
              .includes(this.searchParam.toLowerCase()) ||
            x.post_content
              .toLowerCase()
              .includes(this.searchParam.toLowerCase())
        );
      }

      this.categoriesPosts.sort((a, b) =>
        a.post_title > b.post_title ? 1 : -1
      );
      this.getTopicItems();
    });
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

  onClickPost(post: any) {
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

  getTopicItems() {
    this.filteredTopicArray = [];
    if (this.categories) {
      this.categories.forEach((category: any) => {
        let tempPostCount = 0;
        let tempCatName = "";
        const tempPosts = [];
        category.cat_posts.forEach((post: any) => {
          this.categoriesPosts.forEach((filteredPost: any) => {
            if (post.post_id === filteredPost.post_id) {
              tempPostCount++;
              tempPosts.push(post);
              tempCatName = category.cat_slug;
            }
          });
        });
        this.filteredTopicArray.push({
          module: tempCatName,
          posts: tempPosts,
          count: tempPostCount,
        });
      });
    }
  }

  onClickTopic(topic: any) {
    this.itemSelected = topic.module;
    this.categoriesPosts = topic.posts;
  }
}
