const logger = require('../config/logger.js');
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');

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
        
        const result = await client.query(
            DB_COMMANDS.SELECT_NAME_PHONE,
            [customer_email]
        );
        
        logger.info('Default address retrieved successfully', { address: result.rows[0] });
        return result.rows[0];  
    } catch (err) {
        logger.error('Error retrieving default address data', { error: err.message });
        throw err;
    }
};

const getAllAddresses = async (customer_id) => {
    try {
        logger.info('Fetching all addresses for customer', { customer_id });
        
        const result = await client.query(
            DB_COMMANDS.GET_ALL_ADDRESSES,
            [customer_id]
        );
        
        logger.info('All addresses retrieved successfully', { addresses: result.rows });
        return result.rows;  
    } catch (err) {
        logger.error('Error retrieving addresses', { error: err.message });
        throw err;
    }
};

const SelectAddress = async (address_id) => {
    try {
        logger.info('Fetching address by ID', { address_id });
        
        const result = await client.query(
            DB_COMMANDS.SELECT_ADDRESS,
            [address_id]
        );
        
        logger.info('Address retrieved successfully', { address: result.rows[0] });
        return result.rows[0];  
    } catch (err) {
        logger.error('Error retrieving address data', { error: err.message });
        throw err;
    }
};

module.exports = {
    createaddress,
    select_default_address,
    getAllAddresses,
    SelectAddress
};