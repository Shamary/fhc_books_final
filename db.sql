CREATE DATABASE IF NOT EXISTS books_db;
use books_db;

CREATE TABLE IF NOT EXISTS books
(
    week int(2) NOT NULL /*PRIMARY KEY*/,
    bdate Date NOT NULL,
    day int NOT NULL,
    loans float(14,2) NOT NULL,
    deposits float(14,2) NOT NULL,
    debit_cards int NOT NULL,
    membership int NOT NULL,
    iTransact int NOT NULL,
    FIP int NOT NULL,
    user varchar(30) NOT NULL,
    CONSTRAINT FOREIGN KEY user REFERENCES user(_username) ON DELETE CASCADE
);


INSERT INTO books VALUES(1,"2018-01-02",1,22434.0,234234,1,9,3,0,"bsr1");
INSERT INTO books VALUES(1,"2018-01-03",2,3434.0,56565,3,9,9,0,"bsr1");
INSERT INTO books VALUES(1,"2018-01-04",3,2026131.0,4354,7,4,0,0,"bsr1");
INSERT INTO books VALUES(1,"2018-01-05",4,3434.0,34534,8,3,0,0,"bsr1");
INSERT INTO books VALUES(1,"2018-01-06",5,1008850.0,435545,8,3,10,0,"bsr1");

CREATE TABLE IF NOT EXISTS books_weekly
(
    ftype_week ENUM('loans','deposits','debit_cards','membership','iTransact','FIP') NOT NULL,
    wweek int(2) NOT NULL,
    weekly_actual float(14,2),
    weekly_target float(14,2),
    weekly_difference float(14,2),
    CONSTRAINT FOREIGN KEY user REFERENCES user(_username) ON DELETE CASCADE/*,
    CONSTRAINT FOREIGN KEY(wweek) references books(week) ON DELETE CASCADE*/
);

CREATE TABLE IF NOT EXISTS books_ytd
(
    ftype_ytd ENUM('loans','deposits','debit_cards','membership','iTransact','FIP') NOT NULL,
    yweek int(2) NOT NULL,
    ytd_actual float(14,2),
    ytd_target float(14,2),
    ytd_difference float(14,2),
    CONSTRAINT FOREIGN KEY user REFERENCES user(_username) ON DELETE CASCADE/*,
    CONSTRAINT FOREIGN KEY(yweek) references books(week) ON DELETE CASCADE*/
);

CREATE TABLE IF NOT EXISTS user
(
    _username varchar(30) NOT NULL PRIMARY KEY,
    _password varchar(60) NOT NULL,
    position ENUM('bsr','manager') NOT NULL
);

INSERT IGNORE INTO user VALUES("admin","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","manager");
INSERT IGNORE INTO user VALUES("bsr1","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr");


CREATE TABLE IF NOT EXISTS manager_table
(
    manager varchar(30) NOT NULL,
    branch varchar(20) NOT NULL,
    bsr_name varchar(30) NOT NULL,
    position ENUM('bsr') NOT NULL,
    loans float(14,2) NOT NULL,
    deposits float(14,2) NOT NULL,
    debit_cards int NOT NULL,
    membership int NOT NULL,
    iTransact int NOT NULL,
    FIP int NOT NULL
);