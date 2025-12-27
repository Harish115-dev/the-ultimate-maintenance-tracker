const { sequelize } = require('./config/database');
const { User, Team, Equipment, Request } = require('./models');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');

        const userCount = await User.count();
        const teamCount = await Team.count();
        const equipmentCount = await Equipment.count();
        const requestCount = await Request.count();

        console.log(JSON.stringify({
            users: userCount,
            teams: teamCount,
            equipment: equipmentCount,
            requests: requestCount
        }));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkData();
