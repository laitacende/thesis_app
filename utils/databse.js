/**
 * Connection to database config.
 */

// database connection
const mariadb = require('mariadb');
const defaultConn = mariadb.createPool({ // TODO change to default user with not many priviliges
    host: 'localhost',
    user:'root',
    password: 'haslo',
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