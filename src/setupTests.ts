// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { setupIonicReact } from '@ionic/react';

// jsdom has no Web Animations API, so Ionic falls back to timers and overlays
// finish dismissing during the next test. Without animations they close at once.
setupIonicReact({ animated: false });

// Ionic moves presented overlays to <body>, outside the container Testing Library
// cleans up, and a dismiss still in flight puts the element back there later. Let
// in-flight dismissals finish, then unmount and drop whatever overlays are left.
afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  cleanup();
  document.querySelectorAll('ion-popover, ion-modal, ion-alert, ion-toast').forEach((el) => el.remove());
});

// Mock matchmedia
window.matchMedia = window.matchMedia || function() {
  return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
  };
};
