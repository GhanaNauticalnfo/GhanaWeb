  COPY /B ..\ghanaweb\target\ghana-web.war .\ghana-web.war
  echo "**********************************************"
  echo "** Building ghananauticalinfo/ghanaweb      **"
  echo "**********************************************"
  docker build --no-cache --force-rm -t "ghananauticalinfo/ghanaweb:1.0.0" .

  DEL .\ghana-web.war