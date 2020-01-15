# Pensum runner
The Pensum runner scripts allow you to execute state-machine based load-tests using [K6](https://k6.io/).

## Prerequisites
- [K6](https://k6.io/) v0.26.0

## Usage
As K6 has limited possibilities for re-using Javascript libraries (see [docs](https://docs.k6.io/docs/modules)).
To use the runner in a load-test the easiest is to copy its files into your project.

For example download a Github release [here](https://github.com/avivasolutionsnl/Pensum-runner/releases) and copy the files into a sub-directory named `pensum-runner`.

Or use `degit` to scaffold pensum-runner into your project:
```
PS> npx degit https://github.com/avivasolutionsnl/Pensum-runner pensum-runner
```
