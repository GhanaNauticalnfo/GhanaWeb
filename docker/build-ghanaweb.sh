#!/bin/bash

if [ "$1" = "build" ]; then

  echo "**********************************************"
  echo "** Building ghanaweb                        **"
  echo "**********************************************"

  cp ../ghanaweb/target/ghana-web.war ./ghana-web.war
  DOCKER_TAG="ghananauticalinfo/ghanaweb:1.0.0"
  echo "**********************************************"
  echo "** Building $DOCKER_TAG                     **"
  echo "**********************************************"
  docker build --no-cache -t $DOCKER_TAG .

  rm ./ghana-web.war
  exit


elif [ "$1" = "push" ]; then  
  VERSION=${2:-1.0.0}
  DOCKER_TAG="ghananauticalinfo/niord-gh-appsrv:$VERSION"
  echo "Pushing $DOCKER_TAG to docker.io - make sure you are logged in"
  docker push $DOCKER_TAG
  exit     


else
    echo Unknown target: "$1"
    echo Valid targets are:
fi

echo "  build <war> <version>   Builds the specified version including the specified war"
echo "  push  <version>         Pushes version to docker.io"


