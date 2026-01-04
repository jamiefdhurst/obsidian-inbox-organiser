import { Plugin, TFile, type App, type PluginManifest } from 'obsidian';
import { SETTINGS_UPDATED } from './events';
import { Inbox } from './inbox';
import debug from './log';
import { OrganiserModal } from './modal';
import { OrganiserNotice } from './notice';
import { DEFAULT_SETTINGS, ISettings } from './settings';
import { InboxOrganiserTab } from './settings/tab';
import { Watcher } from './watcher';

export default class InboxOrganiser extends Plugin {
  private settings: ISettings = DEFAULT_SETTINGS;
  private watcher: Watcher;
  private inbox: Inbox;
  private modal: OrganiserModal;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.watcher = new Watcher(this, app.fileManager);
    this.inbox = new Inbox(this, app.vault, app.fileManager);
    this.modal = new OrganiserModal(this.app, this.inbox);
  }

  async onload(): Promise<void> {
    this.updateSettings = this.updateSettings.bind(this);

    await this.loadSettings();

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  onLayoutReady(): void {
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (file instanceof TFile) {
          // Root needs a special case as it will not match the start of the file path
          if (this.settings.watchFolder === '/' && file.path.indexOf('/') === -1) {
            this.watcher.notify(file);
          }
          // Ensure sub-folders are ignored correctly
          if (
            file.path.indexOf(this.settings.watchFolder + '/') === 0 &&
            file.path.split('/').length === this.settings.watchFolder.split('/').length + 1
          ) {
            this.watcher.notify(file);
          }
        }
      })
    );

    this.registerInterval(
      window.setInterval(() => {
        new OrganiserNotice(this, this.modal, this.inbox).display();
      }, 300000)
    );
    new OrganiserNotice(this, this.modal, this.inbox).display();

    this.addSettingTab(new InboxOrganiserTab(this.app, this, this.inbox));

    this.addCommand({
      id: 'inbox-organiser',
      name: 'Organise inbox',
      callback: () => {
        this.modal.open();
      },
    });
  }

  getSettings(): ISettings {
    return this.settings;
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    debug('Loaded settings: ' + JSON.stringify(this.settings));
  }

  async updateSettings(settings: ISettings): Promise<void> {
    this.settings = settings;
    await this.saveData(settings);
    this.onSettingsUpdate();
    debug('Saved settings: ' + JSON.stringify(this.settings));
  }

  private onSettingsUpdate(): void {
    const inboxFolder = this.app.vault.getFolderByPath(this.settings.inboxFolder);
    if (this.settings.inbox && !inboxFolder) {
      debug('Creating missing inbox folder');
      this.app.vault.createFolder(this.settings.inboxFolder);
    }

    this.app.workspace.trigger(SETTINGS_UPDATED);
  }
}
