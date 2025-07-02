import { FileManager, TFile, TFolder, Vault } from 'obsidian';
import InboxOrganiser from '.';

export class Inbox {
  private plugin: InboxOrganiser;
  private vault: Vault;
  private fileManager: FileManager;

  constructor(plugin: InboxOrganiser, vault: Vault, fileManager: FileManager) {
    this.plugin = plugin;
    this.vault = vault;
    this.fileManager = fileManager;
  }

  getFiles(): TFile[] {
    const settings = this.plugin.getSettings();
    const folder = this.vault.getFolderByPath(settings.inboxFolder);
    if (!folder) {
      return [];
    }

    return folder.children
      .filter(child => child instanceof TFile)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  getFolders(includeRoot: boolean = false): TFolder[] {
    const settings = this.plugin.getSettings();
    const folders = this.vault.getAllFolders(includeRoot);

    return folders
      .filter(folder => folder.path !== settings.inboxFolder)
      .sort((a, b) => a.name.localeCompare(b.path));
  }

  getFoldersWithInbox(): TFolder[] {
    const folders = this.vault.getAllFolders(false);

    return folders
      .sort((a, b) => a.name.localeCompare(b.path));
  }

  async move(file: TFile, path: string): Promise<void> {
    return this.fileManager.renameFile(file, `${path}/${file.name}`);
  }
}
