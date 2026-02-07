# Umami Logger

![npm](https://img.shields.io/npm/v/@bitprojects/umami-logger-typescript)
![NPM Downloads](https://img.shields.io/npm/dy/%40bitprojects%2Fumami-logger-typescript)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/B-IT-Projects-GmbH/umami-logger-typescript/.github%2Fworkflows%2Fmain.yml)

## Description

Umami Logger is a configurable event logging package for [Umami Analytics](https://umami.is). It allows you to easily send custom events with automatically populated browser metadata.

## Features

- Easy setup with minimal configuration
- Automatically captures common browser metadata
- Built with TypeScript
- Uses Axios for network requests
- Distinct IDs for linking sessions to user identities
- Session identification via the `identify` endpoint
- Tags for event grouping and A/B testing

## Installation

Install the package using npm:

```bash
npm install @bitprojects/umami-logger-typescript
```

Or using yarn:

```bash
yarn add @bitprojects/umami-logger-typescript
```

## Usage

First, initialize the Umami Logger with your configuration:

```typescript
import Umami from '@bitprojects/umami-logger-typescript';

Umami.initialize({
    baseUrl: 'https://umami.is',
    websiteId: 'your-website-id',
    hostName: 'your-custom-hostname', //optional
    tag: 'variant-a', //optional, default tag for all events
});
```

Then, you can log events like this:

```typescript
Umami.trackEvent('some-event', { foo: 'bar' });
```

### Distinct IDs

Set a distinct ID to link all subsequent events to a specific user:

```typescript
Umami.setDistinctId('user-123');

// All future trackEvent and trackPageView calls will include this ID
Umami.trackEvent('purchase', { item: 'widget' });
```

### Session Identification

Use `identify` to attach identity or session data:

```typescript
// Assign a unique ID to the session
Umami.identify('user-123');

// Assign a unique ID with session data
Umami.identify('user-123', { plan: 'pro', role: 'admin' });

// Store session data without an ID
Umami.identify({ theme: 'dark', locale: 'en' });
```

### Tags

Tags can be set globally via the config or overridden per call:

```typescript
// Global tag set in initialize (see above)

// Override tag for a specific event
Umami.trackEvent('click', { buttonId: 'cta' }, 'variant-b');

// Override tag for a specific page view
Umami.trackPageView('/landing', 'variant-b');
```

## API

### `initialize(config: UmamiConfig): void`

Initialize the logger with your Umami configuration.

- `config.baseUrl`: The base URL of your Umami instance.
- `config.websiteId`: The website ID in your Umami dashboard.
- `config.hostName`: Optional custom hostname override.
- `config.tag`: Optional default tag applied to all events.

### `trackEvent(eventName: string, eventData?: EventData, tag?: string): void`

Logs an event to your Umami dashboard.

- `eventName`: The name of the event.
- `eventData`: Additional data to attach to the event (optional).
- `tag`: Optional tag override for this event.

### `trackPageView(overrideUrl?: string, tag?: string): void`

Logs a page view event.

- `overrideUrl`: Optional custom URL, overriding the default `window.location.pathname`.
- `tag`: Optional tag override for this page view.

### `setDistinctId(id: string): void`

Sets a distinct ID that will be included in all subsequent event and page view payloads.

- `id`: A unique identifier for the user.

### `identify(uniqueId: string): void`
### `identify(uniqueId: string, data: object): void`
### `identify(data: object): void`

Identifies the current session. Sends a payload with `type: "identify"` to the Umami API.

- `uniqueId`: A unique identifier to assign to the session.
- `data`: Session data (key-value pairs) to store.

## Example for Vue Router Integration

To track page views in a Vue project with Vue Router, you can use the `beforeEach` or `afterEach` hooks in your router setup:

```typescript
import VueRouter from 'vue-router';
import Umami from '@bitprojects/umami-logger-typescript';

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
