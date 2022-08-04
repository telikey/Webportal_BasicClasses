import { ApiConfig } from './api/config/apiConfig';

export class ApiSpecification {
  static readonly instance: ApiSpecification = new ApiSpecification();

  config = new ApiConfig();
}
