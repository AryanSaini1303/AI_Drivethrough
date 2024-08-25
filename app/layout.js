// app/layout.tsx

import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

// Define your viewport settings here
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no"
};

export const metadata = {
  title: "AI-Drivethrough",
  description: "Speed optimizer and classifier",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content={`width=${viewport.width}, initial-scale=${viewport.initialScale}, maximum-scale=${viewport.maximumScale}, user-scalable=${viewport.userScalable}`} />
        {/* Other meta tags or links */}
      </head>
      <body className={inter.className}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
