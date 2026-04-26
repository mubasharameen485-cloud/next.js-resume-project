// src/app/page.jsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Study Management System</h1>
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          Ek advanced role-based system jahan Students aur Teachers aapas mein connect ho sakte hain.
        </p>
        
        <div className="flex space-x-4 justify-center">
          {/* Login Button */}
          <Link 
            href="/login" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-all"
          >
            Login Here
          </Link>

          {/* Signup Button */}
          <Link 
            href="/signup" 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Chota sa footer / instruction */}
      <div className="mt-12 text-gray-500 text-sm">
        <p>Login ke liye valid Roll Number aur Account hona zaroori hai.</p>
      </div>
    </div>
  );
}