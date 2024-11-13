# Inbox Organiser for Obsidian

Capture any new notes into an inbox and periodically prompt to organise these into other folders within the vault.

Designed to work with [Obsidian](https://obsidian.md).

**In active development.**

## Features

TBC.

## Settings

TBC.

## Development

This plugin has been developed using Typescript with the Obsidian API and Jest for testing.

Once you've cloned the repository, to speed up plugin development it is recommended to symlink the location of the plugin directly into your local Obsidian:

```bash
ln -s obsidian-auto-tasks ~/.obsidian/plugins/
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
