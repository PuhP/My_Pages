document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "a0cd61c9-08ca-4666-adc5-cfa927d3e73b";
  const BASE_URL = "https://edu.std-900.ist.mospolytech.ru";

  const ORDERS_URL = `${BASE_URL}/labs/api/orders`;
  const DISHES_URL = `${BASE_URL}/labs/api/dishes`;

  const ordersContainer = document.getElementById("orders_container");
  const loadingEl = document.getElementById("orders_loading");
  const errorEl = document.getElementById("orders_error");
  const emptyEl = document.getElementById("orders_empty");

  const toastEl = document.getElementById("toast");

  const modalView = document.getElementById("modal_view");
  const viewBody = document.getElementById("view_body");

  const modalEdit = document.getElementById("modal_edit");
  const editForm = document.getElementById("edit_form");
  const editId = document.getElementById("edit_id");
  const editFullName = document.getElementById("edit_full_name");
  const editEmail = document.getElementById("edit_email");
  const editPhone = document.getElementById("edit_phone");
  const editAddress = document.getElementById("edit_delivery_address");
  const editType = document.getElementById("edit_delivery_type");
  const editTime = document.getElementById("edit_delivery_time");
  const editComment = document.getElementById("edit_comment");
  const btnSave = document.getElementById("btn_save");

  const modalDelete = document.getElementById("modal_delete");
  const deleteText = document.getElementById("delete_text");
  const btnDeleteYes = document.getElementById("btn_delete_yes");

  let dishesMap = new Map();
  let orders = [];
  let deleteTargetId = null;

  function withKey(url) {
    const u = new URL(url);
    u.searchParams.set("api_key", API_KEY);
    return u.toString();
  }

  function showToast(message, type = "ok") {
    toastEl.textContent = message;
    toastEl.style.display = "block";
    toastEl.style.border = type === "error"
      ? "2px solid rgb(231, 43, 43)"
      : "2px solid rgb(75, 39, 4)";
    setTimeout(() => (toastEl.style.display = "none"), 2600);
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  }

  function hideError() {
    errorEl.style.display = "none";
  }

  function openModal(el) { el.style.display = "flex"; }
  function closeModal(el) { el.style.display = "none"; }

  document.addEventListener("click", (e) => {
    const closeId = e.target?.getAttribute?.("data-close");
    if (closeId) closeModal(document.getElementById(closeId));

    if (e.target === modalView) closeModal(modalView);
    if (e.target === modalEdit) closeModal(modalEdit);
    if (e.target === modalDelete) closeModal(modalDelete);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(modalView);
      closeModal(modalEdit);
      closeModal(modalDelete);
    }
  });

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getOrderDishIds(order) {
    const keys = ["soup_id", "main_course_id", "salad_id", "drink_id", "dessert_id"];
    return keys.map((k) => order[k]).filter((v) => v !== null && v !== undefined && v !== "");
  }

  function orderCompositionText(order) {
    const ids = getOrderDishIds(order);
    const names = ids.map((id) => dishesMap.get(Number(id))?.name).filter(Boolean);
    return names.length ? names.join(", ") : "—";
  }

  // ✅ СКИДКА ПО МЕТКЕ [PROMO5] В comment
  function calcOrderCost(order) {
    const ids = getOrderDishIds(order);
    const base = ids.reduce((sum, id) => {
      const dish = dishesMap.get(Number(id));
      return sum + (dish?.price || 0);
    }, 0);

    const hasPromo = (order.comment || "").includes("[PROMO5]");
    const final = hasPromo ? Math.round(base * 0.95) : base;

    return { base, final, hasPromo };
  }

  function deliveryText(order) {
    if (order.delivery_type === "by_time" && order.delivery_time) return order.delivery_time;
    return "Как можно скорее (с 7:00 до 23:00)";
  }

  function renderOrders() {
    ordersContainer.innerHTML = "";

    if (!orders.length) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    orders.forEach((order, idx) => {
      const row = document.createElement("div");
      row.className = "orders-row";

      const composition = orderCompositionText(order);
      const cost = calcOrderCost(order);

      row.innerHTML = `
        <div>${idx + 1}</div>
        <div>${formatDate(order.created_at)}</div>
        <div>${composition}</div>
        <div>
          ${cost.hasPromo ? `<span style="text-decoration:line-through;opacity:.7">${cost.base} ₽</span><br>` : ""}
          <b>${cost.final} ₽</b>
          ${cost.hasPromo ? `<span style="opacity:.8"> (−5%)</span>` : ""}
        </div>
        <div>${deliveryText(order)}</div>
        <div class="orders-actions">
          <button class="icon-btn" data-action="view" data-id="${order.id}">Подробнее</button>
          <button class="icon-btn" data-action="edit" data-id="${order.id}">Редактирование</button>
          <button class="icon-btn" data-action="delete" data-id="${order.id}">Удаление</button>
        </div>
      `;
      ordersContainer.appendChild(row);
    });
  }

  async function apiJson(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const message = (data && data.error) ? data.error : `HTTP ${res.status}`;
      throw new Error(message);
    }
    return data;
  }

  async function loadDishes() {
    const data = await apiJson(withKey(DISHES_URL));
    dishesMap = new Map(data.map((d) => [Number(d.id), d]));
  }

  async function loadOrders() {
    const data = await apiJson(withKey(ORDERS_URL));
    orders = (data || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async function refresh() {
    loadingEl.style.display = "block";
    hideError();
    try {
      await loadDishes();
      await loadOrders();
      renderOrders();
    } catch (e) {
      showError(`Ошибка: ${e.message}`);
    } finally {
      loadingEl.style.display = "none";
    }
  }

  async function openView(orderId) {
    const order = orders.find((o) => Number(o.id) === Number(orderId));
    if (!order) return;

    const comp = orderCompositionText(order);
    const cost = calcOrderCost(order);

    viewBody.innerHTML = `
      <p><b>ID:</b> ${order.id}</p>
      <p><b>Дата:</b> ${formatDate(order.created_at)}</p>
      <p><b>Состав:</b> ${comp}</p>
      <p><b>Стоимость:</b> ${cost.final} ₽ ${cost.hasPromo ? "(−5%)" : ""}</p>
      ${cost.hasPromo ? `<p style="opacity:.8"><b>Без скидки:</b> ${cost.base} ₽</p>` : ""}
      <hr/>
      <p><b>full_name:</b> ${order.full_name || "—"}</p>
      <p><b>email:</b> ${order.email || "—"}</p>
      <p><b>phone:</b> ${order.phone || "—"}</p>
      <p><b>delivery_address:</b> ${order.delivery_address || "—"}</p>
      <p><b>delivery_type:</b> ${order.delivery_type || "—"}</p>
      <p><b>delivery_time:</b> ${order.delivery_time || "—"}</p>
      <p><b>comment:</b> ${order.comment || "—"}</p>
      <hr/>
      <p style="opacity:.85"><b>updated_at:</b> ${order.updated_at ? formatDate(order.updated_at) : "—"}</p>
    `;

    openModal(modalView);
  }

  function syncEditTimeState() {
    const type = editType.value;
    if (type === "by_time") {
      editTime.disabled = false;
      editTime.required = true;
    } else {
      editTime.disabled = true;
      editTime.required = false;
      editTime.value = "";
    }
  }

  function openEdit(orderId) {
    const order = orders.find((o) => Number(o.id) === Number(orderId));
    if (!order) return;

    editId.value = order.id;
    editFullName.value = order.full_name || "";
    editEmail.value = order.email || "";
    editPhone.value = order.phone || "";
    editAddress.value = order.delivery_address || "";
    editType.value = order.delivery_type || "now";
    editTime.value = order.delivery_time || "";
    editComment.value = order.comment || "";

    syncEditTimeState();
    openModal(modalEdit);
  }

  async function saveEdit(e) {
    e.preventDefault();

    const id = editId.value;
    const payload = {
      full_name: editFullName.value.trim(),
      email: editEmail.value.trim(),
      phone: editPhone.value.trim(),
      delivery_address: editAddress.value.trim(),
      delivery_type: editType.value,
      comment: editComment.value.trim(),
    };

    if (editType.value === "by_time") payload.delivery_time = editTime.value;
    else payload.delivery_time = null;

    btnSave.disabled = true;
    btnSave.textContent = "Сохранение…";

    try {
      const url = withKey(`${ORDERS_URL}/${id}`);
      const updated = await apiJson(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      orders = orders
        .map((o) => (Number(o.id) === Number(id) ? { ...o, ...updated } : o))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      renderOrders();
      closeModal(modalEdit);
      showToast("Заказ успешно изменён");
    } catch (err) {
      showToast(`Ошибка: ${err.message}`, "error");
    } finally {
      btnSave.disabled = false;
      btnSave.textContent = "Сохранить";
    }
  }

  function openDelete(orderId) {
    deleteTargetId = Number(orderId);
    deleteText.innerHTML = `Вы уверены, что хотите удалить заказ <b>#${deleteTargetId}</b>?`;
    openModal(modalDelete);
  }

  async function doDelete() {
    if (!deleteTargetId) return;

    btnDeleteYes.disabled = true;
    btnDeleteYes.textContent = "Удаление…";

    try {
      const url = withKey(`${ORDERS_URL}/${deleteTargetId}`);
      await apiJson(url, { method: "DELETE" });

      orders = orders.filter((o) => Number(o.id) !== deleteTargetId);
      renderOrders();

      closeModal(modalDelete);
      showToast("Заказ успешно удалён");
    } catch (err) {
      showToast(`Ошибка: ${err.message}`, "error");
    } finally {
      btnDeleteYes.disabled = false;
      btnDeleteYes.textContent = "Да";
      deleteTargetId = null;
    }
  }

  ordersContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "view") openView(id);
    if (action === "edit") openEdit(id);
    if (action === "delete") openDelete(id);
  });

  editType.addEventListener("change", syncEditTimeState);
  editForm.addEventListener("submit", saveEdit);
  btnDeleteYes.addEventListener("click", doDelete);

  refresh();
});
