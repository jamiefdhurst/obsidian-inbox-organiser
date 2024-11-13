import { Plugin, type App, type PluginManifest } from 'obsidian';

export default class InboxOrganiser extends Plugin {

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }
  
  async onload(): Promise<void> {
    // this.updateSettings = this.updateSettings.bind(this);

    // await this.loadSettings();

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  onLayoutReady(): void {

  }
}
