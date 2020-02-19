import { Machine } from '../vendor/xstate.js';
import convertProbabilitiesToRange from './convertProbabilitiesToRange.js';
import runRandom from './runrandom.js';

function createConditionalTargets (targets) {
    const ranges = convertProbabilitiesToRange(targets.map(t => ({ prob: t.probability, data: t.target })));

    return ranges.map(t => ({
        target: t.data,
        cond: ({ rand }) => rand < t.range
    }));
}

function createStates (workload) {
    return workload.states.reduce((prev, s) => {
        const targets = createConditionalTargets(s.targets);

        prev[s.name] = {
            on: {
                NAVIGATE: targets
            }
        };

        return prev;
    }, {});
}

function createStateMachine (workload) {
    const states = createStates(workload);

    return Machine({
        initial: workload.initial,
        states: states
    });
}

function runWorkload (workload) {
    const toggleMachine = createStateMachine(workload);

    var current = toggleMachine.initialState;

    while (current.value !== workload.abandon) {
        const state = workload.states.find(s => s.name === current.value);
        state.action();

        // Optionally perform an event
        if (state.events) {
            const event = runRandom(state.events);
            if (event) {
                event.action();
            }
        }

        current = toggleMachine.transition(current, 'NAVIGATE', { rand: Math.random() * 100 });
    }
}

export default runWorkload;
