import { FileManager, TFile, TFolder, Vault } from 'obsidian';
import { INBOX_FOLDER } from '.';

export class Inbox {
  private vault: Vault;
  private fileManager: FileManager;

  constructor(vault: Vault, fileManager: FileManager) {
    this.vault = vault;
    this.fileManager = fileManager;
  }

  getFiles(): TFile[] {
    const folder = this.vault.getFolderByPath(INBOX_FOLDER);
    if (!folder) {
      return [];
    }

    return folder.children
      .filter(child => child instanceof TFile)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  getFolders(includeRoot: boolean = false): TFolder[] {
    const folders = this.vault.getAllFolders(includeRoot);

    return folders
      .filter(folder => folder.path !== INBOX_FOLDER)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async move(file: TFile, path: string): Promise<void> {
    return this.fileManager.renameFile(file, `${path}/${file.name}`);
  }
}
