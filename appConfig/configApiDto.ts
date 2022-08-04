import { SqlDatabaseType } from "@basicClasses/database/sqlDatabaseType";
import { IDtoBuiltInName } from "@basicClasses/dto/IDtoBuiltInName";
import { IDtoId } from "@basicClasses/dto/IDtoId";
import { IDtoName } from "@basicClasses/dto/IDtoName";
import { IJTypedObject } from "@basicClasses/JType/IJTypedObject";

export interface ConfigApiDto {
  baseLocaleId: number;
  locales: ILocale[];
  uiThemes: UIThemeApiDto[];
  databaseType: SqlDatabaseType;
}

export interface ILocale {
  id: number;
  builtInName: string;
  name: string;
  isBase: boolean;
}

export interface UIThemeApiDto extends IDtoId, IDtoName, IDtoBuiltInName {
  localeId: number;
  settings: UIThemeSettingsBase;
}

export const enum UIThemeType {
  Default = "Default",
}

export abstract class UIThemeSettingsBase
  implements IJTypedObject<UIThemeType>
{
  abstract jType: UIThemeType;

  bodyCssClass: string;
}
