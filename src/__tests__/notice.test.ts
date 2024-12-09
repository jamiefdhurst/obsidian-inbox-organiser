import { type Moment } from 'moment';
import { moment, Notice, TFile } from 'obsidian';
import InboxOrganiser from '..';
import { Inbox } from '../inbox';
import { OrganiserModal } from '../modal';
import { OrganiserNotice } from '../notice';
import { DEFAULT_SETTINGS, ISettings, Period } from '../settings';

jest.mock('obsidian');

describe('OrganiserNotice', () => {

  let sut: OrganiserNotice;
  
  let plugin: InboxOrganiser;
  let modal: OrganiserModal;
  let inbox: Inbox;
  let now: Moment;

  const settings: ISettings = Object.assign({}, DEFAULT_SETTINGS);

  beforeEach(() => {
    plugin = jest.fn() as unknown as InboxOrganiser;
    plugin.getSettings = (jest.fn()).mockReturnValue(settings);
    modal = jest.fn() as unknown as OrganiserModal;
    inbox = jest.fn() as unknown as Inbox;
    inbox.getFiles = jest.fn();
    now = moment();

    sut = new OrganiserNotice(plugin, modal, inbox, now);
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

    const periods: Period[] = ['daily_9am', 'daily_11am', 'daily_3pm', 'daily_5pm', 'weekly_mon_9am', 'weekly_mon_5pm', 'weekly_fri_9am', 'weekly_fri_5pm'];
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
    now.set({hour: now.isDST() ? 10 : 9, minute: 1, second: 1});

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
    expect(Notice).not.toHaveBeenCalled();
  });

  it('calls when period and time matches and files are present', () => {
    const inboxGetFiles = jest.spyOn(inbox, 'getFiles').mockReturnValue([new TFile()]);
    settings.inbox = true;
    settings.period = 'daily_9am';
    now.set({hour: now.isDST() ? 10 : 9, minute: 1, second: 1});

    sut.display();

    expect(inboxGetFiles).toHaveBeenCalled();
    expect(Notice).toHaveBeenCalled();
  });

});
