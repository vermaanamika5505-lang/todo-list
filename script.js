let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];

let currentFilter = "all";

const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskCategory = document.getElementById("taskCategory");

const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const allCount = document.getElementById("allCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const sideAll = document.getElementById("sideAll");
const sidePending = document.getElementById("sidePending");
const sideCompleted = document.getElementById("sideCompleted");

const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const sortSelect = document.getElementById("sortSelect");
const themeBtn = document.getElementById("themeBtn");


/* ================= DATE ================= */

function showCurrentDate() {

    const today = new Date();

    const options = {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    };

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-GB", options);
}

showCurrentDate();


/* ================= SAVE ================= */

function saveTasks() {

    localStorage.setItem(
        "myTasks",
        JSON.stringify(tasks)
    );
}


/* ================= ADD TASK ================= */

function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task first.");
        return;
    }

    const newTask = {

        id: Date.now(),

        title: title,

        date: taskDate.value,

        time: taskTime.value,

        category: taskCategory.value,

        completed: false,

        createdAt: new Date().toISOString()

    };

    tasks.push(newTask);

    saveTasks();

    clearInputs();

    renderTasks();

}


addBtn.addEventListener("click", addTask);


/* Press Enter to add */

taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});


/* ================= CLEAR INPUTS ================= */

function clearInputs() {

    taskInput.value = "";
    taskDate.value = "";
    taskTime.value = "";
    taskCategory.value = "Personal";

    taskInput.focus();
}


/* ================= RENDER ================= */

function renderTasks() {

    let visibleTasks = [...tasks];

    /* Filter */

    if (currentFilter === "pending") {

        visibleTasks = visibleTasks.filter(
            task => !task.completed
        );

    }

    if (currentFilter === "completed") {

        visibleTasks = visibleTasks.filter(
            task => task.completed
        );

    }


    /* Sort */

    const sortType = sortSelect.value;

    if (sortType === "az") {

        visibleTasks.sort((a, b) =>
            a.title.localeCompare(b.title)
        );

    } else if (sortType === "oldest") {

        visibleTasks.sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

    } else if (sortType === "completed") {

        visibleTasks.sort((a, b) =>
            Number(b.completed) - Number(a.completed)
        );

    } else {

        visibleTasks.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

    }


    taskList.innerHTML = "";


    if (visibleTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty">

                <i class="fa-regular fa-clipboard"></i>

                <h3>No tasks here</h3>

                <p>Add something to your list and get started.</p>

            </div>
        `;

        updateCounts();

        return;
    }


    visibleTasks.forEach(task => {

        const card = document.createElement("div");

        card.className =
            `task-card ${task.completed ? "completed" : ""}`;

        card.style.setProperty(
            "--task-color",
            getTaskColor(task.category)
        );


        const dateText = formatTaskDate(task.date);


        card.innerHTML = `

            <input
                type="checkbox"
                class="check-task"
                ${task.completed ? "checked" : ""}
            >

            <div class="task-info">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                <div class="task-details">

                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${dateText}
                    </span>

                    ${
                        task.time
                        ?
                        `
                        <span>
                            <i class="fa-regular fa-clock"></i>
                            ${task.time}
                        </span>
                        `
                        :
                        ""
                    }

                    <span class="category ${task.category}">
                        ${task.category}
                    </span>

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="edit-btn"
                    title="Edit task"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    class="delete-btn"
                    title="Delete task"
                >
                    <i class="fa-regular fa-trash-can"></i>
                </button>

            </div>
        `;


        /* Checkbox */

        const checkbox =
            card.querySelector(".check-task");

        checkbox.addEventListener("change", () => {

            toggleTask(task.id);

        });


        /* Edit */

        card.querySelector(".edit-btn")
            .addEventListener("click", () => {

                editTask(task.id);

            });


        /* Delete */

        card.querySelector(".delete-btn")
            .addEventListener("click", () => {

                deleteTask(task.id);

            });


        taskList.appendChild(card);

    });


    updateCounts();
}


/* ================= COLORS ================= */

function getTaskColor(category) {

    const colors = {

        Study: "#e754c7",

        College: "#4b82e8",

        Health: "#49bd5b",

        Personal: "#e8bf32"

    };

    return colors[category] || "#6365e9";
}


/* ================= DATE FORMAT ================= */

function formatTaskDate(date) {

    if (!date) {
        return "No date";
    }

    const today = new Date();
    const taskDate = new Date(date + "T00:00:00");

    const todayString =
        today.toISOString().split("T")[0];

    if (date === todayString) {
        return "Today";
    }

    const tomorrow = new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    const tomorrowString =
        tomorrow.toISOString().split("T")[0];

    if (date === tomorrowString) {
        return "Tomorrow";
    }

    const yesterday = new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    const yesterdayString =
        yesterday.toISOString().split("T")[0];

    if (date === yesterdayString) {
        return "Yesterday";
    }

    return taskDate.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


/* ================= COMPLETE TASK ================= */

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;

    });

    saveTasks();

    renderTasks();
}


/* ================= DELETE ================= */

function deleteTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }

    const confirmDelete =
        confirm(`Delete "${task.title}"?`);

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveTasks();

    renderTasks();
}


/* ================= EDIT ================= */

function editTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }

    const newTitle =
        prompt("Edit your task:", task.title);

    if (newTitle === null) {
        return;
    }

    const cleanTitle = newTitle.trim();

    if (cleanTitle === "") {
        alert("Task cannot be empty.");
        return;
    }

    task.title = cleanTitle;

    saveTasks();

    renderTasks();
}


/* ================= COUNTS ================= */

function updateCounts() {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending =
        total - completed;


    allCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;


    sideAll.textContent = total;
    sidePending.textContent = pending;
    sideCompleted.textContent = completed;


    /* Progress */

    let percentage = 0;

    if (total > 0) {
        percentage =
            Math.round((completed / total) * 100);
    }

    progressPercent.textContent =
        `${percentage}%`;

    progressText.textContent =
        `${completed} of ${total} tasks`;

    progressFill.style.width =
        `${percentage}%`;

    document.querySelector(".circle-progress")
        .style.setProperty(
            "--progress",
            `${percentage}%`
        );
}


/* ================= FILTERS ================= */

document.querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener("click", () => {

            currentFilter =
                button.dataset.filter;

            document.querySelectorAll(".filter")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            updateQuickFilters();

            renderTasks();

        });

    });


/* Sidebar filters */

document.querySelectorAll(".quick-filter")
    .forEach(button => {

        button.addEventListener("click", () => {

            currentFilter =
                button.dataset.filter;

            document.querySelectorAll(".filter")
                .forEach(btn => {

                    btn.classList.toggle(
                        "active",
                        btn.dataset.filter === currentFilter
                    );

                });

            updateQuickFilters();

            renderTasks();

        });

    });


function updateQuickFilters() {

    document.querySelectorAll(".quick-filter")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === currentFilter
            );

        });

}


/* ================= SORT ================= */

sortSelect.addEventListener(
    "change",
    renderTasks
);


/* ================= CLEAR ALL ================= */

document.getElementById("clearBtn")
    .addEventListener("click", () => {

        if (tasks.length === 0) {
            return;
        }

        const answer =
            confirm("Are you sure you want to clear all tasks?");

        if (!answer) {
            return;
        }

        tasks = [];

        saveTasks();

        renderTasks();

    });


/* ================= DARK MODE ================= */

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "darkMode",
        isDark
    );

    themeBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';

});


/* Load saved theme */

if (
    localStorage.getItem("darkMode") === "true"
) {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

}


/* ================= SECURITY ================= */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ================= START ================= */

renderTasks();