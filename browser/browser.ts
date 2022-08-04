import { BrowserType } from "./browserType";

export class Browser {
  public static browser: BrowserType = BrowserType.InternetExplorer;

  /** Microsoft IE */
  public static get isIE(): boolean {
    return this.browser === BrowserType.InternetExplorer;
  }
  /** Microsoft IE or Edge */
  public static get isMS(): boolean {
    return this.isIE || this.browser === BrowserType.Edge;
  }

  public static setBrowser(name: string) {
    switch (name) {
      case "IE": {
        this.browser = BrowserType.InternetExplorer;
        break;
      }

      case "MS-Edge": {
        this.browser = BrowserType.Edge;
        break;
      }

      case "Chrome": {
        this.browser = BrowserType.Chrome;
        break;
      }

      case "Firefox": {
        this.browser = BrowserType.Firefox;
        break;
      }

      case "Opera": {
        this.browser = BrowserType.Opera;
        break;
      }

      case "Safari": {
        this.browser = BrowserType.Safari;
        break;
      }
    }
  }
}
