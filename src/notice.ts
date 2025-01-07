import { type Moment } from 'moment';
import { Modal, moment, Notice } from 'obsidian';
import InboxOrganiser from '.';
import { Inbox } from './inbox';

export class OrganiserNotice {
  private plugin: InboxOrganiser;
  private modal: Modal;
  private inbox: Inbox;
  private now: Moment;

  constructor(plugin: InboxOrganiser, modal: Modal, inbox: Inbox, now?: Moment) {
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

    if (settings.period === 'daily_9am' && !this.now.isBetween(this.now.clone().set({hour: 9, minute: 0, second: 0}), this.now.clone().set({hour: 9, minute: 9, second: 59}))) {
      return;
    }
    if (settings.period === 'daily_11am' && !this.now.isBetween(this.now.clone().set({hour: 11, minute: 0, second: 0}), this.now.clone().set({hour: 11, minute: 9, second: 59}))) {
      return;
    }
    if (settings.period === 'daily_3pm' && !this.now.isBetween(this.now.clone().set({hour: 15, minute: 0, second: 0}), this.now.clone().set({hour: 15, minute: 9, second: 59}))) {
      return;
    }
    if (settings.period === 'daily_5pm' && !this.now.isBetween(this.now.clone().set({hour: 17, minute: 0, second: 0}), this.now.clone().set({hour: 17, minute: 9, second: 59}))) {
      return;
    }
    if (settings.period === 'weekly_mon_9am' && (this.now.format('dd') !== 'Mo' || !this.now.isBetween(this.now.clone().set({hour: 9, minute: 0, second: 0}), this.now.clone().set({hour: 9, minute: 9, second: 59})))) {
      return;
    }
    if (settings.period === 'weekly_mon_5pm' && (this.now.format('dd') !== 'Mo' || !this.now.isBetween(this.now.clone().set({hour: 17, minute: 0, second: 0}), this.now.clone().set({hour: 17, minute: 9, second: 59})))) {
      return;
    }
    if (settings.period === 'weekly_fri_9am' && (this.now.format('dd') !== 'Fr' || !this.now.isBetween(this.now.clone().set({hour: 9, minute: 0, second: 0}), this.now.clone().set({hour: 9, minute: 9, second: 59})))) {
      return;
    }
    if (settings.period === 'weekly_fri_5pm' && (this.now.format('dd') !== 'Fr' || !this.now.isBetween(this.now.clone().set({hour: 17, minute: 0, second: 0}), this.now.clone().set({hour: 17, minute: 9, second: 59})))) {
      return;
    }

    if (!this.inbox.getFiles().length) {
      return;
    }

    new Notice(this.getFragment());
  }
}
