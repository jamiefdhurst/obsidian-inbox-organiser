import { App, Setting, TFolder } from 'obsidian';
import InboxOrganiser from '../..';
import { Inbox } from '../../inbox';
import { DEFAULT_SETTINGS } from '../../settings';
import { InboxOrganiserTab } from '../../settings/tab';

describe('Settings Tab', () => {

  let app: App;
  let plugin: InboxOrganiser;
  let inbox: Inbox;

  let sut: InboxOrganiserTab;

  beforeEach(() => {
    app = jest.fn() as unknown as App;
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn();
    inbox = jest.fn() as unknown as Inbox;
    inbox.getFolders = jest.fn();

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
    const settingsSetName = jest.spyOn(Setting.prototype, 'setName');

    sut.display();

    expect(settingsSetName).toHaveBeenCalledTimes(3);
    expect(inboxGetFolders).toHaveBeenCalledWith(true);
  });

});
