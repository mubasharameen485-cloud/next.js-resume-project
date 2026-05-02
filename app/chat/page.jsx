// src/app/chat/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classFellows, setClassFellows] = useState([]);
  const[messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Ab default koi select nahi hoga (null rakha hai)
  const [selectedFellow, setSelectedFellow] = useState(null); 
  
  const messagesEndRef = useRef(null);

  // Security check
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

  // 2. Background Auto-Refresh (Polling) - Har 2 second baad
  useEffect(() => {
    if (!session?.user) return;

    const fetchMessages = () => {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  },[session]);

  // Auto-scroll jab naya message aaye
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Message Bhejne ka function
  const sendMessage = async () => {
    if (currentMessage.trim() === "" || !selectedFellow) return;

    const msgData = {
      senderEmail: session.user.email,
      senderName: session.user.name,
      receiverEmail: selectedFellow.email, // Jisko select kiya hai uska email
      text: currentMessage,
    };

    // UI mein fauran dikhane ke liye
    setMessages((prev) => [...prev, msgData]);
    setCurrentMessage(""); 

    // Database mein save karne ke liye
    await fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msgData),
    });
  };

  // Messages Filter Logic (Sirf mere aur selected dost ke darmiyan wali chat)
  const filteredMessages = messages.filter((msg) => {
    if (!selectedFellow) return false;
    return (
      (msg.senderEmail === session?.user?.email && msg.receiverEmail === selectedFellow.email) ||
      (msg.senderEmail === selectedFellow.email && msg.receiverEmail === session?.user?.email)
    );
  });

  if (status === "loading") return <div className="p-10 text-center text-black">Loading Chat...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      
      {/* LEFT SIDEBAR: Sirf Class Fellows ki List */}
      <div className="w-1/3 bg-white border-r p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600">My Class ({session?.user?.className})</h2>
        
        <h3 className="font-semibold text-gray-500 mb-3 border-b pb-2">Select a Class Fellow</h3>

        {classFellows.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aapki class mein abhi koi aur nahi hai.</p>
        ) : (
          classFellows.map((fellow) => {
            const isSelected = selectedFellow?.email === fellow.email;
            return (
              <div 
                key={fellow.email}
                onClick={() => setSelectedFellow(fellow)}
                className={`p-3 mb-2 cursor-pointer rounded transition-all flex justify-between items-center ${isSelected ? "bg-green-500 text-white shadow-md" : "bg-gray-50 hover:bg-gray-200 border"}`}
              >
                <div>
                  <p className="font-bold">{fellow.name}</p>
                  <p className={`text-xs ${isSelected ? "text-green-100" : "text-gray-500"}`}>{fellow.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold ${isSelected ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {fellow.rollNumber}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* RIGHT SIDE: Chat Box */}
      <div className="w-2/3 flex flex-col bg-gray-50 h-screen">
        
        {/* Agar kisi dost ko select nahi kiya toh yeh screen dikhao */}
        {!selectedFellow ? (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
            <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-500">Your Messages</h2>
            <p>Left side se kisi class fellow ko select karein aur chat shuru karein.</p>
          </div>
        ) : (
          /* Agar dost select kar liya hai toh Chat Box dikhao */
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 shadow border-b flex items-center">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl mr-3">
                {selectedFellow.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedFellow.name}</h2>
                <p className="text-xs text-gray-500">Roll No: {selectedFellow.rollNumber}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 text-sm italic">
                  Say hi to {selectedFellow.name}!
                </div>
              ) : (
                filteredMessages.map((msg, index) => {
                  const isMe = msg.senderEmail === session?.user?.email;
                  return (
                    <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-lg max-w-md shadow ${isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-white border text-black rounded-bl-none"}`}>
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
                placeholder={`Message ${selectedFellow.name}...`} 
                className="flex-1 border p-3 rounded-l-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button 
                onClick={sendMessage} 
                className="bg-blue-600 text-white px-8 py-3 rounded-r-lg font-bold hover:bg-blue-700 transition-all"
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