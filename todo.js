document.addEventListener("DOMContentLoaded", function () {
    const tabItems = document.querySelectorAll(".tab li");  // 選取篩選按鈕
    const todoList = document.querySelector(".list");  // 選取待辦事項清單

    tabItems.forEach(tab => {
        tab.addEventListener("click", function () {
            tabItems.forEach(item => item.classList.remove("active"));
            this.classList.add("active");

            const filter = this.textContent; // 取得點擊的篩選條件
            filterTodos(filter);
        });
    });

    function filterTodos(filter) {
        const items = todoList.querySelectorAll("li");

        items.forEach(item => {
            const checkbox = item.querySelector("input[type='checkbox']");

            if (filter === "全部") {
                item.style.display = "flex";
            } else if (filter === "待完成") {
                item.style.display = checkbox.checked ? "none" : "flex";  // ?的格式為 "符合者":"未符合者"
            } else if (filter === "已完成") {
                item.style.display = checkbox.checked ? "flex" : "none";
            }
        });
    }
});

let todos = []; // 儲存所有待辦事項的陣列
const todoList = document.querySelector(".list");
const inputField = document.querySelector(".input input");
const addButton = document.querySelector(".btn_add");

// 新增待辦事項
addButton.addEventListener("click", function () {
    const taskText = inputField.value.trim();
    if (taskText === "") {
        alert("請輸入待辦事項！");
        return;
    }

    const newTodo = { text: taskText, completed: false }; // 創建待辦物件
    todos.push(newTodo);
    updateTodoList();
    inputField.value = "";
});

// 更新畫面
function updateTodoList() {
    todoList.innerHTML = "";

    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <label class="checkbox">
                <input type="checkbox" ${todo.completed ? "checked" : ""} data-index="${index}"/>
                <span>${todo.text}</span>
            </label>
            <a href="#" class="delete" data-index="${index}"></a>
        `;
        todoList.appendChild(li);
    });

    //  計算未完成項目數量
    let uncheckedCount = document.querySelectorAll("input[type='checkbox']:not(:checked)").length;
    document.querySelector(".completeitem").textContent = `${uncheckedCount} 個待完成項目`;

    //  讓 `completed` 狀態在 `checkbox` 變化時正確更新
    document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            const index = this.getAttribute("data-index");
            todos[index].completed = this.checked; //  確保 `todos` 陣列內的 `completed` 會變化
            updateTodoList();
        });
    });

    // 清除已完成項目
    document.querySelector(".list_footer a").addEventListener("click", function (event) {
        event.preventDefault();
        todos = todos.filter(todo => !todo.completed);

        updateTodoList();
    });


    // 刪除
    document.querySelectorAll(".delete").forEach(deleteBtn => {
        deleteBtn.addEventListener("click", function (event) {
            event.preventDefault();
            const index = this.getAttribute("data-index");
            todos.splice(index, 1); // 從陣列中刪除1筆
            updateTodoList(); // 重新渲染畫面
        });
    });
}


