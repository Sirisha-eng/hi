const logger = require('../config/logger.js');
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');

const getAllProductCategories = async () => {
  try {
    const result = await client.query(`SELECT * FROM event_products`);   
    logger.info('Fetched all product categories successfully');
    return result.rows;   
  } catch (error) {
    logger.error('Error fetching product categories', { error: error.message });
    throw new Error('Error fetching event products');
  }
};

const getCartItems = async (customer_id) => {
  try {
    const query = 'SELECT * FROM event_cart WHERE customer_id = $1';
    const result = await client.query(query, [customer_id]);
    logger.info(`Fetched cart items for customer ID: ${customer_id}`);
    return result.rows;
  } catch (error) {
    logger.error('Error in getCartItems:', { error: error.message, customer_id });
    throw new Error('Error fetching event cart items');
  }
};

const addCart = async (customer_id, total_amount, cart_order_details, address, number_of_plates, processing_date) => {
  try {
    let cartId;
    const existingCartQuery = `
      SELECT eventcart_id
      FROM event_cart
      WHERE customer_id = $1
    `;
    const existingCartResult = await client.query(existingCartQuery, [customer_id]);
    
    if (existingCartResult.rows.length > 0) {
      const row = existingCartResult.rows[0];
      const updateQuery = `
        UPDATE event_cart
        SET cart_order_details = $1, total_amount = $2, address = $3
        WHERE eventcart_id = $4
        RETURNING eventcart_id;
      `;
      const updateValues = [
        JSON.stringify(cart_order_details),
        total_amount,
        JSON.stringify(address),
        row.eventcart_id
      ];
      const updateResult = await client.query(updateQuery, updateValues);
      cartId = updateResult.rows[0].eventcart_id;
      logger.info(`Cart updated successfully for customer ID: ${customer_id}, Cart ID: ${cartId}`);
    } else {
      const insertQuery = `
        INSERT INTO event_cart (customer_id, total_amount, cart_order_details, address, number_of_plates, processing_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING eventcart_id;
      `;
      const insertValues = [
        customer_id,
        total_amount,
        JSON.stringify(cart_order_details),
        JSON.stringify(address),
        number_of_plates,
        processing_date
      ];
      const insertResult = await client.query(insertQuery, insertValues);
      cartId = insertResult.rows[0].eventcart_id;
      logger.info(`Cart created successfully for customer ID: ${customer_id}, Cart ID: ${cartId}`);
    }

    return {
      message: 'Cart updated successfully',
      cart_id: cartId
    };
  } catch (error) {
    logger.error('Error inserting/updating event_cart:', { error: error.message, customer_id });
    throw error;
  }
};

const getOrderDetailsById = async (customer_id) => {
  const query = DB_COMMANDS.GET_ORDER_DETAILS_BY_ID;
  const values = [customer_id];
  try {
    const result = await client.query(query, values);
    logger.info(`Retrieved order details for customer ID: ${customer_id}`);
    return result.rows; 
  } catch (error) {
    logger.error('Error retrieving event order details:', { error: error.message, customer_id });
    throw new Error('Error retrieving event order details:' + error.message);
  }
};

const getEventOrderDetailsById = async (customer_id) => {
  const query = DB_COMMANDS.GET_EVENTORDER_DETAILS_BY_ID;
  const values = [customer_id];
  try {
    const result = await client.query(query, values);
    logger.info(`Retrieved event order details for customer ID: ${customer_id}`);
    return result.rows; 
  } catch (error) {
    logger.error('Error retrieving event order details:', { error: error.message, customer_id });
    throw new Error('Error retrieving event order details:' + error.message);
  }
};

const insertEventOrder = async (orderData) => {
  try {
    const cartOrderDetailsJson = JSON.stringify(orderData.cart_order_details);
    const customerAddressJson = JSON.stringify(orderData.customer_address);

    logger.info("Inserting event order", {
      customer_id: orderData.customer_id,
      cart_order_details: cartOrderDetailsJson,
      customer_address: customerAddressJson,
    });

    const result = await client.query(DB_COMMANDS.INSERT_EVENT_ORDER, [
      orderData.customer_id,
      orderData.delivery_status,
      orderData.amount,
      orderData.delivery_details || null,
      cartOrderDetailsJson, 
      orderData.event_media || null,
      customerAddressJson,  
      orderData.payment_status,
      orderData.event_order_status,
      orderData.number_of_plates,
      orderData.processing_date
    ]);

    logger.info(`Event order inserted successfully for customer ID: ${orderData.customer_id}`);
    return result.rows[0];
  } catch (error) {
    logger.error("Error transferring cart to order:", { error: error.message });
    throw error;
  }
};

const getCartById = async (eventcart_id) => {
  const query = `SELECT * FROM event_cart WHERE eventcart_id = $1;`;
  const values = [eventcart_id];
  try {
    const result = await client.query(query, values);
    logger.info(`Retrieved cart details for cart ID: ${eventcart_id}`);
    return result.rows;
  } catch (error) {
    logger.error('Error retrieving cart by ID:', { error: error.message, eventcart_id });
    throw error;
  }
};

const deleteCart = async (eventcart_id) => {
  const query = `DELETE FROM event_cart WHERE eventcart_id = $1;`;
  const values = [eventcart_id];
  try {
    await client.query(query, values);
    logger.info(`Deleted cart with ID: ${eventcart_id}`);
  } catch (error) {
    logger.error('Error deleting cart:', { error: error.message, eventcart_id });
    throw error;
  }
};

module.exports = {
  getAllProductCategories,
  addCart,
  getOrderDetailsById,
  insertEventOrder,
  getCartById,
  deleteCart,
  getCartItems,
  getEventOrderDetailsById
};