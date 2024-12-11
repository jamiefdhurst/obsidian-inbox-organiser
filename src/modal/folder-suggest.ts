import { AbstractInputSuggest, App, TFolder } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<string> {
  private folders: Set<string> = new Set();
  private el: HTMLInputElement;

  constructor(app: App, folders: TFolder[], el: HTMLInputElement) {
    super(app, el);
    this.el = el;
    folders.forEach(folder => {
      this.folders.add(folder.path);
    });
  }

  protected getSuggestions(query: string): string[] {
    query = query.toLocaleLowerCase();

    return [...this.folders].filter(path => path.toLocaleLowerCase().contains(query));
  }

  renderSuggestion(value: string, el: HTMLElement): void {
    el.setText(value);
  }

  selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
    this.el.value = value;
    this.el.dispatchEvent(new Event('change'));
    this.close();
  }
}
