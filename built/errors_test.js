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
var errors_1 = require("./errors");
describe('Errors Tests', function () {
    var message = 'Something bad happened';
    it('Initialization of an error message should work.', function () {
        var error = new errors_1.CorePassError(message);
        expect(error).toBeTruthy();
        expect(error.message).toBe(message);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzX3Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXJyb3JzX3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7R0FZRzs7QUFFSCxtQ0FBdUM7QUFFdkMsUUFBUSxDQUFDLGNBQWMsRUFBRTtJQUN2QixJQUFNLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQztJQUV6QyxFQUFFLENBQUMsaURBQWlELEVBQUU7UUFDcEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxzQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHRcbiAqIGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGVcbiAqIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Q29yZVBhc3NFcnJvcn0gZnJvbSAnLi9lcnJvcnMnO1xuXG5kZXNjcmliZSgnRXJyb3JzIFRlc3RzJywgKCkgPT4ge1xuICBjb25zdCBtZXNzYWdlID0gJ1NvbWV0aGluZyBiYWQgaGFwcGVuZWQnO1xuXG4gIGl0KCdJbml0aWFsaXphdGlvbiBvZiBhbiBlcnJvciBtZXNzYWdlIHNob3VsZCB3b3JrLicsICgpID0+IHtcbiAgICBsZXQgZXJyb3IgPSBuZXcgQ29yZVBhc3NFcnJvcihtZXNzYWdlKTtcbiAgICBleHBlY3QoZXJyb3IpLnRvQmVUcnV0aHkoKTtcbiAgICBleHBlY3QoZXJyb3IubWVzc2FnZSkudG9CZShtZXNzYWdlKTtcbiAgfSk7XG59KTtcbiJdfQ==