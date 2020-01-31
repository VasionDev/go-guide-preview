import { DataService } from './../services/data.service';
import { Component, OnInit } from '@angular/core';
import { WordpressService } from '../services/wordpress.service';
import { ActivatedRoute, Router } from '@angular/router';

let CompletedTools = [];
let prerequisites = [];

declare let apiUrl:any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  menuOpened: boolean = false;
  posts: any;
  indexPost: any;
  indexSlide: any;
  completePercent: any = 0;
  nextStartLesson: any;
  lastEndedPostIndex: any;
  userLoggedIn = true;
  userName = '';
  isComplete = 0;
  spinner = false;
  redirectUrl: any;
  completedLesson: any[] = [];
  completedIndex: any[] = [];
  isOpen: any = true;
  logoutTo: any = '';

  slideConfig = {

    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    centerMode: true,
    centerPadding: '60px',
    infinite: false,
    slickGoTo: 0,
    responsive : [
      {
        breakpoint: 480,
        settings: {
          arrows: true,
          prevArrow: '<button type="button" class="slick-prev-round"><i class="far fa-angle-left"></i></button>',
          nextArrow: '<button type="button" class="slick-next-round"><i class="far fa-angle-right"></i></button>',
          slidesToShow: 1
        }
      }
    ]
  };

  constructor(private data: DataService, private wp: WordpressService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {

    // this.checkNavigator();
    // console.log(this.completePercent);
    this.logoutTo = apiUrl;

    this.nextStartLesson = {
      lesson_id: ''
    };

    this.loadSignInStatus();
    this.data.currentData.subscribe((data: any) => {

      this.posts = data;
      let allLength = data.length;
      let totalLesson = 0;
      let lastEndedPostLessons = [];
      while (allLength > 0) {
        totalLesson = totalLesson + data[--allLength].lesson.length;
      }

      const tempIndex = JSON.parse(localStorage.getItem('LastLesson'));
      this.completedLesson = JSON.parse(localStorage.getItem('Lesson'));
      let mainIndex: number;

      if (tempIndex === null) {
        /*this.indexPost = this.posts[0].learnID;
        lastEndedPostLessons = this.posts[0].lesson;
        this.lastEndedPostIndex = this.posts[0];
        this.indexSlide = 0;*/

        for (mainIndex = 0; mainIndex < this.posts.length; mainIndex++) {

          let lastIndex = JSON.parse(localStorage.getItem('LastLesson'));
          if(lastIndex  != null && lastIndex != '') {
            break;
          }
          for (const lesson of this.posts[mainIndex].lesson) {
            if ( !this.completedLesson.includes(lesson.lesson_id)) {
              this.indexPost = this.posts[mainIndex].learnID;
              lastEndedPostLessons = this.posts[mainIndex].lesson;
              this.lastEndedPostIndex = this.posts[mainIndex];
              this.indexSlide = mainIndex;
              localStorage.setItem('LastLesson', JSON.stringify(this.posts[mainIndex].learnID));
              break;
            }
          }
        }

      } else {
        for (mainIndex = 0; mainIndex < this.posts.length; mainIndex++) {
          if (this.posts[mainIndex].learnID === tempIndex) {
            this.indexPost = tempIndex;
            lastEndedPostLessons = this.posts[mainIndex].lesson;
            this.lastEndedPostIndex = this.posts[mainIndex];
            this.indexSlide = mainIndex;
          }
        }
      }

      this.updateNextStartLesson(lastEndedPostLessons);
      // this.completedLesson = JSON.parse(localStorage.getItem('Lesson'));
      this.completedIndex = JSON.parse(localStorage.getItem('Index'));
      // console.log(this.completedLesson.length, totalLesson);
      if (this.completedLesson !== null) {
        this.completePercent = ((100 * this.completedLesson.length) / totalLesson).toFixed();
      } else {
        this.completedLesson = [];
      }
      this.allComplete();
      this.route.queryParamMap.subscribe(params => {

        const pageName = params.get('page');
        const expLessonID = params.get('explesson');
        const lessonID = params.get('lesson');
        if (pageName != null) {
          if ( pageName === 'option') {
            this.data.nameChange('OptionsComponent');
          } else if (pageName === 'experience') {
            this.data.nameChange('ExperienceComponent');
          }
        } else if (expLessonID != null) {
          this.data.nameChange('ExperienceLessonComponent');
        } else if (lessonID != null) {
          this.data.nameChange('LessonComponent');
        } else {
          this.data.nameChange('HomeComponent');
        }
      });
    });
  }

  updateNextStartLesson(lastEndedPostLessons) {
    let LessonArray = JSON.parse(localStorage.getItem('Lesson'));
    if (LessonArray === null) {
      LessonArray = [];
    }

    for (const lesson of lastEndedPostLessons) {
      if ( !LessonArray.includes(lesson.lesson_id)) {
        this.nextStartLesson = lesson;
        break;
      }
    }
  }

  loadSignInStatus() {
    this.wp.login().subscribe((user: any) => {
      
      if (user.mvuser_id !== undefined && user.mvuser_id !== '') {
        localStorage.setItem('UserID', user.mvuser_id);
        const value = JSON.parse(user.user_learn_data);
        // localStorage.setItem('Index', JSON.stringify(value.indexArray));
        // localStorage.setItem('Lesson', JSON.stringify(value.lessonArray));
        this.userLoggedIn = true;
        this.userName = user.mvuser_name;
        localStorage.setItem('signInStatus', JSON.stringify(true));
      } else {
        localStorage.removeItem('UserID');
      }
    });
    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });
  }

  greetingUser() {

    if (this.userName !== '') {
      return 'Keep going, ' + this.userName + '!';
    } else {
      return 'Keep going!';
    }
  }

  loadApi() {
    this.wp.getPosts().subscribe(
      (data: any) => {
        this.posts = JSON.parse(data);
        this.data.dataChange(this.posts);
        const tempIndex = JSON.parse(localStorage.getItem('LastLesson'));

        let mainIndex: number;
        if (tempIndex === null) {
          this.indexPost = this.posts[0].learnID;
          this.indexSlide = 0;
        } else {
          for (mainIndex = 0; mainIndex < this.posts.length; mainIndex++) {
            if (this.posts[mainIndex].learnID === tempIndex) {
              this.indexPost = tempIndex;
              this.indexSlide = mainIndex;
            }
          }
        }
        this.completedLesson = JSON.parse(localStorage.getItem('Lesson'));
        this.completedIndex = JSON.parse(localStorage.getItem('Index'));
        this.spinner = false;
      },
      err => {},
      () => {
        this.allComplete();
        this.route.queryParamMap.subscribe(params => {
          const lessonID = params.get('lesson');
          if (lessonID != null) {
            this.data.nameChange('LessonComponent');
          }
        });
      }
    );
  }

  completedLessonNo(learnList: any) {

    let CompletedLesson = JSON.parse(localStorage.getItem('Lesson'));
    let lessonNo = 0;
    if (CompletedLesson === null) {
      CompletedLesson = [];
    }

    for (const lesson of learnList.lesson) {
      if ( CompletedLesson.includes(lesson.lesson_id)) {
        lessonNo++;
      }
    }
    return lessonNo;
  }

  prereqText(prereq: any) {
    let i: number;
    if (this.posts !== undefined) {
      for (i = 0; i < this.posts.length; i++) {
        if (this.posts[i].learnID === +prereq) {
          return this.posts[i].learnTitle;
        }
      }
    }
  }

  onClickIcon() {
    this.data.nameChange('OptionsComponent');
  }

  onClickLesson(index: any, lesson: any, lessonTitle: any) {
    // this.data.eventEmitter('Lesson title', 'click', lessonTitle);
    this.data.lessonChange(index, lesson);
    this.data.nameChange('LessonComponent');
  }

  prerequisiteComplete(post: any) {
    let k: number;
    if (this.posts !== undefined) {
      for (k = 0; k < this.posts.length; k++) {
        if (this.posts[k].learnID === post.learnID) {
          prerequisites = this.posts[k].prerequisites;
          const result = [];
          for (let i = 0, l = prerequisites.length; i < l; i++) {
            result.push(+prerequisites[i]);
          }
          const arr1 = result.concat().sort();
          const arr2 = CompletedTools.concat().sort();
          if (arr1.length !== 0) {
            if (arr1.every((val: any) => arr2.includes(val))) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        }
      }
    }
  }

  completedTask(i: any, l: any) {
    if (this.completedIndex !== null && this.completedLesson !== null) {
      const indexes = [];
      let indexOfArray: number;
      for (
        indexOfArray = 0;
        indexOfArray < this.completedIndex.length;
        indexOfArray++
      ) {
        if (this.completedIndex[indexOfArray] === i) {
          indexes.push(indexOfArray);
        }
      }
      let newIndex: number;
      for (newIndex = 0; newIndex < indexes.length; newIndex++) {
        if (this.completedLesson[indexes[newIndex]] === l) {
          return true;
        }
      }
      return false;
    }
  }

  onClickSignIn(postID: any) {
    localStorage.setItem('LastLesson', JSON.stringify(postID));
  }

  onClickSignOut() {
    localStorage.removeItem('signInStatus');
    localStorage.removeItem('Index');
    localStorage.removeItem('Lesson');
    localStorage.removeItem('UserID');
    this.wp.logout().subscribe((data: any) => {
      // this.data.nameChange('AppComponent');
      window.location.href = this.logoutTo;
    });
  }

  allComplete() {
    CompletedTools = JSON.parse(localStorage.getItem('CompletedTools'));
    if (CompletedTools === null) {
      CompletedTools = [];
    }
    let n: number;
    let trueCount = 0;
    if (this.posts !== undefined) {
      for (n = 0; n < this.posts.length; n++) {
        const lessons = this.posts[n].lesson;
        lessons.forEach((element: any) => {
          if (this.completedLesson !== null) {
            if (this.completedLesson.includes(element.lesson_id)) {
              trueCount++;
            }
          }
        });
        if (this.posts[n].lesson.length === trueCount) {
          if (CompletedTools.indexOf(this.posts[n].learnID) === -1) {
            CompletedTools.push(this.posts[n].learnID);
          }
        } else {
          const index = CompletedTools.indexOf(this.posts[n].learnID);
          if (index > -1) {
            CompletedTools.splice(index, 1);
          }
        }
        trueCount = 0;
      }
    }
    localStorage.setItem('CompletedTools', JSON.stringify(CompletedTools));
  }

  slickInit(e) {
    e.slick.slickGoTo(this.indexSlide);
  }

  breakpoint(e) {}

  afterChange(e) {
    const dataValue = document.querySelector('.slick-center').getAttribute('data-learn-id');
    this.indexPost = dataValue;
  }

  beforeChange(e) {}

  mouseWheelUpFunc(e)  {
    // console.log('up', e);
    e.slickGoTo(e.currentIndex - 1);
  }

  mouseWheelDownFunc(e) {
    // console.log('down', e);
    e.slickGoTo(e.currentIndex + 1);
  }

  /*
  onOptionMenu() {
    this.data.nameChange('OptionsComponent');
    this.router.navigate(['/'], {queryParams: {page: 'option'}});
  }

  onExperiencePage() {
    this.router.navigate(['/'], {queryParams: {page: 'experience'}});
    this.data.nameChange('ExperienceComponent');
  }

  onHomePage() {
    this.menuOpened = false;
  }
  */

 openSidebar() {
    this.isOpen = Math.floor(Math.random() * (999 - 100)) + 1;
    console.log(this.isOpen);
  }

  toggleSidebar() {
    this.menuOpened = !this.menuOpened;
  }

}
