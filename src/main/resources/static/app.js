document.getElementById("loginForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {

        const response = await fetch("/api/users/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {

            const token = await response.text();

            localStorage.setItem("token", token);

            window.location.href = "dashboard.html";

        } else {

            const errorMessage = await response.text();

            message.textContent = errorMessage;
        }

    } catch (error) {

        message.textContent = "Unable to connect to server.";

        console.error(error);
    }
});