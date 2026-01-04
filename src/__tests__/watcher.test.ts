import { FileManager, TFile } from 'obsidian';
import InboxOrganiser from '..';
import { DEFAULT_INBOX_FOLDER, ISettings } from '../settings';
import { Watcher } from '../watcher';

describe('Watcher', () => {
  let sut: Watcher;

  let plugin: InboxOrganiser;
  let fileManager: FileManager;

  beforeEach(() => {
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn();
    fileManager = jest.fn() as unknown as FileManager;
    fileManager.renameFile = jest.fn();

    sut = new Watcher(plugin, fileManager);
  });

  it('should not trigger filemanager when inbox is disabled', () => {
    const settings: ISettings = {
      inbox: false,
      inboxFolder: DEFAULT_INBOX_FOLDER,
      period: 'disabled',
      watchFolder: '/',
    };
    jest.spyOn(plugin, 'getSettings').mockReturnValue(settings);
    const fileManagerRenameFile = jest.spyOn(fileManager, 'renameFile');

    sut.notify(new TFile());

    expect(fileManagerRenameFile).not.toHaveBeenCalled();
  });

  it('should trigger filemanager when inbox is enabled', () => {
    const settings: ISettings = {
      inbox: true,
      inboxFolder: DEFAULT_INBOX_FOLDER,
      period: 'disabled',
      watchFolder: '/',
    };
    jest.spyOn(plugin, 'getSettings').mockReturnValue(settings);
    const fileManagerRenameFile = jest.spyOn(fileManager, 'renameFile');

    sut.notify(new TFile());

    expect(fileManagerRenameFile).toHaveBeenCalled();
  });
});
