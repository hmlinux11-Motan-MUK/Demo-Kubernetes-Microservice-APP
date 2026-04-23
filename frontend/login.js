async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const status = document.getElementById("status");

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!response.ok) {
            status.innerText = result.error || "Login failed";
            return;
        }

        // Save token
        localStorage.setItem("token", result.token);

        status.style.color = "green";
        status.innerText = "Login successful! Redirecting...";

        // redirect to upload page
        setTimeout(() => {
            window.location.href = "upload-product.html";
        }, 1000);

    } catch (error) {
        console.error(error);
        status.innerText = "Something went wrong";
    }
}