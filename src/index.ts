import UmamiLogger, {
    UmamiConfig,
    UmamiPayload,
    UmamiResponse,
    EventData,
    IdentifyData,
    RevenueData,
    PayloadCallback,
} from './UmamiLogger';

const Umami = {
    /**
     * Initialize the Umami logger with configuration.
     *
     * @param config - Configuration options
     */
    initialize(config: UmamiConfig): void {
        UmamiLogger.getInstance().initialize(config);
    },

    /**
     * Track a custom event.
     *
     * @param eventName - Name of the event
     * @param eventData - Optional data to attach to the event
     */
    trackEvent(eventName: string, eventData?: EventData): Promise<UmamiResponse | void> {
        return UmamiLogger.getInstance().logEvent(eventName, eventData);
    },

    /**
     * Track a page view.
     *
     * @param overrideUrl - Optional URL to override the default
     */
    trackPageView(overrideUrl?: string): Promise<UmamiResponse | void> {
        return UmamiLogger.getInstance().trackPageView(overrideUrl);
    },

    /**
     * Generic track function with multiple overloads.
     * Mimics umami.track() behavior from the official tracker.
     *
     * @overload track() - Track current page view
     * @overload track(eventName: string) - Track named event
     * @overload track(eventName: string, data: EventData) - Track named event with data
     * @overload track(payload: Partial<UmamiPayload>) - Track with custom payload
     * @overload track(callback: PayloadCallback) - Track with callback to modify payload
     */
    track(
        eventNameOrPayloadOrCallback?: string | Partial<UmamiPayload> | PayloadCallback,
        eventData?: EventData
    ): Promise<UmamiResponse | void> {
        return UmamiLogger.getInstance().track(eventNameOrPayloadOrCallback, eventData);
    },

    /**
     * Track a revenue event.
     *
     * @param eventName - Name of the event (e.g., 'checkout-cart', 'purchase')
     * @param revenue - The revenue amount
     * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
     * @param additionalData - Optional additional event data
     */
    trackRevenue(
        eventName: string,
        revenue: number,
        currency: string,
        additionalData?: EventData
    ): Promise<UmamiResponse | void> {
        return UmamiLogger.getInstance().trackRevenue(eventName, revenue, currency, additionalData);
    },

    /**
     * Identify the current session with a unique ID and optional data.
     * This links all subsequent events to this identity.
     *
     * @overload identify(uniqueId: string) - Identify with just an ID
     * @overload identify(uniqueId: string, data: IdentifyData) - Identify with ID and data
     * @overload identify(data: IdentifyData) - Identify with just data (session data)
     */
    identify(
        uniqueIdOrData?: string | IdentifyData,
        data?: IdentifyData
    ): Promise<UmamiResponse | void> {
        return UmamiLogger.getInstance().identify(uniqueIdOrData, data);
    },

    /**
     * Get the current session ID.
     */
    getSessionId(): string | undefined {
        return UmamiLogger.getInstance().getSessionId();
    },

    /**
     * Get the current session data.
     */
    getSessionData(): IdentifyData | undefined {
        return UmamiLogger.getInstance().getSessionData();
    },

    /**
     * Clear the current session identity.
     */
    clearIdentity(): void {
        UmamiLogger.getInstance().clearIdentity();
    },

    /**
     * Set a tag for all subsequent events.
     *
     * @param tag - Tag to assign to events
     */
    setTag(tag: string): void {
        UmamiLogger.getInstance().setTag(tag);
    },

    /**
     * Clear the current tag.
     */
    clearTag(): void {
        UmamiLogger.getInstance().clearTag();
    },

    /**
     * Get the current configuration.
     */
    getConfig(): UmamiConfig | undefined {
        return UmamiLogger.getInstance().getConfig();
    },

    /**
     * Reset the logger instance (useful for testing).
     */
    reset(): void {
        UmamiLogger.resetInstance();
    },
};

export default Umami;

// Export types for consumers
export type {
    UmamiConfig,
    UmamiPayload,
    UmamiResponse,
    EventData,
    IdentifyData,
    RevenueData,
    PayloadCallback,
};
