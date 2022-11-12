import { SNSEvent } from "aws-lambda"
import axios from "axios"
const ENDPOINT = "https://api.line.me/v2/bot/message/push";

const sendLineMessage = async (message:string) => {
  await axios.post(
    ENDPOINT,
    {
      to: process.env.USER_ID,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );
}
export const handler = async (
  event: SNSEvent
) => {
  const {Records} = event;
  try {
    if(!Records[0]) {
      await sendLineMessage("予算の警報装置が作動しました！cost exploreを確認してください！");
      return;
    };
    const {Message} = Records[0].Sns;
    await sendLineMessage(Message);
  } catch (e) {
    console.error(e)
  }
}
