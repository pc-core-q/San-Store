/* ==========================================================================
   whatsapp.js
   تنسيق العملة (دينار عراقي) + بناء روابط واتساب (click-to-chat) مع رسالة
   جاهزة تحتوي تفاصيل الطلب. رقم واتساب يُقرأ دائمًا من الإعدادات المخزّنة
   (Store.getSettings) وليس من نص ثابت، بحيث يتغير فور تعديله من لوحة الأدمن.
   ========================================================================== */

function formatPrice(amount) {
  const symbol = (Store.getSettings().currencySymbol) || "د.ع";
  const num = Number(amount) || 0;
  return num.toLocaleString("en-US") + " " + symbol;
}

function whatsappDigitsOnly(number) {
  return String(number || "").replace(/[^0-9]/g, "");
}

// رابط واتساب لمنتج واحد بالكمية المحددة
function buildProductWhatsAppLink(product, qty) {
  const quantity = Math.max(1, qty || 1);
  const total = product.price * quantity;
  const productUrl = location.origin + location.pathname.replace(/[^/]*$/, "") + "product.html?id=" + product.id;

  const lines = [
    "السلام عليكم، أريد طلب المنتج:",
    "اسم المنتج: " + product.name,
    "السعر: " + formatPrice(product.price),
    "الكمية: " + quantity,
    "المجموع: " + formatPrice(total),
    "رابط المنتج: " + productUrl
  ];

  return buildWhatsAppUrl(lines.join("\n"));
}

// رابط واتساب لجميع منتجات السلة برسالة واحدة
function buildCartWhatsAppLink(cartLines, products) {
  const rows = [];
  let total = 0;

  cartLines.forEach(function (line) {
    const product = products.find(function (p) { return p.id === line.productId; });
    if (!product) return;
    const subtotal = product.price * line.qty;
    total += subtotal;
    rows.push(
      "— " + product.name +
      " | الكمية: " + line.qty +
      " | السعر: " + formatPrice(product.price) +
      " | المجموع: " + formatPrice(subtotal)
    );
  });

  const lines = [
    "السلام عليكم، أريد طلب المنتجات التالية:",
    "",
    rows.join("\n"),
    "",
    "المجموع الكلي: " + formatPrice(total)
  ];

  return buildWhatsAppUrl(lines.join("\n"));
}

function buildWhatsAppUrl(message) {
  const number = whatsappDigitsOnly(Store.getSettings().whatsapp);
  return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
}

// يفتح واتساب لمنتج واحد، ويسجّل الطلب في سجل الطلبات الاسترشادي
function orderSingleProductViaWhatsApp(product, qty) {
  Store.logOrder({
    type: "single",
    items: [{ productId: product.id, name: product.name, qty: qty, price: product.price }],
    total: product.price * qty
  });
  window.open(buildProductWhatsAppLink(product, qty), "_blank");
}

// يفتح واتساب لكل محتويات السلة، ويسجّل الطلب، ثم يفرغ السلة
function orderCartViaWhatsApp() {
  const cart = Store.getCart();
  if (!cart.length) return;
  const products = Store.getProducts();

  const items = cart.map(function (line) {
    const p = products.find(function (pp) { return pp.id === line.productId; });
    return p ? { productId: p.id, name: p.name, qty: line.qty, price: p.price } : null;
  }).filter(Boolean);

  const total = items.reduce(function (sum, it) { return sum + it.price * it.qty; }, 0);

  Store.logOrder({ type: "cart", items: items, total: total });

  window.open(buildCartWhatsAppLink(cart, products), "_blank");
  Store.clearCart();
}
