import axios from 'axios';

// Configuration interface for Umami
interface UmamiConfig {
    baseUrl: string;
    websiteId: string;
    hostName?: string;
    tag?: string;
}

// Generic interface for event data
interface EventData {
    [key: string]: any;
}

// Interface for session data used in identify calls
interface SessionData {
    [key: string]: any;
}

class UmamiLogger {
    // Singleton instance
    private static instance: UmamiLogger;

    // Configuration object
    private config?: UmamiConfig;

    // Distinct ID for linking sessions to user identities
    private distinctId?: string;

    // Private constructor for Singleton pattern
    private constructor() {}

    /**
     * Get or create the singleton instance.
     */
    static getInstance(): UmamiLogger {
        if (!UmamiLogger.instance) {
            UmamiLogger.instance = new UmamiLogger();
        }
        return UmamiLogger.instance;
    }

    /**
     * Initialize logger with configuration.
     *
     * @param config - Umami configuration object
     */
    initialize(config: UmamiConfig): void {
        this.config = config;
    }

    /**
     * Set a distinct ID to include in all subsequent payloads.
     *
     * @param id - Unique identifier for the user
     */
    setDistinctId(id: string): void {
        this.distinctId = id;
    }

    /**
     * Track a page view.
     *
     * @param overrideUrl - Optional URL to override the default
     */
    async trackPageView(overrideUrl?: string, tag?: string): Promise<void> {
        // Create payload with browser-specific data and optional URL
        const payload: any = {
            hostname: this.config?.hostName || window.location.hostname,
            language: navigator.language,
            referrer: document.referrer || '',
            screen: `${window.screen.width}x${window.screen.height}`,
            title: document.title,
            url: overrideUrl || window.location.pathname,
            website: this.config?.websiteId,
        };

        const resolvedTag = tag || this.config?.tag;
        if (resolvedTag) {
            payload.tag = resolvedTag;
        }

        if (this.distinctId) {
            payload.id = this.distinctId;
        }

        // Send the data
        this.sendData({ payload: payload, type: 'event' });
    }

    /**
     * Log a custom event.
     *
     * @param eventName - Name of the event
     * @param eventData - Optional data to attach to the event
     */
    async logEvent(eventName: string, eventData: EventData = {}, tag?: string): Promise<void> {
        if (!this.config || !eventName) return;

        // Create payload with event name and data
        const payload: any = {
            hostname: this.config?.hostName || window.location.hostname,
            language: navigator.language,
            referrer: document.referrer || '',
            screen: `${window.screen.width}x${window.screen.height}`,
            title: document.title,
            url: window.location.pathname,
            website: this.config.websiteId,
            name: eventName,
            data: eventData,
        };

        const resolvedTag = tag || this.config?.tag;
        if (resolvedTag) {
            payload.tag = resolvedTag;
        }

        if (this.distinctId) {
            payload.id = this.distinctId;
        }

        // Send the data
        this.sendData({ payload: payload, type: 'event' });
    }

    /**
     * Identify a session with a unique ID and/or session data.
     *
     * Overloads:
     * - identify(uniqueId: string) — assigns ID to session
     * - identify(uniqueId: string, data: SessionData) — assigns ID + session data
     * - identify(data: SessionData) — stores session data without ID
     */
    async identify(uniqueIdOrData: string | SessionData, data?: SessionData): Promise<void> {
        if (!this.config) return;

        const payload: any = {
            hostname: this.config.hostName || window.location.hostname,
            language: navigator.language,
            referrer: document.referrer || '',
            screen: `${window.screen.width}x${window.screen.height}`,
            title: document.title,
            url: window.location.pathname,
            website: this.config.websiteId,
        };

        if (typeof uniqueIdOrData === 'string') {
            payload.id = uniqueIdOrData;
            if (data) {
                payload.data = data;
            }
        } else {
            payload.data = uniqueIdOrData;
        }

        this.sendData({ payload: payload, type: 'identify' });
    }

    /**
     * Send data to Umami.
     *
     * @param payload - Data to send
     */
    private async sendData(payload: any): Promise<void> {
        const apiUrl = `${this.config?.baseUrl}/api/send`;

        try {
            await axios.post(apiUrl, payload);
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }
}

export default UmamiLogger;
