# Docker Setup
A dockerized container for the GhanaWeb project. The container deploys the latest successful build of GhanaWeb on a 
Wildfly 8.2.0 web server. It also has the required MySQL as described in the [GhanaWeb](../README.md) guide. 

## Prerequisties
* Docker 1.10.0+
* Docker Compose 1.6.0+
* A file called ghanaweb.properties
* Two configuration files for Keycloak as described in [BalticWeb](https://github.com/maritime-web/BalticWeb#configure-keycloak)

## Property Setup
In your home directory you need to make a new directory - 'ghanaweb/properties'. 
In the 'properties' directory you should put the 'ghanaweb.properties' file.

It is recommended to also put the configuration files for Keycloak in the 'properties' directory. In 
'ghanaweb.properties' you should then override the default configuration with the following:

	enav-service.keycloak.service-client.configuration.url=file:///opt/jboss/wildfly/ghanaweb_properties/<path_to_first_file>/<your_first_file>.json
	enav-service.keycloak.web-client.configuration.url=file:///opt/jboss/wildfly/ghanaweb_properties/<path_to_second_file>/<your_second_file>.json

## Build
To build the GhanaWeb container first build the ghanaweb project to ensure that you have a ghana-web.war file in the 
target directory then:
  
    On Linux     
    $ ./build-ghanaweb.sh
    
    On Windows
    $ ./build-ghanaweb.cmd
    
##Start
Start the ghanaweb container and the two databases by using Docker Compose. 
    
    $ docker-compose -f docker-compose-prod.yml up -d

To stop use

	$ docker-compose -f docker-compose-prod.yml down

## Development environment


TODO
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted