// ============= LOCALSTORAGE MANAGEMENT =============
const STORAGE_KEYS = {
    USERS: 'healthcare_users',
    APPOINTMENTS: 'healthcare_appointments',
    TEST_BOOKINGS: 'healthcare_test_bookings',
    PATIENT_VITALS: 'healthcare_patient_vitals',
    PAYMENTS: 'healthcare_payments',
    DOCTORS: 'healthcare_doctors',
    TESTS: 'healthcare_tests',
    EMERGENCY_QUEUE: 'healthcare_emergency_queue',
    BOOKED_SLOTS: 'healthcare_booked_slots',
    CASH_REGISTER: 'healthcare_cash_register',
    CURRENT_USER: 'healthcare_current_user'
};

// Initial data
let usersDB = [
    {
        id: 1,
        name: "Dr. Ahmed Hassan",
        email: "ahmed@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "A",
        doctorId: 1
    },
    {
        id: 2,
        name: "Dr. Fatima Rahman",
        email: "fatima@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "F",
        doctorId: 2
    },
    {
        id: 3,
        name: "Dr. Kamal Hossain",
        email: "kamal@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "K",
        doctorId: 3
    },
    {
        id: 4,
        name: "Dr. Ayesha Siddique",
        email: "ayesha@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "A",
        doctorId: 4
    },
    {
        id: 5,
        name: "Dr. Rafiq Ahmed",
        email: "rafiq@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "R",
        doctorId: 5
    },
    {
        id: 6,
        name: "Dr. Nusrat Jahan",
        email: "nusrat@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "N",
        doctorId: 6
    },
    {
        id: 7,
        name: "Dr. Imran Khan",
        email: "imran@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "I",
        doctorId: 7
    },
    {
        id: 8,
        name: "Dr. Shabnam Ara",
        email: "shabnam@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "S",
        doctorId: 8
    },
    {
        id: 9,
        name: "Dr. Mustafa Ali",
        email: "mustafa@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "M",
        doctorId: 9
    },
    {
        id: 10,
        name: "Dr. Tasnuva Islam",
        email: "tasnuva@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "T",
        doctorId: 10
    },
    {
        id: 11,
        name: "Dr. Zahed Mahmud",
        email: "zahed@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "Z",
        doctorId: 11
    },
    {
        id: 12,
        name: "Dr. Farzana Haque",
        email: "farzana@hospital.com",
        password: "doctor123",
        role: "doctor",
        avatar: "F",
        doctorId: 12
    },
    {
        id: 13,
        name: "Nurse Fatima",
        email: "staff@hospital.com",
        password: "staff123",
        role: "staff",
        avatar: "S"
    },
    {
        id: 14,
        name: "Admin Staff",
        email: "admin@hospital.com",
        password: "admin123",
        role: "staff",
        avatar: "A"
    }
];

let doctors = [
    { id: 1, name: "Dr. Ahmed Hassan", specialty: "Cardiologist", experience: 15, rating: 4.8, fee: 1500, avatar: "https://ui-avatars.com/api/?name=Ahmed+Hassan&background=1e3a8a&color=fff", expertise: ["Heart Disease", "Hypertension", "ECG"], availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
    { id: 2, name: "Dr. Fatima Rahman", specialty: "Pediatrician", experience: 12, rating: 4.9, fee: 1200, avatar: "https://ui-avatars.com/api/?name=Fatima+Rahman&background=3b82f6&color=fff", expertise: ["Child Care", "Vaccination", "Growth Issues"], availableSlots: ["09:00", "10:30", "11:30", "14:00", "15:30", "16:30"] },
    { id: 3, name: "Dr. Kamal Hossain", specialty: "Orthopedic", experience: 18, rating: 4.7, fee: 1800, avatar: "https://ui-avatars.com/api/?name=Kamal+Hossain&background=8b5cf6&color=fff", expertise: ["Bone Fracture", "Joint Pain", "Sports Injury"], availableSlots: ["08:00", "09:30", "11:00", "13:00", "15:00", "17:00"] },
    { id: 4, name: "Dr. Ayesha Siddique", specialty: "Dermatologist", experience: 10, rating: 4.6, fee: 1300, avatar: "https://ui-avatars.com/api/?name=Ayesha+Siddique&background=0ea5e9&color=fff", expertise: ["Skin Diseases", "Acne", "Hair Loss"], availableSlots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"] },
    { id: 5, name: "Dr. Rafiq Ahmed", specialty: "Neurologist", experience: 20, rating: 4.9, fee: 2000, avatar: "https://ui-avatars.com/api/?name=Rafiq+Ahmed&background=ec4899&color=fff", expertise: ["Brain Disorders", "Migraine", "Epilepsy"], availableSlots: ["10:00", "11:00", "13:00", "15:00", "16:00"] },
    { id: 6, name: "Dr. Nusrat Jahan", specialty: "Gynecologist", experience: 14, rating: 4.8, fee: 1600, avatar: "https://ui-avatars.com/api/?name=Nusrat+Jahan&background=06b6d4&color=fff", expertise: ["Women Health", "Pregnancy Care", "PCOS"], availableSlots: ["09:00", "10:30", "12:00", "14:00", "15:30"] },
    { id: 7, name: "Dr. Imran Khan", specialty: "General Physician", experience: 8, rating: 4.5, fee: 800, avatar: "https://ui-avatars.com/api/?name=Imran+Khan&background=84cc16&color=fff", expertise: ["Fever", "Cold", "General Checkup"], availableSlots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"] },
    { id: 8, name: "Dr. Shabnam Ara", specialty: "Psychiatrist", experience: 11, rating: 4.7, fee: 1400, avatar: "https://ui-avatars.com/api/?name=Shabnam+Ara&background=f97316&color=fff", expertise: ["Depression", "Anxiety", "Stress Management"], availableSlots: ["10:00", "11:00", "13:00", "15:00", "16:00"] },
    { id: 9, name: "Dr. Mustafa Ali", specialty: "ENT Specialist", experience: 13, rating: 4.6, fee: 1100, avatar: "https://ui-avatars.com/api/?name=Mustafa+Ali&background=1e3a8a&color=fff", expertise: ["Ear Problems", "Nose Issues", "Throat Infection"], availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
    { id: 10, name: "Dr. Tasnuva Islam", specialty: "Endocrinologist", experience: 9, rating: 4.5, fee: 1350, avatar: "https://ui-avatars.com/api/?name=Tasnuva+Islam&background=3b82f6&color=fff", expertise: ["Diabetes", "Thyroid", "Hormone Issues"], availableSlots: ["09:30", "11:00", "13:00", "14:30", "16:00"] },
    { id: 11, name: "Dr. Zahed Mahmud", specialty: "Gastroenterologist", experience: 16, rating: 4.8, fee: 1700, avatar: "https://ui-avatars.com/api/?name=Zahed+Mahmud&background=8b5cf6&color=fff", expertise: ["Stomach Problems", "Liver Disease", "IBS"], availableSlots: ["10:00", "11:30", "13:00", "15:00", "16:30"] },
    { id: 12, name: "Dr. Farzana Haque", specialty: "Ophthalmologist", experience: 12, rating: 4.7, fee: 1250, avatar: "https://ui-avatars.com/api/?name=Farzana+Haque&background=0ea5e9&color=fff", expertise: ["Eye Problems", "Cataract", "Vision Issues"], availableSlots: ["08:30", "10:00", "11:30", "14:00", "15:30", "17:00"] }
];

let tests = [
    { id: 1, name: "Complete Blood Count (CBC)", fee: 500, duration: "2 hours" },
    { id: 2, name: "Blood Sugar Test", fee: 300, duration: "1 hour" },
    { id: 3, name: "Lipid Profile", fee: 800, duration: "3 hours" },
    { id: 4, name: "Thyroid Function Test", fee: 1200, duration: "4 hours" },
    { id: 5, name: "Liver Function Test", fee: 900, duration: "3 hours" },
    { id: 6, name: "Kidney Function Test", fee: 850, duration: "3 hours" },
    { id: 7, name: "X-Ray (Chest)", fee: 600, duration: "30 minutes" },
    { id: 8, name: "ECG", fee: 500, duration: "30 minutes" },
    { id: 9, name: "Ultrasound", fee: 1500, duration: "1 hour" },
    { id: 10, name: "CT Scan", fee: 5000, duration: "2 hours" },
    { id: 11, name: "MRI", fee: 8000, duration: "3 hours" },
    { id: 12, name: "Urine Routine", fee: 250, duration: "1 hour" }
];

// Dynamic data that will be loaded from localStorage
let appointments = [];
let testBookings = [];
let emergencyQueue = [];
let bookedSlots = {};
let patientVitalSigns = [];
let payments = [];
let cashRegister = {
    totalCash: 0,
    todayCollections: 0,
    pendingPayments: []
};
let currentUser = null;
let selectedRole = '';

function loadFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        return false;
    }
}

function saveAllData() {
    saveToLocalStorage(STORAGE_KEYS.USERS, usersDB);
    saveToLocalStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    saveToLocalStorage(STORAGE_KEYS.TEST_BOOKINGS, testBookings);
    saveToLocalStorage(STORAGE_KEYS.PATIENT_VITALS, patientVitalSigns);
    saveToLocalStorage(STORAGE_KEYS.PAYMENTS, payments);
    saveToLocalStorage(STORAGE_KEYS.DOCTORS, doctors);
    saveToLocalStorage(STORAGE_KEYS.TESTS, tests);
    saveToLocalStorage(STORAGE_KEYS.EMERGENCY_QUEUE, emergencyQueue);
    saveToLocalStorage(STORAGE_KEYS.BOOKED_SLOTS, bookedSlots);
    saveToLocalStorage(STORAGE_KEYS.CASH_REGISTER, cashRegister);
    saveToLocalStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    
    console.log('✅ All data saved to localStorage');
}

function loadAllData() {
    usersDB = loadFromLocalStorage(STORAGE_KEYS.USERS, usersDB);
    appointments = loadFromLocalStorage(STORAGE_KEYS.APPOINTMENTS, []);
    testBookings = loadFromLocalStorage(STORAGE_KEYS.TEST_BOOKINGS, []);
    patientVitalSigns = loadFromLocalStorage(STORAGE_KEYS.PATIENT_VITALS, []);
    payments = loadFromLocalStorage(STORAGE_KEYS.PAYMENTS, []);
    doctors = loadFromLocalStorage(STORAGE_KEYS.DOCTORS, doctors);
    tests = loadFromLocalStorage(STORAGE_KEYS.TESTS, tests);
    emergencyQueue = loadFromLocalStorage(STORAGE_KEYS.EMERGENCY_QUEUE, []);
    bookedSlots = loadFromLocalStorage(STORAGE_KEYS.BOOKED_SLOTS, {});
    cashRegister = loadFromLocalStorage(STORAGE_KEYS.CASH_REGISTER, cashRegister);
    currentUser = loadFromLocalStorage(STORAGE_KEYS.CURRENT_USER, null);
    
    console.log('✅ All data loaded from localStorage');
}

// Initialize demo payments if needed
function initializeDemoPayments() {
    if (payments.length === 0) {
        const demoPayment = {
            id: 1, type: 'consultation_fee', amount: 1500, receivedAmount: 1500, change: 0,
            patientName: 'Rahim Ali', patientContact: '01712345678', bookingId: 'APT1',
            paymentMethod: 'cash', transactionId: null, receivedBy: 'Nurse Fatima',
            date: new Date().toLocaleDateString(), time: '10:30', status: 'completed',
            notes: 'Emergency case payment', verifiedBy: 'System', verificationStatus: 'PASSED',
            riskLevel: 'LOW', receiptNumber: 'RCPT0001'
        };
        payments.push(demoPayment);
        cashRegister.totalCash += 1500;
        cashRegister.todayCollections += 1500;
    }
}

// Function to load initial demo data
function loadInitialDemoData() {
    if (appointments.length === 0) {
        appointments = [
            {
                id: 1,
                patientName: "Rahim Ali",
                age: 45,
                contact: "+8801712345678",
                problem: "Chest pain and shortness of breath",
                doctor: "Dr. Ahmed Hassan",
                doctorId: 1,
                specialty: "Cardiologist",
                timeSlot: "10:00",
                fee: 1500,
                priority: "emergency",
                status: "Confirmed",
                date: new Date().toLocaleDateString(),
                queuePosition: 1,
                bookedBy: "Staff User",
                bookedByRole: "staff",
                paymentId: 1
            },
            {
                id: 2,
                patientName: "Fatima Begum",
                age: 32,
                contact: "+8801787654321",
                problem: "High fever and cough",
                doctor: "Dr. Imran Khan",
                doctorId: 7,
                specialty: "General Physician",
                timeSlot: "11:00",
                fee: 800,
                priority: "high",
                status: "Confirmed",
                date: new Date().toLocaleDateString(),
                queuePosition: 2,
                bookedBy: "Staff User",
                bookedByRole: "staff"
            }
        ];
    }

    if (patientVitalSigns.length === 0) {
        patientVitalSigns = [
            {
                id: 1,
                patientName: "Rahim Ali",
                contact: "01712345678",
                date: new Date().toLocaleDateString(),
                time: "10:30",
                weight: "75 kg",
                height: "175 cm",
                temperature: "98.6°F",
                bloodPressure: "120/80 mmHg",
                pulse: "72 bpm",
                oxygenSaturation: "98%",
                respiratoryRate: "16 breaths/min",
                notes: "Patient presented with chest pain. Vital signs stable.",
                recordedBy: "Nurse Fatima",
                appointmentId: 1,
                doctor: "Dr. Ahmed Hassan"
            }
        ];
    }
}