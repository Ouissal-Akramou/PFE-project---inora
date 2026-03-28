import { prisma } from '../lib/prisma.js';

// ── GET /api/drafts ──────────────────────────────────────────────
export const getDraft = async (req, res) => {
  try {
    const draft = await prisma.draft.findFirst({
      where:   { userId: req.user.id },
      orderBy: { lastSavedAt: 'desc' },
    });
    res.json(draft || null);
  } catch (err) {
    console.error('getDraft error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/drafts ─────────────────────────────────────────────
export const saveDraft = async (req, res) => {
  try {
    const { formData } = req.body;

    if (!formData)
      return res.status(400).json({ error: 'formData is required' });

    const existing = await prisma.draft.findFirst({
      where: { userId: req.user.id },
    });

    const draft = existing
      ? await prisma.draft.update({
          where: { id: existing.id },
          data:  { formData },
        })
      : await prisma.draft.create({
          data: { userId: req.user.id, formData },
        });

    res.json(draft);
  } catch (err) {
    console.error('saveDraft error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/drafts/:id ───────────────────────────────────────
export const deleteDraft = async (req, res) => {
  try {
    await prisma.draft.deleteMany({
      where: {
        id:     req.params.id,
        userId: req.user.id,   // ✅ user can only delete their own draft
      },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteDraft error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
