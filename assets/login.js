// login.js
(function () {
  // 1. 动态注入CSS样式
  function injectLoginStyles() {
    const style = document.createElement("style");
    style.textContent = `
      /* 遮罩层样式 */
      #login-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(2px);
        pointer-events: auto;
      }

      /* 登录窗口容器 */
      #login-modal {
        width: 320px;
        background: #fff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        position: relative;
        z-index: 9999;
        box-sizing: border-box;
      }

      /* 登录标题 */
      #login-modal .login-title {
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
        text-align: center;
      }

      /* 输入框容器 */
      #login-modal .input-wrap {
        margin-bottom: 16px;
      }
      #login-modal .input-wrap.password-wrap {
        margin-bottom: 20px;
      }

      /* 输入框标签 */
      #login-modal .input-label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        color: #666;
      }

      /* 输入框样式 */
      #login-modal .login-input {
        width: 100%;
        padding: 10px 12px;
        box-sizing: border-box;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
      }
      #login-modal .login-input:focus {
        border-color: #0078ff;
      }
      #login-modal .login-input::placeholder {
        color: #999;
      }

      /* 提示文本 */
      #login-tip {
        font-size: 12px;
        text-align: center;
        margin-bottom: 16px;
        min-height: 16px;
      }
      #login-tip.error {
        color: #ff4444;
      }
      #login-tip.success {
        color: #00cc66;
      }

      /* 登录按钮 */
      #login-btn {
        width: 100%;
        padding: 10px;
        background: #0078ff;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
      }
      #login-btn:hover {
        background: #0066cc;
      }

      /* 隐藏默认样式 */
      .hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 2. 动态创建登录弹窗HTML结构
  function createLoginModal() {
    const loginContainer = document.getElementById("login");
    if (!loginContainer) {
      console.error("未找到id为login的容器");
      return false;
    }

    const modalHTML = `
      <div id="login-mask" class="hidden">
        <div id="login-modal">
          <h3 class="login-title">系统登录</h3>
          <div class="input-wrap">
            <label class="input-label" for="username">用户名：</label>
            <input type="text" id="username" class="login-input" placeholder="请输入用户名" />
          </div>
          <div class="input-wrap password-wrap">
            <label class="input-label" for="password">密码：</label>
            <input type="password" id="password" class="login-input" placeholder="请输入密码" />
          </div>
          <div id="login-tip"></div>
          <button id="login-btn">登录</button>
        </div>
      </div>
    `;
    loginContainer.innerHTML = modalHTML;
    return true;
  }

  // 3. 账户数据
  const userAccounts = [
    { username: "admin", password: "123456", type: "超级管理员" },
    { username: "1", password: "1", type: "超级管理员" },
    { username: "editor", password: "editor123", type: "内容编辑" },
    { username: "viewer", password: "viewer123", type: "只读查看" },
    { username: "operator", password: "op123456", type: "运维人员" },
  ];

  // 5. 登录成功对外暴露的接口
  window.loginSuccess = function (userInfo) {
    console.log("登录成功，账户信息：", userInfo);
    return userInfo;
  };

  // 6. 初始化登录弹窗（显示）
  function initLoginModal() {
    // 先注入样式
    injectLoginStyles();
    // 创建DOM结构，创建失败则终止
    const isCreated = createLoginModal();
    if (!isCreated) return;

    const mask = document.getElementById("login-mask");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const tipText = document.getElementById("login-tip");
    const loginBtn = document.getElementById("login-btn");

    // 显示登录弹窗（移除hidden类）
    mask.classList.remove("hidden");
    // 阻止页面滚动
    document.body.style.overflow = "hidden";

    // 绑定登录事件
    bindLoginEvent(usernameInput, passwordInput, tipText, mask, loginBtn);
  }

  // 7. 登录验证逻辑
  function bindLoginEvent(
    usernameInput,
    passwordInput,
    tipText,
    mask,
    loginBtn,
  ) {
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

  // 直接执行初始化（因为JS在div后引入，此时DOM已存在）
  initLoginModal();
})();
