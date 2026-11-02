"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Tag,
  Space,
  message,
  Progress,
  Divider,
  Upload,
  Empty,
  Spin,
} from "antd";
import type { UploadProps } from "antd";
import {
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  StarOutlined,
  BulbOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  RiseOutlined,
} from "@ant-design/icons";

interface XHSNote {
  id: string;
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

const mockNotes: XHSNote[] = [
  {
    id: "mock-1",
    title: "港硕住深圳2.0｜独居太太太太太爽！",
    publishTime: "2026-08-29 21:12",
    contentType: "图文",
    impressions: 1288,
    views: 245,
    clickRate: 0.19,
    likes: 13,
    comments: 13,
    favorites: 3,
    newFollowers: 0,
    shares: 0,
    avgWatchTime: 19,
    danmaku: 0,
  },
  {
    id: "mock-2",
    title: "在深五年｜深圳租房亲身血泪经验",
    publishTime: "2026-08-27 21:01",
    contentType: "视频",
    impressions: 9847,
    views: 813,
    clickRate: 0.038,
    likes: 28,
    comments: 4,
    favorites: 15,
    newFollowers: 4,
    shares: 5,
    avgWatchTime: 66,
    danmaku: 0,
  },
  {
    id: "mock-3",
    title: "灵感转瞬即逝？我把手机变成外挂大脑啦",
    publishTime: "2026-08-17 20:26",
    contentType: "视频",
    impressions: 842,
    views: 74,
    clickRate: 0.054,
    likes: 7,
    comments: 3,
    favorites: 0,
    newFollowers: 0,
    shares: 2,
    avgWatchTime: 5,
    danmaku: 0,
  },
  {
    id: "mock-4",
    title: "港深通勤DAY｜边实习边上课的日常",
    publishTime: "2026-08-15 19:00",
    contentType: "视频",
    impressions: 5230,
    views: 430,
    clickRate: 0.082,
    likes: 22,
    comments: 8,
    favorites: 11,
    newFollowers: 3,
    shares: 3,
    avgWatchTime: 48,
    danmaku: 1,
  },
  {
    id: "mock-5",
    title: "深圳周末City Walk｜藏在巷子里的咖啡馆",
    publishTime: "2026-08-10 15:30",
    contentType: "图文",
    impressions: 3200,
    views: 560,
    clickRate: 0.175,
    likes: 35,
    comments: 12,
    favorites: 20,
    newFollowers: 6,
    shares: 4,
    avgWatchTime: 0,
    danmaku: 0,
  },
];

export default function AnalyticsPage() {
  const [notes, setNotes] = useState<XHSNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<XHSNote[] | null>(null);
  const [importing, setImporting] = useState(false);

  // 页面加载时从数据库获取笔记数据
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.notes && data.notes.length > 0) {
        setNotes(data.notes);
      } else {
        // 数据库没有数据时用 mock 数据展示
        setNotes(mockNotes);
      }
    } catch {
      setNotes(mockNotes);
    }
    setLoading(false);
  };

  // Excel 导入处理 — 解析文件
  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls,.csv",
    showUploadList: false,
    beforeUpload: (file) => {
      const handleFile = async () => {
        try {
          const XLSX = await import("xlsx");
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          // 小红书格式第二行才是表头，所以 range=1 跳过标题行
          const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet, { range: 1 });

          if (rows.length === 0) {
            message.error("Excel文件为空或格式不正确");
            return;
          }

          const importedNotes: XHSNote[] = rows.map((row, index) => ({
            id: `import-${Date.now()}-${index}`,
            title: String(row["笔记标题"] || row["标题"] || `笔记 ${index + 1}`),
            publishTime: String(row["首次发布时间"] || row["发布时间"] || ""),
            contentType: String(row["体裁"] || "图文"),
            impressions: Number(row["曝光"] || 0),
            views: Number(row["观看量"] || 0),
            clickRate: parseFloat(String(row["封面点击率"] || "0")) || 0,
            likes: Number(row["点赞"] || 0),
            comments: Number(row["评论"] || 0),
            favorites: Number(row["收藏"] || 0),
            newFollowers: Number(row["涨粉"] || 0),
            shares: Number(row["分享"] || 0),
            avgWatchTime: Number(row["人均观看时长"] || 0),
            danmaku: Number(row["弹幕"] || 0),
          }));

          setImportData(importedNotes);
          message.success(`解析成功，共 ${importedNotes.length} 条笔记数据`);
        } catch (err) {
          console.error("Excel parse error:", err);
          message.error("文件解析失败，请检查格式");
        }
      };
      handleFile();
      return false;
    },
  };

  // 确认导入 — 保存到数据库
  const handleConfirmImport = async () => {
    if (!importData || importData.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/traffic/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: importData.map((n) => ({
            title: n.title,
            publishTime: n.publishTime,
            contentType: n.contentType,
            impressions: n.impressions,
            views: n.views,
            clickRate: n.clickRate,
            likes: n.likes,
            comments: n.comments,
            favorites: n.favorites,
            newFollowers: n.newFollowers,
            shares: n.shares,
            avgWatchTime: n.avgWatchTime,
            danmaku: n.danmaku,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("导入失败");
      }

      const result = await res.json();
      message.success(`成功导入 ${result.imported} 条笔记数据`);

      // 清除 mock 数据，从数据库重新加载
      setImportData(null);
      setIsImportModalOpen(false);
      setNotes([]);
      await fetchNotes();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
    }
  };

  // 下载小红书格式模板
  const handleDownloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const template = [
      ["最多导出排序后前1000条笔记"],
      ["笔记标题", "首次发布时间", "体裁", "曝光", "观看量", "封面点击率", "点赞", "评论", "收藏", "涨粉", "分享", "人均观看时长", "弹幕"],
      ["示例：港硕住深圳2.0｜独居太爽了", "2026年08月29日21时12分28秒", "图文", 1288, 245, 0.19, 13, 13, 3, 0, 0, 19, 0],
      ["示例：深圳租房亲身经验", "2026年08月27日21时01分34秒", "视频", 9847, 813, 0.038, 28, 4, 15, 4, 5, 66, 0],
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    ws["!cols"] = [
      { wch: 40 }, { wch: 30 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 8 }, { wch: 14 }, { wch: 8 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "小红书笔记导入模板.xlsx");
    message.success("模板已下载");
  };

  const columns = [
    {
      title: "笔记标题",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text: string, record: XHSNote) => (
        <div>
          <div style={{ fontFamily: '"Noto Serif SC", Georgia, serif', color: "#3d2e1f", fontSize: "14px" }}>
            {text}
          </div>
          <div style={{ fontSize: "12px", color: "#8b7355", marginTop: "2px" }}>
            <Tag
              color={record.contentType === "视频" ? "orange" : "blue"}
              style={{ borderRadius: "2px", fontSize: "11px" }}
            >
              {record.contentType}
            </Tag>
            {record.publishTime}
          </div>
        </div>
      ),
    },
    {
      title: "曝光",
      dataIndex: "impressions",
      key: "impressions",
      width: 80,
      sorter: (a: XHSNote, b: XHSNote) => a.impressions - b.impressions,
      render: (v: number) => (
        <span style={{ color: "#5a4632", fontSize: "13px" }}>{v.toLocaleString()}</span>
      ),
    },
    {
      title: "观看量",
      dataIndex: "views",
      key: "views",
      width: 80,
      sorter: (a: XHSNote, b: XHSNote) => a.views - b.views,
      render: (v: number) => (
        <span style={{ color: "#c65d3a", fontSize: "13px", fontWeight: 500 }}>{v.toLocaleString()}</span>
      ),
    },
    {
      title: "点击率",
      dataIndex: "clickRate",
      key: "clickRate",
      width: 80,
      sorter: (a: XHSNote, b: XHSNote) => a.clickRate - b.clickRate,
      render: (v: number) => (
        <span
          style={{
            color: v > 0.1 ? "#7d9d6e" : v > 0.05 ? "#d4a574" : "#8b7355",
            fontSize: "13px",
          }}
        >
          {(v * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      title: "点赞",
      dataIndex: "likes",
      key: "likes",
      width: 70,
      sorter: (a: XHSNote, b: XHSNote) => a.likes - b.likes,
      render: (v: number) => (
        <span style={{ color: "#5a4632", fontSize: "13px" }}>
          <LikeOutlined style={{ marginRight: "2px", color: "#c65d3a" }} />{v}
        </span>
      ),
    },
    {
      title: "评论",
      dataIndex: "comments",
      key: "comments",
      width: 70,
      sorter: (a: XHSNote, b: XHSNote) => a.comments - b.comments,
      render: (v: number) => (
        <span style={{ color: "#5a4632", fontSize: "13px" }}>
          <CommentOutlined style={{ marginRight: "2px", color: "#d4a574" }} />{v}
        </span>
      ),
    },
    {
      title: "收藏",
      dataIndex: "favorites",
      key: "favorites",
      width: 70,
      sorter: (a: XHSNote, b: XHSNote) => a.favorites - b.favorites,
      render: (v: number) => (
        <span style={{ color: "#5a4632", fontSize: "13px" }}>
          <StarOutlined style={{ marginRight: "2px", color: "#d4a574" }} />{v}
        </span>
      ),
    },
    {
      title: "涨粉",
      dataIndex: "newFollowers",
      key: "newFollowers",
      width: 70,
      sorter: (a: XHSNote, b: XHSNote) => a.newFollowers - b.newFollowers,
      render: (v: number) => (
        <span style={{ color: v > 0 ? "#7d9d6e" : "#b3a288", fontSize: "13px" }}>
          <RiseOutlined style={{ marginRight: "2px" }} />{v}
        </span>
      ),
    },
    {
      title: "分享",
      dataIndex: "shares",
      key: "shares",
      width: 70,
      sorter: (a: XHSNote, b: XHSNote) => a.shares - b.shares,
      render: (v: number) => (
        <span style={{ color: "#5a4632", fontSize: "13px" }}>
          <ShareAltOutlined style={{ marginRight: "2px", color: "#d4a574" }} />{v}
        </span>
      ),
    },
    {
      title: "人均观看",
      dataIndex: "avgWatchTime",
      key: "avgWatchTime",
      width: 80,
      sorter: (a: XHSNote, b: XHSNote) => a.avgWatchTime - b.avgWatchTime,
      render: (v: number) => (
        <span style={{ color: "#5a4632", fontSize: "13px" }}>
          {v > 0 ? `${v}s` : "-"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#3d2e1f",
            margin: 0,
            fontFamily: '"Noto Serif SC", Georgia, serif',
          }}
        >
          数据分析
        </h2>
        <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
          小红书笔记数据 · 单篇分析 · Excel一键导入
        </div>
        <Divider style={{ borderColor: "#d4c5a9", borderWidth: "2px 0 0 0", margin: "12px 0" }} />
      </div>

      {/* 笔记列表 */}
      <Card
        className="warm-card"
        bordered
        title={
          <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif', fontWeight: 600 }}>
            笔记数据列表（{notes.length}篇）
          </span>
        }
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              style={{ fontFamily: '"Noto Serif SC", Georgia, serif', color: "#8b7355" }}
            >
              下载模板
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setIsImportModalOpen(true)}
              style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
            >
              Excel导入
            </Button>
          </Space>
        }
      >
        {notes.length > 0 ? (
          <Table
            columns={columns}
            dataSource={notes}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
            style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
          />
        ) : (
          <Empty
            description={
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#3d2e1f",
                    marginBottom: "4px",
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                  }}
                >
                  暂无笔记数据
                </div>
                <div style={{ fontSize: "13px", color: "#8b7355" }}>
                  点击右上角「Excel导入」上传小红书导出的笔记数据
                </div>
              </div>
            }
          />
        )}
      </Card>

      {/* Excel 导入模态框 */}
      <Modal
        title={
          <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}>
            <FileExcelOutlined style={{ color: "#7d9d6e", marginRight: "8px" }} />
            小红书笔记 Excel 导入
          </span>
        }
        open={isImportModalOpen}
        onCancel={() => {
          setIsImportModalOpen(false);
          setImportData(null);
        }}
        footer={importData ? [
          <Button key="cancel" onClick={() => { setIsImportModalOpen(false); setImportData(null); }}>
            取消
          </Button>,
          <Button key="confirm" type="primary" loading={importing} onClick={handleConfirmImport}>
            确认导入 {importData.length} 条
          </Button>,
        ] : null}
        width={800}
      >
        {!importData ? (
          <div className="space-y-4">
            <div
              style={{
                background: "rgba(212, 165, 116, 0.08)",
                borderRadius: "4px",
                padding: "16px",
                border: "1px solid rgba(212, 165, 116, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#c65d3a",
                  fontFamily: '"Noto Serif SC", Georgia, serif',
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                支持直接导入小红书创作者中心导出的「笔记列表明细表」
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#8b7355",
                  fontFamily: '"Noto Serif SC", Georgia, serif',
                  lineHeight: 1.8,
                }}
              >
                1. 登录小红书创作者中心 → 笔记数据 → 导出 Excel
                <br />
                2. 直接上传导出的文件，系统自动识别13列数据
                <br />
                3. 导入后数据自动保存，刷新页面也不会丢失
              </div>
            </div>

            <Upload.Dragger {...uploadProps} style={{ padding: "20px" }}>
              <div style={{ padding: "20px 0" }}>
                <FileExcelOutlined style={{ fontSize: "48px", color: "#d4a574" }} />
                <div
                  style={{
                    marginTop: "16px",
                    fontSize: "16px",
                    color: "#3d2e1f",
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                  }}
                >
                  点击或拖拽文件到此区域上传
                </div>
                <div style={{ marginTop: "8px", fontSize: "13px", color: "#8b7355" }}>
                  支持 .xlsx, .xls, .csv 格式 · 小红书原始导出格式可直接识别
                </div>
              </div>
            </Upload.Dragger>

            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                style={{ color: "#c65d3a", fontFamily: '"Noto Serif SC", Georgia, serif' }}
              >
                下载小红书格式导入模板
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                background: "rgba(125, 157, 110, 0.08)",
                borderRadius: "4px",
                border: "1px solid rgba(125, 157, 110, 0.2)",
              }}
            >
              <span style={{ color: "#7d9d6e", fontFamily: '"Noto Serif SC", Georgia, serif' }}>
                解析成功，共 {importData.length} 条笔记数据，确认后将保存到数据库
              </span>
            </div>
            <Table
              dataSource={importData.slice(0, 10)}
              columns={[
                { title: "标题", dataIndex: "title", key: "title", ellipsis: true },
                { title: "体裁", dataIndex: "contentType", key: "contentType", width: 80 },
                { title: "曝光", dataIndex: "impressions", key: "impressions", width: 90 },
                { title: "观看", dataIndex: "views", key: "views", width: 80 },
                { title: "点赞", dataIndex: "likes", key: "likes", width: 70 },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
            />
            {importData.length > 10 && (
              <div style={{ textAlign: "center", marginTop: "12px", color: "#8b7355", fontSize: "13px" }}>
                还有 {importData.length - 10} 条未显示，导入后将全部保存
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
