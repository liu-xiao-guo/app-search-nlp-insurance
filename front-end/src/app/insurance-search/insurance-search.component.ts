import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, fromEvent, Observable, of, tap } from 'rxjs';
import { QAPair } from '../models/qa-pair';
import { QAResult } from '../models/qa-results';
import { InsuranceSearchService } from '../services/insurance-search.service';

@Component({
  selector: 'app-insurance-search',
  templateUrl: './insurance-search.component.html',
  styleUrls: ['./insurance-search.component.scss']
})
export class InsuranceSearchComponent {
  @ViewChild('insuranceSearchInput', { static: true })
  insuranceSearchInput!: ElementRef;
  proposals: any;
  proposalService: any;
  data$: Observable<QAResult[]> = of([]);

  constructor(private insuranceSearchService:InsuranceSearchService){}

  myControl = new FormControl('');


  ngOnInit() {
  }

  displayedColumns: string[] = ['position', 'name'];



  ngAfterViewInit() {
    
    // server-side search
    // https://www.freakyjolly.com/angular-rxjs-debounce-time-optimize-search-for-server-response/
    fromEvent(this.insuranceSearchInput.nativeElement,'keyup')
        .pipe(
            filter(Boolean),
            debounceTime(1000),
            distinctUntilChanged(),
            tap((text) => {
              console.log(this.insuranceSearchInput.nativeElement.value)
            })
        )
        .subscribe(
          res => {
            console.log('Subscribe: ' + this.insuranceSearchInput.nativeElement.value);
            const query = this.insuranceSearchInput.nativeElement.value
            this.data$ = this.insuranceSearchService.semanticSearch(query).pipe(tap(val => console.log(val)));

          }
        );
    }
}
