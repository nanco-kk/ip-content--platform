"use client";

import { Layout, Menu, theme } from "antd";
import {
  EditOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "首页",
  },
  {
    key: "/create",
    icon: <EditOutlined />,
    label: "内容创作",
  },
  {
    key: "/series",
    icon: <AppstoreOutlined />,
    label: "系列管理",
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: "数据分析",
  },
  {
    key: "/diagnosis",
    icon: <MedicineBoxOutlined />,
    label: "账号诊断",
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;
  const currentLabel = menuItems.find((item) => item.key === selectedKey)?.label;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: "#fffdf8",
          borderRight: "1px solid #e0d5c6",
        }}
      >
        {/* 报头风格 Logo */}
        <div
          style={{
            padding: collapsed ? "20px 0" : "24px 16px",
            textAlign: "center",
            borderBottom: "3px double #d4c5a9",
          }}
        >
          {collapsed ? (
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#c65d3a",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              IP
            </span>
          ) : (
            <div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#3d2e1f",
                  fontFamily: '"Noto Serif SC", Georgia, serif',
                  letterSpacing: "0.08em",
                }}
              >
                内容中台
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#8b7355",
                  marginTop: "4px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                IP Content Hub
              </div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{
            background: "transparent",
            borderRight: "none",
            marginTop: "12px",
            fontFamily: '"Noto Serif SC", Georgia, serif',
          }}
        />

        {/* 底部装饰 */}
        {!collapsed && (
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "16px",
              right: "16px",
              padding: "16px 0",
              borderTop: "1px solid #e0d5c6",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#b3a288",
                fontStyle: "italic",
                lineHeight: 1.8,
              }}
            >
              创作是一场
              <br />
              与自己的对话
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        {/* 报纸风格页头 */}
        <Header
          style={{
            padding: "0 32px",
            background: "#fffdf8",
            borderBottom: "1px solid #e0d5c6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "13px",
                color: "#b3a288",
                letterSpacing: "0.1em",
              }}
            >
              Vol.01
            </span>
            <span style={{ color: "#d4c5a9" }}>|</span>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: 0,
                color: "#3d2e1f",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              {currentLabel}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "13px",
                color: "#8b7355",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              AI 驱动创作 · DeepSeek
            </span>
          </div>
        </Header>

        <Content
          style={{
            margin: "0",
            padding: "32px",
            minHeight: "calc(100vh - 64px)",
          }}
          className="fade-in"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
