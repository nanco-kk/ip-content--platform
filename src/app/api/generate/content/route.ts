import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateContent } from "@/lib/deepseek";

// 生成内容底稿
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seriesId, topic, contentType = "article", requirements } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "topic is required" },
        { status: 400 }
      );
    }

    let writingStyle = "";
    let savedSeriesId = seriesId || null;
    let seriesName: string | undefined = undefined;
    let referenceCopies: string[] = [];

    if (seriesId) {
      // 系列内容 — 使用该系列的写作风格 + 参考文案原文
      const series = await prisma.series.findUnique({
        where: { id: seriesId },
        include: { referenceCopies: true },
      });

      if (!series) {
        return NextResponse.json(
          { error: "Series not found" },
          { status: 404 }
        );
      }

      seriesName = series.name;
      writingStyle = series.styleAnalysis || "亲切自然的分享风格，内容详实有深度，语言细腻有温度。";
      referenceCopies = series.referenceCopies.map((r) => r.content);
    } else {
      // 单篇内容 — 学习所有系列的语言表述风格 + 所有参考文案
      const allSeries = await prisma.series.findMany({
        where: { styleAnalysis: { not: null } },
        include: { referenceCopies: true },
      });

      if (allSeries.length > 0) {
        writingStyle = allSeries
          .map((s) => `【${s.name}系列风格】${s.styleAnalysis}`)
          .join("\n\n");
        // 收集所有系列的参考文案（每个系列最多取1篇，避免token过多）
        referenceCopies = allSeries
          .filter((s) => s.referenceCopies.length > 0)
          .map((s) => s.referenceCopies[0].content);
      } else {
        writingStyle = "";
      }
    }

    const result = await generateContent({
      styleAnalysis: writingStyle,
      topic,
      contentType,
      requirements: requirements || undefined,
      referenceCopies,
      seriesName,
    });

    // 保存到数据库
    const generatedContent = await prisma.generatedContent.create({
      data: {
        seriesId: savedSeriesId,
        topic,
        titles: JSON.stringify(result.titles),
        content: result.content,
        coverDescription: result.coverDescription,
        tags: JSON.stringify(result.tags),
        status: "DRAFT",
      },
    });

    return NextResponse.json({
      id: generatedContent.id,
      titles: result.titles,
      content: result.content,
      coverDescription: result.coverDescription,
      tags: result.tags,
    });
  } catch (error) {
    console.error("Failed to generate content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
