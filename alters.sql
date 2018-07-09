USE books_db;

/*ALTER TABLE books ADD COLUMN sold float(8,2) NOT NULL AFTER FIP;
ALTER TABLE books_weekly MODIFY COLUMN ftype_week ENUM('loans','deposits','debit_cards','membership','iTransact','FIP','sold') NOT NULL;*/

/*
CREATE TABLE IF NOT EXISTS books2
(
    bsr varchar(30) NOT NULL,
    day int(1) NOT NULL,
    week int(1) NOT NULL,
    info_for ENUM('contacts','leads') NOT NULL,
    val float(7,2) NOT NULL,
    CONSTRAINT FOREIGN KEY (bsr) REFERENCES manager_table(bsr_name) ON DELETE CASCADE
) ENGINE = InnoDB;*/

/*ALTER TABLE manager_table DROP loans,DROP deposits,DROP debit_cards,DROP membership,DROP iTransact,DROP FIP;*/

alter table targets drop primary key;

alter table targets DROP FOREIGN KEY targets_ibfk_1;
alter table targets DROP FOREIGN KEY targets_ibfk_2;
alter table targets DROP FOREIGN KEY targets_ibfk_3;
alter table targets DROP FOREIGN KEY targets_ibfk_4;
alter table targets DROP FOREIGN KEY targets_ibfk_5;
alter table targets ADD constraint FOREIGN KEY (manager,bsr_name) REFERENCES manager_table(manager,bsr_name) ON DELETE CASCADE;

alter table targets add primary key(manager,bsr_name,ftype,week_or_eoy); 

alter table manager_table drop primary key;
alter table manager_table add primary key(manager,bsr_name);
alter table manager_table drop week_or_eoy;

/*
SELECT
  constraint_name
FROM
  information_schema.REFERENTIAL_CONSTRAINTS
WHERE
  constraint_schema = 'books_db' AND table_name = 'targets';*/