// frontend/app.js — COMPLETE FIXED VERSION
const API = 'https://habitflow-backend-k0bj.onrender.com/api'
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) showDashboard();
  initScrollAnimations();
  initNavbarScroll();
  initFloatingClock();
});

function initNavbarScroll() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .review-card, .about-content, .about-visual')
    .forEach(el => { el.classList.add('fade-in'); observer.observe(el); });
}

function initFloatingClock() {
  const clock = document.createElement('div');
  clock.className = 'floating-clock';
  clock.id = 'floatingClock';
  clock.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/2693/2693507.png" alt="clock"/>';
  document.body.appendChild(clock);

  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX + 80;
    targetY = e.clientY + window.scrollY - 50;
  });

  function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    clock.style.left = currentX + 'px';
    clock.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  new MutationObserver(() => {
    const dashboard = document.getElementById('dashboard');
    clock.style.display = (dashboard && dashboard.style.display === 'flex') ? 'none' : 'block';
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ═══ AUTH ═══
function showAuth(type) {
  document.getElementById('authModal').classList.add('active');
  switchTab(type);
}

function hideAuth() {
  document.getElementById('authModal').classList.remove('active');
}

function switchTab(type) {
  const isLogin = type === 'login';
  document.getElementById('loginForm').style.display = isLogin ? 'block' : 'none';
  document.getElementById('signupForm').style.display = isLogin ? 'none' : 'block';
  document.getElementById('loginTab').classList.toggle('active', isLogin);
  document.getElementById('signupTab').classList.toggle('active', !isLogin);
}

async function signup() {
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!username || !email || !password) return showToast('Please fill all fields!', 'error');
  if (password.length < 6) return showToast('Password must be at least 6 characters!', 'error');

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (data.success) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      hideAuth();
      showDashboard();
      showToast(`Welcome to HabitFlow, ${username}! 🎉`, 'success');
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Cannot connect to server! Is backend running?', 'error');
  }
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return showToast('Please fill all fields!', 'error');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      hideAuth();
      showDashboard();
      showToast(`Welcome back, ${data.user.username}! 👋`, 'success');
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Cannot connect to server! Is backend running?', 'error');
  }
}

function logout() {
  token = null; currentUser = null; chatHistory = [];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('navbar').style.display = 'flex';
  document.getElementById('mainFooter').style.display = 'block';
  document.getElementById('home').scrollIntoView();
  showToast('Logged out!', 'success');
}

// ═══ DASHBOARD ═══
function showDashboard() {
  document.getElementById('dashboard').style.display = 'flex';
  document.getElementById('navbar').style.display = 'none';
  document.getElementById('mainFooter').style.display = 'none';
  loadHabits();
  loadProfile();
  loadBadges();
}

function showDashTab(tab) {
  document.querySelectorAll('.dash-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`${tab}Tab`).style.display = 'block';
  event.target.classList.add('active');
  if (tab === 'habits') loadHabits();
  if (tab === 'friends') loadFriends();
  if (tab === 'badges') loadBadges();
  if (tab === 'profile') loadProfile();
}

// ═══ HABITS ═══
function showAddHabit() { document.getElementById('addHabitForm').style.display = 'flex'; }
function hideAddHabit() { document.getElementById('addHabitForm').style.display = 'none'; }

async function addHabit() {
  const title = document.getElementById('habitTitle').value.trim();
  const description = document.getElementById('habitDesc').value.trim();
  const frequency = document.getElementById('habitFreq').value;

  if (!title) return showToast('Please enter a habit title!', 'error');

  try {
    const res = await fetch(`${API}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, description, frequency })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Habit added! 🔥', 'success');
      hideAddHabit();
      document.getElementById('habitTitle').value = '';
      document.getElementById('habitDesc').value = '';
      loadHabits();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Error! Is server running?', 'error');
  }
}

async function loadHabits() {
  try {
    const res = await fetch(`${API}/habits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const list = document.getElementById('habitsList');

    if (!data.habits || data.habits.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:3rem;color:var(--text-muted)">
          <div style="font-size:3rem;margin-bottom:1rem">🌱</div>
          <p>No habits yet! Click "+ Add Habit" to start!</p>
        </div>`;
      return;
    }

    list.innerHTML = data.habits.map(habit => {
      const doneToday = habit.lastCompleted &&
        new Date(habit.lastCompleted).toDateString() === new Date().toDateString();
      return `
        <div class="habit-card">
          <div class="habit-info">
            <h3>${habit.title} ${doneToday ? '✅' : ''}</h3>
            <p>${habit.description || 'No description'} • ${habit.frequency}</p>
          </div>
          <div class="habit-actions">
            <span class="habit-streak">🔥 ${habit.streak} days</span>
            <button class="btn-complete" onclick="completeHabit('${habit._id}')"
              ${doneToday ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
              ${doneToday ? '✓ Done!' : '✓ Mark Done'}
            </button>
            <button class="btn-delete" onclick="deleteHabit('${habit._id}')">✕</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    showToast('Error loading habits!', 'error');
  }
}

async function completeHabit(id) {
  try {
    const res = await fetch(`${API}/habits/${id}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) { loadHabits(); checkAndAwardBadges(data.habit.streak); }
  } catch (err) { showToast('Error!', 'error'); }
}

async function deleteHabit(id) {
  if (!confirm('Delete this habit?')) return;
  try {
    await fetch(`${API}/habits/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    showToast('Habit deleted!', 'success');
    loadHabits();
  } catch (err) { showToast('Error!', 'error'); }
}

// ═══ FRIENDS ═══
async function addFriend() {
  const input = document.getElementById('friendInput').value.trim();
  if (!input) return showToast('Enter a username!', 'error');
  try {
    const res = await fetch(`${API}/friends/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username: input })
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) { document.getElementById('friendInput').value = ''; loadFriends(); }
  } catch (err) { showToast('Error!', 'error'); }
}

async function loadFriends() {
  try {
    const res = await fetch(`${API}/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const list = document.getElementById('friendsList');
    if (!data.friends || data.friends.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted)"><div style="font-size:3rem">👥</div><p>No friends yet!</p></div>`;
      return;
    }
    list.innerHTML = data.friends.map(f => `
      <div class="friend-card">
        <div class="friend-avatar">${f.username[0].toUpperCase()}</div>
        <div><strong>${f.username}</strong><p style="color:var(--text-muted);font-size:0.85rem">${f.email}</p></div>
      </div>`).join('');
  } catch (err) { showToast('Error loading friends!', 'error'); }
}

// ═══ BADGES ═══
const BADGE_MILESTONES = [
  { streak: 3, name: 'Starter', icon: '🥉' },
  { streak: 7, name: 'Week Warrior', icon: '🥈' },
  { streak: 14, name: 'Two Weeks Strong', icon: '⭐' },
  { streak: 30, name: 'Month Master', icon: '🥇' },
  { streak: 100, name: 'Legend', icon: '💎' }
];

async function checkAndAwardBadges(streak) {
  try {
    await fetch(`${API}/badges/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ streak })
    });
  } catch (err) { console.log('Badge error:', err); }
}

function loadBadges() {
  const list = document.getElementById('badgesList');
  if (!list) return;
  list.innerHTML = BADGE_MILESTONES.map(b => `
    <div class="badge-card">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-date">${b.streak} day streak</div>
    </div>`).join('');
}

// ═══ PROFILE ═══
function loadProfile() {
  const card = document.getElementById('profileCard');
  if (!card || !currentUser) return;
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:2rem">
      <div style="width:70px;height:70px;background:var(--gradient);border-radius:50%;
        display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#060F0A">
        ${currentUser.username?.[0]?.toUpperCase()}
      </div>
      <div>
        <h3 style="font-size:1.3rem;font-weight:700">${currentUser.username}</h3>
        <p style="color:var(--text-muted)">${currentUser.email}</p>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.8rem">
      <div style="background:var(--card-bg);border:1px solid var(--border);padding:1rem;border-radius:12px">
        <strong>Plan:</strong> ${currentUser.subscription?.plan || 'free'}
        <span style="color:var(--primary)"> — 7-day trial active ⏳</span>
      </div>
      <div style="background:var(--card-bg);border:1px solid var(--border);padding:1rem;border-radius:12px">
        <strong>Member since:</strong> ${new Date().toLocaleDateString('en-IN')}
      </div>
    </div>`;
}

// ═══ PAYMENT ═══
function startPayment() { showToast('Razorpay coming soon! 💳', 'success'); }

// ═══ CONTACT ═══
function sendContact() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !message) return showToast('Please fill all fields!', 'error');
  showToast("Message sent! We'll reply soon 📨", 'success');
  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMessage').value = '';
}

// ═══ TOAST ═══
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ═══ AI CHATBOX ═══
function toggleChat() {
  document.getElementById('chatContainer').classList.toggle('open');
  const notif = document.getElementById('chatNotif');
  if (notif) notif.style.display = 'none';
}

function handleChatKey(e) { if (e.key === 'Enter') sendChatMessage(); }

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  input.value = '';
  chatHistory.push({ role: 'user', content: message });
  showTyping();

  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: chatHistory.slice(-10) })
    });
    const data = await res.json();
    removeTyping();
    const reply = data.reply || 'Sorry, try again!';
    addChatMessage(reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    removeTyping();
    addChatMessage('Make sure your backend server is running! 🔌', 'bot');
  }
}

function addChatMessage(text, sender) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.innerHTML = `<div class="chat-bubble">${text}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  document.getElementById('typingIndicator')?.remove();
}