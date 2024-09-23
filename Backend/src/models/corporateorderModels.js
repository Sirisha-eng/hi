// corporateOrderModel.js
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const logger = require('../config/logger.js');

const findCustomerByGid = async (customer_generated_id) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_SELECT_BY_GID, [customer_generated_id]);
        if (result.rows.length === 0) {
            logger.error('No customer found with generated ID:', customer_generated_id);
            return null;
        }
        logger.info('Customer found:', result.rows[0]);
        return result.rows[0];  
    } catch (err) {
        logger.error('Error querying the database for customer_generated_id', { error: err.message });
        throw err;
    }
};

const add_cart = async (customer_id, cart_order_details, total_amount) => {
    try {
        const result = await client.query(
            DB_COMMANDS.ADD_CORPORATECART, [customer_id, cart_order_details, total_amount]
        );
        logger.info('Cart data added successfully', { customer_id, cart_order_details });
        return result.rows[0];
    } catch (err) {
        logger.error('Error adding cart data in model', { error: err.message });
        throw err;
    }
};

const getCarts = async (customer_id) => {
    try {
        logger.info('Fetching corporate carts for customer:', customer_id);
        const res = await client.query(DB_COMMANDS.GETCARTS, [customer_id]);
        
        if (res.rowCount === 0) {
            logger.info('No carts found for customer:', customer_id);
        } else {
            logger.info(`Corporate carts fetched successfully: ${res.rowCount} carts`);
        }

        return res.rows;
    } catch (err) {
        logger.error('Error fetching carts:', { error: err.message });
        throw new Error('Error fetching carts from the database');
    }
};

const updateQuantity = async (corporatecart_id, date, quantity) => {
    try {
        logger.info('Updating quantity for cart item:', { corporatecart_id, date, quantity });
        const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);

        if (data.rows.length === 0) {
            logger.error('No price data found for corporatecart_id:', corporatecart_id);
            throw new Error('No price data found');
        }

        const price = data.rows[0].price;
        const total = data.rows[0].total_amount;
        const quant = data.rows[0].quantity;
        const balance_amount = total - (price * quant);
        const total_amount = (price * quantity) + balance_amount;

        const res = await client.query(DB_COMMANDS.UPDATEQUANTITY, [corporatecart_id, date, quantity, total_amount]);
        logger.info('Quantity updated successfully', { corporatecart_id, new_total_amount: total_amount });

        return res;
    } catch (err) {
        logger.error('Error updating quantity:', { error: err.message });
        throw new Error('Error updating quantity in the database');
    }
};

const deleteCart = async (corporatecart_id, date) => {
    try {
        logger.info('Deleting item from cart:', { corporatecart_id, date });

        const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
        if (data.rows.length === 0) {
            logger.error('Item not found in cart:', corporatecart_id);
            throw new Error('Item not found in cart');
        }

        const { price, quantity, total_amount } = data.rows[0];
        const amount = price * quantity;
        const new_total_amount = total_amount - amount;

        await client.query(DB_COMMANDS.DELETECARTITEM, [corporatecart_id, date, new_total_amount]);
        const result = await client.query(DB_COMMANDS.DELETECARTROW, [corporatecart_id]);

        logger.info('Cart item deleted successfully', { corporatecart_id, date });
        return result;
    } catch (err) {
        logger.error('Error deleting from cart:', { error: err.message });
        throw new Error('Error deleting from the database');
    }
};

const insertCartToOrder = async (customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status) => {
    try {
        logger.info('Transferring cart to order:', { customer_generated_id, total_amount });

        const result = await client.query(
            DB_COMMANDS.INSERT_CART_TO_ORDER,
            [customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status]
        );

        logger.info('Cart data added to orders table successfully', result);
        return result.rows[0]; 
    } catch (err) {
        logger.error('Error transferring cart to orders in model', { error: err.message });
        throw err; 
    }
};

const getcategoryname = async (categoryId) => {
    try {
        const category_name = await client.query(DB_COMMANDS.GET_CATEGORY_NAME, [categoryId]);
        logger.info('Category name fetched successfully', { categoryId, category_name: category_name.rows[0] });
        return category_name.rows[0];
    } catch (err) {
        logger.error('Error fetching category_name', { error: err.message });
        throw err;
    }
};

const getOrderDetailsById = async (customer_id) => {
    try {
        logger.info('Fetching order details for customer:', customer_id);
        const result = await client.query(DB_COMMANDS.FETCH_ORDERS, [customer_id]);
        logger.info('Order details fetched successfully:', { customer_id, orders: result.rows });
        return result.rows; 
    } catch (error) {
        logger.error('Error retrieving corporate order details', { customer_id, error: error.message });
        throw new Error('Error retrieving corporate order details: ' + error.message);
    }
};

const insertCorporateOrderDetails = async (corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details) => {
    try {
        logger.info('Inserting corporate order details:', { corporateorder_id, processing_date, delivery_status });

        const result = await client.query(
            DB_COMMANDS.INSERT_CORPORATE_ORDER_DETAILS,
            [corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details]
        );

        logger.info('Corporate order details inserted successfully', { corporateorder_id });
        return result.rows[0];
    } catch (error) {
        logger.error('Error inserting corporate order details', { error: error.message });
        throw error;
    }
};

module.exports = {
    insertCartToOrder,
    getcategoryname,
    insertCorporateOrderDetails,
    getOrderDetailsById,
    deleteCart,
    updateQuantity,
    getCarts,
    add_cart,
    findCustomerByGid
};