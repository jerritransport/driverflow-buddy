const ESCREEN_URL = 'https://www.myescreen.com/V3';

/**
 * Opens the eScreen login/results portal in a compact, centered popup
 * window instead of a full new tab.
 *
 * Note: eScreen's login is powered by Microsoft Azure AD B2C, which
 * blocks iframe embedding by design (X-Frame-Options), so a true
 * in-dashboard embed isn't possible. This popup keeps the workflow
 * feeling closer to "inside the app" than a full browser tab does.
 */
export function openEscreenPopup() {
  const width = 480;
  const height = 640;

  // Center the popup relative to the current screen.
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=no',
    'toolbar=no',
    'location=no',
    'menubar=no',
  ].join(',');

  const popup = window.open(ESCREEN_URL, 'escreenPortal', features);

  // Popup blockers can silently return null — fall back to a normal tab
  // so the user isn't left with a dead button.
  if (!popup) {
    window.open(ESCREEN_URL, '_blank', 'noopener,noreferrer');
    return;
  }

  popup.focus();
}
