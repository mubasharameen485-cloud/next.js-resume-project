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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96 space-y-4 text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        {/* Email */}
        <div>
          <input 
            {...register("email", { required: "Email dena zaroori hai" })} 
            type="email" 
            placeholder="Email" 
            className="w-full border p-2 rounded" 
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
        </div>

        {/* Roll Number */}
        <div>
          <input 
            {...register("rollNumber", { required: "Roll Number dena zaroori hai" })} 
            placeholder="Roll Number (E.g. STD-1234)" 
            className="w-full border p-2 rounded" 
          />
          {errors.rollNumber && <span className="text-red-500 text-xs">{errors.rollNumber.message}</span>}
        </div>

        {/* Password */}
        <div>
          <input 
            {...register("password", { required: "Password dena zaroori hai" })} 
            type="password" 
            placeholder="Password" 
            className="w-full border p-2 rounded" 
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
        </div>
        
        {/* Server Errors (e.g. invalid credentials) */}
        {serverError && <p className="text-red-500 text-center text-sm">{serverError}</p>}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}