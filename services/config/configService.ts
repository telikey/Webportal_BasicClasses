import { Injectable } from "@angular/core";
import { AppConfig } from "@basicClasses/appConfig/appConfig";
import { ConfigApiDto } from "@basicClasses/appConfig/configApiDto";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { ApiService } from "../api/apiService";
import { VersionInfo } from "./versionInfo";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  constructor(private api: ApiService) {}

  get$(): Observable<ConfigApiDto> {
    const result$ = this.api.call$((x) => x.config.get());
    return result$;
  }

  version$(): Observable<VersionInfo> {
    return of(undefined).pipe(
      map(() => {
        const info = new VersionInfo(AppConfig.config.version);
        return info;
      })
    );
  }
}
