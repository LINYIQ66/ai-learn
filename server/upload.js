const ci = require('miniprogram-ci');
const path = require('path');

const project = new ci.Project({
  appid: 'wx4afb3e5f7d1f4bab',
  type: 'miniProgram',
  projectPath: path.join(__dirname, '../client'),
  privateKeyPath: path.join(__dirname, '../cert/private.key'),
  ignores: ['node_modules/**/*'],
});

async function upload() {
  const desc = process.argv[2] || 'AI学习小程序更新';
  const version = process.argv[3] || new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  console.log(`上传中... 版本: ${version}`);
  await ci.upload({
    project,
    version,
    desc,
    setting: { es6: true, es7: true, minify: true, autoPrefixWXSS: true },
  });
  console.log('上传成功 ✅');
  console.log('请在微信公众平台 → 版本管理 → 提交审核');
}

upload().catch(err => {
  console.error('上传失败:', err.message);
  process.exit(1);
});
