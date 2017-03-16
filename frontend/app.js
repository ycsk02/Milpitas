var myApp = angular.module("myApp", ["ngRoute", "ngResource", "isoCurrency", "angularUtils.directives.dirPagination", "myApp.services"]);

var services = angular.module("myApp.services", ["ngResource"])
services
.factory('Product', function($resource) {
    return $resource('http://192.168.1.198:5000/api/v1/products/:id', {id: '@id'}, {
        get: { method: 'GET' },
        delete: { method: 'DELETE' }
    });
})
.factory('Products', function($resource) {
    return $resource('http://192.168.1.198:5000/api/v1/products', {p: '@p'}, {
        query: { method: 'GET', isArray: false },
        create: { method: 'POST', }
    });
})
.factory('Styles', function($resource) {
    return $resource('http://192.168.1.198:5000/api/v1/styles/:id', {id: '@id'}, {
        get: { method: 'GET' }
    });
})
.factory('Style', function($resource) {
    return $resource('http://192.168.1.198:5000/api/v1/styles', {}, {
        query: { method: 'GET', isArray: true}
    });
})
.factory('Search', function($resource) {
    return $resource('http://192.168.1.198:5000/api/v1/search', {q: '@q',p: '@p'}, {
        query: { method: 'GET', isArray: false}
    });
});

myApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'pages/main.html',
        controller: 'mainController'
    })
    .when('/newBeer', {
        templateUrl: 'pages/beer_new.html',
        controller: 'newBeerController'
    })
    .when('/products', {
        templateUrl: 'pages/products.html',
        controller: 'productListController'
    })
    .when('/products/:id', {
        templateUrl: 'pages/product_details.html',
        controller: 'productDetailsController'
    })
});

myApp.filter('filterStyles', function() {
  return function(input) {
    var output = new Array();
    for (i=0; i<input.length; i++) {
        if (input[i].checked == true) {
            output.push(input[i].name);
        }
    }
    return output;
  }
});

myApp.controller(
    'mainController',
    function ($scope, Search) {
        $scope.search = function(pageNumber) {
            q = $scope.searchString;
            if (q.length > 1) {
                $scope.results = Search.query({q: q,p:pageNumber});
            }
        };
        $scope.setOrderProperty = function(keyname) {
                if ($scope.orderProperty === keyname) {
                    $scope.orderProperty = '-' + keyname;
                } else if ($scope.orderProperty === '-' + keyname) {
                    $scope.orderProperty = keyname;
                } else {
                    $scope.orderProperty = keyname;
                }
        };
    }
);

myApp.controller(
    'newBeerController',
    function ($scope, Styles, Beers, $location, $timeout, $filter) {
        $scope.styles = Styles.query();
        $scope.insertBeer = function () {
            $scope.beer.styles = $filter('filterStyles')($scope.styles);
            Beers.create($scope.beer);
            $timeout(function (){
                $location.path('/beers').search({'created': $scope.beer.name});
            }, 500);
        };
        $scope.cancel = function() {
            $location.path('/beers');
        };
    }

);

myApp.controller(
    'productListController',
    function ($scope, Products, Product, $location, $timeout) {
        if ($location.search().hasOwnProperty('created')) {
            $scope.created = $location.search()['created'];
        }
        if ($location.search().hasOwnProperty('deleted')) {
            $scope.deleted = $location.search()['deleted'];
        }
        $scope.deleteBeer = function(beer_id) {
            var deleted = Product.delete({id: beer_id});
            $timeout(function(){
                $location.path('/products').search({'deleted': 1})
            }, 500);
            //$scope.beers = Beers.query();
        };
        $scope.setOrderProperty = function(keyname) {
                if ($scope.orderProperty === keyname) {
                    $scope.orderProperty = '-' + keyname;
                } else if ($scope.orderProperty === '-' + keyname) {
                    $scope.orderProperty = keyname;
                } else {
                    $scope.orderProperty = keyname;
                }
        };
        $scope.queryProducts = function(pageNumber) {
            if (pageNumber > 0) {
                $scope.products = Products.query({p:pageNumber});
            } else {
                $scope.products = Products.query({p:1});
            }
        };
        $scope.products = Products.query({p:1});
    }
);

myApp.controller(
    'productDetailsController', ['$scope', 'Product', '$routeParams',
    function ($scope, Product, $routeParams) {
        $scope.product = Product.get({id: $routeParams.id});
    }
]);
