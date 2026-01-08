# Umami Logger

![npm](https://img.shields.io/npm/v/@bitprojects/umami-logger-typescript)
![NPM Downloads](https://img.shields.io/npm/dy/%40bitprojects%2Fumami-logger-typescript)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/B-IT-Projects-GmbH/umami-logger-typescript/.github%2Fworkflows%2Fmain.yml)

A TypeScript client for [Umami Analytics](https://umami.is). Supports all tracker features including events, page views, session identification, revenue tracking, and more.

## Installation

```bash
npm install @bitprojects/umami-logger-typescript
```

## Quick Start

```typescript
import Umami from '@bitprojects/umami-logger-typescript';

Umami.initialize({
    baseUrl: 'https://your-umami-instance.com',
    websiteId: 'your-website-id',
});

// Track page view
Umami.trackPageView();

// Track event
Umami.trackEvent('button-click', { buttonId: 'signup' });
```

## Configuration Options

```typescript
Umami.initialize({
    baseUrl: 'https://your-umami-instance.com',  // Required
    websiteId: 'your-website-id',                 // Required
    hostName: 'custom-hostname.com',              // Override hostname
    tag: 'marketing-campaign',                    // Tag all events
    domains: ['example.com', 'www.example.com'],  // Restrict to domains
    doNotTrack: true,                             // Honor browser DNT
    excludeSearch: true,                          // Exclude URL query params
    excludeHash: true,                            // Exclude URL hash
    beforeSend: (payload) => {                    // Modify/filter events
        if (payload.url.includes('/admin')) return null;
        return payload;
    },
});
```

## API

### Page Views

```typescript
Umami.trackPageView();
Umami.trackPageView('/custom-path');
```

### Events

```typescript
Umami.trackEvent('signup', { plan: 'premium' });
```

### Generic Track (mirrors official `umami.track()`)

```typescript
Umami.track();                                    // Page view
Umami.track('event-name');                        // Named event
Umami.track('event-name', { key: 'value' });      // Event with data
Umami.track({ url: '/custom', title: 'Custom' }); // Custom payload
Umami.track(props => ({ ...props, url: '/new' }));// Callback
```

### Revenue Tracking

```typescript
Umami.trackRevenue('purchase', 99.99, 'USD');
Umami.trackRevenue('purchase', 99.99, 'EUR', { productId: 'prod-123' });
```

### Session Identification

```typescript
Umami.identify('user-123');
Umami.identify('user-123', { name: 'John', email: 'john@example.com' });
Umami.identify({ plan: 'premium' });  // Data only
Umami.clearIdentity();
```

### Tags

```typescript
Umami.setTag('campaign-summer');
Umami.clearTag();
```

## Vue Router Integration

```typescript
import { createRouter } from 'vue-router';
import Umami from '@bitprojects/umami-logger-typescript';

const router = createRouter({ /* routes */ });

router.afterEach((to) => {
    Umami.trackPageView(to.fullPath);
});
```

## TypeScript

All types are exported:

```typescript
import Umami, {
    UmamiConfig,
    UmamiPayload,
    EventData,
    IdentifyData
} from '@bitprojects/umami-logger-typescript';
```

## Author

Developed by Phil0xFF, on behalf of [B.IT Projects GmbH](https://b-it-projects.de).
