// 1. Inizializza Firebase con le tue chiavi
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 2. Sistema di Routing
function gestisciRotta() {
  const hash = window.location.hash || '#/home';
  
  // Controlla se l'utente è loggato
  auth.onAuthStateChanged(user => {
    if (!user) {
      // Se non loggato e non è già sul login, salva dove voleva andare
      if (hash !== '#/login') {
        sessionStorage.setItem('urlDesiderato', hash);
        window.location.hash = '#/login';
      }
      mostraSchermata('view-login');
    } else {
      // Se loggato, analizza l'hash e mostra la schermata giusta
      if (hash === '#/login') {
        // Se ha appena fatto il login, reindirizza al link salvato o alla home
        window.location.hash = sessionStorage.getItem('urlDesiderato') || '#/anni';
      } else if (hash.startsWith('#/terzo-anno/')) {
        const materia = hash.split('/')[2]; // estrae "microbiologia" o "semeiotica-medica"
        caricaMateria(materia);
        mostraSchermata('view-materie');
      } else {
        mostraSchermata('view-anni');
      }
    }
  });
}

// 3. Logica del Login
document.getElementById('btn-login').addEventListener('click', () => {
  const password = document.getElementById('pass-input').value;
  // Usiamo l'email fissa creata su Firebase in background
  auth.signInWithEmailAndPassword('studenti@medicina.it', password)
    .catch(error => alert('Password errata'));
});

// Ascolta ogni volta che l'URL cambia
window.addEventListener('hashchange', gestisciRotta);
// Avvia al caricamento della pagina
window.addEventListener('load', gestisciRotta);
