const responseBadge = document.getElementById("response-badge");
const requestLine = document.getElementById("request-line");
const statusLine = document.getElementById("status-line");
const responseOutput = document.getElementById("response-output");
const tokenField = document.getElementById("jwt-token");

const loginForm = document.getElementById("login-form");
const patientForm = document.getElementById("patient-form");

const patientIdField = document.getElementById("patient-id");
const patientNameField = document.getElementById("patient-name");
const patientEmailField = document.getElementById("patient-email");
const patientAddressField = document.getElementById("patient-address");
const patientDobField = document.getElementById("patient-dob");
const patientRegisteredDateField = document.getElementById(
  "patient-registered-date",
);

function prettyPrint(value) {
  if (value === "" || value == null) {
    return "(empty response body)";
  }

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

function setViewer({ request, status, body }) {
  requestLine.textContent = request;
  statusLine.textContent = status;
  responseBadge.textContent = status.split(" ")[0] || "Done";
  responseOutput.textContent = prettyPrint(body);
}

async function callApi(path, options = {}) {
  const method = options.method || "GET";
  requestLine.textContent = `${method} ${path}`;
  statusLine.textContent = "Loading";
  responseBadge.textContent = "Busy";
  responseOutput.textContent = "Request in progress...";

  const response = await fetch(path, options);
  const text = await response.text();

  setViewer({
    request: `${method} ${path}`,
    status: `${response.status} ${response.statusText}`,
    body: text,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return text ? JSON.parse(text) : null;
}

function patientPayload(includeRegisteredDate = true) {
  const payload = {
    name: patientNameField.value.trim(),
    email: patientEmailField.value.trim(),
    address: patientAddressField.value.trim(),
    dateOfBirth: patientDobField.value,
  };

  if (includeRegisteredDate) {
    payload.registeredDate = patientRegisteredDateField.value;
  }

  return payload;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await callApi("/proxy/auth/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value,
      }),
    });

    tokenField.value = result?.token || "";
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("clear-token").addEventListener("click", () => {
  tokenField.value = "";
  responseBadge.textContent = "Idle";
  requestLine.textContent = "No request yet";
  statusLine.textContent = "Waiting";
  responseOutput.textContent = "Start with login or list patients.";
});

document.getElementById("list-patients").addEventListener("click", async () => {
  try {
    await callApi("/proxy/patients/patients");
  } catch (error) {
    console.error(error);
  }
});

patientForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await callApi("/proxy/patients/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientPayload(true)),
    });

    if (result?.id) {
      patientIdField.value = result.id;
    }
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("update-patient").addEventListener("click", async () => {
  const patientId = patientIdField.value.trim();

  if (!patientId) {
    setViewer({
      request: "PUT /proxy/patients/patients/{id}",
      status: "Validation",
      body: "Enter a patient ID before updating.",
    });
    return;
  }

  try {
    await callApi(`/proxy/patients/patients/${patientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientPayload(false)),
    });
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("delete-patient").addEventListener("click", async () => {
  const patientId = patientIdField.value.trim();

  if (!patientId) {
    setViewer({
      request: "DELETE /proxy/patients/patients/{id}",
      status: "Validation",
      body: "Enter a patient ID before deleting.",
    });
    return;
  }

  try {
    await callApi(`/proxy/patients/patients/${patientId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("gateway-list").addEventListener("click", async () => {
  const token = tokenField.value.trim();

  if (!token) {
    setViewer({
      request: "GET /proxy/gateway/api/patients",
      status: "Validation",
      body: "Log in first or paste a JWT token into the token field.",
    });
    return;
  }

  try {
    await callApi("/proxy/gateway/api/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(error);
  }
});
