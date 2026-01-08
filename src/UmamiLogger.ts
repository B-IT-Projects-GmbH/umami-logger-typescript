import axios from 'axios';

// Configuration interface for Umami
export interface UmamiConfig {
    baseUrl: string;
    websiteId: string;
    hostName?: string;
    tag?: string;
    doNotTrack?: boolean;
    domains?: string[];
    excludeSearch?: boolean;
    excludeHash?: boolean;
    beforeSend?: (payload: UmamiPayload) => UmamiPayload | null | undefined | false;
}

// Generic interface for event data
export interface EventData {
    [key: string]: any;
}

// Revenue data interface
export interface RevenueData extends EventData {
    revenue: number;
    currency: string;
}

// Payload interface for the API
export interface UmamiPayload {
    hostname: string;
    language: string;
    referrer: string;
    screen: string;
    title: string;
    url: string;
    website: string;
    name?: string;
    data?: EventData;
    tag?: string;
    id?: string;
}

// Identify data interface
export interface IdentifyData {
    [key: string]: any;
}

// Response from Umami API
export interface UmamiResponse {
    cache?: string;
    sessionId?: string;
    visitId?: string;
}

// Type for the payload callback function
export type PayloadCallback = (props: UmamiPayload) => Partial<UmamiPayload>;

class UmamiLogger {
    // Singleton instance
    private static instance: UmamiLogger;

    // Configuration object
    private config?: UmamiConfig;

    // Session ID for identify
    private sessionId?: string;

    // Session data for identify
    private sessionData?: IdentifyData;

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
     * Reset the singleton instance (useful for testing).
     */
    static resetInstance(): void {
        UmamiLogger.instance = new UmamiLogger();
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
     * Get current configuration.
     */
    getConfig(): UmamiConfig | undefined {
        return this.config;
    }

    /**
     * Check if tracking should be blocked.
     * Returns true if tracking should NOT occur.
     */
    private isTrackingBlocked(): boolean {
        if (!this.config) return true;

        // Check Do Not Track browser preference
        if (this.config.doNotTrack && this.isDoNotTrackEnabled()) {
            return true;
        }

        // Check domain restrictions
        if (this.config.domains && this.config.domains.length > 0) {
            const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
            if (!this.config.domains.includes(currentDomain)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if browser's Do Not Track is enabled.
     */
    private isDoNotTrackEnabled(): boolean {
        if (typeof navigator === 'undefined') return false;
        const dnt = (navigator as any).doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
        return dnt === '1' || dnt === 'yes' || dnt === true;
    }

    /**
     * Build the URL based on configuration options.
     */
    private buildUrl(overrideUrl?: string): string {
        if (typeof window === 'undefined') return overrideUrl || '';

        let url = overrideUrl || window.location.pathname;

        // Add search params unless excluded
        if (!this.config?.excludeSearch && window.location.search) {
            url += window.location.search;
        }

        // Add hash unless excluded
        if (!this.config?.excludeHash && window.location.hash) {
            url += window.location.hash;
        }

        return url;
    }

    /**
     * Build base payload with common properties.
     */
    private buildBasePayload(overrideUrl?: string): UmamiPayload {
        const payload: UmamiPayload = {
            hostname: this.config?.hostName || (typeof window !== 'undefined' ? window.location.hostname : ''),
            language: typeof navigator !== 'undefined' ? navigator.language : '',
            referrer: typeof document !== 'undefined' ? (document.referrer || '') : '',
            screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
            title: typeof document !== 'undefined' ? document.title : '',
            url: this.buildUrl(overrideUrl),
            website: this.config?.websiteId || '',
        };

        // Add tag if configured
        if (this.config?.tag) {
            payload.tag = this.config.tag;
        }

        // Add session ID if set via identify
        if (this.sessionId) {
            payload.id = this.sessionId;
        }

        return payload;
    }

    /**
     * Track a page view.
     *
     * @param overrideUrl - Optional URL to override the default
     */
    async trackPageView(overrideUrl?: string): Promise<UmamiResponse | void> {
        if (this.isTrackingBlocked()) return;

        const payload = this.buildBasePayload(overrideUrl);

        // Include session data if set
        if (this.sessionData) {
            payload.data = this.sessionData;
        }

        return this.sendData({ payload, type: 'event' });
    }

    /**
     * Generic track function with multiple overloads.
     * Mimics umami.track() behavior.
     *
     * @overload track() - Track current page view
     * @overload track(eventName: string) - Track named event
     * @overload track(eventName: string, data: EventData) - Track named event with data
     * @overload track(payload: Partial<UmamiPayload>) - Track with custom payload
     * @overload track(callback: PayloadCallback) - Track with callback to modify payload
     */
    async track(
        eventNameOrPayloadOrCallback?: string | Partial<UmamiPayload> | PayloadCallback,
        eventData?: EventData
    ): Promise<UmamiResponse | void> {
        if (this.isTrackingBlocked()) return;

        let payload: UmamiPayload;

        // No arguments - track page view
        if (eventNameOrPayloadOrCallback === undefined) {
            return this.trackPageView();
        }

        // String argument - event name
        if (typeof eventNameOrPayloadOrCallback === 'string') {
            payload = this.buildBasePayload();
            payload.name = eventNameOrPayloadOrCallback;
            if (eventData) {
                payload.data = eventData;
            }
        }
        // Function argument - callback
        else if (typeof eventNameOrPayloadOrCallback === 'function') {
            const basePayload = this.buildBasePayload();
            const modifications = eventNameOrPayloadOrCallback(basePayload);
            payload = { ...basePayload, ...modifications };
        }
        // Object argument - custom payload
        else {
            const basePayload = this.buildBasePayload();
            payload = { ...basePayload, ...eventNameOrPayloadOrCallback };
        }

        return this.sendData({ payload, type: 'event' });
    }

    /**
     * Log a custom event.
     *
     * @param eventName - Name of the event
     * @param eventData - Optional data to attach to the event
     */
    async logEvent(eventName: string, eventData: EventData = {}): Promise<UmamiResponse | void> {
        if (!this.config || !eventName) return;
        if (this.isTrackingBlocked()) return;

        const payload = this.buildBasePayload();
        payload.name = eventName;
        payload.data = eventData;

        return this.sendData({ payload, type: 'event' });
    }

    /**
     * Track a revenue event.
     *
     * @param eventName - Name of the event (e.g., 'checkout-cart', 'purchase')
     * @param revenue - The revenue amount
     * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
     * @param additionalData - Optional additional event data
     */
    async trackRevenue(
        eventName: string,
        revenue: number,
        currency: string,
        additionalData?: EventData
    ): Promise<UmamiResponse | void> {
        if (!this.config || !eventName) return;
        if (this.isTrackingBlocked()) return;

        const payload = this.buildBasePayload();
        payload.name = eventName;
        payload.data = {
            revenue,
            currency,
            ...additionalData,
        };

        return this.sendData({ payload, type: 'event' });
    }

    /**
     * Identify the current session with a unique ID and optional data.
     * This links all subsequent events to this identity.
     *
     * @overload identify(uniqueId: string) - Identify with just an ID
     * @overload identify(uniqueId: string, data: IdentifyData) - Identify with ID and data
     * @overload identify(data: IdentifyData) - Identify with just data (session data)
     *
     * @param uniqueIdOrData - Unique identifier string or data object
     * @param data - Optional data to attach to the session
     */
    async identify(
        uniqueIdOrData?: string | IdentifyData,
        data?: IdentifyData
    ): Promise<UmamiResponse | void> {
        if (!this.config) return;
        if (this.isTrackingBlocked()) return;

        // Handle different argument patterns
        if (typeof uniqueIdOrData === 'string') {
            this.sessionId = uniqueIdOrData;
            if (data) {
                this.sessionData = data;
            }
        } else if (typeof uniqueIdOrData === 'object') {
            this.sessionData = uniqueIdOrData;
        }

        // Build and send identify payload
        const payload = this.buildBasePayload();

        // Add session data to the payload
        if (this.sessionData) {
            payload.data = this.sessionData;
        }

        return this.sendData({ payload, type: 'event' });
    }

    /**
     * Get the current session ID.
     */
    getSessionId(): string | undefined {
        return this.sessionId;
    }

    /**
     * Get the current session data.
     */
    getSessionData(): IdentifyData | undefined {
        return this.sessionData;
    }

    /**
     * Clear session identity.
     */
    clearIdentity(): void {
        this.sessionId = undefined;
        this.sessionData = undefined;
    }

    /**
     * Set a tag for all subsequent events.
     *
     * @param tag - Tag to assign to events
     */
    setTag(tag: string): void {
        if (this.config) {
            this.config.tag = tag;
        }
    }

    /**
     * Clear the current tag.
     */
    clearTag(): void {
        if (this.config) {
            this.config.tag = undefined;
        }
    }

    /**
     * Send data to Umami.
     *
     * @param data - Data to send (payload and type)
     */
    private async sendData(data: { payload: UmamiPayload; type: string }): Promise<UmamiResponse | void> {
        if (!this.config?.baseUrl) return;

        let payload = data.payload;

        // Apply beforeSend callback if configured
        if (this.config.beforeSend) {
            const result = this.config.beforeSend(payload);
            // If callback returns falsy value, cancel the request
            if (!result) {
                return;
            }
            payload = result;
        }

        const apiUrl = `${this.config.baseUrl}/api/send`;

        try {
            const response = await axios.post<UmamiResponse>(apiUrl, {
                payload,
                type: data.type,
            });
            return response.data;
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }
}

export default UmamiLogger;
