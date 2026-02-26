import { prisma } from '../lib/prisma.js';

// Homepage → approved reviews
export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      include: { user: { select: { fullName: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 12
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Admin → pending reviews
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: false },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending reviews' });
  }
};

// Admin → approve → auto shows on homepage
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.update({
      where: { id },
      data: { approved: true }
    });
    res.json({ message: 'Approved!', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve' });
  }
};

// Admin → delete (both pending + approved)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};

// User → submit review
export const createReview = async (req, res) => {
  try {
    const { rating, comment, gatheringId } = req.body;
    if (!req.user?.id) return res.status(401).json({ message: 'Login required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    if (!comment || comment.trim().length < 10) return res.status(400).json({ message: 'Comment 10+ chars' });

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        rating: Number(rating),
        comment: comment.trim(),
        gatheringId: gatheringId || null,
        approved: false,
      },
      include: { user: { select: { fullName: true, image: true } } }
    });
    res.status(201).json({ message: 'Submitted for approval!', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
