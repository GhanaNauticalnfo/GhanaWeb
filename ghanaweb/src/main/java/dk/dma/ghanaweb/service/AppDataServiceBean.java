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
package dk.dma.ghanaweb.service;

import dk.dma.embryo.common.configuration.Property;
import dk.dma.embryo.user.model.AdministratorRole;
import dk.dma.embryo.user.model.SecuredUser;
import dk.dma.embryo.user.persistence.RealmDao;
import dk.dma.embryo.user.security.SecurityUtil;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.Map;

@Singleton
@Startup
public class AppDataServiceBean {
    
    @Inject
    private RealmDao realmDao;

    @Inject
    private Logger logger;

    @Inject
    private EntityManagerFactory emf;

    @Inject
    private EntityManager em;

    @Property("embryo.users.admin.initial.pw")
    @Inject
    private String dmaInitialPw;

    @Property("embryo.users.admin.initial.email")
    @Inject
    private String dmainitialEmail;

    @PostConstruct
    public void startup() {
        Map<String, Object> props = emf.getProperties();

        String hbm2dllAuto = (String) props.get("hibernate.hbm2ddl.auto");
        logger.info("Detected database auto update setting: {}", hbm2dllAuto);

            createAdmin();
    }

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public void createAdmin() {
        SecuredUser user = realmDao.findByUsername("dma");
        logger.debug("looked up admin user: {}", user);
        if (user == null) {
            createDmaAccount();
        } else {
            logger.info("Admin user (dma) already exists in database");
        }
    }

    private void createDmaAccount() {
        logger.info("BEFORE CREATION - DMA");

        AdministratorRole auth = new AdministratorRole();
        realmDao.saveEntity(auth);

        SecuredUser user = SecurityUtil.createUser("dma", dmaInitialPw, dmainitialEmail, null);
        user.setRole(auth);
        SecuredUser saved = realmDao.saveEntity(user);

        em.flush();
        em.clear();
        logger.info("SAVED DMA: " + saved);
    }
}
