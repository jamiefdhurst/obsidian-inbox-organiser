import { Notice, Plugin, TFile, type App, type PluginManifest } from 'obsidian';
import { SETTINGS_UPDATED } from './events';
import { DEFAULT_SETTINGS, ISettings } from './settings';
import { InboxOrganiserTab } from './settings/tab';
import { Watcher } from './watcher';
import { OrganiserNotice } from './notice';
import { OrganiserModal } from './modal';
import { Inbox } from './inbox';

export const INBOX_FOLDER = 'inbox';

export default class InboxOrganiser extends Plugin {
  private settings: ISettings = DEFAULT_SETTINGS;
  private watcher: Watcher;
  private inbox: Inbox;
  private modal: OrganiserModal;
  private notice: OrganiserNotice;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.watcher = new Watcher(this, app.fileManager);
    this.inbox = new Inbox(this.app.vault);
    this.modal = new OrganiserModal(this.app);
  }
  
  async onload(): Promise<void> {
    this.updateSettings = this.updateSettings.bind(this);

    await this.loadSettings();

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  onLayoutReady(): void {
    this.registerEvent(this.app.vault.on('create', (file) => {
      if (file instanceof TFile && file.path.indexOf('/') === -1) {
        this.watcher.notify(file);
      }
    }));

    this.registerInterval(window.setInterval(() => {
      (new OrganiserNotice(this, this.modal, this.inbox)).display();
    }, 300000));
    (new OrganiserNotice(this, this.modal, this.inbox)).display();

    this.addSettingTab(new InboxOrganiserTab(this.app, this));
  }

  getSettings(): ISettings {
    return this.settings;
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async updateSettings(settings: ISettings): Promise<void> {
    this.settings = settings;
    await this.saveData(settings);
    this.onSettingsUpdate();
  }

  private onSettingsUpdate(): void {
    const inboxFolder = this.app.vault.getFolderByPath(INBOX_FOLDER);
    if (this.settings.inbox && !inboxFolder) {
      this.app.vault.createFolder(INBOX_FOLDER);
    }

    this.app.workspace.trigger(SETTINGS_UPDATED);
  }
}
