// src/app/layout.jsx
import "./globals.css";
import { AuthProvider } from "./Providers"; // Humne jo file banayi usko import kiya

export const metadata = {
  title: "Study Management System",
  description: "Advanced Role Based System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Poori app ko AuthProvider ke andar daal diya */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}