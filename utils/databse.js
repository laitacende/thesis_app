/**
 * Connection to database config.
 */

// database connection
const mariadb = require('mariadb');
const defaultConn = mariadb.createPool({
    host: 'localhost',
    user:'webapp_admin',
    password: 'haslo123',
    database: 'webapp',
    connectionLimit: 5,
    multipleStatements: true, // can write queries like SELECT 1; SELECT 2;
});


defaultConn.getConnection((err, conn) => {
   if (err) {
       console.log(err);
   }

   if (conn) {
       conn.release();
   }

});

module.exports = {
    defaultConn,
}