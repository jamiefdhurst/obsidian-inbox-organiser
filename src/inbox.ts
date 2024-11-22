import { TAbstractFile, Vault } from 'obsidian';
import { INBOX_FOLDER } from 'src';

export class Inbox {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  getFiles(): TAbstractFile[] {
    const folder = this.vault.getFolderByPath(INBOX_FOLDER);
    if (!folder) {
      return [];
    }

    return folder?.children;
  }
 }
