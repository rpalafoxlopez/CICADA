import { supabase } from '../supabase.js';
import { navigate } from '../main.js';
import { EventService } from '../services/EventService.js';
import { PhotoService } from '../services/PhotoService.js';
import { QRDisplay } from '../components/QRDisplay.js';

export default async function CreateEvent(params) {
  const container = document.createElement('div');
  container.className = 'page-container';

  const showQrFor = params.get('showQr');
  if (showQrFor) {
    try {
      const event = await EventService.getEventById(showQrFor);
      const eventUrl = `${window.location.origin}/camera?event=${event.id}`;

      container.innerHTML = `
        <div class="page-header">
          <div class="landing-badge" style="margin-bottom: 1rem;">✦ LUMIO</div>
          <h1>QR del Evento</h1>
          <p>${event.title}</p>
        </div>
        <div id="qr-container"></div>
        <div style="margin-top: 1.5rem; text-align: center;">
          <a href="/dashboard" class="text-link">← Volver al dashboard</a>
        </div>
      `;

      const qrEl = await QRDisplay(eventUrl, event.title);
      container.querySelector('#qr-container').appendChild(qrEl);
      return container;
    } catch (err) {
      container.innerHTML = `<div class="error">Error: ${err.message}</div>`;
      return container;
    }
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="landing-badge" style="margin-bottom: 1rem;">✦ LUMIO</div>
      <h1>Nuevo Evento</h1>
      <p>Configura tu photo booth</p>
    </div>

    <div class="card">
      <div class="form-group">
        <label for="title">Nombre del evento</label>
        <input type="text" id="title" placeholder="Ej: Boda Ana & Luis" maxlength="100" />
      </div>

      <div class="form-group">
        <label for="music">Música de fondo (MP3, opcional)</label>
        <input type="file" id="music" accept="audio/mpeg,audio/mp3" />
      </div>

      <button id="create-btn" class="btn">Crear Evento 🎉</button>
    </div>

    <div id="qr-section" style="display: none;"></div>

    <div style="margin-top: 1.5rem; text-align: center;">
      <a href="/dashboard" class="text-link">← Cancelar</a>
    </div>
  `;

  const titleInput = container.querySelector('#title');
  const musicInput = container.querySelector('#music');
  const createBtn = container.querySelector('#create-btn');
  const qrSection = container.querySelector('#qr-section');

  createBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) {
      showToast('Introduce un nombre para el evento', 'error');
      return;
    }

    createBtn.disabled = true;
    createBtn.textContent = 'Creando...';

    try {
      let musicPath = null;
      const musicFile = musicInput.files[0];
      if (musicFile) {
        musicPath = await PhotoService.uploadMusic(musicFile);
      }

      const event = await EventService.createEvent({
        title,
        musicPath,
      });

      const eventUrl = `${window.location.origin}/camera?event=${event.id}`;
      const qrEl = await QRDisplay(eventUrl, event.title);

      qrSection.innerHTML = `
        <div class="page-header" style="margin-top: 2rem;">
          <h2>¡Evento creado! 🎊</h2>
          <p>Escanea el QR para unirte</p>
        </div>
      `;
      qrSection.appendChild(qrEl);
      qrSection.style.display = 'block';

      container.querySelector('.card').style.display = 'none';

      showToast('Evento creado correctamente', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
      createBtn.disabled = false;
      createBtn.textContent = 'Crear Evento 🎉';
    }
  });

  return container;
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
  }, 4000);
}
