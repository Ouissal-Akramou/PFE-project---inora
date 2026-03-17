import { prisma } from '../lib/prisma.js';

// ── Homepage → approved reviews (public)
export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where:   { approved: true },
      include: { user: { select: { fullName: true, avatarUrl: true } } }, // ✅
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// ── Admin → pending reviews
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where:   { approved: false },
      include: { user: { select: { fullName: true, avatarUrl: true } } }, // ✅
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ message: 'Failed to fetch pending reviews' });
  }
};

// ── Admin → approve
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params; // ✅ string cuid, no parseInt

    const review = await prisma.review.update({
      where: { id },
      data:  { approved: true },
    });
    res.json({ message: 'Approved!', review });
  } catch {
    res.status(500).json({ message: 'Failed to approve' });
  }
};

// ── Admin → delete
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // ✅ string cuid, no parseInt

    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete' });
  }
};

// ── User → submit review
export const createReview = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Login required' });

    const { rating, comment, bookingId } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1–5' });
    if (!comment || comment.trim().length < 10)
      return res.status(400).json({ message: 'Comment must be at least 10 characters' });

    if (bookingId) {
      const existing = await prisma.review.findFirst({
        where: { userId: req.user.id, bookingId: parseInt(bookingId) },
      });
      if (existing) return res.status(409).json({ message: 'You already reviewed this booking' });
    }

    const review = await prisma.review.create({
      data: {
        userId:    req.user.id,
        rating:    Number(rating),
        comment:   comment.trim(),
        bookingId: bookingId ? parseInt(bookingId) : null,
        approved:  false,
      },
      include: { user: { select: { fullName: true, avatarUrl: true } } }, // ✅
    });

    res.status(201).json({ message: 'Submitted for approval!', review });
  } catch (err) {
    console.error('POST /reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
