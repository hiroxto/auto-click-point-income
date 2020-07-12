import { ChildProcess, exec } from 'child_process';

export class URLClicker {
  urls: string[];

  constructor (urls: string[]) {
    this.urls = urls;
  }

  /**
   * 広告 URL へのアクセスを実行する
   */
  execute (): ChildProcess {
    return exec(this.buildCommand(), error => {
      if (error !== null) {
        console.log(error);
      }
    });
  }

  /**
   * URL 一覧を表示する.
   */
  displayUrls (): string {
    const joinedUrls = this.urls.join('\n');
    console.log(joinedUrls);
    return joinedUrls;
  }

  /**
   * 実行するコマンドを作成する
   */
  private buildCommand (): string {
    const joinedUrls = this.urls.map(u => `"${u}"`).join(' ');

    return `curl -L ${joinedUrls} >> /dev/null`;
  }
}
