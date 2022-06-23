// $("#search-input").on("input", ()=> {
//     console.log($(this).val());
// })
window.onload = () => {

    let searhValue = document.getElementById("search-input");

        const end = searhValue.value.length;
        searhValue.setSelectionRange(end, end);
        searhValue.focus()

    searhValue.addEventListener("input", function () {
        console.log(searhValue.value);
        window.location.href = `/products/search?value=${searhValue.value}`;
    })
}
