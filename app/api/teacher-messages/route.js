// src/app/api/teacher-messages/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Purane Messages GET karne ke liye
export async function POST(request) {
  try {
    const { email } = await request.json(); 

    // Database se sirf wo messages nikalo jahan yeh Teacher ya toh Sender hai ya Receiver
    const messages = await prisma.message.findMany({
      where: {
        OR:[
          { senderEmail: email },
          { receiverEmail: email }
        ]
      },
      orderBy: { createdAt: "asc" }
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

    const newMessage = await prisma.message.create({
      data: {
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        receiverEmail: data.receiverEmail, 
        className: "TeacherChat", // Special tag sirf teachers ke liye
        text: data.text,
      }
    });
    return NextResponse.json(newMessage, { status: 200 });
  } catch (error) {
    console.log("Save Error:", error);
    return NextResponse.json({ message: "Error saving message" }, { status: 500 });
  }
}