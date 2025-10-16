import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statistics } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  getAllStatistics(): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(this.apiUrl);
  }

  getStatisticsById(id: number): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/${id}`);
  }

  getStatisticsByDate(date: string): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/date/${date}`);
  }

  getStatisticsByDateRange(startDate: string, endDate: string): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(`${this.apiUrl}/range?start=${startDate}&end=${endDate}`);
  }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }
}