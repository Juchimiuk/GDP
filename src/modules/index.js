const prisma = require('../prismaClient');

async function createProject(data) {
  return prisma.project.create({ data });
}

async function getProject(id) {
  return prisma.project.findUnique({ where: { id: Number(id) }, include: { tasks: true, pauses: true } });
}

async function updateProject(id, data) {
  return prisma.project.update({ where: { id: Number(id) }, data });
}

async function deleteProject(id) {
  return prisma.project.delete({ where: { id: Number(id) } });
}

async function createTask(data) {
  return prisma.task.create({ data });
}

async function getTask(id) {
  return prisma.task.findUnique({ where: { id: Number(id) }, include: { pauses: true, project: true } });
}

async function updateTask(id, data) {
  return prisma.task.update({ where: { id: Number(id) }, data });
}

async function deleteTask(id) {
  return prisma.task.delete({ where: { id: Number(id) } });
}

async function startPause({ projectId = null, taskId = null }) {
  return prisma.pause.create({ data: { projectId, taskId } });
}

async function endPause(id) {
  return prisma.pause.update({ where: { id: Number(id) }, data: { end: new Date() } });
}

function overlap(aStart, aEnd, bStart, bEnd) {
  const s = aStart > bStart ? aStart : bStart;
  const e = aEnd < bEnd ? aEnd : bEnd;
  return e > s ? e - s : 0;
}

async function calculateTaskTime(taskId) {
  const task = await prisma.task.findUnique({ where: { id: Number(taskId) } });
  if (!task) return null;
  const start = task.createdAt;
  const end = task.completedAt || new Date();

  const pauses = await prisma.pause.findMany({
    where: {
      OR: [
        { taskId: task.id },
        { projectId: task.projectId }
      ]
    }
  });

  const now = new Date();
  let pausedMs = 0;
  for (const p of pauses) {
    const pStart = p.start;
    const pEnd = p.end || now;
    pausedMs += overlap(start, end, pStart, pEnd);
  }

  const totalMs = Math.max(0, end - start - pausedMs);
  return { ms: totalMs, human: formatDuration(totalMs) };
}

async function calculateProjectTime(projectId) {
  const tasks = await prisma.task.findMany({ where: { projectId: Number(projectId) } });
  let total = 0;
  for (const t of tasks) {
    const res = await calculateTaskTime(t.id);
    if (res) total += res.ms;
  }
  return { ms: total, human: formatDuration(total) };
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  startPause,
  endPause,
  calculateTaskTime,
  calculateProjectTime
};
