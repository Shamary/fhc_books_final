DROP DATABASE books_db;
CREATE DATABASE IF NOT EXISTS books_db;
use books_db;

CREATE TABLE IF NOT EXISTS user
(
    _username varchar(30) NOT NULL PRIMARY KEY,
    _password varchar(60) NOT NULL,
    position ENUM('bsr','manager') NOT NULL
);

INSERT IGNORE INTO user VALUES("admin","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","manager");
INSERT IGNORE INTO user VALUES("bsr1","$2a$10$Gckw6owwyfHfXICK0AwLG.Ay9f2rkpmivZb51mnsR7xTIrhl1FQji","bsr");


CREATE TABLE IF NOT EXISTS books
(
    /*id int NOT NULL AUTO_INCREMENT,*/ 
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
    CONSTRAINT FOREIGN KEY (user) REFERENCES user(_username) ON DELETE CASCADE
);


INSERT IGNORE INTO books VALUES(1,"2018-01-02",1,22434.0,234234,1,9,3,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,"2018-01-03",2,3434.0,56565,3,9,9,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,"2018-01-04",3,2026131.0,4354,7,4,0,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,"2018-01-05",4,3434.0,34534,8,3,0,0,"bsr1");
INSERT IGNORE INTO books VALUES(1,"2018-01-06",5,1008850.0,435545,8,3,10,0,"bsr1");

CREATE TABLE IF NOT EXISTS books_weekly
(
    ftype_week ENUM('loans','deposits','debit_cards','membership','iTransact','FIP') NOT NULL,
    wweek int(2) NOT NULL,
    weekly_actual float(14,2),
    weekly_target float(14,2),
    weekly_difference float(14,2),
    user varchar(30) NOT NULL,
    PRIMARY KEY (ftype_week,wweek,user),
    CONSTRAINT FOREIGN KEY (user) REFERENCES user(_username) ON DELETE CASCADE/*,
    CONSTRAINT FOREIGN KEY(wweek) references books(week) ON DELETE CASCADE*/
);

CREATE TABLE IF NOT EXISTS books_ytd
(
    ftype_ytd ENUM('loans','deposits','debit_cards','membership','iTransact','FIP') NOT NULL,
    yweek int(2) NOT NULL,
    ytd_actual float(14,2),
    ytd_target float(14,2),
    ytd_difference float(14,2),
    user varchar(30) NOT NULL,
    PRIMARY KEY (ftype_ytd,user),
    CONSTRAINT FOREIGN KEY (user) REFERENCES user(_username) ON DELETE CASCADE/*,
    CONSTRAINT FOREIGN KEY(yweek) references books(week) ON DELETE CASCADE*/
);

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

/****************UPDATES********************/
DELIMITER //
CREATE PROCEDURE 
update_weekly(IN _type ENUM('loans','deposits','debit_cards','membership','iTransact','FIP'),IN week int(2), 
              IN actual float(14,2),IN diff float(14,2), IN _user varchar(30))
BEGIN 
    UPDATE books_weekly SET weekly_actual = actual WHERE user = _user AND wweek = week AND ftype_week = _type;
    UPDATE books_weekly SET weekly_difference = diff WHERE user = _user AND wweek = week AND ftype_week = _type;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE 
update_ytd(IN _type ENUM('loans','deposits','debit_cards','membership','iTransact','FIP'),IN week int(2), 
              IN actual float(14,2),IN diff float(14,2), IN _user varchar(30))
BEGIN 
    UPDATE books_ytd SET ytd_actual = actual WHERE user = _user AND yweek = week AND ftype_ytd = _type;
    UPDATE books_ytd SET ytd_difference = diff WHERE user = _user AND yweek = week AND ftype_ytd = _type;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
update_weekly_auto(IN _week int(2),IN _user varchar(30))
BEGIN
    INSERT IGNORE INTO books_weekly(ftype_week,wweek,user) VALUES('loans',_week,_user), ('deposits',_week,_user),('debit_cards',_week,_user),
                                                            ('membership',_week,_user),('iTransact',_week,_user), ('FIP',_week,_user);

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(loans) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'loans' AND user=_user AND wweek=_week;

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(deposits) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'deposits' AND user=_user AND wweek=_week;

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(debit_cards) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'debit_cards' AND user=_user AND wweek=_week;

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(membership) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'membership' AND user=_user AND wweek=_week;

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(iTransact) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'iTransact' AND user=_user AND wweek=_week;

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(FIP) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'FIP' AND user=_user AND wweek=_week;

    UPDATE books_weekly SET weekly_difference = IF(weekly_target IS NULL,-weekly_actual,weekly_target-weekly_actual) 
    WHERE user=_user AND wweek=_week;

    CALL update_ytd_auto(_user);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
update_ytd_auto(IN _user varchar(30))
BEGIN
    INSERT IGNORE INTO books_ytd(ftype_ytd,user) VALUES('loans',_user), ('deposits',_user),('debit_cards',_user),
                                                            ('membership',_user),('iTransact',_user),('FIP',_user);

    UPDATE books_ytd SET ytd_actual = (SELECT SUM(loans) FROM books) WHERE ftype_ytd= 'loans' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(deposits) FROM books) WHERE ftype_ytd= 'deposits' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(debit_cards) FROM books) WHERE ftype_ytd= 'debit_cards' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(membership) FROM books) WHERE ftype_ytd= 'membership' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(iTransact) FROM books) WHERE ftype_ytd= 'iTransact' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(FIP) FROM books) WHERE ftype_ytd= 'FIP' AND user=_user;

    UPDATE books_ytd SET ytd_difference = IF(ytd_target IS NULL,-ytd_actual,ytd_target-ytd_actual) 
    WHERE user=_user;

END //
DELIMITER ;

/******************SUMS*******************/
DELIMITER //
CREATE PROCEDURE 
w_sum(IN _week int(2), IN _user varchar(30))
BEGIN
    SELECT SUM(loans) as actual FROM books WHERE week = _week AND user = _user UNION
    SELECT SUM(deposits) FROM books WHERE week = _week AND user = _user UNION
    SELECT SUM(debit_cards) FROM books WHERE week = _week AND user = _user UNION
    SELECT SUM(membership) FROM books WHERE week = _week AND user = _user UNION
    SELECT SUM(iTransact) FROM books WHERE week = _week AND user = _user UNION
    SELECT SUM(FIP) FROM books WHERE week = _week AND user = _user;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE 
ytd_sum(IN _user varchar(30))
BEGIN
    SELECT SUM(loans) as actual FROM books WHERE user = _user UNION
    SELECT SUM(deposits) FROM books WHERE user = _user UNION
    SELECT SUM(debit_cards)FROM books WHERE user = _user UNION
    SELECT SUM(membership) FROM books WHERE user = _user UNION
    SELECT SUM(iTransact) FROM books WHERE user = _user UNION
    SELECT SUM(FIP) FROM books WHERE user = _user;
END //
DELIMITER ;

/********************DIFFS*******************/
DELIMITER //
CREATE PROCEDURE
w_diff(IN _user varchar(30),IN _week int(2))
BEGIN
    SELECT IF(weekly_target IS NULL,-weekly_actual,weekly_target-weekly_actual) as diff FROM books_weekly WHERE user=_user AND week=_week;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
ytd_diff(IN _user varchar(30))
BEGIN
    SELECT IF(ytd_target IS NULL,-ytd_actual,ytd_target-ytd_actual) as diff FROM books_ytd WHERE user=_user;
END //
DELIMITER ;


/******************CALLS***************/
CALL update_weekly_auto(1,"bsr1");

/*
select * from (select * from books_weekly where wweek=1) b 
JOIN (select ftype_ytd as ftype_week,yweek,ytd_actual,ytd_target,ytd_difference,user from books_ytd) as t2 
ON b.ftype_week=t2.ftype_week AND b.user = t2.user
RIGHT JOIN books b0 ON b0.user=b.user;

SELECT * FROM (SELECT * FROM books WHERE user ='bsr1' AND week =1) b
LEFT JOIN books_weekly b2 ON b2.wweek=b.week AND b2.user=b.user
JOIN (SELECT ftype_ytd,yweek,ytd_actual,ytd_target,ytd_difference,user from books_ytd) as b3 ON b2.ftype_week = b3.ftype_ytd; 


select * from books_weekly b JOIN (select * from books_ytd) as t2 ON t2.user=b.user;*/