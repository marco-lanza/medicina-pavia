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



// --- GESTIONE TEMA ---
function applyTheme(theme) {
    if(theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
}

// Inizializza il tema basandosi sul salvataggio o impostalo dark di default
let currentTheme = localStorage.getItem('appleTheme') || 'dark';
applyTheme(currentTheme);

window.toggleTheme = function() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('appleTheme', currentTheme);
    applyTheme(currentTheme);
};


// --- GESTIONE PANNELLO ESPANSO ---
const modalOverlay = document.getElementById('modal-overlay');
const materieGrid = document.getElementById('materie-grid');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.getElementById('close-modal-btn');

window.apriPannelloAnno = function(nomeAnno, idAnno, btnElement) {
    modalTitle.innerText = nomeAnno;
    materieGrid.innerHTML = ''; 

    // Dati delle materie (esempi usando i colori estratti)
    let materie = [];
    if (idAnno === 'terzo-anno') {
        materie = [
            { id: 'semeiotica-medica', nome: 'Semeiotica Medica', css: 's-blue' },
            { id: 'microbiologia', nome: 'Microbiologia', css: 's-red' },
            { id: 'endocrinologia', nome: 'Endocrinologia', css: 's-yellow' }
        ];
    } else {
        materieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; opacity:0.5;">In aggiornamento...</p>';
    }

    materie.forEach(materia => {
        const box = document.createElement('div');
        box.className = `subject-card ${materia.css}`;
        box.innerText = materia.nome;
        box.onclick = () => {
            window.location.hash = `#/materia/${materia.id}`;
            modalOverlay.classList.add('hidden'); 
        };
        materieGrid.appendChild(box);
    });

    // Rimuove l'hidden per far partire la transizione CSS scale/opacity
    modalOverlay.classList.remove('hidden');
};

// Chiusura fluida
closeBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
});
