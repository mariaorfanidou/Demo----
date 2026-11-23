"use strict";

//  ΡΥΘΜΙΣΕΙΣ ΚΑΙ ΔΟΚΙΜΑΣΤΙΚΟΣ ΦΟΙΤΗΤΗΣ


const ANNOUNCEMENTS_KEY = "hua_admin_announcements_v1";
const STUDENT_APPLICATIONS_KEY = "hua_student_applications_demo_v1";
const STUDENT_PREFERENCES_KEY = "hua_student_preferences_demo_v1";

const STUDENT_DOCUMENTS_KEY =
    "hua_student_documents_demo_v1";


const savedDemoStudent = JSON.parse(
    sessionStorage.getItem("hua_demo_student") || "null"
);

if (!savedDemoStudent) {
    window.location.replace("index.html");
}

const currentStudent = savedDemoStudent
    ? {
        id: savedDemoStudent.email,
        firstName: savedDemoStudent.firstName,
        lastName: savedDemoStudent.lastName,
        studentId: savedDemoStudent.studentId,
        department: savedDemoStudent.department,
        email: savedDemoStudent.email
    }
    : {
        id: "guest",
        firstName: "Φοιτητής",
        lastName: "",
        studentId: "",
        department: "pliroforiki",
        email: ""
    };

// Εφαρμογή διαφορετικών χρωμάτων ανάλογα με το τμήμα.

const allowedThemes = [
    "pliroforiki",
    "diaitologia",
    "geografia",
    "oikonomia"
];

if (allowedThemes.includes(currentStudent.department)) {
    document.body.classList.add(
        "theme-" + currentStudent.department
    );
}


const departmentNames = {
    pliroforiki: "Πληροφορικής και Τηλεματικής",
    diaitologia: "Επιστήμης Διαιτολογίας και Διατροφής",
    geografia: "Γεωγραφίας",
    oikonomia: "Οικονομίας και Βιώσιμης Ανάπτυξης"
};

const pageTitles = {
    home: "Αρχική",
    profile: "Προφίλ",
    preferences: "Οι Προτιμήσεις μου",
    folder: "Προσωπικός Φάκελος",
    jobs: "Θέσεις Εργασίας",
    "all-announcements": "Όλες οι Ανακοινώσεις",
    "job-details": "Λεπτομέρειες Θέσης",
    "announcement-details": "Λεπτομέρειες Ανακοίνωσης"
};


// =========================================
// 2. ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ
// =========================================
document.getElementById("topbarStudentName").addEventListener("click", function(){
    document.getElementById("profile").scrollIntoView({behavior: "smooth"});
});

function getElement(id) {
    return document.getElementById(id);
}

function createElement(tag, className = "", text = null) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== null) {
        element.textContent = text;
    }

    return element;
}

function readStorage(key) {
    try {
        const result = JSON.parse(
            localStorage.getItem(key) || "[]"
        );

        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Σφάλμα ανάγνωσης:", error);
        return [];
    }
}

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function createId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString() +
        Math.random().toString(36).slice(2)
    );
}

function sortNewest(items) {
    return [...items].sort((a, b) => {
        return String(b.date || "").localeCompare(
            String(a.date || "")
        );
    });
}

function setText(id, value) {
    const target = getElement(id);

    if (target) {
        target.textContent = value;
    }
}

function showEmpty(container, message) {
    container.replaceChildren();

    container.appendChild(
        createElement(
            "div",
            "empty-state",
            message
        )
    );
}

function createButton(text, className, onClick) {
    const button = createElement(
        "button",
        className,
        text
    );

    button.type = "button";
    button.addEventListener("click", onClick);

    return button;
}

function createParagraph(text, className = "") {
    return createElement("p", className, text);
}


// =========================================
// 3. ΣΤΟΙΧΕΙΑ ΦΟΙΤΗΤΗ
// =========================================

function renderStudentInfo() {
    const fullName =
        currentStudent.firstName + " " +
        currentStudent.lastName;

    const department =
        departmentNames[currentStudent.department] ||
        currentStudent.department;

    setText("sidebarStudentName", fullName);

    setText(
        "sidebarStudentDepartment",
        "Τμήμα " + department
    );

    setText("topbarStudentName", fullName);

    setText(
        "welcomeStudentName",
        currentStudent.firstName
    );

    setText("profileFullName", fullName);

    setText(
        "profileStudentId",
        currentStudent.studentId
    );

    setText("profileDepartment", department);

    setText("profileEmail", currentStudent.email);

    const initials = currentStudent.firstName
        .charAt(0)
        .toUpperCase();

    const sidebarAvatar = document.querySelector(
        ".student-avatar"
    );

    const topbarAvatar = document.querySelector(
        ".topbar-avatar"
    );

    if (sidebarAvatar) {
        sidebarAvatar.textContent = initials;
    }

    if (topbarAvatar) {
        topbarAvatar.textContent = initials;
    }
}

// =========================================
// 4. ΠΛΟΗΓΗΣΗ ΣΕΛΙΔΩΝ
// =========================================

let previousAnnouncementPage = "home";
let previousJobPage = "jobs";

// Η ενότητα που εμφανίζεται αυτή τη στιγμή.
let currentPageId = null;

// Εμφάνιση ενότητας και ενημέρωση ιστορικού.
function showPage(pageId, addToHistory = true) {

    if (!pageTitles[pageId]) {
        return;
    }

    // Δεν δημιουργούμε διπλές καταχωρίσεις.
    if (pageId === currentPageId && addToHistory) {
        return;
    }

    document.querySelectorAll(
        ".student-page"
    ).forEach(page => {
        page.classList.toggle(
            "active",
            page.id === pageId
        );
    });

    document.querySelectorAll(
        ".nav-item"
    ).forEach(button => {

        let activePage = pageId;

        if (
            pageId === "all-announcements" ||
            pageId === "announcement-details"
        ) {
            activePage = "home";
        }

        if (pageId === "job-details") {
            activePage = "jobs";
        }

        button.classList.toggle(
            "active",
            button.dataset.page === activePage
        );
    });

 //   setText("pageTitle", pageTitles[pageId]);

    if (
        pageId === "home" ||
        pageId === "all-announcements"
    ) {
        renderAnnouncements();
    }

    if (
        pageId === "home" ||
        pageId === "jobs"
    ) {
        renderJobs();
    }

    currentPageId = pageId;

    // Καταγράφουμε την ενότητα στο ιστορικό.
    if (addToHistory) {
        history.pushState(
            { studentPage: pageId },
            "",
            "#" + pageId
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Επαναφορά ενότητας με Back / Forward.
window.addEventListener("popstate", event => {

    const pageId = event.state?.studentPage;

    if (pageId && pageTitles[pageId]) {
        showPage(pageId, false);
    } else {
        showPage("home", false);
    }
});


// Πλοήγηση από το πλαϊνό μενού.
document.querySelectorAll(
    ".nav-item"
).forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});


// Προβολή όλων των ανακοινώσεων.
getElement("viewAllAnnouncements")
    .addEventListener("click", () => {
        showPage("all-announcements");
    });


// Προβολή όλων των θέσεων εργασίας.
getElement("viewAllJobs")
    .addEventListener("click", () => {
        showPage("jobs");
    });


// Επιστροφή από λεπτομέρειες θέσης.
getElement("backToJobs")
    .addEventListener("click", () => {
        showPage(previousJobPage);
    });


// Επιστροφή από λεπτομέρειες ανακοίνωσης.
getElement("backToAnnouncements")
    .addEventListener("click", () => {
        showPage(previousAnnouncementPage);
    });

// =========================================
// 5. ΑΝΑΚΟΙΝΩΣΕΙΣ
// =========================================

// Διαβάζουμε ανακοινώσεις που έχουν
// καταχωριστεί στο Admin.
//
// Εμφανίζονται μόνο οι δημοσιευμένες
// ανακοινώσεις που αφορούν:
// - Όλα τα τμήματα
// - Το τμήμα του φοιτητή
//
// Αν δεν υπάρχει πεδίο department
// σε μια ανακοίνωση, τη θεωρούμε
// γενική ανακοίνωση.

function getStudentAnnouncements() {
    const allAnnouncements = readStorage(
        ANNOUNCEMENTS_KEY
    );

    const filtered = allAnnouncements.filter(item => {
        if (item.status !== "published") {
            return false;
        }

        const department = item.department || "all";

        return (
            department === "all" ||
            department === currentStudent.department
        );
    });

    return sortNewest(filtered);
}


// =========================================
// 6. ΚΑΡΤΑ ΑΝΑΚΟΙΝΩΣΗΣ
// =========================================

function createAnnouncementCard(item) {
    const card = createElement(
        "article",
        "announcement-card"
    );

    if (item.image && item.image.data) {
        const image = createElement(
            "img",
            "announcement-card-image"
        );

        image.src = item.image.data;
        image.alt = item.title || "Εικόνα ανακοίνωσης";

        card.appendChild(image);
    }

    const body = createElement(
        "div",
        "announcement-card-body"
    );

    body.appendChild(
        createElement(
            "span",
            "announcement-date",
            formatDate(item.date)
        )
    );

    body.appendChild(
        createElement(
            "h3",
            "",
            item.title || "Ανακοίνωση"
        )
    );

    body.appendChild(
        createParagraph(
            item.description || "",
            ""
        )
    );

    const button = createButton(
        "Διαβάστε περισσότερα →",
        "card-link",
        () => {
            openAnnouncementDetails(item.id);
        }
    );

    body.appendChild(button);

    card.appendChild(body);

    return card;
}


// =========================================
// 7. ΠΡΟΒΟΛΗ ΑΝΑΚΟΙΝΩΣΕΩΝ
// =========================================

function renderAnnouncements() {
    const announcements =
        getStudentAnnouncements();

    const homeContainer = getElement(
        "studentAnnouncements"
    );

    const allContainer = getElement(
        "allStudentAnnouncements"
    );

    homeContainer.replaceChildren();
    allContainer.replaceChildren();

    if (announcements.length === 0) {
        showEmpty(
            homeContainer,
            "Δεν υπάρχουν διαθέσιμες ανακοινώσεις."
        );

        showEmpty(
            allContainer,
            "Δεν υπάρχουν δημοσιευμένες ανακοινώσεις."
        );

        return;
    }

    // Στην αρχική εμφανίζουμε έως 3.
    announcements.slice(0, 3).forEach(item => {
        homeContainer.appendChild(
            createAnnouncementCard(item)
        );
    });

    // Στην προβολή όλων εμφανίζουμε όλες.
    announcements.forEach(item => {
        allContainer.appendChild(
            createAnnouncementCard(item)
        );
    });
}


// =========================================
// 8. ΛΕΠΤΟΜΕΡΕΙΕΣ ΑΝΑΚΟΙΝΩΣΗΣ
// =========================================

function openAnnouncementDetails(id) {
    const announcement =
        getStudentAnnouncements().find(
            item => item.id === id
        );

    if (!announcement) {
        alert(
            "Η ανακοίνωση δεν είναι διαθέσιμη."
        );

        return;
    }

    const currentPage = document.querySelector(
        ".student-page.active"
    );

    previousAnnouncementPage =
        currentPage &&
        currentPage.id === "all-announcements"
            ? "all-announcements"
            : "home";

    const container = getElement(
        "announcementDetailsContent"
    );

    container.replaceChildren();

    container.appendChild(
        createElement(
            "h2",
            "detail-title",
            announcement.title
        )
    );

    const meta = createElement(
        "div",
        "detail-meta"
    );

    meta.appendChild(
        createElement(
            "span",
            "",
            formatDate(announcement.date)
        )
    );

    container.appendChild(meta);

    if (
        announcement.image &&
        announcement.image.data
    ) {
        const image = createElement(
            "img",
            "detail-image"
        );

        image.src = announcement.image.data;
        image.alt = announcement.title;

        container.appendChild(image);
    }

    if (announcement.description) {
        const description = createParagraph(
            announcement.description,
            "card-description"
        );

        container.appendChild(description);
    }

    const content = createElement(
        "div",
        "detail-content",
        announcement.content || ""
    );

    container.appendChild(content);

    if (
        announcement.file &&
        announcement.file.data
    ) {
        const attachment = createElement(
            "a",
            "detail-attachment",
            "📎 Λήψη αρχείου: " +
            announcement.file.name
        );

        attachment.href = announcement.file.data;
        attachment.download = announcement.file.name;

        container.appendChild(attachment);
    }

    showPage("announcement-details");
}


// =========================================
// 9. ΔΟΚΙΜΑΣΤΙΚΕΣ ΘΕΣΕΙΣ ΕΡΓΑΣΙΑΣ
// =========================================

// Αυτές οι θέσεις είναι ΕΝΔΕΙΚΤΙΚΕΣ.
// Δεν αποτελούν πραγματικές αγγελίες.
//
// Αργότερα οι θέσεις θα προέρχονται
// από το Admin ή από βάση δεδομένων.

const demoJobs = [
    {
        id: "job-001",
        title: "Πρακτική Άσκηση – Web Developer",
        company: "Demo Tech Company",
        location: "Αθήνα",
        department: "pliroforiki",
        type: "Πρακτική Άσκηση",
        description:
            "Συμμετοχή στην ανάπτυξη ιστοσελίδων και διαδικτυακών εφαρμογών.",
        requirements:
            "Βασικές γνώσεις HTML, CSS και JavaScript.",
        date: "2026-10-20"
    },
    {
        id: "job-002",
        title: "Πρακτική Άσκηση – IT Support",
        company: "Demo Digital Services",
        location: "Πειραιάς",
        department: "pliroforiki",
        type: "Πρακτική Άσκηση",
        description:
            "Υποστήριξη χρηστών και συντήρηση πληροφοριακών συστημάτων.",
        requirements:
            "Βασικές γνώσεις υπολογιστών και δικτύων.",
        date: "2026-10-18"
    },
    {
        id: "job-003",
        title: "Πρακτική Άσκηση – Data Analyst",
        company: "Demo Analytics",
        location: "Αθήνα",
        department: "pliroforiki",
        type: "Πρακτική Άσκηση",
        description:
            "Υποστήριξη ανάλυσης δεδομένων και δημιουργίας αναφορών.",
        requirements:
            "Εξοικείωση με Excel και βασικές γνώσεις SQL.",
        date: "2026-10-15"
    },
    {
        id: "job-004",
        title: "Πρακτική Άσκηση – Software Tester",
        company: "Demo Software Lab",
        location: "Μαρούσι",
        department: "pliroforiki",
        type: "Πρακτική Άσκηση",
        description:
            "Έλεγχος λειτουργικότητας εφαρμογών και καταγραφή σφαλμάτων.",
        requirements:
            "Προσοχή στη λεπτομέρεια και βασικές γνώσεις λογισμικού.",
        date: "2026-10-12"
    },
    {
        id: "job-005",
        title: "Πρακτική Άσκηση – Διαιτολογικό Γραφείο",
        company: "Demo Nutrition Center",
        location: "Αθήνα",
        department: "diaitologia",
        type: "Πρακτική Άσκηση",
        description:
            "Υποστήριξη διαιτολογικών υπηρεσιών.",
        requirements:
            "Φοίτηση στο Τμήμα Διαιτολογίας.",
        date: "2026-10-16"
    },
    {
        id: "job-006",
        title: "Πρακτική Άσκηση – GIS Assistant",
        company: "Demo Geo Solutions",
        location: "Αθήνα",
        department: "geografia",
        type: "Πρακτική Άσκηση",
        description:
            "Υποστήριξη χαρτογραφικών εργασιών και GIS.",
        requirements:
            "Βασική εξοικείωση με GIS.",
        date: "2026-10-14"
    },
    {
        id: "job-007",
        title: "Πρακτική Άσκηση – Business Assistant",
        company: "Demo Business Group",
        location: "Καλλιθέα",
        department: "oikonomia",
        type: "Πρακτική Άσκηση",
        description:
            "Υποστήριξη διοικητικών και οικονομικών διαδικασιών.",
        requirements:
            "Βασικές γνώσεις οικονομίας και Excel.",
        date: "2026-10-11"
    }
];

function getStudentJobs() {
    return sortNewest(
        demoJobs.filter(job => {
            return (
                job.department === "all" ||
                job.department ===
                    currentStudent.department
            );
        })
    );
}


// =========================================
// 10. ΚΑΡΤΑ ΘΕΣΗΣ ΕΡΓΑΣΙΑΣ
// =========================================

function createJobCard(job) {
    const card = createElement(
        "article",
        "job-card"
    );

    const header = createElement(
        "div",
        "job-card-header"
    );

    header.appendChild(
        createElement(
            "div",
            "company-icon",
            "💼"
        )
    );

    header.appendChild(
        createElement(
            "span",
            "job-type",
            job.type
        )
    );

    card.appendChild(header);

    card.appendChild(
        createElement(
            "h3",
            "",
            job.title
        )
    );

    card.appendChild(
        createParagraph(
            job.company,
            "job-company"
        )
    );

    card.appendChild(
        createParagraph(
            "📍 " + job.location,
            "job-location"
        )
    );

    card.appendChild(
        createParagraph(
            job.description,
            "job-description"
        )
    );

    const detailsButton = createButton(
        "Λεπτομέρειες θέσης →",
        "card-link",
        () => {
            openJobDetails(job.id);
        }
    );

    card.appendChild(detailsButton);

    return card;
}


// =========================================
// 11. ΠΡΟΒΟΛΗ ΘΕΣΕΩΝ ΕΡΓΑΣΙΑΣ
// =========================================

function renderJobs() {
    const jobs = getStudentJobs();

    const homeContainer = getElement(
        "homeJobsList"
    );

    const allContainer = getElement(
        "allJobsList"
    );

    homeContainer.replaceChildren();
    allContainer.replaceChildren();

    if (jobs.length === 0) {
        showEmpty(
            homeContainer,
            "Δεν υπάρχουν διαθέσιμες θέσεις για το τμήμα σου."
        );

        showEmpty(
            allContainer,
            "Δεν βρέθηκαν διαθέσιμες θέσεις."
        );

        return;
    }

    // Έως 3 θέσεις στην αρχική.
    jobs.slice(0, 3).forEach(job => {
        homeContainer.appendChild(
            createJobCard(job)
        );
    });

    renderAllJobs();
}


// =========================================
// 12. ΑΝΑΖΗΤΗΣΗ ΚΑΙ ΦΙΛΤΡΑ ΘΕΣΕΩΝ
// =========================================

function populateLocationFilter() {
    const select = getElement(
        "jobLocationFilter"
    );

    const selected = select.value;

    const locations = [
        ...new Set(
            getStudentJobs().map(job => job.location)
        )
    ].sort((a, b) => a.localeCompare(b, "el"));

    select.replaceChildren();

    const allOption = createElement(
        "option",
        "",
        "Όλες οι τοποθεσίες"
    );

    allOption.value = "all";

    select.appendChild(allOption);

    locations.forEach(location => {
        const option = createElement(
            "option",
            "",
            location
        );

        option.value = location;

        select.appendChild(option);
    });

    select.value = locations.includes(selected)
        ? selected
        : "all";
}

function renderAllJobs() {
    const container = getElement(
        "allJobsList"
    );

    const search = getElement(
        "jobSearch"
    ).value.trim().toLocaleLowerCase("el-GR");

    const location = getElement(
        "jobLocationFilter"
    ).value;

    const jobs = getStudentJobs().filter(job => {
        const text = (
            job.title + " " +
            job.company + " " +
            job.description
        ).toLocaleLowerCase("el-GR");

        const matchesSearch = text.includes(search);

        const matchesLocation =
            location === "all" ||
            job.location === location;

        return matchesSearch && matchesLocation;
    });

    container.replaceChildren();

    if (jobs.length === 0) {
        showEmpty(
            container,
            "Δεν βρέθηκαν θέσεις με αυτά τα κριτήρια."
        );

        return;
    }

    jobs.forEach(job => {
        container.appendChild(
            createJobCard(job)
        );
    });
}

getElement("jobSearch").addEventListener(
    "input",
    renderAllJobs
);

getElement("jobLocationFilter").addEventListener(
    "change",
    renderAllJobs
);


// =========================================
// 13. ΛΕΠΤΟΜΕΡΕΙΕΣ ΘΕΣΗΣ
// =========================================

function openJobDetails(id) {
    const job = getStudentJobs().find(
        item => item.id === id
    );

    if (!job) {
        alert("Η θέση δεν είναι διαθέσιμη.");
        return;
    }

    const currentPage = document.querySelector(
        ".student-page.active"
    );

    previousJobPage =
        currentPage && currentPage.id === "home"
            ? "home"
            : "jobs";

    const container = getElement(
        "jobDetailsContent"
    );

    container.replaceChildren();

    container.appendChild(
        createElement(
            "h2",
            "detail-title",
            job.title
        )
    );

    const meta = createElement(
        "div",
        "detail-meta"
    );

    meta.appendChild(
        createElement(
            "span",
            "",
            "🏢 " + job.company
        )
    );

    meta.appendChild(
        createElement(
            "span",
            "",
            "📍 " + job.location
        )
    );

    meta.appendChild(
        createElement(
            "span",
            "",
            formatDate(job.date)
        )
    );

    container.appendChild(meta);

    container.appendChild(
        createElement(
            "h3",
            "",
            "Περιγραφή Θέσης"
        )
    );

    container.appendChild(
        createParagraph(
            job.description,
            "card-description"
        )
    );

    container.appendChild(
        createElement(
            "h3",
            "",
            "Απαιτούμενα Προσόντα"
        )
    );

    container.appendChild(
        createParagraph(
            job.requirements,
            "card-description"
        )
    );

    const notice = createElement(
        "div",
        "application-info",
        "Η δυνατότητα εκδήλωσης ενδιαφέροντος δεν είνα ακόμα διαθέσιμη."
    );

    container.appendChild(notice);

    showPage("job-details");
}


// =========================================
// 14. Η ΑΙΤΗΣΗ ΜΟΥ
// =========================================



// Οι οθόνες πρώτης σύνδεσης και έγκρισης
// θα δημιουργηθούν σε επόμενο στάδιο.
// Εδώ εμφανίζουμε μόνο την αίτηση
// και τις αποθηκευμένες προτιμήσεις.

function getStudentApplication() {
    return readStorage(STUDENT_APPLICATIONS_KEY).find(
        item => item.studentEmail === currentStudent.email
    ) || null;
}

// ΠΡΟΒΟΛΗ ΑΙΤΗΣΗΣ ΣΤΟ ΠΡΟΦΙΛ


function renderApplicationInfo() {

    const application = getStudentApplication();

    const status =
        application?.status === "approved"
            ? "approved"
            : application?.status === "rejected"
                ? "rejected"
                : "pending";

    const labels = {
        pending: "Σε αναμονή",
        approved: "Εγκεκριμένη",
        rejected: "Απορρίφθηκε"
    };

    const statusBadge = getElement("applicationStatus");

    if (statusBadge) {
        statusBadge.textContent = labels[status];
        statusBadge.className = "status-badge " + status;
    }

    setText(
        "profileApplicationCode",
        application?.applicationCode ||
        savedDemoStudent?.applicationCode ||
        "Δεν έχει εκδοθεί ακόμη"
    );

    setText(
        "profileApplicationDate",
        application?.submittedAt
            ? formatDate(application.submittedAt)
            : "—"
    );

    if (status === "approved") {

        setText(
            "profileApplicationInfo",
            "Η αίτησή σου εγκρίθηκε. Μπορείς να προχωρήσεις στη δήλωση προτιμήσεων."
        );

    } else if (status === "rejected") {

        setText(
            "profileApplicationInfo",
            "Η αίτησή σου απορρίφθηκε. Επικοινώνησε με το Γραφείο Πρακτικής Άσκησης."
        );

    } else {

        setText(
            "profileApplicationInfo",
            "Η αίτησή σου βρίσκεται σε αναμονή έγκρισης. Μπορείς να βλέπεις τις ανακοινώσεις και τις διαθέσιμες θέσεις."
        );

    }
}

// ΠΡΟΒΟΛΗ ΠΡΟΤΙΜΗΣΕΩΝ


function renderPreferences() {

    const application = getStudentApplication();

    const approved =
        application?.status === "approved";

    const badge = getElement("preferencesStatus");

    const container = getElement("preferencesList");

    if (!container) {
        return;
    }

    container.replaceChildren();

    if (badge) {
        badge.textContent = approved
            ? "Εγκεκριμένη αίτηση"
            : "Σε αναμονή";

        badge.className =
            "status-badge " +
            (approved ? "approved" : "pending");
    }

    // Όσο η αίτηση δεν έχει εγκριθεί, δεν εμφανίζουμε προτιμήσεις.

    if (!approved) {

        setText(
            "preferencesInfo",
            "Η δήλωση προτιμήσεων δεν είναι ακόμη διαθέσιμη. Θα ενεργοποιηθεί μετά την έγκριση της αίτησής σου."
        );

        return;
    }

    // Αναζήτηση αποθηκευμένων προτιμήσεων.

    const record = readStorage(
        STUDENT_PREFERENCES_KEY
    ).find(
        item => item.studentEmail === currentStudent.email
    );

    const choices = Array.isArray(record?.jobIds)
        ? record.jobIds.slice(0, 3)
        : [];

    if (choices.length === 0) {

        setText(
            "preferencesInfo",
            "Η αίτησή σου εγκρίθηκε. Δεν έχεις δηλώσει ακόμη προτιμήσεις. Η φόρμα δήλωσης θα προστεθεί στο επόμενο στάδιο."
        );

        return;
    }

    setText(
        "preferencesInfo",
        "Οι αποθηκευμένες προτιμήσεις σου, με σειρά προτεραιότητας:"
    );

    // Εμφάνιση θέσεων με σειρά 1, 2, 3.

    choices.forEach((id, index) => {

        const job = getStudentJobs().find(
            item => item.id === id
        );

        if (!job) {
            return;
        }

        const row = createElement(
            "div",
            "preference-item"
        );

        const rank = createElement(
            "span",
            "preference-rank",
            String(index + 1)
        );

        const details = createElement("div");

        details.appendChild(
            createElement(
                "h4",
                "",
                job.title
            )
        );

        details.appendChild(
            createParagraph(
                job.company + " · " + job.location
            )
        );

        row.appendChild(rank);
        row.appendChild(details);

        container.appendChild(row);
    });
}


// =========================================
// 15. ΠΡΟΣΩΠΙΚΟΣ ΦΑΚΕΛΟΣ
// =========================================

// Προσωρινή αποθήκευση στον browser.
// Δεν είναι ασφαλής αποθήκευση
// πραγματικών προσωπικών εγγράφων.
//
// Για αυτό το demo επιτρέπουμε μόνο
// μικρά, μη ευαίσθητα δοκιμαστικά αρχεία.

const MAX_DOCUMENT_SIZE = 500 * 1024;

function getStudentDocuments() {
    return readStorage(STUDENT_DOCUMENTS_KEY)
        .filter(doc =>
            doc.studentId === currentStudent.id
        );
}

function saveStudentDocuments(documents) {
    localStorage.setItem(
        STUDENT_DOCUMENTS_KEY,
        JSON.stringify(documents)
    );
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(
                new Error("Σφάλμα ανάγνωσης αρχείου.")
            );
        };

        reader.readAsDataURL(file);
    });
}

function renderStudentDocuments() {
    const container = getElement(
        "studentDocuments"
    );

    const documents = getStudentDocuments();

    container.replaceChildren();

    if (documents.length === 0) {
        showEmpty(
            container,
            "Δεν υπάρχουν ακόμη έγγραφα στον προσωπικό φάκελο."
        );

        return;
    }

    documents.forEach(doc => {
        const row = createElement(
            "div",
            "folder-item"
        );

        const info = createElement("div");

        info.appendChild(
            createElement(
                "h4",
                "",
                doc.title
            )
        );

        info.appendChild(
            createParagraph(
                formatDate(doc.date),
                ""
            )
        );

        const actions = createElement(
            "div",
            "folder-item-actions"
        );

        const download = createElement(
            "a",
            "",
            "Λήψη"
        );

        download.href = doc.data;
        download.download = doc.fileName;

        const remove = createButton(
            "Διαγραφή",
            "",
            () => deleteStudentDocument(doc.id)
        );

        actions.append(download, remove);

        row.append(info, actions);
        container.appendChild(row);
    });
}

function deleteStudentDocument(id) {
    const confirmed = confirm(
        "Θέλεις να διαγράψεις το έγγραφο;"
    );

    if (!confirmed) {
        return;
    }

    const documents = readStorage(
        STUDENT_DOCUMENTS_KEY
    );

    const updated = documents.filter(
        doc => doc.id !== id ||
        doc.studentId !== currentStudent.id
    );

    try {
        saveStudentDocuments(updated);
        renderStudentDocuments();
    } catch (error) {
        alert(
            "Δεν ήταν δυνατή η διαγραφή του εγγράφου."
        );
    }
}

getElement("studentUploadForm")
    .addEventListener("submit", async event => {
        event.preventDefault();

        const title = getElement(
            "studentFileTitle"
        ).value.trim();

        const file = getElement(
            "studentFile"
        ).files[0];

        if (!title || !file) {
            alert(
                "Συμπλήρωσε τίτλο και επίλεξε αρχείο."
            );

            return;
        }

        const allowedExtensions =
            /\.(pdf|doc|docx|png|jpg|jpeg)$/i;

        if (!allowedExtensions.test(file.name)) {
            alert(
                "Επιτρέπονται PDF, Word και εικόνες."
            );

            return;
        }

        if (file.size > MAX_DOCUMENT_SIZE) {
            alert(
                "Για τη δοκιμαστική έκδοση, " +
                "το αρχείο πρέπει να είναι έως 500 KB."
            );

            return;
        }

        try {
            const data = await readFile(file);

            const documentItem = {
                id: createId(),
                studentId: currentStudent.id,
                title,
                fileName: file.name,
                date: new Date().toISOString(),
                data
            };

            const documents = readStorage(
                STUDENT_DOCUMENTS_KEY
            );

            documents.push(documentItem);

            saveStudentDocuments(documents);

            getElement(
                "studentUploadForm"
            ).reset();

            renderStudentDocuments();

            alert(
                "Το δοκιμαστικό έγγραφο αποθηκεύτηκε " +
                "στον browser."
            );
        } catch (error) {
            console.error(error);

            alert(
                "Δεν ήταν δυνατή η αποθήκευση. " +
                "Ίσως δεν υπάρχει αρκετός χώρος."
            );
        }
    });


// =========================================
// 16. ΑΠΟΣΥΝΔΕΣΗ
// =========================================

// Δεν υπάρχει ακόμη πραγματικό
// σύστημα σύνδεσης και συνεδρίας.
//
// Το κουμπί επιστρέφει στην αρχική
// δημόσια σελίδα, χωρίς να προσποιείται
// ότι τερμάτισε πραγματική συνεδρία.

getElement("logoutBtn")
    .addEventListener("click", () => {

        const confirmed = confirm(
            "Θέλεις να αποσυνδεθείς;"
        );

        if (!confirmed) {
            return;
        }

        sessionStorage.removeItem("hua_demo_student");

        window.location.replace("index.html");
    });

// =========================================
// 17. ΕΝΗΜΕΡΩΣΗ ΔΕΔΟΜΕΝΩΝ
// =========================================

window.addEventListener("storage", event => {

    if (event.key === ANNOUNCEMENTS_KEY) {
        renderAnnouncements();
    }

    if (
        event.key === STUDENT_APPLICATIONS_KEY ||
        event.key === STUDENT_PREFERENCES_KEY
    ) {
        renderApplicationInfo();
        renderPreferences();
    }

    if (event.key === STUDENT_DOCUMENTS_KEY) {
        renderStudentDocuments();
    }

});

// =========================================
// 18. ΑΡΧΙΚΟΠΟΙΗΣΗ
// =========================================

function initializeStudentDashboard() {

    renderStudentInfo();

    renderApplicationInfo();

    renderPreferences();

    populateLocationFilter();

    renderAnnouncements();

    renderJobs();

    renderStudentDocuments();

    history.replaceState(
        { studentPage: "home" },
        "",
        "#home"
    );

    showPage("home", false);
}

initializeStudentDashboard();
