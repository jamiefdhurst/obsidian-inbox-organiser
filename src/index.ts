import { Plugin, type App, type PluginManifest } from 'obsidian';
import { SETTINGS_UPDATED } from './events';
import { DEFAULT_SETTINGS, ISettings } from './settings';
import { InboxOrganiserTab } from './settings/tab';

export default class InboxOrganiser extends Plugin {
  private settings: ISettings = DEFAULT_SETTINGS;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload(): Promise<void> {
    this.updateSettings = this.updateSettings.bind(this);

    await this.loadSettings();

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  onLayoutReady(): void {
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
    this.app.workspace.trigger(SETTINGS_UPDATED);
  }
}
