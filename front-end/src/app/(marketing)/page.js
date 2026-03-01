'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const defaultReviews = [
  { id: 'default-1', user: { fullName: 'Sophie Laurent' }, rating: 5, comment: 'An absolutely enchanting experience. Every detail was curated to perfection.' },
  { id: 'default-2', user: { fullName: 'Isabella Moreau' }, rating: 5, comment: 'The garden soirée exceeded every expectation. Truly magical.' },
  { id: 'default-3', user: { fullName: 'Charlotte Dubois' }, rating: 4, comment: 'Elegant, refined, and utterly unforgettable. We will return.' },
];

export default function Home() {
  const [reviews, setReviews] = useState(defaultReviews);

  useEffect(() => {
    fetch('http://localhost:4000/api/reviews/approved', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) && data.length > 0 ? data : defaultReviews))
      .catch(() => setReviews(defaultReviews));
  }, []);

  return (
    <main className="text-[#3a3027] overflow-x-hidden relative">

      {/* ✅ CORNER FRAME - fixed, surrounds entire page */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Outer border */}
        <div className="absolute inset-3 border border-[#C87D87]/30" />
        {/* Inner border */}
        <div className="absolute inset-5 border border-[#C87D87]/15" />

        {/* ─── TOP LEFT ─── */}
        <div className="absolute top-3 left-3 w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C87D87]/80" />
          <div className="absolute top-1 left-4 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
          <div className="absolute top-4 left-1 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
        </div>

        {/* ─── TOP RIGHT ─── */}
        <div className="absolute top-3 right-3 w-16 h-16">
          <div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C87D87]/80" />
          <div className="absolute top-1 right-4 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
          <div className="absolute top-4 right-1 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
        </div>

        {/* ─── BOTTOM LEFT ─── */}
        <div className="absolute bottom-3 left-3 w-16 h-16">
          <div className="absolute bottom-0 left-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C87D87]/80" />
          <div className="absolute bottom-1 left-4 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
          <div className="absolute bottom-4 left-1 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
        </div>

        {/* ─── BOTTOM RIGHT ─── */}
        <div className="absolute bottom-3 right-3 w-16 h-16">
          <div className="absolute bottom-0 right-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C87D87]/80" />
          <div className="absolute bottom-1 right-4 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
          <div className="absolute bottom-4 right-1 w-1.5 h-1.5 rounded-full bg-[#C87D87]/40" />
        </div>

        {/* ─── TOP CENTER ornament ─── */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-16 h-px bg-[#C87D87]/30" />
          <span className="text-[#C87D87]/50 text-xs">✦</span>
          <div className="w-16 h-px bg-[#C87D87]/30" />
        </div>

        {/* ─── BOTTOM CENTER ornament ─── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-16 h-px bg-[#C87D87]/30" />
          <span className="text-[#C87D87]/50 text-xs">✦</span>
          <div className="w-16 h-px bg-[#C87D87]/30" />
        </div>
      </div>

      {/* ─── HERO (no image) ─── */}
     {/* ─── HERO ─── */}
<section className="relative h-screen w-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#FBEAD6] via-[#f5ddd0] to-[#FBEAD6] overflow-hidden">

  {/* Animated radial glow */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,125,135,0.55)_0%,transparent_25%)] animate-pulse" />

  {/* Floating petal shapes */}
  <div className="absolute top-20 left-16 w-32 h-32 rounded-full bg-[#C87D87]/5 animate-[float_6s_ease-in-out_infinite]" />
  <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-[#6B7556]/5 animate-[float_8s_ease-in-out_infinite_2s]" />
  <div className="absolute top-1/3 right-12 w-20 h-20 rounded-full bg-[#C87D87]/6 animate-[float_7s_ease-in-out_infinite_1s]" />
  <div className="absolute bottom-20 left-24 w-24 h-24 rounded-full bg-[#6B7556]/5 animate-[float_9s_ease-in-out_infinite_3s]" />

  {/* Top ornamental line */}
  <div className="absolute top-28 left-1/2 -translate-x-1/2 flex items-center gap-3">
    <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#C87D87]/40" />
    <span className="text-[#C87D87]/40 text-xs">✦</span>
    <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#C87D87]/40" />
  </div>

  {/* MAIN CONTENT */}
  <div className="relative z-10 max-w-4xl px-6">
    {/* Eyebrow */}
    <p
      className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] tracking-[0.35em] uppercase text-sm mb-4 opacity-0 animate-[fadeInDown_1s_ease_0.2s_forwards]"
    >
      — Bespoke Outdoor Experiences —
    </p>

    {/* Main title */}
    <h1
      className="font-['Playfair_Display',serif] italic font-bold text-[clamp(3rem,7vw,5.5rem)] text-[#3a3027] leading-[1.15] mb-2 opacity-0 animate-[fadeInUp_1s_ease_0.5s_forwards]"
    >
      Exceptional
    </h1>
    <h1
      className="font-['Playfair_Display',serif] italic font-bold text-[clamp(3rem,7vw,5.5rem)] text-[#C87D87] leading-[1.15] mb-4 opacity-0 animate-[fadeInUp_1s_ease_0.7s_forwards]"
    >
      Outdoor Experiences
    </h1>

    {/* Divider */}
    <div
      className="flex items-center justify-center gap-3 mb-4 opacity-0 animate-[fadeIn_1s_ease_1s_forwards]"
    >
      <div className="w-12 h-px bg-[#C87D87]/40" />
      <span className="text-[#C87D87]/60 text-xs">✦</span>
      <div className="w-12 h-px bg-[#C87D87]/40" />
    </div>

    {/* Subtitle */}
    <p
      className="font-['Cormorant_Garamond',serif] text-2xl text-[#7a6a5a] mb-4 max-w-2xl mx-auto leading-relaxed opacity-0 animate-[fadeIn_1s_ease_1.1s_forwards]"
    >
      Crafting unforgettable moments.<br />Tailored events, designed to perfection.
    </p>

    {/* CTA */}
   <div className="flex items-center justify-center gap-5 opacity-0 animate-[fadeInUp_1s_ease_1.3s_forwards]">
  <button className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase border border-[#C87D87] text-[#C87D87] px-8 py-2.5 bg-transparent hover:bg-[#C87D87] hover:text-white transition-all duration-300 cursor-pointer">
    Get Started
  </button>
  <Link
    href="#about"
    className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.15em] uppercase text-[#6B7556] border-b border-[#6B7556]/40 pb-0.5 hover:border-[#6B7556] transition-all duration-300"
  >
    Learn More →
  </Link>
</div>
  </div>

  {/* Bottom scroll indicator */}
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-[fadeIn_1s_ease_1.8s_forwards]">
    <span className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#C87D87]/50">Scroll</span>
    <div className="w-px h-10 bg-gradient-to-b from-[#C87D87]/40 to-transparent animate-[scrollLine_2s_ease-in-out_infinite]" />
  </div>
</section>


      {/* ─── ABOUT (no background) ─── */}
      <section className="py-32 px-8 md:px-20 bg-transparent">
        <div className="grid md:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">

          {/* Image with ornamental frame */}
          <div className="relative">
            <div className="border border-[#C87D87]/30 p-3 bg-white/50">
              <img
                src="https://images.unsplash.com/photo-1505236738411-6d0a1e5b00c5"
                alt="About"
                className="w-full h-[500px] object-cover block"
              />
            </div>
            <div className="absolute -top-4 -left-4 w-20 h-20 border border-[#C87D87]/50" />
            <div className="absolute -bottom-4 -right-4 w-14 h-14 border border-[#6B7556]/50" />
          </div>

          {/* Text */}
          <div>
            <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[0.28em] uppercase mb-4">
              Our Story
            </p>
            <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2.4rem,4vw,3.8rem)] text-[#6B7556] leading-[1.2] mb-5">
              A Dedication to<br />Refined Beauty
            </h2>
            <div className="w-12 h-px bg-[#C87D87] mb-6" />
            <p className="text-base leading-[1.9] text-[#7a6a5a] mb-8">
              We specialize in creating refined outdoor experiences designed to bring people together.
              From intimate seaside gatherings to elegant garden celebrations, we transform open spaces
              into beautifully curated settings tailored to your vision.
            </p>
            <Link href="#"
              className="font-['Cormorant_Garamond',serif] text-base tracking-[0.2em] uppercase text-white bg-[#C87D87] px-8 py-3 hover:bg-[#6B7556] transition-colors duration-300 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="text-center py-4 text-[#C87D87] text-xl tracking-[0.6em]">✦ ✦ ✦</div>

      {/* ─── ACTIVITIES ─── */}
      <section className="bg-transparent py-28 px-8 md:px-20">
        <div className="text-center mb-16">
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[0.28em] uppercase mb-3">
            Curated Experiences
          </p>
          <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2.5rem,4vw,3.6rem)] text-[#6B7556]">
            Choose Your Activity
          </h2>
          <div className="w-14 h-px bg-[#C87D87] mx-auto mt-5" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', title: 'Beach Adventure', desc: 'Experience the sun, sand, and sea with curated beach activities.' },
            { img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', title: 'Mountain Hiking', desc: 'Adventure through scenic trails and breathtaking mountain views.' },
            { img: 'https://images.unsplash.com/photo-1516569427665-f3e2cfb17356', title: 'Garden Event', desc: 'Relax in beautifully designed gardens and host memorable gatherings.' },
          ].map((a, i) => (
            <div key={i} className="bg-white/50 border border-[#C87D87]/20 overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(200,125,135,0.2)] transition-all duration-300 cursor-pointer">
              <div className="overflow-hidden h-56">
                <img src={a.img} alt={a.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-2">{a.title}</h3>
                <div className="w-7 h-px bg-[#C87D87] mb-3" />
                <p className="text-sm text-[#7a6a5a] leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="bg-transparent py-28 px-8 md:px-20 border-t border-[#C87D87]/20">
        <div className="text-center mb-16">
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[0.28em] uppercase mb-3">
            Testimonials
          </p>
          <h2 className="font-['Playfair_Display',serif] italic text-[clamp(2.5rem,4vw,3.6rem)] text-[#6B7556]">
            What Our Clients Say
          </h2>
          <div className="w-14 h-px bg-[#C87D87] mx-auto mt-5" />
        </div>
        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white/60 border border-[#C87D87]/20 p-8 hover:shadow-[0_12px_32px_rgba(200,125,135,0.15)] transition-shadow duration-300">
                <div className="font-['Playfair_Display',serif] text-[5rem] text-[#C87D87]/20 leading-none mb-2 -mt-2">"</div>
                <p className="font-['Cormorant_Garamond',serif] italic text-xl text-[#5a4a3a] leading-relaxed mb-5">
                  {review.comment}
                </p>
                <div className="w-7 h-px bg-[#C87D87] mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-['Playfair_Display',serif] text-sm">
                      {review.user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="font-['Playfair_Display',serif] text-sm text-[#3a3027] tracking-wide">
                      {review.user.fullName}
                    </h4>
                  </div>
                  <span className="text-[#C87D87] text-sm tracking-widest">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-['Cormorant_Garamond',serif] italic text-xl text-[#C87D87]/60 text-center py-16">
            No reviews yet. Be the first to share your experience.
          </p>
        )}
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#6B7556] text-white py-16 px-8 md:px-20">
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto pb-10 border-b border-white/20">
          <div>
            <h3 className="font-['Playfair_Display',serif] italic text-3xl text-[#FBEAD6] mb-4">L'Élégance</h3>
            <p className="text-sm leading-relaxed text-white/70">Creating unforgettable outdoor experiences tailored to your vision.</p>
          </div>
          <div>
            <h4 className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase mb-5 text-[#FBEAD6]">Navigation</h4>
            <ul className="flex flex-col gap-3">
              {['Home','About','Services','Contact'].map(item => (
                <li key={item}><Link href="#" className="text-sm text-white/70 hover:text-[#FBEAD6] transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase mb-5 text-[#FBEAD6]">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <p>support@elegance.com</p>
              <p>+1 234 567 890</p>
              <p>123 Garden Avenue, City</p>
            </div>
          </div>
        </div>
        <p className="text-center mt-8 font-['Cormorant_Garamond',serif] italic text-white/50 text-sm">
          © {new Date().getFullYear()} L'Élégance. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
