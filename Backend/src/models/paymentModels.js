const logger = require('../config/logger'); // Ensure your logger is correctly configured
const client = require("../config/dbConfig");

const updateOrder = async (order_id, payment_id, payment_status) => {
    const query = `
        UPDATE corporate_orders
        SET paymentid = $1, payment_status = $2
        WHERE corporateorder_generated_id = $3
        RETURNING *;
    `;

    const values = [payment_id, payment_status, order_id];

    try {
        const result = await client.query(query, values);
        logger.info('Corporate order updated successfully', { order_id, payment_id, payment_status });
        return result.rows[0]; // Return the updated order details
    } catch (error) {
        logger.error('Error updating corporate order', { error: error.message, order_id });
        throw error; // Rethrow the error after logging
    }
};

module.exports = { updateOrder };