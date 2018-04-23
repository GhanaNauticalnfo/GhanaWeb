  COPY /B ..\ghanaweb\target\ghana-web.war .\ghana-web.war
  echo "**********************************************"
  echo "** Building ghananauticalinfo/ghananautical **"
  echo "**********************************************"
  docker build --no-cache --force-rm -t "ghananauticalinfo/ghananautical:1.0.0" .

  DEL .\ghana-web.war