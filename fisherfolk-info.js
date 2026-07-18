(function () {
    var PASSWORD = "bantay";
    var STORAGE_KEY = "bantay-dagat-authenticated";
    var FISHERFOLK_STORAGE_KEY = "bantay-dagat-fisherfolk-record";
    var FISHERFOLK_DATABASE_KEY = "bantay-dagat-fisherfolk-database";
    var FISHERFOLK_ARCHIVE_KEY = "bantay-dagat-fisherfolk-archive";

    var loginScreen = document.getElementById("loginScreen");
    var dashboardShell = document.getElementById("dashboardShell");
    var loginForm = document.getElementById("loginForm");
    var passwordInput = document.getElementById("password");
    var loginError = document.getElementById("loginError");
    var logoutButton = document.getElementById("logoutButton");

    var registerFormModal = document.getElementById("registerFormModal");
    var btnRegisterLocalFisherman = document.getElementById("btnRegisterLocalFisherman");
    var formModalCloseButton = document.getElementById("formModalCloseButton");
    var formModalOverlay = document.getElementById("formModalOverlay");
    var formResetButton = document.getElementById("formResetButton");

    var fisherfolkForm = document.getElementById("fisherfolkForm");
    var fisherfolkStatus = document.getElementById("fisherfolkStatus");
    var birthdateField = document.getElementById("birthdateField");
    var ageField = document.getElementById("ageField");

    var fisherfolkTableBody = document.getElementById("fisherfolkTableBody");
    var archiveTableBody = document.getElementById("archiveTableBody");
    var emptyArchiveState = document.getElementById("emptyArchiveState");

    var fisherfolkDetailModal = document.getElementById("fisherfolkDetailModal");
    var modalCloseButton = document.getElementById("modalCloseButton");
    var modalOverlay = document.getElementById("modalOverlay");

    var filterButtons = document.querySelectorAll(".filter-button");
    var directorySearchInput = document.getElementById("directorySearchInput");
    var currentBarangayFilter = "all";

    var defaultFisherfolkDatabase = [
        {
            completeName: "Juan Dela Cruz Jr.",
            address: "Purok 2, Sitio Proper",
            barangay: "Patao",
            birthdate: "1987-06-14",
            age: 38,
            gender: "Male",
            vesselType: "Small Scale",
            vesselName: "M/B Pag-asa",
            boatNumber: "BTY-PAT-014",
            permitNumber: "BD-BAN-2026-0014",
            captureMethod: "Pamasol / Panagat",
            contactNumber: "+63 917 555 1024",
            registrationStatus: "Active"
        },
        {
            completeName: "Elpidio Reyes",
            address: "Purok 1, Silang",
            barangay: "Patao",
            birthdate: "1980-11-08",
            age: 45,
            gender: "Male",
            vesselType: "Medium Scale",
            vesselName: "M/B Sea Hawk",
            boatNumber: "BTY-PAT-035",
            permitNumber: "BD-BAN-2026-0215",
            captureMethod: "Motorized Net Fishing",
            contactNumber: "+63 918 333 4455",
            registrationStatus: "For Renewal"
        },
        {
            completeName: "Rosa Aquino",
            address: "Purok 3, Ligaya",
            barangay: "Guiwanon",
            birthdate: "1995-07-19",
            age: 30,
            gender: "Female",
            vesselType: "Small Scale",
            vesselName: "M/B Aurora",
            boatNumber: "BTY-GUI-042",
            permitNumber: "BD-BAN-2026-1187",
            captureMethod: "Bubo",
            contactNumber: "+63 918 234 5678",
            registrationStatus: "Pending Verification"
        }
    ];

    function displayCurrentDate() {
        var today = new Date();
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var currentDateDisplay = document.getElementById("currentDateDisplay");
        if (currentDateDisplay) {
            currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    function calculateAge(value) {
        if (!value) return "";
        var today = new Date();
        var birthDate = new Date(value);
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age -= 1;
        }
        return age >= 0 ? age : "";
    }

    function syncAge() {
        ageField.value = calculateAge(birthdateField.value);
    }

    function saveFisherfolkInfo() {
        var formData = new FormData(fisherfolkForm);
        var data = {};
        formData.forEach(function (value, key) {
            data[key] = value;
        });
        localStorage.setItem(FISHERFOLK_STORAGE_KEY, JSON.stringify(data));
        fisherfolkStatus.textContent = "Saved draft";
    }

    function loadFisherfolkInfo() {
        var stored = localStorage.getItem(FISHERFOLK_STORAGE_KEY);
        if (!stored) {
            syncAge();
            return;
        }
        try {
            var data = JSON.parse(stored);
            Object.keys(data).forEach(function (key) {
                var field = fisherfolkForm.elements[key];
                if (field) {
                    field.value = data[key];
                }
            });
            fisherfolkStatus.textContent = "Edit";
        } catch (error) {
            fisherfolkStatus.textContent = "Ready to edit";
        }
        syncAge();
    }

    // ════ DB-BACKED STORAGE ════
    var dbRecords = []; // in-memory cache from API
    var currentEditingId = null;

    async function loadFromDb() {
        try {
            var res = await fetch('/api/fisherfolk');
            dbRecords = await res.json();
        } catch (e) {
            dbRecords = [];
        }
        populateFisherfolkTable();
        populateArchiveTable();
    }

    function getFisherfolkDatabase() {
        return dbRecords;
    }

    async function saveFisherfolkToDatabase() {
        var formData = new FormData(fisherfolkForm);
        var dto = {};
        formData.forEach(function (value, key) { dto[key] = value; });
        // camelCase keys for DTO
        var payload = {
            completeName:       dto.completeName,
            address:            dto.address,
            barangay:           dto.barangay,
            birthdate:          dto.birthdate,
            age:                parseInt(dto.age) || 0,
            gender:             dto.gender,
            vesselType:         dto.vesselType,
            vesselName:         dto.vesselName,
            boatNumber:         dto.boatNumber,
            permitNumber:       dto.permitNumber,
            captureMethod:      dto.captureMethod,
            contactNumber:      dto.contactNumber,
            registrationStatus: dto.registrationStatus
        };
        try {
            if (currentEditingId) {
                await fetch('/api/fisherfolk/' + currentEditingId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch('/api/fisherfolk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            await loadFromDb(); // refresh table from DB
        } catch (e) {
            alert('Failed to save record. Please check your connection.');
        }
    }

    function populateFisherfolkTable() {
        var database = getFisherfolkDatabase();
        var searchQuery = directorySearchInput.value.toLowerCase().trim();
        fisherfolkTableBody.innerHTML = "";

        database.forEach(function (record, index) {
            if (currentBarangayFilter !== "all" && record.barangay !== currentBarangayFilter) {
                return;
            }

            if (searchQuery) {
                var nameMatch = (record.completeName || "").toLowerCase().indexOf(searchQuery) > -1;
                var contactMatch = ((record.contactNumber || "").toLowerCase().indexOf(searchQuery) > -1);
                var regMatch = ((record.permitNumber || "").toLowerCase().indexOf(searchQuery) > -1);
                var boatMatch = ((record.boatNumber || "").toLowerCase().indexOf(searchQuery) > -1);
                var vesselMatch = ((record.vesselName || "").toLowerCase().indexOf(searchQuery) > -1);

                if (!nameMatch && !contactMatch && !regMatch && !boatMatch && !vesselMatch) {
                    return;
                }
            }

            var statusClass = "";
            var statusText = "";
            if (record.registrationStatus === "Active" || record.registrationStatus === "Licensed") {
                statusClass = "status-active";
                statusText = "Active";
            } else {
                statusClass = "status-inactive";
                statusText = "Inactive";
            }

            var row = document.createElement("tr");
            row.innerHTML =
                '<td class="owner-name">' + record.completeName + '</td>' +
                '<td>Barangay ' + record.barangay + '</td>' +
                '<td>' +
                    '<div class="vessel-cell">' +
                        '<svg class="vessel-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M3 18l1.5-4h15l1.5 4H3zM12 4v10M9 6l3-2 3 2" />' +
                        '</svg>' +
                        '<span>' + (record.vesselName || record.vesselType || "-") + '</span>' +
                    '</div>' +
                '</td>' +
                '<td class="reg-code-cell">' + (record.permitNumber || record.boatNumber || "-") + '</td>' +
                '<td>' +
                    '<div class="mobile-cell">' +
                        '<svg class="phone-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />' +
                        '</svg>' +
                        '<span>' + (record.contactNumber || "-") + '</span>' +
                    '</div>' +
                '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td style="text-align: center;">' +
                    '<button class="edit-btn" type="button" data-index="' + index + '" title="Edit Record" style="margin-right: 5px;">' +
                        '<svg class="edit-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>' +
                        '</svg>' +
                    '</button>' +
                    '<button class="delete-btn" type="button" data-index="' + index + '" title="Archive Record">' +
                        '<svg class="trash-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />' +
                        '</svg>' +
                    '</button>' +
                '</td>';

            row.addEventListener("click", function (event) {
                var editBtn = event.target.closest(".edit-btn");
                var deleteBtn = event.target.closest(".delete-btn");
                
                if (editBtn) {
                    var indexToEdit = parseInt(editBtn.getAttribute("data-index"));
                    editFisherfolk(indexToEdit);
                    event.stopPropagation();
                } else if (deleteBtn) {
                    var indexToArchive = parseInt(deleteBtn.getAttribute("data-index"));
                    archiveFisherfolk(indexToArchive);
                    event.stopPropagation();
                } else {
                    showFisherfolkDetail(index);
                }
            });

            fisherfolkTableBody.appendChild(row);
        });
    }

    function editFisherfolk(index) {
        var database = getFisherfolkDatabase();
        var record = database[index];
        if (!record) return;

        currentEditingId = record.id;
        
        fisherfolkForm.elements["completeName"].value = record.completeName || "";
        fisherfolkForm.elements["address"].value = record.address || "";
        fisherfolkForm.elements["barangay"].value = record.barangay || "";
        fisherfolkForm.elements["birthdate"].value = record.birthdate || "";
        fisherfolkForm.elements["age"].value = record.age || "";
        fisherfolkForm.elements["gender"].value = record.gender || "";
        fisherfolkForm.elements["vesselType"].value = record.vesselType || "";
        fisherfolkForm.elements["vesselName"].value = record.vesselName || "";
        fisherfolkForm.elements["boatNumber"].value = record.boatNumber || "";
        fisherfolkForm.elements["permitNumber"].value = record.permitNumber || "";
        fisherfolkForm.elements["captureMethod"].value = record.captureMethod || "";
        fisherfolkForm.elements["contactNumber"].value = record.contactNumber || "";
        fisherfolkForm.elements["registrationStatus"].value = record.registrationStatus || "";

        var titleEl = document.querySelector("#registerFormModal h2");
        if (titleEl) titleEl.textContent = "Edit Fisherfolk Info";

        fisherfolkStatus.textContent = "Editing Mode";
        syncAge();
        registerFormModal.classList.remove("hidden");
    }

    function showFisherfolkDetail(index) {
        var database = getFisherfolkDatabase();
        var record = database[index];
        if (!record) return;

        document.getElementById("detailName").textContent = record.completeName || "-";
        document.getElementById("detailAge").textContent = record.age || "-";
        document.getElementById("detailGender").textContent = record.gender || "-";
        document.getElementById("detailAddress").textContent = record.address || "-";
        document.getElementById("detailBarangay").textContent = record.barangay || "-";
        document.getElementById("detailContact").textContent = record.contactNumber || "-";
        document.getElementById("detailBirthdate").textContent = record.birthdate || "-";
        document.getElementById("detailVesselName").textContent = record.vesselName || "-";
        document.getElementById("detailVesselType").textContent = record.vesselType || "-";
        document.getElementById("detailBoatNumber").textContent = record.boatNumber || "-";
        document.getElementById("detailPermit").textContent = record.permitNumber || "-";
        document.getElementById("detailMethod").textContent = record.captureMethod || "-";

        var statusElement = document.getElementById("detailStatus");
        statusElement.className = "detail-value status-badge";

        if (record.registrationStatus === "Active") {
            statusElement.textContent = "Licensed";
            statusElement.classList.add("status-active");
        } else if (record.registrationStatus === "For Renewal") {
            statusElement.textContent = "Pending Renewal";
            statusElement.classList.add("status-renewal");
        } else if (record.registrationStatus === "Pending Verification") {
            statusElement.textContent = "Pending Verification";
            statusElement.classList.add("status-pending");
        } else {
            statusElement.textContent = "Inactive";
            statusElement.classList.add("status-inactive");
        }

        fisherfolkDetailModal.classList.remove("hidden");
    }

    function closeFisherfolkDetail() {
        fisherfolkDetailModal.classList.add("hidden");
    }

    function getArchive() {
        var stored = localStorage.getItem(FISHERFOLK_ARCHIVE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                return [];
            }
        }
        return [];
    }

    function saveArchive(archive) {
        localStorage.setItem(FISHERFOLK_ARCHIVE_KEY, JSON.stringify(archive));
    }

    async function archiveFisherfolk(index) {
        var database = getFisherfolkDatabase();
        if (index < 0 || index >= database.length) return;
        var record = database[index];

        if (!confirm("Are you sure you want to delete this fisherfolk record?")) return;

        // Delete from DB if it has an id
        if (record.id) {
            try {
                await fetch('/api/fisherfolk/' + record.id, { method: 'DELETE' });
            } catch (e) { /* ignore */ }
        }

        // Keep in local archive for display
        var archive = getArchive();
        archive.push(record);
        saveArchive(archive);

        await loadFromDb();
        populateArchiveTable();
    }

    function deletePermanently(archiveIndex) {
        if (confirm("Are you sure you want to permanently delete this record? This action cannot be undone.")) {
            var archive = getArchive();
            if (archiveIndex < 0 || archiveIndex >= archive.length) return;

            archive.splice(archiveIndex, 1);
            saveArchive(archive);
            populateArchiveTable();
        }
    }

    function populateArchiveTable() {
        var archive = getArchive();
        archiveTableBody.innerHTML = "";
        if (archive.length === 0) {
            emptyArchiveState.style.display = "block";
            return;
        }

        emptyArchiveState.style.display = "none";
        archive.forEach(function (record, index) {
            var statusClass = "";
            var statusText = "";
            if (record.registrationStatus === "Active" || record.registrationStatus === "Licensed") {
                statusClass = "status-active";
                statusText = "Active";
            } else {
                statusClass = "status-inactive";
                statusText = "Inactive";
            }

            var row = document.createElement("tr");
            row.innerHTML =
                '<td class="owner-name">' + record.completeName + '</td>' +
                '<td>Barangay ' + record.barangay + '</td>' +
                '<td>' +
                    '<div class="vessel-cell">' +
                        '<svg class="vessel-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M3 18l1.5-4h15l1.5 4H3zM12 4v10M9 6l3-2 3 2" />' +
                        '</svg>' +
                        '<span>' + (record.vesselName || record.vesselType || "-") + '</span>' +
                    '</div>' +
                '</td>' +
                '<td class="reg-code-cell">' + (record.permitNumber || record.boatNumber || "-") + '</td>' +
                '<td>' +
                    '<div class="mobile-cell">' +
                        '<svg class="phone-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 a 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />' +
                        '</svg>' +
                        '<span>' + (record.contactNumber || "-") + '</span>' +
                    '</div>' +
                '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td style="text-align: center;">' +
                    '<button class="delete-btn" type="button" data-archive-index="' + index + '" title="Permanently Delete">' +
                        '<svg class="trash-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />' +
                        '</svg>' +
                    '</button>' +
                '</td>';

            row.addEventListener("click", function (event) {
                var deleteBtn = event.target.closest(".delete-btn");
                if (deleteBtn) {
                    var indexToDelete = parseInt(deleteBtn.getAttribute("data-archive-index"));
                    deletePermanently(indexToDelete);
                    event.stopPropagation();
                }
            });

            archiveTableBody.appendChild(row);
        });
    }

    function showDashboard() {
        if (loginScreen) loginScreen.classList.add("hidden");
        if (dashboardShell) dashboardShell.classList.remove("hidden");
        if (loginError) loginError.textContent = "";
        loadFromDb();
    }

    function showLogin() {
        dashboardShell.classList.add("hidden");
        loginScreen.classList.remove("hidden");
        passwordInput.value = "";
        loginError.textContent = "";
        passwordInput.focus();
    }

    // Auth is removed — show dashboard and load from DB directly
    if (dashboardShell) dashboardShell.classList.remove("hidden");
    loadFromDb();

    birthdateField.addEventListener("change", function () {
        syncAge();
        fisherfolkStatus.textContent = "Unsaved changes";
    });

    fisherfolkForm.addEventListener("input", function () {
        fisherfolkStatus.textContent = "Unsaved changes";
    });

    fisherfolkForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        syncAge();
        saveFisherfolkInfo();
        await saveFisherfolkToDatabase();
        registerFormModal.classList.add("hidden");
    });

    btnRegisterLocalFisherman.addEventListener("click", function () {
        currentEditingId = null;
        var titleEl = document.querySelector("#registerFormModal h2");
        if (titleEl) titleEl.textContent = "Register Local Fisherman";

        fisherfolkForm.reset();
        fisherfolkStatus.textContent = "Ready to edit";
        syncAge();
        registerFormModal.classList.remove("hidden");
    });

    var btnToggleArchive = document.getElementById("btnToggleArchive");
    var archivePanelSection = document.getElementById("archivePanelSection");
    if (btnToggleArchive && archivePanelSection) {
        btnToggleArchive.addEventListener("click", function () {
            if (archivePanelSection.style.display === "none") {
                archivePanelSection.style.display = "block";
                btnToggleArchive.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg> Hide Archive';
            } else {
                archivePanelSection.style.display = "none";
                btnToggleArchive.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> Show Archive';
            }
        });
    }


    function closeRegisterForm() {
        registerFormModal.classList.add("hidden");
    }

    formModalCloseButton.addEventListener("click", closeRegisterForm);
    formModalOverlay.addEventListener("click", closeRegisterForm);

    formResetButton.addEventListener("click", function () {
        fisherfolkForm.reset();
        syncAge();
    });

    modalCloseButton.addEventListener("click", closeFisherfolkDetail);
    modalOverlay.addEventListener("click", closeFisherfolkDetail);

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });
            button.classList.add("active");
            currentBarangayFilter = button.getAttribute("data-filter");
            populateFisherfolkTable();
        });
    });

    directorySearchInput.addEventListener("input", function () {
        populateFisherfolkTable();
    });

    displayCurrentDate();
    loadFisherfolkInfo();
}());
