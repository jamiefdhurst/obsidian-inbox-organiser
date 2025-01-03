import { App, Modal, TFile, TFolder } from 'obsidian';
import { Inbox } from '../inbox';
import { FolderSuggest } from './folder-suggest';

export const CLS_PREFIX: string = 'inorg-';

export class OrganiserModal extends Modal {
  private inbox: Inbox;
  private files: TFile[];
  private folders: TFolder[];

  private searchInputEl: HTMLInputElement;
  private multiSelectToggleEl: HTMLInputElement;
  private multiSelectFolderEl: HTMLInputElement;
  private multiSelectSaveEl: HTMLButtonElement;
  private fileTbodyEl: HTMLTableSectionElement;
  private fileRowEls: Map<string, HTMLTableRowElement>;
  private fileRowSelectEls: Map<string, HTMLInputElement>;

  constructor(app: App, inbox: Inbox) {
    super(app);

    this.inbox = inbox;
  }

  async onOpen(): Promise<void> {

    this.getData();

    this.setTitle('Organise inbox');
    this.createLayout(this.contentEl);
  }

  getData(): void {
    this.files = this.inbox.getFiles();
    this.folders = this.inbox.getFolders();
  }

  createLayout(containerEl: HTMLElement): void {
    const mainContainerEl = containerEl.createDiv({ cls: `${CLS_PREFIX}container`});
    mainContainerEl.setAttribute('id', `${CLS_PREFIX}main`);

    this.fileRowEls = new Map();
    this.fileRowSelectEls = new Map();

    this.createFilter(mainContainerEl);
    this.createMultiSelect(mainContainerEl);
    this.createFileTable(mainContainerEl);
    this.createFileTableRows();
    this.handleSearch('');
    this.handleToggleSelectMulti(false);
  }

  createFilter(containerEl: HTMLElement): void {
    const searchContainerEl = containerEl.createDiv({ cls: `${CLS_PREFIX}search` });
    this.searchInputEl = searchContainerEl.createEl('input', { type: 'search', placeholder: 'Search...' });
    this.searchInputEl.spellcheck = false;
    this.searchInputEl.focus();
    this.searchInputEl.addEventListener('input', () => this.handleSearch(this.searchInputEl.value));

    searchContainerEl.createEl('div', { cls: 'search-input-clear-button' }).addEventListener('click', () => {
      this.searchInputEl.value = '';
      this.searchInputEl.focus();
      this.handleSearch(this.searchInputEl.value);
    });
  }

  createMultiSelect(containerEl: HTMLElement): void {
    const topNavEl = containerEl.createDiv({ cls: `${CLS_PREFIX}top` });
    const topNavLeftEl = topNavEl.createDiv();
    const topNavRightEl = topNavEl.createDiv();

    const multiSelectLabelEl = topNavLeftEl.createEl('label', { cls: `${CLS_PREFIX}multiselect` });
    this.multiSelectToggleEl = multiSelectLabelEl.createEl('input', { type: 'checkbox' });
    multiSelectLabelEl.createSpan({ text: 'Select all/none '});
    this.multiSelectToggleEl.addEventListener('change', (event: MouseEvent) => {
      const el = event.target as HTMLInputElement;
      this.handleToggleSelectMulti(el.checked);
    });

    this.multiSelectFolderEl = this.createFolderSelect(topNavRightEl);
    this.multiSelectFolderEl.setAttribute('disabled', 'disabled');
    this.multiSelectSaveEl = topNavRightEl.createEl('button', { cls: 'mod-cta', text: 'Move selected' });
    this.multiSelectSaveEl.setAttribute('disabled', 'disabled');
    this.multiSelectSaveEl.addEventListener('click', () => {
      if (this.multiSelectFolderEl.value) {
        this.handleMoveMultipleFiles(this.multiSelectFolderEl.value);
      }
    });
  }

  createFileTable(containerEl: HTMLElement): void {
    const tableEl = containerEl
      .createDiv({ cls: `${CLS_PREFIX}files`})
      .createEl('table');
    const theadEl = tableEl.createEl('thead');
    const theadTrEl = theadEl.createEl('tr');
    theadTrEl.createEl('th');
    theadTrEl.createEl('th', { text: 'Name' });
    theadTrEl.createEl('th', { text: 'Move to...' });
    this.fileTbodyEl = tableEl.createEl('tbody');
  }

  createFileTableRows(): void {
    for (const file of this.files) {
      const fileTrEl = this.fileTbodyEl.createEl('tr');

      const selectTdEl = fileTrEl.createEl('td');
      const selectEl = selectTdEl.createEl('input', { type: 'checkbox' });
      selectEl.addEventListener('change', (event: MouseEvent) => {
        const el = event.target as HTMLInputElement;
        this.handleToggleSelect(file.name, el.checked);
      });
      this.fileRowSelectEls.set(file.name, selectEl);

      const fileNameTd = fileTrEl.createEl('td', { text: file.name });
      fileNameTd.addEventListener('click', (event: MouseEvent) => {
        selectEl.checked = !selectEl.checked;
        selectEl.dispatchEvent(new Event('change'));
        event.stopPropagation();
      });

      const moveTdEl = fileTrEl.createEl('td');
      const moveSelectEl = this.createFolderSelect(moveTdEl);
      moveSelectEl.addEventListener('change', (event: MouseEvent) => {
        const el = event.target as HTMLSelectElement;
        this.handleMoveSingleFile(file.name, el.value);
      });

      this.fileRowEls.set(file.name, fileTrEl);
    }
  }

  createFolderSelect(containerEl: HTMLElement): HTMLInputElement {
    const folderSelectEl = containerEl.createEl('input', { cls: `${CLS_PREFIX}dropdown`});
    new FolderSuggest(this.app, this.folders, folderSelectEl);

    return folderSelectEl;
  }
  
  handleSearch(query: string): void {
    [...this.fileRowEls.entries()].forEach(([fileName, row]) => {
      const fileNameSearch = fileName.toLowerCase();
      if ((query === '' || fileNameSearch.contains(query)) && row.className.contains('hidden')) {
        row.className = '';
      } else if (!fileNameSearch.contains(query)) {
        if (row.className.contains('selected')) {
          this.handleToggleSelect(fileName, false);
        }
        row.className = 'hidden';
      }
    }); 
  }

  handleToggleSelect(fileName: string, selected: boolean): void {
    const rowEl = this.fileRowEls.get(fileName);
    const inputEl = this.fileRowSelectEls.get(fileName);
    if (rowEl && inputEl) {
      inputEl.checked = selected;
      rowEl.className = '';
      if (inputEl.checked) {
        rowEl.className = 'selected';
      }
    }

    if ([...this.fileRowEls.values()].filter(row => row.className === 'selected').length) {
      this.multiSelectFolderEl.removeAttribute('disabled');
      this.multiSelectSaveEl.removeAttribute('disabled');
    } else {
      this.multiSelectFolderEl.setAttribute('disabled', 'disabled');
      this.multiSelectSaveEl.setAttribute('disabled', 'disabled');
    }
  }

  handleToggleSelectMulti(selected: boolean): void {
    for (const fileName of this.files.map(file => file.name)) {
      this.handleToggleSelect(fileName, selected);
    }
  }

  async handleMoveSingleFile(fileName: string, path: string): Promise<void> {
    const file = this.files.find(f => f.name === fileName);
    if (file === undefined || path === '') {
      return;
    }

    await this.inbox.move(file, path);

    this.files.remove(file);

    if (this.files.length === 0) {
      this.close();
    } else {
      this.fileTbodyEl.empty();
      this.createFileTableRows();
    }
  }

  async handleMoveMultipleFiles(path: string): Promise<void> {
    const moveActions: Promise<void>[] = [];
    [...this.fileRowEls.entries()].filter(([fileName, row]) => row.className === 'selected').forEach(([fileName, row]) => {
      moveActions.push(this.handleMoveSingleFile(fileName, path));
    });

    await Promise.all(moveActions);

    this.handleToggleSelectMulti(false);
  }

  onClose() {
    this.contentEl.empty();
  }
}
