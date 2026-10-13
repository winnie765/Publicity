ALTER TABLE records ADD COLUMN record_date INTEGER;
CREATE INDEX records_record_date_idx ON records(record_date);
