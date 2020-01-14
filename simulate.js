import { runWorkload } from './shared/runworkload.js';

/*
  Take a defined workload and runs x number of simulations.
  Prints statistics of how many times a scenario was invoked.
*/
export function runSimulation (workload, numberOfRuns) {
    let hits = new Map();

    const modifiedStates = workload.states.map(s => Object.assign({ action: () => {
        const numberOfHits = hits.get(s.name) || 0;

        hits.set(s.name, numberOfHits + 1);
    } }, s));

    const modifiedWorkload = Object.assign(workload, { states: modifiedStates });

    for (let i = 0; i < numberOfRuns; i++) {
        runWorkload(modifiedWorkload);
    }

    const totalHits = Array.from(hits.values()).reduce((acc, cur) => acc + cur);

    console.log(`Ran ${numberOfRuns} simulations`);
    console.log('=========================================================================');
    for (let [key, value] of hits) {
        const percentage = (value / totalHits) * 100;
        console.log(`State ${key}, hits: ${value}, percentage: ${Math.floor(percentage)}`);
    }
}
