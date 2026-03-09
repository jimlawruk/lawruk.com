import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RaceService } from '../../services/race.service';
import { RaceModel } from '../../models/race.model';

@Component({
  selector: 'app-race-results',
  standalone: false,
  templateUrl: './race-results.component.html',
  styleUrls: ['./race-results.component.css']
})
export class RaceResultsComponent implements OnInit {
  allRaces: RaceModel[] = [];
  filteredRaces: RaceModel[] = [];
  loading = true;
  error = '';

  filterDate = '';
  filterTitle = '';
  filterDistance = '';
  filterCity = '';
  filterState = '';

  sortCol = 0;
  sortAsc = false;

  readonly distanceOptions = [
    { value: '', label: 'All' },
    { value: '1M', label: 'Mile' },
    { value: '5K', label: '5K' },
    { value: '10K', label: '10K' },
    { value: '10M', label: '10M' },
    { value: 'HM', label: 'HM' },
    { value: 'M', label: 'M' }
  ];

  readonly columnKeys: (keyof RaceModel)[] = [
    'dateTimeDisplay', 'title', 'distance', 'city', 'state'
  ];

  constructor(private raceService: RaceService, private titleService: Title) {
    this.titleService.setTitle('Race Results | Lawruk.com');
  }

  async ngOnInit(): Promise<void> {
    try {
      const races = await this.raceService.getRaceResults();
      this.allRaces = races.sort((a, b) =>
        b.dateTimeDisplay.localeCompare(a.dateTimeDisplay)
      );
      this.filteredRaces = [...this.allRaces];
    } catch (e) {
      this.error = 'Failed to load race results.';
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    const fd = this.filterDate.toLowerCase();
    const ft = this.filterTitle.toLowerCase();
    const fc = this.filterCity.toLowerCase();
    const fs = this.filterState.toLowerCase();
    const fDist = this.filterDistance;

    this.filteredRaces = this.allRaces.filter(r => {
      const distMatch = !fDist || r.distance === fDist;
      return (
        r.dateTimeDisplay.toLowerCase().includes(fd) &&
        r.title.toLowerCase().includes(ft) &&
        distMatch &&
        r.city.toLowerCase().includes(fc) &&
        r.state.toLowerCase().includes(fs)
      );
    });

    this.applySort();
  }

  sortBy(colIndex: number): void {
    if (colIndex === 5) return; // Map column
    this.sortAsc = this.sortCol === colIndex ? !this.sortAsc : true;
    this.sortCol = colIndex;
    this.applySort();
  }

  private applySort(): void {
    const key = this.columnKeys[this.sortCol];
    this.filteredRaces = [...this.filteredRaces].sort((a, b) => {
      const valA = String(a[key] ?? '');
      const valB = String(b[key] ?? '');
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }
}
