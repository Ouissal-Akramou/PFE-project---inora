"use client"

import Navbar from '../../components/Navbar';
export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}