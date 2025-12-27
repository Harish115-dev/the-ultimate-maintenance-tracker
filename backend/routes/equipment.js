const express = require('express');
const router = express.Router();
const {
    getAllEquipment,
    getEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentRequests
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.route('/')
    .get(protect, getAllEquipment)
    .post(protect, authorize('admin', 'manager'), validate(schemas.equipment), createEquipment);

router.route('/:id')
    .get(protect, getEquipment)
    .put(protect, authorize('admin', 'manager'), updateEquipment)
    .delete(protect, authorize('admin'), deleteEquipment);

router.get('/:id/requests', protect, getEquipmentRequests);

module.exports = router;
