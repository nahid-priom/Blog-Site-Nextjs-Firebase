"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { BrowserRouter } from "react-router-dom";

const inter = Inter({ subsets: ["latin"] });

import { AuthContextProvider } from "./context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrowserRouter>
          <AuthContextProvider>
            <Navbar />
            {children}
          </AuthContextProvider>
        </BrowserRouter>
      </body>
    </html>
  );
}
