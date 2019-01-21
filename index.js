const form = document.querySelector("form");
const name = document.querySelector("#name");
const amount = document.querySelector("#amount");
const error = document.querySelector("#error");

form.addEventListener('submit', (e) => {

    e.preventDefault();

    if (name.value && amount.value) {
        const item = {
            name: name.value,
            amount: parseInt(amount.value)
        };

        db.collection("activities").add(item).then(res => {
            name.value = "";
            amount.value = "";
            error.textContent = "";
        })

    } else {
        error.textContent = "please fill input fields before submitting"
    }
})