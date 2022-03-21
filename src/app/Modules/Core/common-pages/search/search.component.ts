import {Component, OnInit, ViewChild} from '@angular/core';
import {PicturePagedResult} from "../../../../Models/ApiModels/PicturePagedResult";
import {Router} from "@angular/router";
import { HttpServiceService } from 'src/app/Services/http/http-service.service';
import { HttpParamsServiceService } from 'src/app/Services/http/http-params-service.service';
import {MessageService} from "primeng/api";
import {AuthServiceService} from "../../../../Services/data/auth-service.service";
import {AccountPagedResult} from "../../../../Models/ApiModels/AccountPagedResult";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @ViewChild('picPaginator') picPaginator: any;
  @ViewChild('accPaginator') accPaginator: any;
  picPage: number = 1;
  accPage: number = 1;

  picturesResult: PicturePagedResult = {
    items:[],
    page:0,
    pageSize: 0,
    totalItems:0
  }
  accountsResult: AccountPagedResult = {
    items:[],
    page:0,
    pageSize: 0,
    totalItems:0
  }

  constructor(
    private httpService: HttpServiceService,
    private paramsService: HttpParamsServiceService,
    private messageService: MessageService,
    private authService: AuthServiceService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.paramsService.setSearchPageNumber(1);
  }

  searchPictures() {
    this.clearSearch();
    this.httpService.searchPicturesRequest().subscribe({
      next: (val: PicturePagedResult) => {
        this.picturesResult = val;
        this.messageService.add({
          severity:'success',
          summary: 'Sukces',
          detail: `Znaleziono ${val.totalItems} wyników dla "${this.paramsService.SearchQuery.searchPhrase}"`
        });
        this.clearAccountsResult();
        this.picPaginator.updateCurrentPage(val.page);
        this.picPaginator.updatePages(val.totalItems);
      },
      error: () => {
        this.messageService.add({
          severity:'error',
          summary: 'Niepowodzenie',
          detail: `Nie znaleziono żadnych wyników dla "${this.paramsService.SearchQuery.searchPhrase}"`});
      }
    });
  }
  searchAccounts() {
    this.clearSearch();
    this.httpService.searchAccountsRequest().subscribe({
      next: (val: AccountPagedResult) => {
        this.accountsResult = val;
        this.messageService.add({
          severity:'success',
          summary: 'Sukces',
          detail: `Znaleziono ${val.totalItems} wyników dla "${this.paramsService.SearchQuery.searchPhrase}"`
        });
        this.clearPictureResult();
        this.accPaginator.updateCurrentPage(val.page);
        this.accPaginator.updatePages(val.totalItems);
      },
      error: () => {
        this.messageService.add({
          severity:'error',
          summary: 'Niepowodzenie',
          detail: `Nie znaleziono żadnych wyników dla "${this.paramsService.SearchQuery.searchPhrase}"`});
      }
    });
  }
  clearSearch() {
    this.clearAccountsResult();
    this.clearPictureResult();
  }

  paginate(val: any): void {
    this.authService.updateLikes();
    this.paramsService.setSearchPageNumber(val+1);
    this.updatePage();
    this.fetchPictures();
  }
  paginateAccs(val: any): void {
    this.authService.updateLikes();
    this.paramsService.setSearchPageNumber(val+1);
    this.updatePage();
    this.fetchAccounts();
  }

  private clearPictureResult() {
    this.picturesResult = {
      items:[],
      page:0,
      pageSize: 0,
      totalItems:0
    }
  }
  private clearAccountsResult() {
    this.accountsResult = {
      items:[],
      page:0,
      pageSize: 0,
      totalItems:0
    }
  }

  private fetchPictures(): void {
    this.httpService.searchPicturesRequest().subscribe({
      next: (val: PicturePagedResult) => {
        this.picturesResult = val;
        document.body.scrollTop = 0;
        this.picPaginator.updateCurrentPage(val.page);
        this.picPaginator.updatePages(val.totalItems);
      }
    });
  }
  private fetchAccounts(): void {
    this.httpService.searchAccountsRequest().subscribe({
      next: (val: AccountPagedResult) => {
        this.accountsResult = val;
        document.body.scrollTop = 0;
        this.accPaginator.updateCurrentPage(val.page);
        this.accPaginator.updatePages(val.totalItems);
      }
    });
  }

  private updatePage(): void {
    this.picPage = this.paramsService.getPageNumber();
    this.accPage = this.paramsService.getPageNumber();
  }

}
