# Ghananautical

Ghananautical is a maritime map-centric portal. The site will aggregate relevant maritime data and information and
    allow access for users and services by utilizing the [Maritime Connectivity Platform](http://maritimeconnectivity.net/).
    
#### Services available for all:

* Notices to Mariners and Navigational Warnings
* Locations of landing sites and tree stumps in Lake Volta
* OpenSeaMap.org overlay

## Purpose

Ghananautical aims to serve the mariner in these ways:

* Assist in planning a sea voyage
* Navigational aid on a sea voyage

## How

Ghananautical uses the [Maritime Connectivity Platform (MCP)](http://maritimeconnectivity.net)
in order to identify and retrieve relevant web services.

Ghananautical is derived from [BalticWeb](https://balticweb.e-navigation.net/) which have been developed as
part of the EU-funded [EfficenSea2](http://efficiensea2.org/) Project.


## Software Architecture

The Ghananautical client is a rich client HTML/JS-application with a server side REST (JSON) API.
The server is a Java EE 7 application.

On the client side we use:

* JavaScript/HTML
* OpenLayers (for maps)
* Twitter Bootstrap (for basic layout)
* AngularJS (for forms and similar)
* Service Worker for caching

On the server side Ghananautical depends on the [Enav-Services](https://github.com/maritime-web/Enav-Services) project. 
Please refer to that project for technical details  

## Prerequisites ##

* Docker 17.12.0-ce+
* Docker-Compose 1.18.0+
* Java JDK 1.8
* Maven 3.3.9+
* Node 8.9.4+
* a file called ghananautical.properties
* keycloak configuration files 


## Server side code
This project mainly contains the web side code executed in the browser client. All server side executed
logic (web, services and data access) is maintained in the [Enav-Services](https://github.com/maritime-web/Enav-Services) Github project.
Most of it is developed as Java code and included in the war-file produced by this project as .jar artifacts.

Only a subset of the services defined in the Enav-Services repository is included in Ghananautical namely
* common
* msi (integration with the Niord NW/NM service)
* service-registry (integration with the MCP service registry)
* user (user related services which may be needed should Ghananautical wish to integrate with services requiring a known user)

## Building ##

    mvn clean install

## Local deployment ##

See the [docker](docker/README.md#development-environment) documentation for how to start up a local Ghananautical instance.

When a local instans is running type 

    mvn -Pfulldeploy clean install
    
to deploy changes    