import { KoaSsrPage } from './app.po';

describe('koa-ssr App', () => {
  let page: KoaSsrPage;

  beforeEach(() => {
    page = new KoaSsrPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
