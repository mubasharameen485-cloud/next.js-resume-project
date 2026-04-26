// src/app/api/register/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Apni dono files ko import kar rahe hain
import { studentKeys } from "@/lib/studentKeys";
import { teacherKeys } from "@/lib/teacherKeys";

const prisma = new PrismaClient();

// Unique Roll Number function (Wese hi rahega)
function generateRollNumber(role) {
  const randomNum = Math.floor(1000 + Math.random() * 9000); 
  return role === "student" ? `STD-${randomNum}` : `TCH-${randomNum}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, secretKey, className, subject } = body;

    // ==========================================
    // 1. FILE SE KEY CHECK KAREIN (VALIDATION)
    // ==========================================
    if (role === "student" && !studentKeys.includes(secretKey)) {
      return NextResponse.json({ message: "Student ki Key galat hai ya list mein nahi hai!" }, { status: 400 });
    }
    if (role === "teacher" && !teacherKeys.includes(secretKey)) {
      return NextResponse.json({ message: "Teacher ki Key galat hai ya list mein nahi hai!" }, { status: 400 });
    }

    // ==========================================
    // 2. DATABASE MEIN CHECK KAREIN KE KEY PEHLE USE TOH NAHI HUI?
    // ==========================================
    const isKeyAlreadyUsed = await prisma.user.findUnique({ where: { secretKey: secretKey } });
    if (isKeyAlreadyUsed) {
      return NextResponse.json({ message: "Yeh Key pehle hi koi use kar chuka hai! Bara-e-maherbani dusri key try karein." }, { status: 400 });
    }

    // 3. Email ki validation
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Yeh Email pehle se register hai." }, { status: 400 });
    }

    // 4. Password ko encrypt karein
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Roll Number Generate karein
    let rollNumber = generateRollNumber(role);
    let isUnique = false;
    
    while (!isUnique) {
      const existingRoll = await prisma.user.findUnique({ where: { rollNumber } });
      if (existingRoll) {
        rollNumber = generateRollNumber(role); 
      } else {
        isUnique = true; 
      }
    }

    // 6. User create karein aur 'secretKey' ko database mein save kar dein taake dobara use na ho
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        rollNumber,
        secretKey, // Yahan hum used key database mein daal rahe hain
        className: role === "student" ? className : null,
        subject: role === "teacher" ? subject : null,
      },
    });

    return NextResponse.json({ 
      message: "Account kamyabi se ban gaya!", 
      rollNumber: newUser.rollNumber 
    }, { status: 201 });

  } catch (error) {
    console.log("Registration Error:", error);
    return NextResponse.json({ message: "Server Error!" }, { status: 500 });
  }
}