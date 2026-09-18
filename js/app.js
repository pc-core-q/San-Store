/* ==========================================================================
   app.js
   منطق مشترك بين كل صفحات المتجر: رسم الهيدر والفوتر ديناميكيًا من الإعدادات
   المخزّنة، القائمة على الجوال، عداد السلة، ورسائل التوست. يجب تحميله بعد
   config.js + icons.js + store.js + whatsapp.js في كل صفحة.
   ========================================================================== */

const NAV_LINKS = [
  { href: "index.html", label: "الرئيسية", key: "home" },
  { href: "products.html", label: "المنتجات", key: "products" },
  { href: "products.html#categories", label: "الأقسام", key: "categories" },
  { href: "about.html", label: "من نحن", key: "about" },
  { href: "contact.html", label: "تواصل معنا", key: "contact" }
];

function renderHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const active = mount.dataset.active || "";
  const settings = Store.getSettings();

  const navHtml = NAV_LINKS.map(function (link) {
    const isActive = link.key === active ? " active" : "";
    return '<a href="' + link.href + '" class="' + isActive.trim() + '">' + link.label + "</a>";
  }).join("");

  mount.innerHTML =
    '<header class="site-header">' +
      '<div class="container header-inner">' +
        '<a href="index.html" class="brand">' +
          '<img src="assets/logo/logo.png" alt="' + settings.storeName + '">' +
          '<span class="brand-name">' + settings.storeName + '<span>' + settings.storeTagline + "</span></span>" +
        "</a>" +
        '<nav class="main-nav" id="mainNav">' + navHtml + "</nav>" +
        '<div class="header-actions">' +
          '<a href="cart.html" class="btn-icon cart-link" aria-label="السلة" title="السلة">' +
            iconSvg("cart") +
            '<span class="cart-count" id="cartCount">0</span>' +
          "</a>" +
          '<a href="login.html" class="btn-icon admin-link" aria-label="دخول الأدمن" title="دخول الأدمن">' + iconSvg("lock") + "</a>" +
          '<button class="btn-icon nav-toggle" id="navToggle" aria-label="القائمة">' + iconSvg("menu") + "</button>" +
        "</div>" +
      "</div>" +
    "</header>";

  fixRelativePaths(mount);
  initMobileNav();
}

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  const settings = Store.getSettings();
  const categories = Store.getCategories().slice(0, 5);

  const catLinks = categories.map(function (c) {
    return '<li><a href="products.html?cat=' + c.id + '">' + c.name + "</a></li>";
  }).join("");

  mount.innerHTML =
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<div class="footer-brand"><img src="assets/logo/logo.png" alt="' + settings.storeName + '"><strong>' + settings.storeName + "</strong></div>" +
            "<p>" + settings.storeDescription + "</p>" +
          "</div>" +
          '<div><h4>روابط سريعة</h4><ul>' +
            '<li><a href="index.html">الرئيسية</a></li>' +
            '<li><a href="products.html">المنتجات</a></li>' +
            '<li><a href="about.html">من نحن</a></li>' +
            '<li><a href="contact.html">تواصل معنا</a></li>' +
          "</ul></div>" +
          '<div><h4>الأقسام</h4><ul>' + catLinks + "</ul></div>" +
          '<div><h4>تواصل معنا</h4><ul>' +
            '<li><a href="tel:' + settings.phone + '">' + settings.phone + "</a></li>" +
            '<li><a href="https://wa.me/' + whatsappDigitsOnly(settings.whatsapp) + '" target="_blank" rel="noopener">واتساب</a></li>' +
            '<li><a href="' + settings.instagram + '" target="_blank" rel="noopener">انستغرام</a></li>' +
            "<li>" + settings.address + "</li>" +
          "</ul></div>" +
        "</div>" +
        '<div class="footer-bottom">' +
        "<span>&copy; " + new Date().getFullYear() + " " + settings.storeName + " - جميع الحقوق محفوظة. | تطوير: <a href='رابط_انستغرام_هنا' target='_blank' style='color: #a5d6a7; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;'><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 448 512' fill='currentColor'><path d='M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z'/></svg>م.أمير</a></span>" +
          '<a href="login.html">لوحة التحكم</a>' +
        "</div>" +
      "</div>" +
    "</footer>";
}

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
    toggle.innerHTML = nav.classList.contains("open") ? iconSvg("close") : iconSvg("menu");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.innerHTML = iconSvg("menu");
    });
  });
}

function updateCartBadge() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const count = Store.cartCount();
  el.textContent = count;
  el.style.display = count > 0 ? "flex" : "none";
}

function showToast(message) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () { toast.classList.remove("show"); }, 2400);
}

// بعض الصفحات الفرعية (لا يوجد فرعيات فعلية هنا لكن الدالة تبقى جاهزة
// إن أضيفت مجلدات لاحقًا) — تُبقي الروابط كما هي حاليًا لأن كل الصفحات
// في نفس المستوى الجذري.
function fixRelativePaths(scope) { /* no-op: flat file structure */ }

document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
  renderFooter();
  updateCartBadge();
});
document.addEventListener("cart:updated", updateCartBadge);
