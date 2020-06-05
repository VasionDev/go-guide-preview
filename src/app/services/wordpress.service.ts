import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

declare let apiUrl: any;
declare let langCode: any;

@Injectable({
  providedIn: "root",
})
export class WordpressService {
  private apiBaseURL = "";

  constructor(private http: HttpClient) {
    this.apiBaseURL = apiUrl + "wp-json";
    // this.apiBaseURL = 'https://challenge.com/preview/wp-json';
  }

  /*getPosts(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiBaseURL+'/getLearningtools/v2/'
    );
  }*/

  getPosts(): Observable<any[]> {
    return this.http.post<any[]>(
      this.apiBaseURL + "/get-file-lesson/v2/",
      langCode
    );
  }

  getPostsWithLanguages(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiBaseURL + "/get-file-lesson-with-languages/v2/"
    );
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/get-categories/v2/");
  }

  getDownloadModule(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/get-download-module/v2/");
  }

  getDownloadModuleWithLanguage(language: string): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiBaseURL + "/get-download-module/v2/?lang=" + language
    );
  }

  /*getPosts(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiBaseURL+'/getLearningtools/v2/'
    );
  }*/

  login(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/userAuth/v2/");
  }

  logout(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/setUserLogout/v2/");
  }

  saveData(userInfo: any): Observable<any[]> {
    return this.http.post<any[]>(
      this.apiBaseURL + "/sendUserLearnData/v2/",
      userInfo
    );
  }

  setUserLogin(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/setUserLogin/v2/");
  }

  uploadFile(data) {
    return this.http.post<any[]>(this.apiBaseURL + "/image-upload/v2/", data);
  }

  uploadVideoFile(data) {
    return this.http.post<any[]>(this.apiBaseURL + "/video-upload/v2/", data);
  }

  uploadVideoByUrl(url) {
    return this.http.post<any[]>(
      this.apiBaseURL + "/video-upload-url/v2/",
      url
    );
  }

  getUserExperience(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/get-user-experience/v2/");
  }

  saveExperienceData(experienceInfo: any): Observable<any[]> {
    return this.http.post<any[]>(
      this.apiBaseURL + "/save-user-experience/v2/",
      experienceInfo
    );
  }

  getExperienceBenefits(): Observable<any[]> {
    return this.http.get<any[]>(
      "https://pg-app-9dfh2kb0auoxwzcgrca8678kjc14dc.scalabl.cloud/v1/benefits"
    );
  }

  getActiveCountryList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiBaseURL + "/get-country-list/v2/");
  }

  sendMail(emailInfo: any): Observable<any[]> {
    return this.http.post<any[]>(
      this.apiBaseURL + "/send-experience-email/v2/",
      emailInfo
    );
  }

  getExperienceByRef(): Observable<any[]> {
    return this.http.get<any[]>(
      "https://pg-app-9dfh2kb0auoxwzcgrca8678kjc14dc.scalabl.cloud/v1/experiences/refCode/go"
    );
  }
}
