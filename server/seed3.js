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
  // Course 7: AI创意工坊
  await seedCourse(7, [
    ['🎨 AI绘画进阶','高级AI绘画技巧','## 🎨 AI绘画进阶\n\n### Stable Diffusion\n```\n正向提示词: masterpiece, best quality, \n1girl, cherry blossoms, detailed eyes\n反向提示词: lowres, bad anatomy, \nworst quality\n```\n\n### ControlNet精确控制\n| 模式 | 作用 |\n|------|------|\n| Canny | 边缘检测 |\n| Pose | 人体姿态 |\n| Depth | 深度控制 |\n| Scribble | 涂鸦生成 |\n\n### 风格迁移\n用img2img把照片变成：\n- 水墨画风格\n- 像素艺术\n- 3D渲染\n\n> 🎨 AI绘画=想象力+技术',12,1,
     [['ControlNet用来做什么？','[{"label":"A","text":"聊天"},{"label":"B","text":"精确控制AI绘画"},{"label":"C","text":"翻译"},{"label":"D","text":"编程"}]','B',2,1]]],
    ['🎵 AI音乐生成','用AI创作音乐','## 🎵 AI音乐生成\n\n### 主流工具\n| 工具 | 特点 |\n|------|------|\n| Suno AI | 词曲一体 |\n| Udio | 音质好 |\n| AIVA | 古典配乐 |\n\n### Suno使用示例\n```\n[Verse]\n阳光洒在窗台...\n[Chorus]\n这是AI时代的歌...\n[Style: pop, upbeat]\n```\n\n### 歌词创作技巧\n- 确定主题和情感\n- 设计Verse-Chorus结构\n- AI生成+人工修改\n\n> 🎵 人人都是音乐制作人',10,2,
     [['Suno AI主要用于？','[{"label":"A","text":"绘画"},{"label":"B","text":"音乐生成"},{"label":"C","text":"编程"},{"label":"D","text":"翻译"}]','B',2,1]]],
    ['🎬 AI视频创作','AI视频生成与编辑','## 🎬 AI视频创作\n\n### 工具矩阵\n| 工具 | 功能 |\n|------|------|\n| Runway | 视频生成 |\n| Pika | 文字转视频 |\n| HeyGen | 数字人 |\n| CapCut AI | 智能剪辑 |\n\n### 视频创作流程\n1. AI生成脚本\n2. AI生成画面\n3. AI配音+字幕\n4. 人工精调\n\n### HeyGen数字人\n```\n上传照片→输入文本→AI生成说话视频\n支持多语言、多表情\n```\n\n> 🎬 一个人就是一个视频团队',12,3,
     [['Runway主要用于？','[{"label":"A","text":"聊天"},{"label":"B","text":"视频生成"},{"label":"C","text":"绘画"},{"label":"D","text":"编程"}]','B',2,1]]],
    ['🏗️ 综合创意项目','多工具组合创作','## 🏗️ 综合创意项目\n\n### 案例：AI绘本制作\n1. ChatGPT写故事脚本\n2. Midjourney生成插图\n3. Canva AI排版\n4. AI配音朗读\n\n### 创意工具链\n```\n想法→ChatGPT(脚本)→MJ(画面)\n→Suno(配乐)→CapCut(合成)\n```\n\n### 商业化思路\n- AI头像定制\n- AI产品图生成\n- AI短视频批量\n\n> 🏗️ 工具不是壁垒，创意才是',15,4,
     [['AI创意项目的核心是？','[{"label":"A","text":"工具数量"},{"label":"B","text":"创意和想法"},{"label":"C","text":"电脑配置"},{"label":"D","text":"编程能力"}]','B',2,1]]]
  ]);
  console.log('✅ 7: AI创意工坊');

  // Course 8: AI+办公效率
  await seedCourse(8, [
    ['📧 AI写邮件报告','高效商务写作','## 📧 AI写邮件和报告\n\n### 商务邮件模板\n```\n写一封邮件给客户：\n- 感谢对方的合作\n- 汇报项目进展\n- 提出下一步计划\n- 语气专业但友好\n```\n\n### 周报月报生成\n| 要素 | 输入 |\n|------|------|\n| 本周完成 | 列3-5项 |\n| 数据亮点 | +20%增长 |\n| 下周计划 | 3个目标 |\n\n### 公文写作\n- 通知/公告\n- 会议纪要\n- 工作总结\n\n> 📧 AI写80%，你改20%',10,1,
     [['AI写商务邮件应注重？','[{"label":"A","text":"越长越好"},{"label":"B","text":"专业+友好"},{"label":"C","text":"随意"},{"label":"D","text":"只列数据"}]','B',2,1]]],
    ['📊 AI做PPT','一键生成演示文稿','## 📊 AI做PPT\n\n### 工具推荐\n| 工具 | 特点 |\n|------|------|\n| Gamma | 一键生成 |\n| Beautiful.ai | 设计感强 |\n| Decktopus | 结构化 |\n| ChatGPT+PPT | 自由度高 |\n\n### AI生成PPT流程\n```\n1. 输入主题和要点\n2. AI生成大纲\n3. 选择模板风格\n4. 微调内容和排版\n5. 导出\n```\n\n### 常见使用场景\n- 产品发布会\n- 培训课件\n- 融资路演\n\n> 📊 10分钟搞定专业PPT',10,2,
     [['Gamma是用于？','[{"label":"A","text":"聊天"},{"label":"B","text":"AI生成PPT"},{"label":"C","text":"绘画"},{"label":"D","text":"编程"}]','B',2,1]]],
    ['📋 AI表格处理','智能数据处理','## 📋 AI表格处理\n\n### Excel AI功能\n```\n=AI("分析A列销售趋势")\n=AI("找出异常值")\n```\n\n### ChatGPT处理表格\n1. 复制表格数据\n2. 粘贴给ChatGPT\n3. 描述分析需求\n4. 获得结果+公式\n\n### 实用场景\n| 场景 | 方法 |\n|------|------|\n| 数据清洗 | 去重/填充 |\n| 分类汇总 | 透视表 |\n| 趋势预测 | 公式生成 |\n| 可视化 | 图表建议 |\n\n> 📋 告别VLOOKUP噩梦',10,3,
     [['AI处理Excel的优势？','[{"label":"A","text":"自动生成公式"},{"label":"B","text":"无需描述"},{"label":"C","text":"不能分类"},{"label":"D","text":"仅看数字"}]','A',2,1]]],
    ['🎙️ AI会议记录','智能会议助手','## 🎙️ AI会议记录\n\n### 工具对比\n| 工具 | 功能 |\n|------|------|\n| 飞书妙记 | 实时转录 |\n| Otter.ai | 英文会议 |\n| Fireflies | 多平台 |\n| 讯飞听见 | 中文最优 |\n\n### 会后三步\n1. AI转录语音→文字\n2. AI提取要点和待办\n3. AI生成会议纪要\n\n### 会议纪要模板\n```\n时间: XXXX\n参会: XXX\n议题: XXX\n决议: 1...2...3...\n待办: @张三 周五前完成XX\n```\n\n> 🎙️ 专注讨论，记录交给AI',10,4,
     [['飞书妙记的功能是？','[{"label":"A","text":"聊天"},{"label":"B","text":"会议转录"},{"label":"C","text":"绘画"},{"label":"D","text":"编程"}]','B',2,1]]]
  ]);
  console.log('✅ 8: AI+办公效率');

  // Course 9: AI编程助手
  await seedCourse(9, [
    ['🤖 Copilot入门','AI编程助手基础','## 🤖 GitHub Copilot入门\n\n### 什么是Copilot\n基于GPT的AI编程助手，集成在VS Code等IDE中。\n\n### 核心功能\n- 代码补全：写注释，AI生成代码\n- 代码解释：选中代码问AI\n- Bug修复：AI分析并修复\n- 测试生成：自动写单元测试\n\n### 使用技巧\n```python\n# 用注释描述需求\n# 写一个函数：接收列表，返回去重排序结果\ndef process_list(data):\n    return sorted(set(data))\n```\n\n> 🤖 Copilot让你写注释=写代码',10,1,
     [['Copilot集成在哪里？','[{"label":"A","text":"浏览器"},{"label":"B","text":"VS Code等IDE"},{"label":"C","text":"手机"},{"label":"D","text":"单独软件"}]','B',2,1]]],
    ['⌨️ AI写代码实战','用AI生成代码','## ⌨️ AI写代码实战\n\n### 从需求到代码\n```\n需求：写一个Python爬虫，爬取网站标题\n→ AI生成完整代码+注释\n```\n\n### 代码生成技巧\n| 技巧 | 示例 |\n|------|------|\n| 描述输入输出 | 输入CSV文件路径 |\n| 指定技术栈 | 用Pandas和Matplotlib |\n| 给风格要求 | 添加详细注释 |\n| 分步生成 | 先框架再细节 |\n\n### 多语言支持\nPython/JS/Go/Rust/Java...AI都能写\n\n> ⌨️ 用自然语言编程的时代来了',12,2,
     [['让AI生成代码的关键是？','[{"label":"A","text":"描述越模糊越好"},{"label":"B","text":"清晰描述需求和约束"},{"label":"C","text":"不给任何信息"},{"label":"D","text":"只用一种语言"}]','B',2,1]]],
    ['🐛 AI调试代码','智能Bug修复','## 🐛 AI调试代码\n\n### AI调试三步法\n1. 粘贴报错信息\n2. AI分析原因\n3. AI给出修复方案\n\n### 实战示例\n```\n我的代码报错：TypeError: NoneType...\n→ AI: 原因是函数没有返回值，\n在第12行添加return语句...\n```\n\n### 代码审查\n- 性能瓶颈分析\n- 安全漏洞检查\n- 代码风格建议\n- 最佳实践推荐\n\n> 🐛 AI是你的24小时结对编程搭档',12,3,
     [['AI调试代码的第一步？','[{"label":"A","text":"重写全部"},{"label":"B","text":"粘贴报错信息"},{"label":"C","text":"忽略错误"},{"label":"D","text":"删代码"}]','B',2,1]]],
    ['🔧 AI重构优化','代码质量提升','## 🔧 AI重构优化\n\n### 重构场景\n| 场景 | AI能力 |\n|------|--------|\n| 函数拆分 | 识别过长函数 |\n| 变量命名 | 语义化建议 |\n| 性能优化 | 算法改进 |\n| 设计模式 | 模式推荐 |\n\n### 实操\n```\n要求AI：重构以下代码\n- 提取重复逻辑\n- 改善命名\n- 添加类型提示\n- 增加错误处理\n```\n\n### 成果验证\n- 代码行数减少30%\n- 可读性大幅提升\n- 性能无降低\n\n> 🔧 好代码是改出来的，AI帮你加速',15,4,
     [['代码重构的目标？','[{"label":"A","text":"代码更长"},{"label":"B","text":"更清晰高效"},{"label":"C","text":"删功能"},{"label":"D","text":"换语言"}]','B',2,1]]]
  ]);
  console.log('✅ 9: AI编程助手');

  console.log('✅ Batch 7-9 done');
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
