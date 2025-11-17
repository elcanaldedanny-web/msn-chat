// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ====== USUARIOS (REGISTRO / LOGIN) ====== */
// IMPORTANTE: esto es solo memoria, si apagas node se borra todo.
// Después lo podemos pasar a MySQL o similar.
const users = [];
let nextUserId = 1;

// Registro
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }

  const exists = users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) {
    return res.status(409).json({ error: 'Ese usuario ya existe.' });
  }

  const user = {
    id: nextUserId++,
    username,
    password,        // para pruebas locales; en producción se debe encriptar
    isAdmin: users.length === 0 // el PRIMER usuario registrado es administrador global
  };

  users.push(user);

  res.json({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }

  const user = users.find(
    u =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  res.json({
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin
  });
});

/* ====== SALAS / ROLES / BANEOS ====== */

const rooms = {
  general: {
    id: 'general',
    name: 'General',
    description: 'Charlas de todo tipo, sin tema fijo.',
    language: 'Español',
    users: 0,
    adminPassword: null,
    roomType: 'official' // official | support | normal | private
  },
  amistad: {
    id: 'amistad',
    name: 'Amistad',
    description: 'Gente nueva, buena vibra y convivencia.',
    language: 'Español',
    users: 0,
    adminPassword: null,
    roomType: 'official'
  },
  mexico: {
    id: 'mexico',
    name: 'México',
    description: 'Charlas sobre México, ciudades y cultura.',
    language: 'Español',
    users: 0,
    adminPassword: null,
    roomType: 'official'
  },
  ligue: {
    id: 'ligue',
    name: 'Ligue',
    description: 'Coqueteo respetuoso y buen ambiente.',
    language: 'Español',
    users: 0,
    adminPassword: null,
    roomType: 'normal'
  },
  trivia: {
    id: 'trivia',
    name: 'Trivia',
    description: 'Juegos, trivias y bots (ideal para mIRC).',
    language: 'Español',
    users: 0,
    adminPassword: null,
    roomType: 'support'
  }
};

// Roles por sala
const roomRoles = {};
// Baneos por sala
const roomBans = {};

function generateRandomPassword(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

function getRoomsList() {
  // Ocultar salas privadas (pv_) de la lista pública
  return Object.values(rooms).filter(r => r.roomType !== 'private');
}

function sendRoomsList(target) {
  target.emit('rooms_list', getRoomsList());
}

function getUserRole(roomName, username) {
  const roles = roomRoles[roomName] || {};
  return roles[username] || 'user';
}

function setUserRole(roomName, username, role) {
  if (!roomRoles[roomName]) roomRoles[roomName] = {};
  roomRoles[roomName][username] = role;
}

function isBanned(roomName, username) {
  const list = roomBans[roomName];
  if (!list) return null;
  const now = Date.now();
  roomBans[roomName] = list.filter(b => b.until > now);
  return roomBans[roomName].find(b => b.username === username) || null;
}

/* Actualizar lista de usuarios en una sala, incluyendo avatares */
function updateUserList(roomName) {
  const room = io.sockets.adapter.rooms.get(roomName);
  const usersInRoom = [];
  const avatars = {};
  if (room) {
    for (const id of room) {
      const s = io.sockets.sockets.get(id);
      const name = s?.username || 'Anónimo';
      usersInRoom.push(name);
      if (s?.avatar) {
        avatars[name] = s.avatar;
      }
    }
  }
  const roles = roomRoles[roomName] || {};
  io.to(roomName).emit('update_userlist', { users: usersInRoom, roles, avatars });
}

/* ====== SOCKET.IO ====== */
io.on('connection', socket => {
  console.log('Cliente conectado:', socket.id);
  sendRoomsList(socket);

  // Usuario de sitio (registro/login)
  socket.siteUser = null;
  socket.avatar = null;

  socket.on('get_rooms', () => sendRoomsList(socket));

  // Vincular login de sitio al socket
  socket.on('site_login', user => {
    // user: {id, username, isAdmin}
    socket.siteUser = user || null;
    console.log('site_login:', user);
  });

  // Avatar por usuario
  socket.on('set_avatar', avatarUrl => {
    socket.avatar = (avatarUrl || '').trim() || null;
    if (socket.roomName) {
      updateUserList(socket.roomName);
    }
  });

  /* === CREAR SALA (nick + contraseña admin opcional) === */
  socket.on('create_room', data => {
    let id = (data.id || data.name || '').toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const name = data.name || id;
    const description = data.description || 'Sala creada por usuarios.';
    const language = data.language || 'Español';
    const creatorNick = (data.creatorNick || '').trim();
    let adminPassword = (data.adminPassword || '').trim();

    if (!id || !name) {
      socket.emit('room_error', 'Nombre de sala no válido.');
      return;
    }
    if (!creatorNick) {
      socket.emit('room_error', 'Debes escribir un nick para crear la sala.');
      return;
    }
    if (rooms[id]) {
      socket.emit('room_error', 'Ya existe una sala con ese nombre.');
      return;
    }

    const generatedPassword = !adminPassword;
    if (!adminPassword) adminPassword = generateRandomPassword(8);

    rooms[id] = {
      id,
      name,
      description,
      language,
      users: 0,
      adminPassword,
      roomType: 'normal'
    };

    // Rol admin para el creador
    if (!roomRoles[id]) roomRoles[id] = {};
    roomRoles[id][creatorNick] = 'admin';

    // Unir al creador automáticamente
    socket.username = creatorNick;
    socket.join(id);
    socket.roomName = id;
    socket.role = 'admin';
    rooms[id].users = 1;

    sendRoomsList(io);
    updateUserList(id);

    socket.emit('room_created', {
      ...rooms[id],
      creatorNick,
      generatedPassword
    });

    socket.emit('role_assigned', { roomName: id, role: 'admin' });
    socket.emit('system_message', `Has creado y te has unido a la sala ${name} como administrador.`);

    if (generatedPassword) {
      socket.emit(
        'system_message',
        `Esta es tu contraseña aleatoria de administrador para esta sala: ${adminPassword}`
      );
    }
  });

  socket.on('set_username', username => {
    socket.username = username || `Usuario_${socket.id.slice(0, 5)}`;
    socket.emit('system_message', `Tu nombre es ${socket.username}`);
  });

  /* === ENTRAR A UNA SALA (incluye salas privadas pv_) === */
  socket.on('join_room', roomName => {
    if (!roomName) roomName = 'general';

    if (!rooms[roomName]) {
      const isPrivate = roomName.startsWith('pv_');
      rooms[roomName] = {
        id: roomName,
        name: isPrivate ? 'Chat privado' : roomName,
        description: isPrivate ? 'Chat privado entre usuarios.' : 'Sala creada automáticamente.',
        language: 'Español',
        users: 0,
        adminPassword: null,
        roomType: isPrivate ? 'private' : 'normal'
      };
    }

    let username = socket.username || `Usuario_${socket.id.slice(0, 5)}`;
    socket.username = username;

    const ban = isBanned(roomName, username);
    if (ban) {
      socket.emit('ban_info', { roomName, until: ban.until });
      return;
    }

    // salir de sala anterior
    if (socket.roomName) {
      const prev = socket.roomName;
      socket.leave(prev);
      if (rooms[prev]) {
        rooms[prev].users = Math.max(rooms[prev].users - 1, 0);
      }
      updateUserList(prev);
    }

    socket.join(roomName);
    socket.roomName = roomName;
    rooms[roomName].users += 1;

    // Rol
    if (!roomRoles[roomName]) roomRoles[roomName] = {};
    let role = roomRoles[roomName][username];
    if (!role) {
      if (Object.keys(roomRoles[roomName]).length === 0) {
        role = 'admin';
      } else {
        role = 'user';
      }
      setUserRole(roomName, username, role);
    }
    socket.role = role;

    socket.emit('role_assigned', { roomName, role });
    socket.emit('system_message', `Te has unido a la sala ${rooms[roomName].name}`);
    socket.to(roomName).emit('system_message', `${username} se ha unido a la sala.`);

    updateUserList(roomName);
    sendRoomsList(io);
  });

  /* Cambiar rol (solo admin de sala) */
  socket.on('change_role', ({ roomName, target, role }) => {
    if (!roomName || !target || !role) return;
    const requesterName = socket.username;
    const requesterRole = getUserRole(roomName, requesterName);

    if (requesterRole !== 'admin') {
      socket.emit('room_error', 'Solo el administrador puede cambiar roles.');
      return;
    }

    setUserRole(roomName, target, role);
    io.to(roomName).emit(
      'system_message',
      `${requesterName} ha cambiado el rol de ${target} a ${role}.`
    );
    updateUserList(roomName);
  });

  /* Expulsar (admin o moderador) */
  socket.on('kick_user', ({ roomName, target, minutes }) => {
    if (!roomName || !target || !minutes) return;

    const requesterName = socket.username;
    const requesterRole = getUserRole(roomName, requesterName);

    if (requesterRole !== 'admin' && requesterRole !== 'moderator') {
      socket.emit('room_error', 'No tienes permisos para expulsar usuarios.');
      return;
    }

    const now = Date.now();
    if (!roomBans[roomName]) roomBans[roomName] = [];
    roomBans[roomName].push({
      username: target,
      until: now + minutes * 60 * 1000
    });

    const room = io.sockets.adapter.rooms.get(roomName);
    if (room) {
      for (const id of room) {
        const s = io.sockets.sockets.get(id);
        if (s && s.username === target) {
          s.leave(roomName);
          s.roomName = null;
          s.emit(
            'system_message',
            `Has sido expulsado de la sala ${roomName} por ${minutes} minutos.`
          );
        }
      }
    }

    io.to(roomName).emit(
      'system_message',
      `${target} ha sido expulsado por ${minutes} minutos.`
    );

    updateUserList(roomName);
    sendRoomsList(io);
  });

  /* Mensajes de chat (incluyendo /pass) */
  socket.on('chat_message', text => {
    const roomName = socket.roomName || 'general';
    const username = socket.username || 'Anónimo';
    const role = getUserRole(roomName, username);
    const raw = (text || '').trim();

    // comando /pass
    if (raw.toLowerCase().startsWith('/pass ')) {
      const pwd = raw.slice(6).trim();
      const room = rooms[roomName];
      if (room && room.adminPassword && pwd === room.adminPassword) {
        setUserRole(roomName, username, 'admin');
        socket.role = 'admin';
        socket.emit('system_message', 'Contraseña correcta: ahora eres administrador de esta sala.');
        io.to(roomName).emit('system_message', `${username} ahora es administrador de la sala.`);
        updateUserList(roomName);
      } else {
        socket.emit('system_message', 'Contraseña incorrecta para esta sala.');
      }
      return;
    }

    if (role === 'spectator') {
      socket.emit('system_message', 'Estás en modo espectador y no puedes escribir.');
      return;
    }

    const msg = {
      from: username,
      text,
      time: new Date().toLocaleTimeString()
    };
    io.to(roomName).emit('chat_message', msg);
  });

  /* ====== EVENTOS ADMIN GLOBALES (PANEL) ====== */

  function requireSiteAdmin() {
    return socket.siteUser && socket.siteUser.isAdmin;
  }

  socket.on('admin_get_rooms', () => {
    if (!requireSiteAdmin()) return;
    socket.emit('admin_rooms_data', getRoomsList());
  });

  socket.on('admin_set_room_type', ({ roomId, roomType }) => {
    if (!requireSiteAdmin()) return;
    if (!rooms[roomId]) return;

    const types = ['normal', 'official', 'support'];
    if (!types.includes(roomType)) return;

    rooms[roomId].roomType = roomType;
    sendRoomsList(io);
    socket.emit('admin_rooms_data', getRoomsList());
  });

  socket.on('admin_delete_room', ({ roomId }) => {
    if (!requireSiteAdmin()) return;
    if (!rooms[roomId]) return;

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      for (const id of room) {
        const s = io.sockets.sockets.get(id);
        if (s) {
          s.leave(roomId);
          s.roomName = null;
          s.emit('system_message', 'Esta sala ha sido eliminada por un administrador.');
        }
      }
    }

    delete rooms[roomId];
    delete roomRoles[roomId];
    delete roomBans[roomId];

    sendRoomsList(io);
    socket.emit('admin_rooms_data', getRoomsList());
  });

  socket.on('admin_get_users', () => {
    if (!requireSiteAdmin()) return;
    socket.emit(
      'admin_users_data',
      users.map(u => ({
        id: u.id,
        username: u.username,
        isAdmin: u.isAdmin
      }))
    );
  });

  socket.on('admin_delete_user', ({ userId }) => {
    if (!requireSiteAdmin()) return;
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) users.splice(idx, 1);

    socket.emit(
      'admin_users_data',
      users.map(u => ({
        id: u.id,
        username: u.username,
        isAdmin: u.isAdmin
      }))
    );
  });

  socket.on('disconnect', () => {
    if (socket.roomName && rooms[socket.roomName]) {
      const roomName = socket.roomName;
      rooms[roomName].users = Math.max(rooms[roomName].users - 1, 0);
      updateUserList(roomName);
      sendRoomsList(io);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
