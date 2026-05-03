// src/app/api/papers/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. READ: Papers mangwane ke liye (Smart GET)
export async function GET(request) {
  try {
    // URL se email check kar rahe hain
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let papers;

    if (email) {
      // Agar email aayi hai (Yani user apne /papers page par hai), toh sirf uske papers bhejo
      papers = await prisma.researchPaper.findMany({
        where: { authorEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Agar email nahi aayi (Yani user /explore page par hai), toh sab ke papers bhejo
      papers = await prisma.researchPaper.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(papers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching papers" }, { status: 500 });
  }
}

// 2. CREATE: Naya paper publish karne ke liye
export async function POST(request) {
  try {
    const data = await request.json();
    const newPaper = await prisma.researchPaper.create({ data });
    return NextResponse.json(newPaper, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating paper" }, { status: 500 });
  }
}

// 3. UPDATE: Paper ko edit karne ke liye
export async function PUT(request) {
  try {
    const { id, title, content } = await request.json();
    const updatedPaper = await prisma.researchPaper.update({
      where: { id },
      data: { title, content },
    });
    return NextResponse.json(updatedPaper, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating paper" }, { status: 500 });
  }
}

// 4. DELETE: Paper ko delete karne ke liye
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.researchPaper.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting paper" }, { status: 500 });
  }
}