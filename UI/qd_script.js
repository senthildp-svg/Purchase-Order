// Quality & Delivery Summary Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeQualityDeliveryForm();
});

function initializeQualityDeliveryForm() {
    const qualityDeliveryForm = document.getElementById('qualityDeliveryForm');
    const addQualityIssueBtn = document.getElementById('addQualityIssue');
    const addDeliveryIssueBtn = document.getElementById('addDeliveryIssue');
    const addActionItemBtn = document.getElementById('addActionItem');
    const resetQualityDeliveryBtn = document.getElementById('resetQualityDelivery');
    const generateReportBtn = document.getElementById('generateReport');

    if (qualityDeliveryForm) {
        // Set default date range
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('periodEnd').valueAsDate = today;
        document.getElementById('periodStart').valueAsDate = firstDayOfMonth;

        // Calculate quality rate on input
        ['totalDeliveries', 'rejectedItems'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateQualityRate);
        });

        // Calculate delivery rate on input
        ['totalOrders', 'onTimeDeliveries'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateDeliveryRate);
        });

        // Add quality issue
        if (addQualityIssueBtn) {
            addQualityIssueBtn.addEventListener('click', () => {
                const tbody = document.querySelector('#qualityIssuesTable tbody');
                const row = document.createElement('tr');
                row.innerHTML = createQualityIssueRow();
                tbody.appendChild(row);
                initializeIssueRow(row);
            });
        }

        // Add delivery issue
        if (addDeliveryIssueBtn) {
            addDeliveryIssueBtn.addEventListener('click', () => {
                const tbody = document.querySelector('#deliveryIssuesTable tbody');
                const row = document.createElement('tr');
                row.innerHTML = createDeliveryIssueRow();
                tbody.appendChild(row);
                initializeIssueRow(row);
            });
        }

        // Add action item
        if (addActionItemBtn) {
            addActionItemBtn.addEventListener('click', () => {
                const tbody = document.querySelector('#actionPlanTable tbody');
                const row = document.createElement('tr');
                row.innerHTML = createActionItemRow();
                tbody.appendChild(row);
                initializeActionRow(row);
            });
        }

        // Reset form
        if (resetQualityDeliveryBtn) {
            resetQualityDeliveryBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the form? All data will be cleared.')) {
                    resetForm();
                    showToast('info', 'Form has been reset');
                }
            });
        }

        // Generate report
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', generateQualityDeliveryReport);
        }

        // Initialize existing rows
        document.querySelectorAll('#qualityIssuesTable tbody tr').forEach(initializeIssueRow);
        document.querySelectorAll('#deliveryIssuesTable tbody tr').forEach(initializeIssueRow);
        document.querySelectorAll('#actionPlanTable tbody tr').forEach(initializeActionRow);

        // Form validation and submission
        qualityDeliveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateQualityDeliveryForm()) {
                saveSummary();
            }
        });

        // Load supplier list
        loadSuppliers();
    }
}

function calculateQualityRate() {
    const totalDeliveries = parseInt(document.getElementById('totalDeliveries').value) || 0;
    const rejectedItems = parseInt(document.getElementById('rejectedItems').value) || 0;
    
    if (totalDeliveries > 0) {
        const rate = ((totalDeliveries - rejectedItems) / totalDeliveries) * 100;
        const qualityRate = document.getElementById('qualityRate');
        qualityRate.value = rate.toFixed(2);
        updateRateIndicator(qualityRate.value, qualityRate.closest('.col-md-4'));
    }
}

function calculateDeliveryRate() {
    const totalOrders = parseInt(document.getElementById('totalOrders').value) || 0;
    const onTimeDeliveries = parseInt(document.getElementById('onTimeDeliveries').value) || 0;
    
    if (totalOrders > 0) {
        const rate = (onTimeDeliveries / totalOrders) * 100;
        const deliveryRate = document.getElementById('deliveryRate');
        deliveryRate.value = rate.toFixed(2);
        updateRateIndicator(rate, deliveryRate.closest('.col-md-4'));
    }
}

function updateRateIndicator(rate, container) {
    const indicator = container.querySelector('.rate-indicator') || createRateIndicator(container);
    const value = parseFloat(rate);
    
    indicator.className = 'rate-indicator';
    if (value >= 90) {
        indicator.classList.add('rate-good');
    } else if (value >= 75) {
        indicator.classList.add('rate-warning');
    } else {
        indicator.classList.add('rate-poor');
    }
    
    indicator.querySelector('.indicator-value').textContent = `${value.toFixed(2)}%`;
    indicator.querySelector('.indicator-bar').style.width = `${value}%`;
}

function createRateIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'rate-indicator mt-2';
    indicator.innerHTML = `
        <div class="indicator-bar"></div>
        <div class="indicator-value"></div>
    `;
    container.appendChild(indicator);
    return indicator;
}

function createQualityIssueRow() {
    return `
        <td>
            <select class="form-select form-select-sm">
                <option value="specification">Specification</option>
                <option value="damage">Damage</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm"></td>
        <td><input type="date" class="form-control form-control-sm"></td>
        <td>
            <select class="form-select form-select-sm status-select">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger remove-row">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
}

function createDeliveryIssueRow() {
    return `
        <td>
            <select class="form-select form-select-sm">
                <option value="late">Late Delivery</option>
                <option value="partial">Partial Delivery</option>
                <option value="wrong-quantity">Wrong Quantity</option>
                <option value="other">Other</option>
            </select>
        </td>
        <td><input type="text" class="form-control form-control-sm"></td>
        <td><input type="date" class="form-control form-control-sm"></td>
        <td><input type="date" class="form-control form-control-sm"></td>
        <td>
            <select class="form-select form-select-sm status-select">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger remove-row">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
}

function createActionItemRow() {
    return `
        <td><input type="text" class="form-control form-control-sm"></td>
        <td>
            <select class="form-select form-select-sm priority-select">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
        </td>
        <td><input type="date" class="form-control form-control-sm"></td>
        <td><input type="text" class="form-control form-control-sm"></td>
        <td>
            <select class="form-select form-select-sm">
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger remove-row">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
}

function initializeIssueRow(row) {
    // Remove row functionality
    const removeBtn = row.querySelector('.remove-row');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => row.remove());
    }

    // Status indicator
    const statusSelect = row.querySelector('.status-select');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            const status = e.target.value;
            e.target.className = `form-select form-select-sm status-${status}`;
        });
    }

    // Set today as max date for issue date
    const dateInputs = row.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.max = today;
    });
}

function initializeActionRow(row) {
    // Remove row functionality
    const removeBtn = row.querySelector('.remove-row');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => row.remove());
    }

    // Priority styling
    const prioritySelect = row.querySelector('.priority-select');
    if (prioritySelect) {
        prioritySelect.addEventListener('change', (e) => {
            const priority = e.target.value;
            e.target.className = `form-select form-select-sm priority-select priority-${priority}`;
        });
    }

    // Set today as min date for due date
    const dateInput = row.querySelector('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.min = today;
    }
}

async function loadSuppliers() {
    // Simulate API call to load suppliers
    const suppliers = [
        { id: '1', name: 'Supplier A', status: 'active' },
        { id: '2', name: 'Supplier B', status: 'active' },
        { id: '3', name: 'Supplier C', status: 'inactive' }
    ];

    const supplierSelect = document.getElementById('supplierSelect');
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        option.disabled = supplier.status === 'inactive';
        supplierSelect.appendChild(option);
    });
}

function validateQualityDeliveryForm() {
    const form = document.getElementById('qualityDeliveryForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    // Check required fields
    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    // Validate date range
    const startDate = document.getElementById('periodStart').value;
    const endDate = document.getElementById('periodEnd').value;
    if (startDate && endDate && startDate > endDate) {
        showToast('error', 'Start date cannot be after end date');
        isValid = false;
    }

    // Validate metrics
    const totalDeliveries = parseInt(document.getElementById('totalDeliveries').value) || 0;
    const rejectedItems = parseInt(document.getElementById('rejectedItems').value) || 0;
    if (rejectedItems > totalDeliveries) {
        showToast('error', 'Rejected items cannot exceed total deliveries');
        isValid = false;
    }

    const totalOrders = parseInt(document.getElementById('totalOrders').value) || 0;
    const onTimeDeliveries = parseInt(document.getElementById('onTimeDeliveries').value) || 0;
    if (onTimeDeliveries > totalOrders) {
        showToast('error', 'On-time deliveries cannot exceed total orders');
        isValid = false;
    }

    return isValid;
}

function resetForm() {
    const form = document.getElementById('qualityDeliveryForm');
    form.reset();

    // Reset tables
    ['qualityIssuesTable', 'deliveryIssuesTable', 'actionPlanTable'].forEach(tableId => {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = '';
    });

    // Reset rate indicators
    document.querySelectorAll('.rate-indicator').forEach(indicator => indicator.remove());

    // Reset dates to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('periodEnd').valueAsDate = today;
    document.getElementById('periodStart').valueAsDate = firstDayOfMonth;
}

function saveSummary() {
    // Simulate saving to server
    showToast('info', 'Saving summary...');
    
    setTimeout(() => {
        showToast('success', 'Quality & Delivery Summary saved successfully');
    }, 1000);
}

function generateQualityDeliveryReport() {
    if (!validateQualityDeliveryForm()) {
        showToast('error', 'Please fix form errors before generating report');
        return;
    }

    // Simulate report generation
    showToast('info', 'Generating report...');
    
    setTimeout(() => {
        showToast('success', 'Report generated successfully');
        // In a real implementation, this would trigger a download or open the report
    }, 1500);
}

function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center border-0 bg-${type} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
