// Importing axios and UmamiLogger
import axios from 'axios';
import UmamiLogger from './UmamiLogger';

jest.mock('axios');

describe('UmamiLogger', () => {
  let umami: UmamiLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    umami = UmamiLogger.getInstance();
    umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id' });

    // Mocking window and document properties
    Object.defineProperty(window, 'location', { value: { hostname: 'localhost', pathname: '/test' }, writable: true });
    Object.defineProperty(window, 'screen', { value: { width: 1024, height: 768 }, writable: true });
    Object.defineProperty(window, 'navigator', { value: { language: 'en-US' }, writable: true });
    Object.defineProperty(document, 'referrer', { value: '', writable: true });
    Object.defineProperty(document, 'title', { value: 'Test Title', writable: true });
  });

  it('should initialize correctly', () => {
    expect(umami).toBeTruthy();
  });

  it('should send a page view event', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    await umami.trackPageView();

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        hostname: 'localhost',
        url: '/test',
        website: 'test-website-id'
      }),
      type: 'event'
    }));
  });

  it('should send an event with custom data', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    await umami.logEvent('click', { buttonId: 'test-button' });

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        name: 'click',
        data: { buttonId: 'test-button' }
      }),
      type: 'event'
    }));
  });

  it('should include distinct ID in page view payloads', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    umami.setDistinctId('user-123');
    await umami.trackPageView();

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        id: 'user-123',
        website: 'test-website-id'
      }),
      type: 'event'
    }));
  });

  it('should include distinct ID in event payloads', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    umami.setDistinctId('user-456');
    await umami.logEvent('click', { buttonId: 'btn' });

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        id: 'user-456',
        name: 'click'
      }),
      type: 'event'
    }));
  });

  it('should include config tag in page view payloads', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id', tag: 'variant-a' });
    await umami.trackPageView();

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        tag: 'variant-a',
        website: 'test-website-id'
      }),
      type: 'event'
    }));
  });

  it('should include config tag in event payloads', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id', tag: 'variant-b' });
    await umami.logEvent('click', {});

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        tag: 'variant-b',
        name: 'click'
      }),
      type: 'event'
    }));
  });

  it('should allow per-call tag to override config tag', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    umami.initialize({ baseUrl: 'https://umami.is', websiteId: 'test-website-id', tag: 'default-tag' });
    await umami.logEvent('click', {}, 'override-tag');

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        tag: 'override-tag',
        name: 'click'
      }),
      type: 'event'
    }));
  });

  it('should send identify with unique ID only', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    await umami.identify('user-789');

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        id: 'user-789',
        website: 'test-website-id'
      }),
      type: 'identify'
    }));
  });

  it('should send identify with unique ID and session data', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    await umami.identify('user-789', { plan: 'pro', role: 'admin' });

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        id: 'user-789',
        data: { plan: 'pro', role: 'admin' }
      }),
      type: 'identify'
    }));
  });

  it('should send identify with session data only', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    await umami.identify({ theme: 'dark', locale: 'en' });

    expect(mockAxiosPost).toBeCalledWith('https://umami.is/api/send', expect.objectContaining({
      payload: expect.objectContaining({
        data: { theme: 'dark', locale: 'en' }
      }),
      type: 'identify'
    }));
    // Should NOT have an id field
    const calledPayload = mockAxiosPost.mock.calls[0][1].payload;
    expect(calledPayload.id).toBeUndefined();
  });

  it('should not include tag when none is configured', async () => {
    const mockAxiosPost = jest.fn();
    (axios.post as jest.Mocked<any>) = mockAxiosPost;

    await umami.trackPageView();

    const calledPayload = mockAxiosPost.mock.calls[0][1].payload;
    expect(calledPayload.tag).toBeUndefined();
  });
});
