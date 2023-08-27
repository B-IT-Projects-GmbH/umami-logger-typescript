import axios from 'axios';

interface UmamiConfig {
    baseUrl: string;
    websiteId: string;
}

interface EventData {
    [key: string]: any;
}

class UmamiLogger {
    private static instance: UmamiLogger;
    private config?: UmamiConfig;

    private constructor() {}

    static getInstance(): UmamiLogger {
        if (!UmamiLogger.instance) {
            UmamiLogger.instance = new UmamiLogger();
        }
        return UmamiLogger.instance;
    }

    initialize(config: UmamiConfig): void {
        this.config = config;
    }

    async trackPageView(overrideUrl?: string) {
        const payload = {
            hostname: window.location.hostname,
            language: navigator.language,
            referrer: document.referrer,
            screen: `${window.screen.width}x${window.screen.height}`,
            title: document.title,
            url: overrideUrl || window.location.pathname,  // Use overrideUrl if provided
            website: this.config?.websiteId,
            type: 'pageview'
        };
        this.sendData(payload);
    }

    async logEvent(eventName: string, eventData: EventData = {}) {
        if (!this.config || !eventName) return;

        const payload = {
            hostname: window.location.hostname,
            language: navigator.language,
            referrer: document.referrer,
            screen: `${window.screen.width}x${window.screen.height}`,
            title: document.title,
            url: window.location.pathname,
            website: this.config.websiteId,
            name: eventName,
            data: eventData,
            type: 'event'
        };
        this.sendData(payload);
    }

    private async sendData(payload: any) {
        const apiUrl = `${this.config?.baseUrl}/api/send`;
        try {
            await axios.post(apiUrl, payload);
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }
}

export default UmamiLogger;
