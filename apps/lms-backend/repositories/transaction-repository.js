const { sequelize } = require("../config/db-connection");

class TransactionRepository {

    /**
       * startTransaction method start sequelize transaction.
       * @returns {object} - To get the sequelize instance of the model
       */
    async startTransaction() {
        return sequelize.transaction();
    }

    /**
     * commitTransaction method commit sequelize transaction.
     * @param {object} transaction - To commit transaction. 
     */
    async commitTransaction(transaction) {
        return transaction.commit();
    }

    /**
     * rollbackTransaction method rollback sequelize transaction.
     * @param {object} transaction - To rollback transaction.
     */
    async rollbackTransaction(transaction) {
        return transaction.rollback();
    }

    /**
     * cleanupTransaction method cleanup sequelize transaction.
     * @param {object} transaction - To rollback transaction.
     */
    async cleanupTransaction(transaction) {
        return transaction.cleanup();
    }
}

module.exports = {
    transactionRepository: new TransactionRepository(),
};