"use client";

import { Card, Row, Col, Button, Divider, Empty, Spin } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  LinkOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto" style={{ padding: "0 8px" }}>
      {/* 报头 */}
      <div className="text-center mb-8">
        <div style={{ fontSize: "14px", color: "#b3a288", letterSpacing: "0.3em", marginBottom: "8px" }}>
          CONTENT HUB · 内容中台
        </div>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#3d2e1f",
            margin: "0 0 8px 0",
            fontFamily: '"Noto Serif SC", Georgia, serif',
            letterSpacing: "0.05em",
          }}
        >
          创作者的个人报
        </h1>
        <div style={{ fontSize: "14px", color: "#8b7355", fontStyle: "italic" }}>
          你的每一篇内容，都值得被认真对待
        </div>
        <Divider style={{ borderColor: "#d4c5a9", borderWidth: "2px 0 0 0", marginTop: "20px" }} />
      </div>

      {/* 账号 IP 形象卡片 */}
      <Card className="warm-card mb-6" bordered>
        <div className="flex items-center gap-6">
          {/* 真实头像 */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              border: "3px solid #d4a574",
              boxShadow: "0 2px 8px rgba(198, 93, 58, 0.15)",
            }}
          >
            <img
              src="/avatar.jpg"
              alt="南柯 Nanco"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          {/* 账号信息 */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#3d2e1f",
                margin: "0 0 4px 0",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              南柯 Nanco
            </h3>
            <div
              style={{
                fontSize: "14px",
                color: "#8b7355",
                fontFamily: '"Noto Serif SC", Georgia, serif',
                marginBottom: "10px",
              }}
            >
              我的南柯一梦，是热爱万物的理想主义
            </div>
            <div className="flex gap-4 flex-wrap">
              <span
                style={{
                  fontSize: "13px",
                  color: "#5a4632",
                  borderLeft: "2px solid #d4a574",
                  paddingLeft: "8px",
                }}
              >
                港大 Econ · 深圳 · 22岁
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#5a4632",
                  borderLeft: "2px solid #d4a574",
                  paddingLeft: "8px",
                }}
              >
                小红书 · 1188 粉丝 · 1.7万 获赞
              </span>
            </div>
          </div>
        </div>

        {/* 小红书跳转卡片 */}
        <Divider style={{ borderColor: "#e0d5c6", margin: "20px 0" }} />
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <a
              href="https://xhslink.cn/o/AYhXEFbKlGT"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "rgba(198, 93, 58, 0.05)",
                  borderRadius: "6px",
                  border: "1px solid rgba(198, 93, 58, 0.15)",
                  transition: "background 0.2s",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(198, 93, 58, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(198, 93, 58, 0.05)";
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "#ff2442",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>红</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#3d2e1f",
                      fontFamily: '"Noto Serif SC", Georgia, serif',
                    }}
                  >
                    我的小红书主页
                  </div>
                  <div style={{ fontSize: "11px", color: "#8b7355", marginTop: "1px" }}>
                    点击查看最新内容
                  </div>
                </div>
                <ArrowRightOutlined style={{ color: "#c65d3a", fontSize: "12px" }} />
              </div>
            </a>
          </Col>
          <Col span={12}>
            <a
              href="https://creator.xiaohongshu.com/statistics/account/v2?source=official"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "rgba(125, 157, 110, 0.05)",
                  borderRadius: "6px",
                  border: "1px solid rgba(125, 157, 110, 0.15)",
                  transition: "background 0.2s",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(125, 157, 110, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(125, 157, 110, 0.05)";
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "#ff2442",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <BarChartOutlined style={{ color: "#fff", fontSize: "16px" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#3d2e1f",
                      fontFamily: '"Noto Serif SC", Georgia, serif',
                    }}
                  >
                    小红书创作后台
                  </div>
                  <div style={{ fontSize: "11px", color: "#8b7355", marginTop: "1px" }}>
                    数据统计 · 笔记管理
                  </div>
                </div>
                <ArrowRightOutlined style={{ color: "#7d9d6e", fontSize: "12px" }} />
              </div>
            </a>
          </Col>
        </Row>
      </Card>

      {/* 快速操作 */}
      <Row gutter={[12, 12]}>
        <Col span={6}>
          <Card
            className="warm-card"
            bordered
            hoverable
            onClick={() => router.push("/create")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <EditOutlined style={{ fontSize: "32px", color: "#c65d3a", marginBottom: "12px" }} />
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#3d2e1f",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              内容创作
            </div>
            <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
              AI 生成完整内容底稿
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="warm-card"
            bordered
            hoverable
            onClick={() => router.push("/series")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <LinkOutlined style={{ fontSize: "32px", color: "#d4a574", marginBottom: "12px" }} />
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#3d2e1f",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              系列管理
            </div>
            <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
              风格分析 · 参考文案
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="warm-card"
            bordered
            hoverable
            onClick={() => router.push("/analytics")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <EyeOutlined style={{ fontSize: "32px", color: "#d4a574", marginBottom: "12px" }} />
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#3d2e1f",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              数据分析
            </div>
            <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
              导入笔记 · 流量分析
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="warm-card"
            bordered
            hoverable
            onClick={() => router.push("/diagnosis")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <ThunderboltOutlined style={{ fontSize: "32px", color: "#7d9d6e", marginBottom: "12px" }} />
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#3d2e1f",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              账号诊断
            </div>
            <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
              AI 深度分析 · 对话追问
            </div>
          </Card>
        </Col>
      </Row>

      {/* 底部署名 */}
      <div className="text-center mt-12">
        <Divider style={{ borderColor: "#e0d5c6" }} />
        <div
          style={{
            fontSize: "12px",
            color: "#b3a288",
            fontFamily: '"Noto Serif SC", Georgia, serif',
          }}
        >
          IP Content Hub · 由 DeepSeek AI 驱动
        </div>
      </div>
    </div>
  );
}
