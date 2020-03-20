import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from './../services/data.service';
import { WordpressService } from '../services/wordpress.service';
import { ModalService } from './../services/modal.service';

declare let apiUrl:any

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})

export class ExperienceComponent implements OnInit {

  menuOpened: boolean = false;
  completePercent: any = 0;
  totalLesson = 7;
  completedExpLesson: any[] = [];
  spinner = true;
  isOpen: any;
  submittedExpData: any;
  userLoggedIn = false;
  redirectUrl: any;
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

  constructor( 
    private data: DataService, 
    private router: Router, 
    private wp: WordpressService,
    private modalService: ModalService) {  
  }

  ngOnInit() {
    // this.spinner = true;
    this.logoutTo = apiUrl;

    if (JSON.parse(localStorage.getItem('signInStatus')) !== null) {
      this.userLoggedIn = JSON.parse(localStorage.getItem('signInStatus'));
    }

    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });

    this.data.currentExperience.subscribe((res: any) => {
      if(Object.keys(res).length) {
        this.submittedExpData = JSON.stringify(res);
      }else {
        localStorage.removeItem('ExpLesson');
      }
    });

    const user = JSON.parse(localStorage.getItem('experienceStatus'));
    if (user === null || user === '') {
      this.spinner = true;
    } else {
      this.wp.getUserExperience().subscribe((res: any) => {
        console.log('user experience', res);
        if(res === null) {
          this.spinner = false;
        } else {
          let status = JSON.parse(res);
          if(status.error || status.exp_token_error) {
            window.location.href = `
                https://pg-app-4sn1wg84isf5h18lb2d73ydf2zhxgr.scalabl.cloud/v1/authorize?redirectURL=https://challenge.com/go/`;
          } else {
            // this.data.saveExperienceDataTemp(JSON.parse(res));
            this.spinner = false;
          }
        }
      },
      (err) => {},
      () => {
        // this.spinner = false;
      });
    }

    this.completedExpLesson = JSON.parse(localStorage.getItem('ExpLesson'));
    if (this.completedExpLesson !== null) {
      this.completePercent = ((100 * this.completedExpLesson.length) / this.totalLesson).toFixed();
    } else {
      this.completedExpLesson = [];
    }
    // console.log(this.completedExpLesson);
  }

  slickInit(e) {}

  breakpoint(e) {}

  afterChange(e) {}

  beforeChange(e) {}

  onExperienceLesson(lessonID) {
    this.router.navigate(['/'], {queryParams: {explesson: lessonID}});
    this.data.nameChange('ExperienceLessonComponent');
  }

  isCompletedExpLesson(lessonID) {
    if (this.completedExpLesson !== null ) {
      if ( this.completedExpLesson.includes(lessonID)) {
        return true;
      } else {
        return false;
      }
    }
  }

  onSubmitExperience() {
    // this.submittedExpData.status = true;
    this.spinner = true;
    this.wp.saveExperienceData(this.submittedExpData).subscribe((data: any)=>{
      console.log(JSON.parse(data));
      this.data.saveExperienceDataTemp(JSON.parse(data));
    },
    (err) => {},
    ()=>{
      this.spinner = false;
      this.modalService.open('exp-save-modal');
    });
  }

  openSidebar() {
    this.isOpen = Math.floor(Math.random() * (999 - 100)) + 1;
  }

  onCloseExpModal() {
    this.modalService.close('exp-save-modal');
  }

  toggleSidebar() {
    this.menuOpened = !this.menuOpened;
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

}
