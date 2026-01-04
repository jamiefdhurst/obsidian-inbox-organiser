export const DEFAULT_INBOX_FOLDER = 'inbox';

export type Period =
  | 'disabled'
  | 'daily_9am'
  | 'daily_11am'
  | 'daily_3pm'
  | 'daily_5pm'
  | 'weekly_mon_9am'
  | 'weekly_mon_5pm'
  | 'weekly_fri_9am'
  | 'weekly_fri_5pm';

export interface ISettings {
  inbox: boolean;
  inboxFolder: string;
  period: Period;
  watchFolder: string;
}

export const DEFAULT_SETTINGS: ISettings = Object.freeze({
  inbox: false,
  inboxFolder: DEFAULT_INBOX_FOLDER,
  period: 'disabled',
  watchFolder: '/',
});
