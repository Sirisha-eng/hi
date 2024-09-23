const logger = require('../config/logger');  // Import logger
const client = require('../config/dbConfig.js');
const paymentmodel = require('../models/eventpaymentnodel.js');

const event_payment = async (req, res) => {
  const { paymentType, merchantTransactionId, phonePeReferenceId, paymentFrom, instrument, bankReferenceNo, amount, customer_id, corporateorder_id } = req.body;

  const insertPaymentQuery = `
    INSERT INTO payment (
      PaymentType, 
      MerchantReferenceId, 
      PhonePeReferenceId, 
      "From", 
      Instrument, 
      CreationDate, 
      TransactionDate, 
      SettlementDate, 
      BankReferenceNo, 
      Amount, 
      customer_generated_id, 
      paymentDate
    ) VALUES (
      $1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, $6, $7, $8, NOW()
    )
    RETURNING paymentid;
  `;

  const values = [
    paymentType,
    merchantTransactionId,
    phonePeReferenceId,
    paymentFrom,
    instrument,
    bankReferenceNo,
    amount,
    customer_id
  ];

  try {
    logger.info('Inserting payment data into the database');
    const response = await client.query(insertPaymentQuery, values);
    const generatedPaymentId = response.rows[0].paymentid;

    logger.info(`Payment data inserted successfully with Payment ID: ${generatedPaymentId}`);

    // Assume you have the order_id and payment_status from somewhere
    const order_id = corporateorder_id;  // or however you get it
    const payment_status = 'Success';  // or however you determine the status

    logger.info(`Updating corporate order with Order ID: ${order_id} and Payment ID: ${generatedPaymentId}`);
    // Now update the corporate order with the generated payment_id
    await updateCorporateOrder(order_id, generatedPaymentId, payment_status);

    res.status(200).json({ payment_id: generatedPaymentId });
  } catch (error) {
    logger.error('Error inserting payment data:', error);
    res.status(500).json({ message: 'Error inserting payment data', error });
  }
};

const updateCorporateOrder = async (order_id, paymentid, payment_status) => {
  try {
    logger.info(`Updating corporate order with Order ID: ${order_id}, Payment ID: ${paymentid}, and Payment Status: ${payment_status}`);
    
    // Update corporate order details in the database
    const result = await paymentmodel.updateeventOrder(order_id, paymentid, payment_status);

    if (result.rowCount > 0) {
      logger.info(`Corporate order updated successfully with Order ID: ${order_id}`);
    } else {
      logger.warn(`Corporate order with Order ID: ${order_id} not found`);
    }
  } catch (error) {
    logger.error('Error updating corporate order:', error);
    // Handle error appropriately here (you can send a response if needed)
  }
};

module.exports = { event_payment, updateCorporateOrder };