import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "@basicClasses/services/config/configService";
import { environment } from "@env/environment";
import _ from "lodash";
import { ConfigApiDto } from "./configApiDto";
import { IAppConfig } from "./IAppConfig";

const configFolder = "assets/config";
const appconfig = "appconfig";

@Injectable()
export class AppConfig {
  static config: IAppConfig;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  load() {
    const jsonFile = `${configFolder}/${appconfig}.${environment.name}.json`;

    return new Promise<void>((resolve, reject) => {
      this.http
        .get(jsonFile)
        .toPromise()
        .then((response: IAppConfig) => {
          AppConfig.config = this.prepare(<IAppConfig>response);

          // this setting we can only get from envrionment variable
          AppConfig.config.production = environment.production;

          this.configService
            .get$()
            .toPromise()
            .then((config: ConfigApiDto) => {
              AppConfig.config.configFromServer = config;
              resolve();
            })
            .catch((response: any) => {
              reject(`Could not get application configuration`);
            });

          this._setWindowVersion();
        })
        .catch((response: any) => {
          reject(
            `Could not load file '${jsonFile}': ${JSON.stringify(response)}`
          );
        });
    });
  }

  private _setWindowVersion() {
    // version:

    const number = AppConfig.config.version;

    const lastChunkOfVersion = _.last(
      AppConfig.config.version?.split(".") ?? []
    );

    const buildTimeEpoch = lastChunkOfVersion
      ? _.toNumber(lastChunkOfVersion)
      : undefined;

    const buildTimeDate = buildTimeEpoch
      ? new Date(new Date(0).setUTCSeconds(buildTimeEpoch))
      : undefined;

    (window as any).version = {
      number: number,
      buildTime: buildTimeDate,
    };
  }

  private prepare(config: IAppConfig) {
    this.setApiUrl(config);
    this.setWsUrl(config);
    return config;
  }

  private setApiUrl(config: IAppConfig) {
    const configUrl = config.apiUrl;

    const splitted = _.split(configUrl, ":");

    if (splitted.length === 2) {
      let newHost = _.trim(splitted[0]);

      if (!newHost) {
        const currentPort = window.location.port;
        const hostWithoutPort = currentPort
          ? window.location.origin.replace(`:${currentPort}`, "")
          : window.location.origin;
        config.apiUrl = `${hostWithoutPort}:${splitted[1]}`;
      }
    }
  }

  private setWsUrl(config: IAppConfig) {
    if (config.wsConfig.url) {
      return;
    }

    const apiUrlWithProtocol = config.apiUrl.startsWith("http")
      ? config.apiUrl
      : window.location.origin;
    config.wsConfig.url = apiUrlWithProtocol.replace("http", "ws") + "/ws/";
  }
}
