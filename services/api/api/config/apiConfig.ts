import { ConfigApiDto } from "@basicClasses/appConfig/configApiDto";
import { ApiActionGet } from "../../action/apiActionGet";
import { ApiBase } from "../apiBase";

export class ApiConfig extends ApiBase {
  protected static readonly controllerName = "config";

  constructor() {
    super(ApiConfig.controllerName);
  }

  public get(): ApiActionGet<ConfigApiDto> {
    const result = this.apiGet<ConfigApiDto>("");
    return result;
  }
}
