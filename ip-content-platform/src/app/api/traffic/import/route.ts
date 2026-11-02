import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

interface XHSNoteRow {
  title: string;
  publishTime: string;
  contentType: string;
  impressions: number;
  views: number;
  clickRate: number;
  likes: number;
  comments: number;
  favorites: number;
  newFollowers: number;
  shares: number;
  avgWatchTime: number;
  danmaku: number;
}

// 解析小红书 Excel 文件
function parseXHSExcel(rows: Record<string, unknown>[]): XHSNoteRow[] {
  return rows.map((row) => {
    const title = String(row["笔记标题"] || row["标题"] || "未命名笔记");
    const publishTime = String(row["首次发布时间"] || row["发布时间"] || "");
    const contentType = String(row["体裁"] || row["类型"] || "图文");
    const impressions = Number(row["曝光"] || 0);
    const views = Number(row["观看量"] || 0);
    const clickRate = parseFloat(String(row["封面点击率"] || "0")) || 0;
    const likes = Number(row["点赞"] || 0);
    const comments = Number(row["评论"] || 0);
    const favorites = Number(row["收藏"] || 0);
    const newFollowers = Number(row["涨粉"] || 0);
    const shares = Number(row["分享"] || 0);
    const avgWatchTime = Number(row["人均观看时长"] || 0);
    const danmaku = Number(row["弹幕"] || row["弹幕"] || 0);

    return {
      title,
      publishTime,
      contentType,
      impressions,
      views,
      clickRate,
      likes,
      comments,
      favorites,
      newFollowers,
      shares,
      avgWatchTime,
      danmaku,
    };
  });
}

// POST: 从小红书 Excel 批量导入笔记数据
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, trafficSources, period, profileVisits } = body as {
      items: XHSNoteRow[];
      trafficSources?: Record<string, number>;
      period?: string;
      profileVisits?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No data to import" }, { status: 400 });
    }

    // 查找或创建"小红书导入"系列
    let series = await prisma.series.findFirst({ where: { name: "小红书导入" } });
    if (!series) {
      series = await prisma.series.create({
        data: { name: "小红书导入", description: "从小红书创作者中心导入的笔记", icon: "📕" },
      });
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // 解析发布时间 "2026年08月29日21时12分28秒" -> Date
        let publishDate: Date | null = null;
        if (item.publishTime) {
          const match = item.publishTime.match(
            /(\d{4})年(\d{2})月(\d{2})日(\d{2})时(\d{2})分(\d{2})秒/
          );
          if (match) {
            publishDate = new Date(
              parseInt(match[1]),
              parseInt(match[2]) - 1,
              parseInt(match[3]),
              parseInt(match[4]),
              parseInt(match[5]),
              parseInt(match[6])
            );
          }
        }

        const content = await prisma.generatedContent.create({
          data: {
            seriesId: series.id,
            topic: item.title,
            titles: JSON.stringify([item.title]),
            content: "",
            coverDescription: "",
            tags: JSON.stringify([]),
            status: "PUBLISHED",
            publishDate: publishDate || new Date(),
          },
        });

        await prisma.trafficData.create({
          data: {
            contentId: content.id,
            contentType: item.contentType,
            views: item.views,
            impressions: item.impressions,
            clickRate: item.clickRate,
            likes: item.likes,
            comments: item.comments,
            favorites: item.favorites,
            newFollowers: item.newFollowers,
            shares: item.shares,
            avgWatchTime: item.avgWatchTime,
            danmaku: item.danmaku,
          },
        });

        successCount++;
      } catch (err) {
        errors.push(`Failed: ${item.title} - ${err instanceof Error ? err.message : "unknown"}`);
      }
    }

    // 如果有流量来源数据，创建账号诊断记录
    if (trafficSources && period) {
      const totalViews = items.reduce((s, i) => s + i.views, 0);
      const totalInteractions = items.reduce(
        (s, i) => s + i.likes + i.comments + i.favorites + i.shares,
        0
      );
      const totalNewFollowers = items.reduce((s, i) => s + i.newFollowers, 0);
      const totalImpressions = items.reduce((s, i) => s + i.impressions, 0);

      await prisma.accountDiagnosis.create({
        data: {
          period,
          totalViews,
          totalInteractions,
          totalNewFollowers,
          totalProfileVisits: profileVisits || 0,
          totalPosts: items.length,
          totalImpressions,
          trafficSources: JSON.stringify(trafficSources),
        },
      });
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Failed to import:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}

// GET: 下载小红书格式导入模板
export async function GET() {
  const template = [
    ["笔记标题", "首次发布时间", "体裁", "曝光", "观看量", "封面点击率", "点赞", "评论", "收藏", "涨粉", "分享", "人均观看时长", "弹幕"],
    [
      "示例：港硕住深圳2.0｜独居太爽了",
      "2026年08月29日21时12分28秒",
      "图文",
      1288, 245, 0.19, 13, 13, 3, 0, 0, 19, 0,
    ],
    [
      "示例：深圳租房亲身经验",
      "2026年08月27日21时01分34秒",
      "视频",
      9847, 813, 0.038, 28, 4, 15, 4, 5, 66, 0,
    ],
  ];

  // 小红书格式：第一行是标题提示行
  const fullData = [
    ["最多导出排序后前1000条笔记"],
    ...template,
  ];

  const ws = XLSX.utils.aoa_to_sheet(fullData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // 设置列宽
  ws["!cols"] = [
    { wch: 40 }, { wch: 30 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 14 }, { wch: 8 },
  ];

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="小红书笔记导入模板.xlsx"',
    },
  });
}
