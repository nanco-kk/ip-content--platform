"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Button,
  Divider,
  Tabs,
  List,
  Tag,
  Empty,
  Spin,
  message,
  Upload,
  Input,
} from "antd";
import {
  ThunderboltOutlined,
  FireOutlined,
  BulbOutlined,
  MedicineBoxOutlined,
  SendOutlined,
  PaperClipOutlined,
  CloseOutlined,
  CopyOutlined,
} from "@ant-design/icons";

interface TopicSuggestion {
  title: string;
  rationale: string;
  hotPoint: string;
}

interface DiagnosisData {
  hasData: boolean;
  id?: string;
  diagnosis?: string;
  contentPlan?: string;
  topicSuggestions?: TopicSuggestion[];
  improvements?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function DiagnosisPage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const fetchDiagnosis = useCallback(async () => {
    try {
      const res = await fetch("/api/diagnosis");
      const data = await res.json();
      setDiagnosis(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDiagnosis();
  }, [fetchDiagnosis]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // 粘贴上传 — 支持 Ctrl+V 直接粘贴截图
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            if (base64) {
              setUploadedImages((prev) => [...prev, base64]);
              message.success("截图已粘贴添加");
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // 文件上传
  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setUploadedImages((prev) => [...prev, base64]);
        message.success("图片已添加");
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 一键诊断
  const handleRunDiagnosis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedImages,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "诊断失败");
      }

      const data = await res.json();
      setDiagnosis({ hasData: true, ...data });
      message.success("账号诊断完成！");
      setChatMessages([]);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "诊断失败，请先导入笔记数据");
    } finally {
      setAnalyzing(false);
    }
  };

  // 发送对话消息
  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/diagnosis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          diagnosisId: diagnosis?.id,
        }),
      });

      if (!res.ok) {
        throw new Error("对话失败");
      }

      const data = await res.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "对话失败");
      setChatMessages([...newMessages, { role: "assistant", content: "抱歉，回复出了问题，请重试。" }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasData = diagnosis?.hasData;

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
          <MedicineBoxOutlined style={{ color: "#c65d3a", marginRight: "8px" }} />
          账号诊断
        </h2>
        <div style={{ fontSize: "13px", color: "#8b7355", marginTop: "4px" }}>
          上传截图 · AI深度分析 · 运营建议 · 对话追问
        </div>
        <Divider style={{ borderColor: "#d4c5a9", borderWidth: "2px 0 0 0", margin: "12px 0" }} />
      </div>

      {/* 粘贴上传区域 */}
      <Card className="warm-card mb-6" bordered>
        <div
          ref={pasteAreaRef}
          style={{
            border: "2px dashed #d4a574",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center",
            background: "rgba(250, 246, 240, 0.5)",
            cursor: "text",
          }}
          tabIndex={0}
        >
          <CopyOutlined style={{ fontSize: "32px", color: "#d4a574", marginBottom: "8px" }} />
          <div
            style={{
              fontSize: "15px",
              color: "#3d2e1f",
              fontFamily: '"Noto Serif SC", Georgia, serif',
              marginBottom: "4px",
            }}
          >
            按 Ctrl+V（或 Cmd+V）直接粘贴小红书后台截图
          </div>
          <div style={{ fontSize: "12px", color: "#b3a288" }}>
            支持粘贴多张截图 · 也可以点击下方按钮选择文件上传
          </div>
          <div className="mt-3">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              multiple
            >
              <Button
                icon={<PaperClipOutlined />}
                size="small"
                style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
              >
                或选择文件上传
              </Button>
            </Upload>
          </div>
        </div>

        {/* 已上传的截图预览 */}
        {uploadedImages.length > 0 && (
          <div className="mt-4">
            <div
              style={{
                fontSize: "13px",
                color: "#8b7355",
                marginBottom: "10px",
                fontFamily: '"Noto Serif SC", Georgia, serif',
              }}
            >
              已添加 {uploadedImages.length} 张截图：
            </div>
            <Row gutter={[12, 12]}>
              {uploadedImages.map((img, index) => (
                <Col key={index} span={8}>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid #e0d5c6",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <img
                      src={img}
                      alt={`screenshot-${index}`}
                      style={{ width: "100%", display: "block" }}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "24px",
                        height: "24px",
                        minWidth: "24px",
                        padding: "0",
                        borderRadius: "50%",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* 一键诊断按钮 */}
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={handleRunDiagnosis}
            loading={analyzing}
            style={{
              fontFamily: '"Noto Serif SC", Georgia, serif',
              height: "48px",
              fontSize: "15px",
            }}
          >
            {hasData ? "重新诊断" : "一键诊断"}
          </Button>
        </div>
      </Card>

      {analyzing ? (
        <Card className="warm-card" bordered style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            <span className="animate-pulse inline-block">✦</span>
          </div>
          <div
            style={{
              color: "#8b7355",
              fontFamily: '"Noto Serif SC", Georgia, serif',
              fontStyle: "italic",
              fontSize: "16px",
            }}
          >
            AI 正在分析{uploadedImages.length > 0 ? "截图和" : ""}全部笔记数据，进行深度诊断...
          </div>
          <div style={{ marginTop: "16px", maxWidth: "300px", margin: "16px auto 0" }}>
            <Progress percent={60} status="active" showInfo={false} strokeColor="#c65d3a" trailColor="#f0e8dc" />
          </div>
        </Card>
      ) : hasData && diagnosis?.diagnosis ? (
        <>
          {/* 诊断结果 Tabs */}
          <Card className="warm-card" bordered style={{ height: "100%" }}>
            <Tabs
              defaultActiveKey="diagnosis"
              style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
              items={[
                {
                  key: "diagnosis",
                  label: (
                    <span>
                      <MedicineBoxOutlined /> 整体诊断
                    </span>
                  ),
                  children: (
                    <div
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        padding: "8px 4px",
                        lineHeight: 1.9,
                        color: "#3d2e1f",
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {diagnosis.diagnosis}
                    </div>
                  ),
                },
                {
                  key: "plan",
                  label: (
                    <span>
                      <BulbOutlined /> 内容规划
                    </span>
                  ),
                  children: (
                    <div
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        padding: "8px 4px",
                        lineHeight: 1.9,
                        color: "#3d2e1f",
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {diagnosis.contentPlan}
                    </div>
                  ),
                },
                {
                  key: "topics",
                  label: (
                    <span>
                      <FireOutlined /> 选题创新
                    </span>
                  ),
                  children: (
                    <List
                      dataSource={diagnosis.topicSuggestions || []}
                      renderItem={(item, index) => (
                        <Card
                          key={index}
                          className="warm-card"
                          bordered
                          style={{ marginBottom: "16px" }}
                          hoverable
                        >
                          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                            <Tag color="warning" style={{ borderRadius: "2px" }}>
                              选题 {index + 1}
                            </Tag>
                            <Tag
                              style={{
                                borderRadius: "2px",
                                background: "rgba(198, 93, 58, 0.06)",
                                border: "1px solid rgba(198, 93, 58, 0.2)",
                                color: "#c65d3a",
                              }}
                            >
                              {item.hotPoint}
                            </Tag>
                          </div>
                          <h4
                            style={{
                              fontWeight: 600,
                              fontSize: "17px",
                              marginBottom: "8px",
                              color: "#3d2e1f",
                              fontFamily: '"Noto Serif SC", Georgia, serif',
                            }}
                          >
                            {item.title}
                          </h4>
                          <p
                            style={{
                              color: "#5a4632",
                              fontSize: "14px",
                              lineHeight: 1.8,
                              fontFamily: '"Noto Serif SC", Georgia, serif',
                            }}
                          >
                            {item.rationale}
                          </p>
                        </Card>
                      )}
                    />
                  ),
                },
                {
                  key: "improvements",
                  label: (
                    <span>
                      <ThunderboltOutlined /> 改进建议
                    </span>
                  ),
                  children: (
                    <div
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        padding: "8px 4px",
                        lineHeight: 1.9,
                        color: "#3d2e1f",
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {diagnosis.improvements}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* AI 对话区域 */}
          <Card
            className="warm-card mt-6"
            bordered
            title={
              <span style={{ fontFamily: '"Noto Serif SC", Georgia, serif', fontWeight: 600 }}>
                <ThunderboltOutlined style={{ color: "#c65d3a", marginRight: "8px" }} />
                AI 运营对话
              </span>
            }
          >
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "8px",
                marginBottom: "16px",
                background: "rgba(250, 246, 240, 0.5)",
                borderRadius: "4px",
              }}
            >
              {chatMessages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#b3a288",
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                    fontSize: "14px",
                  }}
                >
                  可以根据诊断结果提问追问，或提出你的想法让 AI 给出进一步运营建议
                  <br />
                  <span style={{ fontSize: "12px", marginTop: "8px", display: "inline-block" }}>
                    例如：&ldquo;关于提升涨粉率，你有什么更具体的建议吗？&rdquo;
                    &nbsp;或&nbsp; &ldquo;我想做一个关于深圳租房的系列，可行吗？&rdquo;
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          background: msg.role === "user" ? "#c65d3a" : "#fffdf8",
                          color: msg.role === "user" ? "#fff" : "#3d2e1f",
                          border: msg.role === "user" ? "none" : "1px solid #e0d5c6",
                          fontFamily: '"Noto Serif SC", Georgia, serif',
                          fontSize: "14px",
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div
                        style={{
                          padding: "10px 16px",
                          borderRadius: "8px",
                          background: "#fffdf8",
                          border: "1px solid #e0d5c6",
                          color: "#8b7355",
                          fontFamily: '"Noto Serif SC", Georgia, serif',
                          fontSize: "14px",
                        }}
                      >
                        <Spin size="small" /> AI 正在思考...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onPressEnter={handleSendMessage}
                placeholder="输入你的问题或想法..."
                disabled={chatLoading}
                size="large"
                style={{
                  fontFamily: '"Noto Serif SC", Georgia, serif',
                  borderRadius: "4px",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={chatLoading}
                size="large"
                style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
              >
                发送
              </Button>
            </div>
          </Card>
        </>
      ) : (
        <Card className="warm-card" bordered style={{ textAlign: "center", padding: "40px" }}>
          <Empty
            description={
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#3d2e1f",
                    marginBottom: "8px",
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                  }}
                >
                  还没有诊断报告
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#8b7355",
                    marginBottom: "16px",
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                  }}
                >
                  粘贴小红书后台截图，然后点击「一键诊断」
                </div>
                <div style={{ fontSize: "13px", color: "#b3a288" }}>
                  也可以先去「数据分析」页导入笔记 Excel 数据，AI 会结合两者一起分析
                </div>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
}
