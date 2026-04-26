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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        {successRoll ? (
          <div className="text-center text-green-600 font-bold">
            <p>Mubarak ho! Account Ban Gaya.</p>
            <p className="text-xl mt-2">Roll Number: {successRoll}</p>
            <button onClick={() => router.push("/login")} className="mt-4 bg-blue-500 text-white w-full py-2 rounded">
              Login Karne Jayein
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name */}
            <div>
              <input 
                {...register("name", { required: "Name zaroori hai" })} 
                placeholder="Name" 
                className="w-full border p-2 rounded" 
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div>
              <input 
                {...register("email", { required: "Email zaroori hai" })} 
                type="email" 
                placeholder="Email" 
                className="w-full border p-2 rounded" 
              />
            </div>

            {/* Password */}
            <div>
              <input 
                {...register("password", { required: "Password zaroori hai", minLength: 6 })} 
                type="password" 
                placeholder="Password" 
                className="w-full border p-2 rounded" 
              />
            </div>
            
            {/* Role Selection */}
            <div>
              <select {...register("role")} className="w-full border p-2 rounded">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {/* Secret Key */}
            <div>
              <input 
                {...register("secretKey", { required: "Secret Key lazmi dein" })} 
                placeholder="Secret Key (E.g. STD-...)" 
                className="w-full border p-2 rounded" 
              />
            </div>

            {/* Conditional Input: Agar student hai toh Class, warna Subject */}
            {selectedRole === "student" ? (
              <input 
                {...register("className", { required: "Class Name batayein" })} 
                placeholder="Class Name (E.g. 10th)" 
                className="w-full border p-2 rounded" 
              />
            ) : (
              <input 
                {...register("subject", { required: "Subject batayein" })} 
                placeholder="Subject (E.g. Math)" 
                className="w-full border p-2 rounded" 
              />
            )}

            {/* Error Message */}
            {serverMessage && <p className="text-red-500 text-center text-sm">{serverMessage}</p>}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSubmitting ? "Processing..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}