"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);

  // Get user from window if available (set on login)
  useEffect(() => {
    if (typeof window !== "undefined" && window.USER) {
      setUser(window.USER);
    }
  }, []);

  return (
    <main className="font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 text-white bg-transparent">
        <h1 className="text-2xl font-bold tracking-widest">LOGO</h1>

        <ul className="hidden md:flex gap-12 text-sm font-medium tracking-wide uppercase">
          <li className="cursor-pointer hover:text-[#C87D87] transition">Home</li>
          <li className="cursor-pointer hover:text-[#C87D87] transition">About</li>
          <li className="cursor-pointer hover:text-[#C87D87] transition">Services</li>
          <li className="cursor-pointer hover:text-[#C87D87] transition">Contact</li>
        </ul>

        {user ? (
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-[#C87D87]"
            />
            <span className="font-medium">{user.fullName}</span>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-gradient-to-r from-[#6B7556] to-[#556b42] px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition"
          >
            Login
          </Link>
        )}
      </nav>

      {/* HERO */}
      <section
        className="relative h-screen w-full flex flex-col justify-center items-center text-center text-white"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523430410476-0185cb1f6ff9')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#C87D87]/70 to-transparent"></div>

        <div className="relative z-10 max-w-4xl px-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold italic mb-6 leading-tight">
            Exceptional Outdoor Experiences
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Crafting unforgettable moments. Tailored events, designed to perfection.
          </p>
          <button className="bg-gradient-to-r from-[#6B7556] to-[#556b42] px-10 py-4 rounded-full text-lg font-semibold shadow-xl hover:scale-105 transition-transform">
            Get Started
          </button>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-[#FBEAD6] py-32 px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image Card */}
          <div className="relative flex justify-center">
            <div className="rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition duration-500">
              <img
                src="https://images.unsplash.com/photo-1505236738411-6d0a1e5b00c5"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-5xl font-bold italic text-[#C87D87]">About Us</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We specialize in creating refined outdoor experiences designed to bring people together.
              From intimate seaside gatherings to elegant garden celebrations, we transform open spaces
              into beautifully curated settings tailored to your vision.
            </p>
            <Link href="#" className="inline-block bg-[#C87D87] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-[#6B7556] transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="py-32 px-6 md:px-20 bg-white">
        <h2 className="text-5xl font-bold italic text-center text-[#6B7556] mb-16">Choose Your Activity</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Activity Card 1 */}
          <div className="bg-[#FBEAD6] rounded-xl shadow-lg overflow-hidden hover:scale-105 transition transform cursor-pointer">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Activity 1" className="w-full h-56 object-cover"/>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Beach Adventure</h3>
              <p className="text-gray-700">Experience the sun, sand, and sea with curated beach activities.</p>
            </div>
          </div>
          {/* Activity Card 2 */}
          <div className="bg-[#FBEAD6] rounded-xl shadow-lg overflow-hidden hover:scale-105 transition transform cursor-pointer">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" alt="Activity 2" className="w-full h-56 object-cover"/>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Mountain Hiking</h3>
              <p className="text-gray-700">Adventure through scenic trails and breathtaking mountain views.</p>
            </div>
          </div>
          {/* Activity Card 3 */}
          <div className="bg-[#FBEAD6] rounded-xl shadow-lg overflow-hidden hover:scale-105 transition transform cursor-pointer">
            <img src="https://images.unsplash.com/photo-1516569427665-f3e2cfb17356" alt="Activity 3" className="w-full h-56 object-cover"/>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2">Garden Event</h3>
              <p className="text-gray-700">Relax in beautifully designed gardens and host memorable gatherings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#6B7556] text-white py-12 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">LOGO</h3>
            <p className="text-gray-200">
              Creating unforgettable outdoor experiences tailored to your vision.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-[#FBEAD6] transition">Home</Link></li>
              <li><Link href="#" className="hover:text-[#FBEAD6] transition">About</Link></li>
              <li><Link href="#" className="hover:text-[#FBEAD6] transition">Services</Link></li>
              <li><Link href="#" className="hover:text-[#FBEAD6] transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Contact</h3>
            <p>Email: support@example.com</p>
            <p>Phone: +1 234 567 890</p>
            <p>Address: 123 Event Street, City</p>
          </div>
        </div>
        <div className="text-center mt-10 text-gray-300">
          &copy; {new Date().getFullYear()} LOGO. All rights reserved.
        </div>
      </footer>

      {/* GLOBAL ANIMATED GRADIENT */}
      <style js>{`
        body {
          overflow-x: hidden;
        }
      `}</style>
    </main>
  );
}