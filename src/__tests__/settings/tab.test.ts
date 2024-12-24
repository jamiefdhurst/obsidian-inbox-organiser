import { App, Setting } from 'obsidian';
import InboxOrganiser from '../..';
import { DEFAULT_SETTINGS } from '../../settings';
import { InboxOrganiserTab } from '../../settings/tab';

describe('Settings Tab', () => {

  let app: App;
  let plugin: InboxOrganiser;

  let sut: InboxOrganiserTab;

  beforeEach(() => {
    app = jest.fn() as unknown as App;
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn();

    sut = new InboxOrganiserTab(app, plugin);
    sut.containerEl = createDiv();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('displays correctly', () => {
    jest.spyOn(plugin, 'getSettings').mockReturnValue(Object.assign({}, DEFAULT_SETTINGS));
    const settingsSetName = jest.spyOn(Setting.prototype, 'setName');

    sut.display();

    expect(settingsSetName).toHaveBeenCalledTimes(2);
  });

});
