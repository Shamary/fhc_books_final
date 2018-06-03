use books_db;

DROP PROCEDURE IF EXISTS update_weekly_auto;
DROP PROCEDURE IF EXISTS update_ytd_auto;
DROP PROCEDURE IF EXISTS update_diff;
DROP PROCEDURE IF EXISTS update_diff_eoy;
DROP PROCEDURE IF EXISTS update_targets;

DROP PROCEDURE IF EXISTS w_sum;
DROP PROCEDURE IF EXISTS ytd_sum;
DROP PROCEDURE IF EXISTS w_diff;
DROP PROCEDURE IF EXISTS ytd_diff;

DROP PROCEDURE IF EXISTS assign_to_bsr;
DROP PROCEDURE IF EXISTS after_assign;

DROP PROCEDURE IF EXISTS set_products_sold;
DROP PROCEDURE IF EXISTS sold_weekly_actual;

DROP PROCEDURE IF EXISTS add_to_books;

DROP PROCEDURE IF EXISTS update_table2;

/****************FOR BOOKS***************/
DELIMITER //
CREATE PROCEDURE add_to_books
(
    IN _bsr varchar(30),
    IN _week int(2), 
    IN _day int(1),
    IN _loans float(14,2),
    IN _deposits float(14,2),
    IN _cards int,
    IN _membership int,
    IN _iTransact int,
    IN _FIP int,
    IN _sold float(8,2)
)
BEGIN

    IF NOT EXISTS (SELECT * FROM books WHERE user = _bsr AND week = _week AND day = _day) THEN
        INSERT INTO books VALUES (_week,_day,_loans,_deposits,_cards,_membership,_iTransact,_FIP,_sold,_bsr);
    ELSE
        UPDATE books SET loans = _loans, deposits = _deposits, debit_cards = _cards, membership = _membership, iTransact = _iTransact, 
                         FIP = _FIP, sold = _sold
        WHERE user = _bsr AND week = _week AND day = _day;
    END IF;

    CALL update_weekly_auto(_week,_bsr);
END //
DELIMITER ;

/****************UPDATES********************/
DELIMITER //
CREATE PROCEDURE
update_weekly_auto(IN _week int(2),IN _user varchar(30))
BEGIN
    INSERT IGNORE INTO books_weekly(ftype_week,wweek,user) VALUES('loans',_week,_user), ('deposits',_week,_user),('debit_cards',_week,_user),
                                                            ('membership',_week,_user),('iTransact',_week,_user), ('FIP',_week,_user),
                                                            ('sold',_week,_user);

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

    UPDATE books_weekly SET weekly_actual = (SELECT SUM(sold) FROM books WHERE week=_week AND user=_user) 
    WHERE ftype_week= 'sold' AND user=_user AND wweek=_week;

    CALL update_diff(_user,_week,'loans');
    CALL update_diff(_user,_week,'deposits');
    CALL update_diff(_user,_week,'debit_cards');
    CALL update_diff(_user,_week,'membership');
    CALL update_diff(_user,_week,'iTransact');
    CALL update_diff(_user,_week,'FIP');

    CALL update_ytd_auto(_user);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
update_diff(IN _user varchar(30),IN _week int(2), IN _ftype ENUM('loans','deposits','debit_cards','membership','iTransact','FIP'))
BEGIN
    UPDATE books_weekly SET weekly_difference =( 
    SELECT diff FROM 
    (SELECT IF(b.weekly_actual IS NULL,a._target,a._target - b.weekly_actual) as diff FROM targets a,books_weekly b
    WHERE a.bsr_name = _user AND a.week_or_eoy = 1 AND a.ftype= _ftype AND b.wweek = _week AND b.ftype_week = _ftype AND b.user=_user) AS t_diff)
    WHERE user=_user AND wweek=_week AND ftype_week = _ftype;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
update_diff_eoy(IN _user varchar(30), IN _ftype ENUM('loans','deposits','debit_cards','membership','iTransact','FIP'))
BEGIN
    UPDATE books_ytd SET ytd_difference =( 
    SELECT diff FROM 
    (SELECT IF(b.ytd_actual IS NULL,a._target,a._target - b.ytd_actual) as diff FROM targets a,books_ytd b
    WHERE a.bsr_name = _user AND a.week_or_eoy = 2 AND a.ftype= _ftype AND b.ftype_ytd = _ftype AND b.user=_user) AS t_diff)
    WHERE user=_user AND ftype_ytd = _ftype;
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

    CALL update_diff_eoy(_user,'loans');
    CALL update_diff_eoy(_user,'deposits');
    CALL update_diff_eoy(_user,'debit_cards');
    CALL update_diff_eoy(_user,'membership');
    CALL update_diff_eoy(_user,'iTransact');
    CALL update_diff_eoy(_user,'FIP');

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
    DECLARE vbranch int DEFAULT 1;
    DECLARE _position ENUM('bsr') DEFAULT 'bsr';

    SELECT * INTO w_or_y FROM (SELECT IF(_week_or_eoy = 1,2,1) as a) b;

    INSERT INTO manager_table (manager,bsr_name,loans,deposits,debit_cards,membership,iTransact,FIP,week_or_eoy)
    VALUES (_manager,bsr,_loans,_deposits,_debit_cards,_membership,_iTransact,_FIP,_week_or_eoy);

    SELECT branch INTO vbranch FROM user WHERE _username = bsr;
    SELECT position INTO _position FROM user WHERE _username = bsr;

    UPDATE manager_table SET branch = vbranch/*(SELECT branch FROM user WHERE _username = bsr)*/, 
           position = _position/*(SELECT position FROM user WHERE _username = bsr )*/ WHERE bsr_name = bsr AND week_or_eoy = _week_or_eoy;

    INSERT INTO targets(manager,bsr_name,week_or_eoy,ftype,_target) VALUES (_manager,bsr,_week_or_eoy,'loans',_loans),
        (_manager,bsr,_week_or_eoy,'deposits',_deposits),(_manager,bsr,_week_or_eoy,'debit_cards',_debit_cards),
        (_manager,bsr,_week_or_eoy,'membership',_membership),(_manager,bsr,_week_or_eoy,'iTransact',_iTransact),
        (_manager,bsr,_week_or_eoy,'FIP',_fip);

    CALL after_assign(_manager,bsr,w_or_y,vbranch,_position);
    CALL update_weekly_auto(1,bsr);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE
after_assign(IN _manager varchar(30), IN _bsr varchar(30),_week_or_eoy int(1),IN _branch int,IN _position ENUM('bsr'))
BEGIN
    INSERT IGNORE INTO manager_table (manager,branch,bsr_name,position,loans,deposits,debit_cards,membership,iTransact,FIP,week_or_eoy)
    VALUES (_manager,_branch,_bsr,_position,0,0,0,0,0,0,_week_or_eoy);

    INSERT IGNORE INTO targets (manager,bsr_name,week_or_eoy,ftype,_target) VALUES (_manager,_bsr,_week_or_eoy,'loans',0),
    (_manager,_bsr,_week_or_eoy,'deposits',0),(_manager,_bsr,_week_or_eoy,'debit_cards',0),(_manager,_bsr,_week_or_eoy,'membership',0),
    (_manager,_bsr,_week_or_eoy,'iTransact',0), (_manager,_bsr,_week_or_eoy,'FIP',0);
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
    
    UPDATE targets SET _target = _loans WHERE ftype = 'loans' AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;
    UPDATE targets SET _target = _deposits WHERE ftype = 'deposits' AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;
    UPDATE targets SET _target = _debit_cards WHERE ftype = 'debit_cards' AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;
    UPDATE targets SET _target = _membership WHERE ftype = 'membership' AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;
    UPDATE targets SET _target = _iTransact WHERE ftype = 'iTransact' AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;
    UPDATE targets SET _target = _FIP WHERE ftype = 'FIP' AND bsr_name = _bsr AND week_or_eoy = _week_or_eoy;

    CALL update_weekly_auto(1,_bsr);
END //
DELIMITER ;

/************for contacts,leads*************/

DELIMITER //
CREATE PROCEDURE update_table2(IN _bsr varchar(30), IN _week int(2), IN _day int(1), IN _contacts float(7,2), IN _leads float(7,2))
BEGIN
    IF NOT EXISTS (SELECT bsr FROM books2 WHERE bsr = _bsr AND week = _week AND day = _day) THEN
        INSERT INTO books2 VALUES (_bsr,_day,_week,'contacts',_contacts),(_bsr,_day,_week,'leads',_contacts);
    ELSE
        UPDATE books2 SET val = _contacts WHERE bsr = _bsr AND week = _week AND day = _day AND info_for = 'contacts';
        UPDATE books2 SET val = _leads WHERE bsr = _bsr AND week = _week AND day = _day AND info_for = 'leads'; 
    END IF;
END //
DELIMITER ;

/************For products sold***************

DELIMITER //
CREATE PROCEDURE sold_weekly_actual(IN _bsr varchar(30), IN _week int(2))
BEGIN
    DECLARE psum float(8,2) DEFAULT 0;

    SELECT SUM(sold) INTO psum FROM products_sold WHERE puser = _bsr AND pweek = _week;

    UPDATE products_sold SET weekly_actual = psum;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE set_products_sold(IN _bsr varchar(30), _week int(2),IN _day int(1),IN _sold float(8,2))
BEGIN
    IF NOT EXISTS(SELECT * FROM products_sold WHERE puser = _bsr AND pweek = _week AND pday = _day) THEN
        
        INSERT INTO products_sold VALUES(_bsr,_week,_day,_sold,0);
    ELSE
        UPDATE products_sold SET sold = _sold WHERE puser = _bsr AND pweek = _week AND pday = _day; 

    END IF;

    CALL sold_weekly_actual(_bsr,_week);
END //

DELIMITER ;

/******************CALLS***************
CALL update_weekly_auto(1,"bsr1");*/