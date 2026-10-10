const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// Get JWT payload
function getPayload(token) {

    const payload = token.split(".")[1];

    return JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
}


// Logged-in user
const user = getPayload(token);


// Welcome message
document.getElementById("welcomeMessage").textContent =
    "Welcome, " + user.sub + " | Role: " + user.role;



 // Show correct section
if (user.role === "ADMIN") {
    document.getElementById("adminSection").style.display = "block";
    document.getElementById("employeeSection").style.display = "none";
    document.getElementById("employeeManagement").style.display = "block";
} else {
    document.getElementById("adminSection").style.display = "none";
    document.getElementById("employeeSection").style.display = "block";
    document.getElementById("employeeManagement").style.display = "none";
}


// Hide forms initially
document.getElementById("addAssetForm").style.display = "none";
document.getElementById("updateAssetForm").style.display = "none";
document.getElementById("updateEmployeeForm").style.display = "none";
document.getElementById("addEmployeeForm").style.display = "none";


// Show Add Asset form
function showAddAssetForm() {

    document.getElementById("addAssetForm").style.display = "block";

    document.getElementById("updateAssetForm").style.display = "none";
}


// Load assets
async function loadAssets() {

    try {

        const response = await fetch("/api/assets", {

            method: "GET",

            headers: {
                "Authorization": "Bearer " + token
            }
        });


        if (response.ok) {

            const assets = await response.json();
            const employeeResponse = await fetch("/api/employees", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const employees = employeeResponse.ok
                ? await employeeResponse.json()
                : [];

            displayAssets(assets, employees);

        } else if (response.status === 401 || response.status === 403) {

            alert("You are not authorized.");

        } else {

            alert("Unable to load assets.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


// Display assets

function displayAssets(assets, employees = []) {

    const container = document.getElementById("assetsContainer");

    container.innerHTML = "";


    if (assets.length === 0) {

        container.innerHTML = "<p>No assets found.</p>";

        return;
    }


    assets.forEach(asset => {

        const assignedEmployee = employees.find(
    employee => Number(employee.id) === Number(asset.employeeId)
);

        const employeeName = assignedEmployee
            ? assignedEmployee.name
            : "Not Assigned";

        let buttons = "";


        if (user.role === "ADMIN") {

            buttons = `

                <button onclick="showUpdateForm(
                    ${asset.id},
                    '${asset.name}',
                    '${asset.type}',
                    '${asset.status}'
                    , ${asset.employeeId ?? "null"}
                )">
                    Update
                </button>

                <button onclick="deleteAsset(${asset.id})">
                    Delete
                </button>

            `;
        }


        const assetDiv = document.createElement("div");


        assetDiv.innerHTML = `

            <h3>${asset.name}</h3>

            <p>Asset ID: ${asset.id}</p>

            <p>Type: ${asset.type}</p>

            <p>Status: ${asset.status}</p>

            
            <p>
                Assigned Employee:
                ${employeeName}
            </p>

            ${buttons}

            <hr>

        `;


        container.appendChild(assetDiv);

    });
}


// Add asset
async function addAsset() {

    const id =
        document.getElementById("assetId").value;

    const name =
        document.getElementById("assetName").value;

    const type =
        document.getElementById("assetType").value;

    const status =
        document.getElementById("assetStatus").value;


    const asset = {

        id: Number(id),

        name: name,

        type: type,

        status: status
    };


    try {

        const response = await fetch("/api/assets", {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": "Bearer " + token
            },

            body: JSON.stringify(asset)
        });


        if (response.ok) {

            alert("Asset added successfully!");

            document.getElementById("assetId").value = "";
            document.getElementById("assetName").value = "";
            document.getElementById("assetType").value = "";

            loadAssets();

        } else if (response.status === 403) {

            alert("Only ADMIN can add assets.");

        } else {

            alert("Unable to add asset.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


// Show Update form

async function showUpdateForm(id, name, type, status, employeeId = null) {

    document.getElementById("updateAssetForm").style.display = "block";
    document.getElementById("addAssetForm").style.display = "none";

    document.getElementById("updateAssetId").value = id;
    document.getElementById("updateAssetName").value = name;
    document.getElementById("updateAssetType").value = type;
    document.getElementById("updateAssetStatus").value = status;

    await loadEmployeeDropdown(employeeId);
}

// Update asset
async function updateAsset() {

    const id =
        document.getElementById("updateAssetId").value;

    const name =
        document.getElementById("updateAssetName").value;

    const type =
        document.getElementById("updateAssetType").value;

    const status =
        document.getElementById("updateAssetStatus").value;

    const employeeValue =
        document.getElementById("updateAssetEmployee").value;


    const asset = {
        id: Number(id),
        name: name,
        type: type,
        status: status,
        employeeId: employeeValue === "" ? null : Number(employeeValue)
    };


    try {

        const response = await fetch(
            "/api/assets/" + id,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify(asset)
            }
        );


        if (response.ok) {

            alert("Asset updated successfully!");

            document.getElementById("updateAssetForm").style.display = "none";

            loadAssets();

        } else if (response.status === 403) {

            alert("Only ADMIN can update assets.");

        } else {

            alert("Unable to update asset.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


// Delete asset
async function deleteAsset(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this asset?");


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            "/api/assets/" + id,
            {

                method: "DELETE",

                headers: {

                    "Authorization": "Bearer " + token
                }
            }
        );


        if (response.ok) {

            alert("Asset deleted successfully!");

            loadAssets();

        } else if (response.status === 403) {

            alert("Only ADMIN can delete assets.");

        } else {

            alert("Unable to delete asset.");
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");
    }
}


// Logout
function logout() {

    localStorage.removeItem("token");

    window.location.href = "index.html";
}


// Show Add Employee form
function showAddEmployeeForm() {

    document.getElementById("addEmployeeForm").style.display = "block";

}


async function loadEmployeeDropdown(selectedEmployeeId = "") {
    const dropdown = document.getElementById("updateAssetEmployee");

    dropdown.innerHTML = '<option value="">Not Assigned</option>';

    try {
        const response = await fetch("/api/employees", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            console.error("Unable to load employees for assignment.");
            return;
        }

        const employees = await response.json();

        employees.forEach(employee => {
            const option = document.createElement("option");
            option.value = employee.id;
            option.textContent = employee.name + " (ID: " + employee.id + ")";
            dropdown.appendChild(option);
        });

        dropdown.value = selectedEmployeeId || "";
    } catch (error) {
        console.error("Error loading employees:", error);
    }
}
// Load all employees
async function loadEmployees() {

    try {

        const response = await fetch("/api/employees", {

            method: "GET",

            headers: {
                "Authorization": "Bearer " + token
            }

        });


        if (response.ok) {

            const employees = await response.json();

            displayEmployees(employees);

        } else if (response.status === 403) {

            alert("Only ADMIN can view employees.");

        } else {

            alert("Unable to load employees.");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}


// Display employees
function displayEmployees(employees) {

    const container =
        document.getElementById("employeesContainer");

    container.innerHTML = "";


    if (employees.length === 0) {

        container.innerHTML =
            "<p>No employees found.</p>";

        return;

    }


    employees.forEach(employee => {

        const employeeDiv =
            document.createElement("div");


        employeeDiv.innerHTML = `

    <h3>${employee.name}</h3>

    <p>Employee ID: ${employee.id}</p>

    <p>Email: ${employee.email}</p>

    <p>Department: ${employee.department}</p>

    <button onclick="showUpdateEmployeeForm(
        ${employee.id},
        '${employee.name}',
        '${employee.email}',
        '${employee.department}'
    )">
        Update
    </button>

    <button onclick="deleteEmployee(${employee.id})">
        Delete
    </button>

    <hr>

`;

        container.appendChild(employeeDiv);

    });

}
// Add employee
async function addEmployee() {

    const id =
        document.getElementById("employeeId").value;

    const name =
        document.getElementById("employeeName").value;

    const email =
        document.getElementById("employeeEmail").value;

    const department =
        document.getElementById("employeeDepartment").value;


    const employee = {

        id: Number(id),

        name: name,

        email: email,

        department: department

    };


    try {

        const response = await fetch("/api/employees", {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": "Bearer " + token

            },

            body: JSON.stringify(employee)

        });


        if (response.ok) {

            alert("Employee added successfully!");

            document.getElementById("employeeId").value = "";
            document.getElementById("employeeName").value = "";
            document.getElementById("employeeEmail").value = "";
            document.getElementById("employeeDepartment").value = "";

            loadEmployees();

        } else if (response.status === 403) {

            alert("Only ADMIN can add employees.");

        } else {

            alert("Unable to add employee.");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}

function showUpdateEmployeeForm(id, name, email, department) {

    document.getElementById("updateEmployeeForm").style.display = "block";

    document.getElementById("updateEmployeeId").value = id;

    document.getElementById("updateEmployeeName").value = name;

    document.getElementById("updateEmployeeEmail").value = email;

    document.getElementById("updateEmployeeDepartment").value = department;
}
// Update employee
async function updateEmployee() {

    const id =
        document.getElementById("updateEmployeeId").value;

    const name =
        document.getElementById("updateEmployeeName").value;

    const email =
        document.getElementById("updateEmployeeEmail").value;

    const department =
        document.getElementById("updateEmployeeDepartment").value;


    const employee = {

        id: Number(id),

        name: name,

        email: email,

        department: department

    };


    try {

        const response = await fetch(
            "/api/employees/" + id,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": "Bearer " + token

                },

                body: JSON.stringify(employee)

            }
        );


        if (response.ok) {

            alert("Employee updated successfully!");

            document.getElementById("updateEmployeeForm").style.display = "none";

            loadEmployees();

        } else if (response.status === 403) {

            alert("Only ADMIN can update employees.");

        } else {

            alert("Unable to update employee.");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }
}

    async function deleteEmployee(id) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                "/api/employees/" + id,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (response.ok) {
                alert("Employee deleted successfully!");
                loadEmployees();
                loadAssets();
            } else if (response.status === 403) {
                alert("Only ADMIN can delete employees.");
            } else {
                alert("Unable to delete employee.");
            }

        } catch (error) {
            console.error(error);
            alert("Unable to connect to server.");
        }

    }

    async function loadDashboardSummary() {
        try {
            const response = await fetch("/api/assets", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!response.ok) {
                throw new Error("Unable to load assets");
            }

            const assets = await response.json();

            document.getElementById("totalAssetsCount").textContent =
                assets.length;

            const available = assets.filter(
                asset => asset.status?.toLowerCase() === "available"
            ).length;

            const assigned = assets.filter(
                asset => asset.employeeId != null
            ).length;

            document.getElementById("assetTrackingCount").textContent =
                `${available} / ${assigned}`;

            document.getElementById("assetTrackingNote").textContent =
                `Available / Assigned (${assets.length} total)`;

            if (user.role === "ADMIN") {
                const employeeResponse = await fetch("/api/employees", {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });

                if (employeeResponse.ok) {
                    const employees = await employeeResponse.json();

                    document.getElementById("totalEmployeesCount")
                        .textContent = employees.length;
                } else {
                    document.getElementById("totalEmployeesCount")
                        .textContent = "Unavailable";
                }
            } else {
                document.getElementById("totalEmployeesCount")
                    .textContent = "Admin only";
            }

        } catch (error) {
            console.error("Dashboard summary error:", error);

            document.getElementById("totalAssetsCount").textContent = "—";
            document.getElementById("totalEmployeesCount").textContent = "—";
            document.getElementById("assetTrackingCount").textContent = "—";
            document.getElementById("assetTrackingNote").textContent =
                "Unable to load tracking data";
        }
    }

    loadDashboardSummary();

