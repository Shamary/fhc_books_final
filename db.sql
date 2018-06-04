DROP DATABASE books_db;
CREATE DATABASE IF NOT EXISTS books_db;
use books_db;

CREATE TABLE IF NOT EXISTS user
(
    _username varchar(30) NOT NULL PRIMARY KEY,
    _password varchar(60) NOT NULL,
    position ENUM('bsr','manager') NOT NULL,
    branch int NOT NULL
) ENGINE = InnoDB;

INSERT IGNORE INTO user VALUES("admin","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","manager",1);
INSERT IGNORE INTO user VALUES("bsr1","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr",1);
INSERT IGNORE INTO user VALUES("bsr2","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr",1);
INSERT IGNORE INTO user VALUES("bsr3","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr",4);
INSERT IGNORE INTO user VALUES("bsr4","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr",2);
INSERT IGNORE INTO user VALUES("bsr5","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr",7);
INSERT IGNORE INTO user VALUES("bsr6","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr",3);

CREATE TABLE IF NOT EXISTS manager_table
(
    manager varchar(30) NOT NULL,
    branch int,
    bsr_name varchar(30) NOT NULL,
    position ENUM('bsr'),
    loans float(14,2) NOT NULL,
    deposits float(14,2) NOT NULL,
    debit_cards int NOT NULL,
    membership int NOT NULL,
    iTransact int NOT NULL,
    FIP int NOT NULL,
    week_or_eoy int(1),
    PRIMARY KEY(manager,bsr_name,week_or_eoy),
    CONSTRAINT FOREIGN KEY (bsr_name) REFERENCES user(_username) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS targets
(
    manager varchar(30) NOT NULL,
    bsr_name varchar(30) NOT NULL,
    week_or_eoy int(1) NOT NULL,
    ftype ENUM('loans','deposits','debit_cards','membership','iTransact','FIP') NOT NULL,
    _target FLOAT(14,2),
    PRIMARY KEY (manager,bsr_name,ftype,week_or_eoy),
    CONSTRAINT FOREIGN KEY (manager,bsr_name,week_or_eoy) REFERENCES manager_table(manager,bsr_name,week_or_eoy) ON DELETE CASCADE
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS books
(
    /*id int NOT NULL AUTO_INCREMENT,*/ 
    week int(2) NOT NULL /*PRIMARY KEY*/,
    day int NOT NULL,
    loans float(14,2) NOT NULL,
    deposits float(14,2) NOT NULL,
    debit_cards int NOT NULL,
    membership int NOT NULL,
    iTransact int NOT NULL,
    FIP int NOT NULL,
    sold float(8,2) NOT NULL,
    user varchar(30) NOT NULL,
    CONSTRAINT FOREIGN KEY (user) REFERENCES manager_table(bsr_name) ON DELETE CASCADE
) ENGINE = InnoDB;

/*INSERT IGNORE INTO books VALUES(1,1,22434.0,234234,1,9,3,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,2,3434.0,56565,3,9,9,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,3,2026131.0,4354,7,4,0,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,4,3434.0,34534,8,3,0,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,5,1008850.0,435545,8,3,10,0,"bsr1");*/

CREATE TABLE IF NOT EXISTS books_weekly
(
    ftype_week ENUM('loans','deposits','debit_cards','membership','iTransact','FIP','sold') NOT NULL,
    wweek int(2) NOT NULL,
    weekly_actual float(14,2),
    /*weekly_target float(14,2),*/
    weekly_difference float(14,2),
    user varchar(30) NOT NULL,
    PRIMARY KEY (ftype_week,wweek,user),
    CONSTRAINT FOREIGN KEY (user) REFERENCES manager_table(bsr_name) ON DELETE CASCADE/*,
    CONSTRAINT FOREIGN KEY(wweek) references books(week) ON DELETE CASCADE*/
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS books_ytd
(
    ftype_ytd ENUM('loans','deposits','debit_cards','membership','iTransact','FIP') NOT NULL,
    yweek int(2) NOT NULL,
    ytd_actual float(14,2),
    /*ytd_target float(14,2),*/
    ytd_difference float(14,2),
    user varchar(30) NOT NULL,
    PRIMARY KEY (ftype_ytd,user),
    CONSTRAINT FOREIGN KEY (user) REFERENCES manager_table(bsr_name) ON DELETE CASCADE/*,
    CONSTRAINT FOREIGN KEY(yweek) references books(week) ON DELETE CASCADE*/
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS books2
(
    bsr varchar(30) NOT NULL,
    day int(1) NOT NULL,
    week int(1) NOT NULL,
    info_for ENUM('contacts','leads') NOT NULL,
    val float(7,2) NOT NULL,
    /*total float(10,2) NOT NULL DEFAULT 0,*/
    /*PRIMARY KEY (bsr,week,day),*/
    CONSTRAINT FOREIGN KEY (bsr) REFERENCES manager_table(bsr_name) ON DELETE CASCADE
) ENGINE = InnoDB;

/*
CREATE TABLE IF NOT EXISTS products_sold
(
    puser varchar(30) NOT NULL, 
    pweek int(2) NOT NULL,
    pday int(1) NOT NULL,
    sold float(8,2) NOT NULL,
    p_weekly_actual FLOAT(8,2),
    PRIMARY KEY (puser,pweek),
    CONSTRAINT FOREIGN KEY (puser) REFERENCES manager_table(bsr_name) ON DELETE CASCADE
) ENGINE = InnoDB;*/

