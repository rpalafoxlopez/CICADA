import { supabase } from '../supabase.js';
import { navigate } from '../main.js';

export default async function Login() {
  const container = document.createElement('div');
  container.className = 'page-container';

  // Verificar si ya hay sesión
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    navigate('/dashboard');
    return container;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="landing-badge" style="margin-bottom: 1rem;">🟡 CICADA</div>
      <h1>Acceso para organizadores</h1>
      <p>Crea y gestiona tus eventos CICADA</p>
    </div>

    <div class="card">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="tu@email.com" autocomplete="email" />
      </div>
      <button id="login-btn" class="btn">Enviar enlace mágico ✨</button>
    </div>

    <div style="text-align: center; margin-top: 1.5rem;">
      <a href="/" class="text-link">← Volver a la landing</a>
    </div>

    <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: rgba(233,69,96,0.1); border-radius: 12px;">
      <p style="color: #e94560; font-size: 0.9375rem; font-weight: 500;">
        🎉 ¿Eres invitado? Pide el QR al organizador del evento.
        <br><span style="color: #888; font-weight: 400;">No necesitas cuenta para tomar fotos.</span>
      </p>
    </div>
  `;

  const emailInput = container.querySelector('#email');
  const loginBtn = container.querySelector('#login-btn');

  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      showToast('Introduce un email válido', 'error');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Enviando...';

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      showToast('✅ Revisa tu email y haz clic en el enlace', 'success');
      loginBtn.textContent = '¡Enlace enviado!';
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Enviar enlace mágico ✨';
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
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
