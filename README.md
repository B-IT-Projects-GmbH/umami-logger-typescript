# Umami Logger

![npm](https://img.shields.io/npm/v/umami-logger-typescript)

## Description

Umami Logger is a configurable event logging package for [Umami Analytics](https://umami.is). It allows you to easily send custom events with automatically populated browser metadata.

## Features

- Easy setup with minimal configuration
- Automatically captures common browser metadata
- Built with TypeScript
- Uses Axios for network requests

## Installation

Install the package using npm:

```bash
npm install umami-logger-typescript
```

Or using yarn:

```bash
yarn add umami-logger-typescript
```

## Usage

First, initialize the Umami Logger with your configuration:

```typescript
import Umami from 'umami-logger-typescript';

Umami.initialize({
    baseUrl: 'https://umami.is',
    websiteId: 'your-website-id',
});
```

Then, you can log events like this:

```typescript
Umami.trackEvent('some-event', { foo: 'bar' });
```

## API

### `initialize(config: UmamiConfig): void`

Initialize the logger with your Umami configuration.

- `config.baseUrl`: The base URL of your Umami instance.
- `config.websiteId`: The website ID in your Umami dashboard.

### `trackEvent(eventName: string, eventData: EventData): void`

Logs an event to your Umami dashboard.

- `eventName`: The name of the event.
- `eventData`: Additional data to attach to the event (optional).

### `trackPageView(overrideUrl?: string): void`

Automatically logs a page view event. This is triggered when you initialize Umami Logger.

- `overrideUrl`: An optional parameter that lets you specify a custom URL for the page view event, overriding the default `window.location.pathname`.

## Example for Vue Router Integration

To track page views in a Vue project with Vue Router, you can use the `beforeEach` or `afterEach` hooks in your router setup:

```typescript
import VueRouter from 'vue-router';
import Umami from 'umami-logger-typescript';

const router = new VueRouter({
  // your routes here
});

router.beforeEach((to, from, next) => {
  Umami.trackPageView(to.path); // the to.path will override the default pathname
  next();
});
```

## Author

Developed by Phil0xFF, on behalf of [B.IT Projects GmbH](https://b-it-projects.de).
