import { Component, OnInit, AfterContentChecked, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';
import { DataService } from './../services/data.service';
import { WordpressService } from '../services/wordpress.service';
import { ModalService } from './../services/modal.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

declare let apiUrl:any

@Component({
  selector: 'app-experience-lesson',
  templateUrl: './experience-lesson.component.html',
  styleUrls: ['./experience-lesson.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
    ])
  ]
})

export class ExperienceLessonComponent implements OnInit, AfterContentChecked, AfterViewInit {

  expLessonID: any;
  userData: any = {};
  newUserData: any = {};
  contentValue: any = 'option1';
  uploadStatus: any;
  singlePhoto: any;
  pairPhoto: any;
  videoData: any;
  // photosObj: { caption: string, photoURL: string, photoName: string }[] = [{ caption: '', photoURL: '', photoName: '' }];
  photosObj: {}[] = [{}];
  photoPairsObj: {}[] = [{}];
  videosObj: { videoURL: string, caption: string}[] = [{ videoURL: '', caption: 'Test'}];
  experienceBenefits: any;
  form: FormGroup;
  benefitOBJ: any;
  videoURL: any = '';
  youtubeEmbedCode: any = '';
  spinner = false;
  userLoggedIn = false;
  redirectUrl: any;
  imageSelectedValue: any = 'option1';
  logoutTo: any = '';

  constructor(

    private wp: WordpressService,
    private router: Router,
    private route: ActivatedRoute,
    private data: DataService,
    private modalService: ModalService,
    private formBuilder: FormBuilder,
    private _sanitizer: DomSanitizer) {
  }

  ngOnInit() {

    this.logoutTo = apiUrl;

    if (JSON.parse(localStorage.getItem('signInStatus')) !== null) {
      this.userLoggedIn = JSON.parse(localStorage.getItem('signInStatus'));
    }

    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });

    this.benefitOBJ = this.singlePhoto = this.pairPhoto =  {};
    this.uploadStatus = {status: false, type: '', text: ''}
    this.newUserData = {
      shortDescription: '',
      longDescription: '',
      productDescription: '',
      benefits: [],
      creator: {firstName: '', profession: '', age: ''},
      photos: this.photosObj,
      photoPairs: this.photoPairsObj,
      videos: this.videosObj
    };

    this.wp.getExperienceBenefits().subscribe((res:any)=>{
      this.experienceBenefits = res.result.benefits;
    });

    this.data.currentExperience.subscribe((res: any) => {

      if(Object.keys(res).length) {
        this.newUserData = res;
        this.spinner = false;
      }else {
        this.wp.getUserExperience().subscribe((data: any) => {
          let status = JSON.parse(data);
          if(status.error || status.exp_token_error){

          } else {
            this.newUserData = JSON.parse(data);
            this.spinner = false;
            this.selectedExpVideoAndImage();
          }
        },

        /*this.wp.getExperienceByRef().subscribe((data: any) => {
          if(data.error || data.exp_token_error){

          } else {
            this.newUserData = data.result;
            this.selectedExpVideoAndImage();
          }
        },*/

        (err) => {},
        () => {
          this.selectedBenefit();
        });
      }
    });
    
    this.selectedExpVideoAndImage();
    this.selectedBenefit();
    this.form = this.formBuilder.group({
      avatar: [''],
      wistia: ['']
    });
    this.route.queryParamMap.subscribe(params => {
      this.expLessonID = params.get('explesson');
    });
    
  }

  selectedBenefit() {
    let benefitArray = [];
    if(this.newUserData.benefits.length) {
      this.newUserData.benefits.forEach(element => {
        if(element.benefitId != undefined && element.benefitId != '') {
          this.benefitOBJ[element.benefitId] = true;
          benefitArray.push(element.benefitId);
        }else {
          this.benefitOBJ[element] = true;
          benefitArray.push(element);
        }
      });
    }
    this.newUserData.benefits = benefitArray;
  }

  selectedExpVideoAndImage() {

    this.videoData = this.newUserData.videos[0];
    this.singlePhoto = this.newUserData.photos[0];
    this.pairPhoto = this.newUserData.photoPairs[0];

    if(this.singlePhoto != undefined) {
      if(Object.keys(this.singlePhoto).length) {
        this.imageSelectedValue = 'option2';
        this.newUserData.photos[0].photoFileName = this.singlePhoto.photoName;
      }
    } else {
      this.singlePhoto = { photoURL: ''};
      // this.newUserData.photos = [{}];
    }
    if(this.pairPhoto != undefined) {
      if(Object.keys(this.pairPhoto).length) {
        this.imageSelectedValue = 'option1';
      }
    }else {
      this.pairPhoto = { beforePhotoURL: '', afterPhotoURL: ''};
      // this.newUserData.photoPairs = [{}];
    }

    if(this.videoData != undefined) {
      if(Object.keys(this.videoData).length) {
        this.videoURL = this.videoData.videoURL;
        if (this.videoURL == undefined) {
          this.videoURL = "";
        }
        if(this.videoURL.match(/youtube/g) != null) {
          this.userData.videoURL = this.videoURL;
          this.videoURL = '';
          this.contentValue = 'option2';
        }else {
          this.contentValue = 'option1';
        }
      }
    }else {
      this.newUserData.videos = [{}];
    }
  }

  onNextLesson(currentLessonID, nextLessonID) {

    if(this.userData.birthDate) {
      let currentDate = new Date();
      let currentYear = currentDate.getFullYear();
      let birthYear = this.userData.birthDate.getFullYear();
      let age = currentYear - birthYear;

      this.userData.birthDate = '';
      this.newUserData.creator.age = age;
    }

    if(this.userData.videoURL) {
      this.newUserData.videos[0].videoURL = this.userData.videoURL;
    }



    this.addedToCompleteExpList(currentLessonID);
    this.router.navigate(['/'], {queryParams: {explesson: nextLessonID}});
    this.uploadStatus = {status: false, type: '', text: ''}
    this.data.saveExperienceDataTemp(this.newUserData);
    window.scrollTo(0, 0);
    // console.log(this.newUserData);
  }

  onCompleteExpModal(currentLessonID) {
    this.addedToCompleteExpList(currentLessonID);
    this.data.saveExperienceDataTemp(this.newUserData);
    this.modalService.open('exp-lesson-modal');
    /*let experienceData = JSON.stringify(this.newUserData);
    this.wp.saveExperienceData(experienceData).subscribe((res: any)=>{
      console.log(res);
    })*/
  }

  onExperiencePage() {
    this.router.navigate(['/'], {queryParams: {page: 'experience'}});
    this.data.nameChange('ExperienceComponent');
  }

  addedToCompleteExpList(currentLessonID) {

    let ExpLessonArray = JSON.parse(localStorage.getItem('ExpLesson'));
    if (ExpLessonArray === null ) {
      ExpLessonArray = [];
    }

    if ( !ExpLessonArray.includes(currentLessonID)) {
      ExpLessonArray.push(currentLessonID);
    }

    localStorage.setItem('ExpLesson', JSON.stringify(ExpLessonArray));
  }

  onClickRadio(value) {
    // console.log(value);
    this.uploadStatus = { status: false, type: '', text: ''}
    this.contentValue = value;
  }

  onClickImageRadio(value) {
    // console.log(value);
    this.uploadStatus = { status: false, type: '', text: ''}
    this.imageSelectedValue = value;
  }

  onUploadingProgress() {
    this.uploadStatus.type = '';
    this.uploadStatus.text = 'uploading';
    this.uploadStatus.status = true;
    return;
  }

  onProgressCompleted() {
    this.uploadStatus.type = 'success';
    this.uploadStatus.text = 'uploaded';
    this.uploadStatus.status = true;
    return;
  }

  onFileSelect(event, uploadType) {
    if (event.target.files.length > 0) {

      this.onUploadingProgress();
      const file = event.target.files[0];
      this.form.get('avatar').setValue(file);
      this.uploadImageFile(uploadType);
    }
  }

  uploadImageFile(uploadType) {
    const formData = new FormData();
    formData.append('avatar', this.form.get('avatar').value);

    this.wp.uploadFile(formData).subscribe(
      (res: any) => {
        let response = JSON.parse(res);
        /*this.newUserData.photos[0].photoURL = response.url;
        this.newUserData.photos[0].photoName = response.name;
        this.singlePhoto = this.newUserData.photos[0];*/
        if(uploadType == 'before') {

          if(this.newUserData.photoPairs[0] == undefined) {
            this.newUserData.photoPairs = [{}];
          }
          this.newUserData.photoPairs[0].beforeCaption = 'Another test before';
          this.newUserData.photoPairs[0].beforePhotoName = response.name;
          this.pairPhoto.beforePhotoURL = response.url;
          console.log('before');
        }else if(uploadType == 'after') {
          if(this.newUserData.photoPairs[0] == undefined) {
            this.newUserData.photoPairs = [{}];
          }
          this.newUserData.photoPairs[0].afterCaption = 'Another test after';
          this.newUserData.photoPairs[0].afterPhotoName = response.name;
          this.pairPhoto.afterPhotoURL = response.url;
          console.log('after');
        }else {
          if(this.newUserData.photos[0] == undefined) {
            this.newUserData.photos = [{}];
          }
          this.newUserData.photos[0].caption = 'Some test caption';
          this.newUserData.photos[0].photoFileName = response.name;
          this.singlePhoto.photoURL = response.url;
          console.log('single');
        }
      },
      (err) => {
        console.log(err);
      },
      () => {
        this.onProgressCompleted();
      }
    );
  }

  onVideoFileSelect(event) {
    if (event.target.files.length > 0) {
      this.onUploadingProgress();
      const file = event.target.files[0];
      this.form.get('wistia').setValue(file);
      this.uploadVideoFile();
    }
  }

  uploadVideoFile() {
    const formData = new FormData();
    formData.append('wistia', this.form.get('wistia').value);

    this.wp.uploadVideoFile(formData).subscribe(
      (res: any) => {
        // console.log(res);
        let response = JSON.parse(res);
        this.newUserData.videos[0].videoURL = response.hashed_id;
        this.videoURL = response.hashed_id;
        this.userData.videoURL = '';
      },
      (err) => {
        console.log(err);
      },
      () => {
        this.onProgressCompleted();
        // console.log(this.videoURL);
      }
    );
  }

  /*onUploadVideoByUrl() {
    let videoURL = this.userData.videoURL;
    this.videoURL = '';
    this.newUserData.videos[0].videoURL = videoURL;
    console.log(this.newUserData.videos[0].videoURL);
  }*/

  onBenefitSelect() {
    this.newUserData.benefits = [];
    for (let [key, value] of Object.entries(this.benefitOBJ)) {
      if(value) {
        if(!this.newUserData.benefits.includes(key)) {
          this.newUserData.benefits.push(key);
        }
      }
    }

  }

  videoOptionChecked(optionName) {
    if(this.contentValue == optionName) {
      return true;
    }else {
      return false;
    }
  }

  imageOptionChecked(optionName) {
    if(this.imageSelectedValue == optionName) {
      return true;
    }else {
      return false;
    }
  }

  ngAfterContentChecked() { }

  ngAfterViewInit() {
    // this.videoURL = this.newUserData.videos[0].videoURL;
    /*if(this.videoURL.match(/youtube/g) != null) {
      this.userData.videoURL = this.videoURL;
      this.videoURL = '';
      this.contentValue = 'option2';
    }else {
      this.contentValue = 'option1';
    }*/
   
    /*if(this.pairPhoto) {
      this.imageSelectedValue = 'option1';
    }else {
      this.imageSelectedValue = 'option2';
    }*/
  }

  removeExperienceVideo() {
    this.videoURL = '';
  }

  removeBeforePhoto() {
    this.pairPhoto.beforePhotoURL = '';
    if(this.pairPhoto.afterPhotoURL != ''){
      this.newUserData.photoPairs[0]
      this.newUserData.photoPairs[0]
    }else {
      this.newUserData.photoPairs = [];
    }
  }

  removeAfterPhoto() {
    this.pairPhoto.afterPhotoURL = '';
    if(this.pairPhoto.beforePhotoURL != '') {
      this.newUserData.photoPairs[0].afterCaption = '';
      this.newUserData.photoPairs[0].afterPhotoName = '';
    } else {
      this.newUserData.photoPairs = [];
    }
  }

  removePairPhoto() {
    this.singlePhoto.photoURL = '';
    this.newUserData.photos = [];
  }

  onClickSignOut() {
    localStorage.removeItem('signInStatus');
    localStorage.removeItem('Index');
    localStorage.removeItem('Lesson');
    localStorage.removeItem('UserID');
    this.wp.logout().subscribe((data: any) => {
      // this.data.nameChange('AppComponent');
      window.location.href = this.logoutTo;;
    });
  }

}
