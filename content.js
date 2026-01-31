function transformUI() {
    const originalTable = document.querySelector("table");
    if (!originalTable || document.getElementById('odyssey-dashboard')) return;

    // Wrap original table
    originalTable.id = "assessment-schedule-original";
    originalTable.style.display = "none";

    // Build Dashboard Structure
    const dashboard = document.createElement('div');
    dashboard.id = 'odyssey-dashboard';

    // Inject Toggle Button into Controls
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <div class="controls">
                <button id="hidePastBtn">Show Past</button>
                <div style="position: relative;">
                    <button id="courseFilterBtn">All Courses</button>
                    <div id="courseDropdown" class="dropdown-menu" style="display: none;">
                        <div class="dropdown-item" data-value="all">All Courses</div>
                        <div class="dropdown-item" data-value="MATH 136">MATH 136</div>
                        <div class="dropdown-item" data-value="MATH 138">MATH 138</div>
                        <div class="dropdown-item" data-value="CS 136">CS 136</div>
                    </div>
                </div>
                <button id="exportCalendar" class="secondary-btn">Export Calendar</button>
            </div>
        </div>

        <div class="section-title" id="past-section-title" style="display: none;">Past Assessments</div>
        <div id="past-assessments-container"></div>

        <div class="section-title" id="next-up-title">Next Up By Subject</div>
        <div id="next-by-subject-container"></div>

        <div class="section-title">Upcoming Schedule</div>
        <div id="upcoming-list-container"></div>
    `;

    // Modal Structure (Moved to Body for correct centering)
    // Remove existing modal if any (sanity check)
    const existingModal = document.getElementById('assessment-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'assessment-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div id="modal-details"></div>
        </div>
    `;
    document.body.appendChild(modal);

    originalTable.parentNode.insertBefore(dashboard, originalTable);

    // State
    let currentFilter = "all";
    let hidePastState = true;

    // Event Listeners for Custom Controls
    const courseBtn = document.getElementById('courseFilterBtn');
    const courseDropdown = document.getElementById('courseDropdown');
    const hidePastBtn = document.getElementById('hidePastBtn');
    const exportBtn = document.getElementById('exportCalendar');

    // Toggle Dropdown
    courseBtn.onclick = (e) => {
        e.stopPropagation();
        courseDropdown.style.display = courseDropdown.style.display === 'none' ? 'block' : 'none';
        courseBtn.classList.toggle('active');
    };

    // Dropdown Selection
    courseDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.onclick = (e) => {
            currentFilter = e.target.getAttribute('data-value');
            courseBtn.innerText = e.target.textContent; // Use textContent to get raw text
            courseDropdown.style.display = 'none';
            courseBtn.classList.remove('active');
            renderDashboard(scrapeData(), currentFilter, hidePastState);
        };
    });

    // Close Dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!courseBtn.contains(e.target) && !courseDropdown.contains(e.target)) {
            courseDropdown.style.display = 'none';
            courseBtn.classList.remove('active');
        }
    });

    // Toggle Hide Past
    hidePastBtn.onclick = () => {
        hidePastState = !hidePastState;
        hidePastBtn.innerText = hidePastState ? "Show Past" : "Hide Past";
        renderDashboard(scrapeData(), currentFilter, hidePastState);
    };

    // Fix Export: Use FRESH data
    exportBtn.onclick = () => {
        const currentData = scrapeData(); // Get fresh data
        exportToCalendar(currentData);
    };

    // Initial Render
    renderDashboard(scrapeData(), currentFilter, hidePastState);

    // Modal Close Listeners (Fixed)
    modal.onclick = (e) => {
        if (e.target === modal || e.target.closest('.modal-close')) {
            modal.classList.remove('open');
        }
    }
}

function scrapeData() {
    const rows = Array.from(document.querySelectorAll("#assessment-schedule-original tr")).slice(1);
    const now = new Date();

    return rows.map(row => {
        const cells = row.querySelectorAll("td");
        const whenText = cells[2].textContent.trim();
        const course = cells[0].textContent.split(' ').slice(0, 2).join(' ');
        const name = cells[0].textContent.split(' ').slice(2).join(' ');
        let dateObj = null;
        let endDateObj = null;

        if (!whenText.includes("TBA") && (whenText.includes("-") || whenText.includes("–"))) {
            const parts = whenText.split(/\s+/);
            const timePart = parts[1];
            const [startTime, endTime] = timePart.split(/[–-]/);

            dateObj = new Date(`${parts[0]}T${startTime}`);
            endDateObj = new Date(`${parts[0]}T${endTime}`);
        }

        const location = cells[3].textContent.trim();
        const isTBA = location.toUpperCase() === "TBA";
        const isOngoing = dateObj && endDateObj && now >= dateObj && now <= endDateObj;
        const isPast = endDateObj ? endDateObj < now : (dateObj ? dateObj < now : false);

        // Detect Exam Types
        const lowerName = name.toLowerCase();
        const isFinal = lowerName.includes('final');
        const isMidterm = lowerName.includes('midterm') || lowerName.includes('test');

        return {
            id: `${course}-${name}-${whenText}`,
            course: course,
            name: name,
            fullTime: whenText,
            location: isTBA ? "TBA" : location,
            seat: isTBA ? "" : cells[4].textContent,
            date: dateObj,
            endDate: endDateObj,
            isOngoing: isOngoing,
            isPast: isPast,
            isFinal: isFinal,
            isMidterm: isMidterm
        };
    });
}

function renderDashboard(data, filter = "all", hidePast = true) {
    const pastContainer = document.getElementById('past-assessments-container');
    const pastSectionTitle = document.getElementById('past-section-title');
    const nextContainer = document.getElementById('next-by-subject-container');
    const listContainer = document.getElementById('upcoming-list-container');
    const nextUpTitle = document.getElementById('next-up-title');

    // Update Title based on filter
    if (filter === 'all') {
        nextUpTitle.innerText = "Next Up By Subject";
    } else {
        nextUpTitle.innerText = "Next Up";
    }

    pastContainer.innerHTML = '';
    nextContainer.innerHTML = '';
    listContainer.innerHTML = '';

    // Filter by course
    let filteredData = data.filter(item => {
        if (filter !== "all" && !item.course.includes(filter)) return false;
        return true;
    });

    // Separate past and future assessments
    const pastAssessments = filteredData.filter(item => item.isPast);
    const futureAssessments = filteredData.filter(item => !item.isPast);

    // 0. Past Assessments Section
    if (!hidePast && pastAssessments.length > 0) {
        pastSectionTitle.style.display = 'flex';
        pastContainer.style.display = 'grid'; // Ensure grid is restored
        pastAssessments.sort((a, b) => (b.date || 0) - (a.date || 0));

        pastAssessments.forEach(item => {
            const card = document.createElement('div');
            let className = 'highlight-card past';
            if (item.isFinal) className += ' final';
            else if (item.isMidterm) className += ' midterm';

            card.className = className;
            card.onclick = () => openModal(item);

            const displayTime = item.fullTime.split(' ')[1] || item.fullTime;

            // Skull Icons
            let iconsHtml = '';
            const skullIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17l-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`;

            if (item.isFinal) {
                iconsHtml = `<div class="exam-icons">${skullIcon}${skullIcon}</div>`;
            } else if (item.isMidterm) {
                iconsHtml = `<div class="exam-icons">${skullIcon}</div>`;
            }

            card.innerHTML = `
                ${iconsHtml}
                <div class="h-course">${item.course}</div>
                <div class="h-name">${item.name}</div>
                <div class="h-time">
                    <span>🕒</span> ${displayTime}
                </div>
                <div class="h-time">
                    <span>📍</span> ${item.location}
                </div>
                <div class="h-countdown">Completed</div>
            `;
            pastContainer.appendChild(card);
        });
    } else {
        pastSectionTitle.style.display = 'none';
        pastContainer.style.display = 'none'; // CRITICAL: Hide container to collapse margins
    }

    // 1. Next by Subject - Logic (only future assessments)
    const nextBySubject = {};
    futureAssessments.forEach(item => {
        if (!item.date) return;
        if (!nextBySubject[item.course] || item.date < nextBySubject[item.course].date) {
            nextBySubject[item.course] = item;
        }
    });

    const nextUpIds = new Set();
    Object.values(nextBySubject).forEach(item => {
        nextUpIds.add(item.id);
        const card = document.createElement('div');
        let className = `highlight-card ${item.isOngoing ? 'ongoing' : ''}`;
        if (item.isFinal) className += ' final';
        else if (item.isMidterm) className += ' midterm';

        card.className = className;
        card.onclick = () => openModal(item);

        const displayTime = item.fullTime.split(' ')[1] || item.fullTime;

        let iconsHtml = '';
        const skullIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17l-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`;

        if (item.isFinal) {
            iconsHtml = `<div class="exam-icons">${skullIcon}${skullIcon}</div>`;
        } else if (item.isMidterm) {
            iconsHtml = `<div class="exam-icons">${skullIcon}</div>`;
        }

        let dateDisplay = "TBA";
        if (item.date) {
            const month = item.date.toLocaleString('en-US', { month: 'short' });
            const day = item.date.getDate();
            dateDisplay = `${month} ${day}`;
        }

        card.innerHTML = `
            ${iconsHtml}
            <div class="h-course">${item.course}</div>
            <div class="h-name">${item.name}</div>
            <div class="h-time">
                <span>🗓️</span> ${dateDisplay}
            </div>
            <div class="h-time">
                <span>🕒</span> ${displayTime}
            </div>
            <div class="h-time">
                <span>📍</span> ${item.location}
            </div>
            <div class="h-countdown">${getCountdown(item)}</div>
        `;
        nextContainer.appendChild(card);
    });

    // 2. Upcoming List
    const upcomingToShow = futureAssessments.filter(item => {
        if (nextUpIds.has(item.id)) return false;
        return true;
    });

    upcomingToShow.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date - b.date;
    });

    upcomingToShow.forEach(item => {
        const row = document.createElement('div');
        let className = 'assessment-row';
        if (item.isFinal) className += ' final';
        else if (item.isMidterm) className += ' midterm';

        row.className = className;
        row.onclick = () => openModal(item);

        let dateBlock = `<div class="row-date">TBA</div>`;
        if (item.date) {
            const month = item.date.toLocaleString('en-US', { month: 'short' });
            const day = item.date.getDate();
            dateBlock = `
                <div class="row-date">
                    <span class="date-month">${month}</span>
                    <span class="date-day">${day}</span>
                </div>
            `;
        }

        const displayTime = item.fullTime.split(' ')[1] || 'TBA';

        row.innerHTML = `
            <div class="row-left">
                ${dateBlock}
                <div class="row-info">
                    <div class="row-course">${item.course}</div>
                    <div class="row-name">${item.name}</div>
                    <div class="row-meta">
                        <span>🕒 ${displayTime}</span>
                        <span>📍 ${item.location}</span>
                    </div>
                </div>
            </div>
            <div class="row-right">
                <div class="row-countdown">${getCountdown(item, true)}</div>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

function openModal(item) {
    const modal = document.getElementById('assessment-modal');
    const modalContent = modal.querySelector('.modal-content');
    const container = document.getElementById('modal-details');
    if (!container) return;

    // Apply exam styling to modal
    modalContent.classList.remove('final', 'midterm');
    if (item.isFinal) {
        modalContent.classList.add('final');
    } else if (item.isMidterm) {
        modalContent.classList.add('midterm');
    }

    const statusColor = item.isOngoing ? '#dc3545' : '#0d6efd';
    const statusText = item.isOngoing ? 'Ongoing Now' : getCountdown(item);

    container.innerHTML = `
        <div class="modal-header">
            <div class="modal-course">${item.course}</div>
            <div class="modal-title">${item.name}</div>
        </div>
        <div class="modal-body">
            <div class="modal-detail-item">
                <span class="modal-label">Date & Time</span>
                <span class="modal-value">${item.fullTime}</span>
            </div>
             <div class="modal-detail-item">
                <span class="modal-label">Location</span>
                <span class="modal-value">${item.location}</span>
            </div>
            <div class="modal-detail-item">
                <span class="modal-label">Seat Assignment</span>
                <span class="modal-value">${item.seat || 'N/A'}</span>
            </div>
             <div class="modal-detail-item">
                <span class="modal-label">Status</span>
                <span class="modal-value" style="color: ${statusColor}">
                    ${statusText}
                </span>
            </div>
        </div>
    `;

    modal.classList.add('open');
}

function getCountdown(item, short = false) {
    if (!item.date) return "TBA";

    const now = new Date();
    if (item.isOngoing) {
        if (item.endDate) {
            const timeLeft = item.endDate - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            return short ? "Ongoing" : `Ongoing: ${hours}h ${mins}m left`;
        }
        return "Ongoing Now";
    }

    const diff = item.date - now;
    if (diff < 0) return "Completed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (short) {
        if (days > 0) return `${days}d left`;
        return `${hours}h left`;
    }

    if (days > 0) return `${days} days, ${hours} hours left`;
    return `${hours} hours left`;
}

function exportToCalendar(data) {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//OdysseyEnhancer//NONSGML v1.0//EN\n";

    data.forEach(item => {
        if (!item.date || item.location === "TBA") return;

        const start = item.date;
        const end = item.endDate || new Date(start.getTime() + 2 * 60 * 60 * 1000);

        const formatICSDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART:${formatICSDate(start)}\n`;
        icsContent += `DTEND:${formatICSDate(end)}\n`;
        icsContent += `SUMMARY:${item.course} - ${item.name}\n`;
        icsContent += `DESCRIPTION:Seat: ${item.seat || 'N/A'}\n`;
        icsContent += `LOCATION:${item.location}\n`;
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'odyssey_schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

transformUI();