
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".btn_login");
    const emailInput = document.getElementById("email");
    const nicknameInput = document.getElementById("nickname");
    const passwordInput = document.getElementById("password");
    const passwordCheckInput = document.getElementById("passwordCheck");
    const emailHelp = document.getElementById("emailHelp");
    const nickNameHelp = document.getElementById("nickNameHelp");
    const passwordHelp = document.getElementById("passwordHelp");
    const passwordCheckHelp = document.getElementById("passwordCheckHelp");

    loginButton.addEventListener("click", async function (event) {
        event.preventDefault(); // 防止表單提交

        let isValid = true;
        const email = emailInput.value.trim();
        const nickname = nicknameInput.value.trim();
        const password = passwordInput.value.trim();
        const passwordCheck = passwordCheckInput.value.trim();

        // 檢查 Email 欄位
        if (email === "") {
            emailHelp.style.display = "block";
            isValid = false;
        } else {
            emailHelp.style.display = "none";
        }

        // 檢查暱稱欄位
        if (nickname === "") {
            nicknameHelp.style.display = "block";
            isValid = false;
        } else {
            nicknameHelp.style.display = "none";
        }

        // 檢查密碼欄位
        if (password === "") {
            passwordHelp.style.display = "block";
            isValid = false;
        } else {
            passwordHelp.style.display = "none";
        }

        // 檢查重複密碼欄位
        if (passwordCheck === "") {
            passwordCheckHelp.style.display = "block";
            isValid = false;
        } else if (password !== passwordCheck) {
            passwordCheckHelp.textContent = "密碼不一致";
            passwordCheckHelp.style.display = "block";
            isValid = false;
        } else {
            passwordCheckHelp.style.display = "none";
        }

        // 如果有欄位沒填寫，顯示 Alert 並停止執行 API
        if (!isValid) {
            alert("請填寫所有欄位或確認密碼一致！");
            return;
        }

        // API 串接
       
        try {
            const res = await axios.post("https://todoo.5xcamp.us/users", {
                user: { email, nickname, password }
            }, {
                headers: {
                "Content-Type": "application/json"
            }});

            // 註冊成功
            console.log("註冊成功", res.data);
            alert("註冊成功，請前往登入");

            // 取得 Token，並儲存到 localStorage
            const token = res.headers.authorization;
            localStorage.setItem("token", token);

            // 跳轉到 index 頁面
            window.location.href = "signIn.html";

        } catch (error) {
            // 註冊失敗
            console.error("註冊失敗", error);
            alert("註冊失敗：" + (error.response?.data?.error?.join("\n") || "請稍後再試"));
        }
    });
});
