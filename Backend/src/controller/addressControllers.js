require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createaddress, select_default_address, getUserIdFromToken, updateAddressById } = require('../models/addressModel.js');
const client = require('../config/dbconfig.js');

// Create a new address for the customer
const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];       
        if (!token) {
            logger.warn('No token provided during address creation attempt');
            return res.status(401).json({ message: 'No token provided' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY); 
        } catch (err) {
            logger.warn('Invalid or expired token during address creation', { error: err.message });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_id = decoded.id;
        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;

        // Validate that required fields are provided
        if (!tag || !pincode || !line1 || !line2 || !location) {
            logger.warn('Missing required fields during address creation');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newCustomer = await createaddress(
            customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number
        );

        logger.info('Address stored successfully', { customer: newCustomer });
        return res.json({
            success: true,
            message: 'Address stored successfully',
            customer: newCustomer
        });
    } catch (err) {
        logger.error('Error during address storing', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

// Get the default address for the customer
const getDefaultAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            logger.warn('No token provided during retrieving default address');
            return res.status(401).json({ message: 'No token provided' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            logger.warn('Invalid or expired token during retrieving default address', { error: err.message });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        const customer_email = decoded.email;
        logger.info('Retrieving default address for customer', { email: customer_email });
        const defaultAddress = await select_default_address(customer_email);

        logger.info('Default address retrieved successfully', { address: defaultAddress });
        return res.json({
            success: true,
            message: 'Default address retrieved successfully',
            customer: defaultAddress  
        });
    } catch (err) {
        logger.error('Error retrieving default address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

// Get all addresses for the user
const getAddressForUser = async (req, res) => {
    const token = req.headers['token'];
    const userId = getUserIdFromToken(token);
    try {
        const query = 'SELECT * FROM address WHERE customer_id = $1';
        const values = [userId];
        const result = await client.query(query, values);

        logger.info('Addresses fetched successfully for user', { userId: userId, addresses: result.rows });
        return res.json({
            success: true,
            message: 'Address fetched successfully',
            address: result.rows
        });
    } catch (error) {
        logger.error('Error fetching addresses', { error });
        res.status(500).json({ message: 'Error fetching addresses', error });
    }
};

// Edit address by ID
const editAddress = async (req, res) => {
    const { address_id } = req.params;
    const { tag, pincode, line1, line2 } = req.body;

    if (!tag || !pincode || !line1 || !line2) {
        logger.warn('All fields are required for address update');
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const updatedAddress = await updateAddressById(address_id, tag, pincode, line1, line2);
        if (!updatedAddress) {
            logger.warn('Address not found for update', { address_id });
            return res.status(404).json({ error: 'Address not found' });
        }
        logger.info('Address updated successfully', { address_id, updatedAddress });
        res.status(200).json({
            message: 'Address updated successfully',
            updatedAddress,
        });
    } catch (error) {
        logger.error('Error updating address', { error });
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createAddress,
    getDefaultAddress,
    getAddressForUser,
    editAddress,
};