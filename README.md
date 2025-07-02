# Inbox Organiser for Obsidian

Capture any new notes into an inbox and periodically prompt to organise these into other folders within the vault.

Designed to work with [Obsidian](https://obsidian.md).

## Features

- Collects all new and unorganised notes saved into the root of your vault into an inbox folder
- Provides an interface to organise your inbox and move your unorganised files into other folders within your vault easily
- Periodically reminds you to clear your inbox

![Organise inbox modal showing files and folder dropdowns](/docs/modal.png)

## Settings

![Settings screen showing inbox and period options](/docs/settings.png)

You can configure whether to automatically move any newly created files in the root folder into the inbox, and whether to remind you through a notice periodically to organise your inbox.

You can also configure the inbox folder to drop newly created items into (inbox by default) and the folder that is watched for new items (which is your vault's root by default).

## Development

This plugin has been developed using Typescript with the Obsidian API and Jest for testing.

Once you've cloned the repository, to speed up plugin development it is recommended to symlink the location of the plugin directly into your local Obsidian:

```bash
ln -s obsidian-inbox-organiser ~/.obsidian/plugins/
```

You can then run the plugin build automatically to pick up any changes:

```bash
npm run dev
```

To test the plugin using Jest, you can run it with or without coverage:

```bash
npm run test
npm run coverage
```

When submitting a PR, the plugin will be automatically tested, and when merged into main this will be built and released using GitHub Actions.
