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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationServiceConfiguration = void 0;
var xhr_1 = require("./xhr");
/**
 * The standard base path for well-known resources on domains.
 * See https://tools.ietf.org/html/rfc5785 for more information.
 */
var WELL_KNOWN_PATH = '.well-known';
/**
 * The standard resource under the well known path at which an OpenID Connect
 * discovery document can be found under an issuer's base URI.
 */
var OPENID_CONFIGURATION = 'openid-configuration';
/**
 * Configuration details required to interact with an authorization service.
 *
 * More information at https://openid.net/specs/openid-connect-discovery-1_0-17.html
 */
var AuthorizationServiceConfiguration = /** @class */ (function () {
    function AuthorizationServiceConfiguration(request) {
        this.authorizationEndpoint = request.authorization_endpoint;
        this.tokenEndpoint = request.token_endpoint;
        this.revocationEndpoint = request.revocation_endpoint;
        this.userInfoEndpoint = request.userinfo_endpoint;
        this.endSessionEndpoint = request.end_session_endpoint;
    }
    AuthorizationServiceConfiguration.prototype.toJson = function () {
        return {
            authorization_endpoint: this.authorizationEndpoint,
            token_endpoint: this.tokenEndpoint,
            revocation_endpoint: this.revocationEndpoint,
            end_session_endpoint: this.endSessionEndpoint,
            userinfo_endpoint: this.userInfoEndpoint
        };
    };
    AuthorizationServiceConfiguration.fetchFromIssuer = function (openIdIssuerUrl, requestor) {
        var fullUrl = "".concat(openIdIssuerUrl, "/").concat(WELL_KNOWN_PATH, "/").concat(OPENID_CONFIGURATION);
        var requestorToUse = requestor || new xhr_1.JQueryRequestor();
        return requestorToUse
            .xhr({ url: fullUrl, dataType: 'json', method: 'GET' })
            .then(function (json) { return new AuthorizationServiceConfiguration(json); });
    };
    return AuthorizationServiceConfiguration;
}());
exports.AuthorizationServiceConfiguration = AuthorizationServiceConfiguration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aG9yaXphdGlvbl9zZXJ2aWNlX2NvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXV0aG9yaXphdGlvbl9zZXJ2aWNlX2NvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7R0FZRzs7O0FBRUgsNkJBQWlEO0FBY2pEOzs7R0FHRztBQUNILElBQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQztBQUV0Qzs7O0dBR0c7QUFDSCxJQUFNLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDO0FBRXBEOzs7O0dBSUc7QUFDSDtJQU9FLDJDQUFZLE9BQThDO1FBQ3hELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUM7UUFDNUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO1FBQzVDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUM7UUFDdEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztRQUNsRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDO0lBQ3pELENBQUM7SUFFRCxrREFBTSxHQUFOO1FBQ0UsT0FBTztZQUNMLHNCQUFzQixFQUFFLElBQUksQ0FBQyxxQkFBcUI7WUFDbEQsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2xDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7WUFDNUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtZQUM3QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1NBQ3pDLENBQUM7SUFDSixDQUFDO0lBRU0saURBQWUsR0FBdEIsVUFBdUIsZUFBdUIsRUFBRSxTQUFxQjtRQUVuRSxJQUFNLE9BQU8sR0FBRyxVQUFHLGVBQWUsY0FBSSxlQUFlLGNBQUksb0JBQW9CLENBQUUsQ0FBQztRQUVoRixJQUFNLGNBQWMsR0FBRyxTQUFTLElBQUksSUFBSSxxQkFBZSxFQUFFLENBQUM7UUFFMUQsT0FBTyxjQUFjO2FBQ2hCLEdBQUcsQ0FBd0MsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDO2FBQzNGLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksaUNBQWlDLENBQUMsSUFBSSxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0gsd0NBQUM7QUFBRCxDQUFDLEFBbkNELElBbUNDO0FBbkNZLDhFQUFpQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0XG4gKiBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlXG4gKiBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlclxuICogZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0pRdWVyeVJlcXVlc3RvciwgUmVxdWVzdG9yfSBmcm9tICcuL3hocic7XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbiBhcyBhIEpTT04gb2JqZWN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbkpzb24ge1xuICBhdXRob3JpemF0aW9uX2VuZHBvaW50OiBzdHJpbmc7XG4gIHRva2VuX2VuZHBvaW50OiBzdHJpbmc7XG4gIHJldm9jYXRpb25fZW5kcG9pbnQ6IHN0cmluZztcbiAgZW5kX3Nlc3Npb25fZW5kcG9pbnQ/OiBzdHJpbmc7XG4gIHVzZXJpbmZvX2VuZHBvaW50Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRoZSBzdGFuZGFyZCBiYXNlIHBhdGggZm9yIHdlbGwta25vd24gcmVzb3VyY2VzIG9uIGRvbWFpbnMuXG4gKiBTZWUgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU3ODUgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKi9cbmNvbnN0IFdFTExfS05PV05fUEFUSCA9ICcud2VsbC1rbm93bic7XG5cbi8qKlxuICogVGhlIHN0YW5kYXJkIHJlc291cmNlIHVuZGVyIHRoZSB3ZWxsIGtub3duIHBhdGggYXQgd2hpY2ggYW4gT3BlbklEIENvbm5lY3RcbiAqIGRpc2NvdmVyeSBkb2N1bWVudCBjYW4gYmUgZm91bmQgdW5kZXIgYW4gaXNzdWVyJ3MgYmFzZSBVUkkuXG4gKi9cbmNvbnN0IE9QRU5JRF9DT05GSUdVUkFUSU9OID0gJ29wZW5pZC1jb25maWd1cmF0aW9uJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGRldGFpbHMgcmVxdWlyZWQgdG8gaW50ZXJhY3Qgd2l0aCBhbiBhdXRob3JpemF0aW9uIHNlcnZpY2UuXG4gKlxuICogTW9yZSBpbmZvcm1hdGlvbiBhdCBodHRwczovL29wZW5pZC5uZXQvc3BlY3Mvb3BlbmlkLWNvbm5lY3QtZGlzY292ZXJ5LTFfMC0xNy5odG1sXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb24ge1xuICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6IHN0cmluZztcbiAgdG9rZW5FbmRwb2ludDogc3RyaW5nO1xuICByZXZvY2F0aW9uRW5kcG9pbnQ6IHN0cmluZztcbiAgdXNlckluZm9FbmRwb2ludD86IHN0cmluZztcbiAgZW5kU2Vzc2lvbkVuZHBvaW50Pzogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJlcXVlc3Q6IEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbkpzb24pIHtcbiAgICB0aGlzLmF1dGhvcml6YXRpb25FbmRwb2ludCA9IHJlcXVlc3QuYXV0aG9yaXphdGlvbl9lbmRwb2ludDtcbiAgICB0aGlzLnRva2VuRW5kcG9pbnQgPSByZXF1ZXN0LnRva2VuX2VuZHBvaW50O1xuICAgIHRoaXMucmV2b2NhdGlvbkVuZHBvaW50ID0gcmVxdWVzdC5yZXZvY2F0aW9uX2VuZHBvaW50O1xuICAgIHRoaXMudXNlckluZm9FbmRwb2ludCA9IHJlcXVlc3QudXNlcmluZm9fZW5kcG9pbnQ7XG4gICAgdGhpcy5lbmRTZXNzaW9uRW5kcG9pbnQgPSByZXF1ZXN0LmVuZF9zZXNzaW9uX2VuZHBvaW50O1xuICB9XG5cbiAgdG9Kc29uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdXRob3JpemF0aW9uX2VuZHBvaW50OiB0aGlzLmF1dGhvcml6YXRpb25FbmRwb2ludCxcbiAgICAgIHRva2VuX2VuZHBvaW50OiB0aGlzLnRva2VuRW5kcG9pbnQsXG4gICAgICByZXZvY2F0aW9uX2VuZHBvaW50OiB0aGlzLnJldm9jYXRpb25FbmRwb2ludCxcbiAgICAgIGVuZF9zZXNzaW9uX2VuZHBvaW50OiB0aGlzLmVuZFNlc3Npb25FbmRwb2ludCxcbiAgICAgIHVzZXJpbmZvX2VuZHBvaW50OiB0aGlzLnVzZXJJbmZvRW5kcG9pbnRcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZldGNoRnJvbUlzc3VlcihvcGVuSWRJc3N1ZXJVcmw6IHN0cmluZywgcmVxdWVzdG9yPzogUmVxdWVzdG9yKTpcbiAgICAgIFByb21pc2U8QXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uPiB7XG4gICAgY29uc3QgZnVsbFVybCA9IGAke29wZW5JZElzc3VlclVybH0vJHtXRUxMX0tOT1dOX1BBVEh9LyR7T1BFTklEX0NPTkZJR1VSQVRJT059YDtcblxuICAgIGNvbnN0IHJlcXVlc3RvclRvVXNlID0gcmVxdWVzdG9yIHx8IG5ldyBKUXVlcnlSZXF1ZXN0b3IoKTtcblxuICAgIHJldHVybiByZXF1ZXN0b3JUb1VzZVxuICAgICAgICAueGhyPEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbkpzb24+KHt1cmw6IGZ1bGxVcmwsIGRhdGFUeXBlOiAnanNvbicsIG1ldGhvZDogJ0dFVCd9KVxuICAgICAgICAudGhlbihqc29uID0+IG5ldyBBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb24oanNvbikpO1xuICB9XG59XG4iXX0=