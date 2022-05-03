import {Component} from '@angular/core';

@Component({
  selector: 'app-post-picture',
  templateUrl: './post-picture.component.html',
  styleUrls: ['./post-picture.component.scss']
})
export class PostPictureComponent {
  currentStep: number = 1;
  goto(val: number) {
    this.currentStep = val;
  }
}
