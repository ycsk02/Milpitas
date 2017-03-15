'use strict';

/**
 * holds utility services.
 */
angular.module('isoCurrency.common', []).factory('iso4217', function () {

	var currencies = {
    'EUR': {
    	text: 'Euro',
    	fraction: 2,
    	symbol: '\u20AC'
    },
    'CHF': {
    	text: 'Swiss Franc',
    	fraction: 2,
    	symbol: 'CHF'
    },
    'GBP': {
    	text: 'Pound Sterling',
    	fraction: 2,
    	symbol: '\u00A3'
    },
    'USD': {
    	text: 'US Dollar',
    	fraction: 2,
    	symbol: '$'
    },
    'AUD': {
    	text: 'Australian Dollar',
    	fraction: 2,
    	symbol: '$'
    }
	};

	return {

		/**
   * retrieves the object holding currency, code and fraction information about a currency.
   *
   * @param string code
   * @return object
   */
		getCurrencyByCode: function getCurrencyByCode(code) {
			if (!code || typeof code !== 'string') {
				return;
			}

			return currencies[code.toUpperCase()];
		},

		/**
   * retrives all available currenies.
   *
   * @return object
   */
		getCurrencies: function getCurrencies() {
			return currencies;
		}
	};
});
'use strict';

/**
 * wraps angular's currency filter with an additional layer, in case the currency symbol is not available.
 */
angular.module('isoCurrency', ['isoCurrency.common']).filter('isoCurrency', ["$filter", "iso4217", function ($filter, iso4217) {

	/**
  * transforms an amount into the right format and currency according to a passed currency code (3 chars).
  *
  * @param float amount
  * @param string currencyCode e.g. EUR, USD
  * @param number fraction User specified fraction size that overwrites default value
  * @return string
  */
	return function (amount, currencyCode, fraction) {
		var currency = iso4217.getCurrencyByCode(currencyCode);

		if (!currency) {
			return amount;
		}

		var fractionSize = fraction === void 0 ? currency.fraction : fraction;
		return $filter('currency')(amount, currency.symbol || currencyCode + ' ', fractionSize);
	};
}]);
