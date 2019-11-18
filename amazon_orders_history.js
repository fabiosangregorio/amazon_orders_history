(function () {
  function setStorageItem(key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function getStorageItem(key) {
    return JSON.parse(storage.getItem(key));
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

  const storage = localStorage;
  const settings = {
    baseUrl: window.location.protocol + "//" + window.location.host + "/gp/your-account/order-history",
    orderSelector: '.order',
    amountSelector: '.order-info .a-span2 .value',
    nextPageSelector: '.a-selected + .a-normal'
  };

  let process = getStorageItem('amz_process');
  const currentYear = Number(getParameterByName('orderFilter').replace('year-', ''));
  const pageHasOrders = !!document.querySelectorAll(settings.orderSelector).length;

  // Start
  if (pageHasOrders && (!process || process.status !== 'running')) {
    // Clear storage
    for (let key of Object.keys(storage)) {
      if (!key.includes('amz_orders_')) continue;
      storage.removeItem(key);
    }
    process = {
      'status': 'running',
      'start_year': currentYear,
      'end_year': null
    };
    setStorageItem('amz_process', process);
  }

  // Stop

  if (!pageHasOrders && process && process.status === 'running') {
    process.status = 'complete';
    setStorageItem('amz_process', process);
  }

  if (!pageHasOrders && process && process.status === 'complete') {
    process.status = 'complete';
    process.end_year = currentYear;
    setStorageItem('amz_process', process);

    const orders = Object.keys(storage)
      .filter(k => k.includes('amz_orders_'))
      .map(k => {
        return {
          year: Number(k.replace('amz_orders_', '')),
          orders: getStorageItem(k)
        };
      });
    
    const totalSum = orders.reduce((total, year) => {
      const yearSum = year.orders
        .filter(o => !o.returned)
        .reduce((yearSum, order) => yearSum + Number(order.amount), 0);
      return total + yearSum;
    }, 0);
    console.log(totalSum);
  }


  if (process.status !== 'running') return;
  // Add page orders to storage
  const storageOrders = getStorageItem(`amz_orders_${currentYear}`) || [];
  for (const node of document.querySelectorAll(settings.orderSelector)) {
    storageOrders.push({
      amount: currToNumber(node.querySelector(settings.amountSelector).innerText),
      returned: !!node.querySelector('[href*="returns"]')
    });
  }
  setStorageItem(`amz_orders_${currentYear}`, storageOrders);

  // Go to next page
  const nextPage = document.querySelector(settings.nextPageSelector);
  if (!!nextPage) location.href = nextPage.children[0].href;
  else location.href = `${settings.baseUrl}?orderFilter=year-${currentYear - 1}`;
})();