// src/app/chat/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const[classFellows, setClassFellows] = useState([]);
  const [messages, setMessages] = useState([]);
  const[currentMessage, setCurrentMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState("GROUP"); 
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // 1. Class Fellows Mangwane ka logic
  useEffect(() => {
    if (session?.user) {
      fetch("/api/dashboard-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      .then(res => res.json())
      .then(data => setClassFellows(data.classFellows || []));
    }
  }, [session]);

  // 2. Background Auto-Refresh (Polling)
  useEffect(() => {
    if (!session?.user) return;

    const fetchMessages = () => {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // YAHAN CHANGE KIYA HAI: Ab hum sirf email bhej rahe hain
        body: JSON.stringify({ email: session.user.email }), 
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
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
    if (currentMessage.trim() === "") return;

    const msgData = {
      senderEmail: session.user.email,
      senderName: session.user.name,
      receiverEmail: selectedChat,
      text: currentMessage,
    };

    // Fauran screen par dikhane ke liye
    setMessages((prev) => [...prev, msgData]);
    setCurrentMessage(""); 

    // Database mein save karne ke liye
    await fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msgData),
    });
  };

  // Messages Filter Logic
  const filteredMessages = messages.filter((msg) => {
    if (selectedChat === "GROUP") {
      return msg.receiverEmail === "GROUP";
    } else {
      return (
        (msg.senderEmail === session?.user?.email && msg.receiverEmail === selectedChat) ||
        (msg.senderEmail === selectedChat && msg.receiverEmail === session?.user?.email)
      );
    }
  });

  if (status === "loading") return <div className="p-10 text-center text-black">Loading Chat...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-white border-r p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Chats</h2>
        
        <div 
          onClick={() => setSelectedChat("GROUP")}
          className={`p-3 mb-2 cursor-pointer rounded font-bold transition-all ${selectedChat === "GROUP" ? "bg-blue-500 text-white shadow" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          🏫 Class Group Chat
        </div>

        <hr className="my-4" />
        <h3 className="font-semibold text-gray-500 mb-2">Class Fellows</h3>

        {classFellows.map((fellow) => (
          <div 
            key={fellow.email}
            onClick={() => setSelectedChat(fellow.email)}
            className={`p-3 mb-2 cursor-pointer rounded transition-all ${selectedChat === fellow.email ? "bg-green-500 text-white shadow" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            {fellow.name} <span className="text-xs block opacity-70">{fellow.rollNumber}</span>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE: Chat Box */}
      <div className="w-2/3 flex flex-col bg-gray-50 h-screen">
        
        <div className="bg-white p-4 shadow border-b">
          <h2 className="text-xl font-bold">
            {selectedChat === "GROUP" ? "🏫 Class Group Chat" : `Chatting with: ${classFellows.find(f => f.email === selectedChat)?.name || ""}`}
          </h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {filteredMessages.map((msg, index) => {
            const isMe = msg.senderEmail === session?.user?.email;
            return (
              <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-lg max-w-md shadow ${isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-white border text-black rounded-bl-none"}`}>
                  {selectedChat === "GROUP" && !isMe && (
                    <span className="text-xs font-bold block text-blue-600 mb-1">{msg.senderName}</span>
                  )}
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t flex">
          <input 
            type="text" 
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..." 
            className="flex-1 border p-3 rounded-l-lg outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-8 py-3 rounded-r-lg font-bold hover:bg-blue-700 transition-all">
            Send
          </button>
        </div>

      </div>
    </div>
  );
}