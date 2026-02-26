import { Playfair_Display, Cormorant_Garamond, Lato } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair', 
  style: ['normal', 'italic'] 
});

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  variable: '--font-cormorant', 
  weight: ['300','400','600'], 
  style: ['normal','italic'] 
});

const lato = Lato({ 
  subsets: ['latin'], 
  variable: '--font-lato', 
  weight: ['300','400'] 
});

export const metadata = {
  title: 'Inora',
  description: 'Elegant gatherings',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${cormorant.variable} ${lato.variable}`}>
        <AuthProvider>     {/* ✅ wraps everything */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
