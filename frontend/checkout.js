const cartItemsDiv = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");
const form = document.getElementById("checkout-form");
const message = document.getElementById("message");

// Dummy cart (you can later replace with localStorage/cart API)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {
    cartItemsDiv.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <p>${item.product_name} - $${item.product_price}</p>
        `;
        cartItemsDiv.appendChild(div);

        total += parseFloat(item.product_price);
    });

    totalSpan.innerText = total;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const order = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value,
        items: cart,
        total: totalSpan.innerText
    };

    try {
        // You can replace this with real API later
        console.log("Order placed:", order);

        message.style.color = "green";
        message.innerText = "Order placed successfully!";

        localStorage.removeItem("cart");
        cart = [];
        loadCart();

    } catch (err) {
        message.style.color = "red";
        message.innerText = "Error placing order";
    }
});

loadCart();
