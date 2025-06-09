const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const deadlineInput = document.getElementById('deadline-input');
const taskList = document.getElementById('task-list');
const alertAudio = document.getElementById('alert-audio');
let lastNotification = null; // Track the last notification

let tasks = [];
let editIndex = null;

// Request notification permission on load
if ('Notification' in window) {
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    const now = new Date();
    tasks.forEach((task, idx) => {
        let className = 'task';
        if (task.completed) {
            className += ' completed';
        }
        // Only check for overdue if not completed
        if (!task.completed && new Date(task.deadline) < now) {
            className += ' overdue';
            // Show notification and play sound if not already notified
            if (!task.notified && 'Notification' in window && Notification.permission === 'granted') {
                lastNotification = new Notification('Task Overdue!', {
                    body: `"${task.text}" is overdue!`,
                    icon: 'icon-192.png'
                });
                if (alertAudio) {
                    alertAudio.currentTime = 0;
                    alertAudio.play().catch(() => {});
                }
                task.notified = true;
            }
        }
        const li = document.createElement('li');
        li.className = className;

        // Tick button
        const tickBtn = document.createElement('button');
        tickBtn.className = 'tick-btn' + (task.completed ? ' done' : '');
        tickBtn.innerHTML = task.completed ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-regular fa-circle"></i>';
        tickBtn.title = task.completed ? 'Mark as not done' : 'Mark as done';
        tickBtn.onclick = () => toggleDone(idx);

        if (editIndex === idx) {
            // Edit mode
            const infoDiv = document.createElement('div');
            infoDiv.className = 'info';
            const editText = document.createElement('input');
            editText.type = 'text';
            editText.value = task.text;
            editText.id = 'edit-text';
            const editDeadline = document.createElement('input');
            editDeadline.type = 'datetime-local';
            editDeadline.value = task.deadline;
            editDeadline.id = 'edit-deadline';
            infoDiv.appendChild(editText);
            infoDiv.appendChild(editDeadline);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
            saveBtn.onclick = () => saveEdit(idx);
            const cancelBtn = document.createElement('button');
            cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel';
            cancelBtn.onclick = () => { editIndex = null; renderTasks(); };
            actionsDiv.appendChild(saveBtn);
            actionsDiv.appendChild(cancelBtn);

            li.appendChild(tickBtn);
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
        } else {
            // View mode
            const infoDiv = document.createElement('div');
            infoDiv.className = 'info';
            const textSpan = document.createElement('span');
            textSpan.textContent = task.text;
            const deadlineSpan = document.createElement('span');
            deadlineSpan.style.fontSize = '0.92em';
            deadlineSpan.style.color = '#888';
            deadlineSpan.textContent = 'Due: ' + new Date(task.deadline).toLocaleString();
            infoDiv.appendChild(textSpan);
            infoDiv.appendChild(deadlineSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
            editBtn.onclick = () => { editIndex = idx; renderTasks(); };
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
            deleteBtn.onclick = () => deleteTask(idx);
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(tickBtn);
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
        }
        taskList.appendChild(li);
    });
}

function addTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const deadline = deadlineInput.value;
    if (!text || !deadline) return;
    tasks.push({ text, deadline, completed: false, notified: false });
    taskInput.value = '';
    deadlineInput.value = '';
    renderTasks();
}

function deleteTask(idx) {
    // Stop audio and close notification if playing
    if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
    }
    if (lastNotification) {
        lastNotification.close();
        lastNotification = null;
    }
    tasks.splice(idx, 1);
    editIndex = null;
    renderTasks();
}

function saveEdit(idx) {
    const newText = document.getElementById('edit-text').value.trim();
    const newDeadline = document.getElementById('edit-deadline').value;
    if (!newText || !newDeadline) return;
    tasks[idx].text = newText;
    tasks[idx].deadline = newDeadline;
    tasks[idx].notified = false; // reset notification if edited
    editIndex = null;
    renderTasks();
}

function toggleDone(idx) {
    tasks[idx].completed = !tasks[idx].completed;
    // Stop audio and close notification if playing
    if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
    }
    if (lastNotification) {
        lastNotification.close();
        lastNotification = null;
    }
    renderTasks();
}

// Check for overdue tasks every 30 seconds
setInterval(renderTasks, 30000);

taskForm.addEventListener('submit', addTask);
renderTasks(); 