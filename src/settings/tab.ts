import { type App, PluginSettingTab, Setting } from 'obsidian';
import { ISettings, type Period } from '.';
import InboxOrganiser from '..';
import { Inbox } from '../inbox';
import { FolderSuggest } from '../modal/folder-suggest';

export class InboxOrganiserTab extends PluginSettingTab {
  private plugin: InboxOrganiser;
  private inbox: Inbox;

  constructor(app: App, plugin: InboxOrganiser, inbox: Inbox) {
    super(app, plugin);
    this.plugin = plugin;
    this.inbox = inbox;
  }

  display(): void {
    this.containerEl.empty();

    let settings: ISettings = this.plugin.getSettings();
    const periods: Record<string, string> = {
      disabled: 'Disabled',
      daily_9am: 'Daily at 9am',
      daily_11am: 'Daily at 11am',
      daily_3pm: 'Daily at 3pm',
      daily_5pm: 'Daily at 5pm',
      weekly_mon_9am: 'Weekly on Monday at 9am',
      weekly_mon_5pm: 'Weekly on Monday at 5pm',
      weekly_fri_9am: 'Weekly on Friday at 9am',
      weekly_fri_5pm: 'Weekly on Friday at 5pm',
    };

    new Setting(this.containerEl)
      .setName('Enable inbox')
      .setDesc('Automatically move new notes in the root folder of the vault into the inbox.')
      .addToggle((toggle) => {
        toggle.setValue(settings.inbox).onChange(async (val) => {
          settings.inbox = val;
          await this.plugin.updateSettings(settings);
        });
      });

    const inboxFolder = new Setting(this.containerEl);
    inboxFolder
      .setName('Inbox folder')
      .setDesc('Which folder should act as your inbox for new files?');
    const inboxFolderEl = inboxFolder.controlEl.createEl('input', { type: 'text' });
    inboxFolderEl.setAttr('value', settings.inboxFolder);
    new FolderSuggest(this.app, this.inbox.getFoldersWithInbox(), inboxFolderEl);
    inboxFolderEl.addEventListener('change', (event: Event) => {
      const el = event.target as HTMLSelectElement;
      settings.inboxFolder = el.value;
      this.plugin.updateSettings(settings);
    });

    const watchFolder = new Setting(this.containerEl);
    watchFolder
      .setName('Watched folder')
      .setDesc(
        'Which folder should be monitored for new notes to intercept and add into the inbox (default root).'
      );
    const watchFolderEl = watchFolder.controlEl.createEl('input', { type: 'text' });
    watchFolderEl.setAttr('value', settings.watchFolder);
    new FolderSuggest(this.app, this.inbox.getFolders(true), watchFolderEl);
    watchFolderEl.addEventListener('change', (event: Event) => {
      const el = event.target as HTMLSelectElement;
      settings.watchFolder = el.value;
      this.plugin.updateSettings(settings);
    });

    new Setting(this.containerEl)
      .setName('Reminder period')
      .setDesc('How often to send a reminder to organise your inbox.')
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(periods)
          .setValue(settings.period)
          .onChange(async (val) => {
            settings.period = val as Period;
            await this.plugin.updateSettings(settings);
          });
      });
  }
}
