// let count = 0;
let productList = document.querySelectorAll(".products-list");
let count = productList.length;
async function newProduct() {
    let productList = document.querySelectorAll(".products-list");
    if (!productList.length) {
        count = productList.length;
    }
    let productsContainer = document.getElementById("products-container");
    let newDivElement = document.createElement("div");
    let content = ` <div class="col">
                    <label for="products-list" class="form-label">Choose product ${count + 1}</label>
                    <span class="products-list text-danger"><i class="fa fa-times-circle" aria-hidden="true"></i></span>
                    <select name="product-id-${count}" class="form-select" id="products-list" required>
                         {products-list}
                    </select>
                    </div>
                    <div class="col">
                    <form>
                    <label for="quantity-${count}" class="form-label">Quantity product  ${count + 1}</label>
                    </form>
                    <input type="number" class="form-control" id="quantity-${count}" name="quantity-${count}" placeholder="Quantity" required>
                     </div>`
    let productsList = []

    try {
        let response = await fetch("/api/get-products-list");
        if (response.status === 200) {
            let data = await response.text();
            productsList = JSON.parse(data)
        }
    } catch (err) {
        console.log(err.message)
    }
    let productsListOption = ""
    productsList.forEach(product => {
        productsListOption += `<option value=${product["productId"]}>${product["productName"]}</option> \n`
    })
    content = content.replace("{products-list}", productsListOption);
    newDivElement.innerHTML = content;
    newDivElement.className = "mb-3 row";
    productsContainer.append(newDivElement);
    removeProduct();
    count++;
}

document.getElementById("add-product").onclick = () => {
    newProduct();
};

function removeProduct() {
    let productList = document.querySelectorAll(".products-list");
    for (let i = 0; i < productList.length; i++) {
        productList[i].onclick = function () {
            this.parentNode.parentNode.remove();
        }
    }
    return productList.length;
}


