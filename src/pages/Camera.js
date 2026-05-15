import { supabase } from '../supabase.js';
import { PhotoService } from '../services/PhotoService.js';
import { navigate } from '../main.js';

export default async function Camera(params) {
  const eventId = params.get('event');
  if (!eventId) {
    const container = document.createElement('div');
    container.className = 'page-container';
    container.innerHTML = `
      <div class="error">
        <div class="landing-badge" style="margin-bottom: 1rem;">✦ LUMIO</div>
        <h1>Evento inválido</h1>
        <p>Escanea un QR válido para acceder a la cámara</p>
        <a href="/" class="text-link">Volver al inicio</a>
      </div>
    `;
    return container;
  }

  const container = document.createElement('div');
  container.className = 'camera-view';

  container.innerHTML = `
    <div style="position: absolute; top: 1rem; left: 1rem; z-index: 51;">
      <span style="font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 600;">✦ LUMIO</span>
    </div>
    <video id="viewfinder" autoplay playsinline muted></video>
    <canvas id="capture-canvas" style="display:none"></canvas>

    <div class="camera-overlay">
      <a href="/gallery?event=${eventId}" class="btn btn-small btn-secondary" target="_blank">📷 Galería</a>
    </div>

    <div class="preview-strip" id="preview-strip"></div>

    <div class="camera-controls">
      <button id="toggle-cam" class="btn btn-small btn-secondary">🔄</button>
      <button id="snap" class="btn-snap" aria-label="Tomar foto"></button>
      <button id="flash-toggle" class="btn btn-small btn-secondary">⚡</button>
    </div>
  `;

  const video = container.querySelector('#viewfinder');
  const canvas = container.querySelector('#capture-canvas');
  const snapBtn = container.querySelector('#snap');
  const previewStrip = container.querySelector('#preview-strip');
  const toggleCamBtn = container.querySelector('#toggle-cam');

  let currentStream = null;
  let facingMode = 'environment';
  let flashEnabled = false;

  async function startCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      video.srcObject = stream;

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        container.querySelector('#flash-toggle').style.display = 'inline-flex';
      }
    } catch (err) {
      console.error('Error accediendo a cámara:', err);
      showToast('No se pudo acceder a la cámara. Verifica permisos.', 'error');
    }
  }

  await startCamera();

  toggleCamBtn.addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera();
  });

  container.querySelector('#flash-toggle').addEventListener('click', async () => {
    if (!currentStream) return;
    const track = currentStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      flashEnabled = !flashEnabled;
      try {
        await track.applyConstraints({
          advanced: [{ torch: flashEnabled }]
        });
        showToast(flashEnabled ? 'Flash activado' : 'Flash desactivado', 'success');
      } catch (err) {
        showToast('Flash no disponible', 'error');
      }
    }
  });

  snapBtn.addEventListener('click', async () => {
    if (!video.videoWidth) return;

    snapBtn.style.transform = 'scale(0.85)';
    setTimeout(() => snapBtn.style.transform = '', 150);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const maxWidth = 1920;
    if (canvas.width > maxWidth) {
      const scale = maxWidth / canvas.width;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = maxWidth;
      tempCanvas.height = canvas.height * scale;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      canvas.width = tempCanvas.width;
      canvas.height = tempCanvas.height;
      ctx.drawImage(tempCanvas, 0, 0);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        const previewUrl = URL.createObjectURL(blob);
        const previewImg = document.createElement('img');
        previewImg.src = previewUrl;
        previewStrip.prepend(previewImg);

        while (previewStrip.children.length > 10) {
          previewStrip.lastChild.remove();
        }

        const { path } = await PhotoService.uploadPhoto(eventId, blob);
        await PhotoService.savePhotoRecord({
          eventId,
          storagePath: path,
          takenBy: getDeviceId(),
        });

        showToast('📸 Foto guardada', 'success');
      } catch (err) {
        console.error('Error subiendo foto:', err);
        showToast('Error guardando foto', 'error');
      }
    }, 'image/jpeg', 0.92);
  });

  window.addEventListener('beforeunload', () => {
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
    }
  });

  return container;
}

function getDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
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
