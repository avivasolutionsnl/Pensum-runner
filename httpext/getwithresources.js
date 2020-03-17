import http from 'k6/http';
import { failCheck, checkAll } from '../shared/k6-ext.js';
import { parseHTML } from 'k6/html';

function mapRequests (urls, rootUrl, includeExternalLinks) {
    return urls
        .map(url => makeAbsolute(url, rootUrl))
        .filter(url => shouldInclude(url, rootUrl, includeExternalLinks))
        .map(url => ({
            'method': 'get',
            'url': url
        }));
}

function makeAbsolute (url, rootUrl) {
    const absolute = url.split(',')[0];

    if (absolute === '' || absolute.startsWith('http://') || absolute.startsWith('https://')) {
        return absolute;
    }

    if (absolute.startsWith('//')) {
        return 'http:' + absolute;
    }

    return rootUrl + absolute;
}

function shouldInclude (url, rootUrl, includeExternalLinks) {
    return url !== '' && (includeExternalLinks || url.startsWith(rootUrl));
}

export default function (rootUrl, url, includeExternalLinks = false) {
    return group('PageWithResources', function () {
        const res = http.get(url);
        failCheck(res, {
            'is status 200': (r) => r.status === 200
        });

        const doc = parseHTML(res.body);

        const scripts = doc.find('script');
        const scriptsUrls = scripts
            .map((i, e) => e.attr('src'))
            .filter((e) => e !== 'undefined');
        const scriptsReqs = mapRequests(scriptsUrls, rootUrl, includeExternalLinks);

        const links = doc.find('link');
        const linkUrls = links
            .filter((i, e) => !(e.attr('rel').includes('canonical') || e.attr('rel').includes('next')))
            .map((i, e) => e.attr('href'));
        const linkReqs = mapRequests(linkUrls, rootUrl, includeExternalLinks);

        // Todo: support srcset
        // Images are disabled because we do not want to test requests that our clients are handling through CDN
        // const images = doc.find('img');
        // const imageUrls = images.map((i, e) => e.attr('src'));
        // const imageReqs = mapRequests(imageUrls, rootUrl, includeExternalLinks);

        group('Resources', function() {
            const results = http.batch([...scriptsReqs, ...linkReqs]);

            checkAll(results, {
                'resource is status 200': (r) => r.status === 200
            });
        });

        return res;
    });
}
