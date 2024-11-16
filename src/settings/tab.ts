import { type App, PluginSettingTab, Setting } from 'obsidian';
import InboxOrganiser from 'src';
import { ISettings, type Period } from '.';

export class InboxOrganiserTab extends PluginSettingTab {
  private plugin: InboxOrganiser;

  constructor(app: App, plugin: InboxOrganiser) {
    super(app, plugin);
    this.plugin = plugin;
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
        toggle
          .setValue(settings.inbox)
          .onChange(async (val) => {
            settings.inbox = val;
            await this.plugin.updateSettings(settings);
          });
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
          })
      })
  }
}
