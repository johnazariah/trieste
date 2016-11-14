# trieste
"Deep Learning" on Azure Batch

## Getting Started
### TL;DR

#### For the CLI
1. Install [Git](https://git-scm.com/). Recommending 2.x. 
1. Install [Python](https://www.python.org/downloads/). Recommending 3.5.2 but at least 2.7 is required
1. `git clone --recursive https://github.com/johnazariah/trieste.git` will bring down `batch-shipyard` as well
1. `cd trieste`
1. `pip install -r requirements.txt`
1. `python trieste.py --help` should print out the usage instructions and quit.

#### For the Electron Shell
1. Install [Node](https://nodejs.org/en/). Recommending v7.0.0; v7.1.0 appears to have some issues and is not recommended.
1. `cd shell`
1. `npm install`
1. `npm install -g typescript` (not tsc)
1. `npm install -g electron`
1. `tsc`
1. `electron .`
