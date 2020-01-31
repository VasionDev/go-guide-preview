import { WordpressService } from './wordpress.service';
import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare let ga: Function;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private wp: WordpressService) {}
  $componentName = new EventEmitter();
  refCode = '';

  private lessonSource = new BehaviorSubject({});
  currentLesson = this.lessonSource.asObservable();

  private dataSource = new BehaviorSubject({});
  currentData = this.dataSource.asObservable();

  private experienceSourceData = new BehaviorSubject({});
  currentExperience = this.experienceSourceData.asObservable();

  nameChange(component: any) {
    this.$componentName.emit(component);
  }

  saveRefCode(code: any) {
    this.refCode=code;
  }

  lessonChange(index: any, lesson: any) {
    this.lessonSource.next({ index, lesson });
    const completedLesson = JSON.parse(localStorage.getItem('Lesson'));
    if (completedLesson !== null) {
      if ( !completedLesson.includes(lesson)) {
        localStorage.setItem('LastLesson', JSON.stringify(index));
      }
    } else {
      localStorage.setItem('LastLesson', JSON.stringify(index));
    }
  }

  dataChange(data: any) {
    this.dataSource.next(data);
  }

  saveExperienceDataTemp(data: any) {
    this.experienceSourceData.next(data);
  }


  eventEmitter(eventCategory: string,
    eventAction: string,
    eventLabel: string = null) {
    ga('send', 'event', {
      eventCategory: eventCategory,
      eventLabel: eventLabel,
      eventAction: eventAction,
      hitCallback: () => {
        console.log(eventLabel);
      }
    });
  }


}
