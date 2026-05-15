import { supabase } from '../supabase.js';
import { navigate } from '../main.js';
import { EventService } from '../services/EventService.js';

export default async function Dashboard() {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.innerHTML = `
    <div class="page-header">
      <div class="landing-badge" style="margin-bottom: 1rem;">🟡 CICADA</div>
      <h1>Mis Eventos</h1>
      <p>Gestiona tus enjambres</p>
    </div>

    <button id="new-event-btn" class="btn" style="margin-bottom: 1.5rem;">
      + Crear nuevo evento
    </button>

    <div id="events-list" class="event-list">
      <div class="loading">Cargando eventos...</div>
    </div>

    <div style="margin-top: 2rem; text-align: center;">
      <button id="logout-btn" class="btn btn-secondary btn-small">Cerrar sesión</button>
    </div>
  `;

  const eventsList = container.querySelector('#events-list');
  try {
    const events = await EventService.getMyEvents();

    if (events.length === 0) {
      eventsList.innerHTML = `
        <div class="card" style="text-align: center; color: #888;">
          <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">Silencio bajo tierra...</p>
          <p style="font-size: 0.875rem;">Crea tu primer CICADA arriba 👆</p>
        </div>
      `;
    } else {
      eventsList.innerHTML = '';
      events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';

        const date = new Date(event.created_at).toLocaleDateString('es-ES', {
          day: 'numeric', month: 'short', year: 'numeric'
        });

        const photoCount = event.photo_count || 0;

        card.innerHTML = `
          <div class="event-card-info">
            <h3>${escapeHtml(event.title)}</h3>
            <p>${date} · ${photoCount} foto${photoCount !== 1 ? 's' : ''}</p>
          </div>
          <div class="event-card-actions">
            <button class="btn btn-small btn-secondary" data-action="qr" data-id="${event.id}">QR</button>
            <button class="btn btn-small btn-secondary" data-action="gallery" data-id="${event.id}">Galería</button>
            <button class="btn btn-small" data-action="delete" data-id="${event.id}" style="background: #ff6b6b;">🗑</button>
          </div>
        `;

        eventsList.appendChild(card);
      });
    }
  } catch (err) {
    eventsList.innerHTML = `<div class="error">Error cargando eventos: ${err.message}</div>`;
  }

  container.querySelector('#new-event-btn').addEventListener('click', () => {
    navigate('/event/new');
  });

  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    navigate('/');
  });

  eventsList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const eventId = btn.dataset.id;

    if (action === 'qr') {
      navigate(`/event/new?showQr=${eventId}`);
    } else if (action === 'gallery') {
      window.open(`/gallery?event=${eventId}`, '_blank');
    } else if (action === 'delete') {
      if (!confirm('¿Eliminar este CICADA y todas sus fotos?')) return;
      try {
        await EventService.deleteEvent(eventId);
        btn.closest('.event-card').remove();
        showToast('CICADA eliminado', 'success');
      } catch (err) {
        showToast('Error eliminando: ' + err.message, 'error');
      }
    }
  });

  return container;
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
  }, 4000);
}
