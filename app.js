const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Live Product Database (Pre-seeded with Amazon categories + Dynamic Seller items)
let products = [
  { id: 1, name: 'Wireless Noise Canceling Headphones', category: 'Electronics', price: 2999, originalPrice: 4999, img: '🎧', rating: 4.5, reviews: 1240, seller: 'TechZone' },
  { id: 2, name: 'Smart Fitness Watch Series 7', category: 'Electronics', price: 4999, originalPrice: 7999, img: '⌚', rating: 4.8, reviews: 890, seller: 'GadgetHub' },
  { id: 3, name: 'Ergonomic Gaming Mouse 16000 DPI', category: 'Electronics', price: 1499, originalPrice: 2499, img: '🖱️', rating: 4.3, reviews: 450, seller: 'TechZone' },
  { id: 4, name: 'RGB Mechanical Gaming Keyboard', category: 'Electronics', price: 3599, originalPrice: 5999, img: '⌨️', rating: 4.7, reviews: 2100, seller: 'KeyMaster' },
  { id: 5, name: 'Classic Denim Jacket (Unisex)', category: 'Fashion', price: 2199, originalPrice: 3499, img: '🧥', rating: 4.2, reviews: 310, seller: 'StyleCraft' },
  { id: 6, name: 'Breathable Running Shoes', category: 'Fashion', price: 1899, originalPrice: 2999, img: '👟', rating: 4.6, reviews: 1540, seller: 'FootWear Co' },
  { id: 7, name: 'The Complete Software Engineering Handbook', category: 'Books', price: 899, originalPrice: 1299, img: '📚', rating: 4.9, reviews: 512, seller: 'DevBooks' },
  { id: 8, name: 'Smart LED Desk Lamp with Wireless Charger', category: 'Home', price: 1299, originalPrice: 1999, img: '💡', rating: 4.4, reviews: 280, seller: 'HomeLux' }
];

let cart = [];
let orders = [
  {
    id: 'ORD-984321',
    date: '2026-03-24',
    status: 'Out for Delivery',
    items: [
      { name: 'Smart Fitness Watch Series 7', price: 4999, qty: 1 }
    ],
    totalAmount: 5913,
    paymentMethod: 'UPI'
  }
];

app.get('/', (req, res) => {
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Amazon.in - Online Shopping Store</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        body { background-color: #eaeded; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .amazon-header { background-color: #131921; }
        .amazon-subnav { background-color: #232f3e; }
        .badge-amazon { background-color: #febd69; color: #111; }
        .btn-amazon { background-color: #ffd814; border: 1px solid #fcd200; border-radius: 20px; }
        .btn-amazon:hover { background-color: #f7ca00; }
        .btn-amazon-primary { background-color: #ffa41c; border: 1px solid #ff8f00; border-radius: 20px; }
        .btn-amazon-primary:hover { background-color: #f08804; }
        .modal { transition: opacity 0.25s ease; }
      </style>
    </head>
    <body class="min-h-screen flex flex-col">

      <header class="amazon-header text-white sticky top-0 z-40 shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          
          <!-- Amazon Brand Logo -->
          <a href="/" class="flex items-center gap-1 text-2xl font-bold tracking-tight text-white hover:border border-white p-1 rounded">
            <span class="text-amber-400">amazon</span><span class="text-xs text-slate-300">.in</span>
          </a>

          <!-- Search Bar -->
          <div class="flex-1 max-w-2xl hidden md:flex items-center">
            <select id="search-category" class="bg-gray-200 text-gray-800 text-xs py-2 px-3 rounded-l-md border-r border-gray-300 focus:outline-none">
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </select>
            <input type="text" id="search-input" onkeyup="filterProducts()" placeholder="Search Amazon.in" class="w-full text-gray-900 py-2 px-4 focus:outline-none text-sm">
            <button onclick="filterProducts()" class="bg-amber-400 hover:bg-amber-500 text-slate-900 px-5 py-2 rounded-r-md">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          <!-- Quick Navigation Action Links -->
          <div class="flex items-center gap-4 text-xs">
            <button onclick="openModal('seller-modal')" class="hover:border border-white p-2 rounded text-left flex flex-col">
              <span class="text-gray-300">Want to sell?</span>
              <span class="font-bold text-sm text-amber-400">+ Add Product</span>
            </button>

            <button onclick="openModal('orders-modal')" class="hover:border border-white p-2 rounded text-left flex flex-col">
              <span class="text-gray-300">Returns</span>
              <span class="font-bold text-sm">& Orders</span>
            </button>

            <button onclick="openCartModal()" class="hover:border border-white p-2 rounded flex items-center gap-2 relative">
              <i class="fa-solid fa-cart-shopping text-2xl text-amber-400"></i>
              <span id="cart-counter-badge" class="absolute -top-1 left-4 bg-amber-500 text-slate-900 text-xs font-extrabold rounded-full h-5 w-5 flex items-center justify-center">
                ${totalCartCount}
              </span>
              <span class="font-bold text-sm hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>

        <!-- Sub Navigation Category Bar -->
        <div class="amazon-subnav px-4 py-1.5 text-xs text-white flex items-center gap-6 overflow-x-auto">
          <button onclick="filterCategory('All')" class="font-bold hover:text-amber-400 whitespace-nowrap"><i class="fa-solid fa-bars mr-1"></i> All</button>
          <button onclick="filterCategory('Electronics')" class="hover:text-amber-400 whitespace-nowrap">Electronics</button>
          <button onclick="filterCategory('Fashion')" class="hover:text-amber-400 whitespace-nowrap">Fashion</button>
          <button onclick="filterCategory('Books')" class="hover:text-amber-400 whitespace-nowrap">Books</button>
          <button onclick="filterCategory('Home')" class="hover:text-amber-400 whitespace-nowrap">Home & Kitchen</button>
          <span class="text-gray-400">|</span>
          <span class="text-amber-300 font-medium">✨ Seller Marketplace Active</span>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <!-- Hero Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 mb-6 shadow-md flex justify-between items-center">
          <div>
            <span class="bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Big Savings Week</span>
            <h1 class="text-2xl md:text-4xl font-extrabold mt-2">Up to 60% Off Top Electronics & Apparel</h1>
            <p class="text-gray-300 text-sm mt-1">Shop thousands of genuine seller products with fast Prime delivery.</p>
          </div>
          <div class="hidden md:block text-6xl">📦</div>
        </div>

        <!-- Section Title & Filter Tabs -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 border-b border-gray-300 pb-2">
          <h2 id="catalog-title" class="text-xl font-bold text-slate-900">Explore Products</h2>
          <span class="text-xs text-gray-600" id="product-count-display">Showing all items</span>
        </div>

        <!-- Live Product Cards Grid -->
        <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Products injected dynamically via JavaScript -->
        </div>
      </main>


      <!-- 1. CART MODAL -->
      <div id="cart-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex justify-end">
        <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
          <div>
            <div class="flex justify-between items-center border-b pb-4">
              <h2 class="text-xl font-bold text-slate-900"><i class="fa-solid fa-cart-shopping text-amber-500 mr-2"></i> Your Shopping Cart</h2>
              <button onclick="closeModal('cart-modal')" class="text-gray-500 hover:text-black text-xl font-bold">&times;</button>
            </div>
            <div id="cart-items-container" class="mt-4 space-y-4">
              <!-- Cart items injected dynamically -->
            </div>
          </div>
          <div id="cart-summary-footer" class="border-t pt-4">
            <!-- Dynamic Cart Totals injected here -->
          </div>
        </div>
      </div>

      <!-- 2. CHECKOUT MODAL -->
      <div id="checkout-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
          <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <h3 class="font-bold text-lg"><i class="fa-solid fa-lock text-amber-400 mr-2"></i> Amazon Secure Checkout</h3>
            <button onclick="closeModal('checkout-modal')" class="text-gray-400 hover:text-white">&times;</button>
          </div>
          <form onsubmit="processPayment(event)" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Address</label>
              <input type="text" id="ship-address" placeholder="Flat / House No., Street, City, Pincode" required class="w-full border border-gray-300 rounded p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Select Payment Method</label>
              <select id="payment-method" class="w-full border border-gray-300 rounded p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Credit/Debit Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              </select>
            </div>
            <div id="checkout-price-summary" class="bg-gray-50 p-3 rounded text-xs space-y-1 border">
              <!-- Summary populated by script -->
            </div>
            <button type="submit" class="w-full btn-amazon-primary py-3 font-bold text-slate-900 shadow-md">
              Place Order & Pay
            </button>
          </form>
        </div>
      </div>

      <!-- 3. SELLER DASHBOARD MODAL -->
      <div id="seller-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
          <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <h3 class="font-bold text-lg text-amber-400"><i class="fa-solid fa-store mr-2"></i> Sell on Amazon Marketplace</h3>
            <button onclick="closeModal('seller-modal')" class="text-gray-400 hover:text-white">&times;</button>
          </div>
          <form onsubmit="addNewProduct(event)" class="p-6 space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Product Title</label>
              <input type="text" id="seller-name" placeholder="e.g. Wireless Bluetooth Speaker" required class="w-full border border-gray-300 rounded p-2 text-sm">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                <select id="seller-category" class="w-full border border-gray-300 rounded p-2 text-sm">
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Books">Books</option>
                  <option value="Home">Home</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹)</label>
                <input type="number" id="seller-price" placeholder="1999" required class="w-full border border-gray-300 rounded p-2 text-sm">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Original Price (₹)</label>
                <input type="number" id="seller-orig-price" placeholder="2999" required class="w-full border border-gray-300 rounded p-2 text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Emoji Icon</label>
                <input type="text" id="seller-img" placeholder="📻" required class="w-full border border-gray-300 rounded p-2 text-sm text-center">
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Seller / Business Name</label>
              <input type="text" id="seller-business" placeholder="e.g. Global Trade LLC" required class="w-full border border-gray-300 rounded p-2 text-sm">
            </div>
            <button type="submit" class="w-full btn-amazon py-2.5 font-bold text-slate-900 mt-2">
              List Product Live
            </button>
          </form>
        </div>
      </div>

      <!-- 4. ORDERS DASHBOARD MODAL -->
      <div id="orders-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <h3 class="font-bold text-lg"><i class="fa-solid fa-box text-amber-400 mr-2"></i> Your Orders & Purchase History</h3>
            <button onclick="closeModal('orders-modal')" class="text-gray-400 hover:text-white">&times;</button>
          </div>
          <div id="orders-list-container" class="p-6 overflow-y-auto space-y-4 flex-1">
            <!-- Order Cards Injected Here -->
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-slate-900 text-gray-400 text-xs text-center py-6 border-t border-gray-800 mt-auto">
        <p>© 2026 Amazon Demo Application. Built for Docker Containerization Portfolio.</p>
      </footer>

      <script>
        let allProducts = ${JSON.stringify(products)};
        let activeCart = ${JSON.stringify(cart)};
        let activeOrders = ${JSON.stringify(orders)};

        // Render products on page load
        window.onload = function() {
          renderCatalog(allProducts);
        };

        function renderCatalog(items) {
          const grid = document.getElementById('product-grid');
          document.getElementById('product-count-display').innerText = \`Showing \${items.length} items\`;

          if (items.length === 0) {
            grid.innerHTML = \`<div class="col-span-full text-center py-12 text-gray-500 font-medium">No products found matching your search.</div>\`;
            return;
          }

          grid.innerHTML = items.map(p => {
            const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
            return \`
              <div class="bg-white rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col justify-between border border-gray-100">
                <div>
                  <div class="bg-gray-50 rounded-lg p-6 text-center text-6xl mb-3">\${p.img}</div>
                  <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">\${p.category}</span>
                  <h3 class="font-bold text-slate-900 text-sm mt-1 line-clamp-2">\${p.name}</h3>
                  <div class="flex items-center gap-1 text-amber-500 text-xs mt-1">
                    <span>★ \${p.rating}</span>
                    <span class="text-gray-400">(\${p.reviews})</span>
                  </div>
                  <div class="flex items-baseline gap-2 mt-2">
                    <span class="text-lg font-extrabold text-slate-900">₹\${p.price.toLocaleString()}</span>
                    <span class="text-xs text-gray-400 line-through">₹\${p.originalPrice.toLocaleString()}</span>
                    <span class="text-xs font-bold text-red-600">\${discount}% OFF</span>
                  </div>
                  <p class="text-[11px] text-gray-500 mt-0.5">Sold by <span class="font-medium text-slate-700">\${p.seller}</span></p>
                </div>
                <div class="mt-4 space-y-2">
                  <button onclick="addToCart(\${p.id})" class="w-full btn-amazon py-2 text-xs font-bold text-slate-900 shadow-sm">
                    Add to Cart
                  </button>
                  <button onclick="buyNow(\${p.id})" class="w-full btn-amazon-primary py-2 text-xs font-bold text-slate-900 shadow-sm">
                    Buy Now
                  </button>
                </div>
              </div>
            \`;
          }).join('');
        }

        // Filtering logic
        function filterProducts() {
          const query = document.getElementById('search-input').value.toLowerCase();
          const category = document.getElementById('search-category').value;

          const filtered = allProducts.filter(p => {
            const matchesQuery = p.name.toLowerCase().includes(query);
            const matchesCat = category === 'All' || p.category === category;
            return matchesQuery && matchesCat;
          });

          renderCatalog(filtered);
        }

        function filterCategory(cat) {
          document.getElementById('search-category').value = cat;
          filterProducts();
        }

        // Cart Actions
        async function addToCart(productId) {
          const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          });
          const data = await res.json();
          activeCart = data.cart;
          updateCartBadge(data.totalCount);
        }

        async function buyNow(productId) {
          await addToCart(productId);
          openCartModal();
        }

        function updateCartBadge(count) {
          document.getElementById('cart-counter-badge').innerText = count;
        }

        async function updateQty(productId, delta) {
          const res = await fetch('/api/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, delta })
          });
          const data = await res.json();
          activeCart = data.cart;
          updateCartBadge(data.totalCount);
          renderCartItems();
        }

        // Render Cart Modal View
        function openCartModal() {
          renderCartItems();
          openModal('cart-modal');
        }

        function renderCartItems() {
          const container = document.getElementById('cart-items-container');
          const footer = document.getElementById('cart-summary-footer');

          if (activeCart.length === 0) {
            container.innerHTML = \`<div class="text-center py-10 text-gray-500">Your Amazon cart is empty.</div>\`;
            footer.innerHTML = '';
            return;
          }

          let subtotal = 0;
          container.innerHTML = activeCart.map(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            return \`
              <div class="flex items-center justify-between border-b pb-3">
                <div class="flex items-center gap-3">
                  <span class="text-3xl bg-gray-100 p-2 rounded">\${item.img}</span>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900 line-clamp-1">\${item.name}</h4>
                    <p class="text-xs font-semibold text-amber-600">₹\${item.price}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="updateQty(\${item.id}, -1)" class="w-6 h-6 bg-gray-200 rounded font-bold text-xs">-</button>
                  <span class="text-xs font-bold px-1">\${item.qty}</span>
                  <button onclick="updateQty(\${item.id}, 1)" class="w-6 h-6 bg-gray-200 rounded font-bold text-xs">+</button>
                </div>
              </div>
            \`;
          }).join('');

          const tax = Math.round(subtotal * 0.18);
          const shipping = subtotal > 1000 ? 0 : 99;
          const total = subtotal + tax + shipping;

          footer.innerHTML = \`
            <div class="space-y-1 text-xs mb-3 text-gray-600">
              <div class="flex justify-between"><span>Subtotal:</span><span class="font-bold text-slate-900">₹\${subtotal.toLocaleString()}</span></div>
              <div class="flex justify-between"><span>GST (18%):</span><span>₹\${tax.toLocaleString()}</span></div>
              <div class="flex justify-between"><span>Shipping:</span><span>\${shipping === 0 ? '<span class="text-green-600 font-bold">FREE Prime</span>' : '₹' + shipping}</span></div>
              <div class="flex justify-between text-sm font-extrabold text-slate-900 border-t pt-1"><span>Total:</span><span class="text-amber-600">₹\${total.toLocaleString()}</span></div>
            </div>
            <button onclick="openCheckoutModal(\${subtotal}, \${tax}, \${shipping}, \${total})" class="w-full btn-amazon-primary py-2.5 font-bold text-xs text-slate-900 shadow">
              Proceed to Buy (\${activeCart.reduce((a,b)=>a+b.qty,0)} items)
            </button>
          \`;
        }

        function openCheckoutModal(sub, tax, ship, total) {
          closeModal('cart-modal');
          document.getElementById('checkout-price-summary').innerHTML = \`
            <div class="flex justify-between"><span>Items Subtotal:</span><span>₹\${sub}</span></div>
            <div class="flex justify-between"><span>Taxes:</span><span>₹\${tax}</span></div>
            <div class="flex justify-between"><span>Delivery:</span><span>₹\${ship}</span></div>
            <div class="flex justify-between font-bold text-slate-900 border-t pt-1"><span>Order Total:</span><span>₹\${total}</span></div>
          \`;
          openModal('checkout-modal');
        }

        async function processPayment(e) {
          e.preventDefault();
          const address = document.getElementById('ship-address').value;
          const paymentMethod = document.getElementById('payment-method').value;

          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, paymentMethod })
          });
          const data = await res.json();

          if(data.success) {
            activeCart = [];
            activeOrders.unshift(data.order);
            updateCartBadge(0);
            closeModal('checkout-modal');
            alert('🎉 Order Placed Successfully! Order ID: ' + data.order.id);
            renderOrders();
            openModal('orders-modal');
          }
        }

        // Seller functionality
        async function addNewProduct(e) {
          e.preventDefault();
          const newP = {
            name: document.getElementById('seller-name').value,
            category: document.getElementById('seller-category').value,
            price: Number(document.getElementById('seller-price').value),
            originalPrice: Number(document.getElementById('seller-orig-price').value),
            img: document.getElementById('seller-img').value || '📦',
            seller: document.getElementById('seller-business').value
          };

          const res = await fetch('/api/seller/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newP)
          });
          const data = await res.json();
          allProducts = data.products;
          renderCatalog(allProducts);
          closeModal('seller-modal');
          alert('✅ Product published live to Amazon Store!');
        }

        // Orders view
        function renderOrders() {
          const container = document.getElementById('orders-list-container');
          if(activeOrders.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-6">No previous orders found.</p>';
            return;
          }

          container.innerHTML = activeOrders.map(o => \`
            <div class="border rounded-lg p-4 bg-gray-50 space-y-2">
              <div class="flex justify-between items-center text-xs border-b pb-2">
                <div>
                  <span class="font-bold text-slate-900">ORDER #\${o.id}</span>
                  <span class="text-gray-500 ml-2">\${o.date}</span>
                </div>
                <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">\${o.status}</span>
              </div>
              <div class="text-xs space-y-1">
                \${o.items.map(i => \`<div class="flex justify-between"><span>\${i.name} (x\${i.qty})</span><span class="font-semibold">₹\${i.price}</span></div>\`).join('')}
              </div>
              <div class="flex justify-between items-center pt-2 border-t text-xs font-bold text-slate-900">
                <span>Paid via \${o.paymentMethod}</span>
                <span class="text-amber-600">Total: ₹\${o.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          \`).join('');
        }

        // General Modal Helpers
        function openModal(id) {
          if(id === 'orders-modal') renderOrders();
          document.getElementById(id).classList.remove('hidden');
        }
        function closeModal(id) {
          document.getElementById(id).classList.add('hidden');
        }
      </script>
    </body>
    </html>
  `);
});


// Add item to cart
app.post('/api/cart/add', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === Number(productId));
  
  if (product) {
    const existing = cart.find(item => item.id === Number(productId));
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
  }
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  res.json({ success: true, cart, totalCount });
});

// Modify cart quantities
app.post('/api/cart/update', (req, res) => {
  const { productId, delta } = req.body;
  const itemIndex = cart.findIndex(item => item.id === Number(productId));

  if (itemIndex > -1) {
    cart[itemIndex].qty += delta;
    if (cart[itemIndex].qty <= 0) {
      cart.splice(itemIndex, 1);
    }
  }
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  res.json({ success: true, cart, totalCount });
});

// Publish seller product
app.post('/api/seller/add', (req, res) => {
  const { name, category, price, originalPrice, img, seller } = req.body;
  const newProduct = {
    id: Date.now(),
    name,
    category,
    price: Number(price),
    originalPrice: Number(originalPrice),
    img: img || '📦',
    rating: 5.0,
    reviews: 1,
    seller: seller || 'Independent Seller'
  };
  products.unshift(newProduct);
  res.json({ success: true, products });
});

// Process Order & Checkout
app.post('/api/checkout', (req, res) => {
  const { paymentMethod } = req.body;
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 1000 ? 0 : 99;
  const totalAmount = subtotal + tax + shipping;

  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString().split('T')[0],
    status: 'Processing',
    items: [...cart],
    totalAmount,
    paymentMethod
  };

  orders.unshift(newOrder);
  cart = []; // Reset active cart

  res.json({ success: true, order: newOrder });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Amazon Web App running on port ${PORT}`);
});
