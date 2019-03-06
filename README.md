# Application scaffold

Node.js application scaffold, with support for TypeScript, MongoDB. Has Email library, Authentication middlewares, express locals resolver for use in ejs.

## For development purposes only

_Before you proceed, ensure you have Node.js, TypeScript and MongoDB installed._

1. Clone this project

    `git clone git@github.com:dannysofftie/node-ts-app-scaffold.git`

    If you don't have ssh set up,

    `git clone git@github.com:dannysofftie/node-ts-app-scaffold.git`

    By default, the upstream repo is set to use ssh. Change remote urls if you don't have ssh set up

    `git remote set-url origin 'your own origin'`

    And then confirm the urls have been changed successfully

    `git remote -v`

2. Install dependencies

    `cd node-ts-app-scaffold && npm install`

3. Start app server

    `npm start`

Only the `master` branch will be deployed to the server. Deploying development build will not be necessary.

## Testing locally

Set environment variables by modifying `.env` file in the project root.
