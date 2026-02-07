import UmamiLogger from './UmamiLogger';

const Umami = {
    initialize(config: any): void {
        UmamiLogger.getInstance().initialize(config);
    },
    trackEvent(eventName: string, eventData?: any, tag?: string): void {
        UmamiLogger.getInstance().logEvent(eventName, eventData, tag);
    },
    trackPageView(overrideUrl?: string, tag?: string): void {
        UmamiLogger.getInstance().trackPageView(overrideUrl, tag);
    },
    identify(uniqueIdOrData: string | { [key: string]: any }, data?: { [key: string]: any }): void {
        UmamiLogger.getInstance().identify(uniqueIdOrData, data);
    },
    setDistinctId(id: string): void {
        UmamiLogger.getInstance().setDistinctId(id);
    }
};

export default Umami;
