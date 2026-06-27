// ВАЖНО: Вставь сюда свой firebaseConfig без изменений
const firebaseConfig = {
    apiKey: "AIzaSyBHbzxRwBBb-o6CWgyCpNLFSkAU7W92bbs",
    authDomain: "black-roleplay.firebaseapp.com",
    projectId: "black-roleplay",
    storageBucket: "black-roleplay.firebasestorage.app",
    messagingSenderId: "46707435626",
    appId: "1:46707435626:web:87a4c8a3a955822b4f0213",
    measurementId: "G-RY42HD7VVH"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Навигация
function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));
    
    document.getElementById(sectionId).style.display = 'block';
    document.getElementById(`nav-${sectionId}`).classList.add('active');
    
    if(sectionId === 'forum') loadForumPosts();
}

// Модалки
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Закрытие модалки по клику вне окна
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Авторизация
let isRegisterMode = false;
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('auth-title').innerText = isRegisterMode ? 'Регистрация' : 'Вход в аккаунт';
    document.getElementById('auth-btn').innerText = isRegisterMode ? 'Создать аккаунт' : 'Войти';
    document.querySelector('.toggle-auth').innerText = isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert("Заполни все поля!");

    if (isRegisterMode) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => { alert("Аккаунт создан!"); closeModal('auth-modal'); })
            .catch(err => alert("Ошибка: " + err.message));
    } else {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => { closeModal('auth-modal'); })
            .catch(err => alert("Ошибка: Неверный логин или пароль"));
    }
}

function logout() { auth.signOut(); }

// Отслеживание юзера
auth.onAuthStateChanged(user => {
    const btnLogin = document.getElementById('btn-login-modal');
    const btnLogout = document.getElementById('btn-logout');
    const userEmail = document.getElementById('user-email');
    const btnCreatePost = document.getElementById('btn-create-post');
    const authWarning = document.getElementById('auth-warning');

    if (user) {
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'flex';
        userEmail.style.display = 'block';
        userEmail.innerText = user.email;
        btnCreatePost.style.display = 'flex';
        authWarning.style.display = 'none';
    } else {
        btnLogin.style.display = 'flex';
        btnLogout.style.display = 'none';
        userEmail.style.display = 'none';
        btnCreatePost.style.display = 'none';
        authWarning.style.display = 'block';
    }
});

// Форум: Создание
function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const user = auth.currentUser;

    if (!title || !content) return alert("Заполните все поля!");

    db.collection("forum_posts").add({
        title: title,
        content: content,
        author: user.email.split('@')[0], // Берем ник до @
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        closeModal('post-modal');
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        loadForumPosts();
    }).catch(err => alert("Ошибка БД. Проверь Firebase Rules."));
}

// Форум: Загрузка
function loadForumPosts() {
    db.collection("forum_posts").orderBy("timestamp", "desc").get().then((querySnapshot) => {
        const postsContainer = document.getElementById('forum-posts');
        postsContainer.innerHTML = '';
        
        if(querySnapshot.empty) {
            postsContainer.innerHTML = '<div class="loading">В этом разделе пока нет тем.</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const dateStr = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString('ru-RU', {hour: '2-digit', minute:'2-digit'}) : "Только что";

            postsContainer.innerHTML += `
                <div class="node">
                    <div class="node-icon">📄</div>
                    <div class="node-content">
                        <span class="node-title">${post.title}</span>
                        <div class="node-meta">Автор: <span>${post.author}</span> • Дата: ${dateStr}</div>
                    </div>
                </div>
            `;
        });
    });
}
