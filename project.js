const API_URL =
    "YOUR_API_GATEWAY_URL_HERE";


// ================================
// PAGE MANAGEMENT
// ================================

function showSignup() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("signupPage")
        .classList.remove("hidden");
}


function showLogin() {

    document
        .getElementById("signupPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


// ================================
// SIGNUP
// ================================

function signup() {

    const email =
        document.getElementById("signupEmail").value;

    const password =
        document.getElementById("signupPassword").value;

    const message =
        document.getElementById("signupMessage");


    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }


    /*
     * Cognito integration will be added
     * after the frontend is deployed.
     */

    message.innerText =
        "Connect this form to Amazon Cognito.";
}


// ================================
// LOGIN
// ================================

function login() {

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }


    /*
     * Cognito authentication will be
     * connected here.
     */

    message.innerText =
        "Connect this form to Amazon Cognito.";
}


// ================================
// LOGOUT
// ================================

function logout() {

    document
        .getElementById("dashboard")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


// ================================
// LOAD INCIDENTS
// ================================

async function loadIncidents() {

    try {

        const response =
            await fetch(API_URL, {

                method: "GET",

                headers: {
                    "Content-Type":
                        "application/json"
                }

            });


        if (!response.ok) {

            throw new Error(
                "API request failed"
            );
        }


        const data =
            await response.json();


        console.log(
            "API Response:",
            data
        );


        displayIncidents(data);

    }

    catch (error) {

        console.error(error);

        document
            .getElementById("incidentMessage")
            .innerText =
            "Unable to load incidents.";

    }

}


// ================================
// DISPLAY INCIDENTS
// ================================

function displayIncidents(data) {

    const table =
        document.getElementById(
            "incidentTable"
        );


    table.innerHTML = "";


    /*
     * Handles both:
     *
     * [ {...}, {...} ]
     *
     * and
     *
     * { items: [...] }
     */

    const incidents =
        Array.isArray(data)
            ? data
            : data.items || [];


    let critical = 0;

    let open = 0;

    let resolved = 0;


    incidents.forEach(
        incident => {

            if (
                incident.severity ===
                "Critical"
            ) {

                critical++;

            }


            if (
                incident.status !==
                "Resolved"
            ) {

                open++;

            }


            if (
                incident.status ===
                "Resolved"
            ) {

                resolved++;

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${incident.incidentId || "-"}
                </td>

                <td>
                    ${incident.title || "-"}
                </td>

                <td>
                    ${incident.service || "-"}
                </td>

                <td>
                    <span class="badge ${getSeverityClass(
                        incident.severity
                    )}">
                        ${incident.severity || "-"}
                    </span>
                </td>

                <td>
                    <span class="status">
                        ${incident.status || "Open"}
                    </span>
                </td>

                <td>
                    ${incident.createdAt || "-"}
                </td>

                <td>

                    ${
                        incident.status !==
                        "Resolved"

                        ?

                        `<button
                            class="resolve-btn"
                            onclick="resolveIncident('${incident.incidentId}')">

                            Resolve

                        </button>`

                        :

                        "✓ Resolved"
                    }

                </td>
            `;


            table.appendChild(row);

        }
    );


    document.getElementById(
        "totalIncidents"
    ).innerText = incidents.length;


    document.getElementById(
        "criticalIncidents"
    ).innerText = critical;


    document.getElementById(
        "openIncidents"
    ).innerText = open;


    document.getElementById(
        "resolvedIncidents"
    ).innerText = resolved;

}


// ================================
// SEVERITY CSS
// ================================

function getSeverityClass(
    severity
) {

    switch (severity) {

        case "Critical":
            return "badge-critical";

        case "High":
            return "badge-high";

        case "Medium":
            return "badge-medium";

        default:
            return "badge-low";
    }

}


// ================================
// CREATE INCIDENT
// ================================

async function createIncident() {

    const title =
        document.getElementById(
            "incidentTitle"
        ).value;

    const severity =
        document.getElementById(
            "incidentSeverity"
        ).value;

    const service =
        document.getElementById(
            "incidentService"
        ).value;

    const description =
        document.getElementById(
            "incidentDescription"
        ).value;


    const message =
        document.getElementById(
            "incidentMessage"
        );


    if (
        !title ||
        !service ||
        !description
    ) {

        message.innerText =
            "Please fill all fields.";

        return;

    }


    const incident = {

        title: title,

        severity: severity,

        service: service,

        description: description,

        status: "Open",

        createdAt:
            new Date().toISOString()

    };


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        incident
                    )

            });


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to create incident"
            );

        }


        message.innerText =
            "Incident created successfully!";


        document.getElementById(
            "incidentTitle"
        ).value = "";


        document.getElementById(
            "incidentService"
        ).value = "";


        document.getElementById(
            "incidentDescription"
        ).value = "";


        loadIncidents();

    }

    catch (error) {

        console.error(error);

        message.innerText =
            "Failed to create incident.";

    }

}


// ================================
// RESOLVE INCIDENT
// ================================

async function resolveIncident(
    incidentId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/${incidentId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        status:
                            "Resolved"

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to resolve incident"
            );

        }


        loadIncidents();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to resolve incident."
        );

    }

}