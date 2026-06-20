// 상태 관리를 위한 변수
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingId = null;

// DOM 요소
const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// 날짜를 바탕으로 D-Day 계산
function calculateDDay(dueDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'D-Day', isPassed: false };
    if (diffDays > 0) return { text: `D-${diffDays}`, isPassed: false };
    return { text: `D+${Math.abs(diffDays)}`, isPassed: true };
}

// 우선순위 텍스트 변환
function getPriorityLabel(priority) {
    if (priority === 'high') return '상';
    if (priority === 'medium') return '중';
    if (priority === 'low') return '하';
    return '';
}

// 상태 텍스트 변환
function getStatusLabel(status) {
    if (status === 'not_started') return '시작 전';
    if (status === 'in_progress') return '진행 중';
    if (status === 'completed') return '완료';
    return '';
}

// 과제 목록 화면에 렌더링
function renderTasks() {
    taskList.innerHTML = '';
    
    // 마감일 임박 순, 그 다음은 추가된 순 등으로 정렬할 수 있지만 
    // 여기서는 마감일 오름차순으로 정렬
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (sortedTasks.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        
        sortedTasks.forEach(task => {
            const card = document.createElement('div');
            const dDayInfo = calculateDDay(task.dueDate);
            
            card.className = `task-card ${task.status === 'completed' ? 'completed-card' : ''}`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="d-day ${dDayInfo.isPassed ? 'passed' : ''}">${dDayInfo.text}</span>
                    <span class="badge priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                </div>
                <h3 class="task-title">${task.taskName}</h3>
                <p class="course-name">${task.courseName}</p>
                <p class="due-date">마감일: ${task.dueDate}</p>
                <div class="status-badge status-${task.status}">${getStatusLabel(task.status)}</div>
                <div class="card-actions">
                    <button class="btn-action btn-edit" onclick="editTask(${task.id})">수정</button>
                    <button class="btn-action btn-delete" onclick="deleteTask(${task.id})">삭제</button>
                </div>
            `;
            taskList.appendChild(card);
        });
    }
}

// 폼 제출 이벤트 핸들러 (추가 및 수정)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const courseName = document.getElementById('courseName').value.trim();
    const taskName = document.getElementById('taskName').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('status').value;

    // 빈칸(공백만 입력) 방지 안내 메시지
    if (!courseName || !taskName || !dueDate) {
        alert('수업명, 과제명, 마감일을 정확히 입력해 주세요! (공백만 입력할 수 없습니다)');
        return;
    }

    if (editingId) {
        // 기존 과제 수정
        const taskIndex = tasks.findIndex(t => t.id === editingId);
        if (taskIndex > -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], courseName, taskName, dueDate, priority, status };
        }
        resetForm();
    } else {
        // 새 과제 추가
        const newTask = {
            id: Date.now(),
            courseName, 
            taskName, 
            dueDate, 
            priority, 
            status
        };
        tasks.push(newTask);
    }
    
    saveTasks();
    renderTasks();
    
    if (!editingId) {
        form.reset();
    }
});

// 수정 모드 활성화
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    document.getElementById('courseName').value = task.courseName;
    document.getElementById('taskName').value = task.taskName;
    document.getElementById('dueDate').value = task.dueDate;
    document.getElementById('priority').value = task.priority;
    document.getElementById('status').value = task.status;
    
    editingId = id;
    
    // UI 업데이트
    formTitle.textContent = '과제 수정';
    submitBtn.textContent = '수정 완료';
    cancelEditBtn.style.display = 'block';
    
    // 폼으로 스크롤 부드럽게 이동
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// 수정 취소
cancelEditBtn.addEventListener('click', () => {
    resetForm();
});

// 폼 초기화 (수정 모드 해제)
function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = '과제 등록';
    submitBtn.textContent = '과제 저장하기';
    cancelEditBtn.style.display = 'none';
}

// 과제 삭제
function deleteTask(id) {
    if (confirm('이 과제를 정말 삭제하시겠습니까?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        
        // 만약 현재 수정 중인 과제를 삭제했다면 폼 초기화
        if (editingId === id) {
            resetForm();
        }
    }
}

// LocalStorage에 데이터 저장
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 초기 실행
renderTasks();
