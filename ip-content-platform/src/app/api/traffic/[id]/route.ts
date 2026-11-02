import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取内容的流量数据
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trafficData = await prisma.trafficData.findUnique({
      where: { contentId: params.id },
    });

    return NextResponse.json(trafficData || null);
  } catch (error) {
    console.error("Failed to fetch traffic data:", error);
    return NextResponse.json(
      { error: "Failed to fetch traffic data" },
      { status: 500 }
    );
  }
}

// 创建或更新流量数据
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { views, likes, comments, shares, favorites } = body;

    const content = await prisma.generatedContent.findUnique({
      where: { id: params.id },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // 检查是否已有流量数据
    const existingTraffic = await prisma.trafficData.findUnique({
      where: { contentId: params.id },
    });

    let trafficData;
    if (existingTraffic) {
      trafficData = await prisma.trafficData.update({
        where: { id: existingTraffic.id },
        data: {
          views: views || 0,
          likes: likes || 0,
          comments: comments || 0,
          shares: shares || 0,
          favorites: favorites || 0,
        },
      });
    } else {
      trafficData = await prisma.trafficData.create({
        data: {
          contentId: params.id,
          views: views || 0,
          likes: likes || 0,
          comments: comments || 0,
          shares: shares || 0,
          favorites: favorites || 0,
        },
      });
    }

    return NextResponse.json(trafficData);
  } catch (error) {
    console.error("Failed to update traffic data:", error);
    return NextResponse.json(
      { error: "Failed to update traffic data" },
      { status: 500 }
    );
  }
}
