import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取单个系列详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: params.id },
      include: {
        referenceCopies: {
          orderBy: { createdAt: "desc" },
        },
        generatedContents: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

// 更新系列
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    const series = await prisma.series.update({
      where: { id: params.id },
      data: {
        name,
        description,
        icon,
      },
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error("Failed to update series:", error);
    return NextResponse.json(
      { error: "Failed to update series" },
      { status: 500 }
    );
  }
}

// 删除系列
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.series.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Series deleted successfully" });
  } catch (error) {
    console.error("Failed to delete series:", error);
    return NextResponse.json(
      { error: "Failed to delete series" },
      { status: 500 }
    );
  }
}
