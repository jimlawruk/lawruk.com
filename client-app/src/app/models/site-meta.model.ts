export interface SiteMetaItem {
  type: string;
  title: string;
  link: string;
  imagePath: string;
}

export interface SiteMeta {
  items: SiteMetaItem[];
}
