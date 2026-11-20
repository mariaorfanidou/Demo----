
/* ========================================
   ADMIN PANEL - ΧΑΡΟΚΟΠΕΙΟ
======================================== */

// ========================================
// STORAGE
// ========================================

const STORAGE_KEY = "hua_admin_announcements_v1";
const DOCUMENTS_KEY = "hua_admin_documents_v1";

function loadData(key) {
    try {
        const saved = JSON.parse(
            localStorage.getItem(key) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Σφάλμα ανάγνωσης:", error);
        return [];
    }
}

let announcements = loadData(STORAGE_KEY);
let documents = loadData(DOCUMENTS_KEY);

function saveAnnouncements() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(announcements)
    );
}

function saveDocuments() {
    localStorage.setItem(
        DOCUMENTS_KEY,
        JSON.stringify(documents)
    );
}


// ========================================
// HELPERS
// ========================================

function element(tag, className = "", text) {
    const el = document.createElement(tag);

    if (className) {
        el.className = className;
    }

    if (text !== undefined) {
        el.textContent = text;
    }

    return el;
}

function formatDate(date) {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    return value.toLocaleDateString("el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function createId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString() +
        Math.random().toString(36).slice(2)
    );
}

function sortByDate(items) {
    return [...items].sort((a, b) =>
        String(b.date || "").localeCompare(
            String(a.date || "")
        )
    );
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = () => reject(
            new Error("Αποτυχία ανάγνωσης αρχείου.")
        );

        reader.readAsDataURL(file);
    });
}


// ========================================
// FILE VALIDATION
// ========================================

const allowedExtensions =
    /\.(pdf|doc|docx|png|jpg|jpeg)$/i;

const imageExtensions =
    /\.(png|jpg|jpeg|webp)$/i;

const MAX_FILE_SIZE = 1024 * 1024;

function validateFile(file, imageOnly = false) {
    if (!file) {
        return true;
    }

    const valid = imageOnly
        ? imageExtensions.test(file.name)
        : allowedExtensions.test(file.name);

    if (!valid) {
        alert(
            imageOnly
                ? "Επιτρέπονται εικόνες JPG, PNG και WEBP."
                : "Επιτρέπονται PDF, Word και εικόνες."
        );

        return false;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert(
            "Το αρχείο πρέπει να είναι μέχρι 1 MB."
        );

        return false;
    }

    return true;
}

async function prepareFile(file) {
    return {
        name: file.name,
        type: file.type,
        data: await readFileAsDataURL(file)
    };
}


// ========================================
// IMAGE PREVIEW
// ========================================

function showImagePreview(previewId, imageData) {
    const preview = document.getElementById(previewId);

    if (!preview) {
        return;
    }

    if (imageData && imageData.data) {
        preview.src = imageData.data;
        preview.hidden = false;
    } else {
        preview.removeAttribute("src");
        preview.hidden = true;
    }
}

function setupImageInput(inputId, previewId) {
    const input = document.getElementById(inputId);

    if (!input) {
        return;
    }

    input.addEventListener("change", async () => {
        const file = input.files[0];

        if (!file) {
            showImagePreview(previewId, null);
            return;
        }

        if (!validateFile(file, true)) {
            input.value = "";
            showImagePreview(previewId, null);
            return;
        }

        try {
            const imageData = await prepareFile(file);

            // Αποφυγή παλιάς προεπισκόπησης,
            // αν ο χρήστης άλλαξε αρχείο ενδιάμεσα.
            if (input.files[0] !== file) {
                return;
            }

            showImagePreview(
                previewId,
                imageData
            );
        } catch (error) {
            alert(
                "Δεν ήταν δυνατή η ανάγνωση της εικόνας."
            );
        }
    });
}

setupImageInput(
    "announcementImage",
    "announcementImagePreview"
);

setupImageInput(
    "documentImage",
    "documentImagePreview"
);


// ========================================
// NAVIGATION
// ========================================

const pageTitles = {
    dashboard: "Πίνακας Ελέγχου",
    announcements: "Ανακοινώσεις",
    files: "Έγγραφα",
    settings: "Ρυθμίσεις"
};

function showPage(pageId) {
    if (!pageTitles[pageId]) {
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle(
            "active",
            page.id === pageId
        );
    });

    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.classList.toggle(
            "active",
            btn.dataset.page === pageId
        );
    });

    document.getElementById("pageTitle").textContent =
        pageTitles[pageId];

    refreshUI();
}

document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
        showPage(btn.dataset.page);
    });
});


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {
    document.getElementById("totalCount").textContent =
        announcements.length;

    document.getElementById("publishedCount").textContent =
        announcements.filter(
            item => item.status === "published"
        ).length;

    document.getElementById("draftCount").textContent =
        announcements.filter(
            item => item.status !== "published"
        ).length;

    document.getElementById("fileCount").textContent =
        documents.length;
}


// ========================================
// ANNOUNCEMENT ROW
// ========================================

function createAnnouncementRow(item, editable = true) {
    const row = element(
        "div",
        "announcement-row"
    );

    const info = element("div");

    // Εικόνα ανακοίνωσης
    if (item.image && item.image.data) {
        const image = element(
            "img",
            "announcement-list-image"
        );

        image.src = item.image.data;
        image.alt = item.title;

        info.appendChild(image);
    }

    info.appendChild(
        element("h3", "", item.title)
    );

    info.appendChild(
        element(
            "p",
            "",
            formatDate(item.date)
        )
    );

    const badge = element(
        "span",
        "badge " + (
            item.status === "published"
                ? "published"
                : "draft"
        ),
        item.status === "published"
            ? "Δημοσιευμένη"
            : "Πρόχειρη"
    );

    info.appendChild(badge);

    if (item.file && item.file.data) {
        const fileLink = element(
            "a",
            "",
            "📎 " + item.file.name
        );

        fileLink.href = item.file.data;
        fileLink.download = item.file.name;

        info.appendChild(
            element("p", "", "")
        );

        info.appendChild(fileLink);
    }

    row.appendChild(info);

    if (editable) {
        const actions = element(
            "div",
            "row-actions"
        );

        const edit = element(
            "button",
            "edit-btn",
            "Επεξεργασία"
        );

        edit.type = "button";

        edit.addEventListener("click", () => {
            editAnnouncement(item.id);
        });

        const remove = element(
            "button",
            "danger-btn",
            "Διαγραφή"
        );

        remove.type = "button";

        remove.addEventListener("click", () => {
            deleteAnnouncement(item.id);
        });

        actions.append(edit, remove);
        row.appendChild(actions);
    }

    return row;
}


// ========================================
// RECENT ANNOUNCEMENTS
// ========================================

function renderRecent() {
    const container = document.getElementById(
        "recentAnnouncements"
    );

    container.replaceChildren();

    const recent = sortByDate(announcements)
        .slice(0, 5);

    if (recent.length === 0) {
        container.appendChild(
            element(
                "p",
                "empty-state",
                "Δεν υπάρχουν ανακοινώσεις."
            )
        );

        return;
    }

    recent.forEach(item => {
        container.appendChild(
            createAnnouncementRow(item, false)
        );
    });
}


// ========================================
// ALL ANNOUNCEMENTS
// ========================================

function renderAnnouncements() {
    const container = document.getElementById(
        "announcementsTable"
    );

    const query = document.getElementById(
        "adminSearch"
    ).value.trim().toLocaleLowerCase("el-GR");

    container.replaceChildren();

    const filtered = sortByDate(announcements)
        .filter(item => {
            const searchable = (
                String(item.title || "") + " " +
                String(item.description || "") + " " +
                String(item.content || "")
            ).toLocaleLowerCase("el-GR");

            return searchable.includes(query);
        });

    if (filtered.length === 0) {
        container.appendChild(
            element(
                "p",
                "empty-state",
                "Δεν βρέθηκαν ανακοινώσεις."
            )
        );

        return;
    }

    filtered.forEach(item => {
        container.appendChild(
            createAnnouncementRow(item)
        );
    });
}

document.getElementById("adminSearch")
    .addEventListener(
        "input",
        renderAnnouncements
    );


// ========================================
// ANNOUNCEMENT EDITOR
// ========================================

const announcementForm = document.getElementById(
    "announcementForm"
);

const editorPanel = document.getElementById(
    "editorPanel"
);

function openEditor() {
    announcementForm.reset();

    document.getElementById(
        "announcementId"
    ).value = "";

    document.getElementById(
        "editorTitle"
    ).textContent = "Νέα Ανακοίνωση";

    document.getElementById(
        "attachedFileInfo"
    ).textContent = "";

    document.getElementById(
        "existingAnnouncementImage"
    ).textContent = "";

    showImagePreview(
        "announcementImagePreview",
        null
    );

    editorPanel.hidden = false;

    showPage("announcements");

    editorPanel.scrollIntoView({
        behavior: "smooth"
    });
}

document.getElementById("quickAdd")
    .addEventListener("click", openEditor);

document.getElementById("newAnnouncement")
    .addEventListener("click", openEditor);

document.getElementById("cancelEdit")
    .addEventListener("click", () => {
        editorPanel.hidden = true;
        announcementForm.reset();

        showImagePreview(
            "announcementImagePreview",
            null
        );
    });


// ========================================
// EDIT ANNOUNCEMENT
// ========================================

function editAnnouncement(id) {
    const item = announcements.find(
        a => a.id === id
    );

    if (!item) {
        return;
    }

    showPage("announcements");

    announcementForm.reset();

    document.getElementById(
        "announcementId"
    ).value = item.id;

    document.getElementById(
        "announcementTitle"
    ).value = item.title || "";

    document.getElementById(
        "announcementDescription"
    ).value = item.description || "";

    document.getElementById(
        "announcementContent"
    ).value = item.content || "";

    document.getElementById(
        "announcementStatus"
    ).value = item.status || "draft";

    document.getElementById(
        "attachedFileInfo"
    ).textContent = item.file
        ? "Υπάρχον αρχείο: " + item.file.name
        : "Δεν υπάρχει συνημμένο αρχείο.";

    document.getElementById(
        "existingAnnouncementImage"
    ).textContent = item.image
        ? "Υπάρχουσα εικόνα: " + item.image.name
        : "Δεν υπάρχει εικόνα.";

    showImagePreview(
        "announcementImagePreview",
        item.image
    );

    document.getElementById(
        "editorTitle"
    ).textContent = "Επεξεργασία Ανακοίνωσης";

    editorPanel.hidden = false;

    editorPanel.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// SAVE ANNOUNCEMENT
// ========================================

announcementForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const id = document.getElementById(
            "announcementId"
        ).value;

        const existing = announcements.find(
            a => a.id === id
        );

        const title = document.getElementById(
            "announcementTitle"
        ).value.trim();

        const description = document.getElementById(
            "announcementDescription"
        ).value.trim();

        const content = document.getElementById(
            "announcementContent"
        ).value.trim();

        const status = document.getElementById(
            "announcementStatus"
        ).value;

        const selectedFile = document.getElementById(
            "announcementFile"
        ).files[0];

        const selectedImage = document.getElementById(
            "announcementImage"
        ).files[0];

        if (!title || !description || !content) {
            alert(
                "Συμπλήρωσε όλα τα υποχρεωτικά πεδία."
            );

            return;
        }

        if (!validateFile(selectedFile)) {
            return;
        }

        if (!validateFile(selectedImage, true)) {
            return;
        }

        let fileData = existing
            ? existing.file || null
            : null;

        let imageData = existing
            ? existing.image || null
            : null;

        try {
            if (selectedFile) {
                fileData = await prepareFile(
                    selectedFile
                );
            }

            if (selectedImage) {
                imageData = await prepareFile(
                    selectedImage
                );
            }
        } catch (error) {
            alert(
                "Δεν ήταν δυνατή η ανάγνωση αρχείου."
            );

            return;
        }

        const item = {
            id: existing
                ? existing.id
                : createId(),

            title,
            description,
            content,
            status,

            date: existing
                ? existing.date
                : new Date().toISOString(),

            file: fileData,
            image: imageData
        };

        const previous = [...announcements];

        if (existing) {
            announcements = announcements.map(
                a => a.id === id ? item : a
            );
        } else {
            announcements.push(item);
        }

        try {
            saveAnnouncements();
        } catch (error) {
            announcements = previous;

            alert(
                "Δεν υπάρχει αρκετός χώρος αποθήκευσης."
            );

            return;
        }

        editorPanel.hidden = true;
        announcementForm.reset();

        showImagePreview(
            "announcementImagePreview",
            null
        );

        refreshUI();

        alert(
            "Η ανακοίνωση αποθηκεύτηκε!"
        );
    }
);


// ========================================
// DELETE ANNOUNCEMENT
// ========================================

function deleteAnnouncement(id) {
    if (!confirm(
        "Θέλεις να διαγράψεις την ανακοίνωση;"
    )) {
        return;
    }

    const previous = [...announcements];

    announcements = announcements.filter(
        a => a.id !== id
    );

    try {
        saveAnnouncements();

        // Κλείσιμο φόρμας αν επεξεργαζόμαστε
        // την ανακοίνωση που διαγράφηκε.
        if (
            document.getElementById(
                "announcementId"
            ).value === id
        ) {
            editorPanel.hidden = true;
            announcementForm.reset();
        }

        refreshUI();
    } catch (error) {
        announcements = previous;

        alert(
            "Η διαγραφή δεν αποθηκεύτηκε."
        );
    }
}


// ========================================
// DOCUMENT CATEGORIES
// ========================================

const categoryNames = {
    diadikasia: "Διαδικασία συμμετοχής",
    dikaiologitika: "Δικαιολογητικά",
    faq: "Συχνές ερωτήσεις"
};

const departmentNames = {
    all: "Όλα τα τμήματα",
    pliroforiki: "Πληροφορικής και Τηλεματικής",
    diaitologia: "Διαιτολογίας και Διατροφής",
    geografia: "Γεωγραφίας",
    oikonomia: "Οικονομίας και Βιώσιμης Ανάπτυξης"
};


// ========================================
// DOCUMENT LIST
// ========================================

function renderFiles() {
    const container = document.getElementById(
        "filesList"
    );

    const filter = document.getElementById(
        "documentFilter"
    ).value;

    container.replaceChildren();

    const filtered = sortByDate(documents)
        .filter(doc =>
            filter === "all" ||
            doc.category === filter
        );

    if (filtered.length === 0) {
        container.appendChild(
            element(
                "p",
                "empty-state",
                "Δεν υπάρχουν έγγραφα σε αυτή την κατηγορία."
            )
        );

        return;
    }

    filtered.forEach(doc => {
        const row = element(
            "div",
            "file-row"
        );

        const info = element("div");

        // Εικόνα εγγράφου
        if (doc.image && doc.image.data) {
            const image = element(
                "img",
                "document-list-image"
            );

            image.src = doc.image.data;
            image.alt = doc.title;

            info.appendChild(image);
        }

        info.appendChild(
            element("h3", "", doc.title)
        );

        info.appendChild(
            element(
                "p",
                "muted",
                categoryNames[doc.category] ||
                doc.category
            )
        );

        info.appendChild(
            element(
                "p",
                "muted",
                departmentNames[doc.department] ||
                "Όλα τα τμήματα"
            )
        );

        if (doc.description) {
            info.appendChild(
                element(
                    "p",
                    "muted",
                    doc.description
                )
            );
        }

        const actions = element(
            "div",
            "row-actions"
        );

        // Download εγγράφου
        if (doc.file && doc.file.data) {
            const link = element(
                "a",
                "",
                "📎 " + doc.file.name
            );

            link.href = doc.file.data;
            link.download = doc.file.name;

            actions.appendChild(link);
        }

        // Edit
        const edit = element(
            "button",
            "edit-btn",
            "Επεξεργασία"
        );

        edit.type = "button";

        edit.addEventListener("click", () => {
            editDocument(doc.id);
        });

        // Delete
        const remove = element(
            "button",
            "danger-btn",
            "Διαγραφή"
        );

        remove.type = "button";

        remove.addEventListener("click", () => {
            deleteDocument(doc.id);
        });

        actions.append(edit, remove);

        row.append(info, actions);

        container.appendChild(row);
    });
}

document.getElementById("documentFilter")
    .addEventListener(
        "change",
        renderFiles
    );


// ========================================
// DOCUMENT EDITOR
// ========================================

const documentForm = document.getElementById(
    "documentForm"
);

const documentEditor = document.getElementById(
    "documentEditor"
);

function openDocumentEditor() {
    documentForm.reset();

    document.getElementById(
        "documentId"
    ).value = "";

    document.getElementById(
        "documentEditorTitle"
    ).textContent = "Νέο έγγραφο";

    document.getElementById(
        "existingDocumentFile"
    ).textContent = "";

    document.getElementById(
        "existingDocumentImage"
    ).textContent = "";

    showImagePreview(
        "documentImagePreview",
        null
    );

    documentEditor.hidden = false;

    showPage("files");

    documentEditor.scrollIntoView({
        behavior: "smooth"
    });
}

document.getElementById("newDocument")
    .addEventListener(
        "click",
        openDocumentEditor
    );

document.getElementById("cancelDocument")
    .addEventListener("click", () => {
        documentEditor.hidden = true;
        documentForm.reset();

        showImagePreview(
            "documentImagePreview",
            null
        );
    });


// ========================================
// EDIT DOCUMENT
// ========================================

function editDocument(id) {
    const doc = documents.find(
        d => d.id === id
    );

    if (!doc) {
        return;
    }

    showPage("files");

    documentForm.reset();

    document.getElementById(
        "documentId"
    ).value = doc.id;

    document.getElementById(
        "documentTitle"
    ).value = doc.title || "";

    document.getElementById(
        "documentCategory"
    ).value = doc.category || "diadikasia";

    document.getElementById(
        "documentDepartment"
    ).value = doc.department || "all";

    document.getElementById(
        "documentDescription"
    ).value = doc.description || "";

    document.getElementById(
        "existingDocumentFile"
    ).textContent = doc.file
        ? "Υπάρχον αρχείο: " + doc.file.name
        : "Δεν υπάρχει συνημμένο αρχείο.";

    document.getElementById(
        "existingDocumentImage"
    ).textContent = doc.image
        ? "Υπάρχουσα εικόνα: " + doc.image.name
        : "Δεν υπάρχει εικόνα.";

    showImagePreview(
        "documentImagePreview",
        doc.image
    );

    document.getElementById(
        "documentEditorTitle"
    ).textContent = "Επεξεργασία εγγράφου";

    documentEditor.hidden = false;

    documentEditor.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// SAVE DOCUMENT
// ========================================

documentForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const id = document.getElementById(
            "documentId"
        ).value;

        const existing = documents.find(
            d => d.id === id
        );

        const title = document.getElementById(
            "documentTitle"
        ).value.trim();

        const category = document.getElementById(
            "documentCategory"
        ).value;

        const department = document.getElementById(
            "documentDepartment"
        ).value;

        const description = document.getElementById(
            "documentDescription"
        ).value.trim();

        const selectedFile = document.getElementById(
            "documentFile"
        ).files[0];

        const selectedImage = document.getElementById(
            "documentImage"
        ).files[0];

        if (!title) {
            alert(
                "Συμπλήρωσε τον τίτλο εγγράφου."
            );

            return;
        }

        if (!existing && !selectedFile) {
            alert(
                "Επίλεξε ένα αρχείο για το έγγραφο."
            );

            return;
        }

        if (!validateFile(selectedFile)) {
            return;
        }

        if (!validateFile(selectedImage, true)) {
            return;
        }

        let fileData = existing
            ? existing.file || null
            : null;

        let imageData = existing
            ? existing.image || null
            : null;

        try {
            if (selectedFile) {
                fileData = await prepareFile(
                    selectedFile
                );
            }

            if (selectedImage) {
                imageData = await prepareFile(
                    selectedImage
                );
            }
        } catch (error) {
            alert(
                "Δεν ήταν δυνατή η ανάγνωση αρχείου."
            );

            return;
        }

        const item = {
            id: existing
                ? existing.id
                : createId(),

            title,
            category,
            department,
            description,

            date: existing
                ? existing.date
                : new Date().toISOString(),

            file: fileData,
            image: imageData
        };

        const previous = [...documents];

        if (existing) {
            documents = documents.map(
                d => d.id === id ? item : d
            );
        } else {
            documents.push(item);
        }

        try {
            saveDocuments();
        } catch (error) {
            documents = previous;

            alert(
                "Δεν υπάρχει αρκετός χώρος αποθήκευσης."
            );

            return;
        }

        documentEditor.hidden = true;
        documentForm.reset();

        showImagePreview(
            "documentImagePreview",
            null
        );

        refreshUI();

        alert(
            "Το έγγραφο αποθηκεύτηκε!"
        );
    }
);


// ========================================
// DELETE DOCUMENT
// ========================================

function deleteDocument(id) {
    if (!confirm(
        "Θέλεις να διαγράψεις οριστικά το έγγραφο;"
    )) {
        return;
    }

    const previous = [...documents];

    documents = documents.filter(
        d => d.id !== id
    );

    try {
        saveDocuments();

        if (
            document.getElementById(
                "documentId"
            ).value === id
        ) {
            documentEditor.hidden = true;
            documentForm.reset();
        }

        refreshUI();
    } catch (error) {
        documents = previous;

        alert(
            "Η διαγραφή δεν αποθηκεύτηκε."
        );
    }
}


// ========================================
// REFRESH ALL
// ========================================

function refreshUI() {
    updateDashboard();
    renderRecent();
    renderAnnouncements();
    renderFiles();
}


// ========================================
// INITIALIZATION
// ========================================

refreshUI();
