import { navbar } from "./header.js";

export function showContent() {
    const contentDiv = document.getElementById("content-container");
    if (contentDiv) {
        contentDiv.style.display = "block";
    }
}

export async function render_featured_content() {
    const URL = "http://localhost:3002/home/";

    try {
        const response = await fetch(URL, {
            method: "GET",
            mode: "cors",
            headers: {
                "Accept": "application/json"
            }
        });

        const result = await response.json();

        const productsContainerTitle = document.getElementById("title");
        const productsGrid = document.getElementById("product-grid");

        if (!productsContainerTitle || !productsGrid) return;

        productsGrid.innerHTML = "";

        if (result.products && result.products.length > 0) {
            productsContainerTitle.innerHTML = "Featured Products";

            for (let i = 0; i < result.products.length; i++) {
                const product = result.products[i];

                const productWrapper = document.createElement("a");
                productWrapper.href = `./product-details.html?product_id=${product.product_ID}`;
                productWrapper.classList.add("product-link");
                productsGrid.appendChild(productWrapper);

                const productDiv = document.createElement("div");
                productDiv.classList.add("product");
                productWrapper.appendChild(productDiv);

                const productImg = document.createElement("img");
                if (product.product_image && product.product_image.startsWith("/uploads/")) {
                    productImg.src = `http://localhost:3003${product.product_image}`;
                } else {
                    productImg.src = product.product_image || "./shopping-cart.png";
                }

                productImg.alt = product.product_title;
                productImg.onerror = function () {
                    productImg.src = "./shopping-cart.png";
                };
                productDiv.appendChild(productImg);

                const productH4 = document.createElement("h4");
                productH4.classList.add("product-title");
                productH4.innerHTML = product.product_title;
                productDiv.appendChild(productH4);

                const productP = document.createElement("p");
                productP.innerHTML = "$" + product.product_price;
                productDiv.appendChild(productP);
            }
        } else {
            productsContainerTitle.innerHTML = "No Featured Products";
        }
    } catch (error) {
        console.error("Home page error:", error);
    }
}

window.onload = function () {
    navbar();
    render_featured_content();
    showContent();
};