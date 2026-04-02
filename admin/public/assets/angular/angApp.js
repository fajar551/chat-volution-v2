var real_url = window.location.pathname;
var url_arr = real_url.split("/");
var urls = window.location.origin + '/';


var mainApp = angular.module('Qchat', ['ngSanitize'])
    .service('httpHandler', ['$http', '$q', '$injector', function ($http, $q, $injector) {

        var tk = localStorage.getItem('tk')
        var settings = {
            "headers": {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Authorization": "Bearer " + tk
            },
        };
        this.send = function (opt, loading) {

            var canceler = $q.defer();
            var appHelper = $injector.get('appHelper');

            // Set options
            var options = {
                headers: settings.headers,
                method: 'GET',
                data: {},
                params: {},
                timeout: canceler.promise,
            };

            $.extend(options, opt);
            var request = $http(options);

            request.then(
                function successCallbacks(response) {

                },
                function errorCallback(response, statusText) {});

            return request;
        }

    }])

    .config(function ($interpolateProvider) {
        // To prevent the conflict of `{{` and `}}` symbols
        // between Blade template engine and AngularJS templating we need
        // to use different symbols for AngularJS.
        $interpolateProvider.startSymbol('<%=');
        $interpolateProvider.endSymbol('%>');
    })
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
    }])
    .service('appHelper', ['httpHandler', function (httpHandler) {

        this.showMessage = function (e, msg) {

            if (e == 'success') {
                err = '<h1><i class="fa fa-check text-success"></i></h1>';
            } else if (e == 'error') {
                err = '<h1><i class="fa fa-exclamation-triangle text-danger"></i></h1>';
            } else {
                err = e;
            }

            $('#popup-msg').find('.modal-body').html(err + '<p>' + msg + '</p>');
            $('#popup-msg').modal('show');
        }

    }])

    .filter('dateToISO', function () {
        return function (date) {
            const parsed = Date.parse(date);
            if (!isNaN(parsed)) {
                return parsed;
            }

            if (date != undefined)
                return Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' '));
        };
    })

    .filter('toHtml', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }])

    .filter('dateMDY', ['$sce', function ($sce) {
        return function (text) {
            if (!text)
                return text;
            else {
                var temp = text.split(' ');
                return temp[0];
            }
        }
    }])

    .filter('deCode', ['$sce', function ($sce) {
        return function (text, lang) {
            var txt;

            if (typeof atob(text) == 'object') {
                txt = text[lang];
            } else if (IsJsonString(atob(text))) {
                txt = JSON.parse(atob(text))[lang];
            } else
                txt = atob(text);


            return txt;
        };
    }])

    .filter('capitalize', function () {
        return function (input) {
            return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
        }
    })

    .filter('toNpwp', function () {
        return function (input) {
            let split = 6;
            const dots = [];
            lengthMy = !input ? 0 : input.length;
            for (let i = 0, len = lengthMy; i < len; i += split) {
                split = i >= 2 && i <= 6 ? 3 : i >= 8 && i <= 12 ? 4 : 2;
                dots.push(input.substr(i, split));
            }
            const temp = dots.join('.');
            return input = temp.length > 12 ? `${temp.substr(0, 12)}-${temp.substr(12, 7)}` : temp;
        }
    })

    .filter('setJson', ['$sce', function ($sce) {
        return function (text, lang) {
            var txt;

            if (typeof text == 'object') {
                txt = text[lang];
            } else if (IsJsonString(text)) {
                txt = JSON.parse(text)[lang];
            } else
                txt = text;

            return txt;
        };
    }])

    .filter('strLimit', ['$filter', function ($filter) {
        return function (text, limit, lang) {
            if (!text) return;

            var txt;
            var text = atob(text);

            if (typeof text == 'object') {
                txt = text[lang];
            } else if (IsJsonString(text)) {
                txt = JSON.parse(text)[lang];
            } else {
                txt = text;
            }

            if (txt.length <= limit) {
                return txt;
            }

            return $filter('limitTo')(txt, limit) + '...';
        };
    }])

    .filter('toJson', function () {
        return function (jsonStr, column) {
            return JSON.parse(jsonStr)[column];
        };
    })

    .directive('format', ['$filter', function ($filter) {
        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                if (!ctrl) return;


                ctrl.$formatters.unshift(function (a) {
                    return $filter(attrs.format)(ctrl.$modelValue)
                });


                ctrl.$parsers.unshift(function (viewValue) {
                    var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                    elem.val($filter(attrs.format)(plainNumber));
                    return plainNumber;
                });
            }
        };
    }])

    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        }
    })

    .filter("loopEvery", [function () {
        return function (mainArray, loop) {
            var subArray = [],
                formattedArray = [];
            angular.forEach(mainArray, function (item, index) {
                subArray.push(item);
                if ((subArray.length == loop) || (index == mainArray.length - 1)) {
                    formattedArray.push(subArray);
                    subArray = [];
                }
            });

            return formattedArray;
        }
    }])

    .directive('metis', function ($timeout) {
        return function ($scope, $element, $attrs) {
            if ($scope.$last == true) {
                $timeout(function () {
                    $('#side-menu').metisMenu();
                }, 250)
            }
        };
    });
