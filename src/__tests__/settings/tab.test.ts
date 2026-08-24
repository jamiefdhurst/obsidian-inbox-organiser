import { App, TFolder } from 'obsidian';
import InboxOrganiser from '../..';
import { DEFAULT_SETTINGS, ISettings } from '../../settings';
import { InboxOrganiserTab } from '../../settings/tab';

describe('Settings Tab', () => {
  let app: App;
  let plugin: InboxOrganiser;

  let sut: InboxOrganiserTab;
  let refreshDomState: jest.Mock;

  const names = (): string[] =>
    sut.getSettingDefinitions().map((item) => ('name' in item ? String(item.name) : ''));

  const controlFor = (name: string): any =>
    sut.getSettingDefinitions().find((item) => 'name' in item && item.name === name);

  beforeEach(() => {
    app = jest.fn() as unknown as App;
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn().mockReturnValue(Object.assign({}, DEFAULT_SETTINGS));
    plugin.updateSettings = jest.fn();

    sut = new InboxOrganiserTab(app, plugin);
    sut.containerEl = createDiv();
    refreshDomState = jest.fn();
    sut.refreshDomState = refreshDomState;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('declares every setting', () => {
    expect(names()).toEqual(['Enable inbox', 'Inbox folder', 'Watched folder', 'Reminder period']);
  });

  it('binds each setting to its stored key', () => {
    expect(controlFor('Enable inbox').control).toMatchObject({ type: 'toggle', key: 'inbox' });
    expect(controlFor('Inbox folder').control).toMatchObject({
      type: 'folder',
      key: 'inboxFolder',
    });
    expect(controlFor('Watched folder').control).toMatchObject({
      type: 'folder',
      key: 'watchFolder',
      includeRoot: true,
    });
    expect(controlFor('Reminder period').control).toMatchObject({
      type: 'dropdown',
      key: 'period',
    });
  });

  it('offers every reminder period as a dropdown option', () => {
    const options = controlFor('Reminder period').control.options as Record<string, string>;

    expect(Object.keys(options)).toContain('disabled');
    expect(Object.keys(options)).toHaveLength(9);
  });

  it('reads control values from the plugin settings', () => {
    jest
      .spyOn(plugin, 'getSettings')
      .mockReturnValue(Object.assign({}, DEFAULT_SETTINGS, { inboxFolder: 'abc' }));

    expect(sut.getControlValue('inboxFolder')).toEqual('abc');
    expect(sut.getControlValue('inbox')).toEqual(false);
  });

  it('updates the inbox folder setting when changed', async () => {
    const pluginUpdateSettings = jest.spyOn(plugin, 'updateSettings');

    await sut.setControlValue('inboxFolder', 'abc');

    expect(pluginUpdateSettings).toHaveBeenCalledWith(
      Object.assign({}, DEFAULT_SETTINGS, {
        inboxFolder: 'abc',
      })
    );
  });

  it('updates the watched folder setting when changed', async () => {
    const pluginUpdateSettings = jest.spyOn(plugin, 'updateSettings');

    await sut.setControlValue('watchFolder', 'abc');

    expect(pluginUpdateSettings).toHaveBeenCalledWith(
      Object.assign({}, DEFAULT_SETTINGS, {
        watchFolder: 'abc',
      })
    );
  });

  it('refreshes the rendered settings after a change', async () => {
    await sut.setControlValue('inboxFolder', 'abc');

    expect(refreshDomState).toHaveBeenCalled();
  });

  it('excludes the inbox folder from the watched folder suggestions', () => {
    const settings: ISettings = Object.assign({}, DEFAULT_SETTINGS, { inboxFolder: 'inbox' });
    jest.spyOn(plugin, 'getSettings').mockReturnValue(settings);
    const filter = controlFor('Watched folder').control.filter as (folder: TFolder) => boolean;

    const inboxFolder = new TFolder();
    inboxFolder.path = 'inbox';
    const otherFolder = new TFolder();
    otherFolder.path = 'abc';

    expect(filter(inboxFolder)).toBe(false);
    expect(filter(otherFolder)).toBe(true);
  });
});
