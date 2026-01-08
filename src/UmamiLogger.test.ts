import axios from 'axios';
import UmamiLogger, { UmamiPayload, UmamiConfig } from './UmamiLogger';

jest.mock('axios');

const mockAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;

describe('UmamiLogger', () => {
  let umami: UmamiLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    UmamiLogger.resetInstance();
    umami = UmamiLogger.getInstance();

    // Mock browser globals
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        pathname: '/test',
        search: '?utm_source=google',
        hash: '#section1',
      },
      writable: true,
    });
    Object.defineProperty(window, 'screen', {
      value: { width: 1024, height: 768 },
      writable: true,
    });
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, 'doNotTrack', {
      value: null,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, 'title', {
      value: 'Test Title',
      writable: true,
      configurable: true,
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = UmamiLogger.getInstance();
      const instance2 = UmamiLogger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance correctly', () => {
      const instance1 = UmamiLogger.getInstance();
      instance1.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-id' });
      UmamiLogger.resetInstance();
      const instance2 = UmamiLogger.getInstance();
      expect(instance2.getConfig()).toBeUndefined();
    });
  });

  describe('Initialize', () => {
    it('should initialize correctly', () => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });
      expect(umami.getConfig()).toEqual({
        baseUrl: 'https://umami.is',
        websiteId: 'test-website-id',
      });
    });

    it('should accept all configuration options', () => {
      const config: UmamiConfig = {
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        hostName: 'custom-host',
        tag: 'marketing',
        doNotTrack: true,
        domains: ['example.com', 'www.example.com'],
        excludeSearch: true,
        excludeHash: true,
        beforeSend: (payload) => payload,
      };
      umami.initialize(config);
      expect(umami.getConfig()).toMatchObject({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        hostName: 'custom-host',
        tag: 'marketing',
        doNotTrack: true,
        domains: ['example.com', 'www.example.com'],
        excludeSearch: true,
        excludeHash: true,
      });
    });
  });

  describe('Track Page View', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });
    });

    it('should send a page view event', async () => {
      mockAxiosPost.mockResolvedValue({ data: { sessionId: 'abc123' } });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            hostname: 'localhost',
            url: '/test?utm_source=google#section1',
            website: 'test-website-id',
          }),
          type: 'event',
        })
      );
    });

    it('should allow URL override', async () => {
      mockAxiosPost.mockResolvedValue({ data: {} });

      await umami.trackPageView('/custom-page');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/custom-page?utm_source=google#section1',
          }),
        })
      );
    });

    it('should use custom hostname if configured', async () => {
      UmamiLogger.resetInstance();
      umami = UmamiLogger.getInstance();
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        hostName: 'custom-host.com',
      });
      mockAxiosPost.mockResolvedValue({ data: {} });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            hostname: 'custom-host.com',
          }),
        })
      );
    });
  });

  describe('Track Custom Events', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });
    });

    it('should send an event with custom data', async () => {
      mockAxiosPost.mockResolvedValue({ data: {} });

      await umami.logEvent('click', { buttonId: 'test-button' });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'click',
            data: { buttonId: 'test-button' },
          }),
          type: 'event',
        })
      );
    });

    it('should not send event without name', async () => {
      await umami.logEvent('', { data: 'test' });
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should not send event without config', async () => {
      UmamiLogger.resetInstance();
      const newUmami = UmamiLogger.getInstance();
      await newUmami.logEvent('test', { data: 'test' });
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });
  });

  describe('Generic Track Function', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should track page view when called without arguments', async () => {
      await umami.track();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/test?utm_source=google#section1',
            website: 'test-website-id',
          }),
          type: 'event',
        })
      );
    });

    it('should track named event when called with string', async () => {
      await umami.track('signup-button');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'signup-button',
          }),
        })
      );
    });

    it('should track named event with data', async () => {
      await umami.track('signup-button', { plan: 'premium' });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'signup-button',
            data: { plan: 'premium' },
          }),
        })
      );
    });

    it('should track with custom payload object', async () => {
      await umami.track({ url: '/custom-page', title: 'Custom Title' });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/custom-page',
            title: 'Custom Title',
          }),
        })
      );
    });

    it('should track with callback function', async () => {
      await umami.track((props) => ({
        ...props,
        url: '/modified-url',
        name: 'custom-event',
      }));

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/modified-url',
            name: 'custom-event',
          }),
        })
      );
    });
  });

  describe('Revenue Tracking', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should track revenue event with basic data', async () => {
      await umami.trackRevenue('checkout-cart', 19.99, 'USD');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'checkout-cart',
            data: {
              revenue: 19.99,
              currency: 'USD',
            },
          }),
        })
      );
    });

    it('should track revenue with additional data', async () => {
      await umami.trackRevenue('purchase', 99.99, 'EUR', {
        productId: 'prod-123',
        quantity: 2,
      });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'purchase',
            data: {
              revenue: 99.99,
              currency: 'EUR',
              productId: 'prod-123',
              quantity: 2,
            },
          }),
        })
      );
    });

    it('should not track revenue without event name', async () => {
      await umami.trackRevenue('', 10, 'USD');
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });
  });

  describe('Session Identification', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should identify with just a unique ID', async () => {
      await umami.identify('user-12345');

      expect(umami.getSessionId()).toBe('user-12345');
      expect(mockAxiosPost).toHaveBeenCalled();
    });

    it('should identify with ID and data', async () => {
      await umami.identify('user-12345', { name: 'John', email: 'john@example.com' });

      expect(umami.getSessionId()).toBe('user-12345');
      expect(umami.getSessionData()).toEqual({ name: 'John', email: 'john@example.com' });
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            id: 'user-12345',
            data: { name: 'John', email: 'john@example.com' },
          }),
        })
      );
    });

    it('should identify with just data object', async () => {
      await umami.identify({ name: 'John', plan: 'premium' });

      expect(umami.getSessionData()).toEqual({ name: 'John', plan: 'premium' });
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            data: { name: 'John', plan: 'premium' },
          }),
        })
      );
    });

    it('should include session ID in subsequent events', async () => {
      await umami.identify('user-12345');
      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenLastCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            id: 'user-12345',
          }),
        })
      );
    });

    it('should clear identity correctly', () => {
      umami.identify('user-12345', { name: 'John' });
      umami.clearIdentity();

      expect(umami.getSessionId()).toBeUndefined();
      expect(umami.getSessionData()).toBeUndefined();
    });
  });

  describe('Tag Support', () => {
    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should include tag from config in events', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        tag: 'marketing-campaign',
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            tag: 'marketing-campaign',
          }),
        })
      );
    });

    it('should allow setting tag dynamically', async () => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-id' });
      umami.setTag('new-tag');

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            tag: 'new-tag',
          }),
        })
      );
    });

    it('should clear tag correctly', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        tag: 'initial-tag',
      });
      umami.clearTag();

      await umami.trackPageView();

      const callArg = mockAxiosPost.mock.calls[0][1] as { payload: UmamiPayload };
      expect(callArg.payload.tag).toBeUndefined();
    });
  });

  describe('Do Not Track', () => {
    it('should respect Do Not Track when enabled in config', async () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: true,
        configurable: true,
      });

      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        doNotTrack: true,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should track when DNT enabled but config option is false', async () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: true,
        configurable: true,
      });
      mockAxiosPost.mockResolvedValue({ data: {} });

      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        doNotTrack: false,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalled();
    });

    it('should track when DNT is disabled', async () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        value: null,
        writable: true,
        configurable: true,
      });
      mockAxiosPost.mockResolvedValue({ data: {} });

      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        doNotTrack: true,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalled();
    });
  });

  describe('Domain Restrictions', () => {
    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should track when current domain is in allowed list', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        domains: ['localhost', 'example.com'],
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalled();
    });

    it('should block tracking when domain is not in allowed list', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        domains: ['example.com', 'other.com'],
      });

      await umami.trackPageView();

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should track when domains list is empty', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        domains: [],
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalled();
    });
  });

  describe('URL Options', () => {
    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should include search params by default', async () => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-id' });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/test?utm_source=google#section1',
          }),
        })
      );
    });

    it('should exclude search params when configured', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        excludeSearch: true,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/test#section1',
          }),
        })
      );
    });

    it('should exclude hash when configured', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        excludeHash: true,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/test?utm_source=google',
          }),
        })
      );
    });

    it('should exclude both search and hash when configured', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        excludeSearch: true,
        excludeHash: true,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/test',
          }),
        })
      );
    });
  });

  describe('BeforeSend Callback', () => {
    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: {} });
    });

    it('should modify payload through beforeSend callback', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        beforeSend: (payload) => ({
          ...payload,
          url: '/modified-url',
        }),
      });

      await umami.trackPageView();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://umami.is/api/send',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: '/modified-url',
          }),
        })
      );
    });

    it('should cancel request when beforeSend returns null', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        beforeSend: () => null,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should cancel request when beforeSend returns false', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        beforeSend: () => false,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should cancel request when beforeSend returns undefined', async () => {
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        beforeSend: () => undefined,
      });

      await umami.trackPageView();

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should allow filtering events in beforeSend', async () => {
      let callCount = 0;
      umami.initialize({
        baseUrl: 'https://umami.is',
        websiteId: 'test-id',
        beforeSend: (payload) => {
          callCount++;
          // Only allow specific event
          if (payload.name === 'allowed-event') {
            return payload;
          }
          return null;
        },
      });

      await umami.logEvent('blocked-event', {});
      await umami.logEvent('allowed-event', {});

      expect(callCount).toBe(2);
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-id' });
    });

    it('should handle API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAxiosPost.mockRejectedValue(new Error('Network error'));

      await expect(umami.trackPageView()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error sending data:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should not throw when config is not initialized', async () => {
      UmamiLogger.resetInstance();
      const newUmami = UmamiLogger.getInstance();

      await expect(newUmami.trackPageView()).resolves.not.toThrow();
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });
  });

  describe('API Response', () => {
    beforeEach(() => {
      umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-id' });
    });

    it('should return response data from trackPageView', async () => {
      mockAxiosPost.mockResolvedValue({
        data: { sessionId: 'session-123', visitId: 'visit-456' },
      });

      const result = await umami.trackPageView();

      expect(result).toEqual({
        sessionId: 'session-123',
        visitId: 'visit-456',
      });
    });

    it('should return response data from logEvent', async () => {
      mockAxiosPost.mockResolvedValue({
        data: { sessionId: 'session-123' },
      });

      const result = await umami.logEvent('test-event', {});

      expect(result).toEqual({ sessionId: 'session-123' });
    });
  });
});
