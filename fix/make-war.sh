#!/bin/bash

  echo "**********************************************"
  echo "** Building ghanaweb                        **"
  echo "**********************************************"

  rm -fr tmp
  unzip ghana-web-1.0.1.war -d tmp
  cp diff/menu.html ./tmp/partials/menu.html
  cp diff/service-registry-1.0-Developer-SNAPSHOT.jar ./tmp/WEB-INF/lib/service-registry-1.0-Developer-SNAPSHOT.jar
  cd tmp
  zip -r ../ghana-web.war *
  cd ..