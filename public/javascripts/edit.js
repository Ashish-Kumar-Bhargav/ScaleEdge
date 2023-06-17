
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebarBtn");
const body = document.querySelector("body"),
    modeToggle = body.querySelector(".mode-toggle");
sidebarBtn.onclick = function () {
    sidebar.classList.toggle("active");
    if (sidebar.classList.contains("active")) {
        sidebarBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else
        sidebarBtn.classList.replace("bx-menu-alt-right", "bx-menu");
}

document.getElementById("submit-btn").addEventListener("click", function (event) {
event.preventDefault(); // Prevent form submission

// Get form values
var parentCategorySelect = document.getElementById("parent-category-select");
var parentCategoryInput = document.getElementById("parent-category-input");
var categoryNameInput = document.getElementById("category-name-input");

// Validate parent category select
if (parentCategorySelect.value === "Choose Category") {
    alert("Please select a parent category");
    return;
}

// Validate parent category input
if (parentCategoryInput.value === "") {
    alert("Please enter a parent category");
    return;
}

// Validate category name input
if (categoryNameInput.value === "") {
    alert("Please enter a category name");
    return;
}

// If all validations pass, submit the form
document.getElementById("category-form").submit();
});
