const state = {
  selectedCustomerId: null,
  customers: [],
};

const listContainer = document.getElementById("customer-list");
const personForm = document.getElementById("person-form");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const clearBtn = document.getElementById("clear-btn");
const formMode = document.getElementById("form-mode");
const formStatus = document.getElementById("form-status");

function setStatus(message, kind = "info") {
  formStatus.textContent = message;
  formStatus.classList.remove("status-info", "status-success", "status-error");
  formStatus.classList.add(`status-${kind}`);
}

function formatDateForInput(value) {
  if (!value) {
    return "";
  }
  return String(value).slice(0, 10);
}

function setFormMode() {
  const isEdit = state.selectedCustomerId !== null;
  saveBtn.textContent = isEdit ? "Update customer" : "Add customer";
  deleteBtn.disabled = !isEdit;
  formMode.textContent = isEdit ? `Mode: Edit customer #${state.selectedCustomerId}` : "Mode: Add new customer";
}

function clearForm(clearStatus = true) {
  personForm.reset();
  state.selectedCustomerId = null;
  setFormMode();
  if (clearStatus) {
    setStatus("", "info");
  }
}

function populateForm(person) {
  personForm.first_name.value = person.first_name || "";
  personForm.last_name.value = person.last_name || "";
  personForm.email.value = person.email || "";
  personForm.phone.value = person.phone || "";
  personForm.birth_date.value = formatDateForInput(person.birth_date);
  state.selectedCustomerId = person.id;
  setFormMode();
  setStatus(`Selected customer #${person.id}. You can update or delete.`, "info");
}

function getFormPayload() {
  return {
    first_name: personForm.first_name.value.trim(),
    last_name: personForm.last_name.value.trim(),
    email: personForm.email.value.trim(),
    phone: personForm.phone.value.trim(),
    birth_date: personForm.birth_date.value || null,
  };
}

function renderCustomers(customers) {
  listContainer.innerHTML = "";

  if (customers.length === 0) {
    listContainer.innerHTML = "<p>No customers found.</p>";
    return;
  }

  customers.forEach((person) => {
    const div = document.createElement("button");
    div.type = "button";
    div.className = "customer-card";
    div.setAttribute("aria-label", `Select ${person.first_name} ${person.last_name}`);

    if (state.selectedCustomerId === person.id) {
      div.classList.add("selected");
    }

    div.innerHTML = `
      <strong>${person.first_name} ${person.last_name}</strong><br>
      Email: ${person.email}<br>
      Phone: ${person.phone || "-"}<br>
      Birth date: ${formatDateForInput(person.birth_date) || "-"}
    `;

    div.addEventListener("click", () => populateForm(person));
    listContainer.appendChild(div);
  });
}

async function loadCustomers() {
  try {
    const res = await fetch("/api/persons");
    if (!res.ok) {
      throw new Error("Failed to fetch customers");
    }

    const data = await res.json();
    state.customers = data;

    if (state.selectedCustomerId !== null && !data.some((person) => person.id === state.selectedCustomerId)) {
      clearForm(false);
    }

    renderCustomers(data);
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = "<p style='color:red;'>Error loading customers</p>";
    setStatus("Could not load customers from server.", "error");
  }
}

async function createCustomer(payload) {
  const res = await fetch("/api/persons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to create customer");
  }
}

async function updateCustomer(id, payload) {
  const res = await fetch(`/api/persons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to update customer");
  }
}

async function deleteCustomer(id) {
  const res = await fetch(`/api/persons/${id}`, {
    method: "DELETE",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete customer");
  }
}

personForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = getFormPayload();

  if (!payload.first_name || !payload.last_name || !payload.email) {
    setStatus("First name, last name, and email are required.", "error");
    return;
  }

  try {
    if (state.selectedCustomerId === null) {
      await createCustomer(payload);
      setStatus("Customer added successfully.", "success");
      clearForm(false);
    } else {
      await updateCustomer(state.selectedCustomerId, payload);
      setStatus("Customer updated successfully.", "success");
    }

    await loadCustomers();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

deleteBtn.addEventListener("click", async () => {
  if (state.selectedCustomerId === null) {
    return;
  }

  try {
    await deleteCustomer(state.selectedCustomerId);
    setStatus("Customer deleted successfully.", "success");
    clearForm(false);
    await loadCustomers();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

clearBtn.addEventListener("click", () => {
  clearForm();
});

setFormMode();
loadCustomers();