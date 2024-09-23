const logger = require('../config/logger.js');
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbconfig.js');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRET_KEY; // Make sure this is set in your environment variables

const createaddress = async (customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number) => {
    try {
        logger.info('Attempting to create address', { customer_id, tag, pincode, line1, line2, location });
        
        const result = await client.query(
            DB_COMMANDS.CREATE_ADDRESS,
            [customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number]
        );
        
        logger.info('Address added successfully', { address: result.rows[0] });
        return result.rows[0];  
    } catch (err) {
        logger.error('Error adding address data', { error: err.message });
        throw err;
    }
};

const select_default_address = async (customer_email) => {
    try {
        logger.info('Fetching default address for customer', { customer_email });
        
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        logger.info('Default address retrieved', { address: result.rows[0] });
        
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error('Error querying the database for customer_email', { error: err.message });
        throw err;
    }
};

// Function to extract userId from the token
const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verifies the token using your secret
        logger.info('Token decoded successfully', { decoded });
        return decoded.id;
    } catch (error) {
        logger.error('Invalid Token', { error: error.message });
        throw new Error('Invalid Token');
    }
};

const updateAddressById = async (address_id, tag, pincode, line1, line2) => {
    try {
        logger.info('Updating address by ID', { address_id, tag, pincode, line1, line2 });
        
        const query = `
            UPDATE address 
            SET tag = $1, pincode = $2, line1 = $3, line2 = $4 
            WHERE address_id = $5 
            RETURNING *;
        `;
        const values = [tag, pincode, line1, line2, address_id];
        const result = await client.query(query, values);
        
        logger.info('Address updated successfully', { updatedAddress: result.rows[0] });
        return result.rows[0]; // Return the updated address
    } catch (error) {
        logger.error('Error updating address', { error: error.message });
        throw error;
    }
};

module.exports = {
    createaddress,
    select_default_address,
    getUserIdFromToken,
    updateAddressById,
};