import convertProbabilitiesToRange from './convertProbabilitiesToRange.js';

export default function (options) {
    const range = convertProbabilitiesToRange(options.map(option => ({ prob: option.probability, data: option })));
    const randomNumber = Math.random() * 100;

    for (let option of range) {
        if (randomNumber < option.range) {
            return option.data;
        }
    }
}
