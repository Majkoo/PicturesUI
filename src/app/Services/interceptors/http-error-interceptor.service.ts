import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from 'rxjs/internal/Observable';
import {catchError, delay, mergeMap, retryWhen, tap} from "rxjs/operators";
import {of, throwError} from "rxjs";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {SessionStorageServiceService} from "../data/session-storage-service.service";
import {ErrorInfoModel} from "../../Models/JsonModels/ErrorInfoModel";

export const retryCount: number = 2;
export const delayMs: number = 2000;

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptorService implements HttpInterceptor {
  constructor(
    private router: Router,
    private message: MessageService,
    private sessionStorageService: SessionStorageServiceService,
    ) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        retryWhen((error) => {
          return error.pipe(
            mergeMap((error, index) => {
              if ((index < retryCount) && !((req.method === "GET") && (error.status === 404))) return of(error).pipe(delay(delayMs));
              throw error;
            })
          );
        }),
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error.status, req, error);
        })
      );
  }

  private handleError(status: number, req: HttpRequest<any>, error: HttpErrorResponse) {
    this.message.clear();
    let date = new Date();
    let errMsg: ErrorInfoModel = {
      date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      status: status.toString(),
      error: error,
      request: req
    }
    this.sessionStorageService.pushError(errMsg);
    switch (status) {
      case (401): {
        return throwError(() => {
          if (error.error) {
            if (error.error.contains("auth token")) {
              return error;
            }
          }
          this.message.add({
            severity:'error',
            summary: 'Niepowodzenie',
            detail: 'Nie uda??o si?? wykona?? operacji. Do jej wykonania konieczne jest zalogowanie si??.'
          });
          return error;
        });
      }
      case (403): {
        return throwError(() => {
          this.message.add({
            severity:'error',
            summary: 'Niepowodzenie',
            detail: 'Nie uda??o si?? wykona?? operacji. Nie masz uprawnie??.'
          });
          return error;
        });
      }
      case (404): {
        return throwError(() => {
          if (req.method !== "GET") {
            this.message.add({
              severity:'warn',
              summary: 'Niepowodzenie',
              detail: 'Nie uda??o si?? wykona?? operacji. Zas??b jest niedost??pny. Prawdopodobnie zosta?? usuni??ty lub ukryty.'
            });
            return error;
          }
          return error;
        })
      }
      default: {
        if (req.url.endsWith('/picture/create')) {
          this.message.add({
            severity:'error',
            summary: 'Niepowodzenie',
            detail: 'Nie uda??o si?? zapostowa?? obrazka. Przepraszamy za utrudnienia.'
          });
        }
        if (status.toString().startsWith("5")) {
          return throwError(() => {
            this.router.navigate(['/error500']);
            return error;
          });
        }
        this.message.add({
          severity:'error',
          summary: 'Niepowodzenie',
          detail: 'Co?? posz??o nie tak. Przeraszamy za utrudnienia.'
        });
        return throwError(() => {return error;});
      }
    }
  }

}
