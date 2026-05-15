import { supabase } from './supabase.js';
import './style.css';

// Lazy imports de páginas
const loadPage = (name) => import(`./pages/${name}.js`).then(m => m.default || m[name]);

const routes = {
  '/':           () => loadPage('LandingPage'),
  '/login':      () => loadPage('Login'),
  '/dashboard':  () => loadPage('Dashboard'),
  '/event/new':  () => loadPage('CreateEvent'),
  '/camera':     () => loadPage('Camera'),
  '/gallery':    () => loadPage('Slideshow'),
};

export function navigate(path) {
  window.history.pushState({}, '', path);
  router();
}

async function router() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const app = document.getElementById('app');

  // Limpiar contenido anterior
  app.innerHTML = '<div class="loading">Cargando...</div>';

  // Rutas protegidas (solo organizador)
  const protectedRoutes = ['/dashboard', '/event/new'];
  const { data: { session } } = await supabase.auth.getSession();

  if (protectedRoutes.includes(path) && !session) {
    navigate('/login');
    return;
  }

  try {
    const pageLoader = routes[path];
    if (!pageLoader) {
      app.innerHTML = '<div class="page-404"><h1>404</h1><p>Página no encontrada</p><a href="/">Volver al inicio</a></div>';
      return;
    }

    const render = await pageLoader();
    app.innerHTML = '';

    const content = await render(params);
    app.appendChild(content);
  } catch (err) {
    console.error('Error cargando página:', err);
    app.innerHTML = `<div class="error">Error: ${err.message}</div>`;
  }
}

// Eventos de navegación
window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', () => {
  // Interceptar clicks en links internos
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (link && !link.hasAttribute('target') && !link.hasAttribute('download')) {
      e.preventDefault();
      navigate(link.getAttribute('href'));
    }
  });
  router();
});

// Escuchar cambios de auth
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    router();
  }
});
