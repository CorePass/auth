"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndSessionRequest = exports.ENDSESSION_BUILT_IN_PARAMETERS = void 0;
var authorization_management_request_1 = require("./authorization_management_request");
var crypto_utils_1 = require("./crypto_utils");
/**
 * Generates a cryptographically random new state. Useful for CSRF protection.
 */
var SIZE = 10; // 10 bytes
var newState = function (crypto) {
    return crypto.generateRandom(SIZE);
};
// TODO(rahulrav@): add more built in parameters.
/* built in parameters. */
exports.ENDSESSION_BUILT_IN_PARAMETERS = ['id_token_hint', 'post_logout_redirect_uri', 'state'];
/**
 * Represents the EndSessionRequest.
 * For more information look at
 * http://openid.net/specs/openid-connect-session-1_0.html
 */
var EndSessionRequest = /** @class */ (function (_super) {
    __extends(EndSessionRequest, _super);
    /**
     * Constructs a new EndSessionRequest.
     * Use a `undefined` value for the `state` parameter, to generate a random
     * state for CSRF protection.
     */
    function EndSessionRequest(request, crypto) {
        if (crypto === void 0) { crypto = new crypto_utils_1.DefaultCrypto(); }
        var _this = _super.call(this) || this;
        _this.crypto = crypto;
        _this.idTokenHint = request.id_token_hint;
        _this.postLogoutRedirectUri = request.post_logout_redirect_uri;
        _this.state = request.state || newState(crypto);
        _this.extras = request.extras;
        return _this;
    }
    /**
     * Serializes the EndSessionRequest to a JavaScript Object.
     */
    EndSessionRequest.prototype.toJson = function () {
        return Promise.resolve({
            id_token_hint: this.idTokenHint,
            post_logout_redirect_uri: this.postLogoutRedirectUri,
            state: this.state,
            extras: this.extras
        });
    };
    EndSessionRequest.prototype.toRequestMap = function () {
        // build the query string
        // coerce to any type for convenience
        var requestMap = {
            'id_token_hint': this.idTokenHint,
            'post_logout_redirect_uri': this.postLogoutRedirectUri,
            'state': this.state
        };
        // copy over extras
        if (this.extras) {
            for (var extra in this.extras) {
                if (this.extras.hasOwnProperty(extra)) {
                    // check before inserting to requestMap
                    if (exports.ENDSESSION_BUILT_IN_PARAMETERS.indexOf(extra) < 0) {
                        requestMap[extra] = this.extras[extra];
                    }
                }
            }
        }
        return requestMap;
    };
    return EndSessionRequest;
}(authorization_management_request_1.AuthorizationManagementRequest));
exports.EndSessionRequest = EndSessionRequest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5kX3Nlc3Npb25fcmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbmRfc2Vzc2lvbl9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHVGQUFpRjtBQUNqRiwrQ0FBcUQ7QUFhckQ7O0dBRUc7QUFDSCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBRSxXQUFXO0FBQzdCLElBQU0sUUFBUSxHQUFHLFVBQVMsTUFBYztJQUN0QyxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDO0FBRUYsaURBQWlEO0FBQ2pELDBCQUEwQjtBQUNiLFFBQUEsOEJBQThCLEdBQ3ZDLENBQUMsZUFBZSxFQUFFLDBCQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBRTNEOzs7O0dBSUc7QUFDSDtJQUF1QyxxQ0FBOEI7SUFVbkU7Ozs7T0FJRztJQUNILDJCQUFZLE9BQThCLEVBQVUsTUFBb0M7UUFBcEMsdUJBQUEsRUFBQSxhQUFxQiw0QkFBYSxFQUFFO1FBQXhGLFlBQ0UsaUJBQU8sU0FLUjtRQU5tRCxZQUFNLEdBQU4sTUFBTSxDQUE4QjtRQUV0RixLQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDekMsS0FBSSxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztRQUM5RCxLQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLEtBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0NBQU0sR0FBTjtRQUNFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUNyQixhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDL0Isd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtZQUNwRCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCx3Q0FBWSxHQUFaO1FBQ0UseUJBQXlCO1FBQ3pCLHFDQUFxQztRQUNyQyxJQUFJLFVBQVUsR0FBYztZQUMxQixlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDakMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtZQUN0RCxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDcEIsQ0FBQztRQUVGLG1CQUFtQjtRQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3JDLHVDQUF1QztvQkFDdkMsSUFBSSxzQ0FBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNyRCxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDeEM7aUJBQ0Y7YUFDRjtTQUNGO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQXpERCxDQUF1QyxpRUFBOEIsR0F5RHBFO0FBekRZLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0XG4gKiBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlXG4gKiBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0F1dGhvcml6YXRpb25NYW5hZ2VtZW50UmVxdWVzdH0gZnJvbSAnLi9hdXRob3JpemF0aW9uX21hbmFnZW1lbnRfcmVxdWVzdCdcbmltcG9ydCB7Q3J5cHRvLCBEZWZhdWx0Q3J5cHRvfSBmcm9tICcuL2NyeXB0b191dGlscyc7XG5pbXBvcnQge1N0cmluZ01hcH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBFbmRTZXNzaW9uUmVxdWVzdCBhcyBKU09OLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVuZFNlc3Npb25SZXF1ZXN0SnNvbiB7XG4gIGlkX3Rva2VuX2hpbnQ6IHN0cmluZztcbiAgcG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpOiBzdHJpbmc7XG4gIHN0YXRlPzogc3RyaW5nO1xuICBleHRyYXM/OiBTdHJpbmdNYXA7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgY3J5cHRvZ3JhcGhpY2FsbHkgcmFuZG9tIG5ldyBzdGF0ZS4gVXNlZnVsIGZvciBDU1JGIHByb3RlY3Rpb24uXG4gKi9cbmNvbnN0IFNJWkUgPSAxMDsgIC8vIDEwIGJ5dGVzXG5jb25zdCBuZXdTdGF0ZSA9IGZ1bmN0aW9uKGNyeXB0bzogQ3J5cHRvKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNyeXB0by5nZW5lcmF0ZVJhbmRvbShTSVpFKTtcbn07XG5cbi8vIFRPRE8ocmFodWxyYXZAKTogYWRkIG1vcmUgYnVpbHQgaW4gcGFyYW1ldGVycy5cbi8qIGJ1aWx0IGluIHBhcmFtZXRlcnMuICovXG5leHBvcnQgY29uc3QgRU5EU0VTU0lPTl9CVUlMVF9JTl9QQVJBTUVURVJTID1cbiAgICBbJ2lkX3Rva2VuX2hpbnQnLCAncG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpJywgJ3N0YXRlJ107XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgRW5kU2Vzc2lvblJlcXVlc3QuXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBsb29rIGF0XG4gKiBodHRwOi8vb3BlbmlkLm5ldC9zcGVjcy9vcGVuaWQtY29ubmVjdC1zZXNzaW9uLTFfMC5odG1sXG4gKi9cbmV4cG9ydCBjbGFzcyBFbmRTZXNzaW9uUmVxdWVzdCBleHRlbmRzIEF1dGhvcml6YXRpb25NYW5hZ2VtZW50UmVxdWVzdCB7XG4gIC8vIE5PVEU6XG4gIC8vIEJvdGggcG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpIGFuZCBzdGF0ZSBhcmUgYWN0dWFsbHkgb3B0aW9uYWwuXG4gIC8vIEhvd2V2ZXIgQ29yZVBhc3MgaXMgbW9yZSBvcGlvbmlvbmF0ZWQsIGFuZCByZXF1aXJlcyB5b3UgdG8gdXNlIGJvdGguXG5cbiAgaWRUb2tlbkhpbnQ6IHN0cmluZztcbiAgcG9zdExvZ291dFJlZGlyZWN0VXJpOiBzdHJpbmc7XG4gIHN0YXRlOiBzdHJpbmc7XG4gIGV4dHJhcz86IFN0cmluZ01hcDtcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBFbmRTZXNzaW9uUmVxdWVzdC5cbiAgICogVXNlIGEgYHVuZGVmaW5lZGAgdmFsdWUgZm9yIHRoZSBgc3RhdGVgIHBhcmFtZXRlciwgdG8gZ2VuZXJhdGUgYSByYW5kb21cbiAgICogc3RhdGUgZm9yIENTUkYgcHJvdGVjdGlvbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHJlcXVlc3Q6IEVuZFNlc3Npb25SZXF1ZXN0SnNvbiwgcHJpdmF0ZSBjcnlwdG86IENyeXB0byA9IG5ldyBEZWZhdWx0Q3J5cHRvKCkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuaWRUb2tlbkhpbnQgPSByZXF1ZXN0LmlkX3Rva2VuX2hpbnQ7XG4gICAgdGhpcy5wb3N0TG9nb3V0UmVkaXJlY3RVcmkgPSByZXF1ZXN0LnBvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaTtcbiAgICB0aGlzLnN0YXRlID0gcmVxdWVzdC5zdGF0ZSB8fCBuZXdTdGF0ZShjcnlwdG8pO1xuICAgIHRoaXMuZXh0cmFzID0gcmVxdWVzdC5leHRyYXM7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplcyB0aGUgRW5kU2Vzc2lvblJlcXVlc3QgdG8gYSBKYXZhU2NyaXB0IE9iamVjdC5cbiAgICovXG4gIHRvSnNvbigpOiBQcm9taXNlPEVuZFNlc3Npb25SZXF1ZXN0SnNvbj4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgaWRfdG9rZW5faGludDogdGhpcy5pZFRva2VuSGludCxcbiAgICAgIHBvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaTogdGhpcy5wb3N0TG9nb3V0UmVkaXJlY3RVcmksXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIGV4dHJhczogdGhpcy5leHRyYXNcbiAgICB9KTtcbiAgfVxuXG4gIHRvUmVxdWVzdE1hcCgpOiBTdHJpbmdNYXAge1xuICAgIC8vIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICAvLyBjb2VyY2UgdG8gYW55IHR5cGUgZm9yIGNvbnZlbmllbmNlXG4gICAgbGV0IHJlcXVlc3RNYXA6IFN0cmluZ01hcCA9IHtcbiAgICAgICdpZF90b2tlbl9oaW50JzogdGhpcy5pZFRva2VuSGludCxcbiAgICAgICdwb3N0X2xvZ291dF9yZWRpcmVjdF91cmknOiB0aGlzLnBvc3RMb2dvdXRSZWRpcmVjdFVyaSxcbiAgICAgICdzdGF0ZSc6IHRoaXMuc3RhdGVcbiAgICB9O1xuXG4gICAgLy8gY29weSBvdmVyIGV4dHJhc1xuICAgIGlmICh0aGlzLmV4dHJhcykge1xuICAgICAgZm9yIChsZXQgZXh0cmEgaW4gdGhpcy5leHRyYXMpIHtcbiAgICAgICAgaWYgKHRoaXMuZXh0cmFzLmhhc093blByb3BlcnR5KGV4dHJhKSkge1xuICAgICAgICAgIC8vIGNoZWNrIGJlZm9yZSBpbnNlcnRpbmcgdG8gcmVxdWVzdE1hcFxuICAgICAgICAgIGlmIChFTkRTRVNTSU9OX0JVSUxUX0lOX1BBUkFNRVRFUlMuaW5kZXhPZihleHRyYSkgPCAwKSB7XG4gICAgICAgICAgICByZXF1ZXN0TWFwW2V4dHJhXSA9IHRoaXMuZXh0cmFzW2V4dHJhXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RNYXA7XG4gIH1cbn1cbiJdfQ==