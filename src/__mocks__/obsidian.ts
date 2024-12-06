export class Plugin {}
export class PluginSettingTab {}
export class Modal {}
export class TAbstractFile {
  public name!: string;
  public path!: string;
}
export class TFile extends TAbstractFile {
  public basename!: string;
}
export class TFolder extends TAbstractFile {
  public children!: TAbstractFile[];
}

export class FileManager {
  async renameFile(file: TAbstractFile, newPath: string): Promise<void> {}
}
export class AbstractInputSuggest<T> {};
