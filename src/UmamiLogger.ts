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
            data: eventData
        };

        const apiUrl = `${this.config.baseUrl}/api/send`;

        try {
            await axios.post(apiUrl, {
                payload,
                type: 'event',
            });
        } catch (error) {
            console.error('Error logging event:', error);
        }
    }
}

export default UmamiLogger;
