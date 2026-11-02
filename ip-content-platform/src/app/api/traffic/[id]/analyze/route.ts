import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeTraffic } from "@/lib/deepseek";

// 分析流量数据并生成运营建议和衍生选题
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.generatedContent.findUnique({
      where: { id: params.id },
      include: {
        trafficData: true,
        series: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    if (!content.trafficData) {
      return NextResponse.json(
        { error: "No traffic data found for this content" },
        { status: 400 }
      );
    }

    const titles = JSON.parse(content.titles || "[]");
    const result = await analyzeTraffic({
      title: titles[0] || content.topic,
      contentType: "article",
      views: content.trafficData.views,
      impressions: content.trafficData.impressions || 0,
      clickRate: content.trafficData.clickRate || 0,
      likes: content.trafficData.likes,
      comments: content.trafficData.comments,
      favorites: content.trafficData.favorites,
      newFollowers: content.trafficData.newFollowers,
      shares: content.trafficData.shares,
      avgWatchTime: content.trafficData.avgWatchTime || 0,
      danmaku: content.trafficData.danmaku || 0,
    });

    // 更新流量数据中的分析结果
    await prisma.trafficData.update({
      where: { id: content.trafficData.id },
      data: {
        analysis: result.analysis,
      },
    });

    // 创建衍生选题
    const derivedTopics = await Promise.all(
      result.derivedTopics.map(async (topicTitle) => {
        return prisma.derivedTopic.create({
          data: {
            contentId: params.id,
            title: topicTitle,
            description: "",
            hotPoint: "",
          },
        });
      })
    );

    return NextResponse.json({
      analysis: result.analysis,
      derivedTopics,
    });
  } catch (error) {
    console.error("Failed to analyze traffic data:", error);
    return NextResponse.json(
      { error: "Failed to analyze traffic data" },
      { status: 500 }
    );
  }
}
