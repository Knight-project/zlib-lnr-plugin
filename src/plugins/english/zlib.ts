//import { fetchApi, fetchProto, fetchText } from '@libs/fetch';
import { Plugin } from '@typings/plugin';
import { Filters } from '@libs/filterInputs';
import { load as loadCheerio } from 'cheerio';
//import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';
import * as cheerio from 'cheerio';
// import { isUrlAbsolute } from '@libs/isAbsoluteUrl';
// import { storage, localStorage, sessionStorage } from '@libs/storage';
// import { encode, decode } from 'urlencode';
// import dayjs from 'dayjs';
// import { Parser } from 'htmlparser2';

class Zlibrary_plugin implements Plugin.PluginBase {
  id = 'zlibrary';
  name = 'Z Library';
  icon = 'src/en/zlib/zlib.png';
  site = 'https://z-lib.fm';
  version = '1.0.0';
  filters: Filters | undefined = undefined;
  imageRequestInit?: Plugin.ImageRequestInit | undefined = undefined;

  //flag indicates whether access to LocalStorage, SesesionStorage is required.
  webStorageUtilized?: boolean;

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];

    const html: string = await this.getHtml(this.site + '/popular');

    const $: cheerio.CheerioAPI = loadCheerio(html);

    $('div.masonry-endless')
      .find('div.item')
      .each((idx, element) => {
        // Wrap the raw element with Cheerio so we can use Cheerio methods
        const el = $(element);
        const title = el.find('z-cover').attr('title');
        const url = `${el.find('a').attr('href')}`;
        const cover = el.find('z-cover').find('img').attr('src');
        const name = `${title}`;
        const path = `${url.replace(/^\/book\//, '')}`; //.replace('/book/', '');
        // Push the extracted data into the array
        novels.push({
          name,
          path,
          cover,
        });
      });

    return novels;
  }

  async getHtml(url: string) {
    const html = await fetch(url);
    const data = await html.text();
    return data;
  }

  /*async cleanUp(url: string, removePart: string) {
    return url.replace(removePart, '');
  } */
  //Don't ask questions.
  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    // The code under here breaks the plugin
    //
    // The code above here breaks the plugin
    const novelpage = await this.getHtml(`${this.site}/book/${novelPath}`);

    const $ = loadCheerio(novelpage);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: $('div.col-sm-9').find('h1').text().trim(),
    };

    // TODO: get here data from the site and

    novel.name = `${$('div.col-sm-9').find('h1').text().trim()}`;
    // novel.artist = '';
    novel.author = `${$('z-cover').attr('author')}`;
    novel.cover = `${$('z-cover').find('img').attr('src')}`;
    novel.genres = `${$('div.col-sm-9').find('div.bookDetailsBox').find('div.property_value').find('a').text().trim()}`;
    novel.status = NovelStatus.Completed;
    novel.rating = $(
      'div.col-sm-9 div.book-rating-detail div.book-rating span.book-rating-interest-score',
    )
      .text()
      .trim();

    const novelDescription: string = $('div.col-sm-9')
      .find('#bookDescriptionBox')
      .text()
      .trim();

    const formattedNovelDescription: string = novelDescription
      .split(/\n+/)
      .map(p => p.trim())
      .filter(Boolean)
      .join('\n\n');

    const showDesc: string =
      formattedNovelDescription || 'Description Unavailable';

    const type: string =
      $('div.col-sm-9 div.bookDetailsBox div.property_content_type')
        .find('span')
        .text()
        .trim() || 'Unavailable';

    const year: string =
      $('div.col-sm-9 div.bookDetailsBox div.property_year')
        .find('div.property_value')
        .text()
        .trim() || 'Unavailable';

    const publisher: string =
      $('div.col-sm-9 div.bookDetailsBox div.property_publisher')
        .find('div.property_value')
        .text()
        .trim() || 'Unavailable';

    const language: string =
      $('div.col-sm-9 div.bookDetailsBox div.property_language')
        .find('div.property_value')
        .text()
        .toUpperCase()
        .trim() || 'Unavailable';

    const pages: string =
      $('div.col-sm-9 div.bookDetailsBox div.property_pages')
        .find('div.property_value')
        .text()
        .trim() || 'Unavailable';

    const isbn10: string =
      $('div.col-sm-9 div.bookDetailsBox div.10')
        .find('div.property_value')
        .text()
        .trim() || 'Unavailable';

    const isbn13: string =
      $('div.col-sm-9 div.bookDetailsBox div.13')
        .find('div.property_value')
        .text()
        .trim() || 'Unavailable';

    const filetypeSize: string =
      $('div.col-sm-9 div.bookDetailsBox div.property__file')
        .find('div.property_value')
        .text()
        .trim() || 'Unavailable';

    novel.summary = `DISCLAIMER : YOU NEED TO LOG IN TO THE Z-LIBRARY WEBSITE THROUGH THE WEBVIEW TO DOWNLOAD OR READ THE BOOK! \n\n\nName : ${$('div.col-sm-9').find('h1').text().trim()}\nType : ${type}\nYear : ${year}\nPublisher : ${publisher}\nLanguage : ${language}\nPages : ${pages}\nISBN10 : ${isbn10}\nISBN13 : ${isbn13}\nFiletype&Size : ${filetypeSize}\n\n${showDesc}`;

    const chapters: Plugin.ChapterItem[] = [];

    const chapter: Plugin.ChapterItem = {
      name: `Download/read ${$('div.col-sm-9').find('h1').text().trim()}`,
      path: `${novelPath}`,
      releaseTime:
        $('div.col-sm-9 div.bookDetailsBox div.property_year')
          .find('div.property_value')
          .text()
          .trim() || 'Unavailable',
      chapterNumber: 0,
    };
    chapters.push(chapter);

    novel.chapters = chapters;
    return novel;
  }
  async parseChapter(chapterPath: string): Promise<string> {
    const page: string = await this.getHtml(`${this.site}/book/${chapterPath}`);
    const $: cheerio.CheerioAPI = loadCheerio(page);

    const readOnline: string | undefined = $(
      'div.col-md-12 div section.book-actions-container div.book-details-button div.btn-group',
    )
      .eq(0)
      .find('a.btn')
      .attr('href');

    if (chapterPath) {
      const epubLink = `${this.site}/book/${chapterPath}`;
      return `
          <p>
            <br/>
            <br/>
            <b>Plese login to the Z-Library website to download/read the book.</b>
            <br/>
            <br/>
            <b>Remember to import the downloaded EPUB file to access it in the lnreader app.</b>
            <br/>
            <br/>
            <br/>
            <b>Click below to Read the book online</b><br/>
            <a href="${readOnline}">Read Online</a>
            <br/>
            <br/>
            <br/>
            <b>Click below to download the EPUB :\n (!! To download without leaving lnreader open the webview in the novel page after clicking the link! !!)</b>
            <br/>
            <a href="${epubLink}">Download</a>
            <br/>
            <br/>
            <br/>
            <b>Happy reading!</b>
          </p>
        `;
    }

    return 'No content.';
  }

  async searchNovels(
    searchTerm: string,
    //pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];

    const html: string = await this.getHtml(
      this.site + '/s/' + searchTerm.trim(),
    );

    const $: cheerio.CheerioAPI = loadCheerio(html);

    $('#searchResultBox')
      .find('div.book-item')
      .each((idx, element) => {
        const el = $(element);
        const title = el.find('div[slot=title]').text().trim();
        const url = `${el.find('z-bookcard').attr('href')}`;
        const cover = el.find('z-bookcard').find('img').attr('data-src');
        const name = `${title}`;
        const path = `${url.replace(/^\/book\//, '')}`;

        novels.push({
          name,
          path,
          cover,
        });
      });

    return novels;
  }

  resolveUrl = (path: string, isNovel?: boolean) =>
    this.site + (isNovel ? '/book/' : '/book/') + path;
}

export default new Zlibrary_plugin();
