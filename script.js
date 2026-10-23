
/* =========================================================
   PAWFECT BAKES — COMPLETE script.js
   Cake builder | Product search | Shopping cart | Checkout
   Currency: Sri Lankan Rupees
   ========================================================= */

"use strict";

/* ==================== SETTINGS ==================== */

const CURRENCY = "Rs. ";

const SIZE_PRICE = {
    Mini: 1500,
    Medium: 2500,
    Party: 4000
};

const TOPPING_PRICE = 300;

// Demonstration delivery estimate.
// Confirm the actual delivery charge with your bakery.
const DELIVERY_FEE = 350;

const CART_STORAGE_KEY = "pawfect-cart";

const PRODUCTS = [
    {
        id: "p1",
        emoji: "🥜",
        name: "Peanut Butter Pup",
        desc: "Classic peanut butter cake with a yoghurt-style frosting.",
        price: 2200,
        category: "dog"
    },
    {
        id: "p2",
        emoji: "🍌",
        name: "Banana Bounce",
        desc: "A banana-inspired birthday favourite for your furry friend.",
        price: 2000,
        category: "dog"
    },
    {
        id: "p3",
        emoji: "🐟",
        name: "Tuna Treat Tower",
        desc: "A savoury fish-inspired treat for feline celebrations.",
        price: 2400,
        category: "cat"
    },
    {
        id: "p4",
        emoji: "🍗",
        name: "Chicken Carrot Cake",
        desc: "A savoury chicken and carrot celebration cake.",
        price: 2600,
        category: "dog"
    },
    {
        id: "p5",
        emoji: "🍓",
        name: "Berry Blush",
        desc: "A fruity-inspired cake for a colourful celebration.",
        price: 2300,
        category: "dog"
    },
    {
        id: "p6",
        emoji: "🎉",
        name: "Mini Pupcake Box",
        desc: "Six little cakes for a special dog birthday party.",
        price: 1800,
        category: "birthday"
    }
];

/* ==================== HELPERS ==================== */

const $ = selector => document.querySelector(selector);

const $$ = selector => [...document.querySelectorAll(selector)];

const money = amount =>
    CURRENCY + Number(amount || 0).toLocaleString("en-LK");

const pick = array =>
    array[Math.floor(Math.random() * array.length)];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getLocalDate() {
    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
}

function createOrderNumber() {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `PB-${time}-${random}`;
}

function showToast(message) {
    const toastElement = $("#toast");

    if (!toastElement) return;

    toastElement.textContent = message;
    toastElement.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toastElement.classList.remove("show");
    }, 2600);
}

/* ==================== CART STORAGE ==================== */

let cart = [];
let lastOrder = null;

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(item =>
                item &&
                typeof item.key === "string" &&
                typeof item.name === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) >= 0 &&
                Number.isInteger(Number(item.qty)) &&
                Number(item.qty) > 0 &&
                Number(item.qty) <= 99
            )
            .map(item => ({
                key: item.key,
                emoji: String(item.emoji || "🎂"),
                name: item.name,
                meta: String(item.meta || ""),
                price: Number(item.price),
                qty: Number(item.qty),
                details: item.details &&
                    typeof item.details === "object"
                    ? item.details
                    : {}
            }));
    } catch (error) {
        console.warn("Unable to load the saved cart.", error);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.warn("Unable to save the cart.", error);
        showToast("Your cart could not be saved in this browser.");
        return false;
    }
}

/* ==================== CAKE BUILDER ==================== */

let build = {
    pet: "Dog",
    size: "Mini",
    flavour: "Peanut butter",
    topping: "🦴",
    name: "",
    birthday: "",
    colour: "Natural",
    notes: ""
};

function buildPrice() {
    return SIZE_PRICE[build.size] + TOPPING_PRICE;
}

function readBuilderFields() {
    build.name = $("#petName").value.trim();
    build.birthday = $("#petBirthday").value;
    build.colour = $("#cakeColour").value;
    build.notes = $("#cakeNotes").value.trim();
}

function updatePreview(animateTopping = false) {
    const cakeElement = $("#pvCake");
    const toppingElement = $("#pvTopping");

    const petName = build.name.trim();

    cakeElement.textContent = build.pet === "Dog" ? "🎂" : "🍰";
    toppingElement.textContent = build.topping;

    $("#pvName").textContent = petName
        ? `Happy Birthday, ${petName}!`
        : `For your ${build.pet.toLowerCase()}`;

    $("#pvSummary").textContent =
        `${build.size} · ${build.flavour}` +
        (build.colour !== "Natural" ? ` · ${build.colour}` : "");

    $("#pvPrice").textContent = money(buildPrice());

    // Reflect the selected colour in the preview.
    const preview = $(".preview-cake");

    const colours = {
        Natural: "#FFF8E9",
        Pink: "#FFE0EB",
        Blue: "#DDEEFF",
        Yellow: "#FFF1B8",
        Green: "#DDF7E9"
    };

    preview.style.backgroundColor = colours[build.colour] || colours.Natural;
    preview.style.borderRadius = "18px";
    preview.style.transition = "background-color .25s";
    preview.style.paddingBottom = "12px";

    if (animateTopping) {
        toppingElement.classList.remove("pop");

        void toppingElement.offsetWidth;

        toppingElement.classList.add("pop");
    }
}

function syncChips() {
    $$(".chips").forEach(group => {
        const groupName = group.dataset.group;

        group.querySelectorAll(".chip").forEach(chip => {
            const selected = chip.dataset.value === build[groupName];

            chip.classList.toggle("active", selected);
            chip.setAttribute("aria-pressed", String(selected));
        });
    });
}

$$(".chips").forEach(group => {
    group.querySelectorAll(".chip").forEach(chip => {
        chip.setAttribute(
            "aria-pressed",
            String(chip.classList.contains("active"))
        );
    });

    group.addEventListener("click", event => {
        const chip = event.target.closest(".chip");

        if (!chip || !group.contains(chip)) return;

        const groupName = group.dataset.group;

        if (!Object.hasOwn(build, groupName)) return;

        build[groupName] = chip.dataset.value;

        syncChips();
        updatePreview(groupName === "topping");
    });
});

$("#petName").addEventListener("input", () => {
    build.name = $("#petName").value;
    updatePreview();
});

$("#petBirthday").addEventListener("change", () => {
    build.birthday = $("#petBirthday").value;
});

$("#cakeColour").addEventListener("change", () => {
    build.colour = $("#cakeColour").value;
    updatePreview();
});

$("#cakeNotes").addEventListener("input", () => {
    build.notes = $("#cakeNotes").value;
});

/* ==================== ADD CUSTOM CAKE ==================== */

$("#addCustom").addEventListener("click", () => {
    readBuilderFields();

    const details = {
        pet: build.pet,
        size: build.size,
        flavour: build.flavour,
        topping: build.topping,
        petName: build.name,
        birthday: build.birthday,
        colour: build.colour,
        notes: build.notes
    };

    const key = "custom-" + JSON.stringify(details);

    const meta = [
        build.size,
        build.flavour,
        `Topping: ${build.topping}`,
        `Colour: ${build.colour}`,
        build.birthday ? `Birthday: ${build.birthday}` : "",
        build.notes ? "Special requests included" : ""
    ].filter(Boolean).join(" · ");

    addToCart({
        key,
        emoji: build.topping,
        name: `Custom ${build.pet} cake` +
            (build.name ? ` for ${build.name}` : ""),
        meta,
        price: buildPrice(),
        details
    });
});

/* ==================== SURPRISE ME ==================== */

$("#surpriseBtn").addEventListener("click", () => {
    build.pet = pick(["Dog", "Cat"]);
    build.size = pick(Object.keys(SIZE_PRICE));

    build.flavour = pick(
        $$('.chips[data-group="flavour"] .chip')
            .map(chip => chip.dataset.value)
    );

    build.topping = pick(
        $$('.chips[data-group="topping"] .chip')
            .map(chip => chip.dataset.value)
    );

    syncChips();
    updatePreview(true);

    $("#builder").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    showToast("🎲 Surprise! Your cake design is ready.");
});

/* ==================== READY-MADE PRODUCTS ==================== */

function renderProducts() {
    const grid = $("#productGrid");
    const searchInput = $("#productSearch");
    const filterInput = $("#productFilter");

    const searchTerm = searchInput.value.trim().toLowerCase();
    const category = filterInput.value;

    const filtered = PRODUCTS.filter(product => {
        const matchesSearch = [
            product.name,
            product.desc,
            product.category
        ].join(" ").toLowerCase().includes(searchTerm);

        const matchesCategory =
            category === "all" ||
            product.category === category ||
            (category === "birthday" && product.category === "birthday");

        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty">
                <div class="empty-emoji">🔎</div>
                <h3>No cakes found</h3>
                <p>Try another name or category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <article class="card">
            <div class="card-emoji" aria-hidden="true">
                ${escapeHTML(product.emoji)}
            </div>

            <h3>${escapeHTML(product.name)}</h3>

            <p>${escapeHTML(product.desc)}</p>

            <div class="card-foot">
                <span class="price">${money(product.price)}</span>

                <button
                    type="button"
                    class="btn btn-primary"
                    data-add="${escapeHTML(product.id)}">
                    Add to cart
                </button>
            </div>
        </article>
    `).join("");
}

$("#productSearch").addEventListener("input", renderProducts);
$("#productFilter").addEventListener("change", renderProducts);

$("#productGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (!button) return;

    const product = PRODUCTS.find(
        item => item.id === button.dataset.add
    );

    if (!product) return;

    addToCart({
        key: product.id,
        emoji: product.emoji,
        name: product.name,
        meta: "Ready-made · " + product.category,
        price: product.price,
        details: {
            category: product.category
        }
    });
});

/* ==================== SHOPPING CART ==================== */

function addToCart(item) {
    const existing = cart.find(product => product.key === item.key);

    if (existing) {
        if (existing.qty >= 99) {
            showToast("Maximum quantity is 99 per item.");
            return;
        }

        existing.qty++;
    } else {
        cart.push({
            ...item,
            qty: 1
        });
    }

    saveCart();
    renderCart();

    showToast(`${item.emoji} Added to your cart!`);

    const cartButton = $("#openCart");

    cartButton.classList.remove("bump");
    void cartButton.offsetWidth;
    cartButton.classList.add("bump");
}

function getCartSubtotal() {
    return cart.reduce(
        (total, item) => total + item.price * item.qty,
        0
    );
}

function renderCart() {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    const subtotal = getCartSubtotal();

    $("#cartCount").textContent = count;
    $("#cartSubtotal").textContent = money(subtotal);

    // Delivery fee is a demonstration estimate, not a confirmed charge.
    $("#deliveryFee").textContent =
        cart.length ? `${money(DELIVERY_FEE)} (estimate)` : money(0);

    $("#cartTotal").textContent = money(
        subtotal + (cart.length ? DELIVERY_FEE : 0)
    );

    const empty = cart.length === 0;

    $("#cartEmpty").hidden = !empty;
    $("#checkout").hidden = empty;

    $("#cartList").innerHTML = cart.map((item, index) => `
        <li class="cart-item">
            <span class="ci-emoji" aria-hidden="true">
                ${escapeHTML(item.emoji)}
            </span>

            <div>
                <div class="ci-name">${escapeHTML(item.name)}</div>
                <div class="ci-meta">${escapeHTML(item.meta)}</div>

                <div class="qty">
                    <button
                        type="button"
                        data-dec="${index}"
                        aria-label="Decrease ${escapeHTML(item.name)} quantity">
                        −
                    </button>

                    <span>${item.qty}</span>

                    <button
                        type="button"
                        data-inc="${index}"
                        aria-label="Increase ${escapeHTML(item.name)} quantity">
                        +
                    </button>
                </div>
            </div>

            <div class="ci-right">
                <div class="price">
                    ${money(item.price * item.qty)}
                </div>

                <button
                    type="button"
                    class="remove"
                    data-rm="${index}">
                    Remove
                </button>
            </div>
        </li>
    `).join("");
}

$("#cartList").addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) return;

    const data = button.dataset;

    if (data.inc !== undefined) {
        const index = Number(data.inc);

        if (!cart[index] || cart[index].qty >= 99) {
            showToast("Maximum quantity is 99 per item.");
            return;
        }

        cart[index].qty++;
    } else if (data.dec !== undefined) {
        const index = Number(data.dec);

        if (!cart[index]) return;

        cart[index].qty--;

        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    } else if (data.rm !== undefined) {
        const index = Number(data.rm);

        if (!cart[index]) return;

        cart.splice(index, 1);
        showToast("Item removed from your cart.");
    } else {
        return;
    }

    saveCart();
    renderCart();
});

/* ==================== CART DRAWER ==================== */

function openCart() {
    $("#drawer").classList.add("open");
    $("#overlay").classList.add("show");

    $("#drawer").setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");

    $("#closeCart").focus();
}

function closeCart() {
    $("#drawer").classList.remove("open");
    $("#overlay").classList.remove("show");

    $("#drawer").setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}

$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

$("#shopNow").addEventListener("click", () => {
    closeCart();

    $("#shop").scrollIntoView({
        behavior: "smooth"
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();

        if (!$("#modal").hidden) {
            $("#modal").hidden = true;
        }
    }
});

/* ==================== CHECKOUT VALIDATION ==================== */

const deliveryDateInput = $("#deliveryDate");

deliveryDateInput.min = getLocalDate();

function validateCheckout() {
    const name = $("#cName").value.trim();
    const phone = $("#cPhone").value.trim();
    const address = $("#cAddr").value.trim();
    const district = $("#cDistrict").value;
    const date = deliveryDateInput.value;

    if (cart.length === 0) {
        showToast("Your cart is empty.");
        return false;
    }

    if (!name || !phone || !address || !district || !date) {
        showToast("Please complete all required delivery fields.");
        return false;
    }

    if (date < getLocalDate()) {
        showToast("Please choose today or a future delivery date.");
        return false;
    }

    // Basic phone input validation. Confirm the number with the customer.
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 9 || digits.length > 15) {
        showToast("Please enter a valid phone number.");
        $("#cPhone").focus();
        return false;
    }

    return true;
}

/* ==================== PLACE ORDER ==================== */

$("#checkout").addEventListener("submit", event => {
    event.preventDefault();

    if (!validateCheckout()) return;

    const order = {
        orderNumber: createOrderNumber(),
        customer: {
            name: $("#cName").value.trim(),
            phone: $("#cPhone").value.trim(),
            email: $("#cEmail").value.trim(),
            address: $("#cAddr").value.trim(),
            district: $("#cDistrict").value
        },
        deliveryDate: deliveryDateInput.value,
        deliveryInstructions: $("#orderNotes").value.trim(),
        giftMessage: $("#giftMsg").value.trim(),
        items: cart.map(item => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            meta: item.meta,
            details: item.details
        })),
        subtotal: getCartSubtotal(),
        estimatedDeliveryFee: DELIVERY_FEE,
        estimatedTotal: getCartSubtotal() + DELIVERY_FEE,
        createdAt: new Date().toISOString()
    };

    /*
       DEMO MODE:
       This creates an order confirmation in the browser only.
       No order is sent to the bakery or saved on a server.
       Connect a backend before accepting real customer orders.
    */

    lastOrder = order;

    const giftText = order.giftMessage
        ? ` Your gift message: "${order.giftMessage}".`
        : "";

    $("#modalMsg").textContent =
        `Thank you, ${order.customer.name}! ` +
        `Your demo order number is ${order.orderNumber}. ` +
        `Your estimated total is ${money(order.estimatedTotal)}. ` +
        `Your preferred delivery date is ${order.deliveryDate}. ` +
        `The bakery must confirm your order and delivery fee.` +
        giftText;

    $("#modal").hidden = false;

    // Clear the cart only after the demo order is created.
    cart = [];
    saveCart();
    renderCart();

    event.target.reset();

    closeCart();

    $("#closeModal").focus();
});

$("#closeModal").addEventListener("click", () => {
    $("#modal").hidden = true;
    $("#openCart").focus();
});

/* ==================== BACK TO TOP ==================== */

const backToTop = $(".back-to-top");

if (backToTop) {
    backToTop.addEventListener("click", event => {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ==================== INITIALIZE WEBSITE ==================== */

function initializeWebsite() {
    renderProducts();
    renderCart();
    syncChips();
    updatePreview();

    // Keep the delivery date restriction current.
    deliveryDateInput.min = getLocalDate();

    console.log("🐾 Pawfect Bakes website initialized!");
}

initializeWebsite();
