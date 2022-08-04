import { IDisposable } from "@basicClasses/contexts/primitives/IDisposable";
import { Metric } from "./metric";

export interface IMetricStorage extends IDisposable {
  updated(source: Metric);
}
