// ============================
// AUTH CHECK
// ============================

// Redirect to login if not authenticated
if (!isAuthenticated()) {
    window.location.href = 'login.html';
}

// Display current user info
const displayUserInfo = () => {
    const user = getCurrentUser();
    if (user) {
        const avatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');

        if (avatar) avatar.textContent = user.name.split(' ').map(n => n[0]).join('');
        if (userName) userName.textContent = user.name;
        if (userRole) userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
};

// ============================
// GLOBAL VARIABLES
// ============================

let currentView = 'dashboard';
let currentDate = new Date();
let currentEquipmentId = null;

// ============================
// INITIALIZATION
// ============================

document.addEventListener('DOMContentLoaded', async () => {
    // Display user info
    displayUserInfo();

    // Note: No longer using database.js localStorage
    // All data comes from backend API now

    // Initial Render
    await switchView('dashboard');
    setupEventListeners();
    await populateEquipmentSelect();
});

// View Navigation
async function switchView(viewName) {
    currentView = viewName;

    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        }
    });

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        kanban: 'Maintenance Requests',
        calendar: 'Preventive Maintenance Calendar',
        equipment: 'Equipment Database',
        teams: 'Maintenance Teams',
        reports: 'Analytics & Reports'
    };
    document.getElementById('page-title').textContent = titles[viewName] || 'Dashboard';

    const container = document.getElementById('view-container');
    container.innerHTML = '';

    switch (viewName) {
        case 'dashboard':
            await renderDashboard(container);
            break;
        case 'kanban':
            await renderKanban(container);
            break;
        case 'calendar':
            await renderCalendar(container);
            break;
        case 'equipment':
            await renderEquipment(container);
            break;
        case 'teams':
            await renderTeams(container);
            break;
        case 'reports':
            await renderReports(container);
            break;
    }
}

// ========================
// RENDER FUNCTIONS
// ========================

// Dashboard View
async function renderDashboard(container) {
    const requests = await getAllRequests();
    const equipment = await getAllEquipment();

    const totalRequests = requests.length;
    const inProgress = requests.filter(r => r.status === 'in_progress').length;
    const overdue = requests.filter(r => new Date(r.scheduledDate) < new Date() && r.status !== 'repaired').length;
    const activeAssets = equipment.filter(e => e.status === 'active').length;

    container.innerHTML = `
        <div class="fade-in">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>${totalRequests}</h3>
                        <p>Total Requests</p>
                    </div>
                    <div class="stat-icon">📋</div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>${inProgress}</h3>
                        <p>In Progress</p>
                    </div>
                    <div class="stat-icon">⚙️</div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>${overdue}</h3>
                        <p>Overdue</p>
                    </div>
                    <div class="stat-icon">⚠️</div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>${activeAssets}</h3>
                        <p>Active Assets</p>
                    </div>
                    <div class="stat-icon">🏭</div>
                </div>
            </div>

            <h2>Recent Activity</h2>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Equipment</th>
                            <th>Status</th>
                            <th>Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.slice(0, 5).map(req => {
        const eq = req.equipment || { name: 'Unknown' };
        return `
                            <tr>
                                <td>${req.subject}</td>
                                <td>${eq.name}</td>
                                <td><span class="badge status-${req.status}">${formatStatus(req.status)}</span></td>
                                <td><span class="card-priority priority-${req.priority}">${req.priority}</span></td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderKanban(container) {
    const requests = await getAllRequests();
    const columns = [
        { id: 'new', title: 'New' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'repaired', title: 'Repaired' },
        { id: 'scrap', title: 'Scrap' }
    ];

    const board = document.createElement('div');
    board.className = 'kanban-board fade-in';

    columns.forEach(col => {
        const columnEl = document.createElement('div');
        columnEl.className = 'kanban-column';
        columnEl.innerHTML = `
            <div class="kanban-header">
                <span>${col.title}</span>
                <span class="count">${requests.filter(r => r.status === col.id).length}</span>
            </div>
            <div class="kanban-list" id="col-${col.id}" ondrop="handleDrop(event, '${col.id}')" ondragover="allowDrop(event)">
                ${requests.filter(r => r.status === col.id).map(createKanbanCard).join('')}
            </div>
        `;
        board.appendChild(columnEl);
    });

    container.appendChild(board);
}

function createKanbanCard(req) {
    const isOverdue = new Date(req.scheduledDate) < new Date() && req.status !== 'repaired';
    const equipment = req.equipment || { name: 'Unknown' };
    const assignedUser = req.assignedUser || null;
    const canAssign = req.status === 'new' || req.status === 'in_progress';

    return `
        <div class="kanban-card status-${req.status}" draggable="true" ondragstart="drag(event)" id="${req.id}" onclick="viewRequestDetail('${req.id}')">
            ${isOverdue ? '<div class="overdue-indicator" title="Overdue"></div>' : ''}
            <div class="card-meta">#${req.id.split('-')[2]} • ${req.type}</div>
            <div class="card-title">${req.subject}</div>
            <div class="card-meta">🏭 ${equipment ? equipment.name : 'Unknown Equipment'}</div>
            ${req.duration ? `<div class="card-meta">⏱️ ${req.duration}h</div>` : ''}
            <div class="card-footer">
                <span class="card-priority priority-${req.priority}">${req.priority}</span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    ${assignedUser ? `
                        <div class="tech-avatar" title="${assignedUser.name}">${assignedUser.name.split(' ').map(n => n[0]).join('')}</div>
                    ` : (canAssign ? `
                        <button class="btn-sm" onclick="event.stopPropagation(); assignRequestToMe('${req.id}')" title="Assign to me">Assign</button>
                    ` : `<div class="tech-avatar" title="Unassigned">-</div>`)}
                </div>
            </div>
        </div>
    `;
}

async function renderCalendar(container) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get requests for this month
    const allRequests = await getAllRequests();
    const requests = allRequests.filter(req => {
        const d = new Date(req.scheduledDate);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let html = `
        <div class="calendar-controls" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-secondary" onclick="changeMonth(-1)">Previous</button>
            <h2>${firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button class="btn btn-secondary" onclick="changeMonth(1)">Next</button>
        </div>
        <div class="calendar-grid fade-in">
    `;

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => html += `<div class="calendar-day-header">${day}</div>`);

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
        html += `<div class="calendar-day disabled" style="background: #fcfcfc;"></div>`;
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayRequests = requests.filter(r => r.scheduledDate === dateStr);

        html += `
            <div class="calendar-day" onclick="openCreateRequestModal('${dateStr}')">
                <span class="day-number">${d}</span>
                ${dayRequests.map(r => {
            const eventClass = r.type === 'preventive' ? 'preventive' : 'corrective';
            return `
                    <div class="calendar-event ${eventClass}" title="${r.subject} (${r.type})" onclick="event.stopPropagation(); viewRequestDetail('${r.id}')">
                        ${r.subject}
                    </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

async function renderEquipment(container) {
    const equipment = await getAllEquipment();

    container.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                <button class="btn btn-primary" onclick="openAddEquipmentModal()">+ Add Equipment</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Serial #</th>
                            <th>Department</th>
                            <th>Assigned To</th>
                            <th>Team</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${equipment.map(eq => `
                            <tr>
                                <td>${eq.name}</td>
                                <td>${eq.serialNumber}</td>
                                <td>${eq.department}</td>
                                <td>${eq.assignedTo || '-'}</td>
                                <td>${eq.maintenanceTeam}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="viewEquipment('${eq.id}')">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderTeams(container) {
    const teams = await getAllTeams();

    container.innerHTML = `
        <div class="fade-in" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            ${teams.map(team => `
                <div class="stat-card" style="display: block;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 2rem;">${team.icon}</span>
                        <div>
                            <h3 style="font-size: 1.2rem; margin: 0;">${team.name}</h3>
                            <span style="color: var(--text-light); font-size: 0.9rem;">${team.specialization}</span>
                        </div>
                    </div>
                    <p>${team.description}</p>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <strong>Members:</strong> ${team.members.length > 0 ? team.members.length : 'No members assigned'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function renderReports(container) {
    const requests = await getAllRequests();
    const equipment = await getAllEquipment();
    const teams = await getAllTeams();

    // Pivot 1: Requests per Team
    // Group requests by teamId, then map to team names
    const reqsByTeam = {};
    teams.forEach(t => reqsByTeam[t.id] = 0);
    requests.forEach(r => {
        if (reqsByTeam[r.teamId] !== undefined) reqsByTeam[r.teamId]++;
    });

    // Pivot 2: Requests per Category
    // We need to look up equipment category for each request
    const reqsByCategory = {};
    requests.forEach(r => {
        const eq = r.equipment || {};
        if (eq) {
            const cat = eq.category || 'Uncategorized';
            reqsByCategory[cat] = (reqsByCategory[cat] || 0) + 1;
        }
    });

    // CSS-only Bar Chart Generator Helper
    const createBarChart = (dataObj, title, labelMapping = null) => {
        const labels = Object.keys(dataObj);
        const values = Object.values(dataObj);
        const maxVal = Math.max(...values, 1); // Avoid div by zero

        return `
            <div class="stat-card" style="display: block; grid-column: span 1;">
                <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">${title}</h3>
                <div class="bar-chart" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${labels.map((key, index) => {
            const val = values[index];
            const label = labelMapping ? labelMapping(key) : key;
            const percentage = (val / maxVal) * 100;
            return `
                        <div class="bar-row" style="display: flex; align-items: center; gap: 1rem;">
                            <div class="bar-label" style="width: 120px; font-size: 0.9rem; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label}</div>
                            <div class="bar-track" style="flex: 1; background: #eee; height: 12px; border-radius: 6px; overflow: hidden;">
                                <div class="bar-fill" style="width: ${percentage}%; background: var(--primary); height: 100%; border-radius: 6px;"></div>
                            </div>
                            <div class="bar-val" style="width: 30px; font-weight: 700;">${val}</div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    };

    container.innerHTML = `
        <div class="fade-in">
             <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                ${createBarChart(reqsByTeam, 'Requests by Team', (id) => {
        const t = teams.find(team => team.id === id);
        return t ? t.name : 'Unknown';
    })}
                ${createBarChart(reqsByCategory, 'Requests by Equipment Category')}
             </div>

             <div class="recent-activity" style="margin-top: 2rem;">
                <h2>Detailed Breakdown</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Total Requests</th>
                                <th>% of Total</th>
                                <th>Avg Resolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(reqsByCategory).map(cat => {
        const count = reqsByCategory[cat];
        const percent = ((count / requests.length) * 100).toFixed(1);
        return `
                                    <tr>
                                        <td>${cat}</td>
                                        <td>${count}</td>
                                        <td>${percent}%</td>
                                        <td>-</td>
                                    </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    `;
}

// ========================
// LOGIC HANDLERS
// ========================

// Drag & Drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

async function handleDrop(ev, newStatus) {
    ev.preventDefault();
    const requestId = ev.dataTransfer.getData("text");
    const request = await getRequestById(requestId);

    if (request && request.status !== newStatus) {
        // If moving to repaired, ask for duration first
        if (newStatus === 'repaired') {
            pendingRequestId = requestId;
            openModal('durationModal');
            return;
        }

        // Update functionality
        await updateRequestStatus(requestId, newStatus);

        // Handling Scrap Logic
        if (newStatus === 'scrap') {
            const eq = request.equipment || {};
            if (eq.id) {
                await updateEquipment(eq.id, { status: 'scrapped' });
                alert(`Equipment ${eq.name} has been marked as SCRAPPED.`);
            }
        }

        // Re-render
        await switchView('kanban'); // easier way to refresh
    }
}

// Modals
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openCreateRequestModal(dateStr = null) {
    if (dateStr) {
        // Auto-fill date if clicked from calendar
        document.querySelector('input[name="scheduledDate"]').value = dateStr;
        toggleScheduledDate('preventive');
        document.querySelector('select[name="type"]').value = 'preventive';
    }
    openModal('createRequestModal');
}

// Form Handling
async function handleEquipmentSelect(eqId) {
    const alertBox = document.getElementById('equipmentInfoAlert');
    if (!eqId) {
        alertBox.style.display = 'none';
        return;
    }

    const eq = await getEquipmentById(eqId);
    if (eq) {
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
            <strong>Auto-Filled Info:</strong><br>
            Department: ${eq.department}<br>
            Team: ${eq.maintenanceTeam}
        `;
        // In a real app we would assign these hidden fields, 
        // but for now we just verify visual feedback flow
    }
}

function toggleScheduledDate(type) {
    const dateGroup = document.getElementById('scheduledDateGroup');
    if (type === 'preventive') {
        dateGroup.style.display = 'block';
        document.querySelector('input[name="scheduledDate"]').required = true;
    } else {
        dateGroup.style.display = 'none';
        document.querySelector('input[name="scheduledDate"]').required = false;
    }
}

async function populateEquipmentSelect() {
    const select = document.getElementById('requestEquipmentSelect');
    if (!select) return;

    // Reset options
    select.innerHTML = '<option value="">Select Equipment...</option>';

    const equipment = await getAllEquipment();
    equipment.forEach(eq => {
        const opt = document.createElement('option');
        opt.value = eq.id;
        opt.textContent = eq.name;
        select.appendChild(opt);
    });
}

async function handleRequestSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eqId = formData.get('equipmentId');
    const eq = await getEquipmentById(eqId);
    if (!eq) return;

    // Create the Request object
    const newReq = {
        type: formData.get('type'),
        subject: formData.get('subject'),
        description: formData.get('description'),
        equipmentId: eqId,
        department: eq.department, // Auto-fill
        teamId: eq.maintenanceTeam, // Auto-fill
        priority: formData.get('priority'),
        scheduledDate: formData.get('scheduledDate') || new Date().toISOString().split('T')[0]
    };

    try {
        await addMaintenanceRequest(newReq);
        // Close & Refresh
        closeModal('createRequestModal');
        e.target.reset();
        await switchView(currentView); // Refresh current view
        alert('Request Created Successfully!');
    } catch (error) {
        alert('Failed to create request: ' + error.message);
    }
}

// Smart Button Logic
async function viewEquipment(equipmentId) {
    currentEquipmentId = equipmentId;
    const eq = await getEquipmentById(equipmentId);
    const reqs = await getRequestsByEquipment(equipmentId);
    const activeReqs = reqs.filter(r => r.status !== 'repaired' && r.status !== 'scrap').length;

    const content = document.getElementById('equipmentDetailsContent');
    content.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Equipment Name</label>
                <div class="static-val">${eq.name}</div>
            </div>
            <div class="form-group">
                <label>Serial Number</label>
                <div class="static-val">${eq.serialNumber}</div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Department</label>
                <div class="static-val">${eq.department}</div>
            </div>
            <div class="form-group">
                <label>Location</label>
                <div class="static-val">${eq.location}</div>
            </div>
        </div>
        <div class="form-group">
            <label>Current Status</label>
            <span class="badge status-${eq.status === 'broken' ? 'scrap' : 'new'}">${eq.status}</span>
        </div>
    `;

    // Smart Button Badge Update
    document.getElementById('equipmentRequestCount').textContent = activeReqs;

    openModal('viewEquipmentModal');
}

async function openEquipmentRequests() {
    closeModal('viewEquipmentModal');
    const reqs = await getRequestsByEquipment(currentEquipmentId);
    const equipment = await getEquipmentById(currentEquipmentId);

    const tbody = document.getElementById('eqReqTableBody');
    tbody.innerHTML = reqs.map(req => `
        <tr>
            <td>${req.subject}</td>
            <td><span class="badge status-${req.status}">${formatStatus(req.status)}</span></td>
            <td>${req.scheduledDate}</td>
            <td>${req.assignedTo ? 'Tech' : 'Unassigned'}</td>
        </tr>
    `).join('');

    document.getElementById('eqReqTitle').textContent = `Requests for ${equipment.name}`;
    openModal('equipmentRequestsModal');
}

// NEW HANDLERS

// Duration Modal
let pendingRequestId = null;

async function handleDurationSubmit(e) {
    e.preventDefault();
    const duration = parseFloat(new FormData(e.target).get('duration'));

    if (pendingRequestId) {
        try {
            await updateRequest(pendingRequestId, {
                status: 'repaired',
                duration: duration,
                completedDate: new Date().toISOString()
            });
            pendingRequestId = null;
            closeModal('durationModal');
            e.target.reset();
            await switchView('kanban');
            alert('Request marked as Repaired!');
        } catch (error) {
            alert('Failed to update request: ' + error.message);
        }
    }
}

// Technician Assignment
async function assignRequestToMe(requestId) {
    // Get current user from local storage (set during login)
    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert('You must be logged in to assign requests!');
        return;
    }

    try {
        await assignRequest(requestId, currentUser.id);
        await switchView('kanban');
        alert(`Assigned to ${currentUser.name}`);
    } catch (error) {
        alert('Failed to assign request: ' + error.message);
    }
}

// Request Detail Modal
async function viewRequestDetail(requestId) {
    const req = await getRequestById(requestId);
    if (!req) return;

    const eq = await getEquipmentById(req.equipmentId);
    const assignedUser = req.assignedTo ? await getUserById(req.assignedTo) : null;
    const team = await getTeamById(req.teamId);

    const content = document.getElementById('requestDetailContent');
    content.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Subject</label>
                <div class="static-val">${req.subject}</div>
            </div>
            <div class="form-group">
                <label>Type</label>
                <div class="static-val">${req.type}</div>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <div class="static-val">${req.description || '-'}</div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Equipment</label>
                <div class="static-val">${eq ? eq.name : 'Unknown'}</div>
            </div>
            <div class="form-group">
                <label>Department</label>
                <div class="static-val">${req.department}</div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Team</label>
                <div class="static-val">${team ? team.name : req.teamId}</div>
            </div>
            <div class="form-group">
                <label>Assigned To</label>
                <div class="static-val">${assignedUser ? assignedUser.name : 'Unassigned'}</div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Status</label>
                <span class="badge status-${req.status}">${formatStatus(req.status)}</span>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <span class="card-priority priority-${req.priority}">${req.priority}</span>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Scheduled Date</label>
                <div class="static-val">${req.scheduledDate}</div>
            </div>
            ${req.duration ? `
            <div class="form-group">
                <label>Duration</label>
                <div class="static-val">${req.duration} hours</div>
            </div>
            ` : ''}
        </div>
    `;

    openModal('requestDetailModal');
}

// Equipment CRUD
async function openAddEquipmentModal() {
    const select = document.getElementById('equipmentTeamSelect');
    if (select) {
        select.innerHTML = '';
        const teams = await getAllTeams();
        teams.forEach(team => {
            const opt = document.createElement('option');
            opt.value = team.id;
            opt.textContent = team.name;
            select.appendChild(opt);
        });
    }
    openModal('addEquipmentModal');
}

async function handleEquipmentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newEq = {
        name: formData.get('name'),
        serialNumber: formData.get('serialNumber'),
        category: formData.get('category'),
        department: formData.get('department'),
        location: formData.get('location'),
        assignedTo: formData.get('assignedTo') || null,
        maintenanceTeam: formData.get('maintenanceTeam'),
        purchaseDate: formData.get('purchaseDate') || null,
        warrantyExpiry: formData.get('warrantyExpiry') || null
    };

    try {
        await addEquipment(newEq);
        closeModal('addEquipmentModal');
        e.target.reset();
        await populateEquipmentSelect(); // Refresh dropdowns
        await switchView('equipment');
        alert('Equipment added successfully!');
    } catch (error) {
        alert('Failed to add equipment: ' + error.message);
    }
}

// Helpers
// Helpers
function formatStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar(document.getElementById('view-container'));
}

function setupEventListeners() {
    // Search listener - now actually filters!
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }
}

function handleSearch(query) {
    if (!query || query.length < 2) {
        // Too short, don't filter
        return;
    }

    const lowerQuery = query.toLowerCase();

    // Filter based on current view
    if (currentView === 'equipment') {
        filterEquipment(lowerQuery);
    } else if (currentView === 'kanban') {
        filterRequests(lowerQuery);
    } else if (currentView === 'teams') {
        filterTeams(lowerQuery);
    }
}

function filterEquipment(query) {
    const equipment = getAllEquipment();
    const filtered = equipment.filter(eq =>
        eq.name.toLowerCase().includes(query) ||
        eq.department.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) ||
        (eq.assignedTo && eq.assignedTo.toLowerCase().includes(query))
    );

    // Re-render with filtered data
    const container = document.getElementById('view-container');
    container.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <div style="color: var(--text-light);">Showing ${filtered.length} of ${equipment.length} equipment</div>
                <button class="btn btn-primary" onclick="openAddEquipmentModal()">+ Add Equipment</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Serial #</th>
                            <th>Department</th>
                            <th>Assigned To</th>
                            <th>Team</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(eq => `
                            <tr>
                                <td>${eq.name}</td>
                                <td>${eq.serialNumber}</td>
                                <td>${eq.department}</td>
                                <td>${eq.assignedTo || '-'}</td>
                                <td>${eq.maintenanceTeam}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="viewEquipment('${eq.id}')">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function filterRequests(query) {
    const requests = getAllRequests();
    const filtered = requests.filter(req =>
        req.subject.toLowerCase().includes(query) ||
        (req.description && req.description.toLowerCase().includes(query)) ||
        req.department.toLowerCase().includes(query)
    );

    // Re-render Kanban with filtered requests
    const container = document.getElementById('view-container');
    const columns = [
        { id: 'new', title: 'New' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'repaired', title: 'Repaired' },
        { id: 'scrap', title: 'Scrap' }
    ];

    const board = document.createElement('div');
    board.className = 'kanban-board fade-in';

    const searchInfo = document.createElement('div');
    searchInfo.style.cssText = 'margin-bottom: 1rem; color: var(--text-light);';
    searchInfo.textContent = `Showing ${filtered.length} of ${requests.length} requests`;
    container.innerHTML = '';
    container.appendChild(searchInfo);

    columns.forEach(col => {
        const columnEl = document.createElement('div');
        columnEl.className = 'kanban-column';
        const colRequests = filtered.filter(r => r.status === col.id);
        columnEl.innerHTML = `
            <div class="kanban-header">
                <span>${col.title}</span>
                <span class="count">${colRequests.length}</span>
            </div>
            <div class="kanban-list" id="col-${col.id}" ondrop="handleDrop(event, '${col.id}')" ondragover="allowDrop(event)">
                ${colRequests.map(createKanbanCard).join('')}
            </div>
        `;
        board.appendChild(columnEl);
    });

    container.appendChild(board);
}

function filterTeams(query) {
    const teams = getAllTeams();
    const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query) ||
        team.specialization.toLowerCase().includes(query)
    );

    const container = document.getElementById('view-container');
    container.innerHTML = `
        <div class="fade-in">
            <div style="margin-bottom: 1rem; color: var(--text-light);">Showing ${filtered.length} of ${teams.length} teams</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${filtered.map(team => `
                    <div class="stat-card" style="display: block; cursor: pointer;" onclick="viewTeamDetail('${team.id}')">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">${team.icon}</span>
                            <div>
                                <h3 style="font-size: 1.2rem; margin: 0;">${team.name}</h3>
                                <span style="color: var(--text-light); font-size: 0.9rem;">${team.specialization}</span>
                            </div>
                        </div>
                        <p>${team.description}</p>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <strong>Members:</strong> ${team.members.length > 0 ? team.members.length : 'No members assigned'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Team Detail Modal
async function viewTeamDetail(teamId) {
    const team = await getTeamById(teamId);
    if (!team) return;

    const allUsers = await getAllUsers();
    // team.members contains populated user objects from API
    const teamMembers = team.members || [];
    const memberIds = teamMembers.map(m => m.id);
    const nonMembers = allUsers.filter(u => !memberIds.includes(u.id));

    const content = document.getElementById('teamDetailContent');
    content.innerHTML = `
        <div class="form-row" style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 3rem;">${team.icon}</span>
                <div>
                    <h3 style="margin: 0;">${team.name}</h3>
                    <p style="color: var(--text-light); margin: 0.5rem 0;">${team.description}</p>
                    <span class="badge" style="background: var(--info); color: white; padding: 0.3rem 0.6rem;">${team.specialization}</span>
                </div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1rem;">Team Members (${teamMembers.length})</h3>
        <div class="table-container" style="margin-bottom: 1.5rem;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${teamMembers.length > 0 ? teamMembers.map(member => `
                        <tr>
                            <td>${member.name}</td>
                            <td>${member.email}</td>
                            <td><span class="badge" style="background: var(--success); color: white; padding: 0.2rem 0.5rem;">${member.role}</span></td>
                            <td>
                                <button class="btn-sm" onclick="removeFromTeam('${teamId}', '${member.id}')" style="background: var(--danger); color: white; border: none;">Remove</button>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No members assigned yet</td></tr>'}
                </tbody>
            </table>
        </div>
        
        ${nonMembers.length > 0 ? `
        <h3 style="margin-bottom: 1rem;">Add Member</h3>
        <div class="form-group">
            <select id="newMemberSelect" class="form-control">
                <option value="">Select a user to add...</option>
                ${nonMembers.map(user => `
                    <option value="${user.id}">${user.name} (${user.role})</option>
                `).join('')}
            </select>
        </div>
        <button class="btn btn-primary" onclick="addToTeam('${teamId}')">Add to Team</button>
        ` : '<p style="color: var(--text-light);">All users are already assigned to this team.</p>'}
    `;

    document.getElementById('teamDetailTitle').textContent = `${team.name} - Team Management`;
    openModal('teamDetailModal');
}

async function addToTeam(teamId) {
    const select = document.getElementById('newMemberSelect');
    const userId = select.value;

    if (!userId) {
        alert('Please select a user');
        return;
    }

    try {
        await addTeamMember(teamId, userId);
        closeModal('teamDetailModal');
        await switchView('teams');
        alert('Member added successfully!');
    } catch (error) {
        alert('Failed to add member: ' + error.message);
    }
}

async function removeFromTeam(teamId, userId) {
    if (confirm('Remove this member from the team?')) {
        try {
            await removeTeamMember(teamId, userId);
            closeModal('teamDetailModal');
            await switchView('teams');
            alert('Member removed successfully!');
        } catch (error) {
            alert('Failed to remove member: ' + error.message);
        }
    }
}
