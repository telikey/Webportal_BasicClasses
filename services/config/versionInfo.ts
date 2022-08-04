import _ from 'lodash';

export class VersionInfo {
  /**
   *
   */
  constructor(asString: string) {
    this.asString = asString;

    try {
      const splitted = _.split(this.asString, '.');
      this.major = _.toNumber(splitted[0]);
      this.minor = _.toNumber(splitted[1]);
      this.build = _.toNumber(splitted[2]);
    } catch (error) {}
  }
  major: number;
  minor: number;
  build: number;

  asString: string;

  toString(): string {
    return this.asString;
  }
}
