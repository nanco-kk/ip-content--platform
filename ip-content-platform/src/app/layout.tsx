import type { Metadata } from "next";
import "./globals.css";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "个人IP内容中台",
  description: "AI驱动的个人IP内容创作与管理平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="paper-texture">
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: "#c65d3a",
              colorInfo: "#c65d3a",
              colorSuccess: "#7d9d6e",
              colorWarning: "#d4a574",
              colorError: "#c65d3a",
              borderRadius: 4,
              fontFamily: '"Noto Serif SC", Georgia, serif',
              colorBgContainer: "#fffdf8",
              colorBorder: "#e0d5c6",
              colorText: "#3d2e1f",
              colorTextSecondary: "#8b7355",
              colorBgLayout: "#faf6f0",
            },
            components: {
              Menu: {
                itemBg: "transparent",
                itemSelectedBg: "rgba(198, 93, 58, 0.08)",
                itemSelectedColor: "#c65d3a",
                itemHoverBg: "rgba(212, 165, 116, 0.1)",
                itemHoverColor: "#a04a2c",
              },
              Layout: {
                siderBg: "#fffdf8",
                headerBg: "#fffdf8",
                bodyBg: "transparent",
              },
              Card: {
                colorBgContainer: "#fffdf8",
                borderRadiusLG: 4,
              },
            },
          }}
        >
          <AppLayout>{children}</AppLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}
