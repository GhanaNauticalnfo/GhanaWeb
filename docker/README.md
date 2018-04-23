# Docker Setup
A dockerized container for the Ghananautical project. The container deploys the latest successful build of Ghananautical on a 
Wildfly 8.2.0 web server. It also has the required MySQL as described in the [Ghananautical](../README.md) guide. 

## Prerequisties
* Docker 1.10.0+
* Docker Compose 1.6.0+
* A file called ghananautical.properties
* Two configuration files for Keycloak as described in [BalticWeb](https://github.com/maritime-web/BalticWeb#configure-keycloak)

## Property Setup
In your home directory you need to make a new directory - 'ghananautical/properties'. 
In the 'properties' directory you should put the 'ghananautical.properties' file.

It is recommended to also put the configuration files for Keycloak in the 'properties' directory. In 
'ghananautical.properties' you should then override the default configuration with the following:

	enav-service.keycloak.service-client.configuration.url=file:///opt/jboss/wildfly/ghanaweb_properties/<path_to_first_file>/<your_first_file>.json
	enav-service.keycloak.web-client.configuration.url=file:///opt/jboss/wildfly/ghanaweb_properties/<path_to_second_file>/<your_second_file>.json

## Build
To build the Ghananautical container first build the ghanaweb project to ensure that you have a ghana-web.war file in the 
target directory then:
  
    On Linux     
    $ ./build-ghananautical.sh
    
    On Windows
    $ ./build-ghananautical.cmd
    
##Push
Push a new version to dockerhub by running
    
    Windows
    .\push-ghananautical.cmd
    
    Linux
    ./build-ghananautical.sh push

##Start
Start the ghananautical container and the two databases by using Docker Compose. 
    
    $ docker-compose -f docker-compose-prod.yml up -d

To stop use

	$ docker-compose -f docker-compose-prod.yml down

## Development environment
Use the start-dev-ghananautical script to start a ghananautical instance without any application deployed

    Windows (remember to enable script by running Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted)
    ./start-dev-ghananautical.ps1
    
    Linux
    docker-compose -f docker-compose-dev.yml up -d
    docker-compose -f docker-compose-dev.yml exec ghananautical ./wildfly/bin/jboss-cli.sh -c --command="undeploy ghana-web.war"
    docker-compose -f docker-compose-dev.yml exec ghananautical rm -f wildfly/standalone/deployments/ghana-web*
    
Deploy changes using 

    mvn -Pfulldeploy clean install
    
