import { navigate } from '../main.js';
import { supabase } from '../supabase.js';

export default async function LandingPage() {
  const container = document.createElement('div');
  container.className = 'landing-page';

  container.innerHTML = `
    <section class="landing-hero">
      <div class="landing-hero-content">
        <div class="landing-badge">✦ LUMIO</div>
        <h1 class="landing-title">
          Brilla.<br>
          <span class="landing-accent">Comparte. Permanece.</span>
        </h1>
        <p class="landing-subtitle">
          Cada invitado es una cámara. Cada foto, un destello.
          La galería es la luz colectiva que queda.
        </p>
        <div class="landing-cta">
          <button id="btn-start" class="btn btn-landing">Crear mi evento →</button>
          <p class="landing-cta-note">Sin instalación. Solo un QR y una galería que brilla en tiempo real.</p>
        </div>
      </div>
      <div class="landing-visual">
        <div class="landing-polaroid-demo" style="--rotation: -4deg;">
          <div class="demo-img"></div>
          <div class="demo-caption">Boda Ana & Luis</div>
        </div>
        <div class="landing-polaroid-demo" style="--rotation: 3deg; margin-top: -20px; margin-left: 40px;">
          <div class="demo-img" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
          <div class="demo-caption">Cumpleaños 30</div>
        </div>
        <div class="landing-polaroid-demo" style="--rotation: -2deg; margin-top: -30px; margin-left: -20px;">
          <div class="demo-img" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
          <div class="demo-caption">Nochevieja 2026</div>
        </div>
      </div>
    </section>

    <section class="landing-how">
      <h2 class="landing-section-title">Tres momentos. Un evento.</h2>
      <div class="landing-steps">
        <div class="landing-step">
          <div class="step-number">1</div>
          <div class="step-icon">✦</div>
          <h3>Brilla</h3>
          <p>Creas el evento, subes la música y generas el QR. Tu evento cobra luz.</p>
        </div>
        <div class="landing-step-arrow">→</div>
        <div class="landing-step">
          <div class="step-number">2</div>
          <div class="step-icon">📸</div>
          <h3>Comparte</h3>
          <p>Los invitados escanean el QR, acceden a la cámara y capturan. Flash tras flash, la galería crece.</p>
        </div>
        <div class="landing-step-arrow">→</div>
        <div class="landing-step">
          <div class="step-number">3</div>
          <div class="step-icon">💾</div>
          <h3>Permanece</h3>
          <p>Descarga todo como ZIP. El evento termina. La memoria es tuya para siempre.</p>
        </div>
      </div>
    </section>

    <section class="landing-features">
      <h2 class="landing-section-title">Lo que hace brillar a Lumio</h2>
      <div class="landing-features-grid">
        <div class="feature-card">
          <div class="feature-icon">📷</div>
          <h4>Cámara instantánea</h4>
          <p>Frontal o trasera, con flash. Captura y sube en segundos. Sin apps, sin registro.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🖼️</div>
          <h4>Polaroids digitales</h4>
          <p>Marcos blancos, rotación natural, sombras suaves. Como los de verdad, pero infinitos.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h4>Galería en tiempo real</h4>
          <p>La foto que acabas de tomar ya brilla en la galería. Sin refrescar, sin esperar.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎶</div>
          <h4>Música de fondo</h4>
          <p>Sube tu playlist. La galería suena mientras las fotos flotan con Ken Burns.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📲</div>
          <h4>Acceso por QR</h4>
          <p>Un código. Todos los invitados. Cero configuración, cero cuentas para los fotógrafos.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h4>Export ZIP</h4>
          <p>Al final del evento, descarga todas las fotos en un solo archivo. Listo para compartir.</p>
        </div>
      </div>
    </section>

    <section class="landing-cta-bottom">
      <h2>Tu evento está a punto de brillar.</h2>
      <p>Crea tu Lumio. Deja que cada invitado sea parte de la luz.</p>
      <button id="btn-start-bottom" class="btn btn-landing">Crear mi evento gratis →</button>
    </section>

    <footer class="landing-footer">
      <p>Lumio ✦ — Brilla. Comparte. Permanece.</p>
    </footer>
  `;

  async function handleStart() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/event/new');
    } else {
      navigate('/login');
    }
  }

  container.querySelector('#btn-start').addEventListener('click', handleStart);
  container.querySelector('#btn-start-bottom').addEventListener('click', handleStart);

  return container;
}
