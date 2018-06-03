USE books_db;

/*ALTER TABLE books ADD COLUMN sold float(8,2) NOT NULL AFTER FIP;
ALTER TABLE books_weekly MODIFY COLUMN ftype_week ENUM('loans','deposits','debit_cards','membership','iTransact','FIP','sold') NOT NULL;*/

CREATE TABLE IF NOT EXISTS books2
(
    bsr varchar(30) NULL,
    day int(1) NOT NULL,
    week int(1) NOT NULL,
    info_for ENUM('contacts','leads') NOT NULL,
    val float(7,2) NOT NULL
) ENGINE = InnoDB;