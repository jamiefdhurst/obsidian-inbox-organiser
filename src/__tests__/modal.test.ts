import { App, TFile, TFolder } from 'obsidian';
import { Inbox } from '../inbox';
import { CLS_PREFIX, OrganiserModal } from '../modal';

describe('modal', () => {

  let sut: OrganiserModal;

  let app: App;
  let inbox: Inbox;

  let fixtureFiles: TFile[];
  let fixtureFolders: TFolder[];

  beforeEach(() => {
    app = jest.fn() as unknown as App;
    inbox = jest.fn() as unknown as Inbox;
    inbox.getFiles = jest.fn();
    inbox.getFolders = jest.fn();
    inbox.move = jest.fn();

    sut = new OrganiserModal(app, inbox);
    sut.contentEl = createDiv();

    fixtureFiles = [
      new TFile(),
      new TFile(),
    ];
    fixtureFiles[0].name = 'test_1.md';
    fixtureFiles[1].name = 'test_2.md';
    fixtureFolders = [
      new TFolder(),
      new TFolder(),
      new TFolder(),
    ];
    const rootFolder = new TFolder();
    rootFolder.path = '/';
    fixtureFolders[0].name = 'Level One';
    fixtureFolders[0].parent = rootFolder;
    fixtureFolders[0].path = '/Level One';
    fixtureFolders[1].name = 'Level Two';
    fixtureFolders[1].path = '/Level One/Level Two';
    fixtureFolders[1].parent = fixtureFolders[0];
    fixtureFolders[2].name = 'Level Three';
    fixtureFolders[2].path = '/Level One/Level Two/Level Three';
    fixtureFolders[2].parent = fixtureFolders[1];
  });

  it('creates modal with empty table when opened', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    jest.spyOn(inbox, 'getFolders').mockReturnValue([]);

    await sut.onOpen();

    const select = sut.contentEl.find(`.${CLS_PREFIX}top .${CLS_PREFIX}dropdown`);
    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(select.children.length).toEqual(1);

    const table = sut.contentEl.find(`.${CLS_PREFIX}files table`);
    expect(table).toBeInstanceOf(HTMLTableElement);
    expect(table.children[1].children.length).toEqual(0);
  });

  it('creates modal with populated table when opened', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);

    await sut.onOpen();

    const selectEl = sut.contentEl.find(`.${CLS_PREFIX}top .${CLS_PREFIX}dropdown`);
    expect(selectEl).toBeInstanceOf(HTMLSelectElement);
    expect(selectEl.children.length).toEqual(4);
    expect(selectEl.children[1].innerHTML).toEqual('Level One');
    expect(selectEl.children[2].innerHTML).toEqual('Level Two (Level One)');
    expect(selectEl.children[3].innerHTML).toEqual('Level Three (Level One &gt; Level Two)');

    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);
    expect(tableEl).toBeInstanceOf(HTMLTableElement);
    expect(tableEl.children[1].children.length).toEqual(2);
    expect(tableEl.children[1].children[0].children[1].innerHTML).toEqual('test_1.md');
    expect(tableEl.children[1].children[1].children[1].innerHTML).toEqual('test_2.md');
  });

  it('searches and filters file entries', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);

    await sut.onOpen();

    const searchInputEl = sut.contentEl.find(`.${CLS_PREFIX}search input`) as HTMLInputElement;
    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);

    // Set search
    searchInputEl.value = '_1';
    searchInputEl.dispatchEvent(new Event('input'));
    await new Promise(r => setTimeout(r, 150));

    expect(tableEl.children[1].children[0].className).not.toContain('hidden');
    expect(tableEl.children[1].children[1].className).toContain('hidden');

    // Reset
    searchInputEl.value = '';
    searchInputEl.dispatchEvent(new Event('input'));
    await new Promise(r => setTimeout(r, 150));

    expect(tableEl.children[1].children[0].className).not.toContain('hidden');
    expect(tableEl.children[1].children[1].className).not.toContain('hidden');

    // Select and then filter
    tableEl.children[1].children[0].children[1].dispatchEvent(new Event('click'));
    tableEl.children[1].children[1].children[1].dispatchEvent(new Event('click'));
    await new Promise(r => setTimeout(r, 150));
    searchInputEl.value = '_1';
    searchInputEl.dispatchEvent(new Event('input'));
    await new Promise(r => setTimeout(r, 150));

    expect(tableEl.children[1].children[0].className).not.toContain('hidden');
    expect(tableEl.children[1].children[0].className).toContain('selected');
    expect(tableEl.children[1].children[1].className).toContain('hidden');
    expect(tableEl.children[1].children[1].className).not.toContain('selected');

    // Clear button
    sut.contentEl.find(`.search-input-clear-button`).dispatchEvent(new Event('click'));
    await new Promise(r => setTimeout(r, 150));

    expect(searchInputEl.value).toEqual('');
    expect(tableEl.children[1].children[0].className).not.toContain('hidden');
    expect(tableEl.children[1].children[1].className).not.toContain('hidden');
  });

  it('selects files and enables multi-select save', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);

    await sut.onOpen();

    const topEl = sut.contentEl.find(`.${CLS_PREFIX}top`);
    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);
    
    tableEl.children[1].children[0].children[1].dispatchEvent(new Event('click'));
    await new Promise(r => setTimeout(r, 150));

    expect(topEl.children[1].children[0].getAttribute('disabled')).toEqual(null);
    expect(topEl.children[1].children[1].getAttribute('disabled')).toEqual(null);

    tableEl.children[1].children[0].children[1].dispatchEvent(new Event('click'));
    await new Promise(r => setTimeout(r, 150));

    expect(topEl.children[1].children[0].getAttribute('disabled')).toEqual('disabled');
    expect(topEl.children[1].children[1].getAttribute('disabled')).toEqual('disabled');
  });

  it('selects/deselects all files at once', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);

    await sut.onOpen();

    const topEl = sut.contentEl.find(`.${CLS_PREFIX}top`);
    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);

    (topEl.children[0].children[0].children[0] as HTMLInputElement).checked = true;
    topEl.children[0].children[0].children[0].dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 150));

    expect((tableEl.children[1].children[0].children[0].children[0] as HTMLInputElement).checked).toEqual(true);
    expect((tableEl.children[1].children[1].children[0].children[0] as HTMLInputElement).checked).toEqual(true);

    (topEl.children[0].children[0].children[0] as HTMLInputElement).checked = false;
    topEl.children[0].children[0].children[0].dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 150));

    expect((tableEl.children[1].children[0].children[0].children[0] as HTMLInputElement).checked).toEqual(false);
    expect((tableEl.children[1].children[1].children[0].children[0] as HTMLInputElement).checked).toEqual(false);
  });

  it('does nothing when moved to an empty value', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);
    const inboxMove = jest.spyOn(inbox, 'move');

    await sut.onOpen();

    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);
    tableEl.children[1].children[0].children[2].children[0].dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 150));

    expect(inboxMove).not.toHaveBeenCalled();
    expect(tableEl.children[1].children.length).toEqual(2);

  });

  it('moves a single file', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);
    const inboxMove = jest.spyOn(inbox, 'move');

    await sut.onOpen();

    const expectedFile = fixtureFiles[0];
    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);
    (tableEl.children[1].children[0].children[2].children[0] as HTMLSelectElement).value = '/Level One';
    tableEl.children[1].children[0].children[2].children[0].dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 150));

    expect(inboxMove).toHaveBeenCalledWith(expectedFile, '/Level One');
    expect(tableEl.children[1].children.length).toEqual(1);
  });

  it('moves multiple files and closes', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);
    const inboxMove = jest.spyOn(inbox, 'move');

    await sut.onOpen();
    
    const expectedFile1 = fixtureFiles[0];
    const expectedFile2 = fixtureFiles[0];

    const topEl = sut.contentEl.find(`.${CLS_PREFIX}top`);
    const tableEl = sut.contentEl.find(`.${CLS_PREFIX}files table`);

    (topEl.children[0].children[0].children[0] as HTMLInputElement).checked = true;
    topEl.children[0].children[0].children[0].dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 150));

    (topEl.children[1].children[0] as HTMLSelectElement).value = '/Level One/Level Two';
    topEl.children[1].children[0].dispatchEvent(new Event('change'));
    topEl.children[1].children[1].dispatchEvent(new Event('click'));
    await new Promise(r => setTimeout(r, 150));

    expect(inboxMove).toHaveBeenCalledWith(expectedFile1, '/Level One/Level Two');
    expect(inboxMove).toHaveBeenCalledWith(expectedFile2, '/Level One/Level Two');

    expect(sut.contentEl.innerHTML).toEqual('');
  });

  it('empties content when closing', async () => {
    jest.spyOn(inbox, 'getFiles').mockReturnValue(fixtureFiles);
    jest.spyOn(inbox, 'getFolders').mockReturnValue(fixtureFolders);

    await sut.onOpen();

    sut.onClose();

    expect(sut.contentEl.innerHTML).toEqual('');
  });

});
