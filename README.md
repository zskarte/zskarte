# Zivilschutz-Karte

![Tests](https://github.com/zskarte/zskarte/actions/workflows/test.yml/badge.svg)
[![GitHub issues](https://img.shields.io/github/issues/zskarte/zskarte)](https://github.com/zskarte/zskarte/issues) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Zivilschutz-Karte is a javascript application (based on Angular) which allows to draw situation maps for disaster management. It has been developed for Swiss civil defense organisations. The drawing application can be used either with standard computers or with interactive whiteboards and is ready to be executed - e.g. in case of interrupted connections - in offline mode (with prepared offline maps and a restricted set of functionalities) as well as in online mode with the full capacities of modern map features. 

## Installation

Zivilschutz-Karte is optimized and tested for use with Google Chrome - nevertheless other browsers might work as well and are supported in a best effort manner.

If you don't have a Google Chrome installation and do not have the permissions to install software, please see http://portableapps.com/apps/internet/google_chrome_portable


### Run (in online mode)
You can run Zivilschutz-Karte without installation from https://zskarte.ch. Please note: Your drawings are stored on your browser - so you can't break anything, but also don't expect your drawings to be available when accessing it with another computer / browser. :)
To transfer your drawings, make use of the download and import functionality of the application.

### Run from local (in online mode)
Download the latest release from the projects' [release section](https://github.com/zskarte/zskarte/releases) and unzip the folder to any place you like. Open the index.html in your browser.

### Run from local (in offline mode)
To run the application in offline mode, a little preparation (with internet connection) is needed, since you need the according maps to be locally available on your machine. We suggest, you follow the instructions of https://openmaptiles.com/server/#install for your operating system. 
 
Follow the installation wizard at http://localhost:8080 

#### Region
Choose the region you're interested in. The smaller the region, the less requirements on the executing machine.
 
#### Style 
You only need the "OSM Bright" style, so you can disable the others. Please also choose the language of labels to your preferences. 

#### Settings
You only need the "Serve raster map tiles" option.  

#### Run
Save the server and execute it. You'll need now to download the map data - please make sure you choose the appropriate licensing option. As soon, as everything is up and running, you should be able to follow the "Run from local (in online mode)" section and choose the "Offline" map (please be aware: the application expects the map server to be running at http://localhost:8080 - which is the default setting).

## Terms of use

Please note, that this application integrates several different map provider services. Since the terms of use of the different services usually restrict the extent of use (limited quotas, restricted access to data layers), it's the liability of the user to make sure that the corresponding limitations and/or preconditions are fulfilled.

## For developers

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.3.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
