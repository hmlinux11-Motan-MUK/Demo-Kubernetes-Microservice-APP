async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const status = document.getElementById("status");

    status.style.color = "black";
    status.innerText = "Logging in...";

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!response.ok) {
            status.style.color = "red";
            status.innerText = result.error || "Login failed";
            return;
        }

        localStorage.setItem("token", result.token);

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
}