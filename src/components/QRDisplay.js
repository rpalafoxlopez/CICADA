import QRCode from 'qrcode';

export async function QRDisplay(url, title) {
  const wrapper = document.createElement('div');
  wrapper.className = 'qr-wrapper';

  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, {
    width: 256,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
  });

  const titleEl = document.createElement('p');
  titleEl.className = 'qr-title';
  titleEl.textContent = title || 'Escanea para unirte';

  const urlEl = document.createElement('p');
  urlEl.className = 'qr-url';
  urlEl.textContent = url;

  wrapper.append(canvas, titleEl, urlEl);
  return wrapper;
}
