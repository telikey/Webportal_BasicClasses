import { ConfigApiDto } from './configApiDto';

export interface IAppConfig {
  production: boolean;

  apiUrl: string;
  wsConfig: WebSocketConfig;
  version: string;

  theme: {
    defaultTheme: string;
  };

  logger: IAppConfigLogger;
  useFakeData: boolean;

  /** Turns on metrics mechanism for components */
  metricsEnabled: boolean;

  configFromServer: ConfigApiDto;
}

export interface IAppConfigLogger {
  minLevel: string;
  includeStack: boolean;
}

export interface WebSocketConfig {
  url: string;
  reconnectIntervalMs?: number;
  reconnectAttempts?: number;
}
