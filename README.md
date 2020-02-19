# Pensum runner
The Pensum runner scripts allow you to execute state-machine based load-tests using [K6](https://k6.io/).
This repository only contains files that you need for using the runner in your project. Examples are located in the [Pensum](https://github.com/avivasolutionsnl/Pensum) overlay repository.

## Prerequisites
- [K6](https://k6.io/) v0.26.0

## Install
As K6 has limited possibilities for re-using Javascript libraries (see [docs](https://docs.k6.io/docs/modules)).
To use the runner in a load-test the easiest is to copy its files into your project.

For example download a Github release [here](https://github.com/avivasolutionsnl/Pensum-runner/releases) and copy the files into a sub-directory named `pensum-runner`.

Or use `degit` to scaffold pensum-runner into your project:
```
PS> npx degit https://github.com/avivasolutionsnl/Pensum-runner pensum-runner
```

## Usage
The most important API entrypoint is `runWorkload`, this method allows you to run a workload.

A workload is basically a state machine which models the behavior of a website visitor.
It starts at the `initial` state and terminates at the `abandon` state. When a state is entered it performs the defined `action` and (if any defined) an `event` from the given `events`. It transitions to the next state by inspecting the `targets`. It decides on what `target` and `event` to choose based on the given probabilities.

For example:
```
import runWorkload from 'shared/runworkload.js'

export default function myLoadTest {
   runWorkload({
        initial: '/',
        abandon: 'abandon',
        states: [{
            name: 'home',
            targets: [
                {
                    target: 'home',
                    probability: 50
                },
                {
                    target: 'abandon',
                    probability: 50
                }
            ],
            events: [
                {
                    name: 'transaction',
                    occurences: 1,
                    probability: 100
                    action: () => performTransaction()
                }
            ],
            action: () => visitHomePage()
        },
        {
            name: 'abandon',
            targets: [],
            action: () => {}
        }]
   })
}
```
Note that you will have to implement the actions (e.g. `visitHomePage` and `performTransaction`) in the workload model yourself.
