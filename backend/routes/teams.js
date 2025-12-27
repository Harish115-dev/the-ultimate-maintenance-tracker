const express = require('express');
const router = express.Router();
const {
    getAllTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.route('/')
    .get(protect, getAllTeams)
    .post(protect, authorize('admin', 'manager'), validate(schemas.team), createTeam);

router.route('/:id')
    .get(protect, getTeam)
    .put(protect, authorize('admin', 'manager'), updateTeam)
    .delete(protect, authorize('admin'), deleteTeam);

router.post('/:id/members', protect, authorize('admin', 'manager'), addMember);
router.delete('/:id/members/:userId', protect, authorize('admin', 'manager'), removeMember);

module.exports = router;
