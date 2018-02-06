# GhanaWeb

GhanaWeb is a maritime map-centric portal. The site will aggregate relevant maritime data and information and
    allow access for users and services by utilizing the [Maritime Connectivity Platform](http://maritimeconnectivity.net/).
    
#### Services available for all:

* Notices to Mariners and Navigational Warnings
* Locations of landing sites and tree stumps in Lake Volta
* OpenSeaMap.org overlay

## Purpose

GhanaWeb aims to serve the mariner in these ways:

* Assist in planning a sea voyage
* Navigational aid on a sea voyage

## How

GhanaWeb uses the [Maritime Connectivity Platform (MCP)](http://maritimeconnectivity.net)
in order to identify and retrieve relevant web services.

GhanaWeb is derived from [BalticWeb](https://balticweb.e-navigation.net/) which have been developed as
part of the EU-funded [EfficenSea2](http://efficiensea2.org/) Project.


## Software Architecture

The GhanaWeb client is a rich client HTML/JS-application with a server side REST (JSON) API.
The server is a Java EE 7 application.

On the client side we use:

* JavaScript/HTML
* OpenLayers (for maps)
* Twitter Bootstrap (for basic layout)
* AngularJS (for forms and similar)
* Service Worker for caching

On the server side we depend on the [Enav-Services](https://github.com/maritime-web/Enav-Services) project. 
Please refer to that project for technical details  

## Prerequisites ##

* Docker
* Docker-Compose
* Java JDK 1.8
* Maven 3.x
* Wildfly 8.2 (Maven setup to deploy to Wildfly)
* MySQL (Maven configures JBoss datasource to use MySQL)
* a file called ghanaweb.properties 



## Server side code
This project mainly contains the web side code executed in the browser client. All server side executed
logic (web, services and data access) is maintained in the [Enav-Services](https://github.com/maritime-web/Enav-Services) Github project.
Most of it is developed as Java code and included in the war-file produced by this project as .jar artifacts.
