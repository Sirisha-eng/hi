const corporate_model = require('../models/corporateorderModels');
const logger = require('../config/logger.js');
const customer_model = require('../models/customerModels');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

const GetCorporateCategory = async (req, res) => {
  try {
    logger.info('Fetching corporate categories');
    const categories = await corporate_model.getCorporateCategories();
    return res.json({
      success: true,
      categories,
    });
  } catch (err) {
    logger.error('Error fetching categories:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const add_Corporate_Cart = async (req, res) => {
  try {
    const { cart_order_details, total_amount } = req.body;
    const token = req.headers['token'];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
    }

    let verified_data;
    try {
      verified_data = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      logger.error('Token verification failed:', err.message);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        return res.status(401).json({ success: false, message: 'Token verification failed' });
      }
    }

    const customer_generated_id = verified_data.id;
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    if (!customer) {
      logger.error('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const customer_id = customer.customer_id;
    const newCart = await corporate_model.add_cart(customer_id, cart_order_details, total_amount);

    if (!newCart) {
      throw new Error('Cart creation failed');
    }

    logger.info('Cart added successfully');
    res.json({
      success: true,
      message: 'Cart created successfully',
      cart: newCart,
    });
  } catch (err) {
    logger.error('Error during cart creation:', err.message);
    res.status(500).json({ success: false, message: 'Error during cart creation', error: err.message });
  }
};

const getCorporateCart = async (req, res) => {
  try {
    const token = req.headers['token'];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
    }

    let verified_data;
    try {
      verified_data = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      logger.error('Token verification failed:', err.message);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        return res.status(401).json({ success: false, message: 'Token verification failed' });
      }
    }

    const customer_generated_id = verified_data.id;
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    if (!customer) {
      logger.error('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const customer_id = customer.customer_id;
    const carts = await corporate_model.getCarts(customer_id);
    logger.info('Carts fetched successfully');
    return res.json(carts);
  } catch (err) {
    logger.error('Error fetching carts:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getCustomerDetails = async (req, res) => {
  try {
    const token = req.headers['token'];
    let verified_data;
    try {
      verified_data = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      logger.error('Token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const customer_email = verified_data.email;
    const customer = await corporate_model.findCustomerEmail(customer_email);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const data = {
      Name: customer.customer_name,
      PhoneNumber: customer.customer_phonenumber,
      email: customer.customer_email,
      address: customer.customer_address,
      id: customer.customer_id,
    };

    logger.info('Customer details fetched successfully');
    return res.json(data);
  } catch (err) {
    logger.error('Error fetching customer details:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const corporatecart_id = req.params.corporatecart_id;
    const { date, quantity } = req.body;
    const result = await corporate_model.updateQuantity(corporatecart_id, date, quantity);
    logger.info('Cart item updated successfully');
    return res.json({ success: true });
  } catch (err) {
    logger.error('Error updating cart item:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const corporatecart_id = req.params.corporatecart_id;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await corporate_model.deleteCart(corporatecart_id, date);
    logger.info('Cart item deleted successfully');
    return res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting cart item:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const addCorporateOrderDetails = async (req, res) => {
  const { corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details } = req.body;

  try {
    logger.info('Adding corporate order details', {
      corporateorder_id,
      processing_date,
      delivery_status,
      category_id,
      quantity,
      active_quantity,
      media,
      delivery_details,
    });

    const insertedDetail = await corporate_model.insertCorporateOrderDetails(
      corporateorder_id,
      processing_date,
      delivery_status,
      category_id,
      quantity,
      active_quantity,
      media,
      delivery_details
    );

    logger.info('Order details added successfully');
    res.status(201).json({
      success: true,
      message: 'Order details added successfully',
      data: insertedDetail,
    });
  } catch (err) {
    logger.error('Error adding order details:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const token = req.headers['token'];

    let verified_data;
    try {
      verified_data = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      logger.error('Token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const customer_id = verified_data.id;
    const customer = await customer_model.getCustomerDetails(customer_id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const order = await corporate_model.getOrderDetailsById(customer_id);
    logger.info('Order details fetched successfully');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ data: order });
  } catch (err) {
    logger.error('Error retrieving order details:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const transferCartToOrder = async (req, res) => {
  const { customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status } = req.body;
  try {
    const order = await corporate_model.insertCartToOrder(
      customer_generated_id,
      order_details,
      total_amount,
      paymentid,
      customer_address,
      payment_status
    );

    logger.info('Cart successfully transferred to order');
    return res.json({
      success: true,
      order,
    });
  } catch (err) {
    logger.error('Error transferring cart to order:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getcategorynameById = async (req, res) => {
  const { categoryId } = req.body;

  try {
    const categoryname = await corporate_model.getcategoryname(categoryId);
    logger.info('Category name fetched successfully');
    return res.json({
      success: true,
      categoryname,
    });
  } catch (err) {
    logger.error('Error fetching category name:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  add_Corporate_Cart,
  getCorporateCart,
  updateCartItem,
  deleteCartItem,
  addCorporateOrderDetails,
  transferCartToOrder,
  getcategorynameById,
  getOrderDetails,
  GetCorporateCategory,
  getCustomerDetails,
};