// ============================================
// CLOUDOPS - COGNITO CONFIGURATION
// ============================================

// 🔴 CHANGE THESE 3 VALUES

const USER_POOL_ID = "us-east-1_tv98rWsWs";

const CLIENT_ID = "6kerqfqajof1ftf44ujnvs3bdu";

const API_URL = "YOUR_API_GATEWAY_URL_HERE";


// ============================================
// COGNITO USER POOL
// ============================================

const poolData = {
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID
};

const userPool =
    new AmazonCognitoIdentity.CognitoUserPool(poolData);


// Email temporarily stored during verification
let signupEmail = "";


// ============================================
// PAGE MANAGEMENT
// ============================================

function hideAllPages() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("signupPage")
        .classList.add("hidden");

    document
        .getElementById("confirmPage")
        .classList.add("hidden");

    document
        .getElementById("dashboard")
        .classList.add("hidden");
}


// ============================================
// SHOW SIGNUP
// ============================================

function showSignup() {

    hideAllPages();

    document
        .getElementById("signupPage")
        .classList.remove("hidden");
}


// ============================================
// SHOW LOGIN
// ============================================

function showLogin() {

    hideAllPages();

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


// ============================================
// SIGN UP
// ============================================

function signup() {

    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("signupPassword")
            .value;

    const message =
        document.getElementById("signupMessage");


    // Validate fields

    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }


    message.innerText =
        "Creating your account...";


    // Email attribute

    const emailAttribute =
        new AmazonCognitoIdentity.CognitoUserAttribute({

            Name: "email",

            Value: email

        });


    const attributeList = [
        emailAttribute
    ];


    // Cognito Sign Up

    userPool.signUp(

        email,

        password,

        attributeList,

        null,

        function(error, result) {

            // Signup failed

            if (error) {

                console.error(
                    "Signup Error:",
                    error
                );

                message.innerText =
                    error.message ||
                    "Unable to create account.";

                return;
            }


            // Signup successful

            console.log(
                "Signup successful:",
                result
            );


            // Save email for verification

            signupEmail = email;


            message.innerText =
                "Account created! Check your email for the verification code.";


            // Open verification page

            setTimeout(function() {

                hideAllPages();

                document
                    .getElementById("confirmPage")
                    .classList.remove("hidden");

            }, 1000);

        }

    );

}


// ============================================
// CONFIRM EMAIL
// ============================================

function confirmSignup() {

    const code =
        document
            .getElementById("confirmationCode")
            .value
            .trim();

    const message =
        document.getElementById("confirmMessage");


    // Check email

    if (!signupEmail) {

        message.innerText =
            "Signup session expired. Please sign up again.";

        return;
    }


    // Check code

    if (!code) {

        message.innerText =
            "Please enter the verification code.";

        return;
    }


    message.innerText =
        "Verifying your email...";


    // Create Cognito user

    const cognitoUser =
        new AmazonCognitoIdentity.CognitoUser({

            Username: signupEmail,

            Pool: userPool

        });


    // Confirm registration

    cognitoUser.confirmRegistration(

        code,

        true,

        function(error, result) {

            // Verification failed

            if (error) {

                console.error(
                    "Verification Error:",
                    error
                );

                message.innerText =
                    error.message ||
                    "Verification failed.";

                return;
            }


            // Verification successful

            console.log(
                "Email verification successful:",
                result
            );


            message.innerText =
                "Email verified successfully!";


            // Go to login

            setTimeout(function() {

                showLogin();

            }, 1500);

        }

    );

}


// ============================================
// LOGIN
// ============================================

function login() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById("loginMessage");


    // Validate fields

    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }


    message.innerText =
        "Signing in...";


    // Authentication data

    const authenticationData = {

        Username: email,

        Password: password

    };


    // Authentication details

    const authenticationDetails =
        new AmazonCognitoIdentity.AuthenticationDetails(
            authenticationData
        );


    // Cognito user

    const cognitoUser =
        new AmazonCognitoIdentity.CognitoUser({

            Username: email,

            Pool: userPool

        });


    // Authenticate

    cognitoUser.authenticateUser(

        authenticationDetails,

        {

            // =================================
            // LOGIN SUCCESS
            // =================================

            onSuccess: function(result) {

                console.log(
                    "Login successful"
                );


                // Get Access Token

                const accessToken =
                    result
                        .getAccessToken()
                        .getJwtToken();


                // Get ID Token

                const idToken =
                    result
                        .getIdToken()
                        .getJwtToken();


                console.log(
                    "Access Token:",
                    accessToken
                );


                console.log(
                    "ID Token:",
                    idToken
                );


                // Save tokens

                localStorage.setItem(
                    "accessToken",
                    accessToken
                );


                localStorage.setItem(
                    "idToken",
                    idToken
                );


                // Save email

                localStorage.setItem(
                    "userEmail",
                    email
                );


                // Open dashboard

                showDashboard();

            },


            // =================================
            // LOGIN FAILED
            // =================================

            onFailure: function(error) {

                console.error(
                    "Login Error:",
                    error
                );


                message.innerText =
                    error.message ||
                    "Login failed.";

            }

        }

    );

}


// ============================================
// SHOW DASHBOARD
// ============================================

function showDashboard() {

    hideAllPages();

    document
        .getElementById("dashboard")
        .classList.remove("hidden");


    // Load incidents

    loadIncidents();

}


// ============================================
// LOGOUT
// ============================================

function logout() {

    // Get current Cognito user

    const currentUser =
        userPool.getCurrentUser();


    // Sign out from Cognito

    if (currentUser) {

        currentUser.signOut();

    }


    // Remove stored tokens

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "idToken"
    );

    localStorage.removeItem(
        "userEmail"
    );


    // Show login

    showLogin();

}


// ============================================
// CHECK EXISTING LOGIN
// ============================================

function checkLogin() {

    const currentUser =
        userPool.getCurrentUser();


    // No user

    if (!currentUser) {

        showLogin();

        return;

    }


    // Check Cognito session

    currentUser.getSession(

        function(error, session) {

            // Session error

            if (error) {

                console.error(
                    "Session Error:",
                    error
                );

                showLogin();

                return;

            }


            // Valid session

            if (
                session &&
                session.isValid()
            ) {

                console.log(
                    "Valid Cognito session found."
                );


                // Save access token

                localStorage.setItem(

                    "accessToken",

                    session
                        .getAccessToken()
                        .getJwtToken()

                );


                // Save ID token

                localStorage.setItem(

                    "idToken",

                    session
                        .getIdToken()
                        .getJwtToken()

                );


                // Open dashboard

                showDashboard();

            }

            else {

                showLogin();

            }

        }

    );

}


// ============================================
// LOAD INCIDENTS
// ============================================

async function loadIncidents() {

    try {

        // Get JWT

        const token =
            localStorage.getItem(
                "accessToken"
            );


        // No token

        if (!token) {

            showLogin();

            return;

        }


        // API request

        const response =
            await fetch(

                API_URL,

                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


        // API error

        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }


        // Convert response to JSON

        const data =
            await response.json();


        console.log(
            "API Response:",
            data
        );


        // Display incidents

        displayIncidents(data);

    }

    catch (error) {

        console.error(
            "Load Incidents Error:",
            error
        );


        document
            .getElementById(
                "incidentMessage"
            )
            .innerText =
            "Unable to load incidents.";

    }

}


// ============================================
// DISPLAY INCIDENTS
// ============================================

function displayIncidents(data) {

    const table =
        document.getElementById(
            "incidentTable"
        );


    table.innerHTML = "";


    // Handle different API response formats

    const incidents =
        Array.isArray(data)
            ? data
            : data.items || [];


    let critical = 0;

    let open = 0;

    let resolved = 0;


    // Loop through incidents

    incidents.forEach(

        incident => {


            // Critical count

            if (
                incident.severity ===
                "Critical"
            ) {

                critical++;

            }


            // Open count

            if (
                incident.status !==
                "Resolved"
            ) {

                open++;

            }


            // Resolved count

            if (
                incident.status ===
                "Resolved"
            ) {

                resolved++;

            }


            // Create table row

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


    // Update statistics

    document.getElementById(
        "totalIncidents"
    ).innerText =
        incidents.length;


    document.getElementById(
        "criticalIncidents"
    ).innerText =
        critical;


    document.getElementById(
        "openIncidents"
    ).innerText =
        open;


    document.getElementById(
        "resolvedIncidents"
    ).innerText =
        resolved;

}


// ============================================
// SEVERITY CSS
// ============================================

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


// ============================================
// CREATE INCIDENT
// ============================================

async function createIncident() {

    const title =
        document
            .getElementById(
                "incidentTitle"
            )
            .value
            .trim();


    const severity =
        document
            .getElementById(
                "incidentSeverity"
            )
            .value;


    const service =
        document
            .getElementById(
                "incidentService"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "incidentDescription"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "incidentMessage"
        );


    // Validate fields

    if (
        !title ||
        !service ||
        !description
    ) {

        message.innerText =
            "Please fill all fields.";

        return;

    }


    // Get JWT

    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (!token) {

        message.innerText =
            "Your session has expired. Please login again.";

        showLogin();

        return;

    }


    // Incident object

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

        // Send to API Gateway

        const response =
            await fetch(

                API_URL,

                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            incident
                        )

                }

            );


        // Convert response

        const result =
            await response.json();


        // API error

        if (!response.ok) {

            throw new Error(

                result.message ||
                "Failed to create incident"

            );

        }


        // Success

        message.innerText =
            "Incident created successfully!";


        // Clear form

        document.getElementById(
            "incidentTitle"
        ).value = "";


        document.getElementById(
            "incidentService"
        ).value = "";


        document.getElementById(
            "incidentDescription"
        ).value = "";


        // Reload incidents

        loadIncidents();

    }

    catch (error) {

        console.error(
            "Create Incident Error:",
            error
        );


        message.innerText =
            "Failed to create incident.";

    }

}


// ============================================
// RESOLVE INCIDENT
// ============================================

async function resolveIncident(
    incidentId
) {

    // Get JWT

    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (!token) {

        showLogin();

        return;

    }


    try {

        // Send PUT request

        const response =
            await fetch(

                `${API_URL}/${incidentId}`,

                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                "Resolved"

                        })

                }

            );


        // Check response

        if (!response.ok) {

            throw new Error(
                "Failed to resolve incident"
            );

        }


        // Reload incidents

        loadIncidents();

    }

    catch (error) {

        console.error(
            "Resolve Incident Error:",
            error
        );


        alert(
            "Unable to resolve incident."
        );

    }

}


// ============================================
// START APPLICATION
// ============================================

document.addEventListener(

    "DOMContentLoaded",

    function() {

        checkLogin();

    }

);
