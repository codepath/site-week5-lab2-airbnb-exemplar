\echo 'Delete and recreate kavholm db?'
\prompt 'Return for yes or control-C to cancel > ' answer

DROP DATABASE kavholm;
CREATE DATABASE kavholm;
\connect kavholm

\i kavholm-schema.sql
\i kavholm-seed.sql

\echo 'Delete and recreate kavholm_test db?'
\prompt 'Return for yes or control-C to cancel > ' answer

DROP DATABASE kavholm_test;
CREATE DATABASE kavholm_test;
\connect kavholm_test

\i kavholm-schema.sql
\i kavholm-seed.sql
