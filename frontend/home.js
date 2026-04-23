import { navbar } from "./header.js";

function showContent() {
    const contentDiv = document.getElementById("content-container");
    contentDiv.style.display = "block";
}

async function render_featured_content() {
    const URL = "http://localhost:3000/home/";

    let response = await fetch(URL, {
        method: "GET",
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    let result = await response.json();

    if (result.products && result.products.length !== 0) {
        let products = result.products;
        let products_grid = document.getElementById("product-grid");
        let products_container_title = document.getElementById("title");

        products_container_title.innerHTML = "Featured Products";
        products_grid.innerHTML = "";

        for (let i = 0; i < products.length; i++) {
            let product = products[i];

            let product_wrapper = document.createElement("a");
            product_wrapper.href = `./product-details.html?product_id=${product.product_ID}`;
            product_wrapper.classList.add("product-link");
            products_grid.appendChild(product_wrapper);

            let product_div = document.createElement("div");
            product_div.classList.add("product");
            product_wrapper.appendChild(product_div);

            let product_img = document.createElement("img");

            if (product.product_image.startsWith("/uploads/")) {
                product_img.src = `http://localhost:3000${product.product_image}`;
            } else {
                product_img.src = product.product_image;
            }

            product_img.alt = product.product_title;
            product_div.appendChild(product_img);

            let product_h4 = document.createElement("h4");
            product_h4.classList.add("product-title");
            product_h4.innerHTML = product.product_title;
            product_div.appendChild(product_h4);

            let product_p = document.createElement("p");
            product_p.innerHTML = "$" + product.product_price;
            product_div.appendChild(product_p);
        }
    } else {
        let products_container_title = document.getElementById("title");
        products_container_title.innerHTML = "No Featured Products";
    }
}

window.onload = function () {
    navbar();
    render_featured_content();
    showContent();
};