document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".btn_login");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailHelp = document.getElementById("emailHelp");
    const passwordHelp = document.getElementById("passwordHelp");

    loginButton.addEventListener("click", async function (event) {
        event.preventDefault(); // 防止表單提交

        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 檢查 Email 欄位
        if (email === "") {
            emailHelp.style.display = "block";
            isValid = false;
        } else {
            emailHelp.style.display = "none";
        }

        // 檢查密碼欄位
        if (password === "") {
            passwordHelp.style.display = "block";
            isValid = false;
        } else {
            passwordHelp.style.display = "none";
        }

        // 如果有欄位沒填寫，顯示 Alert 並停止執行 API
        if (!isValid) {
            alert("請填寫所有欄位！");
            return;
        }

        // API 串接
        try {
            const res = await axios.post("https://todoo.5xcamp.us/users/sign_in", {
                user: { email, password }
            });

            // 登入成功
            console.log("登入成功", res.data);
            alert("登入成功！");

            // 取得 Token，並儲存到 localStorage
            let token = res.headers.authorization;
            if (token.startsWith("bearer ")) {
                token = token.split(" ")[1];
            }
            localStorage.setItem("token", token);
            console.log("token", token)

            // 從 `localStorage` 讀取 `nickname`
            const nickname = localStorage.getItem("nickname") || "使用者";
            console.log("使用者暱稱:", nickname);

            // 跳轉到 To-Do List 頁面
            window.location.href = "todolist.html";

        } catch (error) {
            // 登入失敗
            console.error("登入失敗", error);
            alert("登入失敗，請確認 Email 或密碼是否正確");
        }
    });
});
