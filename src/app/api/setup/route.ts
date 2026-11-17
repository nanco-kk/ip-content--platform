import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 一键初始化数据库（首次部署后访问一次即可）
export async function GET() {
  try {
    // 先测试数据库连接
    const prisma = new PrismaClient();
    
    // 尝试执行一个简单查询，如果表不存在会报错
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      // 数据库连接正常但可能表不存在
    }

    // 使用 prisma db push 创建表结构
    // 注意：在 Vercel 环境下，prisma CLI 可能不在 PATH 中
    let result = "";
    try {
      const { stdout, stderr } = await execAsync("npx prisma db push --skip-generate", {
        cwd: process.cwd(),
        timeout: 60000,
      });
      result = stdout + stderr;
    } catch (execError: any) {
      result = `Prisma push output: ${execError.stdout || ""} ${execError.stderr || ""}`;
    }

    // 验证表是否创建成功
    try {
      const tables = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      ` as Array<{ tablename: string }>;
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        message: "数据库初始化完成",
        tables: tables.map(t => t.tablename),
        details: result,
      });
    } catch (verifyError: any) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        message: "表创建可能失败",
        error: verifyError.message,
        details: result,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "数据库初始化失败",
      error: error.message,
    }, { status: 500 });
  }
}
