// ── Firebase config ──────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBHbzxRwBBb-o6CWgyCpNLFSkAU7W92bbs",
  authDomain: "black-roleplay.firebaseapp.com",
  projectId: "black-roleplay",
  storageBucket: "black-roleplay.firebasestorage.app",
  messagingSenderId: "46707435626",
  appId: "1:46707435626:web:87a4c8a3a955822b4f0213",
  measurementId: "G-RY42HD7VVH"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// ── Auth state — обновляет навбар на всех страницах ──────────
auth.onAuthStateChanged(user => {
  if (user) {
    document.body.classList.add('logged-in');
    document.body.classList.remove('logged-out');
    db.collection('users').doc(user.uid).get().then(d => {
      const nick = d.exists ? d.data().nickname : user.email.split('@')[0];
      document.querySelectorAll('.nav-user-nick').forEach(el => el.textContent = nick);
      document.querySelectorAll('.nav-user-avatar').forEach(el => {
        el.textContent = nick[0].toUpperCase();
      });
    }).catch(() => {});
  } else {
    document.body.classList.add('logged-out');
    document.body.classList.remove('logged-in');
  }
});

// ── Logout ───────────────────────────────────────────────────
function logout() {
  auth.signOut().then(() => { window.location.href = 'index.html'; });
}

// ── Toast ────────────────────────────────────────────────────
function showToast(msg, type='info') {
  let t = document.getElementById('site-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'site-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:11px 24px;border-radius:6px;font-family:Rajdhani,sans-serif;font-size:.95rem;z-index:9999;opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(t);
  }
  const colors = { info:'#c8a000', success:'#00cc55', error:'#cc2233' };
  t.style.background = '#0f0f18';
  t.style.border = `1px solid ${colors[type]||colors.info}`;
  t.style.color = '#fff';
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.opacity = '0', 3200);
}

// ── Copy IP ───────────────────────────────────────────────────
function copyIP() {
  navigator.clipboard.writeText('play.blackroleplay.net')
    .then(() => showToast('✅ IP скопирован!', 'success'))
    .catch(() => showToast('❌ Не удалось скопировать', 'error'));
}

// ── Live online counter (Firestore) ──────────────────────────
function initOnlineCounter() {
  db.collection('server_stats').doc('main').onSnapshot(d => {
    if (d.exists) {
      const n = d.data().online || 0;
      document.querySelectorAll('.live-online').forEach(el => el.textContent = n);
    }
  }, () => {
    // Firestore недоступен — показываем заглушку
    document.querySelectorAll('.live-online').forEach(el => el.textContent = '47');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initOnlineCounter();
});
