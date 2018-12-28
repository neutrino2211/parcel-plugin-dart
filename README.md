# parcel-plugin-dart
Parcel plugin for [dart](https://dartlang.org)

## Installation

```sh
$ npm install parcel-plugin-dart -S
```
## Setup

NB: This plugin only works with the [dart-sdk](https://www.dartlang.org/install)

#### Get `stagehand`
First get `stagehand` by running
```sh
$ pub global activate stagehand
```

#### Init project

First create the project directory

```sh
$ mkdir helloworld && cd helloworld
```
then setup the dependencies with
```sh
$ npm init && npm i parcel-plugin-dart -S
```

finally create the dart [web](https://webdev.dartlang.org) project

```sh
$ stagehand web-simple
```

#### Start development server

```sh
$ parcel serve web/index.html
```

# Testing powered by
<img src="./assets/Browserstack-logo.svg"
    href="http://www.browserstack.com" />