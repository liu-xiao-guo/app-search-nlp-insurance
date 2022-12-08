import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QAPair } from '../models/qa-pair';
import { QAResult } from '../models/qa-results';

// const baseUrl = '/api/semantic-search';

@Injectable({
  providedIn: 'root'
})
export class InsuranceSearchService {

  constructor(private http:HttpClient) { }

  semanticSearch(query:string): Observable<QAResult[]> {
    query = query.trim();

    const options = query ? { params: new HttpParams().set('query', query) } : {};
    return this.http.get<QAResult[]>('api/semantic-search', options);
  }
}
