/*
* Based on: https://www.alanzucconi.com/2015/09/16/how-to-sample-from-a-gaussian-distribution/
*/
function nextGaussian () {
    let x1, x2, rad;
    do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        rad = x1 * x1 + x2 * x2;
    } while (rad >= 1 || rad === 0);

    const c = Math.sqrt(-2 * Math.log(rad) / rad);

    return (x1 * c);
};

function nextGaussianWithMean (mean, standardDeviation) {
    return standardDeviation * nextGaussian() + mean;
}

function nextGaussianFromArray (array, standardDeviation) {
    const mean = array.length / 2;
    const min = 0;
    const max = array.length - 1;

    const index = nextGaussianWithMeanAndMinMax(mean, standardDeviation, min, max);

    return array[Math.floor(index)];
}

export { nextGaussian, nextGaussianWithMean, nextGaussianFromArray };

function nextGaussianWithMeanAndMinMax (mean, standardDeviation, min, max) {
    let number;
    do {
        number = nextGaussianWithMean(mean, standardDeviation);
    } while (number < min || number > max);
    return number;
}

export default nextGaussianWithMeanAndMinMax;
