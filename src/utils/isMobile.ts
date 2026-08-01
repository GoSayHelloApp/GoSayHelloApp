// True on phones/tablets. Used so "save/download" downloads in-browser on desktop but
// prompts to open the native app on mobile (where the browser can't save into the gallery).
export const isMobileDevice = (): boolean =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
