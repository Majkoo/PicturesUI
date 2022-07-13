import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CropperComponent} from "angular-cropperjs";
import {CropperSettings} from "ngx-image-cropper/lib/interfaces/cropper.settings";

@Component({
  selector: 'app-picture-cropper',
  templateUrl: './picture-cropper.component.html',
  styleUrls: ['./picture-cropper.component.scss']
})
export class PictureCropperComponent {
  @ViewChild("cropper") cropperComponent!: CropperComponent;
  @Output() onCroppedFileSubmit: EventEmitter<Blob> = new EventEmitter<Blob>();

  cropperDataUrl: string = "";
  awaitSubmit = false;

  @Input() config: Partial<CropperSettings> = {
    aspectRatio: 1,
    alignImage: "center",
    resizeToWidth: 256
  }
  @Input() showDefaultSubmitButton: boolean = true;

  onFileSelect(event: any) {
    const file: File = event.currentFiles[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      this.cropperDataUrl = reader.result as string;
      this.awaitSubmit = false;
    }
    reader.readAsDataURL(file);
  }

  onFileCancel() {
    this.cropperDataUrl = "";
  }

  public crop() {
    this.awaitSubmit = true;
    this.cropperComponent.cropper.crop()
    const blob = this.dataURItoBlob(this.cropperComponent.cropper.getCroppedCanvas().toDataURL());
    this.onCroppedFileSubmit.emit(blob);
    this.cropperComponent.cropper.disable();
  }

  private dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }

}
