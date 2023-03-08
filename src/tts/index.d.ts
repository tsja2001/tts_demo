declare module "alibabacloud-nls" {
  import { EventEmitter } from "events";

  interface NlsOptions {
    url: string;
    appkey: string;
    token: string;
    // 其他属性
  }

  class SpeechSynthesizer extends EventEmitter {
    constructor(options: NlsOptions);

    defaultStartParams(): any;

    start(params: any, outputToSpeaker: boolean, waitTime: number): Promise<void>;

    close(): void;
  }

  export {
    SpeechSynthesizer
  };
}
