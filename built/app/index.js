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
// Represents the test web app that uses the CorePass JS library.
var authorization_request_1 = require("../authorization_request");
var authorization_request_handler_1 = require("../authorization_request_handler");
var authorization_service_configuration_1 = require("../authorization_service_configuration");
var logger_1 = require("../logger");
var redirect_based_handler_1 = require("../redirect_based_handler");
var token_request_1 = require("../token_request");
var token_request_handler_1 = require("../token_request_handler");
var authorization_response_1 = require("../authorization_response");
/* an example open id connect provider */
var openIdConnectUrl = 'https://accounts.google.com';
/* example client configuration */
var clientId = '511828570984-7nmej36h9j2tebiqmpqh835naet4vci4.apps.googleusercontent.com';
var redirectUri = 'http://localhost:8000/app/redirect.html';
var scope = 'openid';
/**
 * The Test application.
 */
var App = /** @class */ (function () {
    function App(snackbar) {
        var _this = this;
        this.snackbar = snackbar;
        this.notifier = new authorization_request_handler_1.AuthorizationNotifier();
        this.authorizationHandler = new redirect_based_handler_1.RedirectRequestHandler();
        this.tokenHandler = new token_request_handler_1.BaseTokenRequestHandler();
        // set notifier to deliver responses
        this.authorizationHandler.setAuthorizationNotifier(this.notifier);
        // set a listener to listen for authorization responses
        this.notifier.setAuthorizationListener(function (request, response, error) {
            (0, logger_1.log)('Authorization request complete ', request, response, error);
            if (response && response instanceof authorization_response_1.AuthorizationResponse && request instanceof authorization_request_1.AuthorizationRequest) {
                _this.request = request;
                _this.response = response;
                _this.code = response.code;
                _this.showMessage("Authorization Code ".concat(response.code));
            }
        });
    }
    App.prototype.showMessage = function (message) {
        var snackbar = this.snackbar['MaterialSnackbar'];
        snackbar.showSnackbar({ message: message });
    };
    App.prototype.fetchServiceConfiguration = function () {
        var _this = this;
        authorization_service_configuration_1.AuthorizationServiceConfiguration.fetchFromIssuer(openIdConnectUrl)
            .then(function (response) {
            (0, logger_1.log)('Fetched service configuration', response);
            _this.configuration = response;
            _this.showMessage('Completed fetching configuration');
        })
            .catch(function (error) {
            (0, logger_1.log)('Something bad happened', error);
            _this.showMessage("Something bad happened ".concat(error));
        });
    };
    App.prototype.makeAuthorizationRequest = function () {
        // create a request
        var request = new authorization_request_1.AuthorizationRequest({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: scope,
            response_type: authorization_request_1.AuthorizationRequest.RESPONSE_TYPE_CODE,
            state: undefined,
            extras: { 'prompt': 'consent', 'access_type': 'offline' }
        });
        if (this.configuration) {
            this.authorizationHandler.performAuthorizationRequest(this.configuration, request);
        }
        else {
            this.showMessage('Fetch Authorization Service configuration, before you make the authorization request.');
        }
    };
    App.prototype.makeTokenRequest = function () {
        var _this = this;
        if (!this.configuration) {
            this.showMessage('Please fetch service configuration.');
            return;
        }
        var request = null;
        if (this.code) {
            var extras = undefined;
            if (this.request && this.request.internal) {
                extras = {};
                extras['code_verifier'] = this.request.internal['code_verifier'];
            }
            // use the code to make the token request.
            request = new token_request_1.TokenRequest({
                client_id: clientId,
                redirect_uri: redirectUri,
                grant_type: token_request_1.GRANT_TYPE_AUTHORIZATION_CODE,
                code: this.code,
                refresh_token: undefined,
                extras: extras
            });
        }
        else if (this.tokenResponse) {
            // use the token response to make a request for an access token
            request = new token_request_1.TokenRequest({
                client_id: clientId,
                redirect_uri: redirectUri,
                grant_type: token_request_1.GRANT_TYPE_REFRESH_TOKEN,
                code: undefined,
                refresh_token: this.tokenResponse.refreshToken,
                extras: undefined
            });
        }
        if (request) {
            this.tokenHandler.performTokenRequest(this.configuration, request)
                .then(function (response) {
                var isFirstRequest = false;
                if (_this.tokenResponse) {
                    // copy over new fields
                    _this.tokenResponse.accessToken = response.accessToken;
                    _this.tokenResponse.issuedAt = response.issuedAt;
                    _this.tokenResponse.expiresIn = response.expiresIn;
                    _this.tokenResponse.tokenType = response.tokenType;
                    _this.tokenResponse.scope = response.scope;
                }
                else {
                    isFirstRequest = true;
                    _this.tokenResponse = response;
                }
                // unset code, so we can do refresh token exchanges subsequently
                _this.code = undefined;
                if (isFirstRequest) {
                    _this.showMessage("Obtained a refresh token ".concat(response.refreshToken));
                }
                else {
                    _this.showMessage("Obtained an access token ".concat(response.accessToken, "."));
                }
            })
                .catch(function (error) {
                (0, logger_1.log)('Something bad happened', error);
                _this.showMessage("Something bad happened ".concat(error));
            });
        }
    };
    App.prototype.checkForAuthorizationResponse = function () {
        this.authorizationHandler.completeAuthorizationRequestIfPossible();
    };
    return App;
}());
exports.App = App;
// export App
window['App'] = App;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBwL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7OztBQUVILGlFQUFpRTtBQUVqRSxrRUFBOEQ7QUFDOUQsa0ZBQW9HO0FBQ3BHLDhGQUF5RjtBQUN6RixvQ0FBOEI7QUFDOUIsb0VBQWlFO0FBQ2pFLGtEQUF1RztBQUN2RyxrRUFBc0Y7QUFFdEYsb0VBQWtFO0FBcUJsRSx5Q0FBeUM7QUFDekMsSUFBTSxnQkFBZ0IsR0FBRyw2QkFBNkIsQ0FBQztBQUV2RCxrQ0FBa0M7QUFDbEMsSUFBTSxRQUFRLEdBQUcsMEVBQTBFLENBQUM7QUFDNUYsSUFBTSxXQUFXLEdBQUcseUNBQXlDLENBQUM7QUFDOUQsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDO0FBRXZCOztHQUVHO0FBQ0g7SUFZRSxhQUFtQixRQUFpQjtRQUFwQyxpQkFnQkM7UUFoQmtCLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHFEQUFxQixFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksK0NBQXNCLEVBQUUsQ0FBQztRQUN6RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksK0NBQXVCLEVBQUUsQ0FBQztRQUNsRCxvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRSx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSztZQUM5RCxJQUFBLFlBQUcsRUFBQyxpQ0FBaUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLElBQUksUUFBUSxJQUFJLFFBQVEsWUFBWSw4Q0FBcUIsSUFBSSxPQUFP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O29CQUNsQixLQUFJLENBQUMsV0FBVyxDQUFDLG1DQUE0QixRQUFRLENBQUMsWUFBWSxDQUFFLENBQUMsQ0FBQztpQkFDdkU7cUJBQU07b0JBQ0wsS0FBSSxDQUFDLFdBQVcsQ0FBQyxtQ0FBNEIsUUFBUSxDQUFDLFdBQVcsTUFBRyxDQUFDLENBQUM7aUJBQ3ZFO1lBQ0gsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxVQUFBLEtBQUs7Z0JBQ1YsSUFBQSxZQUFHLEVBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3JDLEtBQUksQ0FBQyxXQUFXLENBQUMsaUNBQTBCLEtBQUssQ0FBRSxDQUFDLENBQUE7WUFDckQsQ0FBQyxDQUFDLENBQUM7U0FDUjtJQUNILENBQUM7SUFFRCwyQ0FBNkIsR0FBN0I7UUFDRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsc0NBQXNDLEVBQUUsQ0FBQztJQUNyRSxDQUFDO0lBQ0gsVUFBQztBQUFELENBQUMsQUF2SUQsSUF1SUM7QUF2SVksa0JBQUc7QUF5SWhCLGFBQWE7QUFDWixNQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHRcbiAqIGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGVcbiAqIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIFJlcHJlc2VudHMgdGhlIHRlc3Qgd2ViIGFwcCB0aGF0IHVzZXMgdGhlIENvcmVQYXNzIEpTIGxpYnJhcnkuXG5cbmltcG9ydCB7QXV0aG9yaXphdGlvblJlcXVlc3R9IGZyb20gJy4uL2F1dGhvcml6YXRpb25fcmVxdWVzdCc7XG5pbXBvcnQge0F1dGhvcml6YXRpb25Ob3RpZmllciwgQXV0aG9yaXphdGlvblJlcXVlc3RIYW5kbGVyfSBmcm9tICcuLi9hdXRob3JpemF0aW9uX3JlcXVlc3RfaGFuZGxlcic7XG5pbXBvcnQge0F1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vYXV0aG9yaXphdGlvbl9zZXJ2aWNlX2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtsb2d9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQge1JlZGlyZWN0UmVxdWVzdEhhbmRsZXJ9IGZyb20gJy4uL3JlZGlyZWN0X2Jhc2VkX2hhbmRsZXInO1xuaW1wb3J0IHtHUkFOVF9UWVBFX0FVVEhPUklaQVRJT05fQ09ERSwgR1JBTlRfVFlQRV9SRUZSRVNIX1RPS0VOLCBUb2tlblJlcXVlc3R9IGZyb20gJy4uL3Rva2VuX3JlcXVlc3QnO1xuaW1wb3J0IHtCYXNlVG9rZW5SZXF1ZXN0SGFuZGxlciwgVG9rZW5SZXF1ZXN0SGFuZGxlcn0gZnJvbSAnLi4vdG9rZW5fcmVxdWVzdF9oYW5kbGVyJztcbmltcG9ydCB7VG9rZW5SZXNwb25zZX0gZnJvbSAnLi4vdG9rZW5fcmVzcG9uc2UnO1xuaW1wb3J0IHsgQXV0aG9yaXphdGlvblJlc3BvbnNlIH0gZnJvbSAnLi4vYXV0aG9yaXphdGlvbl9yZXNwb25zZSc7XG5pbXBvcnQgeyBTdHJpbmdNYXAgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBFbmRTZXNzaW9uUmVxdWVzdCB9IGZyb20gJy4uL2VuZF9zZXNzaW9uX3JlcXVlc3QnO1xuXG4vKiBTb21lIGludGVyZmFjZSBkZWNsYXJhdGlvbnMgZm9yIE1hdGVyaWFsIGRlc2lnbiBsaXRlLiAqL1xuXG4vKipcbiAqIFNuYWNrYmFyIG9wdGlvbnMuXG4gKi9cbmRlY2xhcmUgaW50ZXJmYWNlIFNuYWNrQmFyT3B0aW9ucyB7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgdGltZW91dD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBJbnRlcmZhY2UgdGhhdCBkZWZpbmVzIHRoZSBNREwgTWF0ZXJpYWwgU25hY2sgQmFyIEFQSS5cbiAqL1xuZGVjbGFyZSBpbnRlcmZhY2UgTWF0ZXJpYWxTbmFja0JhciB7XG4gIHNob3dTbmFja2JhcjogKG9wdGlvbnM6IFNuYWNrQmFyT3B0aW9ucykgPT4gdm9pZDtcbn1cblxuLyogYW4gZXhhbXBsZSBvcGVuIGlkIGNvbm5lY3QgcHJvdmlkZXIgKi9cbmNvbnN0IG9wZW5JZENvbm5lY3RVcmwgPSAnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tJztcblxuLyogZXhhbXBsZSBjbGllbnQgY29uZmlndXJhdGlvbiAqL1xuY29uc3QgY2xpZW50SWQgPSAnNTExODI4NTcwOTg0LTdubWVqMzZoOWoydGViaXFtcHFoODM1bmFldDR2Y2k0LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJztcbmNvbnN0IHJlZGlyZWN0VXJpID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcHAvcmVkaXJlY3QuaHRtbCc7XG5jb25zdCBzY29wZSA9ICdvcGVuaWQnO1xuXG4vKipcbiAqIFRoZSBUZXN0IGFwcGxpY2F0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQXBwIHtcbiAgcHJpdmF0ZSBub3RpZmllcjogQXV0aG9yaXphdGlvbk5vdGlmaWVyO1xuICBwcml2YXRlIGF1dGhvcml6YXRpb25IYW5kbGVyOiBBdXRob3JpemF0aW9uUmVxdWVzdEhhbmRsZXI7XG4gIHByaXZhdGUgdG9rZW5IYW5kbGVyOiBUb2tlblJlcXVlc3RIYW5kbGVyO1xuXG4gIC8vIHN0YXRlXG4gIHByaXZhdGUgY29uZmlndXJhdGlvbjogQXV0aG9yaXphdGlvblNlcnZpY2VDb25maWd1cmF0aW9ufHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSByZXF1ZXN0OiBBdXRob3JpemF0aW9uUmVxdWVzdHx1bmRlZmluZWQ7XG4gIHByaXZhdGUgcmVzcG9uc2U6IEF1dGhvcml6YXRpb25SZXNwb25zZXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgY29kZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSB0b2tlblJlc3BvbnNlOiBUb2tlblJlc3BvbnNlfHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc25hY2tiYXI6IEVsZW1lbnQpIHtcbiAgICB0aGlzLm5vdGlmaWVyID0gbmV3IEF1dGhvcml6YXRpb25Ob3RpZmllcigpO1xuICAgIHRoaXMuYXV0aG9yaXphdGlvbkhhbmRsZXIgPSBuZXcgUmVkaXJlY3RSZXF1ZXN0SGFuZGxlcigpO1xuICAgIHRoaXMudG9rZW5IYW5kbGVyID0gbmV3IEJhc2VUb2tlblJlcXVlc3RIYW5kbGVyKCk7XG4gICAgLy8gc2V0IG5vdGlmaWVyIHRvIGRlbGl2ZXIgcmVzcG9uc2VzXG4gICAgdGhpcy5hdXRob3JpemF0aW9uSGFuZGxlci5zZXRBdXRob3JpemF0aW9uTm90aWZpZXIodGhpcy5ub3RpZmllcik7XG4gICAgLy8gc2V0IGEgbGlzdGVuZXIgdG8gbGlzdGVuIGZvciBhdXRob3JpemF0aW9uIHJlc3BvbnNlc1xuICAgIHRoaXMubm90aWZpZXIuc2V0QXV0aG9yaXphdGlvbkxpc3RlbmVyKChyZXF1ZXN0LCByZXNwb25zZSwgZXJyb3IpID0+IHtcbiAgICAgIGxvZygnQXV0aG9yaXphdGlvbiByZXF1ZXN0IGNvbXBsZXRlICcsIHJlcXVlc3QsIHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UgaW5zdGFuY2VvZiBBdXRob3JpemF0aW9uUmVzcG9uc2UgJiYgcmVxdWVzdCBpbnN0YW5jZW9mIEF1dGhvcml6YXRpb25SZXF1ZXN0KSB7XG4gICAgICAgIHRoaXMucmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5jb2RlID0gcmVzcG9uc2UuY29kZTtcbiAgICAgICAgdGhpcy5zaG93TWVzc2FnZShgQXV0aG9yaXphdGlvbiBDb2RlICR7cmVzcG9uc2UuY29kZX1gKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNob3dNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIGNvbnN0IHNuYWNrYmFyID0gKHRoaXMuc25hY2tiYXIgYXMgYW55KVsnTWF0ZXJpYWxTbmFja2JhciddIGFzIE1hdGVyaWFsU25hY2tCYXI7XG4gICAgc25hY2tiYXIuc2hvd1NuYWNrYmFyKHttZXNzYWdlOiBtZXNzYWdlfSk7XG4gIH1cblxuICBmZXRjaFNlcnZpY2VDb25maWd1cmF0aW9uKCkge1xuICAgIEF1dGhvcml6YXRpb25TZXJ2aWNlQ29uZmlndXJhdGlvbi5mZXRjaEZyb21Jc3N1ZXIob3BlbklkQ29ubmVjdFVybClcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGxvZygnRmV0Y2hlZCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24nLCByZXNwb25zZSk7XG4gICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gcmVzcG9uc2U7XG4gICAgICAgICAgdGhpcy5zaG93TWVzc2FnZSgnQ29tcGxldGVkIGZldGNoaW5nIGNvbmZpZ3VyYXRpb24nKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBsb2coJ1NvbWV0aGluZyBiYWQgaGFwcGVuZWQnLCBlcnJvcik7XG4gICAgICAgICAgdGhpcy5zaG93TWVzc2FnZShgU29tZXRoaW5nIGJhZCBoYXBwZW5lZCAke2Vycm9yfWApXG4gICAgICAgIH0pO1xuICB9XG5cbiAgbWFrZUF1dGhvcml6YXRpb25SZXF1ZXN0KCkge1xuICAgIC8vIGNyZWF0ZSBhIHJlcXVlc3RcbiAgICBsZXQgcmVxdWVzdCA9IG5ldyBBdXRob3JpemF0aW9uUmVxdWVzdCh7XG4gICAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxuICAgICAgcmVkaXJlY3RfdXJpOiByZWRpcmVjdFVyaSxcbiAgICAgIHNjb3BlOiBzY29wZSxcbiAgICAgIHJlc3BvbnNlX3R5cGU6IEF1dGhvcml6YXRpb25SZXF1ZXN0LlJFU1BPTlNFX1RZUEVfQ09ERSxcbiAgICAgIHN0YXRlOiB1bmRlZmluZWQsXG4gICAgICBleHRyYXM6IHsncHJvbXB0JzogJ2NvbnNlbnQnLCAnYWNjZXNzX3R5cGUnOiAnb2ZmbGluZSd9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uKSB7XG4gICAgICB0aGlzLmF1dGhvcml6YXRpb25IYW5kbGVyLnBlcmZvcm1BdXRob3JpemF0aW9uUmVxdWVzdCh0aGlzLmNvbmZpZ3VyYXRpb24sIHJlcXVlc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3dNZXNzYWdlKFxuICAgICAgICAgICdGZXRjaCBBdXRob3JpemF0aW9uIFNlcnZpY2UgY29uZmlndXJhdGlvbiwgYmVmb3JlIHlvdSBtYWtlIHRoZSBhdXRob3JpemF0aW9uIHJlcXVlc3QuJyk7XG4gICAgfVxuICB9XG5cbiAgbWFrZVRva2VuUmVxdWVzdCgpIHtcbiAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbikge1xuICAgICAgdGhpcy5zaG93TWVzc2FnZSgnUGxlYXNlIGZldGNoIHNlcnZpY2UgY29uZmlndXJhdGlvbi4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcmVxdWVzdDogVG9rZW5SZXF1ZXN0fG51bGwgPSBudWxsO1xuICAgIGlmICh0aGlzLmNvZGUpIHtcbiAgICAgIGxldCBleHRyYXM6IFN0cmluZ01hcHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAodGhpcy5yZXF1ZXN0ICYmIHRoaXMucmVxdWVzdC5pbnRlcm5hbCkge1xuICAgICAgICBleHRyYXMgPSB7fTtcbiAgICAgICAgZXh0cmFzWydjb2RlX3ZlcmlmaWVyJ10gPSB0aGlzLnJlcXVlc3QuaW50ZXJuYWxbJ2NvZGVfdmVyaWZpZXInXTtcbiAgICAgIH1cbiAgICAgIC8vIHVzZSB0aGUgY29kZSB0byBtYWtlIHRoZSB0b2tlbiByZXF1ZXN0LlxuICAgICAgcmVxdWVzdCA9IG5ldyBUb2tlblJlcXVlc3Qoe1xuICAgICAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxuICAgICAgICByZWRpcmVjdF91cmk6IHJlZGlyZWN0VXJpLFxuICAgICAgICBncmFudF90eXBlOiBHUkFOVF9UWVBFX0FVVEhPUklaQVRJT05fQ09ERSxcbiAgICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgICByZWZyZXNoX3Rva2VuOiB1bmRlZmluZWQsXG4gICAgICAgIGV4dHJhczogZXh0cmFzXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudG9rZW5SZXNwb25zZSkge1xuICAgICAgLy8gdXNlIHRoZSB0b2tlbiByZXNwb25zZSB0byBtYWtlIGEgcmVxdWVzdCBmb3IgYW4gYWNjZXNzIHRva2VuXG4gICAgICByZXF1ZXN0ID0gbmV3IFRva2VuUmVxdWVzdCh7XG4gICAgICAgIGNsaWVudF9pZDogY2xpZW50SWQsXG4gICAgICAgIHJlZGlyZWN0X3VyaTogcmVkaXJlY3RVcmksXG4gICAgICAgIGdyYW50X3R5cGU6IEdSQU5UX1RZUEVfUkVGUkVTSF9UT0tFTixcbiAgICAgICAgY29kZTogdW5kZWZpbmVkLFxuICAgICAgICByZWZyZXNoX3Rva2VuOiB0aGlzLnRva2VuUmVzcG9uc2UucmVmcmVzaFRva2VuLFxuICAgICAgICBleHRyYXM6IHVuZGVmaW5lZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgIHRoaXMudG9rZW5IYW5kbGVyLnBlcmZvcm1Ub2tlblJlcXVlc3QodGhpcy5jb25maWd1cmF0aW9uLCByZXF1ZXN0KVxuICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGxldCBpc0ZpcnN0UmVxdWVzdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMudG9rZW5SZXNwb25zZSkge1xuICAgICAgICAgICAgICAvLyBjb3B5IG92ZXIgbmV3IGZpZWxkc1xuICAgICAgICAgICAgICB0aGlzLnRva2VuUmVzcG9uc2UuYWNjZXNzVG9rZW4gPSByZXNwb25zZS5hY2Nlc3NUb2tlbjtcbiAgICAgICAgICAgICAgdGhpcy50b2tlblJlc3BvbnNlLmlzc3VlZEF0ID0gcmVzcG9uc2UuaXNzdWVkQXQ7XG4gICAgICAgICAgICAgIHRoaXMudG9rZW5SZXNwb25zZS5leHBpcmVzSW4gPSByZXNwb25zZS5leHBpcmVzSW47XG4gICAgICAgICAgICAgIHRoaXMudG9rZW5SZXNwb25zZS50b2tlblR5cGUgPSByZXNwb25zZS50b2tlblR5cGU7XG4gICAgICAgICAgICAgIHRoaXMudG9rZW5SZXNwb25zZS5zY29wZSA9IHJlc3BvbnNlLnNjb3BlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaXNGaXJzdFJlcXVlc3QgPSB0cnVlO1xuICAgICAgICAgICAgICB0aGlzLnRva2VuUmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdW5zZXQgY29kZSwgc28gd2UgY2FuIGRvIHJlZnJlc2ggdG9rZW4gZXhjaGFuZ2VzIHN1YnNlcXVlbnRseVxuICAgICAgICAgICAgdGhpcy5jb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGlzRmlyc3RSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoYE9idGFpbmVkIGEgcmVmcmVzaCB0b2tlbiAke3Jlc3BvbnNlLnJlZnJlc2hUb2tlbn1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoYE9idGFpbmVkIGFuIGFjY2VzcyB0b2tlbiAke3Jlc3BvbnNlLmFjY2Vzc1Rva2VufS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICBsb2coJ1NvbWV0aGluZyBiYWQgaGFwcGVuZWQnLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlKGBTb21ldGhpbmcgYmFkIGhhcHBlbmVkICR7ZXJyb3J9YClcbiAgICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjaGVja0ZvckF1dGhvcml6YXRpb25SZXNwb25zZSgpIHtcbiAgICB0aGlzLmF1dGhvcml6YXRpb25IYW5kbGVyLmNvbXBsZXRlQXV0aG9yaXphdGlvblJlcXVlc3RJZlBvc3NpYmxlKCk7XG4gIH1cbn1cblxuLy8gZXhwb3J0IEFwcFxuKHdpbmRvdyBhcyBhbnkpWydBcHAnXSA9IEFwcDtcbiJdfQ==