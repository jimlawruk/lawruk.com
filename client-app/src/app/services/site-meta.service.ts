import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteMeta, SiteMetaItem } from '../models/site-meta.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiteMetaService {
  private cache: SiteMeta | null = null;

  constructor(private http: HttpClient) {}

  async getItems(): Promise<SiteMetaItem[]> {
    if (!this.cache) {
      this.cache = await lastValueFrom(this.http.get<SiteMeta>('/site.meta.json'));
    }
    return this.cache.items;
  }

  async getBlogTitle(slug: string): Promise<string | undefined> {
    const items = await this.getItems();
    const blogLink = `/blog/${slug}`;
    const item = items.find(i => i.link === blogLink);
    return item?.title;
  }
}
