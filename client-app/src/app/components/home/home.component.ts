import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
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

  constructor(private titleService: Title, private siteMetaService: SiteMetaService) {
    this.titleService.setTitle('Lawruk.com');
  }

  async ngOnInit(): Promise<void> {
    this.items = await this.siteMetaService.getItems();
  }

  isExternal(link: string): boolean {
    return link.startsWith('http');
  }
}
