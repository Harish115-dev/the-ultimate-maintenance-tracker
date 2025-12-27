const { sequelize } = require('../config/database');
const { User, Team, Equipment, Request, TeamMember } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...');

        // Create users
        const users = await User.bulkCreate([
            { name: 'John Doe', email: 'john@gearguard.com', password: 'admin123', phone: '+919876543210', role: 'admin' },
            { name: 'Sarah Wilson', email: 'sarah@gearguard.com', password: 'tech123', phone: '+919876543211', role: 'technician' },
            { name: 'Mike Johnson', email: 'mike@gearguard.com', password: 'tech123', phone: '+919876543212', role: 'technician' },
            { name: 'Robert Taylor', email: 'robert@gearguard.com', password: 'tech123', phone: '+919876543213', role: 'technician' }
        ], { individualHooks: true }); // IMPORTANT: Enable hooks for password hashing!
        console.log('✅ Users created');

        // Create teams
        const teams = await Team.bulkCreate([
            { name: 'Mechanics', description: 'Handles mechanical equipment repairs', icon: '🔧', specialization: 'Mechanical' },
            { name: 'Electricians', description: 'Electrical systems and power equipment', icon: '⚡', specialization: 'Electrical' },
            { name: 'IT Support', description: 'Computer hardware and software issues', icon: '💻', specialization: 'IT' },
            { name: 'HVAC Technicians', description: 'Heating, ventilation, and air conditioning', icon: '❄️', specialization: 'HVAC' }
        ]);
        console.log('✅ Teams created');

        // Add team members
        await TeamMember.bulkCreate([
            { teamId: teams[0].id, userId: users[1].id }, // Sarah to Mechanics
            { teamId: teams[1].id, userId: users[2].id }, // Mike to Electricians
            { teamId: teams[2].id, userId: users[3].id }  // Robert to IT Support
        ]);
        console.log('✅ Team members assigned');

        // Create equipment
        const equipment = await Equipment.bulkCreate([
            { name: 'CNC Machine 01', serialNumber: 'CNC-2023-001', category: 'Industrial', department: 'Production', maintenanceTeam: teams[0].id, location: 'Factory Floor A', purchaseDate: '2023-01-15', warrantyExpiry: '2027-01-15' },
            { name: 'Laptop - John Doe', serialNumber: 'LT-2024-045', category: 'Computer', department: 'IT', maintenanceTeam: teams[2].id, location: 'Office 201', purchaseDate: '2024-03-10', warrantyExpiry: '2026-03-10', assignedTo: 'John Doe' },
            { name: 'Generator 02', serialNumber: 'GEN-2022-002', category: 'Power', department: 'Facilities', maintenanceTeam: teams[1].id, location: 'Basement B1', purchaseDate: '2022-08-22', warrantyExpiry: '2024-08-22' },
            { name: 'Forklift 03', serialNumber: 'FRK-2021-003', category: 'Vehicle', department: 'Warehouse', maintenanceTeam: teams[0].id, location: 'Warehouse A', purchaseDate: '2021-11-05', warrantyExpiry: '2023-11-05' }
        ]);
        console.log('✅ Equipment created');

        // Create requests
        await Request.bulkCreate([
            { type: 'corrective', subject: 'Oil Leakage', description: 'CNC Machine is leaking oil', equipmentId: equipment[0].id, department: 'Production', teamId: teams[0].id, priority: 'high', scheduledDate: '2025-12-28', createdBy: users[0].id },
            { type: 'preventive', subject: 'Routine Checkup', description: 'Scheduled preventive maintenance', equipmentId: equipment[2].id, department: 'Facilities', teamId: teams[1].id, priority: 'medium', scheduledDate: '2025-12-30', createdBy: users[0].id },
            { type: 'corrective', subject: 'Screen Replacement', description: 'Laptop screen is broken', equipmentId: equipment[1].id, department: 'IT', teamId: teams[2].id, priority: 'medium', scheduledDate: '2025-12-27', createdBy: users[0].id, status: 'in_progress', assignedTo: users[3].id }
        ]);
        console.log('✅ Requests created');

        console.log('🎉 Database seeded successfully!');
        console.log('\nTest credentials:');
        console.log('Email: john@gearguard.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
};

// Run if called directly
if (require.main === module) {
    sequelize.sync({ force: true })
        .then(() => seedDatabase())
        .catch(err => console.error(err));
}

module.exports = seedDatabase;
