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
let currentTheme = localStorage.getItem('appleTheme') || 'dark';
applyTheme(currentTheme);

window.toggleTheme = function() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('appleTheme', currentTheme);
    applyTheme(currentTheme);
};

// --- FIX ROUTER: Nascondere e Mostrare le Sezioni (Sostituisci questo blocco) ---
function mostraSchermata(idView) {
    // Nasconde tutte le sezioni
    const tutteLeView = document.querySelectorAll('.view-section');
    tutteLeView.forEach(view => view.style.display = 'none');
    
    // Mostra solo quella richiesta
    const viewDaMostrare = document.getElementById(idView);
    if (viewDaMostrare) {
        viewDaMostrare.style.display = 'flex'; // Usiamo flex per centrare i contenuti
    }
}

// Simuliamo l'autenticazione per il test visivo (da collegare a Firebase come hai già fatto)
window.addEventListener('hashchange', gestisciRotta);
window.addEventListener('load', gestisciRotta);

function gestisciRotta() {
    const hash = window.location.hash;
    // Se non c'è hash o è #/login, mostra il login. Altrimenti mostra gli anni.
    if (hash === '' || hash === '#/login') {
        mostraSchermata('view-login');
    } else if (hash === '#/anni') {
        mostraSchermata('view-anni');
    }
}
// Per test, quando clicchi accedi vai alla pagina anni:
document.getElementById('btn-login').addEventListener('click', () => {
    window.location.hash = '#/anni';
});


// --- ANIMAZIONE MORPHING GEOMETRICA ---
const modalOverlay = document.getElementById('modal-overlay');
const morphPanel = document.getElementById('modal-content');
const materieGrid = document.getElementById('materie-grid');
const panelHeader = document.getElementById('panel-header');
let activeRect = null; // Salva la posizione iniziale del bottone

window.apriPannelloAnno = function(nomeAnno, idAnno, btnElement) {
    document.getElementById('modal-title').innerText = nomeAnno;
    
    // 1. Calcola le coordinate esatte del bottone cliccato
    activeRect = btnElement.getBoundingClientRect();
    
    // 2. Imposta il pannello esattamente sopra il bottone (nascosto)
    morphPanel.style.transition = 'none';
    morphPanel.style.top = activeRect.top + 'px';
    morphPanel.style.left = activeRect.left + 'px';
    morphPanel.style.width = activeRect.width + 'px';
    morphPanel.style.height = activeRect.height + 'px';
    morphPanel.style.borderRadius = '50px'; // Stessa curva della pillola
    morphPanel.style.transform = 'translate(0, 0)';
    
    // Nasconde i testi interni per la transizione
    panelHeader.style.opacity = '0';
    materieGrid.style.opacity = '0';
    
    // Popola le materie
    materieGrid.innerHTML = ''; 
    let materie = idAnno === 'terzo-anno' ? [
        { nome: 'Semeiotica Medica', css: 's-blue' },
        { nome: 'Microbiologia', css: 's-red' },
        { nome: 'Endocrinologia', css: 's-yellow' }
    ] : [];
    
    materie.forEach(m => {
        const div = document.createElement('div');
        div.className = `subject-card ${m.css}`;
        div.innerText = m.nome;
        materieGrid.appendChild(div);
    });

    // 3. Rende visibile l'overlay e avvia l'animazione al frame successivo
    modalOverlay.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Ripristina le transizioni CSS
            morphPanel.style.transition = 'top 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            // Nuove coordinate per centrarlo ed espanderlo
            morphPanel.style.top = '50%';
            morphPanel.style.left = '50%';
            morphPanel.style.width = '90%';
            morphPanel.style.height = '70vh';
            morphPanel.style.transform = 'translate(-50%, -50%)';
            morphPanel.style.borderRadius = '36px'; // Diventa un rettangolo smussato
            
            // Fai apparire il contenuto dolcemente
            setTimeout(() => {
                panelHeader.style.opacity = '1';
                materieGrid.style.opacity = '1';
            }, 250);
        });
    });
};

// Logica per chiudere rimettendo il pannello al suo posto
function chiudiPannello() {
    if (!activeRect) return;
    
    // Nascondi i contenuti
    panelHeader.style.opacity = '0';
    materieGrid.style.opacity = '0';
    
    // Togli lo sfondo blurrato
    modalOverlay.style.opacity = '0';
    
    // Riporta il pannello alle dimensioni del bottone originale
    morphPanel.style.top = activeRect.top + 'px';
    morphPanel.style.left = activeRect.left + 'px';
    morphPanel.style.width = activeRect.width + 'px';
    morphPanel.style.height = activeRect.height + 'px';
    morphPanel.style.transform = 'translate(0, 0)';
    morphPanel.style.borderRadius = '50px';
    
    // Dopo mezzo secondo (fine animazione), nascondi tutto completamente
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        modalOverlay.style.opacity = ''; // reset per la prossima volta
    }, 500);
}

document.getElementById('close-modal-btn').addEventListener('click', chiudiPannello);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) chiudiPannello();
});
