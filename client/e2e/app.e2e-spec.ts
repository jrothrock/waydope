import { Client1Page } from './app.po';

describe('client1 App', () => {
  let page: Client1Page;

  beforeEach(() => {
    page = new Client1Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
