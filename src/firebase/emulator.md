## Install, configure and integrate Local Emulator Suite

### on macOS

- Install [Java](https://www.oracle.com/java/technologies/downloads/#jdk20-mac) JDK version 11 or higher.
- Install Node.js version 16.0 or higher. It is recommended to install Node.js using nvm. The Firebase CLI requires Node.js v16.13.0 or later.

Install `nvm` using cURL

Run

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
```

then in terminal,

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Verify the installation with `command -v nvm`. Install Node.js with ` nvm install 16` and confirm the version `node --version`.

- Install Firebase CLI [Set up or update the CLI](https://firebase.google.com/docs/emulator-suite/install_and_configure)

install the Firebase CLI via `npm` by running the following command:

    npm install -g firebase-tools

The Firebase CLI requires a browser to complete authentication,

    firebase login:ci

## Initialize a Firebase project

```
firebase --version
firebase init
firebase init emulators
```

## Start up emulators

```
cd src/firebase
firebase emulators:start
```
