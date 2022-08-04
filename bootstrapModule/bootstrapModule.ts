import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Browser } from "@basicClasses/browser/browser";
import { Logger } from "@basicClasses/logger/logger";
import { MetricsInterface } from "@basicClasses/metricStorage/metricStorage";
import { DeviceDetectorService } from "ngx-device-detector";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // DeviceDetectorModule.forRoot()
  ],
})
/** Use it to make things before app loaded */
export class BootstrapModule {
  constructor(deviceDetector: DeviceDetectorService) {
    Browser.setBrowser(deviceDetector.browser);

    // logger:
    (window as any).logger = {
      setMinLevel: Logger.setMinLevel,
      setIncludeStack: Logger.setIncludeStack,
    };

    // metrics:
    (window as any).metrics = MetricsInterface;
  }
}
