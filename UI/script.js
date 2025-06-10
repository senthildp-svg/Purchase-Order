// Form Validation and Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeFileUpload();
    initializeCertificationHandling();
    initializeProductCategories();
    setupAutoSave();
    initializeAssessmentForm();
    initializePOForm();
    
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Company Name Verification
    const verifyCompanyBtn = document.querySelector('#verifyCompany');
    if (verifyCompanyBtn) {
        verifyCompanyBtn.addEventListener('click', async () => {
            const companyInput = document.querySelector('#companyName');
            const feedback = document.querySelector('#companyFeedback');
            
            try {
                // Simulate API call
                await simulateVerification(companyInput.value);
                companyInput.classList.add('is-valid');
                companyInput.classList.remove('is-invalid');
                feedback.textContent = 'Company verified successfully!';
            } catch (error) {
                companyInput.classList.add('is-invalid');
                companyInput.classList.remove('is-valid');
                feedback.textContent = error.message;
            }
        });
    }

    // File Upload Handling
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('upload-zone-active');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('upload-zone-active');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('upload-zone-active');
            handleFileUpload(e.dataTransfer.files);
        });
    }

    // Rating System
    const ratingInputs = document.querySelectorAll('.rating-input');
    ratingInputs.forEach(input => {
        input.addEventListener('change', updateSupplierScore);
    });

    // Purchase Order Calculations
    setupPOCalculations();

    // Quality Control Checklist
    setupQCChecklist();

    // Load suppliers
    loadSuppliers();
});

// Simulated API Calls
async function simulateVerification(companyName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (companyName.length > 3) {
                resolve({ status: 'verified' });
            } else {
                reject(new Error('Invalid company name'));
            }
        }, 1000);
    });
}

// Load suppliers into the dropdown
async function loadSuppliers() {
    const supplierSelect = document.getElementById('supplierName');
    if (!supplierSelect) return;

    // Simulate API call to load suppliers
    const suppliers = [
        { id: '1', name: 'Supplier A', type: 'manufacturer', status: 'active' },
        { id: '2', name: 'Supplier B', type: 'distributor', status: 'active' },
        { id: '3', name: 'Supplier C', type: 'service', status: 'inactive' }
    ];

    // Clear existing options except the first one
    while (supplierSelect.options.length > 1) {
        supplierSelect.remove(1);
    }

    // Add suppliers to dropdown
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        option.disabled = supplier.status === 'inactive';
        supplierSelect.appendChild(option);
    });

    // Handle selection change
    supplierSelect.addEventListener('change', handleSupplierSelection);
}

// Handle supplier selection
function handleSupplierSelection(event) {
    const referenceInput = document.getElementById('referenceNo');
    if (event.target.value) {
        referenceInput.value = generateReferenceNo(event.target.value);
    } else {
        referenceInput.value = '';
    }
}

// Generate unique reference number for assessment
function generateReferenceNo(supplierId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SA-${year}${month}-${supplierId}-${sequence}`;
}

// Purchase Order Calculations
function setupPOCalculations() {
    const poForm = document.querySelector('#poForm');
    if (poForm) {
        poForm.addEventListener('input', (e) => {
            if (e.target.classList.contains('qty') || e.target.classList.contains('price')) {
                calculateLineTotal(e.target.closest('tr'));
                calculateGrandTotal();
            }
        });
    }
}

function calculateLineTotal(row) {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const total = qty * price;
    row.querySelector('.line-total').textContent = total.toFixed(2);
}

function calculateGrandTotal() {
    const lineTotals = document.querySelectorAll('.line-total');
    const grandTotal = Array.from(lineTotals).reduce((sum, element) => {
        return sum + (parseFloat(element.textContent) || 0);
    }, 0);
    document.querySelector('#grandTotal').textContent = grandTotal.toFixed(2);
}

// Quality Control Checklist
function setupQCChecklist() {
    const checklistItems = document.querySelectorAll('.qc-check');
    checklistItems.forEach(item => {
        item.addEventListener('change', updateQCStatus);
    });
}

function updateQCStatus() {
    const totalChecks = document.querySelectorAll('.qc-check').length;
    const checkedItems = document.querySelectorAll('.qc-check:checked').length;
    const progress = (checkedItems / totalChecks) * 100;
    
    const progressBar = document.querySelector('#qcProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }

    // Update status indicator
    const status = document.querySelector('#qcStatus');
    if (status) {
        if (progress === 100) {
            status.className = 'status-indicator status-success';
            status.textContent = 'Complete';
        } else if (progress > 50) {
            status.className = 'status-indicator status-warning';
            status.textContent = 'In Progress';
        } else {
            status.className = 'status-indicator status-danger';
            status.textContent = 'Incomplete';
        }
    }
}

// Supplier Rating Calculation
function updateSupplierScore() {
    const ratings = document.querySelectorAll('.rating-input');
    const totalScore = Array.from(ratings).reduce((sum, input) => {
        return sum + (parseInt(input.value) || 0);
    }, 0);
    const averageScore = totalScore / ratings.length;
    
    const scoreDisplay = document.querySelector('#supplierScore');
    if (scoreDisplay) {
        scoreDisplay.textContent = averageScore.toFixed(1);
        updateSupplierStatus(averageScore);
    }
}

function updateSupplierStatus(score) {
    const status = document.querySelector('#supplierStatus');
    if (status) {
        if (score >= 4) {
            status.className = 'status-indicator status-success';
            status.textContent = 'Approved';
        } else if (score >= 3) {
            status.className = 'status-indicator status-warning';
            status.textContent = 'Conditional';
        } else {
            status.className = 'status-indicator status-danger';
            status.textContent = 'Not Approved';
        }
    }
}

// File Upload Handling
// Enhanced File Upload Handling
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    if (uploadZone && fileInput) {
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    }
}

function handleFiles(files) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    Array.from(files).forEach(file => {
        // Validate file
        if (file.size > maxFileSize) {
            showToast('error', `${file.name} is too large. Maximum size is 5MB`);
            return;
        }
        if (!allowedTypes.includes(file.type)) {
            showToast('error', `${file.name} is not a supported file type`);
            return;
        }

        // Create file entry
        const fileEntry = document.createElement('div');
        fileEntry.className = 'file-entry d-flex align-items-center p-2 border rounded mb-2';
        fileEntry.innerHTML = `
            <i class="bi bi-file-earmark-text me-2"></i>
            <span class="flex-grow-1">${file.name}</span>
            <span class="badge bg-success me-2">Valid</span>
            <button type="button" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
            </button>
        `;

        // Add remove functionality
        const removeBtn = fileEntry.querySelector('button');
        removeBtn.addEventListener('click', () => {
            fileEntry.remove();
            updateFormProgress();
        });

        uploadedFiles.appendChild(fileEntry);
        updateFormProgress();
    });
}

// Certificate Handling
function initializeCertificationHandling() {
    const certChecks = document.querySelectorAll('.cert-check');
    const otherCertInput = document.getElementById('otherCert');

    certChecks.forEach(check => {
        check.addEventListener('change', () => {
            if (check.value === 'Other') {
                otherCertInput.disabled = !check.checked;
                if (!check.checked) otherCertInput.value = '';
            }
            updateFormProgress();
        });
    });
}

// Product Categories
function initializeProductCategories() {
    const categorySelect = document.getElementById('productCategories');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            updateFormProgress();
               });
    }
}

// Auto-save functionality
function setupAutoSave() {
    let timeout;
    const form = document.getElementById('supplierForm');
    
    const saveFormData = () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem('supplierFormDraft', JSON.stringify(data));
        showToast('info', 'Draft saved automatically');
    };

    form.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(saveFormData, 2000); // Save after 2 seconds of inactivity
    });

    // Load saved draft
    const savedData = localStorage.getItem('supplierFormDraft');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
        });
    }
}

// Progress Tracking
function updateFormProgress() {
    const form = document.getElementById('supplierForm');
    const requiredFields = form.querySelectorAll('[required]');
    const totalRequired = requiredFields.length;
    let completed = 0;

    requiredFields.forEach(field => {
        if (field.value.trim() !== '') completed++;
    });

    // Check file uploads
    const uploadedFiles = document.getElementById('uploadedFiles');
    if (uploadedFiles.children.length > 0) completed++;

    const progress = (completed / (totalRequired + 1)) * 100;
    updateProgressBar(progress);
}

function updateProgressBar(progress) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${Math.round(progress)}%`;
    }
}

// Toast Notifications
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

// Initialize Assessment Form
function initializeAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const recommendationSelect = document.getElementById('recommendation');
    const evidenceUploadZone = document.getElementById('evidenceUploadZone');
    const evidenceFileInput = document.getElementById('evidenceFileInput');
    const resetAssessmentBtn = document.getElementById('resetAssessment');
    const submitForApprovalBtn = document.getElementById('submitForApproval');

    if (assessmentForm) {
        // Set default assessment date
        document.getElementById('assessmentDate').valueAsDate = new Date();

        // Load suppliers
        loadSuppliers();

        // Handle star rating interactions
        ratingStars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                const wrapper = e.target.closest('.rating-input-wrapper');
                const stars = wrapper.querySelectorAll('.rating-stars i');
                const ratingText = wrapper.querySelector('.rating-text');

                // Update stars display
                stars.forEach(s => {
                    s.classList.remove('active');
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('active');
                    }
                });

                // Update rating text
                const texts = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
                ratingText.textContent = texts[rating - 1];

                // Calculate new total score
                calculateTotalScore();
            });
        });

        // Calculate total score from ratings
        function calculateTotalScore() {
            let totalScore = 0;
            const weights = {
                'quality-system': 30,
                'technical': 25,
                'financial': 20,
                'delivery': 15,
                'service': 10
            };

            document.querySelectorAll('.rating-input-wrapper').forEach(wrapper => {
                const category = wrapper.dataset.category;
                const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
                const weight = weights[category] || parseInt(wrapper.dataset.weight);
                const categoryScore = (activeStars * weight) / 5;
                totalScore += categoryScore;
                
                // Update category score display if it exists
                const categoryScoreElement = wrapper.querySelector('.category-score');
                if (categoryScoreElement) {
                    categoryScoreElement.textContent = `${categoryScore}/${weight}`;
                }
            });

            // Update total score
            const totalScoreElement = document.getElementById('totalScore');
            if (totalScoreElement) {
                totalScoreElement.textContent = Math.round(totalScore);
                updateAssessmentStatus(totalScore);
            }
        }

        // Update assessment status based on score
        function updateAssessmentStatus(score) {
            const statusElement = document.getElementById('assessmentStatus');
            const recommendationSelect = document.getElementById('recommendation');
            const riskLevelSelect = document.getElementById('riskLevel');
            
            statusElement.classList.remove('text-success', 'text-warning', 'text-danger');

            if (score >= 80) {
                statusElement.textContent = 'APPROVED';
                statusElement.classList.add('text-success');
                recommendationSelect.value = 'approve';
                riskLevelSelect.value = score >= 90 ? 'low' : 'medium';
            } else if (score >= 60) {
                statusElement.textContent = 'CONDITIONAL';
                statusElement.classList.add('text-warning');
                recommendationSelect.value = 'conditional';
                riskLevelSelect.value = 'medium';
            } else {
                statusElement.textContent = 'REJECTED';
                statusElement.classList.add('text-danger');
                recommendationSelect.value = 'reject';
                riskLevelSelect.value = 'high';
            }

            // Update status indicators
            updateStatusIndicators(score);
        }

        // Update visual indicators based on assessment score
        function updateStatusIndicators(score) {
            const indicators = {
                'quality-system': document.querySelector('[data-category="quality-system"] .rating-status'),
                'technical': document.querySelector('[data-category="technical"] .rating-status'),
                'financial': document.querySelector('[data-category="financial"] .rating-status'),
                'delivery': document.querySelector('[data-category="delivery"] .rating-status'),
                'service': document.querySelector('[data-category="service"] .rating-status')
            };

            Object.entries(indicators).forEach(([category, element]) => {
                if (element) {
                    const categoryScore = calculateCategoryScore(category);
                    element.className = 'rating-status badge';
                    if (categoryScore >= 80) {
                        element.classList.add('bg-success');
                        element.textContent = 'PASS';
                    } else if (categoryScore >= 60) {
                        element.classList.add('bg-warning');
                        element.textContent = 'NEEDS IMPROVEMENT';
                    } else {
                        element.classList.add('bg-danger');
                        element.textContent = 'FAIL';
                    }
                }
            });
        }

        // Calculate score for a specific category
        function calculateCategoryScore(category) {
            const wrapper = document.querySelector(`[data-category="${category}"]`);
            if (!wrapper) return 0;

            const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
            return (activeStars * 100) / 5;
        }

        // Auto-generate reference number
        function generateReferenceNo(supplier) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `SA-${year}${month}-${supplier}-${sequence}`;
        }

        // Handle supplier selection
        const supplierSelect = document.getElementById('supplierName');
        if (supplierSelect) {
            supplierSelect.addEventListener('change', () => {
                if (supplierSelect.value) {
                    document.getElementById('referenceNo').value = generateReferenceNo(supplierSelect.value);
                }
            });
        }

        // Handle evidence file upload
        initializeEvidenceUpload();

        // Reset assessment form
        resetAssessmentBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the assessment? All ratings and notes will be cleared.')) {
                // Reset star ratings
                ratingStars.forEach(star => star.classList.remove('active'));
                document.querySelectorAll('.rating-text').forEach(text => text.textContent = '');

                // Reset form fields
                assessmentForm.reset();
                document.getElementById('assessmentDate').valueAsDate = new Date();
                document.getElementById('totalScore').textContent = '0';
                document.getElementById('assessmentStatus').textContent = '-';
                document.getElementById('uploadedEvidence').innerHTML = '';

                showToast('info', 'Assessment form has been reset');
            }
        });

        // Submit for approval
        submitForApprovalBtn.addEventListener('click', () => {
            if (validateAssessmentForm()) {
                const score = parseInt(document.getElementById('totalScore').textContent);
                const status = document.getElementById('assessmentStatus').textContent;
                const recommendation = recommendationSelect.value;

                // Simulate API call
                setTimeout(() => {
                    showToast('success', `Assessment submitted for approval (Score: ${score}, Status: ${status})`);
                }, 1000);
            } else {
                showToast('error', 'Please complete all required fields and ratings');
            }
        });

        // Form validation
        assessmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateAssessmentForm()) {
                // Simulate saving
                showToast('success', 'Assessment saved successfully');
            }
        });
    }
}

// Initialize evidence file upload handling
function initializeEvidenceUpload() {
    const uploadZone = document.getElementById('evidenceUploadZone');
    const fileInput = document.getElementById('evidenceFileInput');
    const uploadedList = document.getElementById('uploadedEvidence');

    if (uploadZone && fileInput) {
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-primary');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-primary');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-primary');
            handleEvidenceFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            handleEvidenceFiles(fileInput.files);
        });
    }
}

// Handle evidence file upload
function handleEvidenceFiles(files) {
    const uploadedList = document.getElementById('uploadedEvidence');
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    Array.from(files).forEach(file => {
        if (allowedTypes.includes(file.type)) {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file d-flex align-items-center gap-2 mb-2';
            fileItem.innerHTML = `
                <i class="bi bi-file-earmark-text"></i>
                <span class="flex-grow-1">${file.name}</span>
                <small class="text-muted">${formatFileSize(file.size)}</small>
                <button type="button" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            // Add remove functionality
            fileItem.querySelector('button').addEventListener('click', () => {
                fileItem.remove();
                validateAssessmentForm();
            });

            uploadedList.appendChild(fileItem);
        } else {
            showToast('error', `Invalid file type: ${file.name}`);
        }
    });

    validateAssessmentForm();
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate assessment form
function validateAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    const requiredFields = assessmentForm.querySelectorAll('[required]');
    const ratingWrappers = document.querySelectorAll('.rating-input-wrapper');
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

    // Check ratings
    ratingWrappers.forEach(wrapper => {
        const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
        if (activeStars === 0) {
            wrapper.classList.add('border', 'border-danger');
            isValid = false;
        } else {
            wrapper.classList.remove('border', 'border-danger');
        }
    });

    // Check evidence files
    const evidenceFiles = document.getElementById('uploadedEvidence').children.length;
    if (evidenceFiles === 0) {
        document.getElementById('evidenceUploadZone').classList.add('border', 'border-danger');
        isValid = false;
    } else {
        document.getElementById('evidenceUploadZone').classList.remove('border', 'border-danger');
    }

    // Check risk assessment
    const riskLevel = document.getElementById('riskLevel').value;
    if (!riskLevel) {
        document.getElementById('riskLevel').classList.add('is-invalid');
        isValid = false;
    }

    if (!isValid) {
        showToast('error', 'Please complete all required fields, including ratings, evidence files, and risk assessment');
    }

    return isValid;
}

// Initialize Purchase Order Form
function initializePOForm() {
    const poForm = document.getElementById('poForm');
    const addLineItemBtn = document.getElementById('addLineItem');
    const lineItemsTable = document.getElementById('lineItemsTable');
    const saveDraftBtn = document.getElementById('saveDraft');

    if (poForm) {
        // Set minimum date to today
        const dateInputs = poForm.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            input.min = today;
        });

        // Add line item
        addLineItemBtn.addEventListener('click', () => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" class="form-control form-control-sm item-code" required></td>
                <td><input type="text" class="form-control form-control-sm" required></td>
                <td><input type="number" class="form-control form-control-sm quantity" required min="1"></td>
                <td>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control form-control-sm unit-price" required min="0" step="0.01">
                    </div>
                </td>
                <td>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="text" class="form-control form-control-sm line-total" readonly>
                    </div>
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info check-stock">
                        <i class="bi bi-box-seam"></i>
                    </button>
                </td>
            `;
            lineItemsTable.querySelector('tbody').appendChild(newRow);
            initializeNewRow(newRow);
        });

        // Initialize existing rows
        lineItemsTable.querySelectorAll('tbody tr').forEach(row => {
            initializeNewRow(row);
        });

        // Save as draft
        saveDraftBtn.addEventListener('click', () => {
            savePODraft();
        });

        // Form submission
        poForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validatePOForm()) {
                submitPOForApproval();
            }
        });
    }
}

// Initialize a new line item row
function initializeNewRow(row) {
    // Remove item
    row.querySelector('.remove-item').addEventListener('click', () => {
        row.remove();
        calculateTotals();
    });

    // Check stock
    row.querySelector('.check-stock').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const itemCode = row.querySelector('.item-code').value;
        if (itemCode) {
            checkStockLevel(itemCode, btn);
        } else {
            showToast('warning', 'Please enter an item code first');
        }
    });

    // Calculate line total on input
    const qtyInput = row.querySelector('.quantity');
    const priceInput = row.querySelector('.unit-price');
    const lineTotalInput = row.querySelector('.line-total');

    [qtyInput, priceInput].forEach(input => {
        input.addEventListener('input', () => {
            const qty = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            lineTotalInput.value = (qty * price).toFixed(2);
            calculateTotals();
        });
    });

    // Validate item code
    const itemCodeInput = row.querySelector('.item-code');
    itemCodeInput.addEventListener('change', () => {
        validateItemCode(itemCodeInput);
    });
}

// Calculate order totals
function calculateTotals() {
    const lineTotals = Array.from(document.querySelectorAll('.line-total'))
        .map(input => parseFloat(input.value) || 0);
    
    const subtotal = lineTotals.reduce((sum, total) => sum + total, 0);
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    // Check budget limit
    const budgetWarning = document.getElementById('budgetWarning');
    if (total > 10000) { // Example budget limit
        budgetWarning.classList.remove('d-none');
    } else {
        budgetWarning.classList.add('d-none');
    }
}

// Simulate stock level check
async function checkStockLevel(itemCode, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';

    try {
        // Simulate API call
        const response = await new Promise(resolve => {
            setTimeout(() => {
                const stock = Math.floor(Math.random() * 1000);
                resolve({
                    itemCode,
                    stock,
                    status: stock > 100 ? 'available' : stock > 20 ? 'low' : 'out'
                });
            }, 1000);
        });

        // Show stock status
        const statusClass = {
            available: 'stock-available',
            low: 'stock-low',
            out: 'stock-out'
        }[response.status];

        const statusText = {
            available: 'In Stock',
            low: 'Low Stock',
            out: 'Out of Stock'
        }[response.status];

        btn.innerHTML = `<span class="stock-status ${statusClass}">${statusText}</span>`;
    } catch (error) {
        showToast('error', 'Failed to check stock level');
        btn.innerHTML = '<i class="bi bi-box-seam"></i>';
    } finally {
        btn.disabled = false;
    }
}

// Validate item code
async function validateItemCode(input) {
    const itemCode = input.value.trim().toUpperCase();
    input.value = itemCode;

    if (itemCode) {
        // Simulate API call
        const isValid = await new Promise(resolve => {
            setTimeout(() => {
                resolve(/^[A-Z]{2}\d{4}$/.test(itemCode));
            }, 500);
        });

        if (isValid) {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            showToast('error', 'Invalid item code format. Use AA0000 format.');
        }
    }
}

// Save PO as draft
function savePODraft() {
    // Simulate saving
    setTimeout(() => {
        showToast('success', 'Purchase Order saved as draft');
    }, 1000);
}

// Submit PO for approval
function submitPOForApproval() {
    // Simulate submission
    setTimeout(() => {
        showToast('success', 'Purchase Order submitted for approval');
        const modal = bootstrap.Modal.getInstance(document.getElementById('newPOModal'));
        modal.hide();
    }, 1000);
}

// Validate PO form
function validatePOForm() {
    const form = document.getElementById('poForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    // Check if there are any line items
    const lineItems = document.querySelectorAll('#lineItemsTable tbody tr');
    if (lineItems.length === 0) {
        showToast('error', 'Please add at least one line item');
        isValid = false;
    }

    // Validate dates
    const dateInputs = form.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (input.value < today) {
            input.classList.add('is-invalid');
            isValid = false;
            showToast('error', 'Dates cannot be in the past');
        }
    });

    return isValid;
}

// Initialize PO form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeFileUpload();
    initializeCertificationHandling();
    initializeProductCategories();
    setupAutoSave();
    initializeAssessmentForm();
    initializePOForm();
    
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Company Name Verification
    const verifyCompanyBtn = document.querySelector('#verifyCompany');
    if (verifyCompanyBtn) {
        verifyCompanyBtn.addEventListener('click', async () => {
            const companyInput = document.querySelector('#companyName');
            const feedback = document.querySelector('#companyFeedback');
            
            try {
                // Simulate API call
                await simulateVerification(companyInput.value);
                companyInput.classList.add('is-valid');
                companyInput.classList.remove('is-invalid');
                feedback.textContent = 'Company verified successfully!';
            } catch (error) {
                companyInput.classList.add('is-invalid');
                companyInput.classList.remove('is-valid');
                feedback.textContent = error.message;
            }
        });
    }

    // File Upload Handling
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('upload-zone-active');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('upload-zone-active');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('upload-zone-active');
            handleFileUpload(e.dataTransfer.files);
        });
    }

    // Rating System
    const ratingInputs = document.querySelectorAll('.rating-input');
    ratingInputs.forEach(input => {
        input.addEventListener('change', updateSupplierScore);
    });

    // Purchase Order Calculations
    setupPOCalculations();

    // Quality Control Checklist
    setupQCChecklist();

    // Load suppliers
    loadSuppliers();
});

// Simulated API Calls
async function simulateVerification(companyName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (companyName.length > 3) {
                resolve({ status: 'verified' });
            } else {
                reject(new Error('Invalid company name'));
            }
        }, 1000);
    });
}

// Load suppliers into the dropdown
async function loadSuppliers() {
    const supplierSelect = document.getElementById('supplierName');
    if (!supplierSelect) return;

    // Simulate API call to load suppliers
    const suppliers = [
        { id: '1', name: 'Supplier A', type: 'manufacturer', status: 'active' },
        { id: '2', name: 'Supplier B', type: 'distributor', status: 'active' },
        { id: '3', name: 'Supplier C', type: 'service', status: 'inactive' }
    ];

    // Clear existing options except the first one
    while (supplierSelect.options.length > 1) {
        supplierSelect.remove(1);
    }

    // Add suppliers to dropdown
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        option.disabled = supplier.status === 'inactive';
        supplierSelect.appendChild(option);
    });

    // Handle selection change
    supplierSelect.addEventListener('change', handleSupplierSelection);
}

// Handle supplier selection
function handleSupplierSelection(event) {
    const referenceInput = document.getElementById('referenceNo');
    if (event.target.value) {
        referenceInput.value = generateReferenceNo(event.target.value);
    } else {
        referenceInput.value = '';
    }
}

// Generate unique reference number for assessment
function generateReferenceNo(supplierId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SA-${year}${month}-${supplierId}-${sequence}`;
}

// Purchase Order Calculations
function setupPOCalculations() {
    const poForm = document.querySelector('#poForm');
    if (poForm) {
        poForm.addEventListener('input', (e) => {
            if (e.target.classList.contains('qty') || e.target.classList.contains('price')) {
                calculateLineTotal(e.target.closest('tr'));
                calculateGrandTotal();
            }
        });
    }
}

function calculateLineTotal(row) {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const total = qty * price;
    row.querySelector('.line-total').textContent = total.toFixed(2);
}

function calculateGrandTotal() {
    const lineTotals = document.querySelectorAll('.line-total');
    const grandTotal = Array.from(lineTotals).reduce((sum, element) => {
        return sum + (parseFloat(element.textContent) || 0);
    }, 0);
    document.querySelector('#grandTotal').textContent = grandTotal.toFixed(2);
}

// Quality Control Checklist
function setupQCChecklist() {
    const checklistItems = document.querySelectorAll('.qc-check');
    checklistItems.forEach(item => {
        item.addEventListener('change', updateQCStatus);
    });
}

function updateQCStatus() {
    const totalChecks = document.querySelectorAll('.qc-check').length;
    const checkedItems = document.querySelectorAll('.qc-check:checked').length;
    const progress = (checkedItems / totalChecks) * 100;
    
    const progressBar = document.querySelector('#qcProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }

    // Update status indicator
    const status = document.querySelector('#qcStatus');
    if (status) {
        if (progress === 100) {
            status.className = 'status-indicator status-success';
            status.textContent = 'Complete';
        } else if (progress > 50) {
            status.className = 'status-indicator status-warning';
            status.textContent = 'In Progress';
        } else {
            status.className = 'status-indicator status-danger';
            status.textContent = 'Incomplete';
        }
    }
}

// Supplier Rating Calculation
function updateSupplierScore() {
    const ratings = document.querySelectorAll('.rating-input');
    const totalScore = Array.from(ratings).reduce((sum, input) => {
        return sum + (parseInt(input.value) || 0);
    }, 0);
    const averageScore = totalScore / ratings.length;
    
    const scoreDisplay = document.querySelector('#supplierScore');
    if (scoreDisplay) {
        scoreDisplay.textContent = averageScore.toFixed(1);
        updateSupplierStatus(averageScore);
    }
}

function updateSupplierStatus(score) {
    const status = document.querySelector('#supplierStatus');
    if (status) {
        if (score >= 4) {
            status.className = 'status-indicator status-success';
            status.textContent = 'Approved';
        } else if (score >= 3) {
            status.className = 'status-indicator status-warning';
            status.textContent = 'Conditional';
        } else {
            status.className = 'status-indicator status-danger';
            status.textContent = 'Not Approved';
        }
    }
}

// File Upload Handling
// Enhanced File Upload Handling
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    if (uploadZone && fileInput) {
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    }
}

function handleFiles(files) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    Array.from(files).forEach(file => {
        // Validate file
        if (file.size > maxFileSize) {
            showToast('error', `${file.name} is too large. Maximum size is 5MB`);
            return;
        }
        if (!allowedTypes.includes(file.type)) {
            showToast('error', `${file.name} is not a supported file type`);
            return;
        }

        // Create file entry
        const fileEntry = document.createElement('div');
        fileEntry.className = 'file-entry d-flex align-items-center p-2 border rounded mb-2';
        fileEntry.innerHTML = `
            <i class="bi bi-file-earmark-text me-2"></i>
            <span class="flex-grow-1">${file.name}</span>
            <span class="badge bg-success me-2">Valid</span>
            <button type="button" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
            </button>
        `;

        // Add remove functionality
        const removeBtn = fileEntry.querySelector('button');
        removeBtn.addEventListener('click', () => {
            fileEntry.remove();
            updateFormProgress();
        });

        uploadedFiles.appendChild(fileEntry);
        updateFormProgress();
    });
}

// Certificate Handling
function initializeCertificationHandling() {
    const certChecks = document.querySelectorAll('.cert-check');
    const otherCertInput = document.getElementById('otherCert');

    certChecks.forEach(check => {
        check.addEventListener('change', () => {
            if (check.value === 'Other') {
                otherCertInput.disabled = !check.checked;
                if (!check.checked) otherCertInput.value = '';
            }
            updateFormProgress();
        });
    });
}

// Product Categories
function initializeProductCategories() {
    const categorySelect = document.getElementById('productCategories');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            updateFormProgress();
               });
    }
}

// Auto-save functionality
function setupAutoSave() {
    let timeout;
    const form = document.getElementById('supplierForm');
    
    const saveFormData = () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem('supplierFormDraft', JSON.stringify(data));
        showToast('info', 'Draft saved automatically');
    };

    form.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(saveFormData, 2000); // Save after 2 seconds of inactivity
    });

    // Load saved draft
    const savedData = localStorage.getItem('supplierFormDraft');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
        });
    }
}

// Progress Tracking
function updateFormProgress() {
    const form = document.getElementById('supplierForm');
    const requiredFields = form.querySelectorAll('[required]');
    const totalRequired = requiredFields.length;
    let completed = 0;

    requiredFields.forEach(field => {
        if (field.value.trim() !== '') completed++;
    });

    // Check file uploads
    const uploadedFiles = document.getElementById('uploadedFiles');
    if (uploadedFiles.children.length > 0) completed++;

    const progress = (completed / (totalRequired + 1)) * 100;
    updateProgressBar(progress);
}

function updateProgressBar(progress) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${Math.round(progress)}%`;
    }
}

// Toast Notifications
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

// Initialize Assessment Form
function initializeAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const recommendationSelect = document.getElementById('recommendation');
    const evidenceUploadZone = document.getElementById('evidenceUploadZone');
    const evidenceFileInput = document.getElementById('evidenceFileInput');
    const resetAssessmentBtn = document.getElementById('resetAssessment');
    const submitForApprovalBtn = document.getElementById('submitForApproval');

    if (assessmentForm) {
        // Set default assessment date
        document.getElementById('assessmentDate').valueAsDate = new Date();

        // Load suppliers
        loadSuppliers();

        // Handle star rating interactions
        ratingStars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                const wrapper = e.target.closest('.rating-input-wrapper');
                const stars = wrapper.querySelectorAll('.rating-stars i');
                const ratingText = wrapper.querySelector('.rating-text');

                // Update stars display
                stars.forEach(s => {
                    s.classList.remove('active');
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('active');
                    }
                });

                // Update rating text
                const texts = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
                ratingText.textContent = texts[rating - 1];

                // Calculate new total score
                calculateTotalScore();
            });
        });

        // Calculate total score from ratings
        function calculateTotalScore() {
            let totalScore = 0;
            const weights = {
                'quality-system': 30,
                'technical': 25,
                'financial': 20,
                'delivery': 15,
                'service': 10
            };

            document.querySelectorAll('.rating-input-wrapper').forEach(wrapper => {
                const category = wrapper.dataset.category;
                const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
                const weight = weights[category] || parseInt(wrapper.dataset.weight);
                const categoryScore = (activeStars * weight) / 5;
                totalScore += categoryScore;
                
                // Update category score display if it exists
                const categoryScoreElement = wrapper.querySelector('.category-score');
                if (categoryScoreElement) {
                    categoryScoreElement.textContent = `${categoryScore}/${weight}`;
                }
            });

            // Update total score
            const totalScoreElement = document.getElementById('totalScore');
            if (totalScoreElement) {
                totalScoreElement.textContent = Math.round(totalScore);
                updateAssessmentStatus(totalScore);
            }
        }

        // Update assessment status based on score
        function updateAssessmentStatus(score) {
            const statusElement = document.getElementById('assessmentStatus');
            const recommendationSelect = document.getElementById('recommendation');
            const riskLevelSelect = document.getElementById('riskLevel');
            
            statusElement.classList.remove('text-success', 'text-warning', 'text-danger');

            if (score >= 80) {
                statusElement.textContent = 'APPROVED';
                statusElement.classList.add('text-success');
                recommendationSelect.value = 'approve';
                riskLevelSelect.value = score >= 90 ? 'low' : 'medium';
            } else if (score >= 60) {
                statusElement.textContent = 'CONDITIONAL';
                statusElement.classList.add('text-warning');
                recommendationSelect.value = 'conditional';
                riskLevelSelect.value = 'medium';
            } else {
                statusElement.textContent = 'REJECTED';
                statusElement.classList.add('text-danger');
                recommendationSelect.value = 'reject';
                riskLevelSelect.value = 'high';
            }

            // Update status indicators
            updateStatusIndicators(score);
        }

        // Update visual indicators based on assessment score
        function updateStatusIndicators(score) {
            const indicators = {
                'quality-system': document.querySelector('[data-category="quality-system"] .rating-status'),
                'technical': document.querySelector('[data-category="technical"] .rating-status'),
                'financial': document.querySelector('[data-category="financial"] .rating-status'),
                'delivery': document.querySelector('[data-category="delivery"] .rating-status'),
                'service': document.querySelector('[data-category="service"] .rating-status')
            };

            Object.entries(indicators).forEach(([category, element]) => {
                if (element) {
                    const categoryScore = calculateCategoryScore(category);
                    element.className = 'rating-status badge';
                    if (categoryScore >= 80) {
                        element.classList.add('bg-success');
                        element.textContent = 'PASS';
                    } else if (categoryScore >= 60) {
                        element.classList.add('bg-warning');
                        element.textContent = 'NEEDS IMPROVEMENT';
                    } else {
                        element.classList.add('bg-danger');
                        element.textContent = 'FAIL';
                    }
                }
            });
        }

        // Calculate score for a specific category
        function calculateCategoryScore(category) {
            const wrapper = document.querySelector(`[data-category="${category}"]`);
            if (!wrapper) return 0;

            const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
            return (activeStars * 100) / 5;
        }

        // Auto-generate reference number
        function generateReferenceNo(supplier) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `SA-${year}${month}-${supplier}-${sequence}`;
        }

        // Handle supplier selection
        const supplierSelect = document.getElementById('supplierName');
        if (supplierSelect) {
            supplierSelect.addEventListener('change', () => {
                if (supplierSelect.value) {
                    document.getElementById('referenceNo').value = generateReferenceNo(supplierSelect.value);
                }
            });
        }

        // Handle evidence file upload
        initializeEvidenceUpload();

        // Reset assessment form
        resetAssessmentBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the assessment? All ratings and notes will be cleared.')) {
                // Reset star ratings
                ratingStars.forEach(star => star.classList.remove('active'));
                document.querySelectorAll('.rating-text').forEach(text => text.textContent = '');

                // Reset form fields
                assessmentForm.reset();
                document.getElementById('assessmentDate').valueAsDate = new Date();
                document.getElementById('totalScore').textContent = '0';
                document.getElementById('assessmentStatus').textContent = '-';
                document.getElementById('uploadedEvidence').innerHTML = '';

                showToast('info', 'Assessment form has been reset');
            }
        });

        // Submit for approval
        submitForApprovalBtn.addEventListener('click', () => {
            if (validateAssessmentForm()) {
                const score = parseInt(document.getElementById('totalScore').textContent);
                const status = document.getElementById('assessmentStatus').textContent;
                const recommendation = recommendationSelect.value;

                // Simulate API call
                setTimeout(() => {
                    showToast('success', `Assessment submitted for approval (Score: ${score}, Status: ${status})`);
                }, 1000);
            } else {
                showToast('error', 'Please complete all required fields and ratings');
            }
        });

        // Form validation
        assessmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateAssessmentForm()) {
                // Simulate saving
                showToast('success', 'Assessment saved successfully');
            }
        });
    }
}

// Initialize evidence file upload handling
function initializeEvidenceUpload() {
    const uploadZone = document.getElementById('evidenceUploadZone');
    const fileInput = document.getElementById('evidenceFileInput');
    const uploadedList = document.getElementById('uploadedEvidence');

    if (uploadZone && fileInput) {
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-primary');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-primary');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-primary');
            handleEvidenceFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            handleEvidenceFiles(fileInput.files);
        });
    }
}

// Handle evidence file upload
function handleEvidenceFiles(files) {
    const uploadedList = document.getElementById('uploadedEvidence');
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    Array.from(files).forEach(file => {
        if (allowedTypes.includes(file.type)) {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file d-flex align-items-center gap-2 mb-2';
            fileItem.innerHTML = `
                <i class="bi bi-file-earmark-text"></i>
                <span class="flex-grow-1">${file.name}</span>
                <small class="text-muted">${formatFileSize(file.size)}</small>
                <button type="button" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            // Add remove functionality
            fileItem.querySelector('button').addEventListener('click', () => {
                fileItem.remove();
                validateAssessmentForm();
            });

            uploadedList.appendChild(fileItem);
        } else {
            showToast('error', `Invalid file type: ${file.name}`);
        }
    });

    validateAssessmentForm();
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate assessment form
function validateAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    const requiredFields = assessmentForm.querySelectorAll('[required]');
    const ratingWrappers = document.querySelectorAll('.rating-input-wrapper');
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

    // Check ratings
    ratingWrappers.forEach(wrapper => {
        const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
        if (activeStars === 0) {
            wrapper.classList.add('border', 'border-danger');
            isValid = false;
        } else {
            wrapper.classList.remove('border', 'border-danger');
        }
    });

    // Check evidence files
    const evidenceFiles = document.getElementById('uploadedEvidence').children.length;
    if (evidenceFiles === 0) {
        document.getElementById('evidenceUploadZone').classList.add('border', 'border-danger');
        isValid = false;
    } else {
        document.getElementById('evidenceUploadZone').classList.remove('border', 'border-danger');
    }

    // Check risk assessment
    const riskLevel = document.getElementById('riskLevel').value;
    if (!riskLevel) {
        document.getElementById('riskLevel').classList.add('is-invalid');
        isValid = false;
    }

    if (!isValid) {
        showToast('error', 'Please complete all required fields, including ratings, evidence files, and risk assessment');
    }

    return isValid;
}

// Initialize Purchase Order Form
function initializePOForm() {
    const poForm = document.getElementById('poForm');
    const addLineItemBtn = document.getElementById('addLineItem');
    const lineItemsTable = document.getElementById('lineItemsTable');
    const saveDraftBtn = document.getElementById('saveDraft');

    if (poForm) {
        // Set minimum date to today
        const dateInputs = poForm.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            input.min = today;
        });

        // Add line item
        addLineItemBtn.addEventListener('click', () => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" class="form-control form-control-sm item-code" required></td>
                <td><input type="text" class="form-control form-control-sm" required></td>
                <td><input type="number" class="form-control form-control-sm quantity" required min="1"></td>
                <td>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control form-control-sm unit-price" required min="0" step="0.01">
                    </div>
                </td>
                <td>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="text" class="form-control form-control-sm line-total" readonly>
                    </div>
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info check-stock">
                        <i class="bi bi-box-seam"></i>
                    </button>
                </td>
            `;
            lineItemsTable.querySelector('tbody').appendChild(newRow);
            initializeNewRow(newRow);
        });

        // Initialize existing rows
        lineItemsTable.querySelectorAll('tbody tr').forEach(row => {
            initializeNewRow(row);
        });

        // Save as draft
        saveDraftBtn.addEventListener('click', () => {
            savePODraft();
        });

        // Form submission
        poForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validatePOForm()) {
                submitPOForApproval();
            }
        });
    }
}

// Initialize a new line item row
function initializeNewRow(row) {
    // Remove item
    row.querySelector('.remove-item').addEventListener('click', () => {
        row.remove();
        calculateTotals();
    });

    // Check stock
    row.querySelector('.check-stock').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const itemCode = row.querySelector('.item-code').value;
        if (itemCode) {
            checkStockLevel(itemCode, btn);
        } else {
            showToast('warning', 'Please enter an item code first');
        }
    });

    // Calculate line total on input
    const qtyInput = row.querySelector('.quantity');
    const priceInput = row.querySelector('.unit-price');
    const lineTotalInput = row.querySelector('.line-total');

    [qtyInput, priceInput].forEach(input => {
        input.addEventListener('input', () => {
            const qty = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            lineTotalInput.value = (qty * price).toFixed(2);
            calculateTotals();
        });
    });

    // Validate item code
    const itemCodeInput = row.querySelector('.item-code');
    itemCodeInput.addEventListener('change', () => {
        validateItemCode(itemCodeInput);
    });
}

// Calculate order totals
function calculateTotals() {
    const lineTotals = Array.from(document.querySelectorAll('.line-total'))
        .map(input => parseFloat(input.value) || 0);
    
    const subtotal = lineTotals.reduce((sum, total) => sum + total, 0);
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    // Check budget limit
    const budgetWarning = document.getElementById('budgetWarning');
    if (total > 10000) { // Example budget limit
        budgetWarning.classList.remove('d-none');
    } else {
        budgetWarning.classList.add('d-none');
    }
}

// Simulate stock level check
async function checkStockLevel(itemCode, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';

    try {
        // Simulate API call
        const response = await new Promise(resolve => {
            setTimeout(() => {
                const stock = Math.floor(Math.random() * 1000);
                resolve({
                    itemCode,
                    stock,
                    status: stock > 100 ? 'available' : stock > 20 ? 'low' : 'out'
                });
            }, 1000);
        });

        // Show stock status
        const statusClass = {
            available: 'stock-available',
            low: 'stock-low',
            out: 'stock-out'
        }[response.status];

        const statusText = {
            available: 'In Stock',
            low: 'Low Stock',
            out: 'Out of Stock'
        }[response.status];

        btn.innerHTML = `<span class="stock-status ${statusClass}">${statusText}</span>`;
    } catch (error) {
        showToast('error', 'Failed to check stock level');
        btn.innerHTML = '<i class="bi bi-box-seam"></i>';
    } finally {
        btn.disabled = false;
    }
}

// Validate item code
async function validateItemCode(input) {
    const itemCode = input.value.trim().toUpperCase();
    input.value = itemCode;

    if (itemCode) {
        // Simulate API call
        const isValid = await new Promise(resolve => {
            setTimeout(() => {
                resolve(/^[A-Z]{2}\d{4}$/.test(itemCode));
            }, 500);
        });

        if (isValid) {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            showToast('error', 'Invalid item code format. Use AA0000 format.');
        }
    }
}

// Save PO as draft
function savePODraft() {
    // Simulate saving
    setTimeout(() => {
        showToast('success', 'Purchase Order saved as draft');
    }, 1000);
}

// Submit PO for approval
function submitPOForApproval() {
    // Simulate submission
    setTimeout(() => {
        showToast('success', 'Purchase Order submitted for approval');
        const modal = bootstrap.Modal.getInstance(document.getElementById('newPOModal'));
        modal.hide();
    }, 1000);
}

// Validate PO form
function validatePOForm() {
    const form = document.getElementById('poForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    // Check if there are any line items
    const lineItems = document.querySelectorAll('#lineItemsTable tbody tr');
    if (lineItems.length === 0) {
        showToast('error', 'Please add at least one line item');
        isValid = false;
    }

    // Validate dates
    const dateInputs = form.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (input.value < today) {
            input.classList.add('is-invalid');
            isValid = false;
            showToast('error', 'Dates cannot be in the past');
        }
    });

    return isValid;
}

// Initialize PO form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeFileUpload();
    initializeCertificationHandling();
    initializeProductCategories();
    setupAutoSave();
    initializeAssessmentForm();
    initializePOForm();
    
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Company Name Verification
    const verifyCompanyBtn = document.querySelector('#verifyCompany');
    if (verifyCompanyBtn) {
        verifyCompanyBtn.addEventListener('click', async () => {
            const companyInput = document.querySelector('#companyName');
            const feedback = document.querySelector('#companyFeedback');
            
            try {
                // Simulate API call
                await simulateVerification(companyInput.value);
                companyInput.classList.add('is-valid');
                companyInput.classList.remove('is-invalid');
                feedback.textContent = 'Company verified successfully!';
            } catch (error) {
                companyInput.classList.add('is-invalid');
                companyInput.classList.remove('is-valid');
                feedback.textContent = error.message;
            }
        });
    }

    // File Upload Handling
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('upload-zone-active');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('upload-zone-active');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('upload-zone-active');
            handleFileUpload(e.dataTransfer.files);
        });
    }

    // Rating System
    const ratingInputs = document.querySelectorAll('.rating-input');
    ratingInputs.forEach(input => {
        input.addEventListener('change', updateSupplierScore);
    });

    // Purchase Order Calculations
    setupPOCalculations();

    // Quality Control Checklist
    setupQCChecklist();

    // Load suppliers
    loadSuppliers();
});

// Simulated API Calls
async function simulateVerification(companyName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (companyName.length > 3) {
                resolve({ status: 'verified' });
            } else {
                reject(new Error('Invalid company name'));
            }
        }, 1000);
    });
}

// Load suppliers into the dropdown
async function loadSuppliers() {
    const supplierSelect = document.getElementById('supplierName');
    if (!supplierSelect) return;

    // Simulate API call to load suppliers
    const suppliers = [
        { id: '1', name: 'Supplier A', type: 'manufacturer', status: 'active' },
        { id: '2', name: 'Supplier B', type: 'distributor', status: 'active' },
        { id: '3', name: 'Supplier C', type: 'service', status: 'inactive' }
    ];

    // Clear existing options except the first one
    while (supplierSelect.options.length > 1) {
        supplierSelect.remove(1);
    }

    // Add suppliers to dropdown
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        option.disabled = supplier.status === 'inactive';
        supplierSelect.appendChild(option);
    });

    // Handle selection change
    supplierSelect.addEventListener('change', handleSupplierSelection);
}

// Handle supplier selection
function handleSupplierSelection(event) {
    const referenceInput = document.getElementById('referenceNo');
    if (event.target.value) {
        referenceInput.value = generateReferenceNo(event.target.value);
    } else {
        referenceInput.value = '';
    }
}

// Generate unique reference number for assessment
function generateReferenceNo(supplierId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SA-${year}${month}-${supplierId}-${sequence}`;
}

// Purchase Order Calculations
function setupPOCalculations() {
    const poForm = document.querySelector('#poForm');
    if (poForm) {
        poForm.addEventListener('input', (e) => {
            if (e.target.classList.contains('qty') || e.target.classList.contains('price')) {
                calculateLineTotal(e.target.closest('tr'));
                calculateGrandTotal();
            }
        });
    }
}

function calculateLineTotal(row) {
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const total = qty * price;
    row.querySelector('.line-total').textContent = total.toFixed(2);
}

function calculateGrandTotal() {
    const lineTotals = document.querySelectorAll('.line-total');
    const grandTotal = Array.from(lineTotals).reduce((sum, element) => {
        return sum + (parseFloat(element.textContent) || 0);
    }, 0);
    document.querySelector('#grandTotal').textContent = grandTotal.toFixed(2);
}

// Quality Control Checklist
function setupQCChecklist() {
    const checklistItems = document.querySelectorAll('.qc-check');
    checklistItems.forEach(item => {
        item.addEventListener('change', updateQCStatus);
    });
}

function updateQCStatus() {
    const totalChecks = document.querySelectorAll('.qc-check').length;
    const checkedItems = document.querySelectorAll('.qc-check:checked').length;
    const progress = (checkedItems / totalChecks) * 100;
    
    const progressBar = document.querySelector('#qcProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
    }

    // Update status indicator
    const status = document.querySelector('#qcStatus');
    if (status) {
        if (progress === 100) {
            status.className = 'status-indicator status-success';
            status.textContent = 'Complete';
        } else if (progress > 50) {
            status.className = 'status-indicator status-warning';
            status.textContent = 'In Progress';
        } else {
            status.className = 'status-indicator status-danger';
            status.textContent = 'Incomplete';
        }
    }
}

// Supplier Rating Calculation
function updateSupplierScore() {
    const ratings = document.querySelectorAll('.rating-input');
    const totalScore = Array.from(ratings).reduce((sum, input) => {
        return sum + (parseInt(input.value) || 0);
    }, 0);
    const averageScore = totalScore / ratings.length;
    
    const scoreDisplay = document.querySelector('#supplierScore');
    if (scoreDisplay) {
        scoreDisplay.textContent = averageScore.toFixed(1);
        updateSupplierStatus(averageScore);
    }
}

function updateSupplierStatus(score) {
    const status = document.querySelector('#supplierStatus');
    if (status) {
        if (score >= 4) {
            status.className = 'status-indicator status-success';
            status.textContent = 'Approved';
        } else if (score >= 3) {
            status.className = 'status-indicator status-warning';
            status.textContent = 'Conditional';
        } else {
            status.className = 'status-indicator status-danger';
            status.textContent = 'Not Approved';
        }
    }
}

// File Upload Handling
// Enhanced File Upload Handling
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    if (uploadZone && fileInput) {
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    }
}

function handleFiles(files) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    Array.from(files).forEach(file => {
        // Validate file
        if (file.size > maxFileSize) {
            showToast('error', `${file.name} is too large. Maximum size is 5MB`);
            return;
        }
        if (!allowedTypes.includes(file.type)) {
            showToast('error', `${file.name} is not a supported file type`);
            return;
        }

        // Create file entry
        const fileEntry = document.createElement('div');
        fileEntry.className = 'file-entry d-flex align-items-center p-2 border rounded mb-2';
        fileEntry.innerHTML = `
            <i class="bi bi-file-earmark-text me-2"></i>
            <span class="flex-grow-1">${file.name}</span>
            <span class="badge bg-success me-2">Valid</span>
            <button type="button" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
            </button>
        `;

        // Add remove functionality
        const removeBtn = fileEntry.querySelector('button');
        removeBtn.addEventListener('click', () => {
            fileEntry.remove();
            updateFormProgress();
        });

        uploadedFiles.appendChild(fileEntry);
        updateFormProgress();
    });
}

// Certificate Handling
function initializeCertificationHandling() {
    const certChecks = document.querySelectorAll('.cert-check');
    const otherCertInput = document.getElementById('otherCert');

    certChecks.forEach(check => {
        check.addEventListener('change', () => {
            if (check.value === 'Other') {
                otherCertInput.disabled = !check.checked;
                if (!check.checked) otherCertInput.value = '';
            }
            updateFormProgress();
        });
    });
}

// Product Categories
function initializeProductCategories() {
    const categorySelect = document.getElementById('productCategories');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            updateFormProgress();
               });
    }
}

// Auto-save functionality
function setupAutoSave() {
    let timeout;
    const form = document.getElementById('supplierForm');
    
    const saveFormData = () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem('supplierFormDraft', JSON.stringify(data));
        showToast('info', 'Draft saved automatically');
    };

    form.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(saveFormData, 2000); // Save after 2 seconds of inactivity
    });

    // Load saved draft
    const savedData = localStorage.getItem('supplierFormDraft');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = value;
        });
    }
}

// Progress Tracking
function updateFormProgress() {
    const form = document.getElementById('supplierForm');
    const requiredFields = form.querySelectorAll('[required]');
    const totalRequired = requiredFields.length;
    let completed = 0;

    requiredFields.forEach(field => {
        if (field.value.trim() !== '') completed++;
    });

    // Check file uploads
    const uploadedFiles = document.getElementById('uploadedFiles');
    if (uploadedFiles.children.length > 0) completed++;

    const progress = (completed / (totalRequired + 1)) * 100;
    updateProgressBar(progress);
}

function updateProgressBar(progress) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${Math.round(progress)}%`;
    }
}

// Toast Notifications
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

// Initialize Assessment Form
function initializeAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const recommendationSelect = document.getElementById('recommendation');
    const evidenceUploadZone = document.getElementById('evidenceUploadZone');
    const evidenceFileInput = document.getElementById('evidenceFileInput');
    const resetAssessmentBtn = document.getElementById('resetAssessment');
    const submitForApprovalBtn = document.getElementById('submitForApproval');

    if (assessmentForm) {
        // Set default assessment date
        document.getElementById('assessmentDate').valueAsDate = new Date();

        // Load suppliers
        loadSuppliers();

        // Handle star rating interactions
        ratingStars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                const wrapper = e.target.closest('.rating-input-wrapper');
                const stars = wrapper.querySelectorAll('.rating-stars i');
                const ratingText = wrapper.querySelector('.rating-text');

                // Update stars display
                stars.forEach(s => {
                    s.classList.remove('active');
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('active');
                    }
                });

                // Update rating text
                const texts = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
                ratingText.textContent = texts[rating - 1];

                // Calculate new total score
                calculateTotalScore();
            });
        });

        // Calculate total score from ratings
        function calculateTotalScore() {
            let totalScore = 0;
            const weights = {
                'quality-system': 30,
                'technical': 25,
                'financial': 20,
                'delivery': 15,
                'service': 10
            };

            document.querySelectorAll('.rating-input-wrapper').forEach(wrapper => {
                const category = wrapper.dataset.category;
                const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
                const weight = weights[category] || parseInt(wrapper.dataset.weight);
                const categoryScore = (activeStars * weight) / 5;
                totalScore += categoryScore;
                
                // Update category score display if it exists
                const categoryScoreElement = wrapper.querySelector('.category-score');
                if (categoryScoreElement) {
                    categoryScoreElement.textContent = `${categoryScore}/${weight}`;
                }
            });

            // Update total score
            const totalScoreElement = document.getElementById('totalScore');
            if (totalScoreElement) {
                totalScoreElement.textContent = Math.round(totalScore);
                updateAssessmentStatus(totalScore);
            }
        }

        // Update assessment status based on score
        function updateAssessmentStatus(score) {
            const statusElement = document.getElementById('assessmentStatus');
            const recommendationSelect = document.getElementById('recommendation');
            const riskLevelSelect = document.getElementById('riskLevel');
            
            statusElement.classList.remove('text-success', 'text-warning', 'text-danger');

            if (score >= 80) {
                statusElement.textContent = 'APPROVED';
                statusElement.classList.add('text-success');
                recommendationSelect.value = 'approve';
                riskLevelSelect.value = score >= 90 ? 'low' : 'medium';
            } else if (score >= 60) {
                statusElement.textContent = 'CONDITIONAL';
                statusElement.classList.add('text-warning');
                recommendationSelect.value = 'conditional';
                riskLevelSelect.value = 'medium';
            } else {
                statusElement.textContent = 'REJECTED';
                statusElement.classList.add('text-danger');
                recommendationSelect.value = 'reject';
                riskLevelSelect.value = 'high';
            }

            // Update status indicators
            updateStatusIndicators(score);
        }

        // Update visual indicators based on assessment score
        function updateStatusIndicators(score) {
            const indicators = {
                'quality-system': document.querySelector('[data-category="quality-system"] .rating-status'),
                'technical': document.querySelector('[data-category="technical"] .rating-status'),
                'financial': document.querySelector('[data-category="financial"] .rating-status'),
                'delivery': document.querySelector('[data-category="delivery"] .rating-status'),
                'service': document.querySelector('[data-category="service"] .rating-status')
            };

            Object.entries(indicators).forEach(([category, element]) => {
                if (element) {
                    const categoryScore = calculateCategoryScore(category);
                    element.className = 'rating-status badge';
                    if (categoryScore >= 80) {
                        element.classList.add('bg-success');
                        element.textContent = 'PASS';
                    } else if (categoryScore >= 60) {
                        element.classList.add('bg-warning');
                        element.textContent = 'NEEDS IMPROVEMENT';
                    } else {
                        element.classList.add('bg-danger');
                        element.textContent = 'FAIL';
                    }
                }
            });
        }

        // Calculate score for a specific category
        function calculateCategoryScore(category) {
            const wrapper = document.querySelector(`[data-category="${category}"]`);
            if (!wrapper) return 0;

            const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
            return (activeStars * 100) / 5;
        }

        // Auto-generate reference number
        function generateReferenceNo(supplier) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `SA-${year}${month}-${supplier}-${sequence}`;
        }

        // Handle supplier selection
        const supplierSelect = document.getElementById('supplierName');
        if (supplierSelect) {
            supplierSelect.addEventListener('change', () => {
                if (supplierSelect.value) {
                    document.getElementById('referenceNo').value = generateReferenceNo(supplierSelect.value);
                }
            });
        }

        // Handle evidence file upload
        initializeEvidenceUpload();

        // Reset assessment form
        resetAssessmentBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the assessment? All ratings and notes will be cleared.')) {
                // Reset star ratings
                ratingStars.forEach(star => star.classList.remove('active'));
                document.querySelectorAll('.rating-text').forEach(text => text.textContent = '');

                // Reset form fields
                assessmentForm.reset();
                document.getElementById('assessmentDate').valueAsDate = new Date();
                document.getElementById('totalScore').textContent = '0';
                document.getElementById('assessmentStatus').textContent = '-';
                document.getElementById('uploadedEvidence').innerHTML = '';

                showToast('info', 'Assessment form has been reset');
            }
        });

        // Submit for approval
        submitForApprovalBtn.addEventListener('click', () => {
            if (validateAssessmentForm()) {
                const score = parseInt(document.getElementById('totalScore').textContent);
                const status = document.getElementById('assessmentStatus').textContent;
                const recommendation = recommendationSelect.value;

                // Simulate API call
                setTimeout(() => {
                    showToast('success', `Assessment submitted for approval (Score: ${score}, Status: ${status})`);
                }, 1000);
            } else {
                showToast('error', 'Please complete all required fields and ratings');
            }
        });

        // Form validation
        assessmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateAssessmentForm()) {
                // Simulate saving
                showToast('success', 'Assessment saved successfully');
            }
        });
    }
}

// Initialize evidence file upload handling
function initializeEvidenceUpload() {
    const uploadZone = document.getElementById('evidenceUploadZone');
    const fileInput = document.getElementById('evidenceFileInput');
    const uploadedList = document.getElementById('uploadedEvidence');

    if (uploadZone && fileInput) {
        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-primary');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-primary');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-primary');
            handleEvidenceFiles(e.dataTransfer.files);
        });

        // Click to upload
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            handleEvidenceFiles(fileInput.files);
        });
    }
}

// Handle evidence file upload
function handleEvidenceFiles(files) {
    const uploadedList = document.getElementById('uploadedEvidence');
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    Array.from(files).forEach(file => {
        if (allowedTypes.includes(file.type)) {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file d-flex align-items-center gap-2 mb-2';
            fileItem.innerHTML = `
                <i class="bi bi-file-earmark-text"></i>
                <span class="flex-grow-1">${file.name}</span>
                <small class="text-muted">${formatFileSize(file.size)}</small>
                <button type="button" class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            // Add remove functionality
            fileItem.querySelector('button').addEventListener('click', () => {
                fileItem.remove();
                validateAssessmentForm();
            });

            uploadedList.appendChild(fileItem);
        } else {
            showToast('error', `Invalid file type: ${file.name}`);
        }
    });

    validateAssessmentForm();
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate assessment form
function validateAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    const requiredFields = assessmentForm.querySelectorAll('[required]');
    const ratingWrappers = document.querySelectorAll('.rating-input-wrapper');
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

    // Check ratings
    ratingWrappers.forEach(wrapper => {
        const activeStars = wrapper.querySelectorAll('.rating-stars i.active').length;
        if (activeStars === 0) {
            wrapper.classList.add('border', 'border-danger');
            isValid = false;
        } else {
            wrapper.classList.remove('border', 'border-danger');
        }
    });

    // Check evidence files
    const evidenceFiles = document.getElementById('uploadedEvidence').children.length;
    if (evidenceFiles === 0) {
        document.getElementById('evidenceUploadZone').classList.add('border', 'border-danger');
        isValid = false;
    } else {
        document.getElementById('evidenceUploadZone').classList.remove('border', 'border-danger');
    }

    // Check risk assessment
    const riskLevel = document.getElementById('riskLevel').value;
    if (!riskLevel) {
        document.getElementById('riskLevel').classList.add('is-invalid');
        isValid = false;
    }

    if (!isValid) {
        showToast('error', 'Please complete all required fields, including ratings, evidence files, and risk assessment');
    }

    return isValid;
}

// Initialize Purchase Order Form
function initializePOForm() {
    const poForm = document.getElementById('poForm');
    const addLineItemBtn = document.getElementById('addLineItem');
    const lineItemsTable = document.getElementById('lineItemsTable');
    const saveDraftBtn = document.getElementById('saveDraft');

    if (poForm) {
        // Set minimum date to today
        const dateInputs = poForm.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            input.min = today;
        });

        // Add line item
        addLineItemBtn.addEventListener('click', () => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" class="form-control form-control-sm item-code" required></td>
                <td><input type="text" class="form-control form-control-sm" required></td>
                <td><input type="number" class="form-control form-control-sm quantity" required min="1"></td>
                <td>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="number" class="form-control form-control-sm unit-price" required min="0" step="0.01">
                    </div>
                </td>
                <td>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text">$</span>
                        <input type="text" class="form-control form-control-sm line-total" readonly>
                    </div>
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info check-stock">
                        <i class="bi bi-box-seam"></i>
                    </button>
                </td>
            `;
            lineItemsTable.querySelector('tbody').appendChild(newRow);
            initializeNewRow(newRow);
        });

        // Initialize existing rows
        lineItemsTable.querySelectorAll('tbody tr').forEach(row => {
            initializeNewRow(row);
        });

        // Save as draft
        saveDraftBtn.addEventListener('click', () => {
            savePODraft();
        });

        // Form submission
        poForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validatePOForm()) {
                submitPOForApproval();
            }
        });
    }
}

// Initialize a new line item row
function initializeNewRow(row) {
    // Remove item
    row.querySelector('.remove-item').addEventListener('click', () => {
        row.remove();
        calculateTotals();
    });

    // Check stock
    row.querySelector('.check-stock').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const itemCode = row.querySelector('.item-code').value;
        if (itemCode) {
            checkStockLevel(itemCode, btn);
        } else {
            showToast('warning', 'Please enter an item code first');
        }
    });

    // Calculate line total on input
    const qtyInput = row.querySelector('.quantity');
    const priceInput = row.querySelector('.unit-price');
    const lineTotalInput = row.querySelector('.line-total');

    [qtyInput, priceInput].forEach(input => {
        input.addEventListener('input', () => {
            const qty = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            lineTotalInput.value = (qty * price).toFixed(2);
            calculateTotals();
        });
    });

    // Validate item code
    const itemCodeInput = row.querySelector('.item-code');
    itemCodeInput.addEventListener('change', () => {
        validateItemCode(itemCodeInput);
    });
}

// Calculate order totals
function calculateTotals() {
    const lineTotals = Array.from(document.querySelectorAll('.line-total'))
        .map(input => parseFloat(input.value) || 0);
    
    const subtotal = lineTotals.reduce((sum, total) => sum + total, 0);
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    // Check budget limit
    const budgetWarning = document.getElementById('budgetWarning');
    if (total > 10000) { // Example budget limit
        budgetWarning.classList.remove('d-none');
    } else {
        budgetWarning.classList.add('d-none');
    }
}

// Simulate stock level check
async function checkStockLevel(itemCode, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';

    try {
        // Simulate API call
        const response = await new Promise(resolve => {
            setTimeout(() => {
                const stock = Math.floor(Math.random() * 1000);
                resolve({
                    itemCode,
                    stock,
                    status: stock > 100 ? 'available' : stock > 20 ? 'low' : 'out'
                });
            }, 1000);
        });

        // Show stock status
        const statusClass = {
            available: 'stock-available',
            low: 'stock-low',
            out: 'stock-out'
        }[response.status];

        const statusText = {
            available: 'In Stock',
            low: 'Low Stock',
            out: 'Out of Stock'
        }[response.status];

        btn.innerHTML = `<span class="stock-status ${statusClass}">${statusText}</span>`;
    } catch (error) {
        showToast('error', 'Failed to check stock level');
        btn.innerHTML = '<i class="bi bi-box-seam"></i>';
    } finally {
        btn.disabled = false;
    }
}

// Validate item code
async function validateItemCode(input) {
    const itemCode = input.value.trim().toUpperCase();
    input.value = itemCode;

    if (itemCode) {
        // Simulate API call
        const isValid = await new Promise(resolve => {
            setTimeout(() => {
                resolve(/^[A-Z]{2}\d{4}$/.test(itemCode));
            }, 500);
        });

        if (isValid) {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            showToast('error', 'Invalid item code format. Use AA0000 format.');
        }
    }
}

// Save PO as draft
function savePODraft() {
    // Simulate saving
    setTimeout(() => {
        showToast('success', 'Purchase Order saved as draft');
    }, 1000);
}

// Submit PO for approval
function submitPOForApproval() {
    // Simulate submission
    setTimeout(() => {
        showToast('success', 'Purchase Order submitted for approval');
        const modal = bootstrap.Modal.getInstance(document.getElementById('newPOModal'));
        modal.hide();
    }, 1000);
}

// Validate PO form
function validatePOForm() {
    const form = document.getElementById('poForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    // Check if there are any line items
    const lineItems = document.querySelectorAll('#lineItemsTable tbody tr');
    if (lineItems.length === 0) {
        showToast('error', 'Please add at least one line item');
        isValid = false;
    }

    // Validate dates
    const dateInputs = form.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (input.value < today) {
            input.classList.add('is-invalid');
            isValid = false;
            showToast('error', 'Dates cannot be in the past');
        }
    });

    return isValid;
}