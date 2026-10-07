// --- IMPORT FIREBASE (Versione 10.13.1 unificata) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Sostituisci con la tua configurazione
const firebaseConfig = {
    apiKey: "LA_TUA_API_KEY",
    authDomain: "IL_TUO_DOMAIN",
    projectId: "IL_TUO_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// --- ROUTER E SICUREZZA (La password serve davvero) ---
function mostraSchermata(idView) {
    document.querySelectorAll('.view-section').forEach(view => view.style.display = 'none');
    const viewDaMostrare = document.getElementById(idView);
    if (viewDaMostrare) viewDaMostrare.style.display = 'flex';
}

function gestisciRotta() {
    const hash = window.location.hash || '#/anni';
    
    // Controlla il vero stato di Firebase Auth
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Se NON è loggato, blocca l'accesso e rimanda al login
            if (hash !== '#/login') {
                sessionStorage.setItem('urlDesiderato', hash);
                window.location.replace('#/login');
            }
            mostraSchermata('view-login');
        } else {
            // Se È loggato, permette la navigazione
            if (hash === '#/login') {
                window.location.replace(sessionStorage.getItem('urlDesiderato') || '#/anni');
            } else {
                mostraSchermata('view-anni');
            }
        }
    });
}

// Evento Login tramite Firebase
document.getElementById('btn-login').addEventListener('click', () => {
    const password = document.getElementById('pass-input').value;
    signInWithEmailAndPassword(auth, 'studenti@medicina.it', password)
        .catch(error => alert('Password errata. Riprova.'));
});

window.addEventListener('hashchange', gestisciRotta);
window.addEventListener('load', gestisciRotta);


// --- ANIMAZIONE MORPHING FLUIDA E SPLIT VIEW ---
const modalOverlay = document.getElementById('modal-overlay');
const morphPanel = document.getElementById('modal-content');
const materieList = document.getElementById('materie-list');
const risorseList = document.getElementById('risorse-list');
let originalRect = null;

window.apriPannelloAnno = function(nomeAnno, idAnno, btnElement) {
    document.getElementById('modal-title').innerText = nomeAnno;
    
    // 1. Calcola posizione esatta del bottone
    originalRect = btnElement.getBoundingClientRect();
    
    // 2. Piazza il pannello invisibile esattamente sopra il bottone
    morphPanel.style.transition = 'none';
    morphPanel.classList.remove('hidden-morph', 'expanded');
    morphPanel.style.top = originalRect.top + 'px';
    morphPanel.style.left = originalRect.left + 'px';
    morphPanel.style.width = originalRect.width + 'px';
    morphPanel.style.height = originalRect.height + 'px';
    morphPanel.style.borderRadius = '50px';
    
    // Pulisce le viste
    materieList.innerHTML = '';
    risorseList.innerHTML = '<div class="placeholder-text">Seleziona una materia per visualizzare il materiale</div>';

    // 3. Genera la lista materie (Esempio per il terzo anno)
    let materie = [];
    if (idAnno === 'terzo-anno') {
        materie = [
            { id: 'semeiotica-medica', nome: 'Semeiotica Medica', css: 's-blue' },
            { id: 'microbiologia', nome: 'Microbiologia', css: 's-red' },
            { id: 'endocrinologia', nome: 'Endocrinologia', css: 's-yellow' }
        ];
    }

    materie.forEach(m => {
        const pill = document.createElement('div');
        pill.className = `subject-pill ${m.css}`;
        pill.innerText = m.nome;
        pill.onclick = () => {
            // Rimuovi 'active' dalle altre
            document.querySelectorAll('.subject-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            caricaMateriale(m.id); // Chiama il DB per le risorse
        };
        materieList.appendChild(pill);
    });

    // 4. Avvia il morphing
    modalOverlay.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Applica transizione e nuove dimensioni centrali limitate in altezza
            morphPanel.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            morphPanel.style.width = '90%';
            morphPanel.style.maxWidth = '800px';
            morphPanel.style.height = '70vh'; // Non diventa troppo alto
            morphPanel.style.maxHeight = '600px';
            
            // Centratura calcolata
            morphPanel.style.top = 'calc(50% + 40px)'; 
            morphPanel.style.left = '50%';
            morphPanel.style.transform = 'translate(-50%, -50%)';
            morphPanel.style.borderRadius = '36px';
            
            morphPanel.classList.add('expanded');
        });
    });
};

// Carica il contenuto della colonna destra leggendo da Firebase
async function caricaMateriale(idMateria) {
    risorseList.innerHTML = '<div class="placeholder-text">Caricamento in corso...</div>';
    
    try {
        const docRef = doc(db, "materie", idMateria);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dati = docSnap.data();
            risorseList.innerHTML = `<h3>${dati.titoloOriginale || 'Materiale'}</h3><br>`;
            
            if (dati.risorse && dati.risorse.length > 0) {
                dati.risorse.forEach(r => {
                    risorseList.innerHTML += `<a href="${r.url}" target="_blank" class="resource-item"><i class="fas fa-file-alt"></i> ${r.nome}</a>`;
                });
            } else {
                risorseList.innerHTML += '<p>Nessun materiale caricato.</p>';
            }
        } else {
            // Fallback locale se non c'è DB per mostrare il funzionamento
            risorseList.innerHTML = `
                <a href="#" class="resource-item"><i class="fas fa-file-pdf"></i> Appunti di ${idMateria} (PDF)</a>
                <a href="#" class="resource-item"><i class="fas fa-check-circle"></i> Quiz Interattivo</a>
            `;
        }
    } catch(e) {
        risorseList.innerHTML = '<div class="placeholder-text">Errore di connessione al database. Mostro dati di esempio.</div>';
    }
}

// Chiusura con reverse-morphing
document.getElementById('morph-dot').addEventListener('click', chiudiPannello);
modalOverlay.addEventListener('click', chiudiPannello);

function chiudiPannello() {
    if (!originalRect) return;
    
    modalOverlay.classList.add('hidden');
    morphPanel.classList.remove('expanded');
    
    // Torna alla posizione e forma del bottone originale
    morphPanel.style.top = originalRect.top + 'px';
    morphPanel.style.left = originalRect.left + 'px';
    morphPanel.style.width = originalRect.width + 'px';
    morphPanel.style.height = originalRect.height + 'px';
    morphPanel.style.transform = 'translate(0, 0)';
    morphPanel.style.borderRadius = '50px';
    
    setTimeout(() => {
        morphPanel.classList.add('hidden-morph');
    }, 400);
}
