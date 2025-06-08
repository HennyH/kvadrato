# Kvadrato

Accept payments for square orders easily with Monero.

## Developer Setup

You need to create a development square environment [developer.squareup.com](https://developer.squareup.com/us/en) and then perform the following steps:

1. Open the developer dashboard and create an application in the "Applications" section.
2. Active the test account by going to the "Sandbox test accounts" section [https://developer.squareup.com/console/en/sandbox-test-accounts](https://developer.squareup.com/console/en/sandbox-test-accounts) and click the "Default Test Account" link. This will open a modal within which there will be a "Open in Square Dashboard" button you need to click.
3. If the dashboard UI fails to load ensure your browser (and/or ublock origin) isn't preventing the scripts from loading.

From your _application's_ credentials page copy out the Application ID and place it in a `.env.local` file in the root directory like so:

```
VITE_SQUARE_CLIENT_ID="<your-app-id-here>"
VITE_SQUARE_API_HOSTNAME="connect.squareupsandbox.com"
```

Then (assuming you have `rust` and `npm` installed) run `npm install` followed by `npm run tauri dev` and the app should launch.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
