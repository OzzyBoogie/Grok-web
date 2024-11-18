import { useState, useRef } from "react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { marked } from "marked";

export default function GrokPage() {
  const [messages, setMessages] = useState([
    { type: "received", content: "Hi, how can I help you?" },
   ]);
  const [newMessage, setNewMessage] = useState("");
  const [textAvailable, setTextAvailable] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addMessage = (sent: boolean, content: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: sent ? "sent" : "received", content }
    ]);
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return; // 防止发送空消息
    addMessage(true, newMessage);
    const messageToSend = newMessage;
    setNewMessage(""); // 清空输入框

    const url = "https://api.x.ai/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer xai-xx6B1JBMLQEac80xuRqfQ60Lj1TvIC8BbByHyanlKOtT4ihPFK2iJWE293GJeIrl8BfY0ZTJ3d24S625"
    };

    const data = {
      "messages": [
        {
          "role": "system",
          "content": "You are a test assistant."
        },
        {
          "role": "user",
          "content": messageToSend
        }
      ],
      "model": "grok-beta",
      "stream": false,
      "temperature": 0
    };

    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        addMessage(false, data.choices[0].message.content);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center h-full max-h-full justify-center gap-4">
        <Card className="w-2/3 h-full">
          <CardBody className="gap-2 w-full max-h-full flex flex-col">
            {/* 聊天框 */}
            <div className=" w-full flex-grow overflow-auto">
              <div className="chat-container h-full overflow-scroll">

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.type}`}
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    dangerouslySetInnerHTML={{ __html: marked(message.content) }}
                  />
                ))}
              </div>
            </div>
            {/* 输入框 */}
            <Textarea
              ref={textareaRef}
              placeholder="Enter your message"
              isDisabled={!textAvailable}
              className="w-full"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>)}
            />
            {/* 按钮 */}
            <Button color="primary" onClick={sendMessage}>
              Send
            </Button>
          </CardBody>
        </Card>
      </section>
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          // max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          background-color: #f9f9f9;
          overflow-y: auto;
        }
        .message {
          padding: 10px 15px;
          border-radius: 20px;
          max-width: 80%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          overflow: auto;
        }
        .message p:last-child {
          margin-bottom: 0; /* 移除最后一个段落的底部外边距 */
        }
        .message img {
          max-width: 100%; /* 确保图片不会溢出 */
          height: auto;
        }
        .sent {
          align-self: flex-end;
          background-color: #007aff;
          color: white;
        }
        .received {
          align-self: flex-start;
          background-color: #e5e5ea;
          color: black;
        }
      `}</style>
    </DefaultLayout>
  );
}