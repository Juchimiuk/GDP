const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function register({ email, password, name }) {
  if (!email || !password) throw new Error('email and password required');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('email already in use');
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, name } });
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

async function login({ email, password }) {
  if (!email || !password) throw new Error('email and password required');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('invalid credentials');
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

async function listUsers() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
  return users;
}

async function updateUser(id, { email, name, password }) {
  const data = {};
  if (email) data.email = email;
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({ where: { id: Number(id) }, data });
  return { id: user.id, email: user.email, name: user.name, updatedAt: user.updatedAt };
}

module.exports = { register, login, listUsers, updateUser };
