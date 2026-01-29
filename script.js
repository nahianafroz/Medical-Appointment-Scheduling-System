// ============= GLOBAL VARIABLES =============
let selectedDoctor = null;
let selectedSlot = null;
let currentPaymentData = null;
let paymentType = null;

// ============= ANIMATED BACKGROUND CREATION =============
function createAnimatedBackground() {
    const background = document.getElementById('animatedBackground');
    const medicalIcons = ['🩺', '💊', '💉', '🫀', '🫁', '🧠', '❤️', '🦷', '👁️', '🏥', '🚑', '💊', '🩹', '🌡️', '🩸'];

    for (let i = 0; i < 20; i++) {
        const icon = document.createElement('div');
        icon.className = 'medical-icon';
        icon.textContent = medicalIcons[Math.floor(Math.random() * medicalIcons.length)];

        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;

        // Random size
        const size = 20 + Math.random() * 40;

        // Random animation delay and duration
        const delay = Math.random() * 5;
        const duration = 15 + Math.random() * 20;
        const moveDuration = 30 + Math.random() * 40;

        // Apply styles
        icon.style.left = `${posX}%`;
        icon.style.top = `${posY}%`;
        icon.style.fontSize = `${size}px`;
        icon.style.animation = `float ${duration}s ease-in-out ${delay}s infinite, moveRight ${moveDuration}s linear ${delay}s infinite`;
        icon.style.opacity = `${0.05 + Math.random() * 0.1}`;

        background.appendChild(icon);
    }
}

// ============= AUTHENTICATION SYSTEM =============
function showAuthForm(formType) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));

    if (formType === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('auth-alert').classList.add('hidden');
    } else {
        document.getElementById('signup-form').classList.add('active');
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('auth-alert').classList.add('hidden');
    }
}

function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.role-btn.${role}`).classList.add('selected');
    document.getElementById('selected-role').value = role;
}

function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const role = selectedRole;

    if (!name || !email || !password || !confirmPassword || !role) {
        showAuthAlert('Please fill in all fields and select a role.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAuthAlert('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    const existingUser = usersDB.find(u => u.email === email);

    if (existingUser) {
        showAuthAlert('An account with this email already exists!', 'error');
        return;
    }

    const newUser = {
        id: usersDB.length + 1,
        name: name,
        email: email,
        password: password,
        role: role,
        avatar: name.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString()
    };

    if (role === 'doctor') {
        const matchedDoctor = doctors.find(d =>
            d.name.toLowerCase() === name.toLowerCase()
        );

        if (matchedDoctor) {
            newUser.doctorId = matchedDoctor.id;
        } else {
            showAuthAlert('Sorry, only pre-registered doctors can create accounts. Please contact administration.', 'error');
            return;
        }
    }

    usersDB.push(newUser);

    saveToLocalStorage(STORAGE_KEYS.USERS, usersDB);

    showAuthAlert('Account created successfully! Please login.', 'success');

    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    selectedRole = '';

    setTimeout(() => {
        showAuthForm('login');
    }, 1500);
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthAlert('Please enter email and password.', 'error');
        return;
    }

    const user = usersDB.find(u => u.email === email && u.password === password);

    if (!user) {
        showAuthAlert('Invalid email or password!', 'error');
        return;
    }

    currentUser = user;
    saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    showMainApp();
}

function showAuthAlert(message, type) {
    const alertDiv = document.getElementById('auth-alert');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    alertDiv.classList.remove('hidden');
}

function showMainApp() {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    updateUserInfo();
    updateRoleBasedUI();
    initApp();
}

function updateUserInfo() {
    if (!currentUser) {
        logout();
        return;
    }

    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role === 'doctor' ? '👨‍⚕️ Doctor' : '👩‍💼 Staff';
    document.getElementById('user-avatar').textContent = currentUser.avatar;
    document.getElementById('user-avatar').style.background = currentUser.role === 'doctor' ? '#10b981' : '#0ea5e9';
}

function updateRoleBasedUI() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    sidebarMenu.innerHTML = '';

    if (currentUser.role === 'doctor') {
        // Doctor specific menu
        sidebarMenu.innerHTML = `
            <div class="menu-section">
                <div class="section-title">Doctor Dashboard</div>
                <button class="menu-item active" data-page="my-patients">
                    <i class="fas fa-users"></i>
                    <span class="menu-text">My Patients</span>
                    <span class="badge" id="patient-badge"></span>
                </button>
                <button class="menu-item" data-page="payment-history">
                    <i class="fas fa-money-bill-wave"></i>
                    <span class="menu-text">Payment History</span>
                    <span class="badge" id="payment-badge"></span>
                </button>
            </div>
        `;
        // Set default active tab
        setTimeout(() => {
            const menuItem = document.querySelector('.menu-item[data-page="my-patients"]');
            if (menuItem) {
                menuItem.click();
            }
        }, 100);
    } else {
        // Staff menu 
        sidebarMenu.innerHTML = `
            <div class="menu-section">
                <div class="section-title">Appointments</div>
                <button class="menu-item active" data-page="book-appointment">
                    <i class="fas fa-calendar-check"></i>
                    <span class="menu-text">Book Appointment</span>
                    <span class="badge" id="appointment-badge"></span>
                </button>
                <button class="menu-item" data-page="my-appointments">
                    <i class="fas fa-list-alt"></i>
                    <span class="menu-text">My Appointments</span>
                    <span class="badge" id="myappointment-badge"></span>
                </button>
                <button class="menu-item" data-page="emergency">
                    <i class="fas fa-ambulance"></i>
                    <span class="menu-text">Patient Queue</span>
                    <span class="badge" id="emergency-badge"></span>
                </button>
            </div>
            
            <div class="menu-section">
                <div class="section-title">Medical Tests</div>
                <button class="menu-item" data-page="test-booking">
                    <i class="fas fa-vial"></i>
                    <span class="menu-text">Test Booking</span>
                    <span class="badge" id="test-badge"></span>
                </button>
                <button class="menu-item" data-page="test-reports">
                    <i class="fas fa-file-medical-alt"></i>
                    <span class="menu-text">Test Reports</span>
                </button>
            </div>
            
            <div class="menu-section">
                <div class="section-title">Medical Records</div>
                <button class="menu-item" data-page="patient-history">
                    <i class="fas fa-history"></i>
                    <span class="menu-text">Patient History</span>
                </button>
                <button class="menu-item" data-page="doctor-info">
                    <i class="fas fa-user-md"></i>
                    <span class="menu-text">Doctor Info</span>
                </button>
            </div>
            
            <div class="menu-section">
                <div class="section-title">Payments</div>
                <button class="menu-item" data-page="payment-history">
                    <i class="fas fa-credit-card"></i>
                    <span class="menu-text">Payment History</span>
                    <span class="badge" id="payment-badge"></span>
                </button>
            </div>
        `;
        // Set default active tab
        setTimeout(() => {
            const menuItem = document.querySelector('.menu-item[data-page="book-appointment"]');
            if (menuItem) {
                menuItem.click();
            }
        }, 100);
    }

    setupMenuNavigation();

    // Add logout button functionality
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item:not(.logout)');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Get the page ID
            const pageId = this.dataset.page;

            // Switch to the selected tab
            switchTab(pageId);
        });
    });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
        currentUser = null;
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('auth-alert').classList.add('hidden');
        showAuthForm('login');

        // Reset mobile sidebar
        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.getElementById('mobileToggle');
        if (sidebar) sidebar.classList.remove('active');
        if (mobileToggle) mobileToggle.querySelector('i').className = 'fas fa-bars';
    }
}

// ============= ALGORITHM IMPLEMENTATIONS =============

// 1. DIVIDE & CONQUER - Merge Sort for Priority Queue
function mergeSort(arr, key = 'priority') {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), key);
    const right = mergeSort(arr.slice(mid), key);

    return merge(left, right, key);
}

function merge(left, right, key) {
    let result = [];
    let i = 0, j = 0;

    const priorityValue = { emergency: 3, high: 2, normal: 1 };

    while (i < left.length && j < right.length) {
        const leftVal = priorityValue[left[i][key]] || left[i][key];
        const rightVal = priorityValue[right[j][key]] || right[j][key];

        if (leftVal >= rightVal) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
}

// 2. GREEDY ALGORITHM - Activity Selection for Time Slots
function findOptimalSlots(requestedTime, availableSlots, bookedSlotsList = []) {
    const bookedTimes = bookedSlotsList.map(slot => typeof slot === 'object' ? slot.timeSlot : slot);
    let available = availableSlots.filter(slot => !bookedTimes.includes(slot));

    if (available.length === 0) return [];

    available.sort((a, b) => {
        const diffA = Math.abs(timeToMinutes(a) - timeToMinutes(requestedTime));
        const diffB = Math.abs(timeToMinutes(b) - timeToMinutes(requestedTime));
        return diffA - diffB;
    });

    return available.slice(0, 5);
}

function timeToMinutes(time) {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// 3. DYNAMIC PROGRAMMING - Optimal Appointment Scheduling
function optimizeSchedule(appointmentsList) {
    if (!appointmentsList || appointmentsList.length === 0) return { dp: [], maxAppointments: 0 };

    const times = appointmentsList.map(a => ({ id: a.id, start: timeToMinutes(a.timeSlot), end: timeToMinutes(a.timeSlot) + 30 }));
    times.sort((x, y) => x.end - y.end);

    const n = times.length;
    const dp = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        dp[i] = 1;
        for (let j = 0; j < i; j++) {
            if (times[j].end <= times[i].start) dp[i] = Math.max(dp[i], dp[j] + 1);
        }
    }
    const maxAppointments = n ? Math.max(...dp) : 0;
    return { dp, maxAppointments, schedule: times };
}

// 4. STRING MATCHING - Naive String Matching Algorithm for Search
function naiveStringSearch(text, pattern) {
    if (!text || !pattern) return false;

    const n = text.length;
    const m = pattern.length;

    // If pattern is longer than text, it cannot match
    if (m > n) return false;

    // Try all possible starting positions in text
    for (let i = 0; i <= n - m; i++) {
        let j;
        // Check if pattern matches starting at position i
        for (j = 0; j < m; j++) {
            if (text.charAt(i + j) !== pattern.charAt(j)) {
                break;
            }
        }
        // If we reached the end of pattern, we found a match
        if (j === m) {
            return true;
        }
    }
    return false;
}

// ============= PAYMENT SYSTEM WITH ALGORITHMS =============

// 1. BINARY SEARCH - Fast Payment ID lookup
class PaymentBinarySearch {
    searchById(paymentsArray, id) {
        const sortedPayments = [...paymentsArray].sort((a, b) => a.id - b.id);

        let left = 0;
        let right = sortedPayments.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentId = sortedPayments[mid].id;

            if (currentId === id) {
                return { payment: sortedPayments[mid], index: mid };
            }

            if (currentId < id) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return null;
    }

    searchByReceiptNumber(paymentsArray, receiptNo) {
        const searchNum = parseInt(receiptNo.replace(/\D/g, ''));
        const sorted = [...paymentsArray].sort((a, b) => {
            const aNum = parseInt(a.receiptNumber?.replace(/\D/g, '') || a.id);
            const bNum = parseInt(b.receiptNumber?.replace(/\D/g, '') || b.id);
            return aNum - bNum;
        });

        let left = 0;
        let right = sorted.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentNum = parseInt(sorted[mid].receiptNumber?.replace(/\D/g, '') || sorted[mid].id);

            if (currentNum === searchNum) {
                return sorted[mid];
            }

            if (currentNum < searchNum) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return null;
    }
}

// 2. NAIVE STRING MATCHING - Pattern matching for names/transaction IDs
class PaymentNaiveSearch {
    search(text, pattern) {
        if (!text || !pattern) return -1;

        const n = text.length;
        const m = pattern.length;

        // If pattern is longer than text, it cannot match
        if (m > n) return -1;

        // Try all possible starting positions in text
        for (let i = 0; i <= n - m; i++) {
            let j;
            // Check if pattern matches starting at position i
            for (j = 0; j < m; j++) {
                if (text.charAt(i + j) !== pattern.charAt(j)) {
                    break;
                }
            }
            // If we reached the end of pattern, we found a match
            if (j === m) {
                return i;
            }
        }
        return -1;
    }

    searchPayment(paymentsArray, query) {
        const results = [];
        const queryLower = query.toLowerCase();

        paymentsArray.forEach(payment => {
            const nameMatch = this.search(payment.patientName.toLowerCase(), queryLower);
            if (nameMatch !== -1) {
                results.push({ payment, matchType: 'name', matchIndex: nameMatch });
                return;
            }

            const contactMatch = this.search(payment.patientContact, query);
            if (contactMatch !== -1) {
                results.push({ payment, matchType: 'contact', matchIndex: contactMatch });
                return;
            }

            if (payment.transactionId) {
                const transMatch = this.search(payment.transactionId, query);
                if (transMatch !== -1) {
                    results.push({ payment, matchType: 'transaction', matchIndex: transMatch });
                }
            }
        });

        return results;
    }
}

// 3. GREEDY ALGORITHM - Cash breakdown for change
class CashBreakdownGreedy {
    getChangeBreakdown(changeAmount) {
        const denominations = [1000, 500, 100, 50, 20, 10, 5, 2, 1, 0.5];
        const breakdown = {};
        let remaining = changeAmount;

        for (const denom of denominations) {
            if (remaining >= denom) {
                const count = Math.floor(remaining / denom);
                breakdown[`৳${denom}`] = count;
                remaining = Math.round((remaining - count * denom) * 100) / 100;

                if (remaining === 0) break;
            }
        }

        return breakdown;
    }

    getOptimalPayment(availableCash, amountDue) {
        const denominations = [1000, 500, 100, 50, 20, 10, 5, 2, 1];
        let remaining = amountDue;
        const payment = {};

        for (const denom of denominations) {
            if (remaining >= denom && availableCash[denom] > 0) {
                const needed = Math.floor(remaining / denom);
                const use = Math.min(needed, availableCash[denom]);

                if (use > 0) {
                    payment[denom] = use;
                    remaining -= use * denom;
                }
            }
        }

        return {
            payment,
            remainingAmount: remaining,
            isComplete: remaining === 0
        };
    }
}

// 4. MERGE SORT - Efficient payment history sorting
class PaymentMergeSort {
    sort(paymentsArray, key = 'id', order = 'desc') {
        if (paymentsArray.length <= 1) return paymentsArray;

        const mid = Math.floor(paymentsArray.length / 2);
        const left = this.sort(paymentsArray.slice(0, mid), key, order);
        const right = this.sort(paymentsArray.slice(mid), key, order);

        return this.merge(left, right, key, order);
    }

    merge(left, right, key, order) {
        const result = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            let comparison;

            if (key === 'date') {
                const leftDate = new Date(left[i][key]);
                const rightDate = new Date(right[j][key]);
                comparison = leftDate - rightDate;
            } else if (key === 'amount') {
                comparison = left[i][key] - right[j][key];
            } else {
                comparison = left[i][key]?.toString().localeCompare(right[j][key]?.toString());
            }

            if (order === 'desc') {
                if (comparison > 0) {
                    result.push(left[i++]);
                } else {
                    result.push(right[j++]);
                }
            } else {
                if (comparison < 0) {
                    result.push(left[i++]);
                } else {
                    result.push(right[j++]);
                }
            }
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }
}

// Initialize algorithm instances
const paymentBinarySearch = new PaymentBinarySearch();
const paymentNaiveSearch = new PaymentNaiveSearch();
const cashBreakdown = new CashBreakdownGreedy();
const paymentMergeSort = new PaymentMergeSort();

// Payment verification system
class PaymentVerifier {
    constructor() {
        this.suspiciousPatterns = [
            "9999",
            "1234",
            "0000",
            "MIDNIGHT",
            "REFUNDLOOP"
        ];
    }

    verifyPayment(paymentData) {
        const paymentString = JSON.stringify(paymentData);

        for (const pattern of this.suspiciousPatterns) {
            if (paymentNaiveSearch.search(paymentString, pattern) !== -1) {
                console.warn(`🚨 Suspicious pattern detected: ${pattern}`);
                return {
                    verified: false,
                    reason: `Suspicious pattern: ${pattern}`,
                    riskLevel: 'HIGH'
                };
            }
        }

        const existingPayment = paymentBinarySearch.searchById(payments, paymentData.id);
        if (existingPayment) {
            console.warn(`⚠️ Possible duplicate payment detected`);
            return {
                verified: false,
                reason: 'Possible duplicate payment',
                riskLevel: 'MEDIUM'
            };
        }

        return {
            verified: true,
            reason: 'Payment verified successfully',
            riskLevel: 'LOW'
        };
    }
}

const paymentVerifier = new PaymentVerifier();

// ============= PAYMENT MODAL FUNCTIONS =============
function showPaymentModal(type, data) {
    paymentType = type;
    currentPaymentData = data;

    const modal = document.getElementById('payment-modal');
    const paymentDetails = document.getElementById('paymentDetails');

    let doctorDetails = '';
    let patientDetails = '';

    if (type === 'appointment') {
        doctorDetails = `
            <p><strong><i class="fas fa-user-md"></i> Doctor:</strong> ${data.doctor.name} (${data.doctor.specialty})</p>
            <p><strong><i class="fas fa-money-bill"></i> Consultation Fee:</strong> <strong>৳${data.fee}</strong></p>
        `;
        patientDetails = `
            <p><strong><i class="fas fa-user"></i> Patient:</strong> ${data.patientName}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${data.patientContact}</p>
            <p><strong><i class="fas fa-clock"></i> Time Slot:</strong> ${data.timeSlot}</p>
        `;
    } else {
        doctorDetails = `
            <p><strong><i class="fas fa-vial"></i> Tests:</strong> ${data.tests.map(t => t.name).join(', ')}</p>
            <p><strong><i class="fas fa-money-bill"></i> Total Fee:</strong> <strong>৳${data.totalFee}</strong></p>
        `;
        patientDetails = `
            <p><strong><i class="fas fa-user"></i> Patient:</strong> ${data.patientName}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${data.patientContact}</p>
            <p><strong><i class="fas fa-calendar"></i> Test Date:</strong> ${data.date}</p>
        `;
    }

    paymentDetails.innerHTML = `
        <div class="alert alert-info">
            ${doctorDetails}
            ${patientDetails}
        </div>
    `;

    document.getElementById('receivedAmount').value = type === 'appointment' ? data.fee : data.totalFee;
    document.getElementById('receivedBy').value = currentUser ? currentUser.name : 'Staff';

    modal.style.display = 'flex';

    document.getElementById('paymentMethod').addEventListener('change', function () {
        document.getElementById('mobileBankingDetails').style.display =
            this.value === 'mobile_banking' ? 'block' : 'none';
    });

    document.getElementById('receivedAmount').addEventListener('input', function () {
        const due = type === 'appointment' ? data.fee : data.totalFee;
        const received = parseFloat(this.value) || 0;
        const change = received - due;

        if (change > 0) {
            document.getElementById('changeAmount').style.display = 'block';
            document.getElementById('changeValue').textContent = change.toFixed(2);

            const breakdown = cashBreakdown.getChangeBreakdown(change);
            console.log('Change breakdown:', breakdown);
        } else {
            document.getElementById('changeAmount').style.display = 'none';
        }
    });
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'none';
    currentPaymentData = null;
    paymentType = null;
    document.getElementById('paymentForm').reset();
    document.getElementById('mobileBankingDetails').style.display = 'none';
    document.getElementById('changeAmount').style.display = 'none';
    document.getElementById('paymentAlert').classList.add('hidden');
}

function showPaymentAlert(message, type) {
    const alertDiv = document.getElementById('paymentAlert');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    alertDiv.classList.remove('hidden');
}

function processPayment() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const receivedAmount = parseFloat(document.getElementById('receivedAmount').value);
    const receivedBy = document.getElementById('receivedBy').value;
    const transactionId = paymentMethod === 'mobile_banking' ?
        document.getElementById('transactionId').value : null;
    const paymentNotes = document.getElementById('paymentNotes').value;

    const dueAmount = paymentType === 'appointment' ? currentPaymentData.fee : currentPaymentData.totalFee;

    if (!paymentMethod) {
        showPaymentAlert('Please select a payment method!', 'error');
        return;
    }

    if (receivedAmount < dueAmount) {
        showPaymentAlert(`Insufficient amount! Required: ৳${dueAmount}, Received: ৳${receivedAmount}`, 'error');
        return;
    }

    const paymentRecord = {
        id: payments.length + 1,
        type: paymentType === 'appointment' ? 'consultation_fee' : 'test_fee',
        amount: dueAmount,
        receivedAmount: receivedAmount,
        change: receivedAmount - dueAmount,
        patientName: currentPaymentData.patientName,
        patientContact: currentPaymentData.patientContact,
        bookingId: paymentType === 'appointment' ? `APT${appointments.length + 1}` : `TEST${testBookings.length + 1}`,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        receivedBy: receivedBy,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        notes: paymentNotes,
        verifiedBy: currentUser ? currentUser.name : 'System',
        receiptNumber: `RCPT${(payments.length + 1).toString().padStart(4, '0')}`
    };

    const verificationResult = paymentVerifier.verifyPayment(paymentRecord);

    if (!verificationResult.verified) {
        showPaymentAlert(`Payment verification failed: ${verificationResult.reason}`, 'error');
        paymentRecord.status = 'flagged';
        paymentRecord.verificationStatus = 'FAILED';
        paymentRecord.riskLevel = verificationResult.riskLevel;
    } else {
        paymentRecord.verificationStatus = 'PASSED';
        paymentRecord.riskLevel = verificationResult.riskLevel;
    }

    payments.push(paymentRecord);
    cashRegister.totalCash += dueAmount;
    cashRegister.todayCollections += dueAmount;

    saveToLocalStorage(STORAGE_KEYS.PAYMENTS, payments);
    saveToLocalStorage(STORAGE_KEYS.CASH_REGISTER, cashRegister);

    showPaymentAlert(`✅ Payment recorded successfully!\nAmount: ৳${dueAmount}\nPayment ID: PAY${paymentRecord.id.toString().padStart(4, '0')}\nVerification: ${paymentRecord.verificationStatus}`, 'success');

    setTimeout(() => {
        if (paymentType === 'appointment') {
            completeAppointmentBooking(currentPaymentData, paymentRecord);
        } else {
            completeTestBooking(currentPaymentData, paymentRecord);
        }

        closePaymentModal();
        loadPaymentRecords();
    }, 2000);
}

function completeAppointmentBooking(data, paymentRecord) {
    const doctor = doctors.find(d => d.id === data.doctorId);
    const appointmentId = appointments.length + 1;

    const patientAge = data.age || document.getElementById('patientAge').value;

    const appointment = {
        id: appointmentId,
        patientName: data.patientName,
        age: patientAge,
        contact: data.patientContact,
        problem: data.patientProblem,
        doctor: doctor.name,
        doctorId: doctor.id,
        specialty: doctor.specialty,
        timeSlot: data.timeSlot,
        fee: data.fee,
        priority: data.priority,
        status: 'Confirmed',
        date: new Date().toLocaleDateString(),
        queuePosition: appointments.filter(a => a.doctorId === doctor.id && a.date === new Date().toLocaleDateString()).length + 1,
        bookedBy: currentUser ? currentUser.name : 'Guest',
        bookedByRole: currentUser ? currentUser.role : 'guest',
        paymentId: paymentRecord.id,
        paymentStatus: 'paid',
        paymentMethod: paymentRecord.paymentMethod,
        receiptNumber: paymentRecord.receiptNumber,
        bookingId: `APT${appointmentId.toString().padStart(4, '0')}`
    };

    appointments.push(appointment);

    saveToLocalStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

    const doctorKey = `doctor_${doctor.id}`;
    if (!bookedSlots[doctorKey]) bookedSlots[doctorKey] = [];
    bookedSlots[doctorKey].push(data.timeSlot);

     saveToLocalStorage(STORAGE_KEYS.BOOKED_SLOTS, bookedSlots);
    console.log('✅ Booked slots saved to localStorage:', bookedSlots);

    if (data.priority === 'emergency') {
        emergencyQueue.push(appointment);
        emergencyQueue = mergeSort(emergencyQueue, 'priority');

        saveToLocalStorage(STORAGE_KEYS.EMERGENCY_QUEUE, emergencyQueue);
        console.log('✅ Emergency queue saved to localStorage:', emergencyQueue);
    }

    document.getElementById('appointmentForm').reset();
    document.getElementById('doctorSelection').style.display = 'none';
    document.getElementById('doctorRecommendation').style.display = 'none';
    document.getElementById('timeSlotSelection').style.display = 'none';
    selectedDoctor = null;
    selectedSlot = null;

    const confirmationMsg = `✅ Appointment & Payment Complete!\n\n` +
        `📋 Appointment Details:\n` +
        `Booking ID: ${appointment.bookingId}\n` +
        `Patient: ${appointment.patientName}\n` +
        `Doctor: Dr. ${doctor.name}\n` +
        `Time: ${data.timeSlot}\n` +
        `Fee: ৳${data.fee}\n` +
        `\n💰 Payment Details:\n` +
        `Payment ID: PAY${paymentRecord.id}\n` +
        `Receipt No: ${appointment.receiptNumber}\n` +
        `Method: ${paymentRecord.paymentMethod}\n` +
        `Status: ${paymentRecord.verificationStatus}\n` +
        `\nPlease arrive 15 minutes before your appointment time.`;

    alert(confirmationMsg);

    setTimeout(() => {
        const existingVitals = patientVitalSigns.find(v =>
            v.contact === appointment.contact &&
            v.date === appointment.date
        );

        const recordVitals = confirm(`${appointment.patientName}'s appointment confirmed!\n\nDo you want to record Vital Signs now?`);

        if (recordVitals) {
            showVitalSignsModal(appointment);
        }
    }, 1000);
}

function completeTestBooking(data, paymentRecord) {
    const testBookingId = testBookings.length + 1;
    const testData = {
        id: testBookingId,
        patientName: data.patientName,
        contact: data.patientContact,
        age: data.patientAge,
        tests: data.tests,
        totalFee: data.totalFee,
        date: data.date,
        status: 'Confirmed',
        bookingId: `TEST${testBookingId.toString().padStart(4, '0')}`,
        bookedBy: currentUser ? currentUser.name : 'Guest',
        bookedByRole: currentUser ? currentUser.role : 'guest',
        paymentId: paymentRecord.id,
        receiptNumber: paymentRecord.receiptNumber,
        paymentMethod: paymentRecord.paymentMethod,
        reportReady: false,
    };

    testBookings.push(testData);

    saveToLocalStorage(STORAGE_KEYS.TEST_BOOKINGS, testBookings);

    document.getElementById('testBookingForm').reset();
    document.getElementById('totalTestFee').textContent = '0';

    alert(`✅ Test Booking & Payment Complete!\n\n` +
        `📋 Test Booking Details:\n` +
        `Booking ID: ${testData.bookingId}\n` +
        `Patient: ${testData.patientName}\n` +
        `Age: ${testData.age}\n` +
        `Contact: ${testData.contact}\n` +
        `Tests: ${testData.tests.map(t => t.name).join(', ')}\n` +
        `Total Fee: ৳${testData.totalFee}\n` +
        `Test Date: ${testData.date}\n` +
        `\n💰 Payment Details:\n` +
        `Payment ID: PAY${paymentRecord.id}\n` +
        `Receipt No: ${testData.receiptNumber}\n` +
        `Method: ${testData.paymentMethod}\n` +
        `Status: ${paymentRecord.verificationStatus}\n` +
        `\nPlease arrive on time for your tests.`);
}

// ============= PAYMENT RECORDS FUNCTIONS =============
function displayPaymentRecords(paymentsList) {
    const container = document.getElementById('paymentRecordsList');

    if (paymentsList.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No payment records found.</div>';
        return;
    }

    const sortedPayments = paymentMergeSort.sort(paymentsList, 'id', 'desc');

    let html = `
        <div class="card">
            <table style="width: 100%;">
                <thead>
                    <tr style="background: #f8f9fa; text-align: left;">
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Receipt No.</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Patient Details</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Payment Type</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Amount</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Method</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Status</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Date & Time</th>
                        <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sortedPayments.forEach(payment => {
        let paymentType = '';
        let patientDetails = '';

        if (payment.type === 'consultation_fee') {
            paymentType = '<i class="fas fa-user-md"></i> Appointment';
            const appointment = appointments.find(a => a.paymentId === payment.id);
            if (appointment) {
                patientDetails = `
                    <strong>${payment.patientName}</strong><br>
                    <small><i class="fas fa-user-md"></i> Dr. ${appointment.doctor}</small><br>
                    <small><i class="fas fa-clock"></i> ${appointment.timeSlot}</small>
                `;
            } else {
                patientDetails = `<strong>${payment.patientName}</strong><br><small><i class="fas fa-phone"></i> ${payment.patientContact}</small>`;
            }
        } else {
            paymentType = '<i class="fas fa-vial"></i> Test';
            const testBooking = testBookings.find(t => t.paymentId === payment.id);
            if (testBooking) {
                patientDetails = `
                    <strong>${payment.patientName}</strong><br>
                    <small><i class="fas fa-vial"></i> Tests: ${testBooking.tests.map(t => t.name).join(', ')}</small>
                `;
            } else {
                patientDetails = `<strong>${payment.patientName}</strong><br><small><i class="fas fa-phone"></i> ${payment.patientContact}</small>`;
            }
        }

        const statusClass = payment.verificationStatus === 'PASSED' ? 'status-confirmed' :
            payment.verificationStatus === 'FAILED' ? 'status-failed' : 'status-pending';

        const methodClass = payment.paymentMethod === 'cash' ? 'badge-cash' :
            payment.paymentMethod === 'card' ? 'badge-card' : 'badge-mobile';

        const riskBadge = payment.riskLevel === 'HIGH' ? '<span class="risk-high">HIGH</span>' :
            payment.riskLevel === 'MEDIUM' ? '<span class="risk-medium">MEDIUM</span>' :
                '<span class="risk-low">LOW</span>';

        html += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px;">
                    <strong>${payment.receiptNumber}</strong><br>
                    <small style="color: #666;">ID: PAY${payment.id.toString().padStart(4, '0')}</small>
                </td>
                <td style="padding: 12px;">
                    ${patientDetails}
                </td>
                <td style="padding: 12px;">
                    ${paymentType}
                </td>
                <td style="padding: 12px;">
                    <strong style="color: #10b981;">৳${payment.amount}</strong><br>
                    <small>Received: ৳${payment.receivedAmount}</small>
                </td>
                <td style="padding: 12px;">
                    <span class="payment-method-badge ${methodClass}">${payment.paymentMethod.toUpperCase()}</span>
                </td>
                <td style="padding: 12px;">
                    <span class="${statusClass}">${payment.verificationStatus}</span><br>
                    ${riskBadge}
                </td>
                <td style="padding: 12px;">
                    <i class="fas fa-calendar"></i> ${payment.date}<br>
                    <small><i class="fas fa-clock"></i> ${payment.time}</small>
                </td>
                <td style="padding: 12px;">
                    <div class="payment-actions">
                        <button class="btn btn-info btn-sm" onclick="viewReceipt(${payment.id})">
                            <i class="fas fa-file-alt"></i> View
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="showChangeBreakdown(${payment.id})">
                            <i class="fas fa-money-bill-wave"></i> Change
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function showChangeBreakdown(paymentId) {
    const result = paymentBinarySearch.searchById(payments, paymentId);
    if (!result || !result.payment || !result.payment.change || result.payment.change <= 0) {
        alert('No change was given for this payment.');
        return;
    }

    const payment = result.payment;
    const breakdown = cashBreakdown.getChangeBreakdown(payment.change);
    let breakdownText = `Change: ৳${payment.change}\n\nBreakdown:\n`;

    for (const [denom, count] of Object.entries(breakdown)) {
        breakdownText += `${denom} × ${count}\n`;
    }

    alert(breakdownText);
}

function searchPayments() {
    const query = document.getElementById('paymentSearch').value.trim();

    if (query.length < 2) {
        if (currentUser.role === 'doctor') {
            loadDoctorPaymentRecords();
        } else {
            displayPaymentRecords(payments);
        }
        return;
    }

    if (currentUser.role === 'doctor') {
        const doctorName = currentUser.name;
        const matchedDoctor = doctors.find(d =>
            d.name.toLowerCase().includes(doctorName.toLowerCase()) ||
            doctorName.toLowerCase().includes(d.name.toLowerCase())
        );

        if (matchedDoctor) {
            const doctorAppointments = appointments.filter(apt => apt.doctorId === matchedDoctor.id);
            const doctorPaymentIds = doctorAppointments
                .filter(apt => apt.paymentId)
                .map(apt => apt.paymentId);

            const doctorPayments = payments.filter(payment =>
                doctorPaymentIds.includes(payment.id) &&
                payment.type === 'consultation_fee'
            );

            const results = doctorPayments.filter(payment =>
                payment.patientName.toLowerCase().includes(query.toLowerCase()) ||
                payment.patientContact.includes(query) ||
                payment.receiptNumber.toLowerCase().includes(query.toLowerCase())
            );

            if (results.length > 0) {
                displayDoctorPaymentRecords(results, matchedDoctor);
            } else {
                document.getElementById('paymentRecordsList').innerHTML =
                    '<div class="alert alert-warning">No payments found with this search in your records.</div>';
            }
        }
    } else {
        if (query.toUpperCase().startsWith('RCPT') || query.toUpperCase().startsWith('PAY')) {
            const foundPayment = paymentBinarySearch.searchByReceiptNumber(payments, query);
            if (foundPayment) {
                displayPaymentRecords([foundPayment]);
                return;
            }
        }

        const results = paymentNaiveSearch.searchPayment(payments, query);

        if (results.length > 0) {
            const matchedPayments = results.map(r => r.payment);
            displayPaymentRecords(matchedPayments);
        } else {
            document.getElementById('paymentRecordsList').innerHTML =
                '<div class="alert alert-warning">No payments found with this search.</div>';
        }
    }
}

function viewReceipt(paymentId) {
    const result = paymentBinarySearch.searchById(payments, paymentId);
    if (!result || !result.payment) {
        alert('Payment not found!');
        return;
    }

    const payment = result.payment;
    let relatedInfo = '';

    if (payment.type === 'consultation_fee') {
        const appointment = appointments.find(a => a.paymentId === paymentId);
        if (appointment) {
            relatedInfo = `
                Appointment Details:
                - Doctor: Dr. ${appointment.doctor} (${appointment.specialty})
                - Time Slot: ${appointment.timeSlot}
                - Problem: ${appointment.problem}
                - Priority: ${appointment.priority}
            `;
        }
    } else {
        const testBooking = testBookings.find(t => t.paymentId === paymentId);
        if (testBooking) {
            relatedInfo = `
                Test Booking Details:
                - Tests: ${testBooking.tests.map(t => t.name).join(', ')}
                - Test Date: ${testBooking.date}
                - Total Tests: ${testBooking.tests.length}
            `;
        }
    }

    alert(`📄 PAYMENT RECEIPT\n\n` +
        `Receipt No: ${payment.receiptNumber}\n` +
        `Payment ID: PAY${payment.id.toString().padStart(4, '0')}\n` +
        `Patient: ${payment.patientName}\n` +
        `Contact: ${payment.patientContact}\n` +
        `Amount Paid: ৳${payment.amount}\n` +
        `Amount Received: ৳${payment.receivedAmount}\n` +
        `Change Returned: ৳${payment.change || 0}\n` +
        `Payment Method: ${payment.paymentMethod}\n` +
        (payment.transactionId ? `Transaction ID: ${payment.transactionId}\n` : '') +
        `Date: ${payment.date}\n` +
        `Time: ${payment.time}\n` +
        `Received By: ${payment.receivedBy}\n` +
        `Verification Status: ${payment.verificationStatus}\n` +
        `Risk Level: ${payment.riskLevel}\n\n` +
        `${relatedInfo}\n\n` +
        `Thank you for your payment!`);
}

function loadPaymentRecords() {
    if (currentUser && currentUser.role === 'doctor') {
        loadDoctorPaymentRecords();
    } else {
        document.getElementById('totalPayments').textContent = payments.length;
        document.getElementById('totalCash').textContent = `৳${cashRegister.totalCash.toLocaleString()}`;
        document.getElementById('flaggedPayments').textContent = payments.filter(p => p.verificationStatus === 'FAILED').length;

        const successRate = payments.length > 0 ?
            Math.round((payments.filter(p => p.verificationStatus === 'PASSED').length / payments.length) * 100) : 100;
        document.getElementById('successRate').textContent = `${successRate}%`;

        displayPaymentRecords(payments);
    }
}

// ============= DOCTOR SPECIFIC PAYMENT FUNCTIONS =============
function loadDoctorPaymentRecords() {
    if (!currentUser || currentUser.role !== 'doctor') return;

    const doctorName = currentUser.name;
    let matchedDoctor = null;

    for (const doc of doctors) {
        if (doctorName.toLowerCase().includes(doc.name.toLowerCase()) ||
            doc.name.toLowerCase().includes(doctorName.toLowerCase())) {
            matchedDoctor = doc;
            break;
        }
    }

    if (!matchedDoctor) {
        matchedDoctor = doctors.find(d => d.id === currentUser.doctorId);
    }

    if (!matchedDoctor) {
        document.getElementById('paymentRecordsList').innerHTML =
            '<div class="alert alert-warning">Doctor profile not found. Please contact administration.</div>';
        return;
    }

    const doctorAppointments = appointments.filter(apt =>
        apt.doctorId === matchedDoctor.id &&
        apt.status === 'Confirmed'
    );
    const doctorPayments = [];

    doctorAppointments.forEach(apt => {
        if (apt.paymentId) {
            const payment = payments.find(p =>
                p.id === apt.paymentId &&
                p.type === 'consultation_fee'
            );
            if (payment) {
                doctorPayments.push(payment);
            }
        }
    });

    document.getElementById('totalPayments').textContent = doctorPayments.length;

    const totalAmount = doctorPayments.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('totalCash').textContent = `৳${totalAmount.toLocaleString()}`;

    const flaggedPayments = doctorPayments.filter(p => p.verificationStatus === 'FAILED').length;
    document.getElementById('flaggedPayments').textContent = flaggedPayments;

    const successRate = doctorPayments.length > 0 ?
        Math.round((doctorPayments.filter(p => p.verificationStatus === 'PASSED').length / doctorPayments.length) * 100) : 100;
    document.getElementById('successRate').textContent = `${successRate}%`;

    displayDoctorPaymentRecords(doctorPayments, matchedDoctor);
}

function displayDoctorPaymentRecords(paymentsList, doctor) {
    const container = document.getElementById('paymentRecordsList');

    if (!paymentsList || paymentsList.length === 0) {
        container.innerHTML = `
        <div class="alert alert-info">
            <h4><i class="fas fa-user-md"></i> ${doctor.name}</h4>
            <p>No payment records found for your patients.</p>
            <p><strong>Specialty:</strong> ${doctor.specialty}</p>
        </div>`;
        return;
    }

    const sortedPayments = paymentMergeSort.sort(paymentsList, 'id', 'desc');

    let html = `
    <div class="alert alert-success">
        <h4><i class="fas fa-user-md"></i> ${doctor.name} - Payment History</h4>
        <p><strong>Specialty:</strong> ${doctor.specialty} | <strong>Total Patients Paid:</strong> ${sortedPayments.length}</p>
        <p style="font-size: 0.9em;">Showing only your consultation fee payments. Test payments are managed by staff.</p>
    </div>
    
    <div class="card">
        <table style="width: 100%;">
            <thead>
                <tr style="background: #f8f9fa; text-align: left;">
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Receipt No.</th>
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Patient Details</th>
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Appointment Details</th>
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Amount</th>
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Method</th>
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Date & Time</th>
                    <th style="padding: 12px; border-bottom: 1px solid #dee2e6;">Actions</th>
                </tr>
            </thead>
            <tbody>
`;

    sortedPayments.forEach(payment => {
        const appointment = appointments.find(a => a.paymentId === payment.id);

        if (!appointment) return;

        const patientDetails = `
        <strong>${payment.patientName}</strong><br>
        <small><i class="fas fa-phone"></i> ${payment.patientContact}</small>
    `;

        const appointmentDetails = appointment ? `
        <small><i class="fas fa-clock"></i> ${appointment.timeSlot}</small><br>
        <small><i class="fas fa-stethoscope"></i> ${appointment.problem.substring(0, 30)}...</small>
    ` : 'N/A';

        const statusClass = payment.verificationStatus === 'PASSED' ? 'status-confirmed' :
            payment.verificationStatus === 'FAILED' ? 'status-failed' : 'status-pending';

        const methodClass = payment.paymentMethod === 'cash' ? 'badge-cash' :
            payment.paymentMethod === 'card' ? 'badge-card' : 'badge-mobile';

        const riskBadge = payment.riskLevel === 'HIGH' ? '<span class="risk-high">HIGH</span>' :
            payment.riskLevel === 'MEDIUM' ? '<span class="risk-medium">MEDIUM</span>' :
                '<span class="risk-low">LOW</span>';

        html += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px;">
                <strong>${payment.receiptNumber}</strong><br>
                <small style="color: #666;">ID: PAY${payment.id.toString().padStart(4, '0')}</small>
            </td>
            <td style="padding: 12px;">
                ${patientDetails}
            </td>
            <td style="padding: 12px;">
                ${appointmentDetails}
            </td>
            <td style="padding: 12px;">
                <strong style="color: #10b981;">৳${payment.amount}</strong><br>
                <small>Received: ৳${payment.receivedAmount}</small>
            </td>
            <td style="padding: 12px;">
                <span class="payment-method-badge ${methodClass}">${payment.paymentMethod.toUpperCase()}</span>
            </td>
            <td style="padding: 12px;">
                <i class="fas fa-calendar"></i> ${payment.date}<br>
                <small><i class="fas fa-clock"></i> ${payment.time}</small><br>
                <small>${statusClass === 'status-confirmed' ? '✅ Verified' : '⚠️ Flagged'}</small>
            </td>
            <td style="padding: 12px;">
                <div class="payment-actions">
                    <button class="btn btn-info btn-sm" onclick="viewReceipt(${payment.id})">
                        <i class="fas fa-file-alt"></i> View
                    </button>
                    ${payment.change > 0 ? `
                    <button class="btn btn-warning btn-sm" onclick="showChangeBreakdown(${payment.id})">
                        <i class="fas fa-money-bill-wave"></i> Change
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// ============= INTEGRATE PAYMENT WITH EXISTING FUNCTIONS =============

// Update showAppointmentPayment function
function showAppointmentPayment(doctorId, fee, priority) {
    if (!selectedDoctor || !selectedSlot) {
        alert('Please select doctor and time slot first!');
        return;
    }

    const doctor = doctors.find(d => d.id === doctorId);
    const patientName = document.getElementById('patientName').value;
    const patientContact = document.getElementById('patientContact').value;
    const patientProblem = document.getElementById('patientProblem').value;
    const patientAge = document.getElementById('patientAge').value;

    currentPaymentData = {
        type: 'appointment',
        doctorId: doctorId,
        doctor: doctor,
        fee: fee,
        priority: priority,
        timeSlot: selectedSlot,
        patientName: patientName,
        patientContact: patientContact,
        patientProblem: patientProblem,
        patientAge: patientAge,
        age: patientAge
    };

    showPaymentModal('appointment', currentPaymentData);
}

// Update showTestPayment function
function showTestPayment() {
    const selectedTests = Array.from(document.querySelectorAll('#testSelection input:checked'))
        .map(input => tests.find(t => t.id == input.value));

    if (selectedTests.length === 0) {
        alert('Please select at least one test!');
        return;
    }

    const patientName = document.getElementById('testPatientName').value;
    const patientContact = document.getElementById('testPatientContact').value;
    const patientAge = document.getElementById('testPatientAge').value;
    const testDate = document.getElementById('testDate').value;
    const totalFee = selectedTests.reduce((sum, t) => sum + t.fee, 0);

    currentPaymentData = {
        type: 'test',
        patientName: patientName,
        patientContact: patientContact,
        patientAge: patientAge,
        tests: selectedTests,
        totalFee: totalFee,
        date: testDate
    };

    showPaymentModal('test', currentPaymentData);
}

// ============= VITAL SIGNS FUNCTIONS =============
function showVitalSignsModal(appointment) {
    const modal = document.getElementById('vitalSignsModal');
    const content = document.getElementById('vitalSignsContent');

    content.innerHTML = `
        <div class="alert alert-info">
            <strong><i class="fas fa-user"></i> Patient:</strong> ${appointment.patientName} | <strong><i class="fas fa-phone"></i> Contact:</strong> ${appointment.contact}
            <br><strong><i class="fas fa-user-md"></i> Doctor:</strong> ${appointment.doctor} | <strong><i class="fas fa-clock"></i> Appointment Time:</strong> ${appointment.timeSlot}
        </div>
        
        <form id="vitalSignsForm">
            <div class="vital-signs-grid">
                <div class="form-group">
                    <label><i class="fas fa-weight"></i> Weight (kg) *</label>
                    <input type="number" id="patientWeight" step="0.1" min="1" max="300" required placeholder="e.g., 65.5">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-ruler-vertical"></i> Height (cm) *</label>
                    <input type="number" id="patientHeight" min="50" max="250" required placeholder="e.g., 170">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-thermometer-half"></i> Temperature (°F) *</label>
                    <input type="number" id="patientTemp" step="0.1" min="95" max="110" required placeholder="e.g., 98.6">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-heartbeat"></i> Blood Pressure *</label>
                    <input type="text" id="patientBP" required placeholder="e.g., 120/80">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-tachometer-alt"></i> Pulse Rate (bpm) *</label>
                    <input type="number" id="patientPulse" min="30" max="200" required placeholder="e.g., 72">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lungs"></i> Oxygen Saturation (%) *</label>
                    <input type="number" id="patientOxygen" min="70" max="100" required placeholder="e.g., 98">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-wind"></i> Respiratory Rate</label>
                    <input type="number" id="patientRespiratory" min="10" max="50" placeholder="e.g., 16">
                </div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-sticky-note"></i> Additional Notes</label>
                <textarea id="patientNotes" rows="3" placeholder="Any additional observations..."></textarea>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 25px;">
                <button type="button" class="btn btn-success" onclick="saveVitalSigns(${appointment.id})" style="flex: 1;">
                    <i class="fas fa-save"></i> Save Vital Signs
                </button>
                <button type="button" class="btn btn-info" onclick="viewPatientHistory('${appointment.contact}')" style="flex: 1;">
                    <i class="fas fa-chart-bar"></i> View Patient History
                </button>
            </div>
        </form>
        
        <div id="vitalSignsAlert" class="alert hidden" style="margin-top: 15px;"></div>
    `;

    modal.style.display = 'flex';
}

function saveVitalSigns(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const weight = document.getElementById('patientWeight').value;
    const height = document.getElementById('patientHeight').value;
    const temp = document.getElementById('patientTemp').value;
    const bp = document.getElementById('patientBP').value;
    const pulse = document.getElementById('patientPulse').value;
    const oxygen = document.getElementById('patientOxygen').value;
    const respiratory = document.getElementById('patientRespiratory').value || 'N/A';
    const notes = document.getElementById('patientNotes').value;

    if (!weight || !height || !temp || !bp || !pulse || !oxygen) {
        showVitalSignsAlert('Please fill in all required fields!', 'error');
        return;
    }

    const vitalRecord = {
        id: patientVitalSigns.length + 1,
        patientName: appointment.patientName,
        contact: appointment.contact,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        weight: weight + ' kg',
        height: height + ' cm',
        temperature: temp + '°F',
        bloodPressure: bp + ' mmHg',
        pulse: pulse + ' bpm',
        oxygenSaturation: oxygen + '%',
        respiratoryRate: respiratory + (respiratory !== 'N/A' ? ' breaths/min' : ''),
        notes: notes,
        recordedBy: currentUser ? currentUser.name : 'Staff',
        appointmentId: appointmentId,
        doctor: appointment.doctor,
        bmi: calculateBMI(weight, height)
    };

    patientVitalSigns.push(vitalRecord);

    saveToLocalStorage(STORAGE_KEYS.PATIENT_VITALS, patientVitalSigns);

    showVitalSignsAlert('✅ Vital signs saved successfully!', 'success');

    setTimeout(() => {
        closeVitalSignsModal();
        alert(`Vital signs recorded for ${appointment.patientName}\n\nWeight: ${weight} kg | Temp: ${temp}°F\nBP: ${bp} | Pulse: ${pulse} bpm\nOxygen: ${oxygen}%`);
    }, 2000);
}

function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
}

function showVitalSignsAlert(message, type) {
    const alertDiv = document.getElementById('vitalSignsAlert');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    alertDiv.classList.remove('hidden');
}

function closeVitalSignsModal() {
    document.getElementById('vitalSignsModal').style.display = 'none';
}

// ============= PATIENT HISTORY FUNCTIONS =============
function viewPatientHistory(contact) {
    let doctorAppointments = [];

    if (currentUser && currentUser.role === 'doctor') {
        const doctorName = currentUser.name;
        const matchedDoctor = doctors.find(d =>
            d.name.toLowerCase().includes(doctorName.toLowerCase()) ||
            doctorName.toLowerCase().includes(d.name.toLowerCase())
        );

        if (matchedDoctor) {
            doctorAppointments = appointments.filter(apt =>
                apt.doctorId === matchedDoctor.id &&
                apt.contact === contact
            );
        }
    } else {
        doctorAppointments = appointments.filter(a => a.contact === contact);
    }

    const patientVitals = patientVitalSigns.filter(v => v.contact === contact);

    if (doctorAppointments.length === 0 && patientVitals.length === 0) {
        alert('No history found for this patient.');
        return;
    }

    const modal = document.getElementById('patientHistoryModal');
    const content = document.getElementById('patientHistoryContent');

    const patient = doctorAppointments[0] || patientVitals[0];

    content.innerHTML = `
    <div class="card">
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">
                ${patient.patientName ? patient.patientName.charAt(0) : 'P'}
            </div>
            <div style="flex: 1;">
                <h3>${patient.patientName || 'Unknown Patient'}</h3>
                <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${patient.contact}</p>
                <p><strong><i class="fas fa-birthday-cake"></i> Age:</strong> ${patient.age || 'N/A'}</p>
                <p><strong><i class="fas fa-history"></i> Total Visits:</strong> ${doctorAppointments.length}</p>
                <p><strong><i class="fas fa-calendar-check"></i> Last Visit:</strong> ${doctorAppointments.length > 0 ? doctorAppointments[doctorAppointments.length - 1].date : 'N/A'}</p>
            </div>
        </div>
    </div>
    
    <div class="patient-history">
        <h4><i class="fas fa-history"></i> Medical History & Vital Signs</h4>
        
        ${patientVitals.length > 0 ? `
            <h5 style="margin-top: 20px; color: #1e3a8a;"><i class="fas fa-heartbeat"></i> Vital Signs Records (${patientVitals.length})</h5>
            ${patientVitals.map(vital => `
                <div class="history-card">
                    <div class="date"><i class="fas fa-calendar"></i> ${vital.date} at ${vital.time} | Recorded by: ${vital.recordedBy}</div>
                    <div style="margin: 10px 0;">
                        <strong><i class="fas fa-user-md"></i> Doctor:</strong> ${vital.doctor || 'N/A'} 
                        ${vital.appointmentId ? `| <strong><i class="fas fa-calendar"></i> Appointment ID:</strong> APT${vital.appointmentId.toString().padStart(4, '0')}` : ''}
                    </div>
                    <div class="vitals">
                        <div class="vital-item">
                            <div class="label">Weight</div>
                            <div class="value">${vital.weight}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">Height</div>
                            <div class="value">${vital.height}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">BMI</div>
                            <div class="value">${vital.bmi || calculateBMI(parseFloat(vital.weight), parseFloat(vital.height))}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">Temperature</div>
                            <div class="value">${vital.temperature}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">Blood Pressure</div>
                            <div class="value">${vital.bloodPressure}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">Pulse</div>
                            <div class="value">${vital.pulse}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">Oxygen</div>
                            <div class="value">${vital.oxygenSaturation}</div>
                        </div>
                        <div class="vital-item">
                            <div class="label">Respiratory</div>
                            <div class="value">${vital.respiratoryRate}</div>
                        </div>
                    </div>
                    ${vital.notes ? `<div style="margin-top: 10px; padding: 10px; background: #f1f5f9; border-radius: 6px;"><strong><i class="fas fa-sticky-note"></i> Notes:</strong> ${vital.notes}</div>` : ''}
                </div>
            `).reverse().join('')}
        ` : '<div class="no-history">No vital signs recorded yet.</div>'}
        
        ${doctorAppointments.length > 0 ? `
            <h5 style="margin-top: 30px; color: #1e3a8a;"><i class="fas fa-calendar-check"></i> Appointment History (${doctorAppointments.length})</h5>
            ${doctorAppointments.map(apt => `
                <div class="history-card" style="border-left-color: #10b981;">
                    <div class="date"><i class="fas fa-calendar"></i> ${apt.date} at ${apt.timeSlot}</div>
                    <div style="margin: 10px 0;">
                        <strong><i class="fas fa-user-md"></i> Doctor:</strong> ${apt.doctor} (${apt.specialty}) |
                        <strong>Status:</strong> <span class="status-confirmed">${apt.status}</span> |
                        <strong>Priority:</strong> <span class="priority-badge priority-${apt.priority}">${apt.priority.toUpperCase()}</span>
                    </div>
                    <div><strong><i class="fas fa-stethoscope"></i> Problem:</strong> ${apt.problem}</div>
                    <div><strong><i class="fas fa-money-bill"></i> Fee:</strong> ৳${apt.fee} | <strong>Booked by:</strong> ${apt.bookedBy}</div>
                </div>
            `).reverse().join('')}
        ` : ''}
    </div>
`;

    modal.style.display = 'flex';
}

function closePatientHistoryModal() {
    document.getElementById('patientHistoryModal').style.display = 'none';
}

// ============= DOCTOR'S PATIENTS VIEW =============
function loadDoctorPatients() {
    if (!currentUser || currentUser.role !== 'doctor') return;

    const doctor = doctors.find(d => d.name === currentUser.name);
    if (!doctor) {
        document.getElementById('doctor-patients-list').innerHTML =
            '<div class="alert alert-warning">Could not find your doctor profile. Please contact admin.</div>';
        return;
    }

    const doctorAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
    const uniquePatients = [];
    const patientMap = new Map();

    doctorAppointments.forEach(apt => {
        if (!patientMap.has(apt.contact)) {
            patientMap.set(apt.contact, true);
            uniquePatients.push({
                name: apt.patientName,
                age: apt.age,
                contact: apt.contact,
                lastVisit: apt.date,
                totalVisits: doctorAppointments.filter(a => a.contact === apt.contact).length,
                lastProblem: apt.problem,
                priority: apt.priority,
                status: apt.status,
                timeSlot: apt.timeSlot,
                appointments: doctorAppointments.filter(a => a.contact === apt.contact)
            });
        }
    });

    displayDoctorPatients(uniquePatients, doctor);
}

function displayDoctorPatients(patients, doctor) {
    const container = document.getElementById('doctor-patients-list');

    if (!patients || patients.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <h4>No patients found</h4>
                <p>You don't have any patients yet.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="alert alert-info">
            <h4><i class="fas fa-user-md"></i> ${doctor.name} - Patient List</h4>
            <p>Specialty: ${doctor.specialty} | Total Patients: <strong>${patients.length}</strong></p>
            <p style="font-size: 0.9em; margin-top: 5px;">Click on any patient to view their complete medical history including vital signs.</p>
        </div>
        
        <div class="doctor-grid">
    `;

    patients.forEach(patient => {
        const priorityClass = `priority-${patient.priority}`;
        const statusClass = `status-confirmed`;
        const patientVitals = patientVitalSigns.filter(v => v.contact === patient.contact);
        const latestVital = patientVitals[patientVitals.length - 1];

        html += `
            <div class="card" style="cursor: pointer;" onclick="viewPatientHistory('${patient.contact}')">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
                        ${patient.name.charAt(0)}
                    </div>
                    <div style="flex: 1;">
                        <h4>${patient.name}</h4>
                        <p><strong><i class="fas fa-birthday-cake"></i> Age:</strong> ${patient.age} | <strong><i class="fas fa-phone"></i> Contact:</strong> ${patient.contact}</p>
                        <p><strong><i class="fas fa-history"></i> Visits:</strong> ${patient.totalVisits} | <strong><i class="fas fa-calendar-check"></i> Last Visit:</strong> ${patient.lastVisit}</p>
                        <p><strong><i class="fas fa-clock"></i> Last Appointment Time:</strong> ${patient.timeSlot}</p>
                        <p><strong><i class="fas fa-exclamation-triangle"></i> Priority:</strong> <span class="priority-badge ${priorityClass}">${patient.priority.toUpperCase()}</span></p>
                        <p><strong><i class="fas fa-check-circle"></i> Status:</strong> <span class="${statusClass}">${patient.status}</span></p>
                        ${latestVital ? `
                            <div style="margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 8px;">
                                <strong><i class="fas fa-heartbeat"></i> Latest Vital Signs (${latestVital.date}):</strong><br>
                                BP: ${latestVital.bloodPressure} | Temp: ${latestVital.temperature} | Pulse: ${latestVital.pulse}
                            </div>
                        ` : ''}
                        <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                            <strong><i class="fas fa-stethoscope"></i> Problem:</strong> "${patient.lastProblem.substring(0, 50)}${patient.lastProblem.length > 50 ? '...' : ''}"
                        </p>
                        <button class="btn btn-info btn-sm" onclick="event.stopPropagation(); viewPatientHistory('${patient.contact}')" style="margin-top: 10px; padding: 5px 15px; font-size: 0.9em;">
                            <i class="fas fa-chart-bar"></i> View Complete History
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function filterDoctorAppointments(filterType) {
    const buttons = document.querySelectorAll('#my-patients .filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Find the clicked button
    let clickedButton = null;
    if (event && event.target) {
        clickedButton = event.target;
    } else {
        // If no event, use the first button with matching text
        clickedButton = Array.from(buttons).find(btn =>
            btn.textContent.toLowerCase().includes(filterType)
        );
    }

    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    if (!currentUser || currentUser.role !== 'doctor') return;

    const doctor = doctors.find(d => d.name === currentUser.name);
    if (!doctor) return;

    let doctorAppointments = appointments.filter(apt => apt.doctorId === doctor.id);

    if (filterType === 'today') {
        const today = new Date().toLocaleDateString();
        doctorAppointments = doctorAppointments.filter(apt => apt.date === today);
    } else if (filterType === 'emergency') {
        doctorAppointments = doctorAppointments.filter(apt => apt.priority === 'emergency');
    }

    const uniquePatients = [];
    const patientMap = new Map();

    doctorAppointments.forEach(apt => {
        if (!patientMap.has(apt.contact)) {
            patientMap.set(apt.contact, true);
            uniquePatients.push({
                name: apt.patientName,
                age: apt.age,
                contact: apt.contact,
                lastVisit: apt.date,
                totalVisits: doctorAppointments.filter(a => a.contact === apt.contact).length,
                lastProblem: apt.problem,
                priority: apt.priority,
                status: apt.status,
                timeSlot: apt.timeSlot,
                appointments: doctorAppointments.filter(a => a.contact === apt.contact)
            });
        }
    });

    displayDoctorPatients(uniquePatients, doctor);
}

// ============= APPOINTMENT FUNCTIONS =============
function confirmAppointment(doctorId, fee, priority) {
    if (!selectedDoctor) {
        alert('Please select a doctor first!');
        return;
    }

    if (!selectedSlot) {
        alert('Please select a time slot!');
        return;
    }

    showAppointmentPayment(doctorId, fee, priority);
}

// ============= FORMAT PHONE NUMBER WITH +880 =============
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.startsWith('0')) {
        value = '880' + value.substring(1);
    }

    if (!value.startsWith('880')) {
        value = '880' + value;
    }

    // Format as +880XXXXXXXXXX
    input.value = '+880' + value.substring(3);
}

function validateAndFormatPhone(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        let value = input.value.trim();

        value = value.replace(/^\+880|^880|^0/, '');

        if (value.length === 10) {
            input.value = '+880' + value;
        } else if (value.length > 10) {
            input.value = '+880' + value.substring(0, 10);
        }
    }
}

// ============= TEST FUNCTIONS =============
function loadTests() {
    const container = document.getElementById('testSelection');
    container.innerHTML = tests.map(test => `
        <div style="margin: 10px 0;">
            <label style="display: flex; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                <input type="checkbox" value="${test.id}" onchange="calculateTestFee()" style="width: auto; margin-right: 10px;">
                <div style="flex: 1;">
                    <strong>${test.name}</strong>
                    <p style="font-size: 0.9em; color: #666; margin: 5px 0;"><i class="fas fa-clock"></i> Duration: ${test.duration}</p>
                </div>
                <span style="font-weight: 700; color: #1e3a8a;">৳${test.fee}</span>
            </label>
        </div>
    `).join('');

    document.getElementById('testBookingForm').onsubmit = function (e) {
        e.preventDefault();
        showTestPayment();
    };
}

function calculateTestFee() {
    const selected = Array.from(document.querySelectorAll('#testSelection input:checked'));
    const total = selected.reduce((sum, input) => {
        const test = tests.find(t => t.id == input.value);
        return sum + test.fee;
    }, 0);
    document.getElementById('totalTestFee').textContent = total;
}

// ============= DOCTOR SELECTION & AI =============
function showDoctorSelection() {
    const patientName = document.getElementById('patientName').value;
    const problem = document.getElementById('patientProblem').value;

    if (!patientName || !problem) {
        alert('Please fill in patient name and problem description first!');
        return;
    }

    document.getElementById('doctorSelection').style.display = 'block';
    loadDoctorSelection();
}

function loadDoctorSelection() {
    const container = document.getElementById('doctorSelectionList');
    container.innerHTML = doctors.map(doctor => `
    <div class="doctor-card" onclick="selectDoctor(${doctor.id})" id="doctor-card-${doctor.id}">
        <img src="${doctor.avatar}" alt="${doctor.name}">
        <h3>${doctor.name}</h3>
        <p style="color: #1e3a8a; font-weight: 600; margin: 5px 0;">${doctor.specialty}</p>
        <p style="font-size: 0.9em;"><i class="fas fa-star"></i> ${doctor.rating} | <i class="fas fa-graduation-cap"></i> ${doctor.experience} years</p>
        <p style="font-size: 0.85em; margin: 10px 0;"><strong><i class="fas fa-tools"></i> Expertise:</strong><br>${doctor.expertise.join(', ')}</p>
        <p style="font-weight: 700; color: #10b981; font-size: 1.2em; margin: 10px 0;"><i class="fas fa-money-bill"></i> ৳${doctor.fee}</p>
        <button class="btn btn-primary" onclick="event.stopPropagation(); selectDoctor(${doctor.id})">
            <i class="fas fa-check-circle"></i> Select This Doctor
        </button>
    </div>
`).join('');
}

function populateSpecialtyFilter() {
    const select = document.getElementById('specialtyFilter');
    if (!select) return;

    select.innerHTML = '<option value="all">All Specialties</option>';
    const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

    specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        select.appendChild(option);
    });
}

function filterDoctors() {
    const specialty = document.getElementById('specialtyFilter').value;
    const container = document.getElementById('doctorSelectionList');

    let filteredDoctors = doctors;
    if (specialty !== 'all') {
        filteredDoctors = doctors.filter(doctor => doctor.specialty === specialty);
    }

    container.innerHTML = filteredDoctors.map(doctor => `
    <div class="doctor-card" onclick="selectDoctor(${doctor.id})" id="doctor-card-${doctor.id}">
        <img src="${doctor.avatar}" alt="${doctor.name}">
        <h3>${doctor.name}</h3>
        <p style="color: #1e3a8a; font-weight: 600; margin: 5px 0;">${doctor.specialty}</p>
        <p style="font-size: 0.9em;"><i class="fas fa-star"></i> ${doctor.rating} | <i class="fas fa-graduation-cap"></i> ${doctor.experience} years</p>
        <p style="font-size: 0.85em; margin: 10px 0;"><strong><i class="fas fa-tools"></i> Expertise:</strong><br>${doctor.expertise.join(', ')}</p>
        <p style="font-weight: 700; color: #10b981; font-size: 1.2em; margin: 10px 0;"><i class="fas fa-money-bill"></i> ৳${doctor.fee}</p>
        <button class="btn btn-primary" onclick="event.stopPropagation(); selectDoctor(${doctor.id})">
            <i class="fas fa-check-circle"></i> Select This Doctor
        </button>
    </div>
`).join('');
}

function selectDoctor(doctorId) {
    document.querySelectorAll('.doctor-card').forEach(card => {
        card.classList.remove('selected');
    });

    const cardEl = document.getElementById(`doctor-card-${doctorId}`);
    if (cardEl) cardEl.classList.add('selected');

    selectedDoctor = doctors.find(d => d.id === doctorId);
    displayDoctorRecommendation(selectedDoctor);
}

function getAIRecommendation() {
    const problem = document.getElementById('patientProblem').value.toLowerCase();

    if (!problem) {
        alert('Please describe your problem first!');
        return;
    }

    let matchedDoctors = doctors.filter(doctor => {
        return doctor.expertise.some(exp =>
            naiveStringSearch(problem, exp.toLowerCase()) ||
            naiveStringSearch(exp.toLowerCase(), problem)
        );
    });

    if (matchedDoctors.length === 0) {
        // If no specific expertise matches, recommend General Physician
        matchedDoctors = doctors.filter(d => d.specialty === "General Physician");
        if (matchedDoctors.length === 0) {
            matchedDoctors = [doctors[0]];
        }
    }

    matchedDoctors.sort((a, b) => {
        const scoreA = a.rating * 10 + a.experience * 0.5;
        const scoreB = b.rating * 10 + b.experience * 0.5;
        return scoreB - scoreA;
    });

    const bestDoctor = matchedDoctors[0];
    selectDoctor(bestDoctor.id);
    document.getElementById(`doctor-card-${bestDoctor.id}`)?.scrollIntoView({ behavior: 'smooth' });

    const recDiv = document.getElementById('doctorRecommendation');
    recDiv.innerHTML = `
        <div class="alert alert-info">
            <strong><i class="fas fa-robot"></i> AI Recommendation:</strong> Based on your symptoms, we recommend ${bestDoctor.name} (${bestDoctor.specialty}) as the most suitable doctor for your condition.
        </div>
    `;
    recDiv.style.display = 'block';
}

function displayDoctorRecommendation(doctor) {
    const recDiv = document.getElementById('doctorRecommendation');
    const priority = document.getElementById('priorityLevel').value;
    const doctorKey = `doctor_${doctor.id}`;
    const currentBooked = bookedSlots[doctorKey] || [];

    const preferredTimeInput = document.getElementById('preferredTime');
    let requestedTime = "10:00";

    if (preferredTimeInput && preferredTimeInput.value) {
        requestedTime = preferredTimeInput.value;
        requestedTime = requestedTime.substring(0, 5);
    }

    const availableSlots = findOptimalSlots(requestedTime, doctor.availableSlots, currentBooked);

    let priorityFeeMultiplier = 1;
    let priorityText = "";

    if (priority === "emergency") {
        priorityFeeMultiplier = 1.5;
        priorityText = "⚠️ Emergency cases get immediate priority!";
    } else if (priority === "high") {
        priorityFeeMultiplier = 1.2;
        priorityText = "⏰ High priority - Reduced waiting time";
    }

    const finalFee = Math.round(doctor.fee * priorityFeeMultiplier);

    recDiv.innerHTML = `
    <div class="recommendation">
        <h3><i class="fas fa-check-circle"></i> Selected Doctor</h3>
        <div class="card" style="background: white; margin-top: 15px;">
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="${doctor.avatar}" alt="${doctor.name}" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
                <div style="flex: 1;">
                    <h3>${doctor.name}</h3>
                    <p style="color: #1e3a8a; font-weight: 600;"><i class="fas fa-stethoscope"></i> ${doctor.specialty}</p>
                    <p><i class="fas fa-star"></i> ${doctor.rating} Rating | <i class="fas fa-graduation-cap"></i> ${doctor.experience} Years Experience</p>
                    <p><strong><i class="fas fa-tools"></i> Expertise:</strong> ${doctor.expertise.join(', ')}</p>
                </div>
            </div>
            <div class="fee-display" style="margin-top: 15px;">
                <i class="fas fa-money-bill"></i> Consultation Fee: ৳${finalFee} ${priority !== 'normal' ? `<span style="font-size: 0.6em; color: #ef4444;">(${priority} priority)</span>` : ''}
            </div>
            ${preferredTimeInput && preferredTimeInput.value ?
        `<div class="alert alert-info"><i class="fas fa-clock"></i> Showing slots closest to your preferred time: ${requestedTime}</div>` :
        `<div class="alert alert-info"><i class="fas fa-clock"></i> Showing available time slots</div>`}
            ${priorityText ? `<div class="alert alert-warning">${priorityText}</div>` : ''}
        </div>
    </div>
`;

    displayTimeSlots(doctor, availableSlots, finalFee, priority, requestedTime);
    recDiv.style.display = 'block';
}

function displayTimeSlots(doctor, slots, fee, priority, requestedTime = "10:00") {
    const slotDiv = document.getElementById('timeSlotSelection');

    if (!slots || slots.length === 0) {
        slotDiv.innerHTML = `
        <div class="alert alert-warning">
            <strong><i class="fas fa-exclamation-triangle"></i> No available slots today!</strong> Please try another day or choose a different doctor.
        </div>
    `;
        slotDiv.style.display = 'block';
        return;
    }

    slotDiv.innerHTML = `
    <div class="card" style="margin-top: 20px;">
        <h3><i class="fas fa-clock"></i> Available Time Slots</h3>
        ${requestedTime ? `<p style="color: #666; margin-bottom: 15px;">Select your preferred time slot (closest to ${requestedTime} shown first):</p>` : '<p style="color: #666; margin-bottom: 15px;">Select your preferred time slot:</p>'}
        <div id="slotsContainer"></div>
        <button class="btn btn-success" onclick="confirmAppointment(${doctor.id}, ${fee}, '${priority}')" style="margin-top: 20px;">
            <i class="fas fa-check-circle"></i> Proceed to Payment
        </button>
    </div>
`;

    const container = document.getElementById('slotsContainer');
    container.innerHTML = '';
    slots.forEach((slot, index) => {
        const slotBtn = document.createElement('span');
        slotBtn.className = 'time-slot';
        slotBtn.textContent = slot;

        if (index === 0) {
            slotBtn.style.background = '#10b981';
            slotBtn.style.fontWeight = 'bold';
            slotBtn.innerHTML = `${slot} <small style="font-size: 0.8em;">(Closest)</small>`;
        }

        slotBtn.onclick = () => selectTimeSlot(slotBtn);
        container.appendChild(slotBtn);
    });

    slotDiv.style.display = 'block';
}

function selectTimeSlot(element) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedSlot = element.textContent.replace(' (Closest)', '');
}

function calculateWaitTime(position, priority, doctorId) {
    const base = 15;
    const multiplier = priority === 'emergency' ? 0.3 : priority === 'high' ? 0.6 : 1;
    return Math.round(position * base * multiplier);
}

function searchReports() {
    const query = document.getElementById('reportSearch').value.toLowerCase();
    const filtered = testBookings.filter(booking =>
        booking.contact.includes(query) ||
        `TEST${booking.id.toString().padStart(4, '0')}`.toLowerCase().includes(query)
    );

    const container = document.getElementById('reportList');

    if (filtered.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No reports found with this search.</div>';
        return;
    }

    container.innerHTML = filtered.map(booking => `
    <div class="card">
        <h4><i class="fas fa-file-medical-alt"></i> Booking ID: TEST${booking.id.toString().padStart(4, '0')}</h4>
        <p><strong><i class="fas fa-user"></i> Patient:</strong> ${booking.patientName} (Age: ${booking.age || 'N/A'})</p>
        <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${booking.contact}</p>
        <p><strong><i class="fas fa-vial"></i> Tests:</strong> ${booking.tests.map(t => t.name).join(', ')}</p>
        <p><strong><i class="fas fa-calendar"></i> Test Date:</strong> ${booking.date}</p>
        <p><strong><i class="fas fa-money-bill"></i> Total Fee:</strong> ৳${booking.totalFee}</p>
        <p><strong><i class="fas fa-check-circle"></i> Status:</strong> <span class="status-badge">${booking.status}</span></p>
        <p><strong><i class="fas fa-file-alt"></i> Report Ready:</strong> ${booking.reportReady ? '<span class="status-confirmed">✅ Yes - Ready for collection</span>' : '<span class="status-pending">⏳ Processing - Will be ready in 24-48 hours</span>'}</p>
        <p><strong><i class="fas fa-user-tag"></i> Booked By:</strong> ${booking.bookedBy} (${booking.bookedByRole})</p>
        <p><strong><i class="fas fa-money-check"></i> Payment ID:</strong> ${booking.paymentId || 'N/A'}</p>
    </div>
`).join('');
}

// ============= EMERGENCY / APPOINTMENTS  =============
function loadEmergencyQueue() {
    const container = document.getElementById('emergencyQueue');

    let combinedQueue = [...appointments];
    combinedQueue = mergeSort(combinedQueue, 'priority');

    if (combinedQueue.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No patients in queue right now.</div>';
        return;
    }

    container.innerHTML =
        '<table><thead><tr><th>Position</th><th>Patient</th><th>Priority</th><th>Doctor</th><th>Problem</th><th>Time</th><th>Booked By</th></tr></thead><tbody>' +
        combinedQueue.map((apt, index) => `
    <tr>
        <td><strong>#${index + 1}</strong></td>
        <td><i class="fas fa-user"></i> ${apt.patientName}</td>
        <td><span class="priority-badge priority-${apt.priority}">${apt.priority.toUpperCase()}</span></td>
        <td><i class="fas fa-user-md"></i> ${apt.doctor}</td>
        <td>${apt.problem.substring(0, 25)}...</td>
        <td><i class="fas fa-clock"></i> ${apt.timeSlot}</td>
        <td>${apt.bookedBy} (${apt.bookedByRole})</td>
    </tr>
`).join('') +
        '</tbody></table>';
}

function searchMyAppointments() {
    const query = document.getElementById('myAppointmentSearch').value;
    const filtered = appointments.filter(apt => apt.contact.includes(query));

    const container = document.getElementById('myAppointmentList');

    if (query.length < 3) {
        container.innerHTML = '<div class="alert alert-info">Please enter at least 3 digits of your contact number.</div>';
        return;
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No appointments found with this contact number.</div>';
        return;
    }

    container.innerHTML = filtered.map(apt => `
    <div class="card">
        <h4><i class="fas fa-calendar-check"></i> Appointment ID: APT${apt.id.toString().padStart(4, '0')}</h4>
        <p><strong><i class="fas fa-user"></i> Patient:</strong> ${apt.patientName} (Age: ${apt.age})</p>
        <p><strong><i class="fas fa-user-md"></i> Doctor:</strong> ${apt.doctor} - ${apt.specialty}</p>
        <p><strong><i class="fas fa-calendar"></i> Date:</strong> ${apt.date}</p>
        <p><strong><i class="fas fa-clock"></i> Time Slot:</strong> ${apt.timeSlot}</p>
        <p><strong><i class="fas fa-stethoscope"></i> Problem:</strong> ${apt.problem}</p>
        <p><strong><i class="fas fa-money-bill"></i> Fee:</strong> ৳${apt.fee}</p>
        <p><strong><i class="fas fa-exclamation-triangle"></i> Priority:</strong> <span class="priority-badge priority-${apt.priority}">${apt.priority.toUpperCase()}</span></p>
        <p><strong><i class="fas fa-user-tag"></i> Booked By:</strong> ${apt.bookedBy} (${apt.bookedByRole})</p>
        <p><strong><i class="fas fa-money-check"></i> Payment ID:</strong> ${apt.paymentId || 'N/A'}</p>
        <div class="queue-position">
            <i class="fas fa-map-marker-alt"></i> Your Queue Position: <strong>#${apt.queuePosition}</strong>
            <br><i class="fas fa-clock"></i> Estimated Wait Time: ${calculateWaitTime(apt.queuePosition, apt.priority, apt.doctorId)} minutes
        </div>
    </div>
`).join('');
}

// ============= SEARCH, QUICK BOOK, INIT =============
function loadDoctors() {
    const container = document.getElementById('doctorList');
    container.innerHTML = doctors.map(doctor => `
    <div class="doctor-card">
        <img src="${doctor.avatar}" alt="${doctor.name}">
        <h3>${doctor.name}</h3>
        <p style="color: #1e3a8a; font-weight: 600; margin: 5px 0;">${doctor.specialty}</p>
        <p style="font-size: 0.9em;"><i class="fas fa-star"></i> ${doctor.rating} | <i class="fas fa-graduation-cap"></i> ${doctor.experience} years</p>
        <p style="font-size: 0.85em; margin: 10px 0;"><strong><i class="fas fa-tools"></i> Expertise:</strong><br>${doctor.expertise.join(', ')}</p>
        <p style="font-weight: 700; color: #10b981; font-size: 1.2em; margin: 10px 0;"><i class="fas fa-money-bill"></i> ৳${doctor.fee}</p>
        <button class="btn btn-primary" onclick="quickBookDoctor(${doctor.id})">
            <i class="fas fa-calendar-plus"></i> Book Now
        </button>
    </div>
`).join('');
}

function quickBookDoctor(doctorId) {
    switchTab('book-appointment');
    const doctor = doctors.find(d => d.id === doctorId);
    selectDoctor(doctor.id);
    displayDoctorRecommendation(doctor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function searchDoctors() {
    const query = document.getElementById('doctorSearch').value.toLowerCase();
    const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.expertise.some(exp => exp.toLowerCase().includes(query))
    );

    const container = document.getElementById('doctorList');
    if (filtered.length === 0) {
        container.innerHTML = '<p class="alert alert-info">No doctors found matching your search.</p>';
        return;
    }

    container.innerHTML = filtered.map(doctor => `
    <div class="doctor-card">
        <img src="${doctor.avatar}" alt="${doctor.name}">
        <h3>${doctor.name}</h3>
        <p style="color: #1e3a8a; font-weight: 600; margin: 5px 0;">${doctor.specialty}</p>
        <p style="font-size: 0.9em;"><i class="fas fa-star"></i> ${doctor.rating} | <i class="fas fa-graduation-cap"></i> ${doctor.experience} years</p>
        <p style="font-size: 0.85em; margin: 10px 0;"><strong><i class="fas fa-tools"></i> Expertise:</strong><br>${doctor.expertise.join(', ')}</p>
        <p style="font-weight: 700; color: #10b981; font-size: 1.2em; margin: 10px 0;"><i class="fas fa-money-bill"></i> ৳${doctor.fee}</p>
        <button class="btn btn-primary" onclick="quickBookDoctor(${doctor.id})">
            <i class="fas fa-calendar-plus"></i> Book Now
        </button>
    </div>
`).join('');
}

// ============= TAB SWITCHING FUNCTION =============
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Show selected tab content
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update page title based on tab
    const pageTitleMap = {
        'my-patients': 'My Patients',
        'book-appointment': 'Book Appointment',
        'doctor-info': 'Doctor Information',
        'test-booking': 'Test Booking',
        'test-reports': 'Test Reports',
        'emergency': 'Emergency Queue',
        'my-appointments': 'My Appointments',
        'patient-history': 'Patient History',
        'payment-history': 'Payment History'
    };

    if (pageTitleMap[tabName]) {
        document.getElementById('page-title').textContent = pageTitleMap[tabName];
    }

    // Load specific tab content
    if (tabName === 'doctor-info') loadDoctors();
    if (tabName === 'test-booking') loadTests();
    if (tabName === 'test-reports') loadReports();
    if (tabName === 'emergency') loadEmergencyQueue();
    if (tabName === 'my-patients') loadDoctorPatients();
    if (tabName === 'patient-history') searchPatients();
    if (tabName === 'payment-history') loadPaymentRecords();
}

function updatePriorityInfo() {
    const priority = document.getElementById('priorityLevel').value;
    const infoDiv = document.getElementById('priorityInfo');

    const messages = {
        emergency: '🚨 Emergency cases receive immediate attention with minimal wait time. Additional fee: +50%',
        high: '⚠️ High priority cases get faster service. Additional fee: +20%',
        normal: '✅ Standard appointment with normal queue management.'
    };

    infoDiv.textContent = messages[priority];
    infoDiv.style.display = 'block';
}

// ============= PATIENT SEARCH FOR STAFF =============
function searchPatients() {
    const query = document.getElementById('patientSearch').value.toLowerCase();
    const container = document.getElementById('patientList');

    if (query.length < 2) {
        container.innerHTML = '<div class="alert alert-info">Please enter at least 2 characters to search.</div>';
        return;
    }

    const matchedPatients = [];
    const patientMap = new Map();

    appointments.forEach(apt => {
        if ((apt.patientName.toLowerCase().includes(query) || apt.contact.includes(query)) && !patientMap.has(apt.contact)) {
            patientMap.set(apt.contact, true);
            matchedPatients.push({
                name: apt.patientName,
                contact: apt.contact,
                age: apt.age,
                lastVisit: apt.date,
                totalVisits: appointments.filter(a => a.contact === apt.contact).length,
                doctor: apt.doctor,
                lastProblem: apt.problem
            });
        }
    });

    patientVitalSigns.forEach(vital => {
        if ((vital.patientName.toLowerCase().includes(query) || vital.contact.includes(query)) && !patientMap.has(vital.contact)) {
            patientMap.set(vital.contact, true);
            matchedPatients.push({
                name: vital.patientName,
                contact: vital.contact,
                age: 'N/A',
                lastVisit: vital.date,
                totalVisits: appointments.filter(a => a.contact === vital.contact).length,
                doctor: vital.doctor || 'N/A',
                lastProblem: 'Vital signs recorded'
            });
        }
    });

    if (matchedPatients.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No patients found matching your search.</div>';
        return;
    }

    container.innerHTML = `
        <div class="alert alert-success">
            Found ${matchedPatients.length} patient(s) matching your search.
        </div>
        <div class="doctor-grid">
            ${matchedPatients.map(patient => {
        const patientVitals = patientVitalSigns.filter(v => v.contact === patient.contact);
        const latestVital = patientVitals[patientVitals.length - 1];

        return `
                    <div class="card">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
                                ${patient.name.charAt(0)}
                            </div>
                            <div style="flex: 1;">
                                <h4>${patient.name}</h4>
                                <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${patient.contact}</p>
                                <p><strong><i class="fas fa-birthday-cake"></i> Age:</strong> ${patient.age} | <strong><i class="fas fa-history"></i> Visits:</strong> ${patient.totalVisits}</p>
                                <p><strong><i class="fas fa-calendar-check"></i> Last Visit:</strong> ${patient.lastVisit}</p>
                                <p><strong><i class="fas fa-user-md"></i> Last Doctor:</strong> ${patient.doctor}</p>
                                ${latestVital ? `
                                    <div style="margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 8px; font-size: 0.9em;">
                                        <strong><i class="fas fa-heartbeat"></i> Latest Vitals:</strong><br>
                                        BP: ${latestVital.bloodPressure} | Temp: ${latestVital.temperature}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-info" onclick="viewPatientHistory('${patient.contact}')" style="flex: 1;">
                                <i class="fas fa-chart-bar"></i> View History
                            </button>
                            <button class="btn btn-warning" onclick="recordNewVitalSigns('${patient.contact}', '${patient.name}')" style="flex: 1;">
                                <i class="fas fa-notes-medical"></i> Record Vitals
                            </button>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function recordNewVitalSigns(contact, patientName) {
    const tempAppointment = {
        id: appointments.length + 1,
        patientName: patientName,
        contact: contact,
        doctor: "General Checkup",
        doctorId: 7,
        specialty: "General Physician",
        timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
    };

    showVitalSignsModal(tempAppointment);
}

// Initialization
function initApp() {
    loadAllData();
    
    if (currentUser) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        updateUserInfo();
        updateRoleBasedUI();
    }
    
    // Create animated background
    createAnimatedBackground();

    // Initialize demo data if needed
    loadInitialDemoData();

    if (payments.length === 0) {
        initializeDemoPayments();
    }
    
    populateSpecialtyFilter();
    loadDoctors();
    loadTests();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').setAttribute('min', today);

    const preferredTimeInput = document.getElementById('preferredTime');
    if (preferredTimeInput && !preferredTimeInput.value) {
        preferredTimeInput.value = '10:00';
    }
    
    console.log('✅ App initialized with localStorage support');
}

// Close modals when clicking outside
window.onclick = function (event) {
    const vitalModal = document.getElementById('vitalSignsModal');
    const historyModal = document.getElementById('patientHistoryModal');
    const paymentModal = document.getElementById('payment-modal');

    if (event.target === vitalModal) {
        closeVitalSignsModal();
    }
    if (event.target === historyModal) {
        closePatientHistoryModal();
    }
    if (event.target === paymentModal) {
        closePaymentModal();
    }
};

// Start the application
window.onload = function () {
    initApp();
    
    window.addEventListener('online', function() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) indicator.style.display = 'none';
    });
    
    window.addEventListener('offline', function() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = '⚠️ You are offline. Data will be saved locally.';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    });
    
    window.addEventListener('beforeunload', function() {
        saveAllData();
    });
};