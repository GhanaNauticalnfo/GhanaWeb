  echo "**********************************************************"
  echo "** Starting ghananautical container in development mode **"
  echo "**********************************************************"
  docker-compose -f docker-compose-dev.yml up -d


  $deployment = ""
  $gw = $null

  DO
  {
    Start-Sleep -s 5
    $deployment = docker-compose -f docker-compose-dev.yml exec ghananautical ./wildfly/bin/jboss-cli.sh -c --command="ls" | Select-String -Pattern "deployment"
    if ($deployment) {
        $gw = docker-compose -f docker-compose-dev.yml exec ghananautical ./wildfly/bin/jboss-cli.sh -c --command="ls deployment"
    }
    echo "Waiting for server to start"

  } While (!$gw)

  echo "Undeploying ghana-web"
  docker-compose -f docker-compose-dev.yml exec ghananautical ./wildfly/bin/jboss-cli.sh -c --command="undeploy ghana-web.war"

  echo "Deleting ghana-web.war from deployments directory"
  docker-compose -f docker-compose-dev.yml exec ghananautical rm -f wildfly/standalone/deployments/ghana-web.war
  docker-compose -f docker-compose-dev.yml exec ghananautical rm -f wildfly/standalone/deployments/ghana-web.war.undeployed
