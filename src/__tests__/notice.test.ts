import { type Moment } from 'moment';
import { Modal, moment, Notice, TFile } from 'obsidian';
import InboxOrganiser from '..';
import { Inbox } from '../inbox';
import { OrganiserNotice } from '../notice';
import { DEFAULT_SETTINGS, ISettings, Period } from '../settings';

describe('OrganiserNotice', () => {
  let sut: OrganiserNotice;

  let plugin: InboxOrganiser;
  let modal: Modal;
  let inbox: Inbox;
  let now: Moment;

  const settings: ISettings = Object.assign({}, DEFAULT_SETTINGS);

  beforeEach(() => {
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = jest.fn().mockReturnValue(settings);
    modal = jest.fn() as unknown as Modal;
    modal.open = jest.fn();
    inbox = jest.fn() as unknown as Inbox;
    inbox.getFiles = jest.fn();
    now = moment('2025-01-01T00:00:00');

    sut = new OrganiserNotice(plugin, modal, inbox, now);
  });

  it('creates using default dependencies', () => {
    sut = new OrganiserNotice(plugin, modal, inbox);

    expect(sut).toBeInstanceOf(OrganiserNotice);
  });

  it('does nothing if inbox is disabled', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles');
    settings.inbox = false;
    settings.period = 'disabled';

    sut.display();

    expect(inboxGetFiles).not.toHaveBeenCalled();
  });

  it('does nothing if period is disabled', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles');
    settings.inbox = true;
    settings.period = 'disabled';

    sut.display();

    expect(inboxGetFiles).not.toHaveBeenCalled();
  });

  it('does nothing if the period time does not match', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles');
    settings.inbox = true;

    const periods: Period[] = [
      'daily_9am',
      'daily_11am',
      'daily_3pm',
      'daily_5pm',
      'weekly_mon_9am',
      'weekly_mon_5pm',
      'weekly_fri_9am',
      'weekly_fri_5pm',
    ];
    for (const period of periods) {
      settings.period = period;

      sut.display();

      expect(inboxGetFiles).not.toHaveBeenCalled();
    }
  });

  it('does nothing when no files are present', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'daily_9am';
    now.set({ hour: 9, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
    expect(Notice).not.toHaveBeenCalled();
  });

  it('calls when period and time matches and files are present', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([new TFile()]);
    settings.inbox = true;
    settings.period = 'daily_9am';
    now.set({ hour: 9, minute: 1, second: 1 });

    sut.display();

    // TODO: The mock modal connected to this is currently not able to be spied upon - need to understand why
    const fragment = (Notice as jest.Mock<Notice>).mock.calls[0][0] as DocumentFragment;
    fragment.children[1].dispatchEvent(new Event('click'));

    expect(inboxGetFiles).toHaveBeenCalled();
    expect(Notice).toHaveBeenCalled();
  });

  it('works correctly under DST', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([new TFile()]);
    settings.inbox = true;
    settings.period = 'daily_9am';
    now.set({ date: 1, month: 6, year: 2024, hour: 9, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
    expect(Notice).toHaveBeenCalled();
  });

  it('works correctly for Mon 9am', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_mon_9am';
    now.set({ date: 6, month: 0, year: 2025, hour: 9, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
  });

  it('works correctly for Mon 5pm', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_mon_5pm';
    now.set({ date: 6, month: 0, year: 2025, hour: 17, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
  });

  it('does nothing for Mon 5pm when not Monday', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_mon_5pm';
    now.set({ date: 7, month: 0, year: 2025, hour: 17, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).not.toHaveBeenCalled();
  });

  it('works correctly for Fri 9am', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_fri_9am';
    now.set({ date: 3, month: 0, year: 2025, hour: 9, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
  });

  it('works correctly for Fri 5pm', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_fri_5pm';
    now.set({ date: 3, month: 0, year: 2025, hour: 17, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
  });

  it('does nothing for Fri 5pm when not Friday', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_fri_5pm';
    now.set({ date: 7, month: 0, year: 2025, hour: 17, minute: 1, second: 1 });

    sut.display();

    expect(inboxGetFiles).not.toHaveBeenCalled();
  });

  it('does nothing for Fri 5pm when just beyond five minute window', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([]);
    settings.inbox = true;
    settings.period = 'weekly_fri_5pm';
    now.set({ date: 3, month: 0, year: 2025, hour: 17, minute: 5, second: 0 });

    sut.display();

    expect(inboxGetFiles).not.toHaveBeenCalled();
  });
});
