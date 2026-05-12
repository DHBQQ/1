const axios = require('axios');

// ========== 你的配置 ==========
const COZE_TOKEN = "pat_i4Gm0oFE8P38aAz9DrGxWb7FzqAhTo6Qc9INjUM8FpDl1JoIyh6Wtz5FCbnGybRc";
const WORKFLOW_ID = "7638524967033995270";
const WECHAT_TOKEN = "coze123456";
// ==============================

async function runCozeWorkflow(userInput) {
  try {
    const res = await axios.post(
      "https://api.coze.cn/v1/workflows/run",
      {
        workflow_id: WORKFLOW_ID,
        parameters: { USER_INPUT: userInput }
      },
      {
        headers: {
          Authorization: `Bearer ${COZE_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 55000
      }
    );
    return res.data?.data?.output || "未获取到回复";
  } catch (err) {
    return "服务繁忙，请稍后再试";
  }
}

module.exports = async (req, res) => {
  // 微信Token校验（必加，否则公众号提交失败）
  if (req.method === 'GET') {
    return res.send(req.query.echostr);
  }

  res.setHeader("Content-Type", "application/xml");
  const xml = req.body;

  const content = xml.match(/<Content>(.*?)<\/Content>/)?.[1] || "";
  const fromUser = xml.match(/<FromUserName>(.*?)<\/FromUserName>/)?.[1] || "";
  const toUser = xml.match(/<ToUserName>(.*?)<\/ToUserName>/)?.[1] || "";

  if (!content) return res.send("");
  const reply = await runCozeWorkflow(content);

  return res.send(`<xml>
<ToUserName><![CDATA[${fromUser}]]></ToUserName>
<FromUserName><![CDATA[${toUser}]]></FromUserName>
<CreateTime>${parseInt(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${reply}]]></Content>
</xml>`);
};
