// 1. Importiamo le funzioni esatte che ci servono da Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
  import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// 2. DATI DELLA TUA CONFIGURAZIONE (presi da Firebase)  
const firebaseConfig = {
    apiKey: "AIzaSyBOct9DJUuDIFWPEXnpqiuH2gS7_eDkqHY",
    authDomain: "medicina-pavia.firebaseapp.com",
    projectId: "medicina-pavia",
    storageBucket: "medicina-pavia.firebasestorage.app",
    messagingSenderId: "371700150654",
    appId: "1:371700150654:web:fcd524be165f9fccb3c32f",
    measurementId: "G-BTMDMC3ZEN"
  };

// 3. Inizializziamo l'app, l'autenticazione e il database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// --- LOGICA DEL SITO ---

// Funzione migliorata che nasconde tutto e mostra solo l'ID richiesto
function mostraSchermata(idView) {
  const tutteLeView = document.querySelectorAll('.view');
  tutteLeView.forEach(view => view.style.display = 'none'); // Nasconde tutte
  
  const viewDaMostrare = document.getElementById(idView);
  if (viewDaMostrare) {
    viewDaMostrare.style.display = 'block'; // Mostra solo quella giusta
  }
}

// Nuovo sistema di Routing
function gestisciRotta() {
  const hash = window.location.hash || '#/anni';
  
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      if (hash !== '#/login') {
        sessionStorage.setItem('urlDesiderato', hash);
        window.location.replace('#/login'); // Usiamo replace per non sporcare la cronologia
      }
      mostraSchermata('view-login');
    } else {
      if (hash === '#/login') {
        window.location.replace(sessionStorage.getItem('urlDesiderato') || '#/anni');
      } 
      // Gestione degli anni
      else if (hash === '#/anni') { mostraSchermata('view-anni'); }
      else if (hash === '#/primo-anno') { mostraSchermata('view-primo-anno'); }
      else if (hash === '#/secondo-anno') { mostraSchermata('view-secondo-anno'); }
      else if (hash === '#/terzo-anno') { mostraSchermata('view-terzo-anno'); }
      else if (hash === '#/quarto-anno') { mostraSchermata('view-quarto-anno'); }
      else if (hash === '#/quinto-anno') { mostraSchermata('view-quinto-anno'); }
      else if (hash === '#/sesto-anno') { mostraSchermata('view-sesto-anno'); }
      
      // Gestione della singola materia (es: #/materia/semeiotica-medica)
      else if (hash.startsWith('#/materia/')) {
        const idMateriaFirebase = hash.split('/')[2]; 
        caricaMateria(idMateriaFirebase);
        mostraSchermata('view-materie');
      } 
      else {
        mostraSchermata('view-anni');
      }
    }
  });
}

// Lettura del database per la materia specifica
async function caricaMateria(nomeMateria) {
  const docRef = doc(db, "materie", nomeMateria);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const dati = docSnap.data();
    document.getElementById('titolo-materia').innerText = dati.titoloOriginale || nomeMateria;
    
    const contenitore = document.getElementById('lista-materiali');
    contenitore.innerHTML = ''; 
    
    if (dati.risorse) {
      dati.risorse.forEach(risorsa => {
        if (risorsa.tipo === 'pdf') {
          contenitore.innerHTML += `<a href="${risorsa.url}" target="_blank">${risorsa.nome}</a><br>`;
        }
        if (risorsa.tipo === 'quiz') {
          contenitore.innerHTML += `<a href="${risorsa.url}">${risorsa.nome}</a><br>`;
        }
      });
    }
  } else {
    document.getElementById('titolo-materia').innerText = "Materiale non ancora caricato";
    document.getElementById('lista-materiali').innerHTML = '';
  }
}

// Azione del bottone di Login
document.getElementById('btn-login').addEventListener('click', () => {
  const password = document.getElementById('pass-input').value;
  // Sostituisci la mail con quella fittizia che creerai nel pannello di Firebase Auth
  signInWithEmailAndPassword(auth, 'studenti@medicina.it', password)
    .catch(error => alert('Password errata! Riprova.'));
});

// Ascoltatori degli eventi
window.addEventListener('hashchange', gestisciRotta);
window.addEventListener('load', gestisciRotta);



// --- GESTIONE TEMA CHIARO/SCURO ---
const themeToggle = document.getElementById('theme-toggle');
let isDarkMode = false;

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerText = '☀️'; // Cambia icona
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerText = '🌙';
    }
});

// --- GESTIONE PANNELLO MODALE (ANIMAZIONI) ---
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalTitle = document.getElementById('modal-title');
const materieGrid = document.getElementById('materie-grid');

// Funzione richiamata cliccando un anno (es. Primo Anno)
window.apriPannelloAnno = function(nomeAnno, idAnno) {
    modalTitle.innerText = nomeAnno; // L'anno diventa l'header
    
    // Svuota la griglia precedente
    materieGrid.innerHTML = ''; 
    
    // Qui puoi definire le materie per ogni anno (con i loro colori stile calendario)
    let materie = [];
    if (idAnno === 'terzo-anno') {
        materie = [
            { id: 'semeiotica-medica', nome: 'Semeiotica Medica', colore: 'color-blue' },
            { id: 'microbiologia', nome: 'Microbiologia', colore: 'color-red' },
            { id: 'endocrinologia', nome: 'Endocrinologia', colore: 'color-yellow' }
        ];
    } else {
        // Messaggio segnaposto se non ci sono materie configurate
        materieGrid.innerHTML = '<p>Materie in aggiornamento...</p>';
    }

    // Crea i quadratini colorati per le materie
    materie.forEach(materia => {
        const box = document.createElement('div');
        box.className = `subject-box ${materia.colore}`;
        box.innerText = materia.nome;
        box.onclick = () => {
            window.location.hash = `#/materia/${materia.id}`;
            modalOverlay.classList.add('hidden'); // Chiude il modale e va alla pagina della materia
        };
        materieGrid.appendChild(box);
    });

    // Mostra il pannello con animazione
    modalOverlay.classList.remove('hidden');
};

// Chiudi il pannello cliccando la freccia "<"
closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

// Chiudi il pannello cliccando sullo sfondo sfocato (fuori dal contenuto)
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
});
