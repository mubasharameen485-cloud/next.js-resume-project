// src/app/api/dashboard-data/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Frontend se hum logged-in user ka email bhejenge
    const { email } = await request.json();

    // 1. Pehle database se is user ki poori detail nikalo (taake iski class pata chale)
    const currentUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User nahi mila" }, { status: 404 });
    }

    let classFellows =[];
    
    // 2. Agar yeh user 'student' hai, toh iske class fellows dhoondo
    if (currentUser.role === "student") {
      classFellows = await prisma.user.findMany({
        where: {
          role: "student", // Sirf students chahiye
          className: currentUser.className, // Class same honi chahiye
          email: { not: currentUser.email }, // Lekin khud is user ka naam list mein na aaye
        },
        select: { name: true, email: true, rollNumber: true }, // Sirf zaroori data bhejo (Password waghaira nahi)
      });
    }

    // 3. Saare Teachers ka data nikalo
    const teachers = await prisma.user.findMany({
      where: { role: "teacher" },
      select: { name: true, email: true, subject: true }, // Teachers ka subject zaroori hai
    });

    // 4. Dono cheezein frontend ko bhej do
    return NextResponse.json({ 
      classFellows: classFellows, 
      teachers: teachers,
      myClass: currentUser.className // User ko uski class dikhane ke liye
    }, { status: 200 });

  } catch (error) {
    console.log("Dashboard Data Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}