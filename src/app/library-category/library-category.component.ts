import { Component, OnInit } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-library-category",
  templateUrl: "./library-category.component.html",
  styleUrls: ["./library-category.component.css"],
})
export class LibraryCategoryComponent implements OnInit {
  libraries = [];
  topicParam = "";
  libraryPosts = [];
  topicName = "";
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
    this.data.currentLibraryData.subscribe((data: any) => {
      this.libraries = data.category_info;
    });
    this.route.queryParamMap.subscribe((params) => {
      this.topicParam = params.get("topic");
      if (this.topicParam !== null) {
        this.libraries.forEach((library: any) => {
          if (library.cat_slug === this.topicParam) {
            this.topicName = library.cat_name;
            this.libraryPosts = library.cat_posts;
          }
        });
      }
      const langParam = params.get("lang");
      if (langParam !== null) {
        this.currentLanguage = langParam;
      } else {
        this.currentLanguage = "en";
      }
    });
  }

  onCLickPost(post: any) {
    if (this.currentLanguage !== "en") {
      this.router.navigate(["/"], {
        queryParams: {
          lang: this.currentLanguage,
          module: "library",
          topic: this.topicParam,
          item: post.post_id,
        },
      });
    } else {
      this.router.navigate(["/"], {
        queryParams: {
          module: "library",
          topic: this.topicParam,
          item: post.post_id,
        },
      });
    }
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
