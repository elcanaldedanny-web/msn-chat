const socket = io();

/* ===== VISTAS ===== */
const homeView = document.getElementById('homeView');
const roomsView = document.getElementById('roomsView');
const chatView = document.getElementById('chatView');
const adminView = document.getElementById('adminView');
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const profileView = document.getElementById('profileView');

/* Navegación header / sidebar */
const navHome = document.getElementById('navHome');
const navRooms = document.getElementById('navRooms');
const navCreate = document.getElementById('navCreate');
const navMembers = document.getElementById('navMembers');
const navHelp = document.getElementById('navHelp');
const homeJoinRooms = document.getElementById('homeJoinRooms');
const homeCreateRoom = document.getElementById('homeCreateRoom');
const btnGoToRooms = document.getElementById('btnGoToRooms');
const roomsBackHome = document.getElementById('roomsBackHome');
const navAdmin = document.getElementById('navAdmin');
const navProfile = document.getElementById('navProfile');

const btnHeaderLogin = document.getElementById('btnHeaderLogin');
const btnHeaderRegister = document.getElementById('btnHeaderRegister');
const btnHeaderLogout = document.getElementById('btnHeaderLogout');
const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
const sidebarRegisterBtn = document.getElementById('sidebarRegisterBtn');

/* Tabla de salas */
const roomsTableBody = document.getElementById('roomsTableBody');
const roomsTable = document.getElementById('roomsTable');
const createRoomBox = document.getElementById('createRoomBox');
const newRoomName = document.getElementById('newRoomName');
const newRoomDescription = document.getElementById('newRoomDescription');
const newRoomLanguage = document.getElementById('newRoomLanguage');
const newRoomNick = document.getElementById('newRoomNick');
const newRoomAdminPass = document.getElementById('newRoomAdminPass');
const createRoomBtn = document.getElementById('createRoomBtn');
const createRoomStatus = document.getElementById('createRoomStatus');

/* Chat / login sala */
const loginPanel = document.getElementById('loginPanel');
const chatPanel = document.getElementById('chatPanel');
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const loginStatus = document.getElementById('loginStatus');

const roomTitle = document.getElementById('roomTitle');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const userList = document.getElementById('userList');
const userCountLabel = document.getElementById('userCountLabel');
const chatDateLabel = document.getElementById('chatDateLabel');
const toggleSizeBtn = document.getElementById('toggleSizeBtn');

/* Auth (registro / login) */
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
const authStatusSidebar = document.getElementById('authStatus');
const authStatusLogin = document.getElementById('authStatusLogin');
const authStatusRegister = document.getElementById('authStatusRegister');
const loggedInfo = document.getElementById('loggedInfo');
const loggedName = document.getElementById('loggedName');
const loggedRoleText = document.getElementById('loggedRoleText');
const guestInfo = document.getElementById('guestInfo');

/* Perfil / avatar */
const avatarBox = document.getElementById('avatarBox');
const avatarImage = document.getElementById('avatarImage');
const avatarFileInput = document.getElementById('avatarFile');
const saveAvatarBtn = document.getElementById('saveAvatarBtn');
const avatarChangeBtn = document.getElementById('avatarChangeBtn');
const loggedAvatarSmall = document.getElementById('loggedAvatarSmall');
const homeActiveAvatars = document.getElementById('homeActiveAvatars');

/* Perfil view */
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileLevel = document.getElementById('profileLevel');
const profileUsername = document.getElementById('profileUsername');
const profileRole = document.getElementById('profileRole');

/* Links entre vistas auth */
const linkGoRegister = document.getElementById('linkGoRegister');
const linkGoLogin = document.getElementById('linkGoLogin');

/* Admin panel */
const adminRoomsTableBody = document.getElementById('adminRoomsTableBody');
const adminUsersTableBody = document.getElementById('adminUsersTableBody');

/* Menú contextual nicks */
const userContextMenu = document.getElementById('userContextMenu');
let contextTargetUser = null;

/* ===== FECHA ===== */
if (chatDateLabel) {
  const ahora = new Date();
  chatDateLabel.textContent = ahora.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/* ===== VISTAS ===== */
function showView(target) {
  [homeView, roomsView, chatView, adminView, loginView, registerView, profileView]
    .forEach(v => v && v.classList.remove('active'));

  if (target === 'home' && homeView) homeView.classList.add('active');
  if (target === 'rooms' && roomsView) roomsView.classList.add('active');
  if (target === 'chat' && chatView) chatView.classList.add('active');
  if (target === 'admin' && adminView) adminView.classList.add('active');
  if (target === 'login' && loginView) loginView.classList.add('active');
  if (target === 'register' && registerView) registerView.classList.add('active');
  if (target === 'profile' && profileView) profileView.classList.add('active');
}

/**
 * showCreate = false  → solo lista de salas (Explorar / Miembros / Unirte).
 * showCreate = true   → solo formulario de crear sala (Crear sala / Crear tu canal).
 */
function showRoomsView(showCreate) {
  showView('rooms');

  if (createRoomBox) {
    createRoomBox.style.display = showCreate ? 'block' : 'none';
  }
  if (roomsTable) {
    roomsTable.style.display = showCreate ? 'none' : 'table';
  }
}

/* Navegación header / enlaces */
if (navHome) navHome.addEventListener('click', e => { e.preventDefault(); showView('home'); });
if (navRooms) navRooms.addEventListener('click', e => { e.preventDefault(); showRoomsView(false); });
if (navCreate) navCreate.addEventListener('click', e => { e.preventDefault(); showRoomsView(true); });
if (navMembers) navMembers.addEventListener('click', e => { e.preventDefault(); showRoomsView(false); });
if (navHelp) navHelp.addEventListener('click', e => { e.preventDefault(); alert('Sección de ayuda en construcción.'); });

if (homeJoinRooms) homeJoinRooms.addEventListener('click', e => { e.preventDefault(); showRoomsView(false); });
if (homeCreateRoom) homeCreateRoom.addEventListener('click', e => { e.preventDefault(); showRoomsView(true); });
if (btnGoToRooms) btnGoToRooms.addEventListener('click', e => { e.preventDefault(); showRoomsView(false); });
if (roomsBackHome) roomsBackHome.addEventListener('click', e => { e.preventDefault(); showView('home'); });

if (navAdmin) {
  navAdmin.addEventListener('click', e => {
    e.preventDefault();
    if (!loggedUser || !loggedUser.isAdmin) return;
    showView('admin');
    socket.emit('admin_get_rooms');
    socket.emit('admin_get_users');
  });
}

if (navProfile) {
  navProfile.addEventListener('click', e => {
    e.preventDefault();
    updateProfileUI();
    showView('profile');
  });
}

/* Botones login / registro en header y sidebar */
function goLogin() {
  if (authStatusLogin) authStatusLogin.textContent = '';
  showView('login');
}

function goRegister() {
  if (authStatusRegister) authStatusRegister.textContent = '';
  showView('register');
}

if (btnHeaderLogin) btnHeaderLogin.addEventListener('click', e => { e.preventDefault(); goLogin(); });
if (btnHeaderRegister) btnHeaderRegister.addEventListener('click', e => { e.preventDefault(); goRegister(); });
if (sidebarLoginBtn) sidebarLoginBtn.addEventListener('click', e => { e.preventDefault(); goLogin(); });
if (sidebarRegisterBtn) sidebarRegisterBtn.addEventListener('click', e => { e.preventDefault(); goRegister(); });

if (linkGoRegister) linkGoRegister.addEventListener('click', e => { e.preventDefault(); goRegister(); });
if (linkGoLogin) linkGoLogin.addEventListener('click', e => { e.preventDefault(); goLogin(); });

/* ===== COLORES NICKS ===== */
const NICK_COLORS = [
  '#ff6600', '#0078d7', '#16a34a', '#db2777',
  '#eab308', '#6366f1', '#0ea5e9', '#f97316'
];
const userColors = {};

function getColorForUser(name) {
  if (!userColors[name]) {
    const keys = Object.keys(userColors);
    const index = keys.length % NICK_COLORS.length;
    userColors[name] = NICK_COLORS[index];
  }
  return userColors[name];
}

/* ===== ESTADO ===== */
let currentRoom = null;
let username = null;
let myRole = 'user';
let myAvatar = null;
let currentRoles = {};
let loggedUser = null;

/* ===== AUTH HELPERS ===== */
function saveLoggedUser() {
  if (loggedUser) {
    localStorage.setItem('retroChatUser', JSON.stringify(loggedUser));
  } else {
    localStorage.removeItem('retroChatUser');
  }
}

function loadLoggedUser() {
  try {
    const raw = localStorage.getItem('retroChatUser');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadAvatarFromStorage() {
  try {
    return localStorage.getItem('retroChatAvatar') || null;
  } catch {
    return null;
  }
}

/* Avatar centralizado */
function setAvatar(dataUrl) {
  myAvatar = dataUrl;
  try {
    localStorage.setItem('retroChatAvatar', dataUrl);
  } catch {}
  if (avatarImage) avatarImage.src = dataUrl;
  if (loggedAvatarSmall) loggedAvatarSmall.src = dataUrl;
  if (profileAvatar) profileAvatar.src = dataUrl;
  socket.emit('set_avatar', dataUrl);
  updateHomeActiveAvatar();
}

function updateHomeActiveAvatar() {
  if (!homeActiveAvatars) return;
  homeActiveAvatars.innerHTML = '';

  if (!loggedUser) {
    ['DA', 'RG', 'MX', 'AN', 'CH'].forEach(init => {
      const span = document.createElement('span');
      span.className = 'avatar-circle';
      span.textContent = init;
      homeActiveAvatars.appendChild(span);
    });
    return;
  }

  if (myAvatar) {
    const img = document.createElement('img');
    img.className = 'home-active-avatar';
    img.src = myAvatar;
    img.alt = loggedUser.username;
    homeActiveAvatars.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.className = 'avatar-circle';
    span.textContent = loggedUser.username.slice(0, 2).toUpperCase();
    homeActiveAvatars.appendChild(span);
  }

  ['RG', 'MX', 'AN', 'CH'].forEach(init => {
    const span = document.createElement('span');
    span.className = 'avatar-circle';
    span.textContent = init;
    homeActiveAvatars.appendChild(span);
  });
}

function updateProfileUI() {
  if (!profileView || !loggedUser) return;
  profileName.textContent = loggedUser.username;
  profileUsername.textContent = loggedUser.username;
  const isAdmin = !!loggedUser.isAdmin;
  profileRole.textContent = isAdmin ? 'Administrador' : 'Usuario';
  profileLevel.textContent = isAdmin ? 'Nivel: Admin global' : 'Nivel: Miembro';
  if (myAvatar) {
    profileAvatar.src = myAvatar;
  } else {
    profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedUser.username)}`;
  }
}

/* Actualiza UI al loguear/cerrar */
function updateAuthUI() {
  if (!loggedInfo || !guestInfo) return;

  if (loggedUser) {
    loggedInfo.style.display = 'block';
    loggedName.textContent = loggedUser.username;
    loggedRoleText.textContent = loggedUser.isAdmin
      ? 'Rol global: Administrador'
      : 'Rol global: Usuario';

    guestInfo.style.display = 'none';

    if (navAdmin) {
      navAdmin.style.display = loggedUser.isAdmin ? 'inline-block' : 'none';
    }

    if (btnHeaderLogin) btnHeaderLogin.style.display = 'none';
    if (btnHeaderRegister) btnHeaderRegister.style.display = 'none';
    if (btnHeaderLogout) btnHeaderLogout.style.display = 'inline-block';

    if (usernameInput) {
      usernameInput.value = loggedUser.username;
      usernameInput.disabled = true;
    }
    if (newRoomNick) {
      newRoomNick.placeholder = `Nick (por defecto: ${loggedUser.username})`;
    }

    if (avatarBox) avatarBox.style.display = 'none';
    if (loggedAvatarSmall) {
      const storedAvatar = loadAvatarFromStorage();
      if (storedAvatar) {
        myAvatar = storedAvatar;
        loggedAvatarSmall.src = storedAvatar;
        if (avatarImage) avatarImage.src = storedAvatar;
        socket.emit('set_avatar', storedAvatar);
      } else {
        loggedAvatarSmall.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedUser.username)}`;
      }
    }

    updateProfileUI();
    updateHomeActiveAvatar();
  } else {
    loggedInfo.style.display = 'none';
    guestInfo.style.display = 'block';

    if (navAdmin) navAdmin.style.display = 'none';

    if (btnHeaderLogin) btnHeaderLogin.style.display = 'inline-block';
    if (btnHeaderRegister) btnHeaderRegister.style.display = 'inline-block';
    if (btnHeaderLogout) btnHeaderLogout.style.display = 'none';

    if (usernameInput) {
      usernameInput.disabled = false;
      usernameInput.value = '';
    }
    if (newRoomNick) {
      newRoomNick.placeholder = 'Nick con el que entrarás a la sala';
    }

    if (avatarBox) avatarBox.style.display = 'none';
    if (loggedAvatarSmall) {
      loggedAvatarSmall.src = 'https://ui-avatars.com/api/?name=User';
    }
    myAvatar = null;
    updateHomeActiveAvatar();
  }

  if (authStatusSidebar) authStatusSidebar.textContent = '';
}

/* LOGOUT */
if (btnHeaderLogout) {
  btnHeaderLogout.addEventListener('click', () => {
    loggedUser = null;
    saveLoggedUser();
    localStorage.removeItem('retroChatAvatar');
    myAvatar = null;
    if (avatarImage) avatarImage.src = 'https://ui-avatars.com/api/?name=User';
    if (loggedAvatarSmall) loggedAvatarSmall.src = 'https://ui-avatars.com/api/?name=User';
    updateAuthUI();
    addSystemMessage('Has cerrado sesión.');
    showView('home');
  });
}

/* ===== RENDER SALAS ===== */
function renderRoomsTable(rooms) {
  roomsTableBody.innerHTML = '';
  rooms.forEach(room => {
    const icon =
      room.roomType === 'official' ? '🦋 ' :
      room.roomType === 'support'  ? '🔨 ' :
      '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${icon}${room.name}</td>
      <td>${room.description || ''}</td>
      <td>${room.users}</td>
      <td>${room.language || 'Español'}</td>
      <td><button class="btn-small join-room-btn" data-room-id="${room.id}" data-room-name="${room.name}">Entrar</button></td>
    `;
    roomsTableBody.appendChild(tr);
  });
  wireJoinButtons();
}

function wireJoinButtons() {
  document.querySelectorAll('.join-room-btn').forEach(btn => {
    btn.onclick = e => {
      const roomId = e.currentTarget.getAttribute('data-room-id') || 'general';
      const roomName = e.currentTarget.getAttribute('data-room-name') || roomId;

      currentRoom = roomId;
      if (roomInput) roomInput.value = roomId;
      if (roomTitle) roomTitle.textContent = `Sala: ${roomName}`;

      showView('chat');
      if (loginPanel && chatPanel) {
        loginPanel.style.display = 'block';
        chatPanel.style.display = 'none';
      }

      updateInviteLinkMessage(roomId);
    };
  });
}

/* ===== CREAR SALA ===== */
if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    const name = (newRoomName.value || '').trim();
    const description = (newRoomDescription.value || '').trim();
    const language = (newRoomLanguage.value || '').trim() || 'Español';
    let nick = (newRoomNick.value || '').trim();
    const adminPassword = (newRoomAdminPass.value || '').trim();

    if (!name) {
      createRoomStatus.textContent = 'Escribe un nombre para la sala.';
      return;
    }

    if (!nick && loggedUser) {
      nick = loggedUser.username;
    }

    if (!nick) {
      createRoomStatus.textContent = 'Escribe tu nick (o inicia sesión primero).';
      return;
    }

    username = nick;
    if (usernameInput) usernameInput.value = nick;

    createRoomStatus.textContent = 'Creando sala...';

    socket.emit('create_room', {
      name,
      description,
      language,
      creatorNick: nick,
      adminPassword
    });
  });
}

/* ===== ENTRAR A SALA EXISTENTE ===== */
if (joinBtn) {
  joinBtn.addEventListener('click', () => {
    if (loggedUser) {
      username = loggedUser.username;
    } else {
      username = (usernameInput.value || '').trim();
    }
    const roomName = (roomInput.value || '').trim() || currentRoom || 'general';

    if (!username) {
      loginStatus.textContent = 'Escribe un nick para entrar.';
      return;
    }

    socket.emit('set_username', username);
    socket.emit('join_room', roomName);
    currentRoom = roomName;
  });
}

/* ===== ENVIAR MENSAJES ===== */
if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) {
  messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

function sendMessage() {
  const text = (messageInput.value || '').trim();
  if (!text || !currentRoom) return;

  socket.emit('chat_message', text);

  if (!text.toLowerCase().startsWith('/pass ')) {
    addMessage({
      from: username,
      text,
      time: new Date().toLocaleTimeString()
    });
  }
  messageInput.value = '';
}

/* ===== SOCKET.IO ===== */
socket.on('rooms_list', rooms => {
  renderRoomsTable(rooms);
});

socket.on('room_created', room => {
  createRoomStatus.textContent = `Sala "${room.name}" creada correctamente.`;

  newRoomName.value = '';
  newRoomDescription.value = '';
  newRoomLanguage.value = 'Español';
  newRoomNick.value = '';
  newRoomAdminPass.value = '';

  username = room.creatorNick || username;
  currentRoom = room.id;

  if (usernameInput) usernameInput.value = username;
  if (roomInput) roomInput.value = room.id;
  if (roomTitle) roomTitle.textContent = `Sala: ${room.name} (admin)`;

  showView('chat');
  if (loginPanel && chatPanel) {
    loginPanel.style.display = 'none';
    chatPanel.style.display = 'grid';
  }

  updateInviteLinkMessage(room.id);
});

socket.on('room_error', msg => {
  if (createRoomStatus) createRoomStatus.textContent = msg;
});

socket.on('role_assigned', ({ roomName, role }) => {
  myRole = role;
  currentRoom = roomName;
  if (roomTitle) roomTitle.textContent = `Sala: ${roomName} (${role})`;
  if (loginPanel && chatPanel) {
    loginPanel.style.display = 'none';
    chatPanel.style.display = 'grid';
  }
  updateInviteLinkMessage(roomName);
});

socket.on('ban_info', ({ roomName, until }) => {
  const fecha = new Date(until);
  const msg = `Estás expulsado de la sala ${roomName} hasta ${fecha.toLocaleString('es-MX')}.`;
  if (loginStatus) loginStatus.textContent = msg;
  if (chatPanel && loginPanel) {
    chatPanel.style.display = 'none';
    loginPanel.style.display = 'block';
  }
  currentRoom = null;
});

socket.on('system_message', text => {
  addSystemMessage(text);
});

socket.on('chat_message', msg => {
  if (msg.from === username && !msg.text.toLowerCase().startsWith('/pass ')) return;
  addMessage(msg);
});

socket.on('update_userlist', payload => {
  const users = payload.users || [];
  currentRoles = payload.roles || {};
  const avatars = payload.avatars || {};

  userList.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    const role = currentRoles[u] || 'user';
    let label = '';
    if (role === 'admin') label = ' (Admin)';
    else if (role === 'moderator') label = ' (Mod)';
    else if (role === 'spectator') label = ' (Espectador)';

    const avatarUrl = avatars[u] || null;
    if (avatarUrl) {
      const img = document.createElement('img');
      img.className = 'user-avatar-small';
      img.src = avatarUrl;
      img.alt = `Avatar de ${u}`;
      li.appendChild(img);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'user-name-label';
    nameSpan.textContent = u + label;
    nameSpan.style.color = getColorForUser(u);
    li.appendChild(nameSpan);

    li.dataset.username = u;
    li.dataset.role = role;
    userList.appendChild(li);
  });

  if (userCountLabel) {
    userCountLabel.textContent = `${users.length} usuario${users.length === 1 ? '' : 's'} conversando`;
  }
});

/* ===== PANEL ADMIN ===== */
socket.on('admin_rooms_data', rooms => {
  adminRoomsTableBody.innerHTML = '';
  rooms.forEach(room => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${room.id}</td>
      <td>${room.name}</td>
      <td>
        <select class="admin-room-type" data-room-id="${room.id}">
          <option value="normal"${room.roomType === 'normal' ? ' selected' : ''}>Normal</option>
          <option value="official"${room.roomType === 'official' ? ' selected' : ''}>Oficial (🦋)</option>
          <option value="support"${room.roomType === 'support' ? ' selected' : ''}>Soporte (🔨)</option>
        </select>
      </td>
      <td>${room.users}</td>
      <td>
        <button class="btn-small admin-save-room" data-room-id="${room.id}">Guardar tipo</button>
        <button class="btn-small admin-delete-room" data-room-id="${room.id}">Eliminar</button>
      </td>
    `;
    adminRoomsTableBody.appendChild(tr);
  });

  adminRoomsTableBody.querySelectorAll('.admin-save-room').forEach(btn => {
    btn.onclick = () => {
      const roomId = btn.getAttribute('data-room-id');
      const sel = adminRoomsTableBody.querySelector(`select[data-room-id="${roomId}"]`);
      if (!sel) return;
      const roomType = sel.value;
      socket.emit('admin_set_room_type', { roomId, roomType });
    };
  });

  adminRoomsTableBody.querySelectorAll('.admin-delete-room').forEach(btn => {
    btn.onclick = () => {
      const roomId = btn.getAttribute('data-room-id');
      if (!confirm(`¿Eliminar la sala ${roomId}?`)) return;
      socket.emit('admin_delete_room', { roomId });
    };
  });
});

socket.on('admin_users_data', users => {
  adminUsersTableBody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.isAdmin ? 'Sí' : 'No'}</td>
      <td>
        <button class="btn-small admin-delete-user" data-user-id="${u.id}">Eliminar</button>
      </td>
    `;
    adminUsersTableBody.appendChild(tr);
  });

  adminUsersTableBody.querySelectorAll('.admin-delete-user').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.getAttribute('data-user-id'), 10);
      if (!confirm(`¿Eliminar al usuario ${id}?`)) return;
      socket.emit('admin_delete_user', { userId: id });
    };
  });
});

/* ===== MENÚ CONTEXTUAL (PV y roles) ===== */
if (userList && userContextMenu) {
  userList.addEventListener('contextmenu', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();

    const targetUser = li.dataset.username;
    if (!targetUser || targetUser === username) return;

    contextTargetUser = targetUser;

    const isAdmin = myRole === 'admin';
    const isStaff = myRole === 'admin' || myRole === 'moderator';

    userContextMenu.querySelectorAll('[data-action^="make-"]').forEach(btn => {
      btn.style.display = isAdmin ? 'block' : 'none';
    });

    userContextMenu.querySelectorAll('[data-action^="kick-"]').forEach(btn => {
      btn.style.display = isStaff ? 'block' : 'none';
    });

    userContextMenu.style.display = 'block';
    userContextMenu.style.left = e.pageX + 'px';
    userContextMenu.style.top = e.pageY + 'px';
  });
}

document.addEventListener('click', () => {
  if (userContextMenu) userContextMenu.style.display = 'none';
});

if (userContextMenu) {
  userContextMenu.addEventListener('click', e => {
    const action = e.target.getAttribute('data-action');
    if (!action || !contextTargetUser || !currentRoom) return;

    if (action === 'pv-chat') {
      const pvRoom = createPvRoomName(username, contextTargetUser);
      const url = `${window.location.origin}/?pv=${encodeURIComponent(pvRoom)}&nick=${encodeURIComponent(username || '')}`;
      window.open(url, '_blank', 'width=900,height=600');
      addSystemMessage(`Se abrió un chat privado con ${contextTargetUser}. Si no se abre, usa este link: ${url}`);
    } else if (action === 'make-moderator') {
      socket.emit('change_role', {
        roomName: currentRoom,
        target: contextTargetUser,
        role: 'moderator'
      });
    } else if (action === 'make-spectator') {
      socket.emit('change_role', {
        roomName: currentRoom,
        target: contextTargetUser,
        role: 'spectator'
      });
    } else if (action === 'make-user') {
      socket.emit('change_role', {
        roomName: currentRoom,
        target: contextTargetUser,
        role: 'user'
      });
    } else if (action === 'kick-10') {
      socket.emit('kick_user', {
        roomName: currentRoom,
        target: contextTargetUser,
        minutes: 10
      });
    } else if (action === 'kick-60') {
      socket.emit('kick_user', {
        roomName: currentRoom,
        target: contextTargetUser,
        minutes: 60
      });
    } else if (action === 'kick-1440') {
      socket.emit('kick_user', {
        roomName: currentRoom,
        target: contextTargetUser,
        minutes: 1440
      });
    }

    userContextMenu.style.display = 'none';
  });
}

/* ===== UTILIDADES UI ===== */
function addMessage({ from, text, time }) {
  const div = document.createElement('div');
  div.classList.add('message');
  const color = getColorForUser(from);

  div.innerHTML =
    `<span class="from" style="color:${color}">${from}</span>` +
    `<span class="time">${time}</span>: ` +
    `<span class="body">${escapeHtml(text)}</span>`;

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message', 'system');
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c] || c));
}

/* ===== LINK DE INVITACIÓN ===== */
function getInviteLink(roomName) {
  const base = window.location.origin;
  return `${base}/?room=${encodeURIComponent(roomName)}`;
}

function updateInviteLinkMessage(roomName) {
  if (!roomName) return;
  const link = getInviteLink(roomName);
  addSystemMessage(`Link para invitar a otros a esta sala: ${link}`);
}

/* ===== SALAS PRIVADAS (PV) ===== */
function normalizeNameForRoom(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function createPvRoomName(a, b) {
  const na = normalizeNameForRoom(a);
  const nb = normalizeNameForRoom(b);
  const pair = [na, nb].sort();
  return `pv_${pair[0]}_${pair[1]}`;
}

/* ===== APLICAR ROOM DESDE LA URL ===== */
function applyRoomFromURL() {
  const params = new URLSearchParams(window.location.search);
  const pvRoom = params.get('pv');
  const roomParam = params.get('room');
  const nickParam = params.get('nick');

  if (nickParam && usernameInput && !loggedUser) {
    usernameInput.value = nickParam;
  }

  const roomName = pvRoom || roomParam;
  if (!roomName) return false;

  currentRoom = roomName;

  if (roomInput) {
    const existingOption = Array.from(roomInput.options || []).find(o => o.value === roomName);
    if (!existingOption) {
      const opt = document.createElement('option');
      opt.value = roomName;
      opt.textContent = pvRoom ? 'Chat privado' : roomName;
      roomInput.appendChild(opt);
    }
    roomInput.value = roomName;
  }

  if (roomTitle) {
    roomTitle.textContent = pvRoom
      ? `Chat privado (${roomName})`
      : `Sala: ${roomName}`;
  }

  showView('chat');

  if (loginPanel && chatPanel) {
    loginPanel.style.display = 'block';
    chatPanel.style.display = 'none';
  }

  updateInviteLinkMessage(roomName);
  return true;
}

/* ===== REGISTRO / LOGIN (HTTP) ===== */
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = (registerUsername.value || '').trim();
    const password = (registerPassword.value || '').trim();
    const confirm = (registerPasswordConfirm.value || '').trim();
    if (!username || !password) {
      if (authStatusRegister) authStatusRegister.textContent = 'Escribe usuario y contraseña para registrarte.';
      return;
    }
    if (password !== confirm) {
      if (authStatusRegister) authStatusRegister.textContent = 'Las contraseñas no coinciden.';
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (authStatusRegister) authStatusRegister.textContent = data.error || 'Error al registrar.';
        return;
      }
      loggedUser = data;
      saveLoggedUser();
      socket.emit('site_login', loggedUser);
      if (authStatusRegister) authStatusRegister.textContent = 'Cuenta creada. Ya estás conectado.';
      registerUsername.value = '';
      registerPassword.value = '';
      registerPasswordConfirm.value = '';
      updateAuthUI();
      showView('home');
    } catch (err) {
      if (authStatusRegister) authStatusRegister.textContent = 'Error de conexión al registrar.';
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = (loginUsername.value || '').trim();
    const password = (loginPassword.value || '').trim();
    if (!username || !password) {
      if (authStatusLogin) authStatusLogin.textContent = 'Escribe usuario y contraseña.';
      return;
    }
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (authStatusLogin) authStatusLogin.textContent = data.error || 'Error al iniciar sesión.';
        return;
      }
      loggedUser = data;
      saveLoggedUser();
      socket.emit('site_login', loggedUser);
      if (authStatusLogin) authStatusLogin.textContent = 'Sesión iniciada correctamente.';
      loginPassword.value = '';
      updateAuthUI();
      showView('home');
    } catch (err) {
      if (authStatusLogin) authStatusLogin.textContent = 'Error de conexión al iniciar sesión.';
    }
  });
}

/* ===== AVATAR (PLUS + FILE HIDDEN) ===== */
function processAvatarFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    addSystemMessage('El archivo seleccionado no es una imagen válida.');
    return;
  }
  const maxSizeMB = 2;
  if (file.size > maxSizeMB * 1024 * 1024) {
    addSystemMessage(`La imagen es muy grande. Máximo ${maxSizeMB} MB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    setAvatar(dataUrl);
    if (avatarFileInput) avatarFileInput.value = '';
  };
  reader.onerror = () => {
    addSystemMessage('No se pudo leer la imagen. Intenta con otro archivo.');
  };
  reader.readAsDataURL(file);
}

if (avatarFileInput) {
  avatarFileInput.addEventListener('change', () => {
    const file = avatarFileInput.files && avatarFileInput.files[0];
    processAvatarFile(file);
  });
}

function openAvatarEditor() {
  if (avatarBox) avatarBox.style.display = 'block';
  if (avatarFileInput) avatarFileInput.click();
}

if (saveAvatarBtn) {
  saveAvatarBtn.addEventListener('click', () => {
    openAvatarEditor();
  });
}

if (avatarChangeBtn) {
  avatarChangeBtn.addEventListener('click', () => {
    openAvatarEditor();
  });
}

/* ===== TAMAÑO DEL CHAT ===== */
function applyChatSizeFromStorage() {
  const size = localStorage.getItem('retroChatSize') || 'normal';
  const isLarge = size === 'large';
  document.body.classList.toggle('chat-size-large', isLarge);
}

if (toggleSizeBtn) {
  toggleSizeBtn.addEventListener('click', () => {
    const isLarge = document.body.classList.toggle('chat-size-large');
    localStorage.setItem('retroChatSize', isLarge ? 'large' : 'normal');
  });
}

/* ===== INICIO ===== */
socket.emit('get_rooms');

loggedUser = loadLoggedUser();
if (loggedUser) {
  socket.emit('site_login', loggedUser);
}
updateAuthUI();
applyChatSizeFromStorage();

const startedInRoom = applyRoomFromURL();
if (!startedInRoom) {
  showView('home');
}
