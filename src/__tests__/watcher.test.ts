import { FileManager, TFile } from 'obsidian';
import InboxOrganiser from '..';
import { Watcher } from '../watcher';
import { ISettings } from '../settings';

describe('watcher', () => {

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
    const settings: ISettings = { inbox: false, period: 'disabled' };
    jest.spyOn(plugin, 'getSettings').mockReturnValue(settings);
    const fileManagerRenameFile = jest.spyOn(fileManager, 'renameFile');

    sut.notify(new TFile());

    expect(fileManagerRenameFile).not.toHaveBeenCalled();
  });

  it('should trigger filemanager when inbox is enabled', () => {
    const settings: ISettings = { inbox: true, period: 'disabled' };
    jest.spyOn(plugin, 'getSettings').mockReturnValue(settings);
    const fileManagerRenameFile = jest.spyOn(fileManager, 'renameFile');

    sut.notify(new TFile());

    expect(fileManagerRenameFile).toHaveBeenCalled();
  });

});
