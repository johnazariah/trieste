## Getting Set Up

* Install [NodeJS](https://nodejs.org/en/)
    * Accept all defaults in the installation


<!---
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
--->
    
* Use the [Electron API Demos](https://electron-api-demos.githubapp.com/updates/ElectronAPIDemosSetup.exe) app as a reference

* Follow [Electron + Angular 2](https://www.gitbook.com/book/santhoshlive/getting-started-with-electron-angular2-from-scrat/details)

    ```
    $ npm init
    
    $ mkdir app
    $ touch electron-index.js
    $ touch electron-index.html

    # install electron globally
    $ npm install electron -g
    $ npm install electron --save-dev
    
    # put in content from [Quick Start](https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md)
    $ cd app
    $ vi electron-index.js # ensure that it points to electron-index.html
    $ vi electron-index.html

    # check that electron runs
    $ electron .

    # hooray!
    ```

* Install [Angular (TS)](https://angular.io/docs/ts/latest/quickstart.html)

    ```
    # modify package.json
    $ vi package.json

    $ npm install

    # test out Angular install
    $ vi app/app.component.ts
    $ vi app/app.module.ts
    $ vi app/main.ts
    $ vi index.html # this is the test for angular
    $ vi styles.css
    $ vi systemjs.config.js
    $ vi tsconfig.json
    $ npm start

    # hooray! (lite-server fires up and serves index.html to a browser window)

    # point the electron-index.js to the angular index.html
    $ vi app/electron-index.js
    $ npm install -g tsc
    $ tsc app # compile changes to .ts files
    $ electron .

    # hooray! (electron app also shows the changed typescript content)


    