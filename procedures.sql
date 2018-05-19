use books_db;

DROP PROCEDURE IF EXISTS update_weekly;
DROP PROCEDURE IF EXISTS update_ytd;
DROP PROCEDURE IF EXISTS update_weekly_auto;
DROP PROCEDURE IF EXISTS update_ytd_auto;
DROP PROCEDURE IF EXISTS update_diff;
DROP PROCEDURE IF EXISTS update_targets;

DROP PROCEDURE IF EXISTS w_sum;
DROP PROCEDURE IF EXISTS ytd_sum;
DROP PROCEDURE IF EXISTS w_diff;
DROP PROCEDURE IF EXISTS ytd_diff;

DROP PROCEDURE IF EXISTS assign_to_bsr;
DROP PROCEDURE IF EXISTS after_assign;

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

    CALL update_diff(_user,_week);
    /*
    UPDATE books_weekly SET weekly_difference = IF(weekly_target IS NULL,-weekly_actual,weekly_target-weekly_actual) 
    WHERE user=_user AND wweek=_week;*/

    CALL update_ytd_auto(_user);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
update_diff(IN _user varchar(30),IN _week int(2))
BEGIN
    UPDATE books_weekly SET weekly_difference = IF(weekly_target IS NULL,-weekly_actual,weekly_target-weekly_actual) 
    WHERE user=_user AND wweek=_week;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
update_ytd_auto(IN _user varchar(30))
BEGIN
    INSERT IGNORE INTO books_ytd(ftype_ytd,user) VALUES('loans',_user), ('deposits',_user),('debit_cards',_user),
                                                            ('membership',_user),('iTransact',_user),('FIP',_user);

    UPDATE books_ytd SET ytd_actual = (SELECT SUM(loans) FROM books WHERE user=_user) WHERE ftype_ytd= 'loans' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(deposits) FROM books WHERE user=_user) WHERE ftype_ytd= 'deposits' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(debit_cards) FROM books WHERE user=_user) WHERE ftype_ytd= 'debit_cards' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(membership) FROM books WHERE user=_user) WHERE ftype_ytd= 'membership' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(iTransact) FROM books WHERE user=_user) WHERE ftype_ytd= 'iTransact' AND user=_user;
    UPDATE books_ytd SET ytd_actual = (SELECT SUM(FIP) FROM books WHERE user=_user) WHERE ftype_ytd= 'FIP' AND user=_user;

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

/******************ASSIGN***************/

DELIMITER //
CREATE PROCEDURE
assign_to_bsr(IN _manager varchar(30),
              IN bsr varchar(30), 
              IN _loans float(14,2),
              IN _deposits float(14,2),
              IN _debit_cards int,
              IN _membership int,
              IN _iTransact int,
              IN _FIP int,
              IN _week_or_eoy int(1)
            )
BEGIN
    DECLARE w_or_y  int(1) DEFAULT 1;

    INSERT INTO manager_table (manager,bsr_name,loans,deposits,debit_cards,membership,iTransact,FIP,week_or_eoy)
    VALUES (_manager,bsr,_loans,_deposits,_debit_cards,_membership,_iTransact,_FIP,_week_or_eoy);

    UPDATE manager_table SET branch = (SELECT branch FROM user WHERE _username = bsr), 
           position = (SELECT position FROM user WHERE _username = bsr ) WHERE bsr_name = bsr AND week_or_eoy = _week_or_eoy;

    INSERT INTO books(week,day,loans,deposits,debit_cards,membership,iTransact,FIP,user) VALUES(1,1,0,0,0,0,0,0,bsr);
    INSERT INTO books_weekly(ftype_week,wweek,weekly_target,user) VALUES ('loans',1,_loans,bsr),('deposits',1,_deposits,bsr)
    ,('debit_cards',1,_debit_cards,bsr),('membership',1,_membership,bsr),('iTransact',1,_iTransact,bsr)
    ,('FIP',1,_FIP,bsr);

    SELECT * INTO w_or_y FROM (SELECT IF(_week_or_eoy = 1,2,1) as a) b;

    CALL after_assign(_manager,bsr,w_or_y);
    CALL update_weekly_auto(1,bsr);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
after_assign(IN _manager varchar(30), IN _bsr varchar(30),_week_or_eoy int(1))
BEGIN
    INSERT IGNORE INTO manager_table (manager,bsr_name,loans,deposits,debit_cards,membership,iTransact,FIP,week_or_eoy)
    VALUES (_manager,_bsr,0,0,0,0,0,0,_week_or_eoy);
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE
update_targets(IN _manager varchar(30), IN _bsr varchar(30),IN _loans float(14,2),
               IN _deposits float(14,2),IN _debit_cards int,IN _membership int,IN _iTransact int,IN _FIP int,_week_or_eoy int(1))
BEGIN
    UPDATE manager_table SET loans = _loans, deposits = _deposits, debit_cards = _debit_cards, 
           membership = _membership, iTransact = _iTransact, FIP = _FIP
    WHERE manager = _manager AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;
    
    UPDATE books_weekly SET weekly_target = _loans WHERE ftype_week = 'loans' AND user = _bsr;
    UPDATE books_weekly SET weekly_target = _deposits WHERE ftype_week = 'deposits' AND user = _bsr;
    UPDATE books_weekly SET weekly_target = _debit_cards WHERE ftype_week = 'debit_cards' AND user = _bsr;
    UPDATE books_weekly SET weekly_target = _membership WHERE ftype_week = 'membership' AND user = _bsr;
    UPDATE books_weekly SET weekly_target = _iTransact WHERE ftype_week = 'iTransact' AND user = _bsr;
    UPDATE books_weekly SET weekly_target = _FIP WHERE ftype_week = 'FIP' AND user = _bsr; 
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