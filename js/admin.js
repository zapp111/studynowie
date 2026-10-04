const defaultChecklists = {

    Mathematics: [
        "Watch Lecture",
        "Read NCERT",
        "Solve NCERT Exercise",
        "Solve Practice Questions"
    ],

    Science: [
        "Watch Lecture",
        "Read NCERT",
        "Solve NCERT Exercise",
        "Solve Practice Questions"
    ],

    English: [
        "Read Chapter",
        "Learn Difficult Words",
        "Solve NCERT Questions",
        "Solve Practice Questions"
    ],

    Hindi: [
        "Read Chapter",
        "Understand Meaning",
        "Learn Important Words",
        "Solve NCERT Questions"
    ],

    "Social Science": [
        "Watch Lecture",
        "Read NCERT",
        "Make Short Notes",
        "Solve Practice Questions"
    ]

};

const defaultResources = {

    Mathematics: [
        "YouTube Lecture",
        "NCERT PDF",
        "Notes",
        "Extra Questions"
    ],

    Science: [
        "YouTube Lecture",
        "NCERT PDF",
        "Notes",
        "Extra Questions"
    ],

    English: [
        "YouTube Lecture",
        "NCERT PDF",
        "Notes",
        "Extra Questions"
    ],

    Hindi: [
        "YouTube Lecture",
        "NCERT PDF",
        "Notes",
        "Extra Questions"
    ],

    "Social Science": [
        "YouTube Lecture",
        "NCERT PDF",
        "Notes",
        "Extra Questions"
    ]

};

export function initAdmin() {

    const openBuilder =
        document.getElementById("open-session-builder");

    const adminHome =
        document.getElementById("admin-home");

    const sessionBuilder =
        document.getElementById("session-builder");

    const addSubjectBtn =
        document.getElementById("add-subject-btn");

    const subjectsContainer =
        document.getElementById("subjects-container");

    const saveSessionBtn =
        document.getElementById("save-session-btn");

    const sessionNumberInput =
        document.getElementById("builder-session-number");

    const dateInput =
        document.getElementById("builder-date");

    if (!openBuilder) return;

    openBuilder.addEventListener("click", () => {

        adminHome.style.display = "none";

        sessionBuilder.style.display = "block";

    });

    addSubjectBtn.addEventListener("click", () => {

        const card = document.createElement("div");

        card.className = "subject-builder-card";

        card.innerHTML = `

            <div class="subject-builder-header">

                <h3>Subject</h3>

                <button
                    class="delete-subject-btn"
                    type="button"
                >
                    🗑
                </button>

            </div>

            <select class="subject-select">

                <option value="">Select Subject</option>

                <option>Mathematics</option>

                <option>Science</option>

                <option>English</option>

                <option>Hindi</option>

                <option>Social Science</option>

            </select>

            <input
                class="chapter-input"
                type="text"
                placeholder="Chapter Name"
            >

            <textarea
                class="focus-input"
                placeholder="Focus Topic"
            ></textarea>

            <h4>Checklist</h4>

            <div class="checklist-container"></div>

            <button
                class="add-checklist-btn"
                type="button"
            >
                + Add Checklist Item
            </button>

            <h4>Resources</h4>

            <div class="resources-container"></div>

        `;

        subjectsContainer.appendChild(card);

        card
        .querySelector(".delete-subject-btn")
        .addEventListener("click", () => {

            card.remove();

        });

        const select =
            card.querySelector(".subject-select");

        const checklistContainer =
            card.querySelector(".checklist-container");

        const resourcesContainer =
            card.querySelector(".resources-container");

        select.addEventListener("change", () => {

            checklistContainer.innerHTML = "";
            resourcesContainer.innerHTML = "";

            // ---------- Checklist ----------

            const checklist =
                defaultChecklists[select.value] || [];

            checklist.forEach(item => {

                const input = document.createElement("input");

                input.type = "text";

                input.value = item;

                checklistContainer.appendChild(input);

            });

        // ---------- Resources ----------

        const resources =
            defaultResources[select.value] || [];

        resources.forEach(label => {

            const row =
                document.createElement("div");

            row.className = "resource-row";

            row.innerHTML = `

                <input
                    class="resource-label"
                    value="${label}"
                >

                <input
                    class="resource-url"
                    placeholder="Paste URL"
                >

            `;

            resourcesContainer.appendChild(row);

        });

    });
})}