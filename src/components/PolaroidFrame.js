export async function renderPolaroid(imageUrl, caption) {
  const wrapper = document.createElement('div');
  wrapper.className = 'polaroid';

  // Rotación aleatoria sutil para efecto natural
  const rotation = (Math.random() - 0.5) * 6; // -3deg a +3deg
  wrapper.style.setProperty('--rotation', `${rotation}deg`);

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = caption || 'Foto';
  img.loading = 'lazy';

  // Manejar error de carga
  img.onerror = () => {
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f0f0f0" width="400" height="300"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" font-family="sans-serif">Error cargando imagen</text></svg>';
  };

  const captionEl = document.createElement('div');
  captionEl.className = 'caption';
  captionEl.textContent = caption || '';

  wrapper.appendChild(img);
  wrapper.appendChild(captionEl);

  return wrapper;
}

// Versión canvas para exportar Polaroid como imagen
export async function renderPolaroidCanvas(imageUrl, caption, width = 800) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const padding = width * 0.05;
      const photoWidth = width - (padding * 2);
      const photoHeight = (img.height / img.width) * photoWidth;
      const captionHeight = width * 0.18;
      const totalHeight = photoHeight + captionHeight + (padding * 2);

      canvas.width = width;
      canvas.height = totalHeight;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, totalHeight);

      // Sombra
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 10;

      // Dibujar foto
      ctx.drawImage(img, padding, padding, photoWidth, photoHeight);

      // Reset shadow
      ctx.shadowColor = 'transparent';

      // Caption
      ctx.font = `${width * 0.06}px Caveat, cursive`;
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText(caption || '', width / 2, photoHeight + padding + (captionHeight * 0.5));

      resolve(canvas);
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}
