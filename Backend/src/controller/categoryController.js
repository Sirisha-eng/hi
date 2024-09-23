const category_model = require('../models/categoryModels');
const logger = require('../config/logger.js'); // Assuming you have logger configured in this path

const GetCorporateCategory = async (req, res) => {
    try {
        logger.info('Fetching corporate categories...');
        const categories = await category_model.getCorporateCategories();
        logger.info('Successfully fetched corporate categories', { categories }); // Logging with context
        return res.json({
            success: true,
            categories
        });
    } catch (err) {
        logger.error('Error fetching corporate categories', { error: err.message });
        res.status(500).json({ error: err.message });
    }
};
module.exports = { GetCorporateCategory };