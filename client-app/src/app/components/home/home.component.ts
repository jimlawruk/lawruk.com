import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { SiteMetaService } from '../../services/site-meta.service';
import { SiteMetaItem } from '../../models/site-meta.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  items: SiteMetaItem[] = [];
  introHtml: SafeHtml = '';
  profilesHtml: SafeHtml = '';

  constructor(
    private titleService: Title,
    private siteMetaService: SiteMetaService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.titleService.setTitle('Lawruk.com');
  }

  async ngOnInit(): Promise<void> {
    const [items, intro, profiles] = await Promise.all([
      this.siteMetaService.getItems(),
      lastValueFrom(this.http.get('/home-html/intro.html', { responseType: 'text' })).catch(() => ''),
      lastValueFrom(this.http.get('/home-html/profiles.html', { responseType: 'text' })).catch(() => '')
    ]);
    this.items = items;
    this.introHtml = this.sanitizer.bypassSecurityTrustHtml(intro);
    this.profilesHtml = this.sanitizer.bypassSecurityTrustHtml(profiles);
  }

  isExternal(link: string): boolean {
    return link.startsWith('http');
  }
}
