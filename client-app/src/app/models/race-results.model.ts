import { RaceModel } from './race.model';

export interface RaceResultsModel {
  pageType: string;
  pageTitle: string;
  raceResults: RaceModel[];
}
