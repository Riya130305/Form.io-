"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.array.concat.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// All external libs URLs should be injected through this class.
// CDN libs URLs are accessible throuh CDN object properties
// like Formio.cdn.ace === 'http://cdn.form.io/ace/1.4.12'.
// For latest version use empty string
var CDN = /*#__PURE__*/function () {
  function CDN(baseUrl) {
    _classCallCheck(this, CDN);

    this.baseUrl = baseUrl || 'https://cdn.form.io';
    this.libs = {
      'ace': '1.4.12',
      'bootstrap': '4.6.2',
      'ckeditor': '19.0.0',
      'flatpickr': '4.6.8',
      'flatpickr-formio': '4.6.13-formio.1',
      'font-awesome': '4.7.0',
      'grid': '',
      'moment-timezone': '',
      'quill': '1.3.7',
      'shortcut-buttons-flatpickr': '0.4.0',
      'uswds': '2.4.8'
    };
    this.updateUrls();
  }

  _createClass(CDN, [{
    key: "getVersion",
    value: function getVersion(lib) {
      return this.libs[lib];
    }
  }, {
    key: "setBaseUrl",
    value: function setBaseUrl(url) {
      this.baseUrl = url;
      this.updateUrls();
    }
  }, {
    key: "updateUrls",
    value: function updateUrls() {
      for (var lib in this.libs) {
        if (this.libs[lib] === '') {
          this[lib] = "".concat(this.baseUrl, "/").concat(lib);
        } else {
          this[lib] = "".concat(this.baseUrl, "/").concat(lib, "/").concat(this.libs[lib]);
        }
      }
    }
  }]);

  return CDN;
}();

var _default = CDN;
exports.default = _default;