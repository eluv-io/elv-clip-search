## Install, configure and integrate Local Emulator Suite

Before setting up the Emulator Suite, users should either create their own Firebase project or be a member of [project ID: elv-clip-search](https://console.firebase.google.com/project/elv-clip-search/overview).

### Install Java, nvm, Node.js, and firebase CLI on macOS

To install the Emulator Suite user will need:

- Install [Java](https://www.oracle.com/java/technologies/downloads/#jdk20-mac) JDK version 11 or higher.
- Install Node.js version 16.0 or higher. It is recommended to install Node.js using nvm. The Firebase CLI requires Node.js v16.13.0 or later.

- Install `nvm` using cURL

Run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash` in terminal, then

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Verify the installation with `command -v nvm`.

- Install Node.js with ` nvm install 16` and confirm the version `node --version`.

- Install Firebase CLI [Set up or update the CLI](https://firebase.google.com/docs/emulator-suite/install_and_configure)

install the Firebase CLI via `npm` by running the following command:

    npm install -g firebase-tools

The Firebase CLI requires a browser to complete authentication. Run the command below in the terminal and follow the authentication process. Please note, if you're using a project ID different from [project ID: elv-clip-search](https://console.firebase.google.com/project/elv-clip-search/overview), you'll need to create your own [firebase.json](/src/firebase/firebase.json) and [firebase.rules](/src/firebase/firestore.rules).

    firebase login:ci

## Install the Emulator Suite

User will need CLI version 8.14.0 or higher to use the Emulator Suite. Run `firebase --version` to check the version.

Initialize the current working directory as a Firebase project and set up the Emulator Suite by running:

```
firebase init
firebase init emulators
```

## Start the local emulator suite

```
cd src/firebase
firebase emulators:start
```

If using the repo's emulator as it is, user can view the Emulator firestore DB UI at http://127.0.0.1:8083/firestore.
