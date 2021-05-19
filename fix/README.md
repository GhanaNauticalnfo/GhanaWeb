# Ghana Web

The exact version of GhanaWeb that is running in DigitalOcean has a small number of changes compared to
what is in the https://github.com/GhanaNauticalnfo/GhanaWeb repository. We think the previous developer forgot to check in some changes 
that was then deployed to docker hub as ghananauticalinfo/ghananautical:1.0.1.

So as part of the AWS->DO transition, instead of building a new GhanaWeb instance, we have extracted the war from the ghananauticalinfo/ghananautical:1.0.1 docker image
uncommented some login code, stubbed the service registry and then package it up into a new Docker image and deployed it as ghananauticalinfo/ghananautical:2.0.5.

So if you need to make quick code changes to GhanaWeb you can have a look at make-war.sh. If you have ample time, it would be better to fix the build.  
