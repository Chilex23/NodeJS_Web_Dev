CREATE DATABASE notes;
CREATE USER 'notes'@'localhost' IDENTIFIED BY 'notes12345';
GRANT ALL PRIVILEGES ON notes.* TO 'notes'@'localhost' WITH GRANT OPTION;