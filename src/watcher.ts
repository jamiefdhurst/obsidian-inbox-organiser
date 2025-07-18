import { FileManager, TFile } from 'obsidian';
import InboxOrganiser from '.';
import debug from './log';

export class Watcher {
  private plugin: InboxOrganiser;
  private fileManager: FileManager;

  constructor(plugin: InboxOrganiser, fileManager: FileManager) {
    this.plugin = plugin;
    this.fileManager = fileManager;
  }

  notify(file: TFile) {
    const settings = this.plugin.getSettings();

    if (settings.inbox) {
      debug('Moving newly created file to inbox');
      this.fileManager.renameFile(file, `${settings.inboxFolder}/${file.name}`);
    }
  }
}
