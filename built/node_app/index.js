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
exports.App = void 0;
// Represents a Node application, that uses the CorePass JS library.
var authorization_request_1 = require("../authorization_request");
var authorization_request_handler_1 = require("../authorization_request_handler");
var authorization_service_configuration_1 = require("../authorization_service_configuration");
var logger_1 = require("../logger");
var node_support_1 = require("../node_support");
var node_requestor_1 = require("../node_support/node_requestor");
var node_request_handler_1 = require("../node_support/node_request_handler");
var revoke_token_request_1 = require("../revoke_token_request");
var token_request_1 = require("../token_request");
var token_request_handler_1 = require("../token_request_handler");
var PORT = 32111;
/* the Node.js based HTTP client. */
var requestor = new node_requestor_1.NodeRequestor();
/* an example open id connect provider */
var openIdConnectUrl = 'https://accounts.google.com';
/* example client configuration */
var clientId = '511828570984-7nmej36h9j2tebiqmpqh835naet4vci4.apps.googleusercontent.com';
var redirectUri = "http://127.0.0.1:".concat(PORT);
var scope = 'openid';
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        this.notifier = new authorization_request_handler_1.AuthorizationNotifier();
        this.authorizationHandler = new node_request_handler_1.NodeBasedHandler(PORT);
        this.tokenHandler = new token_request_handler_1.BaseTokenRequestHandler(requestor);
        // set notifier to deliver responses
        this.authorizationHandler.setAuthorizationNotifier(this.notifier);
        // set a listener to listen for authorization responses
        // make refresh and access token requests.
        this.notifier.setAuthorizationListener(function (request, response, error) {
            (0, logger_1.log)('Authorization request complete ', request, response, error);
            if (response) {
                _this.makeRefreshTokenRequest(_this.configuration, request, response)
                    .then(function (result) { return _this.makeAccessTokenRequest(_this.configuration, result.refreshToken); })
                    .then(function () { return (0, logger_1.log)('All done.'); });
            }
        });
    }
    App.prototype.fetchServiceConfiguration = function () {
        return authorization_service_configuration_1.AuthorizationServiceConfiguration.fetchFromIssuer(openIdConnectUrl, requestor)
            .then(function (response) {
            (0, logger_1.log)('Fetched service configuration', response);
            return response;
        });
    };
    App.prototype.makeAuthorizationRequest = function (configuration) {
        // create a request
        var request = new authorization_request_1.AuthorizationRequest({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scope,
            response_type: authorization_request_1.AuthorizationRequest.RESPONSE_TYPE_CODE,
            state: undefined,
            extras: { 'prompt': 'consent', 'access_type': 'offline' }
        }, new node_support_1.NodeCrypto());
        (0, logger_1.log)('Making authorization request ', configuration, request);
        this.authorizationHandler.performAuthorizationRequest(configuration, request);
    };
    App.prototype.makeRefreshTokenRequest = function (configuration, request, response) {
        var extras = undefined;
        if (request && request.internal) {
            extras = {};
            extras['code_verifier'] = request.internal['code_verifier'];
        }
        var tokenRequest = new token_request_1.TokenRequest({
            client_id: clientId,
            redirect_uri: redirectUri,
            grant_type: token_request_1.GRANT_TYPE_AUTHORIZATION_CODE,
            code: response.code,
            refresh_token: undefined,
            extras: extras
        });
        return this.tokenHandler.performTokenRequest(configuration, tokenRequest).then(function (response) {
            (0, logger_1.log)("Refresh Token is ".concat(response.refreshToken));
            return response;
        });
    };
    App.prototype.makeAccessTokenRequest = function (configuration, refreshToken) {
        var request = new token_request_1.TokenRequest({
            client_id: clientId,
            redirect_uri: redirectUri,
            grant_type: token_request_1.GRANT_TYPE_REFRESH_TOKEN,
            code: undefined,
            refresh_token: refreshToken,
            extras: undefined
        });
        return this.tokenHandler.performTokenRequest(configuration, request).then(function (response) {
            (0, logger_1.log)("Access Token is ".concat(response.accessToken, ", Id Token is ").concat(response.idToken));
            return response;
        });
    };
    App.prototype.makeRevokeTokenRequest = function (configuration, refreshToken) {
        var request = new revoke_token_request_1.RevokeTokenRequest({ token: refreshToken });
        return this.tokenHandler.performRevokeTokenRequest(configuration, request).then(function (response) {
            (0, logger_1.log)('revoked refreshToken');
            return response;
        });
    };
    return App;
}());
exports.App = App;
(0, logger_1.log)('Application is ready.');
var app = new App();
app.fetchServiceConfiguration()
    .then(function (configuration) {
    app.configuration = configuration;
    app.makeAuthorizationRequest(configuration);
    // notifier makes token requests.
})
    .catch(function (error) {
    (0, logger_1.log)('Something bad happened ', error);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbm9kZV9hcHAvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7R0FZRzs7O0FBRUgsb0VBQW9FO0FBRXBFLGtFQUFnRTtBQUNoRSxrRkFBc0c7QUFFdEcsOEZBQTJGO0FBQzNGLG9DQUFnQztBQUNoQyxnREFBNkM7QUFDN0MsaUVBQStEO0FBQy9ELDZFQUF3RTtBQUN4RSxnRUFBNkQ7QUFDN0Qsa0RBQXlHO0FBQ3pHLGtFQUF3RjtBQUd4RixJQUFNLElBQUksR0FBRyxLQUFLLENBQUM7QUFFbkIsb0NBQW9DO0FBQ3BDLElBQU0sU0FBUyxHQUFHLElBQUksOEJBQWEsRUFBRSxDQUFDO0FBRXRDLHlDQUF5QztBQUN6QyxJQUFNLGdCQUFnQixHQUFHLDZCQUE2QixDQUFDO0FBRXZELGtDQUFrQztBQUNsQyxJQUFNLFFBQVEsR0FBRywwRUFBMEUsQ0FBQztBQUM1RixJQUFNLFdBQVcsR0FBRywyQkFBb0IsSUFBSSxDQUFFLENBQUM7QUFDL0MsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDO0FBRXZCO0lBUUU7UUFBQSxpQkFnQkM7UUFmQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUkscURBQXFCLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSx1Q0FBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksK0NBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0Qsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEUsdURBQXVEO1FBQ3ZELDBDQUEwQztRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLFVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLO1lBQzlELElB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QUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHRcbiAqIGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGVcbiAqIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIFJlcHJlc2VudHMgYSBOb2RlIGFwcGxpY2F0aW9uLCB0aGF0IHVzZXMgdGhlIENvcmVQYXNzIEpTIGxpYnJhcnkuXG5cbmltcG9ydCB7IEF1dGhvcml6YXRpb25SZXF1ZXN0IH0gZnJvbSAnLi4vYXV0aG9yaXphdGlvbl9yZXF1ZXN0JztcbmltcG9ydCB7IEF1dGhvcml6YXRpb25Ob3RpZmllciwgQXV0aG9yaXphdGlvblJlcXVlc3RIYW5kbGVyIH0gZnJvbSAnLi4vYXV0aG9yaXphdGlvbl9yZXF1ZXN0X2hhbmRsZXInO1xuaW1wb3J0IHsgQXV0aG9yaXphdGlvblJlc3BvbnNlIH0gZnJvbSAnLi4vYXV0aG9yaXphdGlvbl9yZXNwb25zZSc7XG5pbXBvcnQgeyBBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9hdXRob3JpemF0aW9uX3NlcnZpY2VfY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgTm9kZUNyeXB0byB9IGZyb20gJy4uL25vZGVfc3VwcG9ydCc7XG5pbXBvcnQgeyBOb2RlUmVxdWVzdG9yIH0gZnJvbSAnLi4vbm9kZV9zdXBwb3J0L25vZGVfcmVxdWVzdG9yJztcbmltcG9ydCB7IE5vZGVCYXNlZEhhbmRsZXIgfSBmcm9tICcuLi9ub2RlX3N1cHBvcnQvbm9kZV9yZXF1ZXN0X2hhbmRsZXInO1xuaW1wb3J0IHsgUmV2b2tlVG9rZW5SZXF1ZXN0IH0gZnJvbSAnLi4vcmV2b2tlX3Rva2VuX3JlcXVlc3QnO1xuaW1wb3J0IHsgR1JBTlRfVFlQRV9BVVRIT1JJWkFUSU9OX0NPREUsIEdSQU5UX1RZUEVfUkVGUkVTSF9UT0tFTiwgVG9rZW5SZXF1ZXN0IH0gZnJvbSAnLi4vdG9rZW5fcmVxdWVzdCc7XG5pbXBvcnQgeyBCYXNlVG9rZW5SZXF1ZXN0SGFuZGxlciwgVG9rZW5SZXF1ZXN0SGFuZGxlciB9IGZyb20gJy4uL3Rva2VuX3JlcXVlc3RfaGFuZGxlcic7XG5pbXBvcnQgeyBTdHJpbmdNYXAgfSBmcm9tICcuLi90eXBlcyc7XG5cbmNvbnN0IFBPUlQgPSAzMjExMTtcblxuLyogdGhlIE5vZGUuanMgYmFzZWQgSFRUUCBjbGllbnQuICovXG5jb25zdCByZXF1ZXN0b3IgPSBuZXcgTm9kZVJlcXVlc3RvcigpO1xuXG4vKiBhbiBleGFtcGxlIG9wZW4gaWQgY29ubmVjdCBwcm92aWRlciAqL1xuY29uc3Qgb3BlbklkQ29ubmVjdFVybCA9ICdodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20nO1xuXG4vKiBleGFtcGxlIGNsaWVudCBjb25maWd1cmF0aW9uICovXG5jb25zdCBjbGllbnRJZCA9ICc1MTE4Mjg1NzA5ODQtN25tZWozNmg5ajJ0ZWJpcW1wcWg4MzVuYWV0NHZjaTQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nO1xuY29uc3QgcmVkaXJlY3RVcmkgPSBgaHR0cDovLzEyNy4wLjAuMToke1BPUlR9YDtcbmNvbnN0IHNjb3BlID0gJ29wZW5pZCc7XG5cbmV4cG9ydCBjbGFzcyBBcHAge1xuICBwcml2YXRlIG5vdGlmaWVyOiBBdXRob3JpemF0aW9uTm90aWZpZXI7XG4gIHByaXZhdGUgYXV0aG9yaXphdGlvbkhhbmRsZXI6IEF1dGhvcml6YXRpb25SZXF1ZXN0SGFuZGxlcjtcbiAgcHJpdmF0ZSB0b2tlbkhhbmRsZXI6IFRva2VuUmVxdWVzdEhhbmRsZXI7XG5cbiAgLy8gc3RhdGVcbiAgY29uZmlndXJhdGlvbjogQXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9ufHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5vdGlmaWVyID0gbmV3IEF1dGhvcml6YXRpb25Ob3RpZmllcigpO1xuICAgIHRoaXMuYXV0aG9yaXphdGlvbkhhbmRsZXIgPSBuZXcgTm9kZUJhc2VkSGFuZGxlcihQT1JUKTtcbiAgICB0aGlzLnRva2VuSGFuZGxlciA9IG5ldyBCYXNlVG9rZW5SZXF1ZXN0SGFuZGxlcihyZXF1ZXN0b3IpO1xuICAgIC8vIHNldCBub3RpZmllciB0byBkZWxpdmVyIHJlc3BvbnNlc1xuICAgIHRoaXMuYXV0aG9yaXphdGlvbkhhbmRsZXIuc2V0QXV0aG9yaXphdGlvbk5vdGlmaWVyKHRoaXMubm90aWZpZXIpO1xuICAgIC8vIHNldCBhIGxpc3RlbmVyIHRvIGxpc3RlbiBmb3IgYXV0aG9yaXphdGlvbiByZXNwb25zZXNcbiAgICAvLyBtYWtlIHJlZnJlc2ggYW5kIGFjY2VzcyB0b2tlbiByZXF1ZXN0cy5cbiAgICB0aGlzLm5vdGlmaWVyLnNldEF1dGhvcml6YXRpb25MaXN0ZW5lcigocmVxdWVzdCwgcmVzcG9uc2UsIGVycm9yKSA9PiB7XG4gICAgICBsb2coJ0F1dGhvcml6YXRpb24gcmVxdWVzdCBjb21wbGV0ZSAnLCByZXF1ZXN0LCByZXNwb25zZSwgZXJyb3IpO1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMubWFrZVJlZnJlc2hUb2tlblJlcXVlc3QodGhpcy5jb25maWd1cmF0aW9uISwgcmVxdWVzdCBhcyBBdXRob3JpemF0aW9uUmVxdWVzdCwgcmVzcG9uc2UgYXMgQXV0aG9yaXphdGlvblJlc3BvbnNlKVxuICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHRoaXMubWFrZUFjY2Vzc1Rva2VuUmVxdWVzdCh0aGlzLmNvbmZpZ3VyYXRpb24hLCByZXN1bHQucmVmcmVzaFRva2VuISkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiBsb2coJ0FsbCBkb25lLicpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZldGNoU2VydmljZUNvbmZpZ3VyYXRpb24oKTogUHJvbWlzZTxBdXRob3JpemF0aW9uU2VydmljZUNvbmZpZ3VyYXRpb24+IHtcbiAgICByZXR1cm4gQXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uLmZldGNoRnJvbUlzc3VlcihvcGVuSWRDb25uZWN0VXJsLCByZXF1ZXN0b3IpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBsb2coJ0ZldGNoZWQgc2VydmljZSBjb25maWd1cmF0aW9uJywgcmVzcG9uc2UpO1xuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBtYWtlQXV0aG9yaXphdGlvblJlcXVlc3QoY29uZmlndXJhdGlvbjogQXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uKSB7XG4gICAgLy8gY3JlYXRlIGEgcmVxdWVzdFxuICAgIGxldCByZXF1ZXN0ID0gbmV3IEF1dGhvcml6YXRpb25SZXF1ZXN0KHtcbiAgICAgIGNsaWVudF9pZDogY2xpZW50SWQsXG4gICAgICByZWRpcmVjdF91cmk6IHJlZGlyZWN0VXJpLFxuICAgICAgc2NvcGU6IHNjb3BlLFxuICAgICAgcmVzcG9uc2VfdHlwZTogQXV0aG9yaXphdGlvblJlcXVlc3QuUkVTUE9OU0VfVFlQRV9DT0RFLFxuICAgICAgc3RhdGU6IHVuZGVmaW5lZCxcbiAgICAgIGV4dHJhczogeydwcm9tcHQnOiAnY29uc2VudCcsICdhY2Nlc3NfdHlwZSc6ICdvZmZsaW5lJ31cbiAgICB9LCBuZXcgTm9kZUNyeXB0bygpKTtcblxuICAgIGxvZygnTWFraW5nIGF1dGhvcml6YXRpb24gcmVxdWVzdCAnLCBjb25maWd1cmF0aW9uLCByZXF1ZXN0KTtcbiAgICB0aGlzLmF1dGhvcml6YXRpb25IYW5kbGVyLnBlcmZvcm1BdXRob3JpemF0aW9uUmVxdWVzdChjb25maWd1cmF0aW9uLCByZXF1ZXN0KTtcbiAgfVxuXG4gIG1ha2VSZWZyZXNoVG9rZW5SZXF1ZXN0KFxuICAgICAgY29uZmlndXJhdGlvbjogQXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uLFxuICAgICAgcmVxdWVzdDogQXV0aG9yaXphdGlvblJlcXVlc3QsXG4gICAgICByZXNwb25zZTogQXV0aG9yaXphdGlvblJlc3BvbnNlKSB7XG5cbiAgICBsZXQgZXh0cmFzOiBTdHJpbmdNYXB8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmIChyZXF1ZXN0ICYmIHJlcXVlc3QuaW50ZXJuYWwpIHtcbiAgICAgIGV4dHJhcyA9IHt9O1xuICAgICAgZXh0cmFzWydjb2RlX3ZlcmlmaWVyJ10gPSByZXF1ZXN0LmludGVybmFsWydjb2RlX3ZlcmlmaWVyJ107XG4gICAgfVxuXG4gICAgbGV0IHRva2VuUmVxdWVzdCA9IG5ldyBUb2tlblJlcXVlc3Qoe1xuICAgICAgY2xpZW50X2lkOiBjbGllbnRJZCxcbiAgICAgIHJlZGlyZWN0X3VyaTogcmVkaXJlY3RVcmksXG4gICAgICBncmFudF90eXBlOiBHUkFOVF9UWVBFX0FVVEhPUklaQVRJT05fQ09ERSxcbiAgICAgIGNvZGU6IHJlc3BvbnNlLmNvZGUsXG4gICAgICByZWZyZXNoX3Rva2VuOiB1bmRlZmluZWQsXG4gICAgICBleHRyYXM6IGV4dHJhc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMudG9rZW5IYW5kbGVyLnBlcmZvcm1Ub2tlblJlcXVlc3QoY29uZmlndXJhdGlvbiwgdG9rZW5SZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIGxvZyhgUmVmcmVzaCBUb2tlbiBpcyAke3Jlc3BvbnNlLnJlZnJlc2hUb2tlbn1gKTtcbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9KTtcbiAgfVxuXG4gIG1ha2VBY2Nlc3NUb2tlblJlcXVlc3QoY29uZmlndXJhdGlvbjogQXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9uLCByZWZyZXNoVG9rZW46IHN0cmluZykge1xuICAgIGxldCByZXF1ZXN0ID0gbmV3IFRva2VuUmVxdWVzdCh7XG4gICAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxuICAgICAgcmVkaXJlY3RfdXJpOiByZWRpcmVjdFVyaSxcbiAgICAgIGdyYW50X3R5cGU6IEdSQU5UX1RZUEVfUkVGUkVTSF9UT0tFTixcbiAgICAgIGNvZGU6IHVuZGVmaW5lZCxcbiAgICAgIHJlZnJlc2hfdG9rZW46IHJlZnJlc2hUb2tlbixcbiAgICAgIGV4dHJhczogdW5kZWZpbmVkXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbkhhbmRsZXIucGVyZm9ybVRva2VuUmVxdWVzdChjb25maWd1cmF0aW9uLCByZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIGxvZyhgQWNjZXNzIFRva2VuIGlzICR7cmVzcG9uc2UuYWNjZXNzVG9rZW59LCBJZCBUb2tlbiBpcyAke3Jlc3BvbnNlLmlkVG9rZW59YCk7XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSk7XG4gIH1cblxuICBtYWtlUmV2b2tlVG9rZW5SZXF1ZXN0KGNvbmZpZ3VyYXRpb246IEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbiwgcmVmcmVzaFRva2VuOiBzdHJpbmcpIHtcbiAgICBsZXQgcmVxdWVzdCA9IG5ldyBSZXZva2VUb2tlblJlcXVlc3Qoe3Rva2VuOiByZWZyZXNoVG9rZW59KTtcblxuICAgIHJldHVybiB0aGlzLnRva2VuSGFuZGxlci5wZXJmb3JtUmV2b2tlVG9rZW5SZXF1ZXN0KGNvbmZpZ3VyYXRpb24sIHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgbG9nKCdyZXZva2VkIHJlZnJlc2hUb2tlbicpO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuICB9XG59XG5cbmxvZygnQXBwbGljYXRpb24gaXMgcmVhZHkuJyk7XG5jb25zdCBhcHAgPSBuZXcgQXBwKCk7XG5cbmFwcC5mZXRjaFNlcnZpY2VDb25maWd1cmF0aW9uKClcbiAgICAudGhlbihjb25maWd1cmF0aW9uID0+IHtcbiAgICAgIGFwcC5jb25maWd1cmF0aW9uID0gY29uZmlndXJhdGlvbjtcbiAgICAgIGFwcC5tYWtlQXV0aG9yaXphdGlvblJlcXVlc3QoY29uZmlndXJhdGlvbik7XG4gICAgICAvLyBub3RpZmllciBtYWtlcyB0b2tlbiByZXF1ZXN0cy5cbiAgICB9KVxuICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICBsb2coJ1NvbWV0aGluZyBiYWQgaGFwcGVuZWQgJywgZXJyb3IpO1xuICAgIH0pO1xuIl19