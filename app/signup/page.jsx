// src/app/signup/page.jsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [successRoll, setSuccessRoll] = useState("");

  // react-hook-form ka setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { role: "student" }, // By default student selected hoga
  });

  // Watch function live check karta hai ke role dropdown mein kya selected hai
  const selectedRole = watch("role");

  // Form submit hone par yeh function chalega
  const onSubmit = async (data) => {
    setServerMessage("");
    
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // react-hook-form khud sara data jama karke dega
    });

    const responseData = await res.json();

    if (res.ok) {
      setSuccessRoll(responseData.rollNumber);
    } else {
      setServerMessage(responseData.message);
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
          
          <h2 className="text-xl font-bold mb-2 text-gray-900">Sign Up</h2>
          <p className="text-sm text-gray-600 mb-6">To continue, please create a new account.</p>
          
          {successRoll ? (
            <div className="text-center bg-[#fdf2f2] p-6 rounded border border-[#f5c2c7]">
              <p className="text-[#842029] font-bold text-lg">Account Created Successfully.</p>
              <p className="text-2xl mt-3 font-black text-[#A51C30] bg-white border border-[#f5c2c7] py-2 rounded">
                Roll No: {successRoll}
              </p>
              <button 
                onClick={() => router.push("/login")} 
                className="mt-6 w-full bg-[#A51C30] text-white py-3 rounded hover:bg-[#8E1829] transition-colors font-bold"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name */}
              <div>
                <input 
                  {...register("name", { required: "Name zaroori hai" })} 
                  placeholder="Full Name" 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
                />
                {errors.name && <span className="text-[#A51C30] text-xs mt-1 font-semibold block">{errors.name.message}</span>}
              </div>

              {/* Email */}
              <div>
                <input 
                  {...register("email", { required: "Email zaroori hai" })} 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
                />
              </div>

              {/* Password */}
              <div>
                <input 
                  {...register("password", { required: "Password zaroori hai", minLength: 6 })} 
                  type="password" 
                  placeholder="Password" 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
                />
              </div>
              
              {/* Role Selection */}
              <div>
                <select 
                  {...register("role")} 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {/* Secret Key */}
              <div>
                <input 
                  {...register("secretKey", { required: "Secret Key lazmi dein" })} 
                  placeholder="Secret Key (E.g. STD-...)" 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
                />
              </div>

              {/* Conditional Input: Agar student hai toh Class Dropdown, warna Subject Input */}
              {selectedRole === "student" ? (
                <select 
                  {...register("className", { required: "Class Name batayein" })} 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all cursor-pointer"
                >
                  <option value="" hidden>Select Class</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Class 13">Class 13</option>
                  <option value="Class 14">Class 14</option>
                  <option value="Class 15">Class 15</option>
                  <option value="Class 16">Class 16</option>
                  <option value="Class 17">Class 17</option>
                  <option value="Class 18">Class 18</option>
                  <option value="Class 19">Class 19</option>
                  <option value="Class 20">Class 20</option>
                </select>
              ) : (
                <input 
                  {...register("subject", { required: "Subject batayein" })} 
                  placeholder="Subject (E.g. Math)" 
                  className="w-full border border-gray-400 bg-white p-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#A51C30] focus:ring-1 focus:ring-[#A51C30] transition-all" 
                />
              )}

              {/* Error Message */}
              {serverMessage && <p className="text-[#A51C30] text-center text-sm font-medium bg-[#fdf2f2] py-2 rounded border border-[#f5c2c7]">{serverMessage}</p>}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-[#A51C30] text-white py-3 rounded hover:bg-[#8E1829] disabled:bg-[#d89ca4] disabled:cursor-not-allowed transition-colors font-bold text-[16px] mt-4"
              >
                {isSubmitting ? "Processing..." : "Sign Up"}
              </button>

              {/* BOTTOM LINK */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    onClick={() => router.push("/login")} 
                    className="text-[#005587] font-bold hover:underline transition-all"
                  >
                    Sign In
                  </button>
                </p>
              </div>

            </form>
          )}
        </div>
      </main>
    </div>
  );
}