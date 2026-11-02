// DeepSeek API integration

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

// 全局基准风格 —— 沈月/狂阿弥式的亲切感 + 淡淡文艺气息
// 这个风格是所有内容的底色，在此基础上叠加具体系列的主题和细节风格
const GLOBAL_BASE_STYLE = `【全局语气基准】
你需要模仿沈月vlog和狂阿弥视频中的文字风格，这是所有内容的底色：

1. 语气：极度亲切、口语化，像在和最好的朋友聊天。有"活人感"，不是完美的文案，而是会有小停顿、小碎碎念、小小的自我吐槽。
2. 句式：多用短句，偶尔有语气词（"啊"、"呢"、"嘛"、"哦"、"哈哈"），但不过度。有自然的节奏感，像说话一样。
3. 文艺感：淡淡的，不浓烈。是那种生活里不经意发现美好的文艺，不是刻意堆砌辞藻的文艺。会用一些很细腻的比喻，但都来自生活日常。
4. 真诚感：敢于暴露自己的小笨拙、小纠结、小情绪，有脆弱感，这才是最打动人的。不完美，但真实。
5. 节奏感：开头像随口打招呼一样自然，中间会有一些"对了"、"哦还有"、"怎么说呢"之类的过渡词，结尾不说教，留有余韵。
6. 细节感：擅长捕捉生活里很小的细节——一杯咖啡的温度、傍晚的光、地铁上的声音，用具体的小细节代替抽象的形容。

沈月风格关键词：清新、治愈、生活感、碎碎念、少女感但不幼稚、有温度
狂阿弥风格关键词：细腻、人文、电影感、有深度但不说教、安静但有力量

你要把这两种风格融合：用沈月的亲切口语 + 狂阿弥的细腻深度。
不刻意文艺，但字里行间有淡淡的诗意。
像一个很会生活、很会观察的朋友在跟你分享她最近遇到的好东西。`;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// 支持图片的消息格式
interface MultiModalContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export async function callDeepSeekAPI(
  messages: ChatMessage[],
  model: string = "deepseek-chat",
  temperature: number = 0.7
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0]?.message.content || "";
}

// 带图片的 API 调用
export async function callDeepSeekAPIWithImages(
  systemPrompt: string,
  textPrompt: string,
  images: string[],
  temperature: number = 0.8
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment variables");
  }

  const content: MultiModalContent[] = [
    { type: "text", text: textPrompt },
    ...images.map((img) => ({
      type: "image_url" as const,
      image_url: { url: img },
    })),
  ];

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    // 如果不支持图片，回退到纯文本模式
    console.log("Vision API not supported, falling back to text only");
    return callDeepSeekAPI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: textPrompt },
      ],
      "deepseek-chat",
      temperature
    );
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0]?.message.content || "";
}

// 分析写作风格 —— 深度分析参考文案
// 返回结构化的风格画像，包含：语言特点、结构模式、常用表达、情感基调、标志性句式等
export async function analyzeWritingStyle(referenceCopies: string[]): Promise<string> {
  const systemPrompt = `你是一位顶尖的写作风格分析师，擅长拆解创作者的文字DNA。

请深度分析以下参考文案，提炼出可被精准复刻的写作风格画像。
不要泛泛而谈，要具体到可以照着模仿的程度。

请从以下维度详细分析（每个维度给出具体例子）：
1. 开场白方式：开头第一句话怎么说？有什么标志性的打招呼方式？
2. 语气和人称：用什么人称？语气是怎样的？有什么口头禅或常用语气词？
3. 段落结构：怎么分段？每段大概多长？段落之间怎么过渡？
4. 内容展开方式：是先总后分？还是故事引入？有什么固定的展开模式？
5. 常用表达和句式：有什么反复出现的句式、过渡词、连接词？列出来。
6. 情感表达：怎么表达喜欢/不喜欢？是直接还是含蓄？
7. 结尾方式：怎么收尾？有没有固定的结尾模式？
8. 个人特色：最独特的、最容易被认出的个人风格标志是什么？

用清晰的分点描述，每个维度都要有从原文中提取的具体例子作为佐证。`;

  const userPrompt = `请深度分析以下${referenceCopies.length}篇参考文案的写作风格：

${referenceCopies.map((c, i) => `===== 参考文案 ${i + 1} =====
${c}`).join("\n\n")}

请输出详细的风格画像，越具体越好，越可模仿越好。`;

  return callDeepSeekAPI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    "deepseek-chat",
    0.7
  );
}

// 生成内容底稿 —— 升级版
// 关键改进：不仅传入风格分析，还传入参考文案原文作为few-shot示例，让AI真正"学到"文字
export async function generateContent(params: {
  styleAnalysis: string;
  topic: string;
  contentType: string;
  requirements?: string;
  referenceCopies?: string[]; // 参考文案原文，用于 few-shot 学习
  seriesName?: string;
}): Promise<{
  titles: string[];
  content: string;
  coverDescription: string;
  tags: string[];
}> {
  // 构建系统提示词：全局基准风格 + 系列风格分析 + 参考文案原文
  let styleSection = GLOBAL_BASE_STYLE;

  if (params.seriesName) {
    styleSection += `

【${params.seriesName}系列风格特点】
${params.styleAnalysis}

重要：请在保持全局语气基准（沈月/狂阿弥式亲切感）的基础上，融合以上${params.seriesName}系列的独特风格特点。
全局语气是底色，系列风格是调味。`;
  } else {
    styleSection += `

【综合风格参考】
${params.styleAnalysis}

重要：以上是用户其他系列的风格分析供参考，你需要从中提取语言表述上的共通特点（亲切感、表达习惯、个人语气等），融入到全局基准风格中。
但内容主题完全根据用户给的创作主题来，不绑定任何特定系列。`;
  }

  // 加入参考文案原文作为 few-shot 示例（最多取前2篇，避免token太多）
  let fewShotSection = "";
  if (params.referenceCopies && params.referenceCopies.length > 0) {
    const samples = params.referenceCopies.slice(0, 2);
    fewShotSection = `
【参考文案原文 —— 请仔细学习语气和节奏】
${samples.map((c, i) => `--- 参考示例 ${i + 1}（请学习它的语气、节奏、表达方式） ---
${c.substring(0, 1500)}${c.length > 1500 ? "..." : ""}`).join("\n\n")}

请认真体会上面参考文案的"语感"——不是抄内容，而是模仿那种说话的方式、停顿的节奏、用词的习惯。`;
  }

  const systemPrompt = `${styleSection}
${fewShotSection}

【任务】
你是小红书创作者本人，正在根据灵感创作一篇新内容。
请用你自己的口吻（参考上面的风格和示例），围绕给定主题写一篇完整的${params.contentType === "video" ? "视频脚本" : "图文笔记"}。

【输出要求】
请严格按照以下JSON格式输出（不要包含任何其他文字，不要加markdown代码块标记）：
{
  "titles": ["标题1", "标题2", "标题3"],
  "content": "完整正文内容",
  "coverDescription": "封面图设计描述",
  "tags": ["标签1", "标签2", "标签3", "...共10-15个"]
}

注意：
- 标题要有吸引力，带点个人特色，不要太标题党
- 正文要自然流畅，像你平时说话一样，有温度、有细节
- 封面描述要具体，能让设计师直接照着做
- 标签要精准，包含大流量词和精准长尾词`;

  const userPrompt = `创作主题：${params.topic}
内容类型：${params.contentType === "video" ? "视频脚本" : "图文笔记"}
${params.requirements ? `补充要求：${params.requirements}` : "没有特别要求，自由发挥就好～"}

开始创作吧！`;

  const result = await callDeepSeekAPI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    "deepseek-chat",
    0.85 // 稍微提高温度，让语言更自然有变化
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        titles: parsed.titles || [],
        content: parsed.content || "",
        coverDescription: parsed.coverDescription || "",
        tags: parsed.tags || [],
      };
    }
    throw new Error("Failed to parse JSON from response");
  } catch (error) {
    console.error("Failed to parse generated content:", error);
    return {
      titles: [params.topic],
      content: result,
      coverDescription: "",
      tags: [],
    };
  }
}

// 分析流量数据
export async function analyzeTraffic(params: {
  title: string;
  contentType: string;
  views: number;
  impressions: number;
  clickRate: number;
  likes: number;
  comments: number;
  favorites: number;
  newFollowers: number;
  shares: number;
  avgWatchTime: number;
  danmaku: number;
}): Promise<{ analysis: string; derivedTopics: string[] }> {
  const systemPrompt = `你是一位小红书数据分析专家。请分析以下笔记的流量数据，给出运营建议和3个追热点的衍生选题。

请严格按照以下JSON格式输出（不要包含任何其他文字）：
{
  "analysis": "数据分析报告",
  "derivedTopics": ["选题1", "选题2", "选题3"]
}`;

  const userPrompt = `笔记标题：${params.title}
内容类型：${params.contentType}
曝光量：${params.impressions}
观看量：${params.views}
封面点击率：${(params.clickRate * 100).toFixed(1)}%
点赞数：${params.likes}
评论数：${params.comments}
收藏数：${params.favorites}
涨粉数：${params.newFollowers}
分享数：${params.shares}
人均观看时长：${params.avgWatchTime}秒
弹幕数：${params.danmaku}

请给出详细的运营分析和3个衍生选题。`;

  const result = await callDeepSeekAPI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    "deepseek-chat",
    0.8
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: parsed.analysis || "",
        derivedTopics: parsed.derivedTopics || [],
      };
    }
    throw new Error("Failed to parse JSON from response");
  } catch (error) {
    console.error("Failed to parse traffic analysis:", error);
    return {
      analysis: result,
      derivedTopics: [],
    };
  }
}

// 账号诊断 — 全量笔记数据分析（支持图片）
export async function diagnoseAccount(data: {
  period: string;
  totalViews: number;
  totalInteractions: number;
  totalNewFollowers: number;
  totalProfileVisits: number;
  totalPosts: number;
  totalImpressions: number;
  trafficSources: Record<string, number>;
  notes: Array<{
    title: string;
    contentType: string;
    views: number;
    impressions: number;
    clickRate: number;
    likes: number;
    comments: number;
    favorites: number;
    newFollowers: number;
    shares: number;
    avgWatchTime: number;
    danmaku: number;
  }>;
  images?: string[];
}): Promise<{
  diagnosis: string;
  contentPlan: string;
  topicSuggestions: Array<{ title: string; rationale: string; hotPoint: string }>;
  improvements: string;
}> {
  const systemPrompt = `你是一位资深的社交媒体账号运营顾问，精通小红书平台的内容策略。请基于以下全量笔记数据${data.images && data.images.length > 0 ? "和账号后台截图" : ""}，进行深度账号诊断。

请严格按照以下JSON格式输出（不要包含任何其他文字）：
{
  "diagnosis": "整体诊断分析：包括账号当前阶段判断、内容表现评估、优势与短板分析、互动转化率分析等",
  "contentPlan": "内容规划建议：包括内容方向调整建议、发布频率建议、体裁（图文/视频）配比建议、系列规划建议等",
  "topicSuggestions": [
    {
      "title": "选题1标题",
      "rationale": "推荐理由和预期效果",
      "hotPoint": "相关热点/趋势"
    },
    {
      "title": "选题2标题",
      "rationale": "推荐理由和预期效果",
      "hotPoint": "相关热点/趋势"
    },
    {
      "title": "选题3标题",
      "rationale": "推荐理由和预期效果",
      "hotPoint": "相关热点/趋势"
    },
    {
      "title": "选题4标题",
      "rationale": "推荐理由和预期效果",
      "hotPoint": "相关热点/趋势"
    },
    {
      "title": "选题5标题",
      "rationale": "推荐理由和预期效果",
      "hotPoint": "相关热点/趋势"
    }
  ],
  "improvements": "具体改进建议：封面设计、标题优化、发布时间、互动策略、标签使用等可执行建议"
}`;

  const notesSummary = data.notes.map(n =>
    `《${n.title}》[${n.contentType}] 曝光${n.impressions} 观看${n.views} 点击率${(n.clickRate * 100).toFixed(1)}% 点赞${n.likes} 评论${n.comments} 收藏${n.favorites} 涨粉${n.newFollowers} 分享${n.shares} 人均观看${n.avgWatchTime}秒`
  ).join("\n");

  const userPrompt = `统计周期：${data.period}

账号级别数据：
- 总观看数：${data.totalViews}
- 总互动数：${data.totalInteractions}
- 总涨粉数：${data.totalNewFollowers}
- 主页访客数：${data.totalProfileVisits}
- 发布数：${data.totalPosts}
- 总曝光量：${data.totalImpressions}

流量来源分布：
${Object.keys(data.trafficSources).length > 0
  ? Object.entries(data.trafficSources).map(([k, v]) => `- ${k}：${v}%`).join("\n")
  : "（暂无流量来源数据，请根据笔记数据分析）"}

笔记明细（共${data.notes.length}篇）：
${notesSummary}

${data.images && data.images.length > 0 ? "附有小红书创作者中心后台截图（包括账号诊断雷达图和流量来源分布），请结合截图中的数据和以上笔记数据一起分析。" : ""}

请进行深度账号诊断，给出内容规划、选题创新和改进建议。`;

  let result: string;
  if (data.images && data.images.length > 0) {
    result = await callDeepSeekAPIWithImages(systemPrompt, userPrompt, data.images, 0.8);
  } else {
    result = await callDeepSeekAPI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      "deepseek-chat",
      0.8
    );
  }

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        diagnosis: parsed.diagnosis || "",
        contentPlan: parsed.contentPlan || "",
        topicSuggestions: parsed.topicSuggestions || [],
        improvements: parsed.improvements || "",
      };
    }
    throw new Error("Failed to parse JSON from response");
  } catch (error) {
    console.error("Failed to parse account diagnosis:", error);
    return {
      diagnosis: result,
      contentPlan: "",
      topicSuggestions: [],
      improvements: "",
    };
  }
}

// 诊断对话 — chatbot
export async function diagnosisChat(params: {
  diagnosisContext: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  images?: string[];
}): Promise<string> {
  const systemPrompt = `你是一位资深的小红书账号运营顾问。以下是之前对用户账号的诊断分析结果，请基于这些分析结果回答用户的问题。

如果用户提出了新的想法或方向，请给出具体的运营建议和可行性分析。
如果用户追问某个建议的细节，请给出更具体的执行方案。
请用专业但亲切的语气，像在给朋友做一对一指导。

之前的诊断分析结果：
${params.diagnosisContext}`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...params.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  return callDeepSeekAPI(messages, "deepseek-chat", 0.8);
}
