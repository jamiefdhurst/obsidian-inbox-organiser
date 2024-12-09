import { type Moment } from 'moment';
import { moment, Notice } from 'obsidian';
import InboxOrganiser from '.';
import { Inbox } from './inbox';
import { OrganiserModal } from './modal';

export class OrganiserNotice {
  private plugin: InboxOrganiser;
  private modal: OrganiserModal;
  private inbox: Inbox;
  private now: Moment;

  constructor(plugin: InboxOrganiser, modal: OrganiserModal, inbox: Inbox, now?: Moment) {
    this.plugin = plugin;
    this.modal = modal;
    this.inbox = inbox;
    this.now = now || moment();
  }

  private getFragment(): DocumentFragment {
    const fragment = new DocumentFragment();
    fragment.createEl('span', { text: 'This is a reminder to organise all the files within your inbox folder: click ' });
    fragment.createEl('a', { text: 'here' }).addEventListener('click', () => this.modal.open());
    fragment.createEl('span', { text: ' to get started.' });

    return fragment;
  }

  display() {
    const settings = this.plugin.getSettings();

    if (!settings.inbox || settings.period === 'disabled') {
      return;
    }

    if (settings.period === 'daily_9am' && !this.now.isBetween(moment('09:00:00', 'HH:mm:ss'), moment('09:09:59', 'HH:mm:ss'))) {
      return;
    }
    if (settings.period === 'daily_11am' && !this.now.isBetween(moment('11:00:00', 'HH:mm:ss'), moment('11:09:59', 'HH:mm:ss'))) {
      return;
    }
    if (settings.period === 'daily_3pm' && !this.now.isBetween(moment('15:00:00', 'HH:mm:ss'), moment('15:09:59', 'HH:mm:ss'))) {
      return;
    }
    if (settings.period === 'daily_5pm' && !this.now.isBetween(moment('17:00:00', 'HH:mm:ss'), moment('17:09:59', 'HH:mm:ss'))) {
      return;
    }
    if (settings.period === 'weekly_mon_9am' && (this.now.format('dd') !== 'Mo' || !this.now.isBetween(moment('09:00:00', 'HH:mm:ss'), moment('09:09:59', 'HH:mm:ss')))) {
      return;
    }
    if (settings.period === 'weekly_mon_5pm' && (this.now.format('dd') !== 'Mo' || !this.now.isBetween(moment('17:00:00', 'HH:mm:ss'), moment('17:09:59', 'HH:mm:ss')))) {
      return;
    }
    if (settings.period === 'weekly_fri_9am' && (this.now.format('dd') !== 'Fr' || !this.now.isBetween(moment('09:00:00', 'HH:mm:ss'), moment('09:09:59', 'HH:mm:ss')))) {
      return;
    }
    if (settings.period === 'weekly_fri_5pm' && (this.now.format('dd') !== 'Fr' || !this.now.isBetween(moment('17:00:00', 'HH:mm:ss'), moment('17:09:59', 'HH:mm:ss')))) {
      return;
    }

    if (!this.inbox.getFiles().length) {
      return;
    }

    new Notice(this.getFragment());
  }
}
