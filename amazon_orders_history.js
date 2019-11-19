// ==UserScript==
// @name         Amazon Order History
// @namespace    https://fabio.sangregorio.dev
// @version      0.1
// @description  Surprise yourself by discovering how much you spent on all of your Amazon orders.
// @author       Fabio Sangregorio
// @include      https://www.amazon.*/gp/your-account/order-history*
// @grant        none
// ==/UserScript==

(function() {
  const storage = localStorage;
  const settings = {
    baseUrl: window.location.protocol + "//" + window.location.host + "/gp/your-account/order-history",
    orderSelector: '.order',
    amountSelector: '.order-info .a-span2 .value',
    nextPageSelector: '.a-selected + .a-normal'
  };

  let state = getStorageItem('amz_orders_history') || {
    process: {},
    years: {}
  };
  const currentYear = Number(getParameterByName('orderFilter').replace('year-', ''));
  const pageHasOrders = !!document.querySelectorAll(settings.orderSelector).length;

  run();

  function run() {
    // Start
    if (pageHasOrders && state.process.status !== 'running') {
      state = {
        process: {
          status: 'running',
          startYear: currentYear,
          endYear: null,
          currency: document.querySelector(settings.amountSelector).innerText.split(' ')[0]
        },
        years: {}
      };
    }

    // Stop
    if (!pageHasOrders && state.process.status === 'running') {
      state.process.status = 'complete';
      saveState(state);
    }

    if (!pageHasOrders && state.process.status === 'complete')
      showStats();

    checkPage();
  }

  function checkPage() {
    if (state.process.status !== 'running') return;

    // Add page orders to storage
    const orders = state.years[currentYear] || [];
    for (const node of document.querySelectorAll(settings.orderSelector)) {
      orders.push({
        amount: currToNumber(node.querySelector(settings.amountSelector).innerText),
        returned: !!node.querySelector('[href*="returns"]')
      });
    }
    state.years[currentYear] = orders;
    saveState(state);

    // Go to next page
    const nextPage = document.querySelector(settings.nextPageSelector);
    if (!!nextPage) location.href = nextPage.children[0].href;
    else location.href = `${settings.baseUrl}?orderFilter=year-${currentYear - 1}`;
  }

  function showStats() {
    state.process.status = 'complete';
    state.process.endYear = currentYear;
    saveState(state);

    let ordersSum = 0;
    let returnedSum = 0;
    for (let year of Object.values(state.years)) {
      ordersSum += year.filter(o => !o.returned).reduce((t, o) => t + o.amount, 0);
      returnedSum += year.filter(o => o.returned).reduce((t, o) => t + o.amount, 0);
    }

    const currency = state.process.currency;
    console.log(`
      You spent ${currency} ${ordersSum.toFixed(2)} in
      ${state.process.startYear - state.process.endYear} years, and returned
      ${currency} ${returnedSum.toFixed(2)} worth of items.
    `.replace(/\s+/gm, ' '));
  }


  // UTILS FUNCTIONS
  function setStorageItem(key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function getStorageItem(key) {
    return JSON.parse(storage.getItem(key));
  }

  function saveState(state) {
    setStorageItem('amz_orders_history', state);
  }

  function currToNumber(curr) {
    return Number(curr
      .replace('EUR ', '')
      .replace('USD ', '')
      .replace('.', '')
      .replace(',', '.'));
  }

  /**
   * Gets the value of a query parameter from the url
   * @param {String} name name of the parameter to get
   * @param {String} url full url from which to get the parameter
   */
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
})();
