const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '127.0.0.1', user: 'debian-sys-maint', password: '7kWuvHW9ve0Zexc5',
  database: 'ai_learn', socketPath: '/var/run/mysqld/mysqld.sock'
});

function L(cid, title, summary, content, dur, order, quizzes) {
  const lessons = Array.isArray(title) ? title.map((t,i) => [t, summary[i], content[i], dur[i], order[i], quizzes[i]]) : [[title,summary,content,dur,order,quizzes]];
  return {cid, lessons};
}

async function seedCourse(cid, lessons) {
  const conn = await pool.getConnection();
  await conn.query('DELETE FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id=?)', [cid]);
  await conn.query('DELETE FROM lessons WHERE course_id=?', [cid]);
  
  for (const [title, summary, content, dur, order, quizzes] of lessons) {
    const [r] = await conn.query(
      'INSERT INTO lessons (course_id,title,summary,content,duration,sort_order) VALUES (?,?,?,?,?,?)',
      [cid, title, summary, content, dur, order]
    );
    const lid = r.insertId;
    if (quizzes) {
      for (const [q, opts, ans, pts, ord] of quizzes) {
        await conn.query(
          'INSERT INTO quizzes (lesson_id,question,options,correct_answer,points,sort_order) VALUES (?,?,?,?,?,?)',
          [lid, q, opts, ans, pts, ord]
        );
      }
    }
  }
  await conn.release();
}

async function main() {
  // Course 4: AI入门通识
  await seedCourse(4, [
    ['🤖 AI是什么','AI基本概念','## 🤖 什么是人工智能？\n\nAI=Artificial Intelligence，让机器模拟人类智能。\n\n### AI三层次\n| 层次 | 能力 | 代表 |\n|------|------|------|\n| 弱AI | 单一任务 | ChatGPT |\n| 强AI | 通用智能 | 未实现 |\n| 超AI | 超越人类 | 理论 |\n\n### AI简史\n- 1956 达特茅斯会议，AI诞生\n- 1997 DeepBlue击败国际象棋冠军\n- 2012 深度学习革命\n- 2022 ChatGPT引爆全球\n\n> 💡 AI爆发三要素：大数据+算力+算法突破',10,1,
     [['目前AI处于哪个层次？','[{"label":"A","text":"超AI"},{"label":"B","text":"强AI"},{"label":"C","text":"弱AI"},{"label":"D","text":"都不是"}]','C',2,1],
      ['ChatGPT哪年发布？','[{"label":"A","text":"2020"},{"label":"B","text":"2021"},{"label":"C","text":"2022"},{"label":"D","text":"2023"}]','C',2,2]]],
    ['🧠 AI如何学习','机器学习原理','## 🧠 AI如何学习？\n\n### 人类 vs 机器学习\n| 方面 | 人类 | 机器 |\n|------|------|------|\n| 方式 | 阅读实践 | 数据训练 |\n| 速度 | 慢 | 秒级百万数据 |\n| 泛化 | 强 | 需大量样本 |\n\n### 三种学习方式\n- **监督学习**：标注数据→学习规律\n- **无监督学习**：自动发现规律\n- **强化学习**：试错+奖励\n\n```python\n# 线性回归示例\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X, y)  # 学习！\n```\n\n> 🎯 核心：数据+算法+算力=智能',12,2,
     [['数据标注训练属于？','[{"label":"A","text":"无监督"},{"label":"B","text":"监督学习"},{"label":"C","text":"强化学习"},{"label":"D","text":"迁移学习"}]','B',2,1]]],
    ['🌍 AI应用全景','行业应用','## 🌍 AI应用全景\n\n### AI改变每个行业\n| 行业 | 应用 |\n|------|------|\n| 🏥 医疗 | 影像诊断 |\n| 🎓 教育 | 个性化学习 |\n| 🏦 金融 | 风控 |\n| 🛒 电商 | 推荐系统 |\n| 🚗 交通 | 自动驾驶 |\n\n### 普通人AI工具\n- 写作: ChatGPT, Claude\n- 绘画: Midjourney\n- 编程: Copilot\n- 办公: Notion AI\n\n> 🌟 AI增强人类，不是取代人类',10,3,
     [['AI在医疗的主要应用？','[{"label":"A","text":"挂号"},{"label":"B","text":"影像诊断"},{"label":"C","text":"收费"},{"label":"D","text":"排班"}]','B',2,1]]],
    ['🚀 AI工具上手','实操指南','## 🚀 AI工具快速上手\n\n### Prompt公式\n> 🎯 **角色+任务+要求+格式**\n\n示例：你是一位Python老师，用3个例子解释循环，加注释\n\n### 主流工具\n| 工具 | 擅长 | 费用 |\n|------|------|------|\n| ChatGPT | 对话 | 免费 |\n| Claude | 长文 | 免费 |\n| Midjourney | 绘画 | 付费 |\n| Copilot | 编程 | 付费 |\n\n### 试试看\n1. 让AI写一首诗\n2. 规划学习计划\n3. 解释不懂的概念\n\n> 💡 每天用AI做一件小事，一周见效',8,4,
     [['好的Prompt应该？','[{"label":"A","text":"越短越好"},{"label":"B","text":"越模糊越好"},{"label":"C","text":"角色+任务+要求"},{"label":"D","text":"只英文"}]','C',2,1]]]
  ]);
  console.log('✅ Course 4: AI入门通识');

  // Course 5: AI工具实战
  await seedCourse(5, [
    ['💬 ChatGPT深度使用','精通对话AI','## 💬 ChatGPT深度使用\n\n### 核心技巧\n- **角色扮演**：你是XX专家\n- **分步提问**：复杂任务拆小\n- **给示例**：Few-shot prompting\n- **迭代优化**：不满意就追问\n\n### 实用模板\n```\n角色：资深产品经理\n任务：设计AI学习App功能\n要求：3个核心功能，每个100字\n格式：表格\n```\n\n### 常见场景\n| 场景 | Prompt关键词 |\n|------|-------------|\n| 写作 | 风格/字数/受众 |\n| 翻译 | 目标语言/正式度 |\n| 总结 | 要点数量/格式 |\n| 编程 | 语言/注释/测试 |\n\n> 💡 把AI当实习生：指令越清晰，输出越精准',12,1,
     [['ChatGPT属于什么类型AI？','[{"label":"A","text":"生成式AI"},{"label":"B","text":"视觉AI"},{"label":"C","text":"语音AI"},{"label":"D","text":"机器人"}]','A',2,1]]],
    ['🎨 AI绘画实战','Midjourney与SD','## 🎨 AI绘画实战\n\n### 主流工具对比\n| 工具 | 优点 | 缺点 |\n|------|------|------|\n| Midjourney | 艺术感强 | 付费 |\n| Stable Diffusion | 开源免费 | 需配置 |\n| DALL-E | 易用 | 限制多 |\n\n### Midjourney基础命令\n```\n/imagine prompt: 一只猫在星空下, \nwatercolor style, soft lighting --ar 16:9\n```\n\n### 参数说明\n- --ar 16:9 宽高比\n- --v 6 版本\n- --style raw 写实\n- --no text 排除元素\n\n> 🎨 AI绘画关键词：风格+主体+环境+光照+画质',10,2,
     [['Midjourney是？','[{"label":"A","text":"聊天机器人"},{"label":"B","text":"AI绘画工具"},{"label":"C","text":"代码编辑器"},{"label":"D","text":"翻译软件"}]','B',2,1]]],
    ['✍️ AI写作助手','高效内容创作','## ✍️ AI写作助手\n\n### 写作流程\n1. AI生成大纲\n2. 分段展开\n3. 人工润色\n4. AI校对\n\n### 常用提示词\n- 公众号：写一篇1000字科普文\n- 邮件：专业礼貌的商务邮件\n- 报告：结构化项目总结报告\n\n### 技巧\n```\n请用以下结构写作：\n1. 引人入胜的开头\n2. 3个核心论点+数据支撑\n3. 行动建议\n4. 总结升华\n```\n\n> ✍️ AI写框架，人来注入灵魂',10,3,
     [['AI写作的正确流程？','[{"label":"A","text":"AI写完全文"},{"label":"B","text":"AI大纲→展开→人工润色"},{"label":"C","text":"全部人工"},{"label":"D","text":"AI只校对"}]','B',2,1]]],
    ['📊 AI数据分析','用AI处理数据','## 📊 AI数据分析\n\n### 工具推荐\n| 工具 | 场景 |\n|------|------|\n| ChatGPT+Code | 代码分析 |\n| Julius AI | 可视化 |\n| Excel Copilot | 表格分析 |\n\n### 实操示例\n```\n上传销售数据CSV，问AI：\n1. 分析季度趋势\n2. 找出Top10产品\n3. 预测下季度销量\n```\n\n### 常用分析指令\n- 数据清洗：删除重复/填充缺失\n- 可视化：生成柱状图代码\n- 统计：计算均值/方差/相关\n\n> 📊 让AI写分析代码，你只需描述需求',12,4,
     [['AI数据分析的正确姿势？','[{"label":"A","text":"AI自动分析"},{"label":"B","text":"描述需求让AI写代码"},{"label":"C","text":"不用AI"},{"label":"D","text":"只做图表"}]','B',2,1]]]
  ]);
  console.log('✅ Course 5: AI工具实战');

  // Course 6: Prompt工程大师
  await seedCourse(6, [
    ['🎯 Prompt基础','提示词工程入门','## 🎯 Prompt工程基础\n\n### 什么是Prompt工程\n精心设计输入提示，引导AI产生期望输出。\n\n### 六大要素\n| 要素 | 说明 | 示例 |\n|------|------|------|\n| 角色 | 设定身份 | 你是XX专家 |\n| 任务 | 明确目标 | 写一篇报告 |\n| 背景 | 提供上下文 | 面向高中生 |\n| 格式 | 输出结构 | 表格/列表 |\n| 语气 | 风格要求 | 幽默/专业 |\n| 约束 | 限制条件 | 不超过500字 |\n\n### 好vs坏Prompt\n❌ "写Python教程"\n✅ "你是一位Python讲师，为初学者写一篇300字的变量教程，含2个代码示例，用markdown格式"',10,1,
     [['Prompt工程的核心要素有几个？','[{"label":"A","text":"3个"},{"label":"B","text":"4个"},{"label":"C","text":"6个"},{"label":"D","text":"8个"}]','C',2,1]]],
    ['🎭 角色扮演Prompt','让AI化身专家','## 🎭 角色扮演Prompt\n\n### 为什么有效\n设定角色让AI进入特定知识域，输出更专业。\n\n### 模板\n```\n你是[角色]，拥有[背景/经验]。\n请用[语气]回答以下问题：\n[问题]\n```\n\n### 实战示例\n```\n你是Steve Jobs，\n用你标志性的简洁风格，\n解释为什么AI会改变世界\n```\n\n### 角色库\n| 角色 | 用途 |\n|------|------|\n| 面试官 | 模拟面试 |\n| 客户 | 练习销售 |\n| 老师 | 学习辅导 |\n| 评审 | 代码审查 |\n\n> 🎭 角色越具体，AI表现越专业',10,2,
     [['角色扮演Prompt的好处？','[{"label":"A","text":"没区别"},{"label":"B","text":"输出更专业"},{"label":"C","text":"速度更快"},{"label":"D","text":"仅娱乐"}]','B',2,1]]],
    ['⛓️ 链式思维','CoT高级技巧','## ⛓️ Chain of Thought\n\n### 什么是CoT\n让AI逐步推理而不是直接给答案。\n\n### 对比\n❌ 直接问：23×47=?\n✅ CoT：先算20×47=940，再算3×47=141，相加=1081\n\n### 关键提示词\n- "让我们一步步思考"\n- "请列出推理过程"\n- "先分析，再回答"\n\n### 应用场景\n| 场景 | 效果 |\n|------|------|\n| 数学题 | 准确率+40% |\n| 逻辑推理 | 更严谨 |\n| 代码调试 | 定位更快 |\n| 决策分析 | 更全面 |\n\n> ⛓️ CoT让AI从"猜"变成"想"',12,3,
     [['CoT的全称是？','[{"label":"A","text":"Code of Thought"},{"label":"B","text":"Chain of Thought"},{"label":"C","text":"Call of Time"},{"label":"D","text":"Chain of Tools"}]','B',2,1]]],
    ['🔮 高级Prompt技巧','进阶玩法','## 🔮 高级Prompt技巧\n\n### Few-shot Learning\n给AI几个示例，让它模仿输出\n\n### Self-Consistency\n让AI多次回答，投票选最佳\n\n### Tree of Thoughts\nAI探索多条推理路径，选最优\n\n### 实战组合技\n```\n1. 角色设定 → 激活知识\n2. 示例展示 → 明确期望\n3. CoT推理 → 保证质量\n4. 格式约束 → 结构化输出\n5. 验证追问 → 纠错改进\n```\n\n### Prompt优化流程\n```\n初版→测试→分析输出→调整→再测试\n```\n\n> 🔮 好的Prompt是迭代出来的，不是一次写成的',15,4,
     [['哪种技巧给AI多个示例？','[{"label":"A","text":"Zero-shot"},{"label":"B","text":"Few-shot"},{"label":"C","text":"CoT"},{"label":"D","text":"Self-Consistency"}]','B',2,1]]]
  ]);
  console.log('✅ Course 6: Prompt工程大师');

  // Course 7,8,9,10,11,12,13...
  console.log('✅ Done');
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
