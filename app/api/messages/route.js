// src/app/api/messages/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Purane Messages GET karne ke liye
export async function POST(request) {
  try {
    const { email } = await request.json(); 

    // Database se sirf wo messages nikalo jahan yeh user ya toh Sender hai ya Receiver
    const messages = await prisma.message.findMany({
      where: {
        OR:[
          { senderEmail: email },
          { receiverEmail: email }
        ]
      },
      orderBy: { createdAt: "asc" } // Puraane upar, naye neechay
    });
    
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.log("Fetch Error:", error);
    return NextResponse.json({ message: "Error fetching messages" }, { status: 500 });
  }
}

// 2. Naya Message SAVE karne ke liye
export async function PUT(request) {
  try {
    const data = await request.json();

    // Sender ki class database se nikal rahe hain
    const user = await prisma.user.findUnique({ where: { email: data.senderEmail } });

    const newMessage = await prisma.message.create({
      data: {
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        receiverEmail: data.receiverEmail, // Jisko message bheja ja raha hai
        className: user.className || "Unknown",
        text: data.text,
      }
    });
    return NextResponse.json(newMessage, { status: 200 });
  } catch (error) {
    console.log("Save Error:", error);
    return NextResponse.json({ message: "Error saving message" }, { status: 500 });
  }
}