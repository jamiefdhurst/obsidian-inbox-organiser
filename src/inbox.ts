import { TFile, TFolder, Vault } from 'obsidian';
import { INBOX_FOLDER } from 'src';

export class Inbox {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  getFiles(): TFile[] {
    const folder = this.vault.getFolderByPath(INBOX_FOLDER);
    if (!folder) {
      return [];
    }

    return folder?.children.filter(child => child instanceof TFile);
  }

  getFolders(): TFolder[] {
    const folders = this.vault.getAllFolders(false);

    return folders.filter(folder => folder.path !== INBOX_FOLDER);
  }
 }
