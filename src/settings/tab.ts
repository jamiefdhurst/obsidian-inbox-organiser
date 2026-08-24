import { type App, PluginSettingTab, type SettingDefinitionItem, type TFolder } from 'obsidian';
import { ISettings, type Period } from '.';
import InboxOrganiser from '..';

const PERIODS: Record<Period, string> = {
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

export class InboxOrganiserTab extends PluginSettingTab {
  private plugin: InboxOrganiser;

  constructor(app: App, plugin: InboxOrganiser) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: 'Enable inbox',
        desc: 'Automatically move new notes in the root folder of the vault into the inbox.',
        control: { type: 'toggle', key: 'inbox' },
      },
      {
        name: 'Inbox folder',
        desc: 'Which folder should act as your inbox for new files?',
        control: { type: 'folder', key: 'inboxFolder' },
      },
      {
        name: 'Watched folder',
        desc: 'Which folder should be monitored for new notes to intercept and add into the inbox (default root).',
        control: {
          type: 'folder',
          key: 'watchFolder',
          // The root is the default, and watching the inbox itself would move
          // its files back into it
          includeRoot: true,
          filter: (folder: TFolder) => folder.path !== this.plugin.getSettings().inboxFolder,
        },
      },
      {
        name: 'Reminder period',
        desc: 'How often to send a reminder to organise your inbox.',
        control: { type: 'dropdown', key: 'period', options: PERIODS },
      },
    ];
  }

  getControlValue(key: string): unknown {
    return this.plugin.getSettings()[key as keyof ISettings];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    await this.plugin.updateSettings({ ...this.plugin.getSettings(), [key]: value });

    // Re-evaluate the watched folder filter, which depends on the inbox folder
    this.refreshDomState();
  }
}
