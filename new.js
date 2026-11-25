"use strict";

/* ------------------------------------------------------------------
   DATA  – array of student objects (Name, Department, Marks)
------------------------------------------------------------------- */
const PASS_MARK = 40;

let students = [
  { name: "Devadharshini", department: "Computer Science", marks: 92 },
  { name: "Arun Kumar",    department: "Mechanical",       marks: 58 },
  { name: "Priya",         department: "Electronics",      marks: 76 },
  { name: "Karthik",       department: "Civil",            marks: 45 },
  { name: "Meena",         department: "Computer Science", marks: 88 },
  { name: "Suresh",        department: "Mechanical",       marks: 61 },
  { name: "Lakshmi",       department: "Electronics",      marks: 67 },
  { name: "Vignesh",       department: "Civil",            marks: 52 },
];

/* ------------------------------------------------------------------
   CORE LOGIC – arrow functions, higher-order functions, destructuring
------------------------------------------------------------------- */

// 2. filter() with a DEFAULT PARAMETER (limit = 60) + object DESTRUCTURING
const filterAbove = (list, limit = 60) => list.filter(({ marks }) => marks > limit);

// 3. find() – search by name (case-insensitive, partial match)
const findByName = (list, query = "") => {
  const text = query.trim().toLowerCase();
  return list.find(({ name }) => name.toLowerCase().includes(text));
};

// 4. map() – get only the names
const getNames = (list) => list.map(({ name }) => name);

// REST operator: collects any number of arguments into an array
const sumOf = (...numbers) => numbers.reduce((total, n) => total + n, 0);

// 5. reduce() – average (SPREAD operator passes the array as separate arguments)
const averageMarks = (list) =>
  list.length === 0 ? 0 : sumOf(...list.map(({ marks }) => marks)) / list.length;

// 6. reduce() – highest-scoring student
const topScorer = (list) =>
  list.reduce((best, student) => (student.marks > best.marks ? student : best));

// 7. sort() – SPREAD copies the array so the original order is not changed
const sortByMarks = (list, order = "asc") =>
  [...list].sort((a, b) => (order === "asc" ? a.marks - b.marks : b.marks - a.marks));

// 8. every() – did everybody pass?
const allPassed = (list, passMark = PASS_MARK) => list.every(({ marks }) => marks >= passMark);

// 9. some() – did anybody score above 90?
const anyAbove = (list, limit = 90) => list.some(({ marks }) => marks > limit);

// SPREAD on objects + DEFAULT values: add a student safely
const addStudent = (list, newStudent, defaults = { department: "General" }) => [
  ...list,
  { ...defaults, ...newStudent },
];

// findIndex() – find the position of a student, then remove that student
const removeStudent = (list, name) => {
  const index = list.findIndex((student) => student.name === name);
  return index === -1 ? list : [...list.slice(0, index), ...list.slice(index + 1)];
};

/* ------------------------------------------------------------------
   DOM HELPERS
------------------------------------------------------------------- */
const $ = (selector) => document.querySelector(selector);

const summaryEl   = $("#summary");
const tableBody   = $("#table-body");
const namesList   = $("#names-list");
const titleEl     = $("#result-title");
const countEl     = $("#result-count");
const messageEl   = $("#message");
const tableWrap   = document.querySelector(".table-wrap");

// Stops HTML being injected through a typed name
const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ------------------------------------------------------------------
   RENDER FUNCTIONS – template literals + ternary operator
------------------------------------------------------------------- */
const renderSummary = (list) => {
  if (list.length === 0) {
    summaryEl.innerHTML = "";
    return;
  }
  const { name, marks } = topScorer(list);          // destructuring
  const everyonePassed = allPassed(list);
  const hasTopper = anyAbove(list);

  summaryEl.innerHTML = `
    <div class="stat">
      <div class="label">Class average</div>
      <div class="value">${averageMarks(list).toFixed(1)}</div>
      <div class="note">${list.length} students</div>
    </div>
    <div class="stat">
      <div class="label">Highest score</div>
      <div class="value">${marks}</div>
      <div class="note">${escapeHtml(name)}</div>
    </div>
    <div class="stat ${everyonePassed ? "yes" : "no"}">
      <div class="label">Did everyone pass?</div>
      <div class="value">${everyonePassed ? "Yes" : "No"}</div>
      <div class="note">every() with pass mark ${PASS_MARK}</div>
    </div>
    <div class="stat ${hasTopper ? "yes" : "no"}">
      <div class="label">Anyone above 90?</div>
      <div class="value">${hasTopper ? "Yes" : "No"}</div>
      <div class="note">some() check</div>
    </div>`;
};

// highlightName is a DEFAULT PARAMETER – no highlight unless asked
const renderTable = (list, highlightName = "") => {
  tableBody.innerHTML = list.length
    ? list
        .map(({ name, department, marks }, i) => {
          const passed = marks >= PASS_MARK;
          return `
        <tr class="${name === highlightName ? "highlight" : ""}">
          <td>${i + 1}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(department)}</td>
          <td class="marks">${marks}</td>
          <td class="${passed ? "pass" : "fail"}">${passed ? "Pass" : "Fail"}</td>
          <td><button type="button" data-remove="${escapeHtml(name)}">Remove</button></td>
        </tr>`;
        })
        .join("")
    : `<tr><td colspan="6">No students to show.</td></tr>`;
};

const renderNames = (list) => {
  namesList.innerHTML = getNames(list).map((n) => `<li>${escapeHtml(n)}</li>`).join("");
};

// Shows one result view. Uses object destructuring with defaults in the parameter.
const showResult = ({ title, list, highlight = "", namesOnly = false, message = "" }) => {
  titleEl.textContent = title;
  countEl.textContent = `${list.length} ${list.length === 1 ? "student" : "students"}`;
  messageEl.hidden = !message;
  messageEl.textContent = message;
  tableWrap.hidden = namesOnly;
  namesList.hidden = !namesOnly;
  namesOnly ? renderNames(list) : renderTable(list, highlight);
};

/* ------------------------------------------------------------------
   ACTIONS – each button maps to a CALLBACK function
------------------------------------------------------------------- */
let currentAction = "all";

const actions = {
  all:     () => ({ title: "All students", list: students }),
  above60: () => ({ title: "Students who scored above 60", list: filterAbove(students) }),
  asc:     () => ({ title: "Sorted by marks (low to high)", list: sortByMarks(students, "asc") }),
  desc:    () => ({ title: "Sorted by marks (high to low)", list: sortByMarks(students, "desc") }),
  top:     () => {
    const best = topScorer(students);
    return { title: "Highest-scoring student", list: [best], highlight: best.name };
  },
  names:   () => ({ title: "Student names (map)", list: students, namesOnly: true }),
};

// Higher-order function: takes an action name, runs the matching callback
const runAction = (key) => {
  if (students.length === 0) {
    currentAction = "all";
    showResult({ title: "All students", list: [] });
    renderSummary(students);
    return;
  }
  currentAction = key;
  showResult(actions[key]());
  renderSummary(students);
  document.querySelectorAll("#actions button").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.action === key)
  );
};

/* ------------------------------------------------------------------
   EVENTS
------------------------------------------------------------------- */
$("#actions").addEventListener("click", ({ target }) => {
  if (target.dataset.action) runAction(target.dataset.action);
});

// 3. Find student by name
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = $("#search-input").value;
  const found = findByName(students, query);

  document.querySelectorAll("#actions button").forEach((btn) => btn.classList.remove("active"));

  if (!query.trim()) {
    showResult({ title: "Search", list: [], message: "Type a name to search." });
  } else if (found) {
    const position = sortByMarks(students, "desc").findIndex((s) => s.name === found.name) + 1;
    showResult({
      title: `Found: ${found.name}`,
      list: [found],
      highlight: found.name,
      message: `${found.name} is ranked ${position} of ${students.length} by marks.`,
    });
  } else {
    showResult({ title: "Search", list: [], message: `No student found for "${query.trim()}".` });
  }
});

// Add a new student
$("#add-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#new-name").value.trim();
  const department = $("#new-dept").value.trim();
  const marks = Number($("#new-marks").value);

  if (!name || Number.isNaN(marks) || marks < 0 || marks > 100) return;

  // department falls back to the default ("General") when left empty
  students = addStudent(students, { name, marks, ...(department && { department }) });
  event.target.reset();
  runAction(currentAction);
});

// Remove a student (uses findIndex inside removeStudent)
tableBody.addEventListener("click", ({ target }) => {
  const { remove } = target.dataset;     // destructuring
  if (!remove) return;
  students = removeStudent(students, remove);
  runAction(currentAction);
});

// First load
runAction("all");
