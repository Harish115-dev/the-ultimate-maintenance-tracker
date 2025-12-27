const express = require('express');
const router = express.Router();
const {
    getAllRequests,
    getRequest,
    createRequest,
    updateRequest,
    updateStatus,
    assignRequest,
    deleteRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.route('/')
    .get(protect, getAllRequests)
    .post(protect, validate(schemas.request), createRequest);

router.route('/:id')
    .get(protect, getRequest)
    .put(protect, updateRequest)
    .delete(protect, authorize('admin', 'manager'), deleteRequest);

router.patch('/:id/status', protect, updateStatus);
router.patch('/:id/assign', protect, assignRequest);

module.exports = router;
