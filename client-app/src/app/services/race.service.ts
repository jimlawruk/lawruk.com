import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RaceModel } from '../models/race.model';
import { RaceResultsModel } from '../models/race-results.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  constructor(private http: HttpClient) {}

  async getRaceResults(): Promise<RaceResultsModel> {
    return lastValueFrom(this.http.get<RaceResultsModel>('/api/race-results'));
  }

  async getRaceDetail(url: string): Promise<RaceModel> {
    return lastValueFrom(this.http.get<RaceModel>(`/api/race-results/${url}`));
  }
}
