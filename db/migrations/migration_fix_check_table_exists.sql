-- Migration: Fix ambiguous column in check_table_exists function
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM information_schema.tables t
    WHERE t.table_name = check_table_exists.table_name
      AND t.table_schema = 'public'
  );
END;
$$ LANGUAGE plpgsql;
