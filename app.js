// Твой конфиг Firebase
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

// Переключение вкладок меню
function showSection(sectionId) {
    document.getElementById('home').style.display = 'none';
    document.getElementById('forum').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
    
    if(sectionId === 'forum') {
        loadForumPosts();
    }
}

// === ЛОГИКА АВТОРИЗАЦИИ ===
let isRegisterMode = false;

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('auth-title').innerText = isRegisterMode ? 'Регистрация' : 'Вход';
    document.getElementById('auth-btn').innerText = isRegisterMode ? 'Зарегистрироваться' : 'Войти';
    document.querySelector('.toggle-auth').innerText = isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться';
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isRegisterMode) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => { alert("Успешная регистрация!"); closeModal('auth-modal'); })
            .catch(err => alert("Ошибка: " + err.message));
    } else {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => { alert("Успешный вход!"); closeModal('auth-modal'); })
            .catch(err => alert("Ошибка: " + err.message));
    }
}

function logout() {
    auth.signOut();
}

// Отслеживание статуса пользователя
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('btn-login-modal').style.display = 'none';
        document.getElementById('btn-logout').style.display = 'inline-block';
        document.getElementById('user-email').style.display = 'inline-block';
        document.getElementById('user-email').innerText = user.email;
        
        // Открываем доступ к форуму
        document.getElementById('create-post-section').style.display = 'block';
        document.getElementById('auth-warning').style.display = 'none';
    } else {
        document.getElementById('btn-login-modal').style.display = 'inline-block';
        document.getElementById('btn-logout').style.display = 'none';
        document.getElementById('user-email').style.display = 'none';
        
        // Закрываем доступ к форуму
        document.getElementById('create-post-section').style.display = 'none';
        document.getElementById('auth-warning').style.display = 'block';
    }
});

// === ЛОГИКА ФОРУМА ===
function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const user = auth.currentUser;

    if (!title || !content) return alert("Заполните все поля!");

    db.collection("forum_posts").add({
        title: title,
        content: content,
        author: user.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Тема успешно создана!");
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        loadForumPosts();
    }).catch(err => alert("Ошибка при создании: " + err.message));
}

function loadForumPosts() {
    db.collection("forum_posts").orderBy("timestamp", "desc").get().then((querySnapshot) => {
        const postsContainer = document.getElementById('forum-posts');
        postsContainer.innerHTML = '';
        
        if(querySnapshot.empty) {
            postsContainer.innerHTML = '<p>Тут пока пусто. Будь первым!</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            // Защита от ошибок, если времени еще нет в базе
            const dateStr = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : "Только что";

            postElement.innerHTML = `
                <h4>${post.title}</h4>
                <p>${post.content}</p>
                <small>Автор: ${post.author} | Дата: ${dateStr}</small>
            `;
            postsContainer.appendChild(postElement);
        });
    });
}
