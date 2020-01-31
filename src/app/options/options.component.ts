import { WordpressService } from './../services/wordpress.service';
import { DataService } from './../services/data.service';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from './../services/modal.service';

declare let apiUrl:any

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {

  menuOpened: boolean = false;
  userLoggedIn = false;
  @Input() openedIn: boolean;
  currentPage: any;
  redirectUrl: any;
  countryList: any;
  inviteEmail: any;
  invitePageURL: any;
  emailMessage: any = '';
  logoutTo: any = '';

  constructor(private data: DataService, private wp: WordpressService, private router: Router, private route: ActivatedRoute, private modalService: ModalService) {}

  ngOnInit() {
    this.logoutTo = apiUrl;
    this.openedIn = false;
    if (JSON.parse(localStorage.getItem('signInStatus')) !== null) {
      this.userLoggedIn = JSON.parse(localStorage.getItem('signInStatus'));
    }
    this.route.queryParams.subscribe(res=>{
      // console.log(res.page);
      if(res.page) {
        this.currentPage = res.page;
      } else {
        this.currentPage = '';
      }
    });

    this.wp.setUserLogin().subscribe((res: any) => {
      const url = JSON.parse(res);
      this.redirectUrl = url.url;
    });

    this.wp.getActiveCountryList().subscribe((res: any)=>{
      this.countryList = JSON.parse(res);
    });


    // console.log(this.route);
  }

  onClickDone() {
    this.data.nameChange('HomeComponent');
  }

  onHomePage() {
    this.router.navigate(['/']);
    this.data.nameChange('HomeComponent');
  }

  onExperiencePage() {
    this.router.navigate(['/'], {queryParams: {page: 'experience'}});
    this.data.nameChange('ExperienceComponent');
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

  toggleSidebar() {
    this.menuOpened = !this.menuOpened;
  }

  onInvite() {
    this.data.nameChange('InviteComponent');
  }


  /*openInviteModal() {
    this.modalService.open('invite-modal');
    this.menuOpened = false;
  }*/

  /*inviteByEmail() {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.inviteEmail)) {

      this.invitePageURL = 'https://challenge.com/preview/member'+this.router.url;
      console.log(this.inviteEmail, this.invitePageURL);
      let mailData = {'email_to' : this.inviteEmail, 'share_url' : this.invitePageURL};
      this.wp.sendMail(mailData).subscribe((res:any) => {
        let result = JSON.parse(res);
        if(result.act == 'success') {
          this.emailMessage = 'Email send successfully';
        } else {
          this.emailMessage = 'Email not send';
        }
      });
    }else {
      this.emailMessage = 'Invalid Email Address';
    }
  }

  shareLinkOnSocial(name) {
    let shareLink = ''
    this.invitePageURL = 'https://challenge.com/preview/member'+this.router.url;
    this.invitePageURL = encodeURIComponent(this.invitePageURL);
    if(name == 'facebook') {
      shareLink = 'https://www.facebook.com/sharer/sharer.php?u='+this.invitePageURL;
    } else {
      shareLink = 'https://twitter.com/share?url='+this.invitePageURL;
    }
    
    window.open(shareLink, '', 'width=600, height=400, scrollbars=no');
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }*/

  onLogin() {
    window.open(this.redirectUrl, "_self");
  }

  onGetHelp() {
    window.open('https://support.justpruvit.com/hc/en-us');
  }


}
