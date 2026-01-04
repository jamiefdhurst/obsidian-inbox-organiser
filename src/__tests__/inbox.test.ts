import { FileManager, TFile, TFolder, Vault } from 'obsidian';
import InboxOrganiser from '..';
import { Inbox } from '../inbox';
import { DEFAULT_INBOX_FOLDER } from '../settings';

describe('Inbox', () => {
  let sut: Inbox;

  let plugin: InboxOrganiser;
  let vault: Vault;
  let fileManager: FileManager;

  beforeEach(() => {
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn();
    jest.spyOn(plugin, 'getSettings').mockReturnValue({
      inbox: true,
      inboxFolder: DEFAULT_INBOX_FOLDER,
      period: 'disabled',
      watchFolder: '/',
    });
    vault = jest.fn() as unknown as Vault;
    vault.getAllFolders = jest.fn();
    vault.getFolderByPath = jest.fn();
    fileManager = jest.fn() as unknown as FileManager;
    fileManager.renameFile = jest.fn();

    sut = new Inbox(plugin, vault, fileManager);
  });

  it('returns empty when the inbox folder is not found', () => {
    jest.spyOn(vault, 'getFolderByPath').mockReturnValue(null);

    const result = sut.getFiles();

    expect(result).toEqual([]);
  });

  it('returns inbox folder contents, sorted, when found - files only', () => {
    const folder = new TFolder();
    folder.children = [new TFile(), new TFolder(), new TFile()];
    folder.children[0].name = 'file_2.md';
    folder.children[1].name = 'folder';
    folder.children[2].name = 'file_1.md';

    jest.spyOn(vault, 'getFolderByPath').mockReturnValue(folder);

    const result = sut.getFiles();

    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('file_1.md');
    expect(result[1].name).toEqual('file_2.md');
  });

  it('gets all folders that are not the inbox, sorted', () => {
    const folders = [new TFolder(), new TFolder(), new TFolder()];

    folders[0].name = 'foo';
    folders[0].path = 'foo';
    folders[1].name = DEFAULT_INBOX_FOLDER;
    folders[1].path = DEFAULT_INBOX_FOLDER;
    folders[2].name = 'bar';
    folders[2].path = 'bar';

    jest.spyOn(vault, 'getAllFolders').mockReturnValue(folders);

    const result = sut.getFolders();

    expect(result.length).toEqual(2);
    expect(result[0].path).toEqual('bar');
    expect(result[1].path).toEqual('foo');
  });

  it('gets all folders with root included', () => {
    const folders = [new TFolder(), new TFolder(), new TFolder()];

    folders[0].name = '';
    folders[0].path = '/';
    folders[1].name = DEFAULT_INBOX_FOLDER;
    folders[1].path = DEFAULT_INBOX_FOLDER;
    folders[2].name = 'foo';
    folders[2].path = 'foo';

    jest.spyOn(vault, 'getAllFolders').mockReturnValue(folders);

    const result = sut.getFolders(true);

    expect(result.length).toEqual(2);
    expect(result[0].path).toEqual('/');
    expect(result[1].path).toEqual('foo');
  });

  it('gets all folders, including inbox, sorted', () => {
    const folders = [new TFolder(), new TFolder(), new TFolder()];

    folders[0].name = 'foo';
    folders[0].path = 'foo';
    folders[1].name = DEFAULT_INBOX_FOLDER;
    folders[1].path = DEFAULT_INBOX_FOLDER;
    folders[2].name = 'aaaaaa';
    folders[2].path = 'aaaaaa';

    jest.spyOn(vault, 'getAllFolders').mockReturnValue(folders);

    const result = sut.getFoldersWithInbox();

    expect(result.length).toEqual(3);
    expect(result[0].path).toEqual('aaaaaa');
  });

  it('moves a file', async () => {
    const fileManagerRename = jest.spyOn(fileManager, 'renameFile');

    const file = new TFile();
    file.name = 'example.md';

    await sut.move(file, 'some/new/path');

    expect(fileManagerRename).toHaveBeenCalledWith(file, 'some/new/path/example.md');
  });
});
