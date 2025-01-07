import * as momentImpl from 'moment';

export const moment = momentImpl;
export class Plugin {}
export class PluginSettingTab {}
export class Modal {
  close() {
    this.onClose();
  }
  onClose() {}
  open() {}
  setTitle(title: string) {
    return this;
  };
}
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
export class AbstractInputSuggest<T> {
  close(): void {
    
  }
};
export const Notice = jest.fn();
class BaseComponent {
  onChange(cb: (val: any) => any): this {
    return this;
  }
  setDisabled(b: boolean): this {
    return this;
  }
  setValue(s: string): this {
    return this;
  }
}
export class DropdownComponent extends BaseComponent {
  addOptions(o: Record<string, string>): this {
    return this;
  }
}
export class ToggleComponent extends BaseComponent {}
export class Setting {
  public containerEl: HTMLElement;

  constructor(el: HTMLElement) {
    this.containerEl = el;
    return this;
  }

  setDesc(s: string) {
    return this;
  }

  setHeading(s: string) {
    return this;
  }

  setName(s: string) {
    return this;
  }

  addDropdown(cb: (dropdown: DropdownComponent) => any) {
    cb(new DropdownComponent());
    return this;
  }

  addToggle(cb: (toggle: ToggleComponent) => any) {
    cb(new ToggleComponent());
    return this;
  }
}
