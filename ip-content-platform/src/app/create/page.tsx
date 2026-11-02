"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  Card,
  Tabs,
  Tag,
  Space,
  Divider,
  message,
  Spin,
  Empty,
  Radio,
} from "antd";
import {
  ThunderboltOutlined,
  CopyOutlined,
  SaveOutlined,
  PictureOutlined,
  TagsOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

interface SeriesItem {
  id: string;
  name: string;
  icon: string;
  styleAnalysis?: string | null;
}

const contentTypeOptions = [
  { value: "article", label: "图文文章" },
  { value: "video", label: "视频脚本" },
];

export default function CreatePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [createMode, setCreateMode] = useState<"series" | "standalone">("series");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    titles: string[];
    content: string;
    coverDescription: string;
    tags: string[];
  } | null>(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);

  // 从数据库加载系列列表
  useEffect(() => {
    fetch("/api/series")
      .then((res) => res.json())
      .then((data) => {
        setSeriesList(data);
        setSeriesLoading(false);
      })
      .catch(() => {
        message.error("加载系列失败");
        setSeriesLoading(false);
      });
  }, []);

  const selectedSeries = seriesList.find((s) => s.id === selectedSeriesId);

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        seriesId: createMode === "series" ? values.seriesId : null,
        topic: values.topic,
        contentType: values.contentType,
        requirements: values.requirements,
      };

      const res = await fetch("/api/generate/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }

      const data = await res.json();
      setGeneratedContent(data);
      setSelectedTitleIndex(0);
      message.success("内容生成成功！");
    } catch (error) {
      if (error instanceof Error && error.message !== "Validation failed") {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("已复制到剪贴板");
  };

  const handleSave = () => {
    message.success("内容已保存");
  };

  return (
    <div className="max-w-7xl mx-auto" style={{ minHeight: "calc(100vh - 160px)" }}>
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
          内容创作
        </h2>
        <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
          选择创作模式，输入主题，让 AI 帮你完成一篇有温度的底稿
        </div>
        <Divider style={{ borderColor: "#d4c5a9", borderWidth: "2px 0 0 0", margin: "12px 0" }} />
      </div>

      <div className="flex gap-6" style={{ height: "calc(100vh - 260px)" }}>
        {/* 左侧输入区 */}
        <div style={{ width: "38%" }}>
          <Card
            className="warm-card"
            bordered
            style={{ height: "100%" }}
            title={
              <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}>
                <ThunderboltOutlined style={{ color: "#c65d3a", marginRight: "8px" }} />
                创作设置
              </span>
            }
            styles={{ body: { height: "calc(100% - 57px)", overflowY: "auto" } }}
          >
            <Form form={form} layout="vertical">
              {/* 创作模式选择 */}
              <Form.Item label="创作模式">
                <Radio.Group
                  value={createMode}
                  onChange={(e) => {
                    setCreateMode(e.target.value);
                    if (e.target.value === "standalone") {
                      setSelectedSeriesId(null);
                      form.setFieldValue("seriesId", undefined);
                    }
                  }}
                  style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
                >
                  <Radio.Button value="series" style={{ borderRadius: "4px 0 0 4px" }}>
                    系列内容
                  </Radio.Button>
                  <Radio.Button value="standalone" style={{ borderRadius: "0 4px 4px 0" }}>
                    单篇内容
                  </Radio.Button>
                </Radio.Group>
                <div style={{ fontSize: "12px", color: "#8b7355", marginTop: "6px" }}>
                  {createMode === "series"
                    ? "根据所选系列的写作风格生成内容"
                    : "不属于任何系列，但学习所有系列的语言表述风格"}
                </div>
              </Form.Item>

              {/* 选择系列 — 仅在系列内容模式下显示 */}
              {createMode === "series" && (
                <Form.Item
                  label="选择系列"
                  name="seriesId"
                  rules={[{ required: true, message: "请选择内容系列" }]}
                >
                  <Select
                    placeholder="请选择内容系列"
                    loading={seriesLoading}
                    showSearch
                    optionFilterProp="label"
                    onChange={(val) => setSelectedSeriesId(val)}
                    options={seriesList.map((s) => ({
                      value: s.id,
                      label: `${s.icon} ${s.name}`,
                    }))}
                    notFoundContent={
                      seriesLoading ? <Spin size="small" /> : (
                        <div style={{ padding: "8px", color: "#b3a288" }}>
                          暂无系列，请先去「系列管理」创建
                        </div>
                      )
                    }
                  />
                </Form.Item>
              )}

              <Form.Item
                label="内容类型"
                name="contentType"
                initialValue="article"
                rules={[{ required: true, message: "请选择内容类型" }]}
              >
                <Select options={contentTypeOptions} />
              </Form.Item>

              <Form.Item
                label="创作主题"
                name="topic"
                rules={[{ required: true, message: "请输入创作主题" }]}
              >
                <Input placeholder="例如：九月书单推荐、深圳通勤第一天" size="large" />
              </Form.Item>

              <Form.Item label="补充要求（选填）" name="requirements">
                <TextArea
                  rows={4}
                  placeholder="可以补充一些具体要求，比如想要重点突出的内容、特定的风格调整等"
                />
              </Form.Item>

              <Divider style={{ borderColor: "#e0d5c6" }} />

              {/* 风格信息卡片 */}
              <div
                style={{
                  background: "rgba(212, 165, 116, 0.08)",
                  borderRadius: "4px",
                  padding: "16px",
                  marginBottom: "16px",
                  border: "1px solid rgba(212, 165, 116, 0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#c65d3a",
                    fontWeight: 600,
                    marginBottom: "8px",
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                  }}
                >
                  {createMode === "series" ? "当前系列风格" : "综合语言风格"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#5a4632",
                    lineHeight: 1.8,
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                  }}
                >
                  {createMode === "series"
                    ? selectedSeries?.styleAnalysis
                      ? selectedSeries.styleAnalysis.substring(0, 150) + "..."
                      : "请先选择系列，未做风格分析的可先去「系列管理」上传参考文案并分析风格"
                    : "将学习所有已分析风格的系列的语言表述，保持自然、亲切、活人感强的语气，但不绑定任何特定系列的主题方向"}
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<ThunderboltOutlined />}
                onClick={handleGenerate}
                loading={loading}
                style={{
                  fontFamily: '"Noto Serif SC", Georgia, serif',
                  height: "44px",
                  fontSize: "15px",
                }}
              >
                AI 生成内容
              </Button>
            </Form>
          </Card>
        </div>

        {/* 右侧输出区 */}
        <div style={{ flex: 1 }}>
          <Card
            className="warm-card"
            bordered
            style={{ height: "100%" }}
            title={
              <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}>
                <FileTextOutlined style={{ color: "#c65d3a", marginRight: "8px" }} />
                生成结果
              </span>
            }
            extra={
              generatedContent && (
                <Space>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(generatedContent.content)}
                    style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
                  >
                    复制全文
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
                  >
                    保存内容
                  </Button>
                </Space>
              )
            }
            styles={{ body: { height: "calc(100% - 57px)", overflow: "hidden" } }}
          >
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Spin size="large" />
                  <div
                    style={{
                      marginTop: "16px",
                      color: "#8b7355",
                      fontFamily: '"Noto Serif SC", Georgia, serif',
                      fontStyle: "italic",
                    }}
                  >
                    AI 正在创作中，请稍候...
                  </div>
                </div>
              </div>
            ) : generatedContent ? (
              <Tabs
                defaultActiveKey="content"
                className="h-full"
                style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
                items={[
                  {
                    key: "titles",
                    label: (
                      <span>
                        <FileTextOutlined /> 标题建议
                      </span>
                    ),
                    children: (
                      <div className="space-y-4 py-2" style={{ maxHeight: "calc(100vh - 380px)", overflowY: "auto" }}>
                        {generatedContent.titles.map((title, index) => (
                          <Card
                            key={index}
                            hoverable
                            onClick={() => setSelectedTitleIndex(index)}
                            className="warm-card"
                            style={{
                              border: selectedTitleIndex === index
                                ? "2px solid #c65d3a"
                                : "1px solid #e0d5c6",
                              background: selectedTitleIndex === index
                                ? "rgba(198, 93, 58, 0.04)"
                                : "transparent",
                              cursor: "pointer",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Tag
                                  color={index === 0 ? "warning" : "default"}
                                  style={{ borderRadius: "2px" }}
                                >
                                  {index === 0 ? "推荐" : `备选 ${index}`}
                                </Tag>
                                <span
                                  style={{
                                    fontFamily: '"Noto Serif SC", Georgia, serif',
                                    color: "#3d2e1f",
                                    fontWeight: 500,
                                  }}
                                >
                                  {title}
                                </span>
                              </div>
                              <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(title);
                                }}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    ),
                  },
                  {
                    key: "content",
                    label: (
                      <span>
                        <FileTextOutlined /> 正文内容
                      </span>
                    ),
                    children: (
                      <div
                        className="py-2"
                        style={{
                          maxHeight: "calc(100vh - 380px)",
                          overflowY: "auto",
                          padding: "8px 4px",
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.9,
                            color: "#3d2e1f",
                            fontFamily: '"Noto Serif SC", Georgia, serif',
                            fontSize: "15px",
                          }}
                        >
                          {generatedContent.content}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "cover",
                    label: (
                      <span>
                        <PictureOutlined /> 封面设计
                      </span>
                    ),
                    children: (
                      <div className="py-2">
                        <div
                          style={{
                            background: "rgba(212, 165, 116, 0.06)",
                            borderRadius: "4px",
                            padding: "24px",
                            border: "1px dashed #d4c5a9",
                          }}
                        >
                          <div
                            style={{
                              color: "#5a4632",
                              lineHeight: 1.9,
                              fontFamily: '"Noto Serif SC", Georgia, serif',
                              fontSize: "14px",
                            }}
                          >
                            {generatedContent.coverDescription}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "tags",
                    label: (
                      <span>
                        <TagsOutlined /> 标签推荐
                      </span>
                    ),
                    children: (
                      <div className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.tags.map((tag, index) => (
                            <Tag
                              key={index}
                              color="default"
                              className="cursor-pointer"
                              style={{
                                padding: "4px 12px",
                                fontSize: "14px",
                                borderRadius: "2px",
                                background: "rgba(198, 93, 58, 0.06)",
                                border: "1px solid rgba(198, 93, 58, 0.2)",
                                color: "#c65d3a",
                                fontFamily: '"Noto Serif SC", Georgia, serif',
                              }}
                              onClick={() => handleCopy(tag)}
                            >
                              #{tag}
                            </Tag>
                          ))}
                        </div>
                        <div
                          style={{
                            marginTop: "16px",
                            fontSize: "13px",
                            color: "#8b7355",
                            fontFamily: '"Noto Serif SC", Georgia, serif',
                          }}
                        >
                          共 {generatedContent.tags.length} 个标签，点击可复制
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Empty
                  description={
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "#5a4632",
                          marginBottom: "4px",
                          fontFamily: '"Noto Serif SC", Georgia, serif',
                        }}
                      >
                        填写左侧信息，开始 AI 创作
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#b3a288",
                          fontFamily: '"Noto Serif SC", Georgia, serif',
                        }}
                      >
                        选择创作模式、输入主题，一键生成完整内容底稿
                      </div>
                    </div>
                  }
                >
                  <ThunderboltOutlined
                    style={{
                      fontSize: "48px",
                      color: "#d4c5a9",
                    }}
                  />
                </Empty>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
