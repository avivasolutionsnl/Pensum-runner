import { sleep } from 'k6';
import nextGaussianWithMeanAndMinMax from './gaussian.js';

/**
 * Simulates a user thinking based on a random time within a gaussian distribution.
 * @param mean - The average think time in seconds (For example: 3)
 * @param standardDeviation - The standard deviation in seconds (For example: 1)
 * @param min - The miniumum think time in seconds
 * @param max - The maximum think time in seconds
 *
 * Based on: https://www.alanzucconi.com/2015/09/16/how-to-sample-from-a-gaussian-distribution/
 */
export default function (mean, standardDeviation, min, max) {
    const thinkTime = nextGaussianWithMeanAndMinMax(mean, standardDeviation, min, max);

    sleep(thinkTime);
}
