import { randomSeed } from 'k6';
import http from 'k6/http';
import runWorkload from './shared/runworkload.js';
import think from './shared/think.js';
import getWithResources from './httpext/getwithresources.js';
import { group, checkAll } from './shared/k6-ext.js';

export let options = {
    vus: 1,
    iterations: 8
};

const hostName = 'http://demo.mercury-ecommerce.com/';

export default function () {
    // Seed so that multiple runs use the same probability (and thus path)
    randomSeed(__VU * 1000 + __ITER); // Unique seed per virtual user and iteration

    // Create a workload that can be executed by the Pensum runner
    runWorkload({
        initial: 'home',
        abandon: 'abandon',
        states: [
        // Home
        {
            name: 'home',
            targets: [{
                target: 'lister',
                probability: 75
            },
            {
                target: 'abandon',
                probability: 25
            }],
            action: (thinkTime) => visitHomePage(thinkTime)
        }, 
        // Lister
        {
            name: 'lister',
            targets: [{
                target: 'home',
                probability: 15
            },
            {
                target: 'abandon',
                probability: 85
            }],
            // For example only: always visit the prepare/bar product lister page. 
            // In a real setup the lister pages should be dynamically selected, e.g. based on the sitemap and a random distribution
            action: (thinkTime) => visitListerPage(thinkTime, 'prepare/bar')
        },
        // Abandon, ie. leave website
        {
            name: 'abandon',
            targets: [],
            action: () => {}
        }]
    });
}

function visitHomePage (thinkTime) {
    group('Home', function () {
        // Load the webpage including all resources defined in <script> and <link> HTML tags
        getWithResources(hostName, hostName);

        // Additionally perform important async JS calls, e.g. get cart
        let req = [{
            'method': 'get',
            'url': `${hostName}/mercury/checkout/cart`
        }];

        const res = http.batch(req);

        checkAll(res, {
            'is status 200': (x) => x.status === 200
        });
    });

    // Simulate user think time, ie. wait some time before continuing
    think(thinkTime.avg, thinkTime.std, thinkTime.min, thinkTime.max);
}

function visitListerPage (thinkTime, categoryUrl) {
    group('Lister', function () {
        getWithResources(hostName, `${hostName}/${categoryUrl}`);
        
        // Additionally perform important async JS calls, e.g. get cart & product comparison
        let req = [{
            'method': 'get',
            'url': `${hostName}/mercury/checkout/cart`
        },
        {
            'method': 'get',
            'url': `${hostName}/mercury/productcomparison`
        }];

        const res = http.batch(req);

        checkAll(res, {
            'is status 200': (x) => x.status === 200
        });
    });

    // Simulate user think time, ie. wait some time before continuing
    think(thinkTime.avg, thinkTime.std, thinkTime.min, thinkTime.max);
}