import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeWritingStyle } from "@/lib/deepseek";

// 分析系列写作风格
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: params.id },
      include: {
        referenceCopies: true,
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    if (series.referenceCopies.length < 2) {
      return NextResponse.json(
        { error: "At least 2 reference copies are required for style analysis" },
        { status: 400 }
      );
    }

    const referenceContents = series.referenceCopies.map((ref) => ref.content);
    const styleAnalysis = await analyzeWritingStyle(referenceContents);

    const updatedSeries = await prisma.series.update({
      where: { id: params.id },
      data: {
        styleAnalysis,
      },
    });

    return NextResponse.json({
      styleAnalysis,
      series: updatedSeries,
    });
  } catch (error) {
    console.error("Failed to analyze writing style:", error);
    return NextResponse.json(
      { error: "Failed to analyze writing style" },
      { status: 500 }
    );
  }
}
