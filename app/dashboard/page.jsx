// src/app/dashboard/page.jsx
"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Data save karne ke liye states
  const[classFellows, setClassFellows] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const[myClass, setMyClass] = useState("");
  const [showTeachers, setShowTeachers] = useState(false); // Button click control karne ke liye
  const [loadingData, setLoadingData] = useState(true);

  // Security: Agar login nahi hai toh wapas bhej do
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Database se data mangwane ka function
  useEffect(() => {
    if (session?.user?.email) {
      const fetchData = async () => {
        const res = await fetch("/api/dashboard-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        
        if (res.ok) {
          setClassFellows(data.classFellows);
          setTeachers(data.teachers);
          setMyClass(data.myClass);
        }
        setLoadingData(false);
      };
      fetchData();
    }
  },[session]);

  if (status === "loading" || loadingData) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-black">Data Load ho raha hai...</div>;
  }

  if (session && session.user) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-black">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header & Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border-l-4 border-blue-500">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {session.user.name}!</h1>
              <p className="text-gray-600 mt-1">
                Role: <span className="font-bold uppercase text-blue-600">{session.user.role}</span> | 
                Roll No: <span className="font-bold">{session.user.rollNumber}</span>
              </p>
            </div>
            
            {/* Buttons Container */}
            <div className="flex items-center">
              
              {/* Smart Chat Button: Student ko Student Chat, Teacher ko Teacher Chat */}
              {session.user.role === "student" ? (
                <button 
                  onClick={() => router.push("/chat")} 
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow mr-3"
                >
                  Student Chat
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/teacher-chat")} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow mr-3"
                >
                  Teacher Chat
                </button>
              )}
<button 
  onClick={() => router.push("/papers")} 
  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow mr-3"
>
  Research Papers
</button>
<button 
  onClick={() => router.push("/explore")} 
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow mr-3"
>
  Explore Library
</button>
              {/* Logout Button */}
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })} 
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT SIDE: Class Fellows Section (Sirf Students ko dikhega) */}
            {session.user.role === "student" && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-green-700 mb-4 border-b pb-2">
                  My Class Fellows ({myClass})
                </h2>
                
                {classFellows.length > 0 ? (
                  <ul className="space-y-3">
                    {classFellows.map((fellow, index) => (
                      <li key={index} className="bg-green-50 p-3 rounded border border-green-200 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800">{fellow.name}</p>
                          <p className="text-sm text-gray-500">{fellow.email}</p>
                        </div>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-bold">
                          {fellow.rollNumber}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">no student for your same class.</p>
                )}
              </div>
            )}

            {/* RIGHT SIDE: Teachers Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold text-purple-700">Teachers List</h2>
                {/* TEACHERS SHOW/HIDE BUTTON */}
                <button 
                  onClick={() => setShowTeachers(!showTeachers)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded shadow text-sm"
                >
                  {showTeachers ? "Hide Teachers" : "Show Teachers"}
                </button>
              </div>

              {/* Jab button click hoga tabhi yeh list dikhegi */}
              {showTeachers && (
                <div>
                  {teachers.length > 0 ? (
                    <ul className="space-y-3">
                      {teachers.map((teacher, index) => (
                        <li key={index} className="bg-purple-50 p-3 rounded border border-purple-200 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-800">{teacher.name}</p>
                            <p className="text-sm text-gray-500">{teacher.email}</p>
                          </div>
                          <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded font-bold">
                            Subject: {teacher.subject}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">no teacher register.</p>
                  )}
                </div>
              )}
              
              {!showTeachers && (
                <p className="text-gray-500 text-sm italic">click button to show your class teacher.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  return null;
}