import axios from 'axios';

// Configuration interface for Umami
interface UmamiConfig {
    baseUrl: string;
    websiteId: string;
    hostName?: string;
}

// Generic interface for event data
interface EventData {
    [key: string]: any;
}

class UmamiLogger {
    // Singleton instance
    private static instance: UmamiLogger;

    // Configuration object
    private config?: UmamiConfig;

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
     * Track a page view.
     *
     * @param overrideUrl - Optional URL to override the default
     */
    async trackPageView(overrideUrl?: string): Promise<void> {
        // Create payload with browser-specific data and optional URL
        const payload = {
            hostname: this.config?.hostName || window.location.hostname,
            language: navigator.language,
            referrer: document.referrer || '',
            screen: `${window.screen.width}x${window.screen.height}`,
            title: document.title,
            url: overrideUrl || window.location.pathname,
            website: this.config?.websiteId,
        };

        // Send the data
        this.sendData({ payload: payload, type: 'event' });
    }

    /**
     * Log a custom event.
     *
     * @param eventName - Name of the event
     * @param eventData - Optional data to attach to the event
     */
    async logEvent(eventName: string, eventData: EventData = {}): Promise<void> {
        if (!this.config || !eventName) return;

        // Create payload with event name and data
        const payload = {
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

        // Send the data
        this.sendData({ payload: payload, type: 'event' });
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
