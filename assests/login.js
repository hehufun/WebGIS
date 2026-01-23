// loginModal.js
(function () {
  // ===================== 1. 集中管理账户信息 =====================
  // 可扩展多个账户，每个账户包含用户名、密码、类型
  const userAccounts = [
    { username: "admin", password: "123456", type: "超级管理员" },
    { username: "1", password: "1", type: "超级管理员" },
    { username: "editor", password: "editor123", type: "内容编辑" },
    { username: "viewer", password: "viewer123", type: "只读查看" },
    { username: "operator", password: "op123456", type: "运维人员" },
    // 可继续添加更多账户
  ];

  // ===================== 2. 样式配置项（可自定义） =====================
  const styleConfig = {
    maskBg: "rgba(0, 0, 0, 0.5)", // 遮罩层背景
    modalWidth: "320px", // 登录窗宽度
    modalBg: "#fff", // 登录窗背景
    btnPrimaryColor: "#0078ff", // 登录按钮主色
    errorColor: "#ff4444", // 错误提示颜色
    successColor: "#00cc66", // 成功提示颜色（新增）
  };

  // ===================== 3. 登录成功对外暴露的接口（核心） =====================
  // 登录成功后会执行此方法，返回当前登录账户的完整信息
  window.loginSuccess = function (userInfo) {
    /**
     * @param {Object} userInfo - 登录成功的账户信息
     * @property {string} username - 用户名
     * @property {string} type - 账户类型
     * 可在外部页面重写此方法，获取账户类型
     */
    console.log("登录成功，账户信息：", userInfo);
    return userInfo; // 返回账户类型等信息
  };

  // ===================== 4. 创建登录窗口DOM =====================
  function createLoginElements() {
    // 遮罩层（拦截所有操作，不影响页面加载）
    const mask = document.createElement("div");
    mask.id = "login-mask";
    Object.assign(mask.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      background: styleConfig.maskBg,
      zIndex: "9998",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backdropFilter: "blur(2px)",
      pointerEvents: "auto", // 拦截点击，验证失败时无法操作页面
    });

    // 登录窗口容器
    const modal = document.createElement("div");
    modal.id = "login-modal";
    Object.assign(modal.style, {
      width: styleConfig.modalWidth,
      background: styleConfig.modalBg,
      borderRadius: "8px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      position: "relative",
      zIndex: "9999",
    });

    // 登录标题
    const title = document.createElement("h3");
    title.innerText = "系统登录";
    Object.assign(title.style, {
      margin: "0 0 20px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
      textAlign: "center",
    });

    // 用户名输入框
    const usernameWrap = document.createElement("div");
    usernameWrap.style.marginBottom = "16px";
    const usernameLabel = document.createElement("label");
    usernameLabel.innerText = "用户名：";
    usernameLabel.style.display = "block";
    usernameLabel.style.marginBottom = "6px";
    usernameLabel.style.fontSize = "14px";
    usernameLabel.style.color = "#666";
    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "请输入用户名";
    Object.assign(usernameInput.style, {
      width: "100%",
      padding: "10px 12px",
      boxSizing: "border-box",
      border: "1px solid #e5e5e5",
      borderRadius: "4px",
      fontSize: "14px",
      outline: "none",
    });
    usernameInput.onfocus = () =>
      (usernameInput.style.borderColor = styleConfig.btnPrimaryColor);
    usernameInput.onblur = () => (usernameInput.style.borderColor = "#e5e5e5");
    usernameWrap.appendChild(usernameLabel);
    usernameWrap.appendChild(usernameInput);

    // 密码输入框
    const passwordWrap = document.createElement("div");
    passwordWrap.style.marginBottom = "20px";
    const passwordLabel = document.createElement("label");
    passwordLabel.innerText = "密码：";
    passwordLabel.style.display = "block";
    passwordLabel.style.marginBottom = "6px";
    passwordLabel.style.fontSize = "14px";
    passwordLabel.style.color = "#666";
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "请输入密码";
    Object.assign(passwordInput.style, {
      width: "100%",
      padding: "10px 12px",
      boxSizing: "border-box",
      border: "1px solid #e5e5e5",
      borderRadius: "4px",
      fontSize: "14px",
      outline: "none",
    });
    passwordInput.onfocus = () =>
      (passwordInput.style.borderColor = styleConfig.btnPrimaryColor);
    passwordInput.onblur = () => (passwordInput.style.borderColor = "#e5e5e5");
    passwordWrap.appendChild(passwordLabel);
    passwordWrap.appendChild(passwordInput);

    // 提示信息（错误/成功）
    const tipText = document.createElement("div");
    tipText.id = "login-tip";
    tipText.innerText = "";
    Object.assign(tipText.style, {
      fontSize: "12px",
      textAlign: "center",
      marginBottom: "16px",
      minHeight: "16px",
    });

    // 登录按钮
    const loginBtn = document.createElement("button");
    loginBtn.innerText = "登录";
    Object.assign(loginBtn.style, {
      width: "100%",
      padding: "10px",
      background: styleConfig.btnPrimaryColor,
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background 0.2s",
    });
    loginBtn.onmouseover = () => (loginBtn.style.background = "#0066cc");
    loginBtn.onmouseout = () =>
      (loginBtn.style.background = styleConfig.btnPrimaryColor);

    // 组装登录窗口
    modal.append(title, usernameWrap, passwordWrap, tipText, loginBtn);
    mask.appendChild(modal);
    document.body.appendChild(mask);

    // 阻止页面滚动
    document.body.style.overflow = "hidden";

    // 绑定登录事件
    bindLoginEvent(usernameInput, passwordInput, tipText, mask, modal);
  }

  // ===================== 5. 登录验证逻辑 =====================
  function bindLoginEvent(usernameInput, passwordInput, tipText, mask, modal) {
    // 登录验证核心方法
    const validateLogin = () => {
      const inputUsername = usernameInput.value.trim();
      const inputPassword = passwordInput.value.trim();

      // 清空提示
      tipText.innerText = "";

      // 空值验证
      if (!inputUsername) {
        tipText.innerText = "请输入用户名";
        tipText.style.color = styleConfig.errorColor;
        usernameInput.focus();
        return;
      }
      if (!inputPassword) {
        tipText.innerText = "请输入密码";
        tipText.style.color = styleConfig.errorColor;
        passwordInput.focus();
        return;
      }

      // 匹配账户信息
      const matchedUser = userAccounts.find(
        (user) =>
          user.username === inputUsername && user.password === inputPassword,
      );

      if (matchedUser) {
        // 登录成功：返回账户类型，关闭登录窗口
        const successText = `${matchedUser.username} 登录成功，以${matchedUser.type}权限进入...`;
        tipText.innerText = successText;
        tipText.style.color = styleConfig.successColor;

        // 执行对外接口，返回账户类型
        const userInfo = window.loginSuccess({
          username: matchedUser.username,
          type: matchedUser.type,
        });
        console.log("接口返回的账户类型：", userInfo.type);

        // 延迟关闭（体验更友好）
        setTimeout(() => {
          mask.remove();
          document.body.style.overflow = ""; // 恢复页面滚动
        }, 166);
      } else {
        // 验证失败：锁定操作，提示错误
        tipText.innerText = "用户名或密码错误，请重新输入";
        tipText.style.color = styleConfig.errorColor;
        passwordInput.value = ""; // 清空密码框
        passwordInput.focus();
      }
    };

    // 绑定按钮点击
    modal.querySelector("button").addEventListener("click", validateLogin);

    // 回车触发登录
    [usernameInput, passwordInput].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") validateLogin();
      });
    });
  }

  // ===================== 6. 页面加载后初始化 =====================
  if (document.readyState === "complete") {
    createLoginElements();
  } else {
    window.addEventListener("load", createLoginElements);
  }
})();
