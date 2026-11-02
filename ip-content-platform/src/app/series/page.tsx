"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  message,
  Popconfirm,
  List,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  BulbOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

interface ReferenceCopy {
  id: string;
  title: string;
  content: string;
}

interface Series {
  id: string;
  name: string;
  description: string;
  icon: string;
  styleAnalysis?: string | null;
  referenceCopies?: ReferenceCopy[];
  _count?: { referenceCopies: number; generatedContents: number };
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);
  const [currentRefs, setCurrentRefs] = useState<ReferenceCopy[]>([]);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [refForm] = Form.useForm();

  // 从数据库加载系列列表
  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/series");
      const data = await res.json();
      setSeries(data);
    } catch {
      message.error("加载系列失败");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleAdd = () => {
    setEditingSeries(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Series) => {
    setEditingSeries(record);
    form.setFieldsValue({ name: record.name, description: record.description, icon: record.icon });
    setIsModalOpen(true);
  };

  // 删除系列 — 调用 API 持久化
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      message.success("删除成功");
      await fetchSeries();
    } catch {
      message.error("删除失败");
    }
  };

  // 创建/更新系列 — 调用 API 持久化
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSeries) {
        const res = await fetch(`/api/series/${editingSeries.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("更新失败");
        message.success("更新成功");
      } else {
        const res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("创建失败");
        message.success("创建成功");
      }
      setIsModalOpen(false);
      await fetchSeries();
    } catch (error) {
      if (error instanceof Error && error.message !== "Validation failed") {
        message.error(error.message);
      }
    }
  };

  // 管理参考文案 — 从 API 加载
  const handleManageRefs = async (record: Series) => {
    try {
      const res = await fetch(`/api/series/${record.id}`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setCurrentSeries(data);
      setCurrentRefs(data.referenceCopies || []);
      setIsRefModalOpen(true);
    } catch {
      message.error("加载参考文案失败");
    }
  };

  // 添加参考文案 — 调用 API
  const handleAddRef = async () => {
    try {
      const values = await refForm.validateFields();
      if (!currentSeries) return;
      const res = await fetch(`/api/series/${currentSeries.id}/references`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("添加失败");
      const newRef = await res.json();
      setCurrentRefs([...currentRefs, newRef]);
      refForm.resetFields();
      message.success("参考文案添加成功");
    } catch (error) {
      if (error instanceof Error && error.message !== "Validation failed") {
        message.error(error.message);
      }
    }
  };

  // 删除参考文案 — 调用 API
  const handleDeleteRef = async (refId: string) => {
    if (!currentSeries) return;
    try {
      const res = await fetch(`/api/series/${currentSeries.id}/references`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refId }),
      });
      if (!res.ok) throw new Error("删除失败");
      setCurrentRefs(currentRefs.filter((r) => r.id !== refId));
      message.success("已删除");
    } catch {
      message.error("删除失败");
    }
  };

  // 分析写作风格 — 调用 API
  const handleAnalyzeStyle = async (record: Series) => {
    const refCount = record._count?.referenceCopies || record.referenceCopies?.length || 0;
    if (refCount < 2) {
      message.warning("至少需要2篇参考文案才能分析风格");
      return;
    }
    setAnalyzing(record.id);
    try {
      const res = await fetch(`/api/series/${record.id}/analyze`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "分析失败");
      }
      message.success("风格分析完成！");
      await fetchSeries();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "分析失败");
    } finally {
      setAnalyzing(null);
    }
  };

  const columns = [
    {
      title: "系列名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Series) => (
        <Space>
          <span style={{ fontSize: "20px" }}>{record.icon}</span>
          <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif', fontWeight: 500, color: "#3d2e1f" }}>
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => (
        <span style={{ color: "#8b7355", fontFamily: '"Noto Serif SC", Georgia, serif' }}>
          {text || "—"}
        </span>
      ),
    },
    {
      title: "参考文案",
      key: "refCount",
      width: 90,
      render: (_: unknown, record: Series) => {
        const count = record._count?.referenceCopies || record.referenceCopies?.length || 0;
        return (
          <span style={{ color: "#5a4632" }}>
            <FileTextOutlined style={{ marginRight: "4px", color: "#d4a574" }} /> {count}
          </span>
        );
      },
    },
    {
      title: "风格分析",
      dataIndex: "styleAnalysis",
      key: "styleAnalysis",
      width: 100,
      render: (val: string | null) =>
        val ? (
          <Tag color="success" style={{ borderRadius: "2px" }}>已分析</Tag>
        ) : (
          <Tag style={{ borderRadius: "2px" }}>未分析</Tag>
        ),
    },
    {
      title: "操作",
      key: "action",
      width: 300,
      render: (_: unknown, record: Series) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<BulbOutlined />}
            onClick={() => handleAnalyzeStyle(record)}
            loading={analyzing === record.id}
            style={{ color: "#c65d3a" }}
          >
            分析风格
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleManageRefs(record)}
            style={{ color: "#d4a574" }}
          >
            参考文案
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#8b7355" }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个系列吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
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
    <div className="max-w-6xl mx-auto">
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
          系列管理
        </h2>
        <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
          创建你的内容系列，上传参考文案让 AI 学习你的写作风格
        </div>
        <Divider style={{ borderColor: "#d4c5a9", borderWidth: "2px 0 0 0", margin: "12px 0" }} />
      </div>

      <Card
        className="warm-card"
        bordered
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
          >
            新建系列
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={series}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                description={
                  <span style={{ color: "#b3a288", fontFamily: '"Noto Serif SC", Georgia, serif' }}>
                    还没有系列，点击「新建系列」开始
                  </span>
                }
              />
            ),
          }}
          style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
        />
      </Card>

      {/* 新建/编辑系列模态框 */}
      <Modal
        title={
          <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}>
            {editingSeries ? "编辑系列" : "新建系列"}
          </span>
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="系列名称"
            name="name"
            rules={[{ required: true, message: "请输入系列名称" }]}
          >
            <Input placeholder="例如：好物分享、通勤记录" />
          </Form.Item>
          <Form.Item label="图标" name="icon" initialValue="📝">
            <Input placeholder="输入emoji或文字图标" maxLength={4} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="简要描述这个系列的内容方向" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 参考文案管理模态框 */}
      <Modal
        title={
          <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}>
            参考文案管理 - {currentSeries?.name}
          </span>
        }
        open={isRefModalOpen}
        onCancel={() => setIsRefModalOpen(false)}
        footer={null}
        width={800}
      >
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
                fontSize: "13px",
                color: "#c65d3a",
                fontFamily: '"Noto Serif SC", Georgia, serif',
                lineHeight: 1.8,
              }}
            >
              提示：上传2-3篇该系列的代表性文案，系统会自动分析写作风格，
              用于后续AI生成内容时保持风格一致。
            </div>
          </div>

          <Form form={refForm} layout="vertical">
            <Form.Item
              label="文案标题"
              name="title"
              rules={[{ required: true, message: "请输入文案标题" }]}
            >
              <Input placeholder="输入参考文案的标题" />
            </Form.Item>
            <Form.Item
              label="文案内容"
              name="content"
              rules={[{ required: true, message: "请输入文案内容" }]}
            >
              <TextArea rows={6} placeholder="粘贴完整的参考文案内容" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRef}
                style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
              >
                添加参考文案
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: "#e0d5c6" }} />

          <div>
            <h4
              style={{
                fontFamily: '"Noto Serif SC", Georgia, serif',
                fontWeight: 600,
                color: "#3d2e1f",
                marginBottom: "12px",
              }}
            >
              已添加的参考文案 ({currentRefs.length})
            </h4>
            {currentRefs.length > 0 ? (
              <List
                dataSource={currentRefs}
                renderItem={(item) => (
                  <List.Item
                    style={{ borderBottom: "1px solid #e0d5c6" }}
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="确定删除这篇参考文案？"
                        onConfirm={() => handleDeleteRef(item.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif', color: "#3d2e1f" }}>
                          {item.title}
                        </span>
                      }
                      description={
                        <div style={{ color: "#8b7355", fontSize: "13px", fontFamily: '"Noto Serif SC", Georgia, serif' }}>
                          {item.content.substring(0, 100)}...
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description={
                  <span style={{ color: "#b3a288", fontFamily: '"Noto Serif SC", Georgia, serif' }}>
                    还没有参考文案，添加一篇开始吧
                  </span>
                }
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
