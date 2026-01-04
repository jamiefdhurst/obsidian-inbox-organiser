import { App, TFolder } from 'obsidian';
import { FolderSuggest } from '../../modal/folder-suggest';

class FolderSuggestTestable extends FolderSuggest {
  exposeGetSuggestions(query: string): string[] {
    return this.getSuggestions(query);
  }
}

describe('FolderSuggest', () => {
  let sut: FolderSuggestTestable;

  let el: HTMLInputElement;

  beforeEach(() => {
    const app = jest.fn() as unknown as App;
    const folders = [new TFolder(), new TFolder(), new TFolder()];
    folders[0].path = 'foo';
    folders[1].path = 'foo/Bar';
    folders[2].path = 'baz';
    el = createEl('input');

    sut = new FolderSuggestTestable(app, folders, el);
  });

  it('renders a suggestion', () => {
    const elSetText = jest.spyOn(el, 'setText');

    sut.renderSuggestion('example', el);

    expect(elSetText).toHaveBeenCalledWith('example');
  });

  it('selects a suggestion', () => {
    const elDispatch = jest.spyOn(el, 'dispatchEvent');

    sut.selectSuggestion('example', new MouseEvent('change'));

    expect(el.value).toEqual('example');
    expect(elDispatch).toHaveBeenCalled();
  });

  it('gets suggestions in the correct order', () => {
    const suggestions = sut.exposeGetSuggestions('BA');

    expect(suggestions).toEqual(['baz', 'foo/Bar']);
  });
});
