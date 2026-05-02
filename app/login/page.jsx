// src/app/login/page.jsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  // react-hook-form ka setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Jab user form submit karega
  const onSubmit = async (data) => {
    setServerError("");

    // NextAuth ka signIn function direct hit hoga data ke sath
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      rollNumber: data.rollNumber,
      password: data.password,
    });

    if (res.error) {
      setServerError(res.error); // NextAuth jo error dega (jaise password galat hai) wo dikhayenge
    } else {
      router.push("/dashboard"); // Successful login ke baad kahan jana hai
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f6] font-sans text-gray-900">
      
      {/* TOP HEADER (Like Harvard) */}
      <header className="w-full bg-white py-4 px-6 md:px-12 border-b border-gray-300 flex items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-default">
          <div className="bg-[#A51C30] text-white w-8 h-8 flex items-center justify-center rounded font-serif font-bold text-lg">
            M
          </div>
          <span className="text-xl font-serif text-gray-900 tracking-wide">
            M-Study <span className="font-light text-gray-600">Platform</span>
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 py-10">
        
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900 tracking-tight">
          Welcome to M-Study Platform
        </h1>

        <div className="bg-white p-8 rounded-md border border-gray-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full max-w-md">
          
          <h2 className="text-xl font-bold mb-2 text-gray-900">Sign In</h2>
          <p className="text-sm text-gray-600 mb-6">To continue, please sign in to your account.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email */}
            <div>
              <input 
                {...register("email", { required: "Email dena zaroori hai" })} 
                type="email" 
                placeholder="Email Address" 
                className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
              />
              {errors.email && <span className="text-[#A51C30] text-xs mt-1 font-semibold block">{errors.email.message}</span>}
            </div>

            {/* Roll Number */}
            <div>
              <input 
                {...register("rollNumber", { required: "Roll Number dena zaroori hai" })} 
                placeholder="Roll Number (E.g. STD-1234)" 
                className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
              />
              {errors.rollNumber && <span className="text-[#A51C30] text-xs mt-1 font-semibold block">{errors.rollNumber.message}</span>}
            </div>

            {/* Password */}
            <div>
              <input 
                {...register("password", { required: "Password dena zaroori hai" })} 
                type="password" 
                placeholder="Password" 
                className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
              />
              {errors.password && <span className="text-[#A51C30] text-xs mt-1 font-semibold block">{errors.password.message}</span>}
            </div>
            
            {/* Server Errors (e.g. invalid credentials) */}
            {serverError && <p className="text-[#A51C30] text-center text-sm font-medium bg-[#fdf2f2] py-2 mt-4 rounded border border-[#f5c2c7]">{serverError}</p>}
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#A51C30] text-white py-3 rounded hover:bg-[#8E1829] disabled:bg-[#d89ca4] disabled:cursor-not-allowed transition-colors font-bold text-[16px] mt-4"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            {/* BOTTOM LINK */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Need an account?{" "}
                <button 
                  type="button" 
                  onClick={() => router.push("/signup")} 
                  className="text-[#005587] font-bold hover:underline transition-all"
                >
                  Sign Up
                </button>
              </p>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}