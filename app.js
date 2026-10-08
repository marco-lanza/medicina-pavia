// 1. Importiamo le funzioni esatte che ci servono da Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
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

// ==========================================
// 1. HARD-LOCK DELLA SESSIONE DI SICUREZZA
// ==========================================
// Se l'utente apre una nuova scheda o riavvia il browser, forziamo il logout!
if (!sessionStorage.getItem('app_session_attiva')) {
    signOut(auth);
    sessionStorage.setItem('app_session_attiva', 'true');
}

// ==========================================
// 2. TEMA
// ==========================================
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

// ==========================================
// 3. ROUTER E LOGIN
// ==========================================
window.inTransizioneLogin = false; // Variabile per fermare Firebase durante l'animazione

function mostraSchermata(idView) {
    document.querySelectorAll('.view-section').forEach(view => view.style.display = 'none');
    const viewDaMostrare = document.getElementById(idView);
    if (viewDaMostrare) viewDaMostrare.style.display = 'flex';
}

function gestisciRotta() {
    // Se c'è l'animazione in corso, blocca il router istantaneo
    if (window.inTransizioneLogin) return; 
    
    const hash = window.location.hash || '#/anni';
    
    onAuthStateChanged(auth, (user) => {
        // Doppio controllo in caso Firebase spari l'evento in ritardo
        if (window.inTransizioneLogin) return; 
        
        if (!user) {
            if (hash !== '#/login') {
                sessionStorage.setItem('urlDesiderato', hash);
                window.location.replace('#/login');
            }
            mostraSchermata('view-login');
        } else {
            if (hash === '#/login') {
                window.location.replace(sessionStorage.getItem('urlDesiderato') || '#/anni');
            } else {
                mostraSchermata('view-anni');
            }
        }
    });
}

// --- LOGIN CON ANIMAZIONE TESTUALE (Senza alert popup) ---
document.getElementById('btn-login').addEventListener('click', eseguiLogin);

document.getElementById('pass-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        eseguiLogin();
    }
});

function eseguiLogin() {
    const password = document.getElementById('pass-input').value;
    const btn = document.getElementById('btn-login');
    
    window.inTransizioneLogin = true; // Blocca il cambio schermata
    
    // Feedback di caricamento con rotellina
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verifica...';
    btn.classList.remove('text-error', 'text-success'); 
    
    setPersistence(auth, browserSessionPersistence)
        .then(() => {
            return signInWithEmailAndPassword(auth, 'studenti@medicina.it', password);
        })
        .then(() => {
            // Password corretta: Testo verde con Checkmark
            btn.classList.add('text-success');
            btn.innerHTML = '<i class="fas fa-check icon-anim" style="font-size: 20px;"></i>';
            
            // Attende esattamente 1 secondo per far finire l'animazione
            setTimeout(() => {
                window.inTransizioneLogin = false; // Sblocca il router
                window.location.hash = sessionStorage.getItem('urlDesiderato') || '#/anni';
                gestisciRotta(); // Lancia il router manualmente
                
                // Ripristina il bottone di nascosto per i futuri login
                setTimeout(() => {
                    btn.classList.remove('text-success');
                    btn.innerText = 'Accedi';
                    document.getElementById('pass-input').value = '';
                }, 500);
            }, 1000);
        })
        .catch(error => {
            window.inTransizioneLogin = false; // Sblocca il router in caso di errore
            
            // Password errata: Testo rosso con X
            btn.classList.add('text-error');
            btn.innerHTML = '<i class="fas fa-times icon-anim" style="margin-right: 8px;"></i> Password errata. Riprova.';
            
            // Cancella l'errore e torna normale dopo 2.5 secondi
            setTimeout(() => {
                btn.classList.remove('text-error');
                btn.innerText = 'Accedi';
                document.getElementById('pass-input').value = '';
            }, 2500);
        });
}

window.addEventListener('hashchange', gestisciRotta);
window.addEventListener('load', gestisciRotta);

// ==========================================
// 4. ANIMAZIONE MORPHING SIMMETRICA
// ==========================================
const modalOverlay = document.getElementById('modal-overlay');
const morphPanel = document.getElementById('modal-content');
const materieList = document.getElementById('materie-list');
const risorseList = document.getElementById('risorse-list');
let originalRect = null;

window.apriPannelloAnno = function(nomeAnno, idAnno, btnElement) {
    document.getElementById('modal-title').innerText = nomeAnno;
    originalRect = btnElement.getBoundingClientRect();
    
    morphPanel.style.transition = 'none';
    morphPanel.classList.remove('hidden-morph', 'expanded');
    morphPanel.style.top = originalRect.top + 'px';
    morphPanel.style.left = originalRect.left + 'px';
    morphPanel.style.width = originalRect.width + 'px';
    morphPanel.style.height = originalRect.height + 'px';
    morphPanel.style.borderRadius = '50px';
    morphPanel.style.transform = 'none'; 
    
    materieList.innerHTML = '';
    risorseList.innerHTML = '<div class="placeholder-text">Seleziona una materia per visualizzare il materiale</div>';

// Struttura delle materie dinamicamente associata all'anno selezionato
    let materie = [];
    
    if (idAnno === 'secondo-anno') {
        materie = [
            { id: 'storia-medicina', nome: 'Storia della Medicina', css: 's-orange' },
            { id: 'epidemiologia', nome: 'Epidemiologia', css: 's-cyan' }
        ];
    } else if (idAnno === 'terzo-anno') {
        materie = [
            { id: 'semeiotica-medica', nome: 'Semeiotica Medica', css: 's-blue' },
            { id: 'ematologia', nome: 'Ematologia', css: 's-red' },
            { id: 'microbiologia', nome: 'Microbiologia', css: 's-green' },
            { id: 'endocrinologia', nome: 'Endocrinologia', css: 's-yellow' }
        ];
    } else if (idAnno === 'quarto-anno') {
        materie = [
            { id: 'pneumologia', nome: 'Pneumologia', css: 's-blue' },
            { id: 'ortopedia', nome: 'Ortopedia', css: 's-green' },
            { id: 'cardiologia', nome: 'Cardiologia', css: 's-red' },
            { id: 'nefrologia', nome: 'Nefrologia', css: 's-yellow' },
            { id: 'gastroenterologia', nome: 'Gastroenterologia', css: 's-orange' },
            { id: 'reumatologia', nome: 'Reumatologia', css: 's-purple' },
            { id: 'radiologia', nome: 'Radiologia', css: 's-cyan' },
            { id: 'dermatologia', nome: 'Dermatologia', css: 's-pink' }
        ];
    }
  
    materie.forEach(m => {
        const pill = document.createElement('div');
        pill.className = `subject-pill ${m.css}`;
        pill.innerText = m.nome;
        pill.onclick = () => {
            document.querySelectorAll('.subject-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            caricaMateriale(m.id, m.nome); 
        };
        materieList.appendChild(pill);
    });

    modalOverlay.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const finalW = Math.min(window.innerWidth * 0.9, 800); 
            const finalH = Math.min(window.innerHeight * 0.7, 550); 
            const finalL = (window.innerWidth - finalW) / 2;
            const finalT = (window.innerHeight - finalH) / 2 + 30; 

            morphPanel.style.transition = 'all 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
            morphPanel.style.top = finalT + 'px';
            morphPanel.style.left = finalL + 'px';
            morphPanel.style.width = finalW + 'px';
            morphPanel.style.height = finalH + 'px';
            morphPanel.style.borderRadius = '32px';
            
            morphPanel.classList.add('expanded');
        });
    });
};

async function caricaMateriale(idMateria, nomeMateria) {
    risorseList.innerHTML = '<div class="placeholder-text">Caricamento in corso...</div>';
    
    try {
        const docRef = doc(db, "materie", idMateria);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dati = docSnap.data();
            risorseList.innerHTML = `<h3 style="font-weight:500; font-size:18px; margin-bottom:15px;">${dati.titoloOriginale || nomeMateria}</h3>`;
            
            if (dati.risorse && dati.risorse.length > 0) {
                dati.risorse.forEach(r => {
                    let icon = r.tipo === 'quiz' ? 'fa-check-circle' : 'fa-file-pdf';
                    risorseList.innerHTML += `
                        <a href="${r.url}" target="_blank" class="resource-item">
                            <i class="fas ${icon}"></i> 
                            ${r.nome}
                        </a>`;
                });
            } else {
                risorseList.innerHTML += '<p style="color: var(--placeholder); font-size:14px;">Nessun materiale ancora caricato per questa materia.</p>';
            }
        } else {
            // FIX: Ora mostra un messaggio vuoto se il documento non esiste ancora su Firebase
            risorseList.innerHTML = `
                <h3 style="font-weight:500; font-size:18px; margin-bottom:15px;">${nomeMateria}</h3>
                <p style="color: var(--placeholder); font-size:14px; text-align: left;">Nessun materiale ancora caricato per questa materia.</p>
            `;
        }
    } catch(e) {
        risorseList.innerHTML = '<div class="placeholder-text" style="color: #ff3b30;">Errore di connessione al database. Riprova più tardi.</div>';
        console.error(e);
    }
}

document.getElementById('morph-dot').addEventListener('click', chiudiPannello);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) chiudiPannello();
});

function chiudiPannello() {
    if (!originalRect) return;
    
    modalOverlay.classList.add('hidden');
    morphPanel.classList.remove('expanded');
    
    morphPanel.style.top = originalRect.top + 'px';
    morphPanel.style.left = originalRect.left + 'px';
    morphPanel.style.width = originalRect.width + 'px';
    morphPanel.style.height = originalRect.height + 'px';
    morphPanel.style.borderRadius = '50px';
    
    setTimeout(() => {
        morphPanel.classList.add('hidden-morph');
    }, 650);
}
