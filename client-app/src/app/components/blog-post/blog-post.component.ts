import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { SiteMetaService } from '../../services/site-meta.service';

@Component({
  selector: 'app-blog-post',
  standalone: false,
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent implements OnInit, AfterViewInit {
  safeHtml: SafeHtml | null = null;
  loading = true;
  error = '';
  private pendingScripts: { src?: string; content?: string; type?: string }[] = [];

  @ViewChild('contentContainer') contentContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private siteMetaService: SiteMetaService
  ) {}

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const title = await this.siteMetaService.getBlogTitle(slug);
    if (title) {
      this.titleService.setTitle(`${title} | Lawruk.com`);
    }
    try {
      const html = await lastValueFrom(
        this.http.get(`/blog-html/${slug}.html`, { responseType: 'text' })
      );
      // Extract script tags to run separately
      this.pendingScripts = this.extractScripts(html);
      const stripped = this.stripScripts(html);
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(stripped);
    } catch (e) {
      this.error = 'Blog post not found.';
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // Inject scripts after view updates
    setTimeout(() => this.runPendingScripts(), 100);
  }

  private extractScripts(html: string): { src?: string; content?: string; type?: string }[] {
    const scripts: { src?: string; content?: string; type?: string }[] = [];
    const regex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const attrs = match[1];
      const content = match[2].trim();
      const srcMatch = /src=["']([^"']+)["']/.exec(attrs);
      const typeMatch = /type=["']([^"']+)["']/.exec(attrs);
      scripts.push({
        src: srcMatch?.[1],
        content: content || undefined,
        type: typeMatch?.[1]
      });
    }
    return scripts;
  }

  private stripScripts(html: string): string {
    return html.replace(/<script[\s\S]*?<\/script>/gi, '');
  }

  private runPendingScripts(): void {
    const scripts = [...this.pendingScripts];
    this.pendingScripts = [];
    this.runScriptsSequentially(scripts, 0);
  }

  private runScriptsSequentially(scripts: { src?: string; content?: string; type?: string }[], index: number): void {
    if (index >= scripts.length) return;
    const s = scripts[index];
    const scriptEl = document.createElement('script');
    if (s.type) scriptEl.type = s.type;
    if (s.src) {
      scriptEl.src = s.src;
      scriptEl.onload = () => this.runScriptsSequentially(scripts, index + 1);
      scriptEl.onerror = () => this.runScriptsSequentially(scripts, index + 1);
      document.body.appendChild(scriptEl);
    } else if (s.content) {
      scriptEl.textContent = s.content;
      document.body.appendChild(scriptEl);
      this.runScriptsSequentially(scripts, index + 1);
    } else {
      this.runScriptsSequentially(scripts, index + 1);
    }
  }
}
