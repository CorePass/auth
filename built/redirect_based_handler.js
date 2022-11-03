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
exports.RedirectRequestHandler = void 0;
var authorization_management_response_1 = require("./authorization_management_response");
var authorization_request_1 = require("./authorization_request");
var authorization_request_handler_1 = require("./authorization_request_handler");
var authorization_response_1 = require("./authorization_response");
var crypto_utils_1 = require("./crypto_utils");
var end_session_request_1 = require("./end_session_request");
var end_session_response_1 = require("./end_session_response");
var logger_1 = require("./logger");
var query_string_utils_1 = require("./query_string_utils");
var storage_1 = require("./storage");
var types_1 = require("./types");
/** key for authorization request. */
var requestKey = function (handle, requestType) {
    return "".concat(handle, "_appauth_").concat(requestType, "_request");
};
/** key for authorization service configuration */
var serviceConfigurationKey = function (handle, requestType) {
    return "".concat(handle, "_appauth_").concat(requestType, "_service_configuration");
};
/** key in local storage which represents the current authorization request. */
var REQUEST_HANDLE_KEY = function (requestType) {
    return "appauth_current_".concat(requestType, "_request");
};
/**
 * Represents an AuthorizationRequestHandler which uses a standard
 * redirect based code flow.
 */
var RedirectRequestHandler = /** @class */ (function (_super) {
    __extends(RedirectRequestHandler, _super);
    function RedirectRequestHandler(
    // use the provided storage backend
    // or initialize local storage with the default storage backend which
    // uses window.localStorage
    storageBackend, utils, locationLike, crypto) {
        if (storageBackend === void 0) { storageBackend = new storage_1.LocalStorageBackend(); }
        if (utils === void 0) { utils = new query_string_utils_1.BasicQueryStringUtils(); }
        if (locationLike === void 0) { locationLike = window.location; }
        if (crypto === void 0) { crypto = new crypto_utils_1.DefaultCrypto(); }
        var _this = _super.call(this, utils, crypto) || this;
        _this.storageBackend = storageBackend;
        _this.locationLike = locationLike;
        return _this;
    }
    RedirectRequestHandler.prototype.performAuthorizationRequest = function (configuration, request) {
        this.performRequest(configuration, request, types_1.RedirectRequestTypes.authorization);
    };
    RedirectRequestHandler.prototype.performEndSessionRequest = function (configuration, request) {
        this.performRequest(configuration, request, types_1.RedirectRequestTypes.endSession);
    };
    RedirectRequestHandler.prototype.performRequest = function (configuration, request, requestType) {
        var _this = this;
        if (requestType === void 0) { requestType = types_1.RedirectRequestTypes.authorization; }
        var handle = this.crypto.generateRandom(10);
        // before you make request, persist all request related data in local storage.
        var persisted = Promise.all([
            this.storageBackend.setItem(REQUEST_HANDLE_KEY(requestType), handle),
            // Calling toJson() adds in the code & challenge when possible
            request.toJson().then(function (result) {
                return _this.storageBackend.setItem(requestKey(handle, requestType), JSON.stringify(result));
            }),
            this.storageBackend.setItem(serviceConfigurationKey(handle, requestType), JSON.stringify(configuration.toJson())),
        ]);
        persisted.then(function () {
            // make the redirect request
            var url = _this.buildRequestUrl(configuration, request, requestType);
            (0, logger_1.log)('Making a request to ', request, url);
            _this.locationLike.assign(url);
        });
    };
    /**
     * Attempts to introspect the contents of storage backend and completes the
     *  authorization request.
     */
    RedirectRequestHandler.prototype.completeAuthorizationRequest = function () {
        return this.completeRequest(types_1.RedirectRequestTypes.authorization);
    };
    /**
     * Attempts to introspect the contents of storage backend and completes the
     * end session request.
     */
    RedirectRequestHandler.prototype.completeEndSessionRequest = function () {
        return this.completeRequest(types_1.RedirectRequestTypes.endSession);
    };
    /**
     * Attempts to introspect the contents of storage backend and completes the
     * request.
     */
    RedirectRequestHandler.prototype.completeRequest = function (requestType) {
        var _this = this;
        // TODO(rahulrav@): handle authorization errors.
        return this.storageBackend.getItem(REQUEST_HANDLE_KEY(requestType)).then(function (handle) {
            if (handle) {
                // we have a pending request.
                // fetch authorization request, and check state
                return _this.storageBackend
                    .getItem(requestKey(handle, requestType))
                    // requires a corresponding instance of result
                    // TODO(rahulrav@): check for inconsistent state here
                    .then(function (result) { return JSON.parse(result); })
                    .then(function (json) { return requestType === types_1.RedirectRequestTypes.authorization ?
                    new authorization_request_1.AuthorizationRequest(json) :
                    new end_session_request_1.EndSessionRequest(json); })
                    .then(function (request) {
                    // check redirect_uri and state
                    var currentUri = "".concat(_this.locationLike.origin).concat(_this.locationLike.pathname);
                    var queryParams = _this.utils.parse(_this.locationLike, true /* use hash */);
                    var state = queryParams['state'];
                    var code = queryParams['code'];
                    var error = queryParams['error'];
                    if (requestType === types_1.RedirectRequestTypes.authorization) {
                        (0, logger_1.log)('Potential authorization request ', currentUri, queryParams, state, code, error);
                    }
                    else {
                        (0, logger_1.log)('Potential end session request ', currentUri, queryParams, state, error);
                    }
                    var shouldNotify = state === request.state;
                    var authorizationResponse = null;
                    var authorizationError = null;
                    if (shouldNotify) {
                        if (error) {
                            // get additional optional info.
                            var errorUri = queryParams['error_uri'];
                            var errorDescription = queryParams['error_description'];
                            authorizationError = new authorization_management_response_1.AuthorizationError({
                                error: error,
                                error_description: errorDescription,
                                error_uri: errorUri,
                                state: state
                            });
                        }
                        else {
                            if (requestType === types_1.RedirectRequestTypes.authorization) {
                                authorizationResponse = new authorization_response_1.AuthorizationResponse({ code: code, state: state });
                            }
                            else if (requestType === types_1.RedirectRequestTypes.endSession) {
                                authorizationResponse = new end_session_response_1.EndSessionResponse({ state: state });
                            }
                        }
                        // cleanup state
                        return Promise
                            .all([
                            _this.storageBackend.removeItem(REQUEST_HANDLE_KEY(requestType)),
                            _this.storageBackend.removeItem(requestKey(handle, requestType)),
                            _this.storageBackend.removeItem(serviceConfigurationKey(handle, requestType))
                        ])
                            .then(function () {
                            (0, logger_1.log)('Delivering authorization response');
                            return {
                                request: request,
                                response: authorizationResponse,
                                error: authorizationError
                            };
                        });
                    }
                    else {
                        (0, logger_1.log)('Mismatched request (state and request_uri) dont match.');
                        return Promise.resolve(null);
                    }
                });
            }
            else {
                return null;
            }
        });
    };
    return RedirectRequestHandler;
}(authorization_request_handler_1.AuthorizationRequestHandler));
exports.RedirectRequestHandler = RedirectRequestHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXJlY3RfYmFzZWRfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWRpcmVjdF9iYXNlZF9oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdILHlGQUF1RTtBQUN2RSxpRUFBNkQ7QUFDN0QsaUZBQTBHO0FBQzFHLG1FQUE4RDtBQUU5RCwrQ0FBcUQ7QUFDckQsNkRBQXdEO0FBQ3hELCtEQUEwRDtBQUMxRCxtQ0FBNkI7QUFDN0IsMkRBQTJEO0FBQzNELHFDQUE4RDtBQUM5RCxpQ0FBMkQ7QUFHM0QscUNBQXFDO0FBQ3JDLElBQU0sVUFBVSxHQUNaLFVBQUMsTUFBYyxFQUFFLFdBQWlDO0lBQ2hELE9BQU8sVUFBRyxNQUFNLHNCQUFZLFdBQVcsYUFBVSxDQUFDO0FBQ3BELENBQUMsQ0FBQTtBQUVMLGtEQUFrRDtBQUNsRCxJQUFNLHVCQUF1QixHQUN6QixVQUFDLE1BQWMsRUFBRSxXQUFpQztJQUNoRCxPQUFPLFVBQUcsTUFBTSxzQkFBWSxXQUFXLDJCQUF3QixDQUFDO0FBQ2xFLENBQUMsQ0FBQTtBQUVMLCtFQUErRTtBQUMvRSxJQUFNLGtCQUFrQixHQUFHLFVBQUMsV0FBaUM7SUFDekQsT0FBQSwwQkFBbUIsV0FBVyxhQUFVO0FBQXhDLENBQXdDLENBQUM7QUFFN0M7OztHQUdHO0FBQ0g7SUFBNEMsMENBQTJCO0lBQ3JFO0lBQ0ksbUNBQW1DO0lBQ25DLHFFQUFxRTtJQUNyRSwyQkFBMkI7SUFDcEIsY0FBMEQsRUFDakUsS0FBbUMsRUFDNUIsWUFBNEMsRUFDbkQsTUFBb0M7UUFIN0IsK0JBQUEsRUFBQSxxQkFBcUMsNkJBQW1CLEVBQUU7UUFDakUsc0JBQUEsRUFBQSxZQUFZLDBDQUFxQixFQUFFO1FBQzVCLDZCQUFBLEVBQUEsZUFBNkIsTUFBTSxDQUFDLFFBQVE7UUFDbkQsdUJBQUEsRUFBQSxhQUFxQiw0QkFBYSxFQUFF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LElBQUEsWUFBRyxFQUFDLG1DQUFtQyxDQUFDLENBQUM7NEJBQ3pDLE9BQU87Z0NBQ0wsT0FBTyxFQUFFLE9BQU87Z0NBQ2hCLFFBQVEsRUFBRSxxQkFBcUI7Z0NBQy9CLEtBQUssRUFBRSxrQkFBa0I7NkJBQ00sQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDLENBQUM7cUJBQ1I7eUJBQU07d0JBQ0wsSUFBQSxZQUFHLEVBQUMsd0RBQXdELENBQUMsQ0FBQzt3QkFDOUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUM5QjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNSO2lCQUFNO2dCQUNMLE9BQU8sSUFBSSxDQUFDO2FBQ2I7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCw2QkFBQztBQUFELENBQUMsQUFuSkQsQ0FBNEMsMkRBQTJCLEdBbUp0RTtBQW5KWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdFxuICogaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZVxuICogTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXJcbiAqIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBdXRob3JpemF0aW9uTWFuYWdlbWVudFJlcXVlc3R9IGZyb20gJy4vYXV0aG9yaXphdGlvbl9tYW5hZ2VtZW50X3JlcXVlc3QnO1xuaW1wb3J0IHtBdXRob3JpemF0aW9uRXJyb3J9IGZyb20gJy4vYXV0aG9yaXphdGlvbl9tYW5hZ2VtZW50X3Jlc3BvbnNlJztcbmltcG9ydCB7QXV0aG9yaXphdGlvblJlcXVlc3R9IGZyb20gJy4vYXV0aG9yaXphdGlvbl9yZXF1ZXN0JztcbmltcG9ydCB7QXV0aG9yaXphdGlvblJlcXVlc3RIYW5kbGVyLCBBdXRob3JpemF0aW9uUmVxdWVzdFJlc3BvbnNlfSBmcm9tICcuL2F1dGhvcml6YXRpb25fcmVxdWVzdF9oYW5kbGVyJztcbmltcG9ydCB7QXV0aG9yaXphdGlvblJlc3BvbnNlfSBmcm9tICcuL2F1dGhvcml6YXRpb25fcmVzcG9uc2UnXG5pbXBvcnQge0F1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9hdXRob3JpemF0aW9uX3NlcnZpY2VfY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0NyeXB0bywgRGVmYXVsdENyeXB0b30gZnJvbSAnLi9jcnlwdG9fdXRpbHMnO1xuaW1wb3J0IHtFbmRTZXNzaW9uUmVxdWVzdH0gZnJvbSAnLi9lbmRfc2Vzc2lvbl9yZXF1ZXN0JztcbmltcG9ydCB7RW5kU2Vzc2lvblJlc3BvbnNlfSBmcm9tICcuL2VuZF9zZXNzaW9uX3Jlc3BvbnNlJztcbmltcG9ydCB7bG9nfSBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQge0Jhc2ljUXVlcnlTdHJpbmdVdGlsc30gZnJvbSAnLi9xdWVyeV9zdHJpbmdfdXRpbHMnO1xuaW1wb3J0IHtMb2NhbFN0b3JhZ2VCYWNrZW5kLCBTdG9yYWdlQmFja2VuZH0gZnJvbSAnLi9zdG9yYWdlJztcbmltcG9ydCB7TG9jYXRpb25MaWtlLCBSZWRpcmVjdFJlcXVlc3RUeXBlc30gZnJvbSAnLi90eXBlcyc7XG5cblxuLyoqIGtleSBmb3IgYXV0aG9yaXphdGlvbiByZXF1ZXN0LiAqL1xuY29uc3QgcmVxdWVzdEtleSA9XG4gICAgKGhhbmRsZTogc3RyaW5nLCByZXF1ZXN0VHlwZTogUmVkaXJlY3RSZXF1ZXN0VHlwZXMpID0+IHtcbiAgICAgIHJldHVybiBgJHtoYW5kbGV9X2FwcGF1dGhfJHtyZXF1ZXN0VHlwZX1fcmVxdWVzdGA7XG4gICAgfVxuXG4vKioga2V5IGZvciBhdXRob3JpemF0aW9uIHNlcnZpY2UgY29uZmlndXJhdGlvbiAqL1xuY29uc3Qgc2VydmljZUNvbmZpZ3VyYXRpb25LZXkgPVxuICAgIChoYW5kbGU6IHN0cmluZywgcmVxdWVzdFR5cGU6IFJlZGlyZWN0UmVxdWVzdFR5cGVzKSA9PiB7XG4gICAgICByZXR1cm4gYCR7aGFuZGxlfV9hcHBhdXRoXyR7cmVxdWVzdFR5cGV9X3NlcnZpY2VfY29uZmlndXJhdGlvbmA7XG4gICAgfVxuXG4vKioga2V5IGluIGxvY2FsIHN0b3JhZ2Ugd2hpY2ggcmVwcmVzZW50cyB0aGUgY3VycmVudCBhdXRob3JpemF0aW9uIHJlcXVlc3QuICovXG5jb25zdCBSRVFVRVNUX0hBTkRMRV9LRVkgPSAocmVxdWVzdFR5cGU6IFJlZGlyZWN0UmVxdWVzdFR5cGVzKSA9PlxuICAgIGBhcHBhdXRoX2N1cnJlbnRfJHtyZXF1ZXN0VHlwZX1fcmVxdWVzdGA7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBBdXRob3JpemF0aW9uUmVxdWVzdEhhbmRsZXIgd2hpY2ggdXNlcyBhIHN0YW5kYXJkXG4gKiByZWRpcmVjdCBiYXNlZCBjb2RlIGZsb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWRpcmVjdFJlcXVlc3RIYW5kbGVyIGV4dGVuZHMgQXV0aG9yaXphdGlvblJlcXVlc3RIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvLyB1c2UgdGhlIHByb3ZpZGVkIHN0b3JhZ2UgYmFja2VuZFxuICAgICAgLy8gb3IgaW5pdGlhbGl6ZSBsb2NhbCBzdG9yYWdlIHdpdGggdGhlIGRlZmF1bHQgc3RvcmFnZSBiYWNrZW5kIHdoaWNoXG4gICAgICAvLyB1c2VzIHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgICAgIHB1YmxpYyBzdG9yYWdlQmFja2VuZDogU3RvcmFnZUJhY2tlbmQgPSBuZXcgTG9jYWxTdG9yYWdlQmFja2VuZCgpLFxuICAgICAgdXRpbHMgPSBuZXcgQmFzaWNRdWVyeVN0cmluZ1V0aWxzKCksXG4gICAgICBwdWJsaWMgbG9jYXRpb25MaWtlOiBMb2NhdGlvbkxpa2UgPSB3aW5kb3cubG9jYXRpb24sXG4gICAgICBjcnlwdG86IENyeXB0byA9IG5ldyBEZWZhdWx0Q3J5cHRvKCkpIHtcbiAgICBzdXBlcih1dGlscywgY3J5cHRvKTtcbiAgfVxuXG4gIHBlcmZvcm1BdXRob3JpemF0aW9uUmVxdWVzdChcbiAgICAgIGNvbmZpZ3VyYXRpb246IEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbixcbiAgICAgIHJlcXVlc3Q6IEF1dGhvcml6YXRpb25SZXF1ZXN0KSB7XG4gICAgdGhpcy5wZXJmb3JtUmVxdWVzdChjb25maWd1cmF0aW9uLCByZXF1ZXN0LCBSZWRpcmVjdFJlcXVlc3RUeXBlcy5hdXRob3JpemF0aW9uKTtcbiAgfVxuXG4gIHBlcmZvcm1FbmRTZXNzaW9uUmVxdWVzdChcbiAgICAgIGNvbmZpZ3VyYXRpb246IEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbixcbiAgICAgIHJlcXVlc3Q6IEVuZFNlc3Npb25SZXF1ZXN0KSB7XG4gICAgdGhpcy5wZXJmb3JtUmVxdWVzdChjb25maWd1cmF0aW9uLCByZXF1ZXN0LCBSZWRpcmVjdFJlcXVlc3RUeXBlcy5lbmRTZXNzaW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgcGVyZm9ybVJlcXVlc3QoXG4gICAgICBjb25maWd1cmF0aW9uOiBBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb24sXG4gICAgICByZXF1ZXN0OiBBdXRob3JpemF0aW9uTWFuYWdlbWVudFJlcXVlc3QsXG4gICAgICByZXF1ZXN0VHlwZTogUmVkaXJlY3RSZXF1ZXN0VHlwZXMgPSBSZWRpcmVjdFJlcXVlc3RUeXBlcy5hdXRob3JpemF0aW9uKSB7XG4gICAgY29uc3QgaGFuZGxlID0gdGhpcy5jcnlwdG8uZ2VuZXJhdGVSYW5kb20oMTApO1xuXG4gICAgLy8gYmVmb3JlIHlvdSBtYWtlIHJlcXVlc3QsIHBlcnNpc3QgYWxsIHJlcXVlc3QgcmVsYXRlZCBkYXRhIGluIGxvY2FsIHN0b3JhZ2UuXG4gICAgY29uc3QgcGVyc2lzdGVkID0gUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5zdG9yYWdlQmFja2VuZC5zZXRJdGVtKFJFUVVFU1RfSEFORExFX0tFWShyZXF1ZXN0VHlwZSksIGhhbmRsZSksXG4gICAgICAvLyBDYWxsaW5nIHRvSnNvbigpIGFkZHMgaW4gdGhlIGNvZGUgJiBjaGFsbGVuZ2Ugd2hlbiBwb3NzaWJsZVxuICAgICAgcmVxdWVzdC50b0pzb24oKS50aGVuKFxuICAgICAgICAgIHJlc3VsdCA9PlxuICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2VCYWNrZW5kLnNldEl0ZW0ocmVxdWVzdEtleShoYW5kbGUsIHJlcXVlc3RUeXBlKSwgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSkpLFxuICAgICAgdGhpcy5zdG9yYWdlQmFja2VuZC5zZXRJdGVtKFxuICAgICAgICAgIHNlcnZpY2VDb25maWd1cmF0aW9uS2V5KGhhbmRsZSwgcmVxdWVzdFR5cGUpLCBKU09OLnN0cmluZ2lmeShjb25maWd1cmF0aW9uLnRvSnNvbigpKSksXG4gICAgXSk7XG5cbiAgICBwZXJzaXN0ZWQudGhlbigoKSA9PiB7XG4gICAgICAvLyBtYWtlIHRoZSByZWRpcmVjdCByZXF1ZXN0XG4gICAgICBsZXQgdXJsID0gdGhpcy5idWlsZFJlcXVlc3RVcmwoY29uZmlndXJhdGlvbiwgcmVxdWVzdCwgcmVxdWVzdFR5cGUpO1xuICAgICAgbG9nKCdNYWtpbmcgYSByZXF1ZXN0IHRvICcsIHJlcXVlc3QsIHVybCk7XG4gICAgICB0aGlzLmxvY2F0aW9uTGlrZS5hc3NpZ24odXJsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBpbnRyb3NwZWN0IHRoZSBjb250ZW50cyBvZiBzdG9yYWdlIGJhY2tlbmQgYW5kIGNvbXBsZXRlcyB0aGVcbiAgICogIGF1dGhvcml6YXRpb24gcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBjb21wbGV0ZUF1dGhvcml6YXRpb25SZXF1ZXN0KCk6IFByb21pc2U8QXV0aG9yaXphdGlvblJlcXVlc3RSZXNwb25zZXxudWxsPiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGxldGVSZXF1ZXN0KFJlZGlyZWN0UmVxdWVzdFR5cGVzLmF1dGhvcml6YXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGludHJvc3BlY3QgdGhlIGNvbnRlbnRzIG9mIHN0b3JhZ2UgYmFja2VuZCBhbmQgY29tcGxldGVzIHRoZVxuICAgKiBlbmQgc2Vzc2lvbiByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbXBsZXRlRW5kU2Vzc2lvblJlcXVlc3QoKTogUHJvbWlzZTxBdXRob3JpemF0aW9uUmVxdWVzdFJlc3BvbnNlfG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5jb21wbGV0ZVJlcXVlc3QoUmVkaXJlY3RSZXF1ZXN0VHlwZXMuZW5kU2Vzc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gaW50cm9zcGVjdCB0aGUgY29udGVudHMgb2Ygc3RvcmFnZSBiYWNrZW5kIGFuZCBjb21wbGV0ZXMgdGhlXG4gICAqIHJlcXVlc3QuXG4gICAqL1xuICBwcml2YXRlIGNvbXBsZXRlUmVxdWVzdChyZXF1ZXN0VHlwZTogUmVkaXJlY3RSZXF1ZXN0VHlwZXMpIHtcbiAgICAvLyBUT0RPKHJhaHVscmF2QCk6IGhhbmRsZSBhdXRob3JpemF0aW9uIGVycm9ycy5cbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlQmFja2VuZC5nZXRJdGVtKFJFUVVFU1RfSEFORExFX0tFWShyZXF1ZXN0VHlwZSkpLnRoZW4oaGFuZGxlID0+IHtcbiAgICAgIGlmIChoYW5kbGUpIHtcbiAgICAgICAgLy8gd2UgaGF2ZSBhIHBlbmRpbmcgcmVxdWVzdC5cbiAgICAgICAgLy8gZmV0Y2ggYXV0aG9yaXphdGlvbiByZXF1ZXN0LCBhbmQgY2hlY2sgc3RhdGVcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZUJhY2tlbmRcbiAgICAgICAgICAgIC5nZXRJdGVtKHJlcXVlc3RLZXkoaGFuZGxlLCByZXF1ZXN0VHlwZSkpXG4gICAgICAgICAgICAvLyByZXF1aXJlcyBhIGNvcnJlc3BvbmRpbmcgaW5zdGFuY2Ugb2YgcmVzdWx0XG4gICAgICAgICAgICAvLyBUT0RPKHJhaHVscmF2QCk6IGNoZWNrIGZvciBpbmNvbnNpc3RlbnQgc3RhdGUgaGVyZVxuICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IEpTT04ucGFyc2UocmVzdWx0ISkpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBqc29uID0+IHJlcXVlc3RUeXBlID09PSBSZWRpcmVjdFJlcXVlc3RUeXBlcy5hdXRob3JpemF0aW9uID9cbiAgICAgICAgICAgICAgICAgICAgbmV3IEF1dGhvcml6YXRpb25SZXF1ZXN0KGpzb24pIDpcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVuZFNlc3Npb25SZXF1ZXN0KGpzb24pKVxuICAgICAgICAgICAgLnRoZW4ocmVxdWVzdCA9PiB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIHJlZGlyZWN0X3VyaSBhbmQgc3RhdGVcbiAgICAgICAgICAgICAgbGV0IGN1cnJlbnRVcmkgPSBgJHt0aGlzLmxvY2F0aW9uTGlrZS5vcmlnaW59JHt0aGlzLmxvY2F0aW9uTGlrZS5wYXRobmFtZX1gO1xuICAgICAgICAgICAgICBsZXQgcXVlcnlQYXJhbXMgPSB0aGlzLnV0aWxzLnBhcnNlKHRoaXMubG9jYXRpb25MaWtlLCB0cnVlIC8qIHVzZSBoYXNoICovKTtcbiAgICAgICAgICAgICAgbGV0IHN0YXRlOiBzdHJpbmd8dW5kZWZpbmVkID0gcXVlcnlQYXJhbXNbJ3N0YXRlJ107XG4gICAgICAgICAgICAgIGxldCBjb2RlOiBzdHJpbmd8dW5kZWZpbmVkID0gcXVlcnlQYXJhbXNbJ2NvZGUnXTtcbiAgICAgICAgICAgICAgbGV0IGVycm9yOiBzdHJpbmd8dW5kZWZpbmVkID0gcXVlcnlQYXJhbXNbJ2Vycm9yJ107XG4gICAgICAgICAgICAgIGlmIChyZXF1ZXN0VHlwZSA9PT0gUmVkaXJlY3RSZXF1ZXN0VHlwZXMuYXV0aG9yaXphdGlvbikge1xuICAgICAgICAgICAgICAgIGxvZygnUG90ZW50aWFsIGF1dGhvcml6YXRpb24gcmVxdWVzdCAnLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VXJpLFxuICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIGNvZGUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2coJ1BvdGVudGlhbCBlbmQgc2Vzc2lvbiByZXF1ZXN0ICcsIGN1cnJlbnRVcmksIHF1ZXJ5UGFyYW1zLCBzdGF0ZSwgZXJyb3IpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGV0IHNob3VsZE5vdGlmeSA9IHN0YXRlID09PSByZXF1ZXN0LnN0YXRlO1xuICAgICAgICAgICAgICBsZXQgYXV0aG9yaXphdGlvblJlc3BvbnNlOiBFbmRTZXNzaW9uUmVzcG9uc2V8QXV0aG9yaXphdGlvblJlc3BvbnNlfG51bGwgPSBudWxsO1xuICAgICAgICAgICAgICBsZXQgYXV0aG9yaXphdGlvbkVycm9yOiBBdXRob3JpemF0aW9uRXJyb3J8bnVsbCA9IG51bGw7XG4gICAgICAgICAgICAgIGlmIChzaG91bGROb3RpZnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIC8vIGdldCBhZGRpdGlvbmFsIG9wdGlvbmFsIGluZm8uXG4gICAgICAgICAgICAgICAgICBsZXQgZXJyb3JVcmkgPSBxdWVyeVBhcmFtc1snZXJyb3JfdXJpJ107XG4gICAgICAgICAgICAgICAgICBsZXQgZXJyb3JEZXNjcmlwdGlvbiA9IHF1ZXJ5UGFyYW1zWydlcnJvcl9kZXNjcmlwdGlvbiddO1xuICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVycm9yID0gbmV3IEF1dGhvcml6YXRpb25FcnJvcih7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb246IGVycm9yRGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yX3VyaTogZXJyb3JVcmksXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0VHlwZSA9PT0gUmVkaXJlY3RSZXF1ZXN0VHlwZXMuYXV0aG9yaXphdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uUmVzcG9uc2UgPSBuZXcgQXV0aG9yaXphdGlvblJlc3BvbnNlKHtjb2RlOiBjb2RlLCBzdGF0ZTogc3RhdGV9KTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdFR5cGUgPT09IFJlZGlyZWN0UmVxdWVzdFR5cGVzLmVuZFNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvblJlc3BvbnNlID0gbmV3IEVuZFNlc3Npb25SZXNwb25zZSh7c3RhdGU6IHN0YXRlfSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY2xlYW51cCBzdGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgICAgICAgICAgICAgIC5hbGwoW1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmFnZUJhY2tlbmQucmVtb3ZlSXRlbShSRVFVRVNUX0hBTkRMRV9LRVkocmVxdWVzdFR5cGUpKSxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2VCYWNrZW5kLnJlbW92ZUl0ZW0ocmVxdWVzdEtleShoYW5kbGUsIHJlcXVlc3RUeXBlKSksXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yYWdlQmFja2VuZC5yZW1vdmVJdGVtKHNlcnZpY2VDb25maWd1cmF0aW9uS2V5KGhhbmRsZSwgcmVxdWVzdFR5cGUpKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgbG9nKCdEZWxpdmVyaW5nIGF1dGhvcml6YXRpb24gcmVzcG9uc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBhdXRob3JpemF0aW9uUmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYXV0aG9yaXphdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgfSBhcyBBdXRob3JpemF0aW9uUmVxdWVzdFJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2coJ01pc21hdGNoZWQgcmVxdWVzdCAoc3RhdGUgYW5kIHJlcXVlc3RfdXJpKSBkb250IG1hdGNoLicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==