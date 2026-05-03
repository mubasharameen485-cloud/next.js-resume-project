// src/app/explore/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function ExplorePapersPage() {
  const { status } = useSession();
  const router = useRouter();

  // Security check: Agar login nahi hai toh wapas bhej do
  if (status === "unauthenticated") router.push("/login");

  // ==========================================
  // TANSTACK QUERY: GET ALL PAPERS
  // ==========================================
  const { data: papers, isLoading } = useQuery({
    queryKey: ["papers"],
    queryFn: async () => {
      const res = await fetch("/api/papers");
      return res.json();
    },
  });

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-black">Loading Library...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-800">Global Research Library</h1>
            <p className="text-gray-600 mt-2">Explore papers published by Students and Teachers.</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")} 
            className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow"
          >
            Back to Dashboard
          </button>
        </div>

        {/* LIST OF ALL PAPERS (Read Only Feed) */}
        <div className="space-y-8">
          {papers?.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-lg shadow">
              <p className="text-gray-500 italic text-lg">Abhi tak kisi ne koi paper publish nahi kiya.</p>
            </div>
          ) : (
            papers?.map((paper) => (
              <div key={paper.id} className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                
                {/* Paper Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{paper.title}</h2>
                
                {/* Author Info Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${paper.authorRole === 'teacher' ? 'bg-purple-600' : 'bg-green-600'}`}>
                    {paper.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{paper.authorName}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold text-white ${paper.authorRole === 'teacher' ? 'bg-purple-500' : 'bg-green-500'}`}>
                        {paper.authorRole.toUpperCase()}
                      </span>
                      <span className="text-gray-400">• {new Date(paper.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Paper Content */}
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-5 rounded-lg border border-gray-200">
                  {paper.content}
                </div>
                
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}