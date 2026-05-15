import { supabase } from '../supabase.js';
import { EventService } from '../services/EventService.js';
import { PhotoService } from '../services/PhotoService.js';
import { subscribeToPhotos } from '../services/RealtimeService.js';
import { renderPolaroid } from '../components/PolaroidFrame.js';
import { createAudioPlayer } from '../components/AudioPlayer.js';

export default async function Slideshow(params) {
  const eventId = params.get('event');

  const container = document.createElement('div');
  container.className = 'slideshow';

  if (!eventId) {
    container.innerHTML = `
      <div class="error" style="position: relative; z-index: 101;">
        <div class="landing-badge" style="margin-bottom: 1rem;">✦ LUMIO</div>
        <h1>Evento no encontrado</h1>
        <a href="/" class="text-link">Volver al inicio</a>
      </div>
    `;
    return container;
  }

  try {
    const [event, photos] = await Promise.all([
      EventService.getEventById(eventId),
      PhotoService.getPhotosByEvent(eventId),
    ]);

    const infoEl = document.createElement('div');
    infoEl.className = 'slideshow-info';
    infoEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
        <span style="font-size: 0.75rem;">✦</span>
        <h3 style="font-size: 1rem;">${escapeHtml(event.title)}</h3>
      </div>
      <p style="font-size: 0.75rem; color: #aaa;" id="photo-count">${photos.length} fotos</p>
    `;
    container.appendChild(infoEl);

    const polaroidsContainer = document.createElement('div');
    polaroidsContainer.id = 'polaroids-container';
    polaroidsContainer.style.cssText = 'position: relative; width: 100%; height: 100%;';
    container.appendChild(polaroidsContainer);

    const allPhotos = [...photos];
    renderPolaroids(allPhotos, event.title, polaroidsContainer);

    let audioPlayer = null;
    if (event.music_path) {
      const musicUrl = PhotoService.getMusicUrl(event.music_path);
      audioPlayer = createAudioPlayer(musicUrl, { loop: true, volume: 0.5 });

      const musicBtn = document.createElement('button');
      musicBtn.className = 'btn btn-small btn-secondary';
      musicBtn.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 101; width: auto;';
      musicBtn.textContent = '🔇 Música';
      musicBtn.addEventListener('click', () => {
        audioPlayer.toggle();
        musicBtn.textContent = audioPlayer.isPlaying ? '🔊 Música' : '🔇 Música';
      });
      container.appendChild(musicBtn);

      const startAudio = () => {
        audioPlayer.play();
        musicBtn.textContent = '🔊 Música';
        document.removeEventListener('click', startAudio);
      };
      document.addEventListener('click', startAudio, { once: true });
    }

    const controls = document.createElement('div');
    controls.className = 'slideshow-controls';
    controls.innerHTML = `
      <button id="btn-download" class="btn btn-small btn-secondary">⬇️ ZIP</button>
      <button id="btn-refresh" class="btn btn-small btn-secondary">🔄</button>
      <a href="/camera?event=${eventId}" class="btn btn-small">📸 Cámara</a>
    `;
    container.appendChild(controls);

    controls.querySelector('#btn-download').addEventListener('click', async () => {
      try {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        const folder = zip.folder(event.title.replace(/[^a-z0-9]/gi, '_'));

        showToast('Preparando descarga...', 'info');

        for (let i = 0; i < allPhotos.length; i++) {
          const photo = allPhotos[i];
          const url = PhotoService.getPhotoUrl(photo.storage_path);
          const response = await fetch(url);
          const blob = await response.blob();
          folder.file(`foto_${String(i + 1).padStart(3, '0')}.jpg`, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.zip`;
        a.click();
        URL.revokeObjectURL(downloadUrl);

        showToast('✅ ZIP descargado', 'success');
      } catch (err) {
        showToast('Error descargando: ' + err.message, 'error');
      }
    });

    controls.querySelector('#btn-refresh').addEventListener('click', async () => {
      const fresh = await PhotoService.getPhotosByEvent(eventId);
      allPhotos.length = 0;
      allPhotos.push(...fresh);
      renderPolaroids(allPhotos, event.title, polaroidsContainer);
      updateCount(allPhotos.length);
      showToast('Galería actualizada', 'success');
    });

    const unsubscribe = subscribeToPhotos(eventId, (newPhoto) => {
      allPhotos.push(newPhoto);
      renderPolaroids(allPhotos, event.title, polaroidsContainer);
      updateCount(allPhotos.length);
      showToast('📸 Nueva foto recibida', 'success');
    });

    container.addEventListener('remove', () => {
      unsubscribe();
      if (audioPlayer) audioPlayer.pause();
    });

  } catch (err) {
    container.innerHTML = `
      <div class="error" style="position: relative; z-index: 101;">
        <div class="landing-badge" style="margin-bottom: 1rem;">✦ LUMIO</div>
        <h1>Error</h1>
        <p>${err.message}</p>
        <a href="/" class="text-link">Volver al inicio</a>
      </div>
    `;
  }

  return container;
}

function renderPolaroids(photos, caption, container) {
  container.innerHTML = '';

  if (photos.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #888; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">Sin fotos aún...</p>
        <p style="font-size: 0.875rem;">Las fotos aparecerán cuando empiecen a capturar</p>
      </div>
    `;
    return;
  }

  const duration = Math.max(photos.length * 4, 12);

  photos.forEach((photo, index) => {
    const url = PhotoService.getPhotoUrl(photo.storage_path);
    const wrapper = document.createElement('div');
    wrapper.className = 'polaroid-wrapper';
    wrapper.style.setProperty('--duration', `${duration}s`);
    wrapper.style.setProperty('--delay', `${(index / photos.length) * duration}s`);
    wrapper.style.setProperty('--rotation', `${(Math.random() - 0.5) * 6}deg`);

    renderPolaroid(url, caption).then(polaroid => {
      wrapper.appendChild(polaroid);
    });

    container.appendChild(wrapper);
  });
}

function updateCount(count) {
  const el = document.getElementById('photo-count');
  if (el) el.textContent = `${count} foto${count !== 1 ? 's' : ''}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
