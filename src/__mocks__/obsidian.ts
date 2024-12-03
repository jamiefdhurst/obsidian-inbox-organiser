export class Plugin {}
export class PluginSettingTab {}
export class Modal {}
export class TAbstractFile {}
export class TFile extends TAbstractFile {
  public basename!: string;
  public name!: string;
}

export class FileManager {
  async renameFile(file: TAbstractFile, newPath: string): Promise<void> {}
}
