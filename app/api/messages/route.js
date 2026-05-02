// src/app/api/messages/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Purane Messages GET karne ke liye
export async function POST(request) {
  try {
    const { email } = await request.json(); // Frontend se sirf email lenge

    // Database se user ki class confirm karo
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.className) return NextResponse.json([], { status: 200 });

    // Us class ke messages nikal kar bhejo
    const messages = await prisma.message.findMany({
      where: { className: user.className },
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

    // Database se sender ki class nikalo (taake undefined ka error na aaye)
    const user = await prisma.user.findUnique({ where: { email: data.senderEmail } });

    const newMessage = await prisma.message.create({
      data: {
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        receiverEmail: data.receiverEmail,
        className: user.className, // Database se li hui pakki class
        text: data.text,
      }
    });
    return NextResponse.json(newMessage, { status: 200 });
  } catch (error) {
    console.log("Save Error:", error);
    return NextResponse.json({ message: "Error saving message" }, { status: 500 });
  }
}