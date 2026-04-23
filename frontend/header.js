function showhide(id) {
    const element = document.getElementById(id);
    if (!element) return;
    element.style.display = (element.style.display === "block") ? "none" : "block";
}

function showcat1(catid) {
    window.location.href = `./category.html?catid=${catid}&page=1`;
}

async function navbar() {
    const authMenu = document.getElementById("auth-menu");
    const token = localStorage.getItem("token");

    if (!authMenu) {
        console.error("auth-menu not found");
        return;
    }

    if (token) {
        authMenu.innerHTML = `
            <div class="auth-actions">
                <a href="./upload-product.html" class="dashboard-btn">Dashboard</a>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </div>
        `;

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.href = "./home.html";
            });
        }
    } else {
        authMenu.innerHTML = `
            <a href="./login.html" class="login-icon" title="Login">
                <i class="fa-solid fa-user"></i>
            </a>
        `;
    }
}

export { navbar, showhide, showcat1 };