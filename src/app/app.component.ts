import { WordpressService } from './services/wordpress.service';
import { DataService } from './services/data.service';
import { LessonComponent } from './lesson/lesson.component';
import { LoginComponent } from './login/login.component';
import { OptionsComponent } from './options/options.component';
import { Component, OnInit } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { ResourceComponent } from './resource/resource.component';
import { ActivatedRoute } from '@angular/router';
import { ExperienceComponent } from './experience/experience.component';
import { ExperienceLessonComponent } from './experience-lesson/experience-lesson.component';
import { InviteComponent } from './invite/invite.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myComponent: any;
  allLessonID = [];
  spinner = true;
  experienceLogin = false;
  redirectUrl: any;

  constructor(private data: DataService, private wp: WordpressService, private route: ActivatedRoute) {}

  ngOnInit() {
    localStorage.removeItem('LastLesson');
    localStorage.removeItem('CompletedTools');
    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    },
    (err)=> {

    },
    ()=>{
      this.checkUserAuthentication();
      this.data.$componentName.subscribe((name: any) => {
        if (name === 'HomeComponent') {
          this.myComponent = HomeComponent;
        } else if (name === 'LessonComponent') {
          this.myComponent = LessonComponent;
        } else if (name === 'ResourceComponent') {
          this.myComponent = ResourceComponent;
        } else if (name === 'LoginComponent') {
          this.myComponent = LoginComponent;
        } else if (name === 'OptionsComponent') {
          this.myComponent = OptionsComponent;
        } else if (name === 'ExperienceComponent') {
          this.myComponent = ExperienceComponent;
        } else if (name === 'ExperienceLessonComponent') {
          this.myComponent = ExperienceLessonComponent;
        } else if (name === 'InviteComponent') {
          this.myComponent = InviteComponent;
        } else {
          this.myComponent = AppComponent;
        }
      });
    });
    
    // this.subscribeLessons();
  }


  checkUserAuthentication() {
    this.wp.login().subscribe((user: any) => {
      if (user.mvuser_id !== undefined && user.mvuser_id !== '') {
        localStorage.setItem('UserID', user.mvuser_id);
        // console.log(user.mvuser_refCode);
        this.data.saveRefCode(user.mvuser_refCode);
        const value = JSON.parse(user.user_learn_data);
        // console.log(value);
        localStorage.setItem('Index', JSON.stringify(value.indexArray));
        localStorage.setItem('Lesson', JSON.stringify(value.lessonArray));
        localStorage.setItem('signInStatus', JSON.stringify(true));

        if (user.Experience_Session_Token !== undefined && user.Experience_Session_Token !== '') {
          this.experienceLogin = true;
          localStorage.setItem('experienceStatus', JSON.stringify(true));
        } else {
          localStorage.setItem('experienceStatus', JSON.stringify(''));
        }

        this.subscribeLessons();
      } else {
        window.location.href = this.redirectUrl;
        // this.subscribeLessons();
      }
    });
  }

  subscribeLessons() {
    // console.log('after checking');
    this.wp.getPosts().subscribe(
      (data: any) => {
        const postData = JSON.parse(data);
        // console.log(postData);
        for (const post of postData) {
          for (const lesson of post.lesson) {
            this.allLessonID.push(lesson.lesson_id);
          }
        }
        this.data.dataChange(postData);
      },
      (err) => {},
      () => {
        this.loadComponent();
      }
    );

  }
  
  /*loadComponent() {
    this.wp.login().subscribe((user: any) => {
      if (user.mvuser_id !== undefined && user.mvuser_id !== '') {
        const value = JSON.parse(user.user_learn_data);
        localStorage.setItem('Index', JSON.stringify(value.indexArray));
        localStorage.setItem('Lesson', JSON.stringify(value.lessonArray));
        localStorage.setItem('signInStatus', JSON.stringify(true));
        this.subscribeLessons();
      } else {
        window.location.href = this.redirectUrl;
        console.log('checking for user');
      }
      
      if (user.Experience_Session_Token !== undefined && user.Experience_Session_Token !== '') {
        this.experienceLogin = true;
        localStorage.setItem('experienceStatus', JSON.stringify(true));
      } else {
        localStorage.setItem('experienceStatus', JSON.stringify(''));
      }
    },
    (err) => {},
    () => {
      console.log('checking callback');
      this.spinner = false;
      this.route.queryParamMap.subscribe(params => {

        const pageName = params.get('page');
        const expLessonID = params.get('explesson');
        const lessonID = params.get('lesson');
        if (pageName != null) {
          if ( pageName === 'option') {
            this.data.nameChange('OptionsComponent');
          } else if (pageName === 'experience') {
            if (!this.experienceLogin) {
              window.location.href = `
              https://pg-app-9dfh2kb0auoxwzcgrca8678kjc14dc.scalabl.cloud/v1/authorize?redirectURL=https://challenge.com/preview/member/`;
            } else {
              this.data.nameChange('ExperienceComponent');
            }
          }
        } else if (expLessonID != null) {
          this.data.nameChange('ExperienceLessonComponent');
        } else if (lessonID != null) {
          this.data.nameChange('LessonComponent');
        } else {
          this.myComponent = HomeComponent;
        }
      });

      let CompletedLesson = JSON.parse(localStorage.getItem('Lesson'));
      let CompletedPost = JSON.parse(localStorage.getItem('Index'));
      if (CompletedLesson === null && CompletedPost === null) {
        CompletedLesson = [];
        CompletedPost = [];
      }

      CompletedLesson.forEach(lessonID => {
        if ( !this.allLessonID.includes(lessonID)) {
          const removeIndex = CompletedLesson.indexOf(lessonID);
          CompletedLesson.splice(removeIndex, 1);
          CompletedPost.splice(removeIndex, 1);
        }
      });

      // console.log(CompletedLesson, CompletedPost);
      localStorage.setItem('Lesson', JSON.stringify(CompletedLesson));
      localStorage.setItem('Index', JSON.stringify(CompletedPost));

    }
    );
    this.data.$componentName.subscribe((name: any) => {
      if (name === 'HomeComponent') {
        this.myComponent = HomeComponent;
      } else if (name === 'LessonComponent') {
        this.myComponent = LessonComponent;
      } else if (name === 'ResourceComponent') {
        this.myComponent = ResourceComponent;
      } else if (name === 'LoginComponent') {
        this.myComponent = LoginComponent;
      } else if (name === 'OptionsComponent') {
        this.myComponent = OptionsComponent;
      } else if (name === 'ExperienceComponent') {
        this.myComponent = ExperienceComponent;
      } else if (name === 'ExperienceLessonComponent') {
        this.myComponent = ExperienceLessonComponent;
      } else if (name === 'InviteComponent') {
        this.myComponent = InviteComponent;
      } else {
        this.myComponent = AppComponent;
      }
    });
  }*/



  loadComponent() {

    // console.log('checking callback');
    this.spinner = false;
    this.route.queryParamMap.subscribe(params => {

      const pageName = params.get('page');
      const expLessonID = params.get('explesson');
      const lessonID = params.get('lesson');
      if (pageName != null) {
        if ( pageName === 'option') {
          this.data.nameChange('OptionsComponent');
        } else if (pageName === 'experience') {
          if (!this.experienceLogin) {
            window.location.href = `
            https://pg-app-9dfh2kb0auoxwzcgrca8678kjc14dc.scalabl.cloud/v1/authorize?redirectURL=https://challenge.com/preview/member/`;
          } else {
            this.data.nameChange('ExperienceComponent');
          }
        }
      } else if (expLessonID != null) {
        this.data.nameChange('ExperienceLessonComponent');
      } else if (lessonID != null) {
        this.data.nameChange('LessonComponent');
      } else {
        this.myComponent = HomeComponent;
      }
    });

    let CompletedLesson = JSON.parse(localStorage.getItem('Lesson'));
    let CompletedPost = JSON.parse(localStorage.getItem('Index'));
    if (CompletedLesson === null && CompletedPost === null) {
      CompletedLesson = [];
      CompletedPost = [];
    }

    CompletedLesson.forEach(lessonID => {
      if ( !this.allLessonID.includes(lessonID)) {
        const removeIndex = CompletedLesson.indexOf(lessonID);
        CompletedLesson.splice(removeIndex, 1);
        CompletedPost.splice(removeIndex, 1);
      }
    });

    // console.log(CompletedLesson, CompletedPost);
    localStorage.setItem('Lesson', JSON.stringify(CompletedLesson));
    localStorage.setItem('Index', JSON.stringify(CompletedPost));

    /*this.data.$componentName.subscribe((name: any) => {
      if (name === 'HomeComponent') {
        this.myComponent = HomeComponent;
      } else if (name === 'LessonComponent') {
        this.myComponent = LessonComponent;
      } else if (name === 'ResourceComponent') {
        this.myComponent = ResourceComponent;
      } else if (name === 'LoginComponent') {
        this.myComponent = LoginComponent;
      } else if (name === 'OptionsComponent') {
        this.myComponent = OptionsComponent;
      } else if (name === 'ExperienceComponent') {
        this.myComponent = ExperienceComponent;
      } else if (name === 'ExperienceLessonComponent') {
        this.myComponent = ExperienceLessonComponent;
      } else if (name === 'InviteComponent') {
        this.myComponent = InviteComponent;
      } else {
        this.myComponent = AppComponent;
      }
    });*/
  }


}
