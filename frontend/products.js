import { navbar } from "./header.js";

function showContent() {
    const contentDiv = document.getElementById("content-container");
    if (contentDiv) contentDiv.style.display = "block";
}

async function render_products() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const page = urlParams.get("page") || 1;

    const URL = `/products?page=${page}`;

    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        const result = await response.json();

        const productsContainerTitle = document.getElementById("title");
        const productsGrid = document.getElementById("product-grid");
        const paginationButtons = document.getElementById("text-right");
        const paginationP = document.getElementById("text-right-p");

        if (!productsContainerTitle || !productsGrid) return;

        productsGrid.innerHTML = "";
        if (paginationButtons) paginationButtons.innerHTML = "";
        if (paginationP) paginationP.innerHTML = "";

        if (result.products && result.products.length > 0) {
            const currentPage = result.page || 1;
            const totalPages = result.pages || 1;

            productsContainerTitle.innerHTML = "Products";

            for (const product of result.products) {
                const productWrapper = document.createElement("a");
                productWrapper.href = `./product-details.html?product_id=${product.product_ID}`;
                productWrapper.classList.add("product-link");
                productsGrid.appendChild(productWrapper);

                const productDiv = document.createElement("div");
                productDiv.classList.add("product");
                productWrapper.appendChild(productDiv);

                const productImg = document.createElement("img");
                productImg.src = product.product_image || "./shopping-cart.png";
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

            if (paginationButtons) {
                if (currentPage > 1) {
                    const previousButton = document.createElement("a");
                    previousButton.href = `./products.html?page=${currentPage - 1}`;
                    previousButton.classList.add("btn-not-active");
                    previousButton.innerHTML = "<b>&laquo;</b>";
                    paginationButtons.appendChild(previousButton);
                }

                const currentButton = document.createElement("a");
                currentButton.href = `./products.html?page=${currentPage}`;
                currentButton.classList.add("btn");
                currentButton.innerHTML = currentPage;
                paginationButtons.appendChild(currentButton);

                if (currentPage < totalPages) {
                    const nextButton = document.createElement("a");
                    nextButton.href = `./products.html?page=${currentPage + 1}`;
                    nextButton.classList.add("btn-not-active");
                    nextButton.innerHTML = "<b>&raquo;</b>";
                    paginationButtons.appendChild(nextButton);
                }
            }

            if (paginationP) {
                paginationP.innerHTML = `Showing page ${currentPage} of ${totalPages}`;
            }
        } else {
            productsContainerTitle.innerHTML = "No Products To Be Displayed.";
        }
    } catch (error) {
        console.error("Products page error:", error);
    }
}

window.onload = function () {
    navbar();
    render_products();
    showContent();
};