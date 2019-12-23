# Amazon Orders History
Crawls your Amazon orders history webpages in order to compute the total amount
of your orders. The sum is shown in the Chrome Developers Tools console.

![Chrome Dev Tools](https://i.imgur.com/Q3aDC87.png)

## Prerequisites
You need [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) to run this script.

## Usage
1. Create a new Tampermonkey script, paste the content of `amazon_orders_history.js` in the editor, save.
1. Go to your Amazon orders page. 
1. From the "last 6 months" orders selection, select this year.
1. The script will start crawling all the orders web pages, this will take a moment.
1. Open the Chrome Developer Tools. You will see the total amount in the "Console" tab.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
