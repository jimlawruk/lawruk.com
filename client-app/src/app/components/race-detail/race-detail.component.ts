import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RaceService } from '../../services/race.service';
import { RaceModel } from '../../models/race.model';

@Component({
  selector: 'app-race-detail',
  standalone: false,
  templateUrl: './race-detail.component.html'
})
export class RaceDetailComponent implements OnInit {
  race: RaceModel | null = null;
  safeHtml: SafeHtml | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private raceService: RaceService,
    private titleService: Title,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit(): Promise<void> {
    const url = this.route.snapshot.paramMap.get('url') ?? '';
    try {
      this.race = await this.raceService.getRaceDetail(url);
      if (this.race?.text) {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.race.text);
      }
      this.titleService.setTitle(`${this.race?.title ?? 'Race'} | Lawruk.com`);
    } catch (e) {
      this.error = 'Race not found.';
    } finally {
      this.loading = false;
    }
  }
}
