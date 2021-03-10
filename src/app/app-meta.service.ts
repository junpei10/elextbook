import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface AppMetaData {
  title?: string;
  desc?: string;
  themeColor?: string;
  keywords?: string;
  noIndex?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppMeta {
  commonTitle: string;
  titleDivider: string;
  defaultTitle: string;

  constructor(
    private _titleService: Title,
    private _metaService: Meta,
  ) {}

  updateMeta(metaData: AppMetaData): void {
    const meta = this._metaService;
    if (metaData.desc) { meta.updateTag({ name: 'description', content: metaData.desc }); }
    if (metaData.themeColor) { meta.updateTag({ name: 'theme-color', content: metaData.themeColor }); }
    if (metaData.keywords) { meta.updateTag( { name: 'keywords', content: metaData.keywords }); }
    if (metaData.noIndex) { meta.updateTag({ name: 'robots', content: 'noindex' }); }

    this._titleService.setTitle(
      (metaData.title || this.defaultTitle) + this.titleDivider + this.commonTitle
    );
  }
}

