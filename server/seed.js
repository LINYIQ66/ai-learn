const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '127.0.0.1', user: 'debian-sys-maint', password: '7kWuvHW9ve0Zexc5',
  database: 'ai_learn', socketPath: '/var/run/mysqld/mysqld.sock'
});

async function seed() {
  const conn = await pool.getConnection();

  // Clean
  await conn.query('DELETE FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id IN (1,4))');
  await conn.query('DELETE FROM lessons WHERE course_id IN (1,4)');
  console.log('Cleaned courses 1,4');

  // Course 1: Python
  const c1 = [
    ['🐍 Python环境搭建','安装Python和配置开发环境','## 🐍 Python环境搭建\n\nPython是当今最流行的编程语言，也是AI开发的首选语言。\n\n```python\nprint("Hello, AI World!")\n```\n\n### 安装方式\n\n| 系统 | 方法 |\n|------|------|\n| Windows | python.org下载 |\n| Mac | brew install python3 |\n| Linux | apt install python3 |\n\n> 💡 推荐Python 3.8+，大部分AI框架要求此版本',10,1,
     [['Python中输出内容的函数是？','[{"label":"A","text":"print()"},{"label":"B","text":"echo()"},{"label":"C","text":"console.log()"},{"label":"D","text":"write()"}]','A',2,1],
      ['推荐Python哪个版本以上？','[{"label":"A","text":"2.7"},{"label":"B","text":"3.5"},{"label":"C","text":"3.8"},{"label":"D","text":"1.0"}]','C',2,2]]],
    ['📦 变量与数据类型','理解Python基本数据类型','## 📦 变量与数据类型\n\nPython是动态类型语言：\n\n```python\nname = "小明"      # str\nage = 25           # int\nheight = 1.75      # float\nis_student = True  # bool\n```\n\n### 四种核心类型\n\n| 类型 | 示例 | 用途 |\n|------|------|------|\n| str | 你好 | 文本 |\n| int | 42 | 计数 |\n| float | 3.14 | 计算 |\n| bool | True | 判断 |\n\n> 🔑 Python中一切皆对象，理解类型是编程的第一步',12,2,
     [['Python中字符串类型是？','[{"label":"A","text":"int"},{"label":"B","text":"str"},{"label":"C","text":"bool"},{"label":"D","text":"list"}]','B',2,1],
      ['以下哪个是有效的整数？','[{"label":"A","text":"hello"},{"label":"B","text":"3.14"},{"label":"C","text":"42"},{"label":"D","text":"True"}]','C',2,2]]],
    ['🔄 条件与循环','掌握程序控制流程','## 🔄 条件与循环\n\n```python\nscore = 85\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C"\n```\n\n### for循环（AI最常用）\n\n```python\nai_models = ["GPT-4","Claude","Gemini"]\nfor model in ai_models:\n    print(f"评估 {model}...")\n```\n\n| 模式 | 代码 | 场景 |\n|------|------|------|\n| 遍历过滤 | [x for x in d if x>0] | 数据清洗 |\n| 计数 | for i in range(10) | 重复操作 |\n\n> 💡 AI中循环无处不在：遍历数据集、迭代训练轮次',15,3,
     [['for循环可以遍历哪种结构？','[{"label":"A","text":"列表"},{"label":"B","text":"字符串"},{"label":"C","text":"range对象"},{"label":"D","text":"以上都可以"}]','D',2,1]]],
    ['🔧 函数与模块','组织代码的高级技巧','## 🔧 函数与模块\n\n```python\ndef calc_accuracy(preds, labels):\n    correct = sum(1 for p,l in zip(preds,labels) if p==l)\n    return correct / len(labels)\n\nacc = calc_accuracy(["猫","狗"],["猫","狗"])\nprint(f"准确率: {acc:.0%}")  # 100%\n```\n\n### 常用内置模块\n\n| 模块 | 用途 | 示例 |\n|------|------|------|\n| math | 数学 | math.sqrt(16) |\n| random | 随机 | random.choice(list) |\n| json | JSON | json.loads(data) |\n| datetime | 日期 | datetime.now() |\n\n### Lambda表达式\n```python\ntop = max(students, key=lambda s: s["score"])\n```\n\n> 🎯 Python有20万+第三方库，pip install即可安装',15,4,
     [['def关键字用于？','[{"label":"A","text":"定义变量"},{"label":"B","text":"定义函数"},{"label":"C","text":"删除数据"},{"label":"D","text":"调试代码"}]','B',2,1],
      ['json模块的作用是？','[{"label":"A","text":"数学计算"},{"label":"B","text":"日期处理"},{"label":"C","text":"JSON解析"},{"label":"D","text":"文件操作"}]','C',2,2]]],
    ['🚀 综合实战：AI助手','综合运用所学打造简易AI工具','## 🚀 综合实战：打造你的AI助手\n\n```python\nknowledge = {\n  "什么是AI": "人工智能的缩写",\n  "什么是ML": "机器学习，AI的子领域"\n}\n\ndef ai_qa(q):\n    return knowledge.get(q, "还在学习中，换问题吧🤔")\n\n# 主程序\nwhile True:\n    q = input("你问: ")\n    if q == "退出": break\n    print(f"AI答: {ai_qa(q)}")\n```\n\n### 你掌握了什么\n\n| 技能 | 状态 |\n|------|------|\n| 变量与数据类型 | ✅ |\n| if-else条件判断 | ✅ |\n| for/while循环 | ✅ |\n| 函数定义调用 | ✅ |\n| 模块导入 | ✅ |\n| 字典与列表 | ✅ |\n\n> 🎉 恭喜完成Python入门！继续学习AI基础',20,5,
     [['列表推导式语法是？','[{"label":"A","text":"[x*2 for x in d]"},{"label":"B","text":"for x in d:"},{"label":"C","text":"while d:"},{"label":"D","text":"def f(x):"}]','A',2,1]]]
  ];

  for (const [title, summary, content, dur, order, quizzes] of c1) {
    const [r] = await conn.query(
      'INSERT INTO lessons (course_id,title,summary,content,duration,sort_order) VALUES (?,?,?,?,?,?)',
      [1, title, summary, content, dur, order]
    );
    const lid = r.insertId;
    for (const [q, opts, ans, pts, ord2] of quizzes) {
      await conn.query(
        'INSERT INTO quizzes (lesson_id,question,options,correct_answer,points,sort_order) VALUES (?,?,?,?,?,?)',
        [lid, q, opts, ans, pts, ord2]
      );
    }
    console.log(`  Lesson ${lid}: ${title}`);
  }

  await conn.release();
  console.log('✅ Course 1 done');
  process.exit(0);
}

seed().catch(e => { console.error(e.message); process.exit(1); });
