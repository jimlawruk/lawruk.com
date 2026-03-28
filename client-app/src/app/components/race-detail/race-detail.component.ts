import { Component, OnInit, OnDestroy, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RaceService } from '../../services/race.service';
import { RaceModel } from '../../models/race.model';

@Component({
  selector: 'app-race-detail',
  standalone: false,
  templateUrl: './race-detail.component.html',
  styleUrls: ['./race-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RaceDetailComponent implements OnInit, OnDestroy {
  race: RaceModel | null = null;
  safeHtml: SafeHtml | null = null;
  loading = true;
  error = '';

  private filterInput: HTMLInputElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private raceService: RaceService,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {}

  async ngOnInit(): Promise<void> {
    const url = this.route.snapshot.paramMap.get('url') ?? '';
    try {
      this.race = await this.raceService.getRaceDetail(url);
      if (this.race?.text) {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.race.text);
      }
      this.titleService.setTitle(`${this.race?.title ?? 'Race'} | Lawruk.com`);
      setTimeout(() => this.setupRowFilter());
    } catch (e) {
      this.error = 'Race not found.';
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.filterInput?.removeEventListener('input', this.onFilterInput);
  }

  private setupRowFilter(): void {
    const detail: HTMLElement | null = this.el.nativeElement.querySelector('.race-detail');
    if (!detail) return;

    const table = detail.querySelector('table');
    if (!table) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'race-filter-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Filter results…';
    input.className = 'form-control race-filter-input';
    wrapper.appendChild(input);

    // Insert after the last h1/h2 block, or just before the first table
    const headers = detail.querySelectorAll('h1, h2, H1, H2');
    const lastHeader = headers.length > 0 ? headers[headers.length - 1] : null;
    if (lastHeader && lastHeader.nextSibling) {
      lastHeader.parentNode!.insertBefore(wrapper, lastHeader.nextSibling);
    } else if (lastHeader) {
      lastHeader.parentNode!.appendChild(wrapper);
    } else {
      table.parentNode!.insertBefore(wrapper, table);
    }

    this.filterInput = input;
    input.addEventListener('input', this.onFilterInput);

    // Match wrapper width to the table's actual rendered width
    requestAnimationFrame(() => {
      wrapper.style.width = table.offsetWidth + 'px';
    });
  }

  private onFilterInput = (): void => {
    const detail: HTMLElement | null = this.el.nativeElement.querySelector('.race-detail');
    if (!detail || !this.filterInput) return;

    const words = this.filterInput.value.trim().toLowerCase()
      .split(/\s+/).filter(w => w.length > 0);

    detail.querySelectorAll('tbody tr').forEach(row => {
      const text = row.textContent?.toLowerCase() ?? '';
      (row as HTMLElement).style.display =
        words.length === 0 || words.every(w => text.includes(w)) ? '' : 'none';
    });
  };
}
