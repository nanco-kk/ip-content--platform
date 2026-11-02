import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取系列的参考文案列表
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const references = await prisma.referenceCopy.findMany({
      where: { seriesId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(references);
  } catch (error) {
    console.error("Failed to fetch reference copies:", error);
    return NextResponse.json(
      { error: "Failed to fetch reference copies" },
      { status: 500 }
    );
  }
}

// 添加参考文案
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const reference = await prisma.referenceCopy.create({
      data: {
        seriesId: params.id,
        title,
        content,
      },
    });

    return NextResponse.json(reference, { status: 201 });
  } catch (error) {
    console.error("Failed to create reference copy:", error);
    return NextResponse.json(
      { error: "Failed to create reference copy" },
      { status: 500 }
    );
  }
}

// 删除参考文案
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { refId } = body;

    if (!refId) {
      return NextResponse.json(
        { error: "Reference ID is required" },
        { status: 400 }
      );
    }

    await prisma.referenceCopy.delete({
      where: { id: refId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete reference copy:", error);
    return NextResponse.json(
      { error: "Failed to delete reference copy" },
      { status: 500 }
    );
  }
}
