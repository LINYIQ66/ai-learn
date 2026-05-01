const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '127.0.0.1', user: 'debian-sys-maint', password: '7kWuvHW9ve0Zexc5',
  database: 'ai_learn', socketPath: '/var/run/mysqld/mysqld.sock'
});

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
    if (quizzes) for (const [q, opts, ans, pts, ord] of quizzes) {
      await conn.query('INSERT INTO quizzes (lesson_id,question,options,correct_answer,points,sort_order) VALUES (?,?,?,?,?,?)',
        [lid, q, opts, ans, pts, ord]);
    }
  }
  await conn.release();
}

async function main() {
  // Course 10: 机器学习基础
  await seedCourse(10, [
    ['🧪 什么是机器学习','ML核心概念','## 🧪 什么是机器学习\n\n### ML定义\n让计算机从数据中自动学习规律，无需显式编程。\n\n### 传统编程vs ML\n| 传统 | 机器学习 |\n|------|----------|\n| 规则+数据→结果 | 数据+结果→规则 |\n| 人工写逻辑 | 自动学规律 |\n\n### 三要素\n```\n数据(D) + 算法(A) + 算力(C) = 模型\n```\n\n### 发展简史\n- 1959 Arthur Samuel提出ML\n- 1986 BP算法\n- 2012 ImageNet突破\n- 2022 大模型时代\n\n> 🧪 ML让计算机拥有了"学习"能力',12,1,
     [['ML三要素不包括？','[{"label":"A","text":"数据"},{"label":"B","text":"算法"},{"label":"C","text":"算力"},{"label":"D","text":"UI设计"}]','D',2,1]]],
    ['👁️ 监督学习','分类与回归','## 👁️ 监督学习\n\n### 核心思想\n给AI标注好的数据，让它学会映射关系。\n\n### 两大任务\n| 任务 | 输出 | 示例 |\n|------|------|------|\n| 分类 | 类别 | 猫/狗识别 |\n| 回归 | 数值 | 房价预测 |\n\n### 经典算法\n```python\n# 决策树\nfrom sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier()\nmodel.fit(X_train, y_train)\n\n# 随机森林\nfrom sklearn.ensemble import RandomForestClassifier\n```\n\n### 评估指标\n- 准确率 Accuracy\n- 精确率 Precision\n- 召回率 Recall\n- F1-Score\n\n> 👁️ 监督学习=有答案的练习题',15,2,
     [['房价预测属于？','[{"label":"A","text":"分类"},{"label":"B","text":"回归"},{"label":"C","text":"聚类"},{"label":"D","text":"降维"}]','B',2,1]]],
    ['🔍 无监督学习','聚类与降维','## 🔍 无监督学习\n\n### 核心思想\n无需标注，AI自己发现数据中的模式。\n\n### 经典任务\n| 任务 | 算法 | 应用 |\n|------|------|------|\n| 聚类 | K-Means | 客户分群 |\n| 降维 | PCA | 数据可视化 |\n| 关联 | Apriori | 购物篮分析 |\n\n### K-Means实战\n```python\nfrom sklearn.cluster import KMeans\nkmeans = KMeans(n_clusters=3)\nkmeans.fit(data)\nlabels = kmeans.labels_  # 每个点的分组\n```\n\n### 使用场景\n- 🛒 用户分群\n- 🏷️ 异常检测\n- 📊 数据压缩\n\n> 🔍 无监督学习=没有标准答案的探索',12,3,
     [['K-Means属于？','[{"label":"A","text":"监督学习"},{"label":"B","text":"无监督学习"},{"label":"C","text":"强化学习"},{"label":"D","text":"都不是"}]','B',2,1]]],
    ['🧠 神经网络入门','深度学习基础','## 🧠 神经网络入门\n\n### 什么是神经网络\n模拟人脑神经元连接的计算模型。\n\n### 结构\n```\n输入层 → 隐藏层 → 输出层\n[特征]    [计算]    [结果]\n```\n\n### 关键概念\n| 概念 | 说明 |\n|------|------|\n| 神经元 | 基本计算单元 |\n| 权重 | 连接强度 |\n| 激活函数 | 非线性变换 |\n| 反向传播 | 学习算法 |\n\n### 简单示例\n```python\nfrom sklearn.neural_network import MLPClassifier\nnn = MLPClassifier(hidden_layer_sizes=(100,))\nnn.fit(X_train, y_train)\n```\n\n> 🧠 神经网络=AI的"大脑"',15,4,
     [['神经网络的输入层接收？','[{"label":"A","text":"结果"},{"label":"B","text":"特征数据"},{"label":"C","text":"权重"},{"label":"D","text":"标签"}]','B',2,1]]]
  ]);
  console.log('✅ 10: 机器学习基础');

  // Course 11: AI学习方法论
  await seedCourse(11, [
    ['🗺️ AI学习路线图','规划学习路径','## 🗺️ AI学习路线图\n\n### 推荐路径\n| 阶段 | 内容 | 时间 |\n|------|------|------|\n| 1 | Python基础 | 2周 |\n| 2 | 数学基础 | 3周 |\n| 3 | ML入门 | 4周 |\n| 4 | 深度学习 | 4周 |\n| 5 | 项目实战 | 持续 |\n\n### 学习原则\n- 80/20法则：学20%核心用出80%效果\n- 以用带学：先做个项目再补理论\n- 费曼技巧：用简单语言解释学到的\n\n### 推荐资源\n- 吴恩达ML课程\n- Fast.ai实战课程\n- Kaggle竞赛\n\n> 🗺️ 方向比速度更重要',10,1,
     [['AI学习第一阶段的推荐？','[{"label":"A","text":"深度学习"},{"label":"B","text":"Python基础"},{"label":"C","text":"神经网络"},{"label":"D","text":"强化学习"}]','B',2,1]]],
    ['🏗️ 构建知识体系','系统化学习','## 🏗️ 构建知识体系\n\n### 知识金字塔\n```\n    实战项目\n   ─────────\n  工具与框架\n ───────────\n 算法与理论\n───────────\n数学与编程基础\n```\n\n### 每层重点\n| 层级 | 核心 |\n|------|------|\n| 基础 | Python+线代+概率 |\n| 算法 | 监督/无监督/强化 |\n| 工具 | sklearn/PyTorch |\n| 实战 | Kaggle+项目 |\n\n### 避免的坑\n- ❌ 只看不练\n- ❌ 追求完美理论\n- ❌ 同时学太多\n\n> 🏗️ 自底向上，层层递进',10,2,
     [['知识体系最底层是？','[{"label":"A","text":"实战项目"},{"label":"B","text":"框架"},{"label":"C","text":"数学编程基础"},{"label":"D","text":"论文"}]','C',2,1]]],
    ['💻 实践项目驱动','做中学','## 💻 实践项目驱动\n\n### 为什么要做项目\n理论学习只占20%，实践占80%。\n\n### 初级项目\n| 项目 | 技能 |\n|------|------|\n| 手写数字识别 | ML基础 |\n| 电影推荐系统 | 协同过滤 |\n| 情感分析 | NLP入门 |\n| 房价预测 | 回归分析 |\n\n### 中级项目\n- 图片分类器\n- 聊天机器人\n- 股票预测\n\n### 项目流程\n```\n1. 定义问题\n2. 收集数据\n3. 选择模型\n4. 训练调优\n5. 部署上线\n```\n\n> 💻 一个项目胜过十本书',12,3,
     [['项目流程第一步？','[{"label":"A","text":"选择模型"},{"label":"B","text":"部署上线"},{"label":"C","text":"定义问题"},{"label":"D","text":"收集数据"}]','C',2,1]]],
    ['🔄 持续学习方法','保持学习动力','## 🔄 持续学习方法\n\n### 每日微习惯\n- 读一篇AI文章(10分钟)\n- 写一段代码(15分钟)\n- 分享一个知识点(5分钟)\n\n### 信息源\n| 来源 | 频率 |\n|------|------|\n| arXiv | 每日论文 |\n| Twitter/X | 行业动态 |\n| GitHub | 开源项目 |\n| 技术博客 | 深度文章 |\n\n### 学习社区\n- Kaggle竞赛\n- GitHub开源贡献\n- AI学习社群\n\n### 保持动力\n```\n设定里程碑→达成庆祝→分享成果→设定新目标\n```\n\n> 🔄 AI领域日新月异，终身学习是必修课',10,4,
     [['持续学习的关键？','[{"label":"A","text":"学完就停"},{"label":"B","text":"保持微习惯"},{"label":"C","text":"只关注理论"},{"label":"D","text":"不实践"}]','B',2,1]]]
  ]);
  console.log('✅ 11: AI学习方法论');

  // Course 12: AI伦理与安全
  await seedCourse(12, [
    ['⚖️ AI伦理原则','负责任的AI','## ⚖️ AI伦理原则\n\n### 四大原则\n| 原则 | 含义 |\n|------|------|\n| 公平 | 不歧视任何群体 |\n| 透明 | 可解释决策过程 |\n| 隐私 | 保护个人数据 |\n| 问责 | 有人为AI行为负责 |\n\n### 为什么要关注伦理\n- 算法偏见可能导致歧视\n- AI决策影响真实人生\n- 数据泄露威胁隐私\n\n### 经典案例\n```\n招聘AI因历史数据偏向男性候选人\n→ 需要检测和纠正偏见\n```\n\n> ⚖️ AI的进步必须以伦理为前提',10,1,
     [['AI伦理四大原则不包括？','[{"label":"A","text":"公平"},{"label":"B","text":"效率优先"},{"label":"C","text":"透明"},{"label":"D","text":"隐私"}]','B',2,1]]],
    ['🔒 隐私保护','AI与数据安全','## 🔒 隐私保护\n\n### 数据隐私挑战\n- AI训练需要大量数据\n- 个人信息可能被泄露\n- 模型可能"记住"训练数据\n\n### 保护技术\n| 技术 | 原理 |\n|------|------|\n| 联邦学习 | 数据不出本地 |\n| 差分隐私 | 添加噪声保护 |\n| 同态加密 | 加密数据计算 |\n\n### 用户权利\n- 知情权：知道AI如何使用数据\n- 删除权：要求删除个人数据\n- 拒绝权：拒绝AI自动化决策\n\n> 🔒 技术进步不应以牺牲隐私为代价',10,2,
     [['联邦学习的特点？','[{"label":"A","text":"数据集中存储"},{"label":"B","text":"数据不出本地"},{"label":"C","text":"不需要数据"},{"label":"D","text":"公开全部数据"}]','B',2,1]]],
    ['🎯 算法偏见','识别与消除偏见','## 🎯 算法偏见\n\n### 偏见来源\n- 训练数据不均衡\n- 标注者主观偏好\n- 特征选择不当\n\n### 检测方法\n```python\n# 分析模型对不同群体的表现\nfrom fairlearn.metrics import demographic_parity_difference\n\n# 计算公平性指标\ndp_diff = demographic_parity_difference(\n    y_true, y_pred, sensitive_features=gender\n)\n```\n\n### 缓解策略\n| 方法 | 说明 |\n|------|------|\n| 数据重采样 | 平衡样本 |\n| 公平约束 | 训练时限制 |\n| 后处理 | 调整输出 |\n\n> 🎯 公平的AI才是好AI',12,3,
     [['算法偏见主要来自？','[{"label":"A","text":"代码bug"},{"label":"B","text":"训练数据不均衡"},{"label":"C","text":"服务器"},{"label":"D","text":"网络速度"}]','B',2,1]]],
    ['🛡️ AI安全','防范AI风险','## 🛡️ AI安全\n\n### 安全威胁\n| 威胁 | 说明 |\n|------|------|\n| 对抗攻击 | 微小扰动欺骗AI |\n| 数据投毒 | 污染训练数据 |\n| 模型窃取 | 逆向工程模型 |\n| 提示注入 | 绕过安全限制 |\n\n### 防护措施\n- 输入验证和过滤\n- 模型鲁棒性训练\n- 定期安全审计\n- 人类监督机制\n\n### 负责任AI框架\n```\n设计→开发→测试→部署→监控→改进\n每个环节都要考虑安全\n```\n\n> 🛡️ AI能力越强，安全越重要',12,4,
     [['对抗攻击是什么？','[{"label":"A","text":"物理攻击"},{"label":"B","text":"微小扰动欺骗AI"},{"label":"C","text":"断网"},{"label":"D","text":"关机"}]','B',2,1]]]
  ]);
  console.log('✅ 12: AI伦理与安全');

  // Course 13: AI前沿趋势
  await seedCourse(13, [
    ['🌊 大模型发展','LLM最新进展','## 🌊 大模型发展\n\n### 2024-2026大模型格局\n| 模型 | 公司 | 特点 |\n|------|------|------|\n| GPT-5 | OpenAI | 多模态王者 |\n| Claude 4 | Anthropic | 安全优先 |\n| Gemini | Google | 生态整合 |\n| DeepSeek | 深度求索 | 开源领先 |\n\n### 关键趋势\n- 参数规模持续增长\n- 推理能力大幅提升\n- 多模态融合\n- 端侧部署\n\n### 开源vs闭源\n```\n闭源：GPT系列、Claude\n开源：Llama、DeepSeek、Mistral\n```\n\n> 🌊 大模型正在重塑整个AI产业',10,1,
     [['DeepSeek的特点是？','[{"label":"A","text":"闭源"},{"label":"B","text":"开源领先"},{"label":"C","text":"仅绘画"},{"label":"D","text":"仅翻译"}]','B',2,1]]],
    ['🔮 多模态AI','融合多种感官','## 🔮 多模态AI\n\n### 什么是多模态\n同时理解和生成文本、图像、音频、视频。\n\n### 核心能力\n| 模态 | 输入 | 输出 |\n|------|------|------|\n| 文本→图像 | "夕阳海滩" | 生成图片 |\n| 图像→文本 | 照片 | 描述场景 |\n| 语音→文本 | 录音 | 转录文字 |\n| 视频→理解 | 视频 | 内容总结 |\n\n### 应用场景\n- 🔍 以图搜图\n- 🎬 视频内容理解\n- 🤖 具身智能\n- 🏥 医疗多模态诊断\n\n### 代表模型\nGPT-4V、Gemini、Claude Vision\n\n> 🔮 未来AI将像人一样感知世界',10,2,
     [['多模态AI能处理？','[{"label":"A","text":"仅文本"},{"label":"B","text":"文本+图像+语音等"},{"label":"C","text":"仅图像"},{"label":"D","text":"仅代码"}]','B',2,1]]],
    ['🤖 AI Agent','自主智能体','## 🤖 AI Agent\n\n### 什么是AI Agent\n能自主规划、执行、反思的AI系统。\n\n### Agent架构\n```\n感知→思考→行动→观察→循环\n```\n\n### 核心能力\n| 能力 | 说明 |\n|------|------|\n| 规划 | 分解任务 |\n| 工具使用 | 调用API |\n| 记忆 | 长期记忆 |\n| 反思 | 自我纠错 |\n\n### 应用实例\n- AutoGPT：自主完成任务\n- Devin：AI软件工程师\n- Hermes：多平台AI助手\n\n> 🤖 2026是AI Agent元年',12,3,
     [['AI Agent的核心能力不包括？','[{"label":"A","text":"规划"},{"label":"B","text":"工具使用"},{"label":"C","text":"情感"},{"label":"D","text":"记忆"}]','C',2,1]]],
    ['🔭 AGI展望','通用人工智能','## 🔭 AGI展望\n\n### AGI vs 当前AI\n| 维度 | 当前AI | AGI |\n|------|--------|-----|\n| 任务 | 特定领域 | 任意任务 |\n| 学习 | 需大量数据 | 少量样本 |\n| 迁移 | 弱 | 强 |\n| 推理 | 有限 | 深度 |\n\n### 技术路径\n- 更大模型 → 涌现能力\n- 世界模型 → 理解物理\n- 具身智能 → 与现实交互\n\n### 时间线预测\n- 2026-2028：Agent成熟\n- 2028-2030：接近AGI\n- 2030+：AGI可能出现\n\n### 你的角色\n```\n不是被AI取代，而是会用AI的人取代不会的\n→ 现在开始学习就是最好的时机\n```\n\n> 🔭 AGI不只是技术问题，更是人类文明的转折点',15,4,
     [['AGI和当前AI的最大区别？','[{"label":"A","text":"速度更快"},{"label":"B","text":"能处理任意任务"},{"label":"C","text":"界面更好"},{"label":"D","text":"更便宜"}]','B',2,1]]]
  ]);
  console.log('✅ 13: AI前沿趋势');

  // Course 2: AI基础概念 (补全)
  await seedCourse(2, [
    ['🤖 什么是人工智能','AI核心概念','## 🤖 什么是人工智能\n\n人工智能(Artificial Intelligence)是让计算机系统模拟人类智能行为的科学技术。\n\n### AI的本质\n> AI = 感知 + 推理 + 学习 + 行动\n\n### 图灵测试\n如果人类无法区分机器和人的回答，就通过了图灵测试。\n\n### AI的分类\n| 类型 | 说明 | 现状 |\n|------|------|------|\n| 弱AI | 专注单一任务 | 已实现 |\n| 强AI | 通用智能 | 未实现 |\n\n### 日常AI\n语音助手、推荐算法、人脸识别、翻译\n\n> 💡 AI已经融入生活，只是你未必察觉',10,1,
     [['图灵测试用来判断？','[{"label":"A","text":"代码正确"},{"label":"B","text":"机器是否表现出智能"},{"label":"C","text":"网速"},{"label":"D","text":"图片质量"}]','B',2,1]]],
    ['📜 AI发展简史','从图灵到ChatGPT','## 📜 AI发展简史\n\n### 重要里程碑\n```\n1950 图灵测试提出\n1956 达特茅斯会议→AI诞生\n1997 DeepBlue击败国际象棋冠军\n2011 Siri发布\n2012 AlexNet引爆深度学习\n2016 AlphaGo击败李世石\n2022 ChatGPT横空出世\n2024 Sora文生视频\n```\n\n### 三次浪潮\n| 浪潮 | 时期 | 特点 |\n|------|------|------|\n| 1 | 1950s-70s | 符号推理 |\n| 2 | 1980s-90s | 专家系统 |\n| 3 | 2010s-现在 | 深度学习 |\n\n> 📜 了解历史，才能看清未来',12,2,
     [['深度学习革命始于哪年？','[{"label":"A","text":"2005"},{"label":"B","text":"2012"},{"label":"C","text":"2018"},{"label":"D","text":"2020"}]','B',2,1]]],
    ['🧬 ML vs DL','分清概念','## 🧬 机器学习vs深度学习\n\n### 关系图\n```\nAI ⊃ 机器学习 ⊃ 深度学习\n```\n\n### 对比\n| 维度 | ML | DL |\n|------|-----|-----|\n| 特征 | 人工提取 | 自动学习 |\n| 数据量 | 少-中 | 大量 |\n| 算力 | 低 | 高 |\n| 可解释 | 较好 | 较差 |\n\n### 何时用ML vs DL\n- 数据<1万+简单任务→ML\n- 数据>10万+复杂任务→DL\n\n> 🧬 DL是ML的子集，不是替代',12,3,
     [['深度学习和机器学习的关系？','[{"label":"A","text":"完全无关"},{"label":"B","text":"DL是ML的子集"},{"label":"C","text":"ML是DL的子集"},{"label":"D","text":"完全一样"}]','B',2,1]]],
    ['⚙️ AI核心技术','关键使能技术','## ⚙️ AI核心技术\n\n### 五大支柱\n| 技术 | 作用 |\n|------|------|\n| 机器学习 | 从数据学习 |\n| 深度学习 | 处理复杂模式 |\n| NLP | 理解语言 |\n| 计算机视觉 | 看懂图像 |\n| 强化学习 | 决策优化 |\n\n### Transformer架构\n```\n输入→自注意力→前馈网络→输出\n     ↑___N层___↓\n```\n这是ChatGPT等所有大模型的基础！\n\n### 为什么现在爆发\n- 💾 互联网海量数据\n- ⚡ GPU算力飞跃\n- 🧪 Transformer突破\n\n> ⚙️ NLP+CV+RL三驾马车驱动AI',12,4,
     [['Transformer是什么？','[{"label":"A","text":"编程语言"},{"label":"B","text":"大模型基础架构"},{"label":"C","text":"数据库"},{"label":"D","text":"操作系统"}]','B',2,1]]],
    ['🔭 AI的未来','展望与思考','## 🔭 AI的未来\n\n### 近期趋势(2026-2028)\n- 🤖 AI Agent普及\n- 🎬 AI视频生成成熟\n- 🧬 AI辅助科研\n- 🏥 AI精准医疗\n\n### 长期展望\n| 领域 | 可能变革 |\n|------|----------|\n| 教育 | 个性化AI导师 |\n| 医疗 | AI医生辅助 |\n| 交通 | L5自动驾驶 |\n| 科研 | AI加速发现 |\n\n### 给学习者的建议\n```\n1. 保持好奇心\n2. 持续学习和实践\n3. 关注伦理和安全\n4. 拥抱变化\n```\n\n> 🔭 最好的预测未来的方式，就是创造它',10,5,
     [['给AI学习者的首要建议？','[{"label":"A","text":"等AI成熟再学"},{"label":"B","text":"保持好奇持续学习"},{"label":"C","text":"不用学"},{"label":"D","text":"只看不练"}]','B',2,1]]]
  ]);
  console.log('✅ 2: AI基础概念');

  // Course 3: 数据分析入门
  await seedCourse(3, [
    ['📊 数据思维','建立数据意识','## 📊 数据思维\n\n### 什么是数据思维\n用数据来理解世界、做决策的能力。\n\n### 数据驱动决策流程\n```\n提出问题→收集数据→分析→得出结论→行动\n```\n\n### 关键概念\n| 概念 | 说明 |\n|------|------|\n| 结构化数据 | 表格形式 |\n| 非结构化数据 | 文本/图片 |\n| 数据质量 | Garbage in→Garbage out |\n\n### 生活中的数据分析\n- 购物比价\n- 运动数据追踪\n- 学习进度监控\n\n> 📊 数据思维是AI时代的基础素养',10,1,
     [['数据驱动决策第一步？','[{"label":"A","text":"收集数据"},{"label":"B","text":"提出问题"},{"label":"C","text":"得出结论"},{"label":"D","text":"行动"}]','B',2,1]]],
    ['🐍 Python数据处理','Pandas入门','## 🐍 Python数据处理\n\n### Pandas核心\n```python\nimport pandas as pd\n\n# 读取数据\ndf = pd.read_csv("sales.csv")\n\n# 查看概览\ndf.head()       # 前5行\ndf.describe()   # 统计摘要\ndf.info()       # 数据类型\n\n# 基本操作\ndf["price"].mean()   # 平均值\ndf.groupby("category").sum()  # 分组汇总\n```\n\n### DataFrame操作\n| 操作 | 代码 |\n|------|------|\n| 筛选 | df[df["price"]>100] |\n| 排序 | df.sort_values("date") |\n| 去重 | df.drop_duplicates() |\n| 填充 | df.fillna(0) |\n\n> 🐍 Pandas是数据分析的瑞士军刀',15,2,
     [['Pandas中读取CSV用？','[{"label":"A","text":"pd.read_excel()"},{"label":"B","text":"pd.read_csv()"},{"label":"C","text":"pd.open()"},{"label":"D","text":"pd.load()"}]','B',2,1]]],
    ['📈 数据可视化','让数据说话','## 📈 数据可视化\n\n### Matplotlib入门\n```python\nimport matplotlib.pyplot as plt\n\n# 折线图\nplt.plot(x, y)\nplt.title("销售趋势")\nplt.show()\n\n# 柱状图\nplt.bar(categories, values)\n\n# 饼图\nplt.pie(sizes, labels=labels, autopct="%1.1f%%")\n```\n\n### 图表选择指南\n| 目的 | 图表 |\n|------|------|\n| 趋势 | 折线图 |\n| 对比 | 柱状图 |\n| 占比 | 饼图 |\n| 分布 | 直方图 |\n| 关系 | 散点图 |\n\n### 可视化原则\n- 简洁明了\n- 标注清晰\n- 颜色恰当\n\n> 📈 一张好图胜过千言万语',12,3,
     [['显示趋势用？','[{"label":"A","text":"饼图"},{"label":"B","text":"折线图"},{"label":"C","text":"柱状图"},{"label":"D","text":"散点图"}]','B',2,1]]],
    ['📐 统计分析基础','描述与推断','## 📐 统计分析基础\n\n### 描述性统计\n```python\nimport numpy as np\n\ndata = [85, 90, 78, 92, 88]\nnp.mean(data)    # 均值 86.6\nnp.median(data)  # 中位数 88\nnp.std(data)     # 标准差 4.93\n```\n\n### 关键指标\n| 指标 | 含义 |\n|------|------|\n| 均值 | 平均值 |\n| 中位数 | 中间值 |\n| 标准差 | 离散程度 |\n| 相关系数 | 关联强度 |\n\n### 相关性分析\n```python\ndf.corr()  # 计算所有变量间相关系数\n```\n\n> 📐 统计是数据分析的语言',12,4,
     [['标准差衡量？','[{"label":"A","text":"平均值"},{"label":"B","text":"离散程度"},{"label":"C","text":"最大值"},{"label":"D","text":"总数"}]','B',2,1]]],
    ['🎯 实战案例','电商数据分析','## 🎯 实战：电商数据分析\n\n### 场景\n分析某电商平台一个月销售数据\n\n### 分析步骤\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# 1. 加载数据\ndf = pd.read_csv("ecommerce.csv")\n\n# 2. 数据清洗\ndf.dropna(inplace=True)\ndf["date"] = pd.to_datetime(df["date"])\n\n# 3. 分析\n# 按日汇总销售额\ndaily = df.groupby("date")["amount"].sum()\n\n# 4. 可视化\ndaily.plot(title="每日销售额")\nplt.show()\n\n# 5. 洞察\nprint(f"总销售额: {df.amount.sum():,}")\nprint(f"客单价: {df.amount.mean():.2f}")\n```\n\n### 分析结论模板\n| 维度 | 发现 | 建议 |\n|------|------|------|\n| 趋势 | 周末销量高 | 加大促销 |\n| 品类 | 电子最热 | 增加库存 |\n| 用户 | 复购率30% | 会员计划 |\n\n> 🎯 数据会说真话，关键是要会问',15,5,
     [['完整的数据分析流程？','[{"label":"A","text":"加载→清洗→分析→可视化→洞察"},{"label":"B","text":"直接画图"},{"label":"C","text":"只看数字"},{"label":"D","text":"跳过清洗"}]','A',2,1]]]
  ]);
  console.log('✅ 3: 数据分析入门');

  console.log('✅ ALL COURSES DONE');
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
