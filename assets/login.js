// login.js
(function () {
  // 1. 账户数据（可抽离到配置文件）
  const userAccounts = [
    { username: "admin", password: "123456", type: "超级管理员" },
    { username: "1", password: "1", type: "超级管理员" },
    { username: "editor", password: "editor123", type: "内容编辑" },
    { username: "viewer", password: "viewer123", type: "只读查看" },
    { username: "operator", password: "op123456", type: "运维人员" },
  ];

  // 2. 登录成功对外暴露的接口
  window.loginSuccess = function (userInfo) {
    console.log("登录成功，账户信息：", userInfo);
    return userInfo;
  };

  // 3. 初始化登录弹窗（显示）
  function initLoginModal() {
    const mask = document.getElementById("login-mask");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const tipText = document.getElementById("login-tip");
    const loginBtn = document.getElementById("login-btn");

    // 显示登录弹窗
    mask.classList.remove("hidden");
    // 阻止页面滚动
    document.body.style.overflow = "hidden";

    // 绑定登录事件
    bindLoginEvent(usernameInput, passwordInput, tipText, mask, loginBtn);
  }

  // 4. 登录验证逻辑
  function bindLoginEvent(
    usernameInput,
    passwordInput,
    tipText,
    mask,
    loginBtn,
  ) {
    // 登录验证核心方法
    const validateLogin = () => {
      const inputUsername = usernameInput.value.trim();
      const inputPassword = passwordInput.value.trim();

      // 清空提示
      tipText.innerText = "";
      tipText.className = "";

      // 空值验证
      if (!inputUsername) {
        tipText.innerText = "请输入用户名";
        tipText.className = "error";
        usernameInput.focus();
        return;
      }
      if (!inputPassword) {
        tipText.innerText = "请输入密码";
        tipText.className = "error";
        passwordInput.focus();
        return;
      }

      // 匹配账户信息
      const matchedUser = userAccounts.find(
        (user) =>
          user.username === inputUsername && user.password === inputPassword,
      );

      if (matchedUser) {
        // 登录成功
        const successText = `${matchedUser.username} 登录成功，以${matchedUser.type}权限进入...`;
        tipText.innerText = successText;
        tipText.className = "success";

        // 执行对外接口
        window.loginSuccess({
          username: matchedUser.username,
          type: matchedUser.type,
        });

        // 延迟关闭弹窗
        setTimeout(() => {
          mask.classList.add("hidden");
          document.body.style.overflow = ""; // 恢复页面滚动
          // 清空输入框
          usernameInput.value = "";
          passwordInput.value = "";
        }, 166);
      } else {
        // 验证失败
        tipText.innerText = "用户名或密码错误，请重新输入";
        tipText.className = "error";
        passwordInput.value = "";
        passwordInput.focus();
      }
    };

    // 绑定按钮点击事件
    loginBtn.addEventListener("click", validateLogin);

    // 回车触发登录
    [usernameInput, passwordInput].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") validateLogin();
      });
    });
  }

  initLoginModal();
})();
