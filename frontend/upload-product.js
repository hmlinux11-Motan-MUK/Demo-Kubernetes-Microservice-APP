async function uploadAndSaveProduct() {
  const status = document.getElementById("status");
  status.style.color = "black";
  status.innerText = "Uploading...";

  const token = localStorage.getItem("token");
  console.log("Token:", token);

  if (!token) {
    status.style.color = "red";
    status.innerText = "Please login first.";
    window.location.href = "login.html";
    return;
  }

  const fileInput = document.getElementById("imageFile");
  const file = fileInput.files[0];

  if (!file) {
    status.style.color = "red";
    status.innerText = "Please select an image.";
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const uploadResponse = await fetch("http://localhost:3003/upload", {
      method: "POST",
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    console.log("Upload response:", uploadResult);

    if (!uploadResponse.ok) {
      status.style.color = "red";
      status.innerText = uploadResult.error || "Image upload failed.";
      return;
    }

    const productData = {
      product_ID: document.getElementById("product_ID").value,
      product_title: document.getElementById("product_title").value,
      product_image: uploadResult.image_path,
      product_name: document.getElementById("product_name").value,
      product_price: document.getElementById("product_price").value,
      product_availability: document.getElementById("product_availability").value,
      product_description: document.getElementById("product_description").value,
      catid: parseInt(document.getElementById("catid").value, 10)
    };

    console.log("Product payload:", productData);

    const productResponse = await fetch("http://localhost:3002/add-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    const productResult = await productResponse.json();
    console.log("Add product response:", productResult);

    if (!productResponse.ok) {
      status.style.color = "red";
      status.innerText = productResult.error || "Product save failed.";
      return;
    }

    status.style.color = "green";
    status.innerText = "Product uploaded and saved successfully.";
  } catch (error) {
    console.error("Upload flow error:", error);
    status.style.color = "red";
    status.innerText = error.message || "Failed to fetch";
  }
}