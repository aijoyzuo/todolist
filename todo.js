console.log("Token in localStorage:", localStorage.getItem("token"));

document.addEventListener("DOMContentLoaded", function () {
    init(); //初始化
    updateNickname(); //連結暱稱
    bindLogoutEvent(); //發送登出請求
});

//顯示登入暱稱
function updateNickname() {
    const nickname = localStorage.getItem("nickname") || "使用者"; // 如果沒有暱稱，顯示「使用者」
    document.getElementById("nicknameDisplay").textContent = `${nickname}的待辦`;
}

//初始化函式
function init() {
    bindTabEvents(); // 綁定篩選分類按鈕事件
    bindInputEvents(); // 綁定輸入框與新增按鈕
    fetchTodos(); // 從 API 取得待辦事項
}

//取得 token，並確認沒有多的Bearer開頭
function getToken() {
    let token = localStorage.getItem("token");
    if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
        localStorage.setItem("token", token); // 更新 localStorage
    }
    return token;
}

let todos = [];
const todoList = document.querySelector(".list");
const inputField = document.querySelector(".input input");
const addButton = document.querySelector(".btn_add");

//綁定篩選分類按鈕事件
function bindTabEvents() {
    const tabItems = document.querySelectorAll(".tab li");
    tabItems.forEach(tab => {
        tab.addEventListener("click", function () {
            tabItems.forEach(item => item.classList.remove("active"));
            this.classList.add("active");
            filterTodos(this.textContent);
        });
    });
}

//綁定輸入框與新增按鈕事件(按enter可以輸入)
function bindInputEvents() {
    addButton.addEventListener("click", addTodo);
    inputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addTodo();
        }
    });
}

//取得待辦事項
function fetchTodos() {
    const token = getToken();
    if (!token) {
        console.error("沒抓到Token");
        return;
    }

    axios.get("https://todoo.5xcamp.us/todos", {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",//要有文件格式
        }
    })
        .then(response => {
            console.log("取得待辦事項成功:", response.data);
            todos = response.data.todos;
            renderTodos();
        })
        .catch(error => {
            console.error("API 回應錯誤:", error.response?.status, error.response?.data);
        });
}

//渲染待辦事項
function renderTodos() {
    todoList.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <label class="checkbox">
                <input type="checkbox" ${todo.completed_at ? "checked" : ""} data-index="${index}"/>
                <span>${todo.content}</span>
            </label>
            <a href="#" class="delete" data-index="${index}"></a>
        `;
        todoList.appendChild(li);
    });

    updateFooter();
    bindListEvents();

    //確保畫面不會因為新增待辦事項而變回「全部」
    const activeTab = document.querySelector(".tab li.active").textContent;
    filterTodos(activeTab);
}

// 綁定待辦事項內部事件
function bindListEvents() {
    document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        checkbox.addEventListener("change", toggleTodo);
    });

    document.querySelectorAll(".delete").forEach(deleteBtn => {
        deleteBtn.addEventListener("click", deleteTodo);
    });

    document.querySelector(".list_footer a").addEventListener("click", clearCompleted);
}

// 新增待辦事項
function addTodo() {
    const taskText = inputField.value.trim();
    if (!taskText) {
        alert("請輸入待辦事項！");
        return;
    }

    const token = getToken();
    if (!token) {
        console.error("沒抓到token，無法新增待辦");
        return;
    }

    axios.post("https://todoo.5xcamp.us/todos",
        { todo: { content: taskText } },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        }
    )
        .then(response => {
            console.log("新增待辦事項成功:", response.data);
            todos.push(response.data);
            const activeTab = document.querySelector(".tab li.active").textContent; //取得當前篩選條件

            //設定如果在「已完成」的狀態輸入資料，會跳回「全部」
            if (activeTab === "已完成") {
                document.querySelectorAll(".tab li").forEach(tab => tab.classList.remove("active"));
                document.querySelector(".tab li:first-child").classList.add("active"); //在tab裡面的第一個li加上active
                filterTodos("全部"); 
            } else {
                filterTodos(activeTab); 
            }

            renderTodos(); 
            inputField.value = ""; 
        })
        .catch(error => {
            console.error("新增待辦事項失敗:", error.response?.status, error.response?.data);
            alert("新增失敗，請檢查輸入內容");
        });
}

// 更新待辦事項狀態
function toggleTodo(event) {
    const index = event.target.getAttribute("data-index");
    const todo = todos[index];
    todo.completed_at = event.target.checked ? new Date().toISOString() : null;

    const token = getToken();
    axios.put(`https://todoo.5xcamp.us/todos/${todo.id}`,
        { todo: { completed_at: todo.completed_at } },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        }
    )
        .then(() => {
            renderTodos();
            filterTodos(document.querySelector(".tab li.active").textContent);
        })
        .catch(error => console.error("更新狀態失敗:", error.response?.status, error.response?.data));
}

//刪除單筆待辦事項
function deleteTodo(event) {
    event.preventDefault();
    const token = getToken();
    const index = event.target.getAttribute("data-index");
    const todo = todos[index];

    if (!confirm(`確定要刪除 "${todo.content}" 嗎？`)) return;

    axios.delete(`https://todoo.5xcamp.us/todos/${todo.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    })
        .then(() => {
            todos.splice(index, 1);
            renderTodos();
        })
        .catch(error => console.error("刪除待辦事項失敗:", error.response?.status, error.response?.data));
}

//清除已完成項目
function clearCompleted(event) {
    event.preventDefault();
    const token = getToken();

    const completedTodos = todos.filter(todo => todo.completed_at);
    const deleteRequests = completedTodos.map(todo =>
        axios.delete(`https://todoo.5xcamp.us/todos/${todo.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
    );

    Promise.all(deleteRequests)
        .then(() => {
            todos = todos.filter(todo => !todo.completed_at);
            renderTodos();
        })
        .catch(error => console.error("清除已完成項目失敗:", error.response?.status, error.response?.data));
}

//頁面篩選
function filterTodos(filter) {
    const items = todoList.querySelectorAll("li");
    const deleteAllButton = document.querySelector(".deleteall");

    items.forEach(item => {
        const checkbox = item.querySelector("input[type='checkbox']");

        if (filter === "全部") {
            item.style.display = "flex";
            deleteAllButton.style.display = "inline-block";
        } else if (filter === "待完成") {
            item.style.display = checkbox.checked ? "none" : "flex";
            deleteAllButton.style.display = "none";
        } else if (filter === "已完成") {
            item.style.display = checkbox.checked ? "flex" : "none";
            deleteAllButton.style.display = "inline-block";
        }
    });
}


function updateFooter() {
    let uncheckedCount = todos.filter(todo => !todo.completed_at).length;
    document.querySelector(".completeitem").textContent = `${uncheckedCount} 個待完成項目`;
}

// 綁定「登出」按鈕事件，按下登出按鈕後，會呼叫登出函式
function bindLogoutEvent() {
    const logoutButton = document.querySelector(".logout");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", function (event) {
        event.preventDefault(); 

        logoutUser(); 
    });
}

// 執行登出 API 的函式，若沒有 token 就直接導回登入頁
async function logoutUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("你尚未登入！");
        window.location.href = "signIn.html"; // 若沒有 `token` 直接導回登入頁
        return;
    }

    try {
        const res = await axios.delete("https://todoo.5xcamp.us/users/sign_out", {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("登出成功", res.data);
        alert("登出成功！");

        localStorage.removeItem("token");
        localStorage.removeItem("nickname");

        window.location.href = "signIn.html";

    } catch (error) {
        console.error("登出失敗", error);
        alert("登出失敗，請稍後再試！");
    }
}
