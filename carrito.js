class  Carrito {
    constructor(productos, currency) {
        this.productos = productos;
        this.currency = currency;
        this.unidades = {};
        productos.forEach(producto => {
            this.unidades[producto.SKU] = 0;
        });
    }

    updateUnidades(sku, unidades) {
        if (unidades < 0) {
            unidades = 0;
        }
        this.unidades[sku] = unidades;
    }

    getInformacionProducto(sku) {
        const producto = this.productos.find(p => p.SKU === sku);
        return{
            SKU: producto.SKU,
            title: producto.title,
            price: producto.price,
            quantity: this.unidades[sku]
        };
    }

    getCarrito() {
        const productosCarrito = [];
        for (let i = 0; i < this.productos.length; i++) {
            const p = this.productos[i];

            if (this.unidades[p.SKU] > 0) {
                const productoCantidad = {
                    SKU: p.SKU,
                    title: p.title,
                    price: p.price,
                    quantity: this.unidades[p.SKU]
                };
                productosCarrito.push(productoCantidad);
            }
        }

        let total = 0;
        for (let i = 0; i < productosCarrito.length; i++) {
            const p = productosCarrito[i];
            total += parseFloat(p.price) * p.quantity;
        }
        return { 
            productos: productosCarrito,
            total: total,
            currency: this.currency
        };
    }
}

const API_URL = './products.json';
let carrito;

async function init(){
    const response = await fetch(API_URL);
    const data = await response.json();
    carrito = new Carrito(data.products, data.currency);

    renderProductos(data.products);
    updateTotal();
}

function renderProductos(productos) {
    const productosContainer = document.getElementById('productos-container');
    productosContainer.innerHTML = '';

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        productoDiv.innerHTML = `
            <div class="info-producto">
                <img src="${producto.image}" alt="${producto.title}">
                <div>
                    <p class="title">${producto.title}</p>
                    <span class="ref">Ref: ${producto.SKU}</span>
                </div>
            </div>
            <div class="seleccion-cantidad">
                <button onclick="changeCantidad('${producto.SKU}', -1)">-</button>
                <input type="number" min="0" value="0" id="qty-${producto.SKU}" data-sku="${producto.SKU}" class="cantidad-input" readonly>
                <button onclick="changeCantidad('${producto.SKU}', 1)">+</button>
            </div>
            <div class="precio-unidad">${producto.price}${carrito.currency}</div>
            <div class="precio-total-producto" id="subtotal-${producto.SKU}">0${carrito.currency}</div>
        `;
        productosContainer.appendChild(productoDiv);
    });
}

function changeCantidad(sku, delta) {
    const input = document.getElementById('qty-' +  sku);
    const nuevaCantidad = parseInt(input.value) + delta;
    if (nuevaCantidad < 0) {
        return;
    }
    input.value = nuevaCantidad;
    carrito.updateUnidades(sku, nuevaCantidad);
    updateTotal();
}

function updateTotal() {
    const datos = carrito.getCarrito();

    carrito.productos.forEach(producto => {
        const info = carrito.getInformacionProducto(producto.SKU);
        const subtotal = parseFloat(producto.price) * info.quantity;
        const subtotalElement = document.getElementById('subtotal-' + producto.SKU);
        if (subtotalElement) {
            subtotalElement.textContent = `Subtotal: ${subtotal.toFixed(2)} ${carrito.currency}`;
        }
    });

    const resumen = document.getElementById('resumen');
    resumen.innerHTML = '';

    datos.productos.forEach(producto => {
        const subtotal = parseFloat(producto.price) * producto.quantity;
        const linea = document.createElement('div');
        linea.classList.add('resumen-linea');
        linea.innerHTML = `
            <span>${producto.title} (x${producto.quantity})</span>
            <span>${subtotal.toFixed(2)} ${carrito.currency}</span>
        `;
        resumen.appendChild(linea);
    }); 

    document.getElementById('total').textContent = `Total: ${datos.total.toFixed(2)} ${carrito.currency}`;
}

init();

