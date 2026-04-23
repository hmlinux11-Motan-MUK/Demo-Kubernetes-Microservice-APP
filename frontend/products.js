import { navbar } from "./header.js";

function showContent() {
    const contentDiv = document.getElementById("content-container");
    contentDiv.style.display = "block";
}

async function render_products() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let page = parseInt(urlParams.get("page")) || 1;

    const URL = `http://localhost:3000/products?page=${page}`;

    let response = await fetch(URL, {
        method: "GET",
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    let result = await response.json();

    if (result.products) {
        let currentPage = result.page || 1;
        let pages = result.pages || 1;
        let products = result.products;

        let products_container_title = document.getElementById("title");
        let products_grid = document.getElementById("product-grid");
        let pagination_buttons = document.getElementById("text-right");
        let pagination_p = document.getElementById("text-right-p");

        products_grid.innerHTML = "";
        pagination_buttons.innerHTML = "";

        if (products.length !== 0) {
            products_container_title.innerHTML = "Products";

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

            if (currentPage !== 1) {
                let previous_button = document.createElement("a");
                previous_button.href = `./products.html?page=${currentPage - 1}`;
                previous_button.classList.add("btn-not-active");
                previous_button.innerHTML = "<b>&laquo;</b>";
                pagination_buttons.appendChild(previous_button);
            }

            if (currentPage - 1 > 0) {
                let previous_button_number = document.createElement("a");
                previous_button_number.href = `./products.html?page=${currentPage - 1}`;
                previous_button_number.classList.add("btn-not-active");
                previous_button_number.innerHTML = currentPage - 1;
                pagination_buttons.appendChild(previous_button_number);
            }

            let current_button = document.createElement("a");
            current_button.href = `./products.html?page=${currentPage}`;
            current_button.classList.add("btn");
            current_button.innerHTML = currentPage;
            pagination_buttons.appendChild(current_button);

            if (currentPage + 1 <= pages) {
                let next_button_number = document.createElement("a");
                next_button_number.href = `./products.html?page=${currentPage + 1}`;
                next_button_number.classList.add("btn-not-active");
                next_button_number.innerHTML = currentPage + 1;
                pagination_buttons.appendChild(next_button_number);
            }

            if (currentPage !== pages) {
                let next_button = document.createElement("a");
                next_button.href = `./products.html?page=${currentPage + 1}`;
                next_button.classList.add("btn-not-active");
                next_button.innerHTML = "<b>&raquo;</b>";
                pagination_buttons.appendChild(next_button);
            }

            pagination_p.innerHTML = "Showing page " + currentPage + " of " + pages;
        } else {
            products_container_title.innerHTML = "No Products To Be Displayed.";
            pagination_p.innerHTML = "";
        }
    }
}

window.onload = function () {
    navbar();
    render_products();
    showContent();
};