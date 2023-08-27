import UmamiLogger from './UmamiLogger';

const Umami = {
    initialize(config: any): void {
        UmamiLogger.getInstance().initialize(config);
    },
    trackEvent(eventName: string, eventData: any): void {
        UmamiLogger.getInstance().logEvent(eventName, eventData);
    },
    trackPageView(overrideUrl?: string): void {
        UmamiLogger.getInstance().trackPageView(overrideUrl);
    }
};

export default Umami;
