const express = require('express');
const router = express.Router();
const {
  updateInventory,
  getProductInventoryLogs,
  getAllInventoryLogs,
  getInventorySummary
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/inventory/update:
 *   post:
 *     summary: Update product inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - action
 *               - quantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [add, remove, adjust, return]
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Product not found
 */
router.route('/update').post(protect, admin, updateInventory);

/**
 * @swagger
 * /api/inventory/product/{id}:
 *   get:
 *     summary: Get inventory logs for a specific product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of inventory logs for the product
 *       404:
 *         description: Product not found
 */
router.route('/product/:id').get(protect, admin, getProductInventoryLogs);

/**
 * @swagger
 * /api/inventory/logs:
 *   get:
 *     summary: Get all inventory logs
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of all inventory logs
 */
router.route('/logs').get(protect, admin, getAllInventoryLogs);

/**
 * @swagger
 * /api/inventory/summary:
 *   get:
 *     summary: Get inventory summary
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary data
 */
router.route('/summary').get(protect, admin, getInventorySummary);

module.exports = router;