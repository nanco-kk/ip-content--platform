import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { diagnoseAccount } from "@/lib/deepseek";

// GET: 获取最新账号诊断报告
export async function GET() {
  try {
    const latestDiagnosis = await prisma.accountDiagnosis.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latestDiagnosis) {
      return NextResponse.json({ hasData: false });
    }

    return NextResponse.json({
      hasData: true,
      ...latestDiagnosis,
      trafficSources: JSON.parse(latestDiagnosis.trafficSources || "{}"),
      topicSuggestions: latestDiagnosis.topicSuggestions
        ? JSON.parse(latestDiagnosis.topicSuggestions)
        : [],
    });
  } catch (error) {
    console.error("Failed to fetch diagnosis:", error);
    return NextResponse.json({ error: "Failed to fetch diagnosis" }, { status: 500 });
  }
}

// POST: 执行账号诊断分析
export async function POST(request: Request) {
  try {
    let body: { trafficSources?: Record<string, number>; period?: string; profileVisits?: number; images?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      // 没有 body 也完全可以，直接用空对象
    }
    const { trafficSources, period, profileVisits, images } = body;

    // 获取所有笔记及其流量数据
    const contents = await prisma.generatedContent.findMany({
      where: { status: "PUBLISHED" },
      include: { trafficData: true },
      orderBy: { publishDate: "desc" },
    });

    const notes = contents
      .filter((c) => c.trafficData)
      .map((c) => ({
        title: c.topic,
        contentType: c.trafficData!.contentType || "图文",
        views: c.trafficData!.views,
        impressions: c.trafficData!.impressions,
        clickRate: c.trafficData!.clickRate,
        likes: c.trafficData!.likes,
        comments: c.trafficData!.comments,
        favorites: c.trafficData!.favorites,
        newFollowers: c.trafficData!.newFollowers,
        shares: c.trafficData!.shares,
        avgWatchTime: c.trafficData!.avgWatchTime,
        danmaku: c.trafficData!.danmaku,
      }));

    if (notes.length === 0) {
      return NextResponse.json(
        { error: "没有可分析的笔记数据，请先导入" },
        { status: 400 }
      );
    }

    const totalViews = notes.reduce((s, n) => s + n.views, 0);
    const totalInteractions = notes.reduce(
      (s, n) => s + n.likes + n.comments + n.favorites + n.shares,
      0
    );
    const totalNewFollowers = notes.reduce((s, n) => s + n.newFollowers, 0);
    const totalImpressions = notes.reduce((s, n) => s + n.impressions, 0);

    const result = await diagnoseAccount({
      period: period || "全部数据",
      totalViews,
      totalInteractions,
      totalNewFollowers,
      totalProfileVisits: profileVisits || 0,
      totalPosts: notes.length,
      totalImpressions,
      trafficSources: trafficSources || {},
      notes,
      images: images || [],
    });

    // 保存诊断结果
    const diagnosis = await prisma.accountDiagnosis.create({
      data: {
        period: period || "全部数据",
        totalViews,
        totalInteractions,
        totalNewFollowers,
        totalProfileVisits: profileVisits || 0,
        totalPosts: notes.length,
        totalImpressions,
        trafficSources: JSON.stringify(trafficSources || {}),
        diagnosis: result.diagnosis,
        contentPlan: result.contentPlan,
        topicSuggestions: JSON.stringify(result.topicSuggestions),
        improvements: result.improvements,
      },
    });

    return NextResponse.json({
      ...result,
      id: diagnosis.id,
    });
  } catch (error) {
    console.error("Failed to diagnose account:", error);
    return NextResponse.json(
      { error: "Failed to diagnose account" },
      { status: 500 }
    );
  }
}
