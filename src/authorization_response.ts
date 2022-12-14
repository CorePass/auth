/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AuthorizationManagementResponse} from './authorization_management_response'

/**
 * Represents the AuthorizationResponse as a JSON object.
 */
export interface AuthorizationResponseJson {
  code: string;
  state: string;
}

/**
 * Represents the Authorization Response type.
 * For more information look at
 * https://tools.ietf.org/html/rfc6749#section-4.1.2
 */
export class AuthorizationResponse extends AuthorizationManagementResponse {
  code: string;
  state: string;

  constructor(response: AuthorizationResponseJson) {
    super();
    this.code = response.code;
    this.state = response.state;
  }

  toJson(): AuthorizationResponseJson {
    return {code: this.code, state: this.state};
  }
}