
// Δοκιμαστικές ανακοινώσεις.

const announcements = [
    {
        date: "2026-10-20",
        title: "Έναρξη αιτήσεων Πρακτικής Άσκησης",
        description:
            "Ενημέρωση για τη διαδικασία υποβολής αιτήσεων πρακτικής άσκησης.",
        content:
            "Οι ενδιαφερόμενοι φοιτητές μπορούν να ενημερώνονται από το Γραφείο Πρακτικής Άσκησης για τις διαδικασίες συμμετοχής."
    },
    {
        date: "2026-10-15",
        title: "Διαθέσιμες θέσεις Πρακτικής Άσκησης",
        description:
            "Πληροφορίες σχετικά με τις διαθέσιμες ευκαιρίες πρακτικής άσκησης.",
        content:
            "Οι φοιτητές μπορούν να επικοινωνούν με το Γραφείο Πρακτικής για πληροφορίες σχετικά με τους φορείς υποδοχής."
    },
    {
        date: "2026-10-10",
        title: "Οδηγίες για συμμετέχοντες φοιτητές",
        description:
            "Χρήσιμες οδηγίες για τη συμμετοχή στο πρόγραμμα πρακτικής άσκησης.",
        content:
            "Παρακαλούνται οι ενδιαφερόμενοι να ενημερώνονται για τα απαραίτητα δικαιολογητικά και τις σχετικές διαδικασίες."
    }
];

// Στοιχεία σελίδας

const announcementList =
    document.getElementById("announcementList");

const searchInput =
    document.getElementById("searchInput");

const emptyMessage =
    document.getElementById("emptyMessage");

// Ασφαλής δημιουργία καρτών με textContent

function createAnnouncementCard(item) {
    const card = document.createElement("article");
    card.className = "announcement-card";

    if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.title;
        image.className = "announcement-image";
        card.appendChild(image);
    }
    const cardContent =
    document.createElement("div");
    cardContent.className = "announcement-content"
    const date = document.createElement("span");
    date.className = "announcement-date";

    date.textContent = new Date(
        item.date + "T12:00:00"
    ).toLocaleDateString("el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description;

    const details = document.createElement("details");
    details.style.marginTop = "12px";

    const summary = document.createElement("summary");
    summary.className = "read-more";
    summary.textContent = "Διαβάστε περισσότερα";

    const content = document.createElement("p");
    content.style.marginTop = "12px";
    content.textContent = item.content;

    details.append(summary, content);

    cardContent.append(date, title, description, details);
    card.appendChild(cardContent)

    return card;
}

function renderAnnouncements(query = "") {
    announcementList.replaceChildren();

    const normalizedQuery =
        query.toLocaleLowerCase("el-GR").trim();

    const filtered = announcements
        .filter(item => {
            const searchableText =
                `${item.title} ${item.description} ${item.content}`
                    .toLocaleLowerCase("el-GR");

            return searchableText.includes(normalizedQuery);
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    filtered.forEach(item => {
        announcementList.appendChild(
            createAnnouncementCard(item)
        );
    });

    emptyMessage.hidden = filtered.length !== 0;
}

searchInput.addEventListener("input", event => {
    renderAnnouncements(event.target.value);
});

renderAnnouncements();

// Mobile navigation

const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("active");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );
});

navbar.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navbar.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// Login modal

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function openLoginModal() {
    loginModal.hidden = false;
    loginMessage.textContent = "";
    document.getElementById("username").focus();
}

function closeLoginModal() {
    loginModal.hidden = true;
    loginForm.reset();
    loginBtn.focus();
}

loginBtn.addEventListener("click", openLoginModal);
closeLogin.addEventListener("click", closeLoginModal);

loginModal.addEventListener("click", event => {
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !loginModal.hidden) {
        closeLoginModal();
    }
});

// Ενδεικτική φόρμα: δεν πραγματοποιεί σύνδεση.
// Δεν αποθηκεύει ούτε αποστέλλει κωδικούς.


loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("username")
        .value.trim().toLowerCase();

    const password = document.getElementById("password").value;

    const applicationCode = document
        .getElementById("applicationCode").value.trim();

    const match = email.match(/^(it|gs|ds|hs)\d+@hua\.gr$/);

    if (!match || password !== "123") {
        loginMessage.textContent =
            "Λανθασμένο email ή κωδικός. Δοκίμασε έναν " +
            "από τους λογαριασμούς τεστ με κωδικό 123.";

        loginMessage.style.color = "#b42336";
        return;
    }

    const departments = {
        it: "pliroforiki",
        gs: "diaitologia",
        ds: "geografia",
        hs: "oikonomia"
    };

    const demoStudents = {
        "it123@hua.gr": {
        firstName: "Μαρία",
        lastName: "Παπαδοπούλου"
    },
        "gs123@hua.gr": {
        firstName: "Ελένη",
        lastName: "Γεωργίου"
    },
        "ds123@hua.gr": {
        firstName: "Νίκος",
        lastName: "Δημητρίου"
    },
        "hs123@hua.gr": {
        firstName: "Άννα",
        lastName: "Κωνσταντίνου"
    }
};

    const demoProfile = demoStudents[email] || {
        firstName: "Δοκιμαστικός",
        lastName: "Φοιτητής"
    };

    const student = {
        email: email,
        department: departments[match[1]],
        studentId: email.split("@")[0],
        firstName: demoProfile.firstName,
        lastName: demoProfile.lastName,
        applicationCode: applicationCode
    };
    try {
        sessionStorage.setItem(
            "hua_demo_student",
            JSON.stringify(student)
        );

        window.location.href = "studentdashboard.html";
    } catch (error) {
        console.error(error);
        loginMessage.textContent =
            "Σφάλμα σύνδεσης. Δοκίμασε με Live Server.";
        loginMessage.style.color = "#b42336";
    }
});


// Footer year

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


