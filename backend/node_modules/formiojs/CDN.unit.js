"use strict";

require("core-js/modules/es.array.concat.js");

var _CDN = _interopRequireDefault(require("./CDN"));

var _powerAssert = _interopRequireDefault(require("power-assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Formio.js CDN class Tests', function () {
  it('Should give correct cdn URLs', function () {
    var cdn = new _CDN.default('https://cdn.form.io');

    for (var lib in cdn.libs) {
      var expectedUrl = "".concat(cdn.baseUrl, "/").concat(lib, "/").concat(cdn.libs[lib]);

      if (cdn.libs[lib] === '') {
        expectedUrl = "".concat(cdn.baseUrl, "/").concat(lib);
      }

      _powerAssert.default.equal(cdn[lib], expectedUrl);
    }
  });
});