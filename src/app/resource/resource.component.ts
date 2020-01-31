import { DataService } from './../services/data.service';
import { WordpressService } from './../services/wordpress.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

declare let apiUrl:any

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit {
  posts: any;
  indexLesson: any;
  indexPost: any;
  redirectUrl: any;
  userLoggedIn: any;
  logoutTo: any = '';

  constructor(private data: DataService, private route: ActivatedRoute, private router: Router, private wp: WordpressService) {}

  ngOnInit() {

    this.logoutTo = apiUrl;
    this.data.currentData.subscribe((data: any) => {
      this.posts = data;
    });

    this.route.queryParamMap.subscribe(params => {
      this.indexPost = params.get('module');
      this.indexLesson = params.get('lesson');
    });

    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });

    const user = JSON.parse(localStorage.getItem('signInStatus'));
    if (user === null || user === '') {
      this.userLoggedIn = false;
    } else {
      this.userLoggedIn = true;
    }
  }

  onClickLeft() {
    this.router.navigate(['/']);
    this.data.nameChange('HomeComponent');
  }

  onClickLesson() {
    this.data.nameChange('LessonComponent');
  }

  onNavigate(link: any) {
    window.open(link, '_blank');
  }

  onClickSignOut() {
    localStorage.removeItem('signInStatus');
    localStorage.removeItem('Index');
    localStorage.removeItem('Lesson');
    localStorage.removeItem('UserID');
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
    this.router.navigate(['/']);
    this.data.nameChange('HomeComponent');
  }
}
