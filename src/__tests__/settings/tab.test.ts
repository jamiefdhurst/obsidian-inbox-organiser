import { App, Setting, TFolder } from 'obsidian';
import InboxOrganiser from '../..';
import { Inbox } from '../../inbox';
import { DEFAULT_SETTINGS } from '../../settings';
import { InboxOrganiserTab } from '../../settings/tab';

const WAIT_TIME: number = 20;

describe('Settings Tab', () => {

  let app: App;
  let plugin: InboxOrganiser;
  let inbox: Inbox;

  let sut: InboxOrganiserTab;

  beforeEach(() => {
    app = jest.fn() as unknown as App;
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn();
    plugin.updateSettings = jest.fn();
    inbox = jest.fn() as unknown as Inbox;
    inbox.getFolders = jest.fn();
    inbox.getFoldersWithInbox = jest.fn();

    sut = new InboxOrganiserTab(app, plugin, inbox);
    sut.containerEl = createDiv();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('displays correctly', () => {
    jest.spyOn(plugin, 'getSettings').mockReturnValue(Object.assign({}, DEFAULT_SETTINGS));
    const folders = [new TFolder(), new TFolder()];
    folders[0].path = '/';
    folders[1].path = 'abc';
    const inboxGetFolders = jest.spyOn(inbox, 'getFolders').mockReturnValue(folders);
    const inboxGetFoldersWithInbox = jest.spyOn(inbox, 'getFoldersWithInbox').mockReturnValue(folders);
    const settingsSetName = jest.spyOn(Setting.prototype, 'setName');

    sut.display();

    expect(settingsSetName).toHaveBeenCalledTimes(4);
    expect(inboxGetFolders).toHaveBeenCalledWith(true);
    expect(inboxGetFoldersWithInbox).toHaveBeenCalled();
  });

  it('updates inbox folder setting when changed', async () => {
    jest.spyOn(plugin, 'getSettings').mockReturnValue(Object.assign({}, DEFAULT_SETTINGS));
    const folders = [new TFolder(), new TFolder()];
    folders[0].path = '/';
    folders[1].path = 'abc';
    jest.spyOn(inbox, 'getFolders').mockReturnValue(folders);
    jest.spyOn(inbox, 'getFoldersWithInbox').mockReturnValue(folders);
    const pluginUpdateSettings = jest.spyOn(plugin, 'updateSettings');

    sut.display();
    const inputEl = sut.containerEl.find('.setting-item-control:nth-child(2) input') as HTMLInputElement;
    inputEl.value = 'abc';
    inputEl.dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, WAIT_TIME));

    expect(pluginUpdateSettings).toHaveBeenCalledWith(Object.assign({}, DEFAULT_SETTINGS, {
      inboxFolder: 'abc',
    }));
  });

  it('updates watch folder setting when changed', async () => {
    jest.spyOn(plugin, 'getSettings').mockReturnValue(Object.assign({}, DEFAULT_SETTINGS));
    const folders = [new TFolder(), new TFolder()];
    folders[0].path = '/';
    folders[1].path = 'abc';
    jest.spyOn(inbox, 'getFolders').mockReturnValue(folders);
    jest.spyOn(inbox, 'getFoldersWithInbox').mockReturnValue(folders);
    const pluginUpdateSettings = jest.spyOn(plugin, 'updateSettings');

    sut.display();
    const inputEl = sut.containerEl.find('.setting-item-control:nth-child(3) input') as HTMLInputElement;
    inputEl.value = 'abc';
    inputEl.dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, WAIT_TIME));

    expect(pluginUpdateSettings).toHaveBeenCalledWith(Object.assign({}, DEFAULT_SETTINGS, {
      watchFolder: 'abc',
    }));
  });

});
