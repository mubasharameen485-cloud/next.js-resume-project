// src/app/teacher-chat/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function TeacherChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const[teachersList, setTeachersList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  
  const [selectedTeacher, setSelectedTeacher] = useState(null); 
  const messagesEndRef = useRef(null);

  // Security: Agar login nahi hai ya role 'teacher' nahi hai toh wapas bhej do
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user && session.user.role !== "teacher") {
      router.push("/dashboard"); // Agar student ghalti se aa jaye toh wapas bhej do
    }
  }, [status, session, router]);

  // 1. Saare Teachers Mangwane ka logic
  useEffect(() => {
    if (session?.user?.role === "teacher") {
      fetch("/api/dashboard-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      .then(res => res.json())
      .then(data => {
        // Khud apna naam list se nikal do
        const otherTeachers = (data.teachers ||[]).filter(t => t.email !== session.user.email);
        setTeachersList(otherTeachers);
      });
    }
  }, [session]);

  // 2. Background Auto-Refresh (Polling)
  useEffect(() => {
    if (!session?.user || session.user.role !== "teacher") return;

    const fetchMessages = () => {
      fetch("/api/teacher-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }), 
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.log("Fetch error", err));
    };

    fetchMessages(); 
    const interval = setInterval(fetchMessages, 2000); 

    return () => clearInterval(interval);
  }, [session]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Message Bhejne ka function
  const sendMessage = async () => {
    if (currentMessage.trim() === "" || !selectedTeacher) return;

    const msgData = {
      senderEmail: session.user.email,
      senderName: session.user.name,
      receiverEmail: selectedTeacher.email,
      text: currentMessage,
    };

    setMessages((prev) => [...prev, msgData]);
    setCurrentMessage(""); 

    await fetch("/api/teacher-messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msgData),
    });
  };

  // Messages Filter Logic
  const filteredMessages = messages.filter((msg) => {
    if (!selectedTeacher) return false;
    return (
      (msg.senderEmail === session?.user?.email && msg.receiverEmail === selectedTeacher.email) ||
      (msg.senderEmail === selectedTeacher.email && msg.receiverEmail === session?.user?.email)
    );
  });

  if (status === "loading") return <div className="p-10 text-center text-black">Loading Teachers Lounge...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      
      {/* LEFT SIDEBAR: Teachers List */}
      <div className="w-1/3 bg-white border-r p-4 shadow-md overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Teachers Lounge</h2>
        
        <h3 className="font-semibold text-gray-500 mb-3 border-b pb-2">Select a Colleague</h3>

        {teachersList.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Abhi koi aur teacher register nahi hai.</p>
        ) : (
          teachersList.map((teacher) => {
            const isSelected = selectedTeacher?.email === teacher.email;
            return (
              <div 
                key={teacher.email}
                onClick={() => setSelectedTeacher(teacher)}
                className={`p-3 mb-2 cursor-pointer rounded transition-all flex justify-between items-center ${isSelected ? "bg-purple-600 text-white shadow-md" : "bg-purple-50 hover:bg-purple-100 border border-purple-100"}`}
              >
                <div>
                  <p className="font-bold">{teacher.name}</p>
                  <p className={`text-xs ${isSelected ? "text-purple-200" : "text-gray-500"}`}>{teacher.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold ${isSelected ? "bg-purple-800 text-white" : "bg-purple-200 text-purple-800"}`}>
                  {teacher.subject}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* RIGHT SIDE: Chat Box */}
      <div className="w-2/3 flex flex-col bg-gray-50 h-screen">
        
        {!selectedTeacher ? (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
            <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-500">Teacher Discussions</h2>
            <p>Left side se kisi teacher ko select karein aur discussion shuru karein.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 shadow border-b flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-3">
                {selectedTeacher.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedTeacher.name}</h2>
                <p className="text-xs text-gray-500">Subject: {selectedTeacher.subject}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 text-sm italic">
                  Start a conversation with {selectedTeacher.name}!
                </div>
              ) : (
                filteredMessages.map((msg, index) => {
                  const isMe = msg.senderEmail === session?.user?.email;
                  return (
                    <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-lg max-w-md shadow ${isMe ? "bg-purple-600 text-white rounded-br-none" : "bg-white border text-black rounded-bl-none"}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message ${selectedTeacher.name}...`} 
                className="flex-1 border p-3 rounded-l-lg outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button 
                onClick={sendMessage} 
                className="bg-purple-700 text-white px-8 py-3 rounded-r-lg font-bold hover:bg-purple-800 transition-all"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}