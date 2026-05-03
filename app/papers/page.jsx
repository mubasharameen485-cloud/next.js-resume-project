// src/app/papers/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ResearchPapersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const[editingId, setEditingId] = useState(null);

  if (status === "unauthenticated") router.push("/login");

  // ==========================================
  // TANSTACK QUERY: GET ONLY "MY" PAPERS
  // ==========================================
  const { data: myPapers, isLoading } = useQuery({
    queryKey:["myPapers", session?.user?.email], // Query key change ki hai
    queryFn: async () => {
      // YAHAN TWIST HAI: Hum URL mein email bhej rahe hain
      const res = await fetch(`/api/papers?email=${session.user.email}`);
      return res.json();
    },
    enabled: !!session?.user?.email, // Jab tak email na mile tab tak fetch na kare
  });

  // ==========================================
  // TANSTACK MUTATIONS
  // ==========================================
  const createMutation = useMutation({
    mutationFn: async (newPaper) => {
      await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPaper),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myPapers"]); // Sirf apne papers refresh karo
      setTitle(""); setContent("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      await fetch("/api/papers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myPapers"]);
      setTitle(""); setContent(""); setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/papers?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries(["myPapers"]),
  });

  // HANDLERS
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, title, content });
    } else {
      createMutation.mutate({
        title,
        content,
        authorEmail: session.user.email,
        authorName: session.user.name,
        authorRole: session.user.role,
      });
    }
  };

  const handleEdit = (paper) => {
    setTitle(paper.title);
    setContent(paper.content);
    setEditingId(paper.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "loading" || isLoading) return <div className="p-10 text-center text-black">Loading Your Studio...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800">My Publishing Studio</h1>
          <button onClick={() => router.push("/dashboard")} className="bg-gray-600 text-white px-4 py-2 rounded">Back to Dashboard</button>
        </div>

        {/* CREATE / UPDATE FORM */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Your Paper" : "Publish a New Paper"}</h2>
          <input 
            type="text" 
            placeholder="Paper Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="w-full border p-3 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea 
            placeholder="Write your research content here..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
            rows="5"
            className="w-full border p-3 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {editingId ? "Update Paper" : "Publish Paper"}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setTitle(""); setContent(""); }} 
                className="bg-red-500 text-white px-6 py-2 rounded font-bold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* LIST OF "MY" PAPERS ONLY */}
        <div className="space-y-6">
          {myPapers?.length === 0 ? (
            <p className="text-center text-gray-500 italic">You haven't published any papers yet.</p>
          ) : (
            myPapers?.map((paper) => (
              <div key={paper.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-gray-800">{paper.title}</h3>
                
                <div className="text-sm text-gray-500 mt-1 mb-4 flex gap-4">
                  <span>By: <strong className="text-blue-600">You</strong></span>
                  <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap">{paper.content}</p>

                {/* EDIT & DELETE BUTTONS */}
                <div className="mt-4 flex gap-3 border-t pt-4">
                  <button 
                    onClick={() => handleEdit(paper)} 
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(paper.id)} 
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}