import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { diagnosisChat } from "@/lib/deepseek";

// POST: 诊断对话 chatbot
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, diagnosisId } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      diagnosisId?: string;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // 获取最新的诊断结果作为上下文
    let diagnosisContext = "";
    if (diagnosisId) {
      const diagnosis = await prisma.accountDiagnosis.findUnique({
        where: { id: diagnosisId },
      });
      if (diagnosis) {
        diagnosisContext = [
          `整体诊断：${diagnosis.diagnosis || "无"}`,
          `内容规划：${diagnosis.contentPlan || "无"}`,
          `选题建议：${diagnosis.topicSuggestions || "无"}`,
          `改进建议：${diagnosis.improvements || "无"}`,
          `统计周期：${diagnosis.period}`,
          `观看数：${diagnosis.totalViews} | 互动数：${diagnosis.totalInteractions} | 涨粉：${diagnosis.totalNewFollowers} | 发布数：${diagnosis.totalPosts}`,
        ].join("\n\n");
      }
    } else {
      // 如果没有指定 ID，获取最新的诊断
      const latest = await prisma.accountDiagnosis.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (latest) {
        diagnosisContext = [
          `整体诊断：${latest.diagnosis || "无"}`,
          `内容规划：${latest.contentPlan || "无"}`,
          `选题建议：${latest.topicSuggestions || "无"}`,
          `改进建议：${latest.improvements || "无"}`,
          `统计周期：${latest.period}`,
          `观看数：${latest.totalViews} | 互动数：${latest.totalInteractions} | 涨粉：${latest.totalNewFollowers} | 发布数：${latest.totalPosts}`,
        ].join("\n\n");
      }
    }

    if (!diagnosisContext) {
      return NextResponse.json({
        reply: "暂无诊断数据，请先在账号诊断页运行「一键诊断」，之后我们就可以基于诊断结果进行对话了。",
      });
    }

    const reply = await diagnosisChat({
      diagnosisContext,
      messages,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Failed to chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chat" },
      { status: 500 }
    );
  }
}
