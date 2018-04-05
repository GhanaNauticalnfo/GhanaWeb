/* Copyright (c) 2011 Danish Maritime Authority.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package dk.dma.ghanaweb.rest;

import dk.dma.embryo.common.log.LogEntryRestService;
import dk.dma.embryo.common.rs.CommonExceptionMappers;
import dk.dma.embryo.user.json.AuthenticationService;
import dk.dma.embryo.user.json.UserRestService;
import dk.dma.embryo.vessel.json.VesselRestService;
import dk.dma.enav.services.nwnm.NwNmRestService;
import dk.dma.enav.services.registry.ServiceLookupRestService;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@ApplicationPath("/rest")
public class ApplicationConfig extends Application {
    public Set<Class<?>> getClasses() {
        HashSet<Class<?>> set = new HashSet<>();

        // ADD ExceptionMappers
        set.addAll(Arrays.asList(CommonExceptionMappers.getMappers()));

        // ADD RS ENDPOINTS
        set.addAll(Arrays.asList(
                AuthenticationService.class,
                LogEntryRestService.class,
                UserRestService.class, 
                NwNmRestService.class,
                VesselRestService.class,
                ServiceLookupRestService.class));

        return set;
    }

}
