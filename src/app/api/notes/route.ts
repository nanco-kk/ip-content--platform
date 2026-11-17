import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 获取所有笔记及其流量数据
export async function GET() {
  try {
    const contents = await prisma.generatedContent.findMany({
      where: { status: "PUBLISHED" },
      include: { trafficData: true },
      orderBy: { publishDate: "desc" },
    });

    const notes = contents
      .filter((c) => c.trafficData)
      .map((c) => ({
        id: c.id,
        title: c.topic,
        publishTime: c.publishDate
          ? new Date(c.publishDate).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        contentType: c.trafficData!.contentType || "图文",
        impressions: c.trafficData!.impressions,
        views: c.trafficData!.views,
        clickRate: c.trafficData!.clickRate,
        likes: c.trafficData!.likes,
        comments: c.trafficData!.comments,
        favorites: c.trafficData!.favorites,
        newFollowers: c.trafficData!.newFollowers,
        shares: c.trafficData!.shares,
        avgWatchTime: c.trafficData!.avgWatchTime,
        danmaku: c.trafficData!.danmaku,
      }));

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ notes: [] }, { status: 200 });
  }
}
