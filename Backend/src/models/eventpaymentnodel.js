const logger = require('../config/logger'); // Ensure you have the logger configured
const client = require("../config/dbConfig");

const updateeventOrder = async (order_id, payment_id, payment_status) => {
    const query = `
        UPDATE event_orders
        SET paymentid = $1, payment_status = $2
        WHERE eventorder_generated_id = $3
        RETURNING *;
    `;

    const values = [payment_id, payment_status, order_id];
    try {
        const result = await client.query(query, values);
        logger.info(`Updated event order successfully:`, {
            order_id,
            payment_id,
            payment_status,
            updated_order: result.rows[0] // Log the updated order details if needed
        });
        return result.rows[0]; // Return the updated order
    } catch (error) {
        logger.error('Error updating event order:', { error: error.message, order_id });
        throw error;
    }
};

module.exports = { updateeventOrder };