import { App, Modal, TFile, TFolder } from 'obsidian';
import { Inbox } from 'src/inbox';

const CLS_PREFIX: string = 'inorg-';
const SELECT_ATTR_FILE: string = 'data-file-name';

export class OrganiserModal extends Modal {
  private inbox: Inbox;
  private files: TFile[];
  private folders: TFolder[];

  private fileTableBody: HTMLTableSectionElement;
  private fileRowEls: Map<string, HTMLTableRowElement> = new Map();
  private moveSelectEls: HTMLSelectElement[] = [];

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

  createLayout(el: HTMLElement): void {

    // Main container
    const mainContainer = el.createDiv({ cls: `${CLS_PREFIX}container`});
    mainContainer.setAttribute('id', `${CLS_PREFIX}main`);

    // Table of files
    const tableContainer = mainContainer.createDiv({ cls: `${CLS_PREFIX}files`});
    const table = tableContainer.createEl('table');
    const thead = table.createEl('thead');
    const theadTr = thead.createEl('tr');
    theadTr.createEl('th', { text: 'Name' });
    theadTr.createEl('th', { text: 'Move to...' });
    this.fileTableBody = table.createEl('tbody');

    for (const file of this.files) {
      const fileTr = this.fileTableBody.createEl('tr');
      fileTr.createEl('td', { text: file.name });
      const moveTd = fileTr.createEl('td');
      const moveSelect = moveTd.createEl('select', { cls: `${CLS_PREFIX}dropdown`});
      moveSelect.createEl('option', { text: 'Choose folder...' });
      for (const folder of this.folders) {
        moveSelect.createEl('option', { text: this.getFolderPathForDisplay(folder), value: folder.path });
      }
      moveSelect.setAttribute(SELECT_ATTR_FILE, file.name);
      moveSelect.addEventListener('change', (event: MouseEvent) => this.moveSingleFile(event));
      this.moveSelectEls.push(moveSelect);
      this.fileRowEls.set(file.name, fileTr);
    }
  }

  getFolderPathForDisplay(folder: TFolder): string {
    if (folder.parent?.path === '/') {
      return folder.name;
    }

    const parentNames = [];
    let parent: TFolder | null = folder.parent;
    while (parent !== null && parent.path !== '/') {
      parentNames.push(parent.name);
      parent = parent.parent;
    }

    return `${folder.name} (${parentNames.reverse().join(' > ')})`;
  }

  async moveSingleFile(event: MouseEvent): Promise<void> {
    const moveSelectEl = event.target as HTMLSelectElement;
    const fileName = moveSelectEl.getAttribute(SELECT_ATTR_FILE) as string;
    const file = this.files.find(f => f.name === fileName);
    if (file === undefined) {
      return;
    }

    await this.inbox.move(file, moveSelectEl.value);

    this.moveSelectEls.remove(moveSelectEl);
    this.fileRowEls.get(fileName)?.remove();
    this.fileRowEls.delete(fileName);

    if (this.fileRowEls.size === 0) {
      this.close();
    }
  }

  onClose() {
    this.contentEl.empty();

    this.moveSelectEls.forEach((el) => {
      el.removeEventListener('change', (event: MouseEvent) => this.moveSingleFile(event));
    });
  }
}
