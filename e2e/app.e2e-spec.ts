import { CachePage } from './app.po';

describe('cache App', () => {
  let page: CachePage;

  beforeEach(() => {
    page = new CachePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
