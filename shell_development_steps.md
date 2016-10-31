## Getting Set Up

* Install [NodeJS](https://nodejs.org/en/)
    * Accept all defaults in the installation

* Install Electron Quick Start
    ```
    # Clone the Quick Start repository
    $ git clone https://github.com/electron/electron-quick-start

    # Go into the repository
    $ cd electron-quick-start

    # Install the dependencies and run
    $ npm install && npm start
    ```

* Once running, integrate it into the trieste repository
    ```
    # Detach the code from the electron-quick-start repository
    $ rm -rf .git

    # This is now part of the trieste repository
    $ cd ..
    $ git add shell
    $ git commit -m "Add Electron Quick Start Shell"
    ```
    
* Use the [Electron API Demos](https://electron-api-demos.githubapp.com/updates/ElectronAPIDemosSetup.exe) app as a reference

