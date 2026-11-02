import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取所有系列
export async function GET() {
  try {
    const series = await prisma.series.findMany({
      include: {
        _count: {
          select: {
            referenceCopies: true,
            generatedContents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

// 创建新系列
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Series name is required" },
        { status: 400 }
      );
    }

    const series = await prisma.series.create({
      data: {
        name,
        description: description || "",
        icon: icon || "📝",
      },
    });

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error("Failed to create series:", error);
    return NextResponse.json(
      { error: "Failed to create series" },
      { status: 500 }
    );
  }
}
