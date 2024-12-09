import { TFile, TFolder, Vault } from 'obsidian';
import { INBOX_FOLDER } from '..';
import { Inbox } from '../inbox';

describe('Inbox', () => {

  let sut: Inbox;

  let vault: Vault;

  beforeEach(() => {
    vault = jest.fn() as unknown as Vault;
    vault.getAllFolders = jest.fn();
    vault.getFolderByPath = jest.fn();
    vault.rename = jest.fn();

    sut = new Inbox(vault);
  });

  it('returns empty when the inbox folder is not found', () => {
    jest.spyOn(vault, 'getFolderByPath').mockReturnValue(null);

    const result = sut.getFiles();

    expect(result).toEqual([]);
  });

  it('returns inbox folder contents, sorted, when found - files only', () => {
    const folder = new TFolder();
    folder.children = [
      new TFile(),
      new TFolder(),
      new TFile(),
    ];
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
    const folders = [
      new TFolder(),
      new TFolder(),
      new TFolder(),
    ];

    folders[0].name = 'foo';
    folders[0].path = 'foo';
    folders[1].name = INBOX_FOLDER;
    folders[1].path = INBOX_FOLDER;
    folders[2].name = 'bar';
    folders[2].path = 'bar';

    jest.spyOn(vault, 'getAllFolders').mockReturnValue(folders);

    const result = sut.getFolders();

    expect(result.length).toEqual(2);
    expect(result[0].path).toEqual('bar');
    expect(result[1].path).toEqual('foo');

  });

  it('moves a file', async () => {
    const vaultRename = jest.spyOn(vault, 'rename');

    const file = new TFile();
    file.name = 'example.md';

    await sut.move(file, 'some/new/path');

    expect(vaultRename).toHaveBeenCalledWith(file, 'some/new/path/example.md');
  });
});
