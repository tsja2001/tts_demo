"use strict";

import 'log-timestamp';
import * as fs from 'fs';
import * as Nls from 'alibabacloud-nls';

const sleep = (waitTimeInMs: number) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const URL = "wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1";
const APPKEY = "4lP9qwrK34u5kHHQ";
const TOKEN = "dcba785f862a4b7b89478c2cba335742";

/**
 * 将指定的文本转换为语音文件，并将语音文件保存到磁盘上
 *
 * @param {string} text 要转换的文本
 * @param {string} filename 要保存的文件名（包括路径）
 */
function textToSpeech(text: string, filename: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    console.log(`speak: ${text}`);
    const tts = new Nls.SpeechSynthesizer({
      url: URL,
      appkey:APPKEY,
      token:TOKEN
    });

    tts.on("meta", (msg: any) => {
      console.log("Client recv metainfo:", msg);
    });

    const buffers: Buffer[] = [];
    // 拿到数据
    tts.on("data", (msg: any) => {
      console.log(`recv size: ${msg.length}`);
      buffers.push(msg);
    });

    tts.on("completed", (msg: any) => {
      console.log("Client recv completed:", msg);
      // tts.close()
      const buffer = Buffer.concat(buffers);
      fs.writeFile(filename, buffer, (err) => {
        if (err) {
          console.error(`Failed to write speech to file '${filename}': ${err}`);
          reject(err);
        } else {
          console.log(`Generated speech for '${text}' with length ${buffer.length}, saved to '${filename}'`);
          resolve(buffer);
        }
      });
    });

    tts.on("closed", () => {
      console.log("Client recv closed");
    });

    tts.on("failed", (msg:any) => {
      console.log("Client recv failed:", msg);
      // tts.close();
      reject(new Error(msg));
    });

    let param = tts.defaultStartParams();
    param.text = text;
    param.voice = "aixia";
    try {
      await tts.start(param, true, 6000);
    } catch(error) {
      console.log("error on start:", error);
      // tts.close();
      reject(error);
    }
    console.log("当前文本转换完成");
    await sleep(2000);
  });
}

async function test(texts: string[]): Promise<void> {
  for (const text of texts) {
    try {
      await textToSpeech(text, `${text}.wav`);
    } catch(error) {
      console.error(`生成失败 '${text}': ${error}`);
    }
  }
}

test(["第一条文本", "第二条文本", "第三条文本"]);
