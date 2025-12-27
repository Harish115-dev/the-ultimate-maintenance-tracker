// API wrapper functions to replace database.js calls

// ============================
// EQUIPMENT API
// ============================

async function getAllEquipment() {
    try {
        const data = await apiRequest('/equipment');
        return data.equipment || [];
    } catch (error) {
        console.error('Failed to get equipment:', error);
        return [];
    }
}

async function getEquipmentById(id) {
    try {
        const data = await apiRequest(`/equipment/${id}`);
        return data.equipment;
    } catch (error) {
        console.error('Failed to get equipment:', error);
        return null;
    }
}

async function addEquipment(equipmentData) {
    try {
        const data = await apiRequest('/equipment', {
            method: 'POST',
            body: JSON.stringify(equipmentData)
        });
        return data.equipment;
    } catch (error) {
        console.error('Failed to add equipment:', error);
        throw error;
    }
}

async function updateEquipment(id, updates) {
    try {
        const data = await apiRequest(`/equipment/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return data.equipment;
    } catch (error) {
        console.error('Failed to update equipment:', error);
        throw error;
    }
}

// ============================
// REQUESTS API
// ============================

async function getAllRequests() {
    try {
        const data = await apiRequest('/requests');
        return data.requests || [];
    } catch (error) {
        console.error('Failed to get requests:', error);
        return [];
    }
}

async function getRequestById(id) {
    try {
        const data = await apiRequest(`/requests/${id}`);
        return data.request;
    } catch (error) {
        console.error('Failed to get request:', error);
        return null;
    }
}

async function addMaintenanceRequest(requestData) {
    try {
        const data = await apiRequest('/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        return data.request;
    } catch (error) {
        console.error('Failed to add request:', error);
        throw error;
    }
}

async function updateRequest(id, updates) {
    try {
        const data = await apiRequest(`/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return data.request;
    } catch (error) {
        console.error('Failed to update request:', error);
        throw error;
    }
}

async function updateRequestStatus(id, status, duration = null) {
    try {
        const body = { status };
        if (duration) body.duration = duration;

        const data = await apiRequest(`/requests/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
        return data.request;
    } catch (error) {
        console.error('Failed to update request status:', error);
        throw error;
    }
}

async function assignRequestToUser(id, userId = null) {
    try {
        const body = userId ? { userId } : {};
        const data = await apiRequest(`/requests/${id}/assign`, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
        return data.request;
    } catch (error) {
        console.error('Failed to assign request:', error);
        throw error;
    }
}

async function getRequestsByEquipment(equipmentId) {
    try {
        const data = await apiRequest(`/equipment/${equipmentId}/requests`);
        return data.requests || [];
    } catch (error) {
        console.error('Failed to get equipment requests:', error);
        return [];
    }
}

// ============================
// TEAMS API
// ============================

async function getAllTeams() {
    try {
        const data = await apiRequest('/teams');
        return data.teams || [];
    } catch (error) {
        console.error('Failed to get teams:', error);
        return [];
    }
}

async function getTeamById(id) {
    try {
        const data = await apiRequest(`/teams/${id}`);
        return data.team;
    } catch (error) {
        console.error('Failed to get team:', error);
        return null;
    }
}

async function addTeam(teamData) {
    try {
        const data = await apiRequest('/teams', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
        return data.team;
    } catch (error) {
        console.error('Failed to add team:', error);
        throw error;
    }
}

async function addTeamMember(teamId, userId) {
    try {
        const data = await apiRequest(`/teams/${teamId}/members`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
        return data;
    } catch (error) {
        console.error('Failed to add team member:', error);
        throw error;
    }
}

async function removeTeamMember(teamId, userId) {
    try {
        const data = await apiRequest(`/teams/${teamId}/members/${userId}`, {
            method: 'DELETE'
        });
        return data;
    } catch (error) {
        console.error('Failed to remove team member:', error);
        throw error;
    }
}

// ============================
// USERS API
// ============================

async function getAllUsers() {
    try {
        // For now, get from current user's team data
        // In backend, you'd need to add GET /api/users endpoint
        const teams = await getAllTeams();
        const users = [];
        const userMap = new Map();

        teams.forEach(team => {
            if (team.members) {
                team.members.forEach(member => {
                    if (!userMap.has(member.id)) {
                        userMap.set(member.id, member);
                        users.push(member);
                    }
                });
            }
        });

        return users;
    } catch (error) {
        console.error('Failed to get users:', error);
        return [];
    }
}

async function getUserById(id) {
    const users = await getAllUsers();
    return users.find(u => u.id === id) || null;
}
