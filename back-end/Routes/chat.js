/*import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import auth       from '../Middlewares/auth.js';

const router = Router();

// ── User: start or reuse existing open conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { subject } = req.body;
    const existing = await prisma.conversation.findFirst({
      where: { userId: req.user.id, status: 'OPEN' }
    });
    if (existing) return res.json(existing);
    const convo = await prisma.conversation.create({
      data: { userId: req.user.id, subject }
    });
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── User: get all their conversations
router.get('/conversations/my', auth, async (req, res) => {
  try {
    const convos = await prisma.conversation.findMany({
      where:   { userId: req.user.id },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: {
          select: {
            messages: {
              where: { readAt: null, sender: { role: 'admin' } }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(convos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get messages + mark as read
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const convoId = req.params.id; // ✅ string cuid, no parseInt

    const convo = await prisma.conversation.findUnique({ where: { id: convoId } });
    if (!convo) return res.status(404).json({ message: 'Not found' });
    if (convo.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    await prisma.message.updateMany({
      where: { conversationId: convoId, readAt: null, senderId: { not: req.user.id } },
      data:  { readAt: new Date() }
    });

    const messages = await prisma.message.findMany({
      where:   { conversationId: convoId },
      include: { sender: { select: { id: true, fullName: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Send a message
router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const convoId = req.params.id; // ✅ string cuid
    const { body } = req.body;

    if (!body?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const convo = await prisma.conversation.findUnique({ where: { id: convoId } });
    if (!convo) return res.status(404).json({ message: 'Not found' });
    if (convo.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const message = await prisma.message.create({
      data:    { conversationId: convoId, senderId: req.user.id, body: body.trim() },
      include: { sender: { select: { id: true, fullName: true, role: true } } }
    });

    await prisma.conversation.update({
      where: { id: convoId },
      data:  { updatedAt: new Date() }
    });

    // ✅ emit to user's room + all admins
    const io = req.app.get('io');
    io.to(`user_${convo.userId}`).to('admins').emit('new_message', message);

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: list all open conversations
router.get('/admin/conversations', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const convos = await prisma.conversation.findMany({
      where:   { status: 'OPEN' },
      include: {
        user:      { select: { id: true, fullName: true, email: true } },
        claimedBy: { select: { id: true, fullName: true } },
        messages:  { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: {
          select: {
            messages: {
              where: { readAt: null, sender: { role: { not: 'admin' } } }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(convos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: claim a conversation
router.patch('/admin/conversations/:id/claim', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const convoId = req.params.id; // ✅ string cuid

    const convo = await prisma.conversation.findUnique({ where: { id: convoId } });
    if (!convo) return res.status(404).json({ message: 'Not found' });

    if (convo.claimedById && convo.claimedById !== req.user.id)
      return res.status(409).json({ message: 'Already claimed by another admin' });

    const updated = await prisma.conversation.update({
      where:   { id: convoId },
      data:    { claimedById: req.user.id },
      include: { claimedBy: { select: { id: true, fullName: true } } }
    });

    req.app.get('io').to('admins').emit('convo_claimed', {
      convoId:   updated.id,
      adminId:   req.user.id,
      adminName: req.user.fullName
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: unclaim a conversation
router.patch('/admin/conversations/:id/unclaim', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const convoId = req.params.id; // ✅ string cuid

    const updated = await prisma.conversation.update({
      where: { id: convoId },
      data:  { claimedById: null }
    });

    req.app.get('io').to('admins').emit('convo_unclaimed', { convoId: updated.id });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: close a conversation
router.patch('/admin/conversations/:id/close', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const convoId = req.params.id; // ✅ string cuid

    const convo = await prisma.conversation.update({
      where: { id: convoId },
      data:  { status: 'CLOSED', claimedById: null }
    });

    req.app.get('io').to('admins').emit('convo_closed', { convoId });

    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
*/