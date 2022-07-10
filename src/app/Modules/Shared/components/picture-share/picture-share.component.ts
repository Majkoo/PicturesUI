import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {ConfigServiceService} from "../../../../Services/data/config-service.service";

@Component({
  selector: 'app-picture-share',
  templateUrl: './picture-share.component.html',
  styleUrls: ['./picture-share.component.scss']
})
export class PictureShareComponent implements OnInit {
  @Output() onCopy: EventEmitter<any> = new EventEmitter<any>();
  @Input() pictureId!: string;
  url: string = "";

  constructor(
    private configService: ConfigServiceService,
    private messageService: MessageService,
    private clipboard: Clipboard,
  ) { }

  ngOnInit() {
    this.url = `${this.configService.getConfig().appWebUrl}/picture/${this.pictureId}`;
  }

  copyUrl(textToCopy: string) {
    this.messageService.clear();
    this.clipboard.copy(textToCopy);
    this.onCopy.emit();
    this.messageService.add({
      severity: 'success',
      summary: 'Sukces!',
      detail: 'Pomyślnie skopiowano adres obrazka!',
    })
  }
}
