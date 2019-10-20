import { html, fixture, expect } from '@open-wc/testing';
import sinon from 'sinon';

import '../pwa-update-available.js';

describe('PwaUpdateAvailable', () => {
  it('is hidden by default', async () => {
    const el = await fixture(html`
      <pwa-update-available></pwa-update-available>
    `);

    expect(el.hidden).to.equal(true);
  });

  it('posts a message', async () => {
    const el = await fixture(html`
      <pwa-update-available></pwa-update-available>
    `);
    el.hidden = false;
    el._newWorker = {
      postMessage: sinon.spy(),
    };
    el.click();
    expect(el._newWorker.postMessage).calledOnceWith({ type: 'SKIP_WAITING' });
  });

  it('is visible when updatefound and statechange has been fired', async () => {
    const addEventListener = (_, cb) => cb();

    Object.defineProperty(window.navigator, 'serviceWorker', {
      writable: true,
      value: {
        controller: true,
        getRegistration: async () => ({
          installing: {
            state: 'installed',
            addEventListener,
          },
          addEventListener,
        }),
        addEventListener: () => {},
      },
    });

    const el = await fixture(html`
      <pwa-update-available></pwa-update-available>
    `);

    expect(el.hidden).to.equal(false);
  });

  it('is visible when there already is a waiting service worker', async () => {
    const addEventListener = (_, cb) => cb();

    Object.defineProperty(window.navigator, 'serviceWorker', {
      writable: true,
      value: {
        controller: true,
        getRegistration: async () => ({
          installing: {
            state: 'not installed',
            addEventListener,
          },
          waiting: true,
          addEventListener,
        }),
        addEventListener: () => {},
      },
    });

    const el = await fixture(html`
      <pwa-update-available></pwa-update-available>
    `);

    expect(el.hidden).to.equal(false);
  });
});
