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
});
