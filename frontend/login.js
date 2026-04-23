document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("loginBtn");
    const status = document.getElementById("status");

    btn.addEventListener("click", async () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        status.style.color = "black";
        status.innerText = "Logging in...";
        console.log("Login button clicked");

        try {
            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            console.log("Login response:", result);

            if (!response.ok) {
                status.style.color = "red";
                status.innerText = result.error || "Login failed";
                return;
            }

            localStorage.setItem("token", result.token);
            console.log("Saved token:", localStorage.getItem("token"));

            status.style.color = "green";
            status.innerText = "Login successful! Redirecting...";

            setTimeout(() => {
                window.location.href = "upload-product.html";
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);
            status.style.color = "red";
            status.innerText = error.message || "Something went wrong";
        }
    });
});