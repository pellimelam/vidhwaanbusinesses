"use strict";

/*
 * Vidhwaan Business Apps
 * Builder Application
 *
 * Step 8
 * File: business/app.js
 *
 * The frontend collects and validates builder data.
 * Payment/subscription authorization is performed by
 * the Cloudflare Business Worker.
 */

const CONFIG = Object.freeze({
  WORKER_URL: "",
  TEMPLATE_ID: "ECM",
  MAX_CATEGORIES: 50,
  MAX_ITEMS_PER_CATEGORY: 500,
  MAX_TOTAL_ITEMS: 5000,
  MAX_TEXT_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_PHONE_LENGTH: 30,
  MAX_EMAIL_LENGTH: 254,
  MAX_WHATSAPP_LENGTH: 30,
  MAX_LOGO_URL_LENGTH: 2048,
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
  REQUEST_TIMEOUT_MS: 30000
});

const state = {
  categories: [],
  editingCategoryId: null,
  editingItemId: null,
  selectedCategoryId: null,
  location: {
    verified: false,
    latitude: null,
    longitude: null,
    verifiedAt: null
  },
  publishing: false
};

const DOM = {};

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  cacheDom();
  bindEvents();
  initializeBuilder();
}

function cacheDom() {
  DOM.form = document.getElementById("businessForm");

  DOM.businessName = document.getElementById("businessName");
  DOM.tagline = document.getElementById("tagline");
  DOM.address = document.getElementById("address");
  DOM.mobile = document.getElementById("mobile");
  DOM.email = document.getElementById("email");
  DOM.whatsapp = document.getElementById("whatsapp");
  DOM.logoUrl = document.getElementById("logoUrl");
  DOM.subscriptionId = document.getElementById("subscriptionId");

  DOM.categoryName = document.getElementById("categoryName");
  DOM.addCategoryButton = document.getElementById("addCategory");
  DOM.categoryList = document.getElementById("categoryList");

  DOM.itemCategory = document.getElementById("itemCategory");
  DOM.itemName = document.getElementById("itemName");
  DOM.itemPrice = document.getElementById("itemPrice");
  DOM.itemQuantity = document.getElementById("itemQuantity");
  DOM.itemUnit = document.getElementById("itemUnit");
  DOM.itemDescription = document.getElementById("itemDescription");
  DOM.itemYoutube = document.getElementById("itemYoutube");
  DOM.addItemButton = document.getElementById("addItem");
  DOM.itemList = document.getElementById("itemList");

  DOM.verifyLocationButton =
    document.getElementById("verifyLocation");

  DOM.locationStatus =
    document.getElementById("locationStatus");

  DOM.publishButton =
    document.getElementById("publishButton");

  DOM.resetButton =
    document.getElementById("resetButton");

  DOM.loadingOverlay =
    document.getElementById("loadingOverlay");

  DOM.loadingMessage =
    document.getElementById("loadingMessage");

  DOM.errorState =
    document.getElementById("errorState");

  DOM.errorMessage =
    document.getElementById("errorMessage");

  DOM.successState =
    document.getElementById("successState");

  DOM.successDescription =
    document.getElementById("successDescription");

  DOM.successUrl =
    document.getElementById("successUrl");

  DOM.successOpenButton =
    document.getElementById("successOpenButton");

  DOM.successCloseButton =
    document.getElementById("successCloseButton");

  DOM.toastContainer =
    document.getElementById("toastContainer");
}

function bindEvents() {
  if (DOM.form) {
    DOM.form.addEventListener("submit", handleSubmit);
  }

  if (DOM.addCategoryButton) {
    DOM.addCategoryButton.addEventListener(
      "click",
      handleAddCategory
    );
  }

  if (DOM.addItemButton) {
    DOM.addItemButton.addEventListener(
      "click",
      handleAddItem
    );
  }

  if (DOM.verifyLocationButton) {
    DOM.verifyLocationButton.addEventListener(
      "click",
      verifyBusinessLocation
    );
  }

  if (DOM.resetButton) {
    DOM.resetButton.addEventListener(
      "click",
      resetBuilder
    );
  }

  if (DOM.successCloseButton) {
    DOM.successCloseButton.addEventListener(
      "click",
      hideSuccess
    );
  }

  if (DOM.successOpenButton) {
    DOM.successOpenButton.addEventListener(
      "click",
      openPublishedApp
    );
  }

  if (DOM.categoryList) {
    DOM.categoryList.addEventListener(
      "click",
      handleCategoryListClick
    );
  }

  if (DOM.itemList) {
    DOM.itemList.addEventListener(
      "click",
      handleItemListClick
    );
  }

  if (DOM.itemCategory) {
    DOM.itemCategory.addEventListener(
      "change",
      handleItemCategoryChange
    );
  }
}

function initializeBuilder() {
  renderCategories();
  renderItems();
  updateCategorySelect();
  updateLocationStatus();
  hideError();
  hideSuccess();
}

function handleAddCategory() {
  const name = normalizeText(
    DOM.categoryName ? DOM.categoryName.value : "",
    CONFIG.MAX_TEXT_LENGTH
  );

  if (!name) {
    showToast("Please enter a category name.", "error");
    focusElement(DOM.categoryName);
    return;
  }

  if (state.categories.length >= CONFIG.MAX_CATEGORIES) {
    showToast(
      `Maximum ${CONFIG.MAX_CATEGORIES} categories are allowed.`,
      "error"
    );
    return;
  }

  const duplicate = state.categories.some(
    (category) =>
      category.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    showToast(
      "A category with this name already exists.",
      "error"
    );
    return;
  }

  state.categories.push({
    id: createId("cat"),
    name,
    items: []
  });

  if (DOM.categoryName) {
    DOM.categoryName.value = "";
  }

  renderCategories();
  updateCategorySelect();
  showToast("Category added.", "success");
}

function handleAddItem() {
  const categoryId = normalizeText(
    DOM.itemCategory ? DOM.itemCategory.value : "",
    100
  );

  const name = normalizeText(
    DOM.itemName ? DOM.itemName.value : "",
    CONFIG.MAX_TEXT_LENGTH
  );

  const price = parsePositiveNumber(
    DOM.itemPrice ? DOM.itemPrice.value : ""
  );

  const quantity = parseNonNegativeNumber(
    DOM.itemQuantity ? DOM.itemQuantity.value : ""
  );

  const unit = normalizeText(
    DOM.itemUnit ? DOM.itemUnit.value : "",
    100
  );

  const description = normalizeText(
    DOM.itemDescription
      ? DOM.itemDescription.value
      : "",
    CONFIG.MAX_DESCRIPTION_LENGTH
  );

  const youtubeUrl = normalizeText(
    DOM.itemYoutube ? DOM.itemYoutube.value : "",
    CONFIG.MAX_LOGO_URL_LENGTH
  );

  if (!categoryId) {
    showToast(
      "Please select a category.",
      "error"
    );
    focusElement(DOM.itemCategory);
    return;
  }

  if (!name) {
    showToast(
      "Please enter an item name.",
      "error"
    );
    focusElement(DOM.itemName);
    return;
  }

  if (price === null) {
    showToast(
      "Please enter a valid item price.",
      "error"
    );
    focusElement(DOM.itemPrice);
    return;
  }

  if (quantity === null) {
    showToast(
      "Please enter a valid quantity.",
      "error"
    );
    focusElement(DOM.itemQuantity);
    return;
  }

  if (!unit) {
    showToast(
      "Please enter the item unit.",
      "error"
    );
    focusElement(DOM.itemUnit);
    return;
  }

  const category = state.categories.find(
    (entry) => entry.id === categoryId
  );

  if (!category) {
    showToast(
      "Selected category was not found.",
      "error"
    );
    return;
  }

  if (
    state.categories.reduce(
      (total, entry) => total + entry.items.length,
      0
    ) >= CONFIG.MAX_TOTAL_ITEMS
  ) {
    showToast(
      `Maximum ${CONFIG.MAX_TOTAL_ITEMS} items are allowed.`,
      "error"
    );
    return;
  }

  if (
    category.items.length >=
    CONFIG.MAX_ITEMS_PER_CATEGORY
  ) {
    showToast(
      `Maximum ${CONFIG.MAX_ITEMS_PER_CATEGORY} items are allowed in one category.`,
      "error"
    );
    return;
  }

  if (youtubeUrl && !isValidYoutubeUrl(youtubeUrl)) {
    showToast(
      "Please enter a valid YouTube or YouTube Shorts URL.",
      "error"
    );
    focusElement(DOM.itemYoutube);
    return;
  }

  const item = {
    id: createId("item"),
    name,
    price,
    quantity,
    unit,
    description,
    youtubeUrl
  };

  category.items.push(item);

  clearItemForm();

  renderItems();
  updateCategorySelect();

  showToast(
    "Item added.",
    "success"
  );
}

function handleCategoryListClick(event) {
  const button = event.target.closest(
    "[data-category-action]"
  );

  if (!button) {
    return;
  }

  const categoryId =
    button.dataset.categoryId || "";

  const action =
    button.dataset.categoryAction || "";

  if (action === "delete") {
    deleteCategory(categoryId);
    return;
  }

  if (action === "edit") {
    editCategory(categoryId);
    return;
  }

  if (action === "select") {
    state.selectedCategoryId = categoryId;

    if (DOM.itemCategory) {
      DOM.itemCategory.value = categoryId;
    }

    renderCategories();
    updateCategorySelect();
  }
}

function handleItemListClick(event) {
  const button = event.target.closest(
    "[data-item-action]"
  );

  if (!button) {
    return;
  }

  const categoryId =
    button.dataset.categoryId || "";

  const itemId =
    button.dataset.itemId || "";

  const action =
    button.dataset.itemAction || "";

  if (action === "delete") {
    deleteItem(categoryId, itemId);
    return;
  }

  if (action === "edit") {
    editItem(categoryId, itemId);
  }
}

function handleItemCategoryChange() {
  if (!DOM.itemCategory) {
    return;
  }

  state.selectedCategoryId =
    DOM.itemCategory.value || null;

  renderCategories();
}

function editCategory(categoryId) {
  const category = state.categories.find(
    (entry) => entry.id === categoryId
  );

  if (!category || !DOM.categoryName) {
    return;
  }

  DOM.categoryName.value = category.name;
  state.editingCategoryId = categoryId;

  DOM.categoryName.focus();

  if (DOM.addCategoryButton) {
    DOM.addCategoryButton.textContent =
      "Update Category";
  }
}

function deleteCategory(categoryId) {
  const category = state.categories.find(
    (entry) => entry.id === categoryId
  );

  if (!category) {
    return;
  }

  if (
    category.items.length > 0 &&
    !window.confirm(
      `Delete "${category.name}" and all items inside it?`
    )
  ) {
    return;
  }

  state.categories = state.categories.filter(
    (entry) => entry.id !== categoryId
  );

  if (state.selectedCategoryId === categoryId) {
    state.selectedCategoryId = null;
  }

  renderCategories();
  renderItems();
  updateCategorySelect();

  showToast(
    "Category deleted.",
    "success"
  );
}

function editItem(categoryId, itemId) {
  const category = state.categories.find(
    (entry) => entry.id === categoryId
  );

  if (!category) {
    return;
  }

  const item = category.items.find(
    (entry) => entry.id === itemId
  );

  if (!item) {
    return;
  }

  if (DOM.itemCategory) {
    DOM.itemCategory.value = categoryId;
  }

  if (DOM.itemName) {
    DOM.itemName.value = item.name;
  }

  if (DOM.itemPrice) {
    DOM.itemPrice.value = item.price;
  }

  if (DOM.itemQuantity) {
    DOM.itemQuantity.value = item.quantity;
  }

  if (DOM.itemUnit) {
    DOM.itemUnit.value = item.unit;
  }

  if (DOM.itemDescription) {
    DOM.itemDescription.value =
      item.description || "";
  }

  if (DOM.itemYoutube) {
    DOM.itemYoutube.value =
      item.youtubeUrl || "";
  }

  state.editingItemId = itemId;

  if (DOM.addItemButton) {
    DOM.addItemButton.textContent =
      "Update Item";
  }

  focusElement(DOM.itemName);
}

function deleteItem(categoryId, itemId) {
  const category = state.categories.find(
    (entry) => entry.id === categoryId
  );

  if (!category) {
    return;
  }

  category.items = category.items.filter(
    (item) => item.id !== itemId
  );

  renderItems();

  showToast(
    "Item deleted.",
    "success"
  );
}

function renderCategories() {
  if (!DOM.categoryList) {
    return;
  }

  DOM.categoryList.replaceChildren();

  if (state.categories.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No categories added yet.";
    DOM.categoryList.appendChild(empty);
    return;
  }

  state.categories.forEach((category) => {
    const wrapper = document.createElement("div");
    wrapper.className = "category-builder-card";

    if (state.selectedCategoryId === category.id) {
      wrapper.classList.add("is-selected");
    }

    const header = document.createElement("div");
    header.className = "category-builder-header";

    const title = document.createElement("div");
    title.className = "category-builder-title";
    title.textContent = category.name;

    const count = document.createElement("span");
    count.className = "category-item-count";
    count.textContent =
      `${category.items.length} item${
        category.items.length === 1
          ? ""
          : "s"
      }`;

    const actions = document.createElement("div");
    actions.className = "category-builder-actions";

    actions.appendChild(
      createActionButton(
        "Select",
        "select",
        category.id
      )
    );

    actions.appendChild(
      createActionButton(
        "Edit",
        "edit",
        category.id
      )
    );

    actions.appendChild(
      createActionButton(
        "Delete",
        "delete",
        category.id
      )
    );

    header.appendChild(title);
    header.appendChild(count);
    header.appendChild(actions);

    wrapper.appendChild(header);

    DOM.categoryList.appendChild(wrapper);
  });
}

function renderItems() {
  if (!DOM.itemList) {
    return;
  }

  DOM.itemList.replaceChildren();

  const totalItems = state.categories.reduce(
    (total, category) =>
      total + category.items.length,
    0
  );

  if (totalItems === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No items added yet.";
    DOM.itemList.appendChild(empty);
    return;
  }

  state.categories.forEach((category) => {
    category.items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "item-builder-card";

      const content = document.createElement("div");
      content.className = "item-builder-content";

      const name = document.createElement("div");
      name.className = "item-builder-name";
      name.textContent = item.name;

      const meta = document.createElement("div");
      meta.className = "item-builder-meta";
      meta.textContent =
        `${category.name} · ₹${formatNumber(
          item.price
        )} · ${formatNumber(
          item.quantity
        )} ${item.unit}`;

      content.appendChild(name);
      content.appendChild(meta);

      if (item.description) {
        const description =
          document.createElement("div");

        description.className =
          "item-builder-description";

        description.textContent =
          item.description;

        content.appendChild(description);
      }

      if (item.youtubeUrl) {
        const video = document.createElement("div");
        video.className = "item-builder-video";
        video.textContent =
          "YouTube video attached";
        content.appendChild(video);
      }

      const actions = document.createElement("div");
      actions.className =
        "item-builder-actions";

      const editButton =
        document.createElement("button");

      editButton.type = "button";
      editButton.dataset.itemAction = "edit";
      editButton.dataset.categoryId =
        category.id;
      editButton.dataset.itemId =
        item.id;
      editButton.textContent = "Edit";

      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.dataset.itemAction =
        "delete";
      deleteButton.dataset.categoryId =
        category.id;
      deleteButton.dataset.itemId =
        item.id;
      deleteButton.textContent = "Delete";

      actions.appendChild(editButton);
      actions.appendChild(deleteButton);

      wrapper.appendChild(content);
      wrapper.appendChild(actions);

      DOM.itemList.appendChild(wrapper);
    });
  });
}

function updateCategorySelect() {
  if (!DOM.itemCategory) {
    return;
  }

  const currentValue =
    DOM.itemCategory.value;

  DOM.itemCategory.replaceChildren();

  const placeholder =
    document.createElement("option");

  placeholder.value = "";
  placeholder.textContent =
    "Select category";

  DOM.itemCategory.appendChild(
    placeholder
  );

  state.categories.forEach((category) => {
    const option =
      document.createElement("option");

    option.value = category.id;
    option.textContent = category.name;

    DOM.itemCategory.appendChild(option);
  });

  if (
    state.categories.some(
      (category) =>
        category.id === currentValue
    )
  ) {
    DOM.itemCategory.value =
      currentValue;
  } else if (
    state.selectedCategoryId &&
    state.categories.some(
      (category) =>
        category.id ===
        state.selectedCategoryId
    )
  ) {
    DOM.itemCategory.value =
      state.selectedCategoryId;
  }
}

async function verifyBusinessLocation() {
  if (!navigator.geolocation) {
    showToast(
      "Location services are not supported by this browser.",
      "error"
    );
    return;
  }

  setButtonBusy(
    DOM.verifyLocationButton,
    true,
    "Verifying..."
  );

  updateLocationStatus(
    "Requesting your current location..."
  );

  try {
    const position =
      await getCurrentPosition();

    const latitude =
      Number(position.coords.latitude);

    const longitude =
      Number(position.coords.longitude);

    const accuracy =
      Number(position.coords.accuracy);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error(
        "The browser returned an invalid location."
      );
    }

    if (
      latitude < CONFIG.MIN_LATITUDE ||
      latitude > CONFIG.MAX_LATITUDE ||
      longitude < CONFIG.MIN_LONGITUDE ||
      longitude > CONFIG.MAX_LONGITUDE
    ) {
      throw new Error(
        "The returned coordinates are outside the valid geographic range."
      );
    }

    state.location = {
      verified: true,
      latitude,
      longitude,
      verifiedAt:
        new Date().toISOString()
    };

    updateLocationStatus(
      accuracy > 100
        ? `Location verified. Accuracy: approximately ${Math.round(
            accuracy
          )} metres.`
        : `Location verified. Accuracy: approximately ${Math.round(
            accuracy
          )} metres.`,
      true
    );

    showToast(
      "Business location verified.",
      "success"
    );
  } catch (error) {
    state.location = {
      verified: false,
      latitude: null,
      longitude: null,
      verifiedAt: null
    };

    updateLocationStatus(
      getErrorMessage(error)
    );

    showToast(
      getErrorMessage(error),
      "error"
    );
  } finally {
    setButtonBusy(
      DOM.verifyLocationButton,
      false
    );
  }
}

function getCurrentPosition() {
  return new Promise(
    (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    }
  );
}

async function handleSubmit(event) {
  event.preventDefault();

  if (state.publishing) {
    return;
  }

  hideError();
  hideSuccess();

  const validation =
    validateBuilder();

  if (!validation.valid) {
    showError(
      validation.message
    );

    showToast(
      validation.message,
      "error"
    );

    if (validation.element) {
      focusElement(
        validation.element
      );
    }

    return;
  }

  const payload =
    buildPublishPayload();

  try {
    state.publishing = true;

    setButtonBusy(
      DOM.publishButton,
      true,
      "Publishing..."
    );

    showLoading(
      "Verifying subscription and publishing your business app..."
    );

    const result =
      await publishBusiness(payload);

    hideLoading();

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result &&
        result.message
          ? result.message
          : "The business app could not be published."
      );
    }

    showSuccess(result);

  } catch (error) {
    hideLoading();

    const message =
      getErrorMessage(error);

    showError(message);
    showToast(
      message,
      "error"
    );
  } finally {
    state.publishing = false;

    setButtonBusy(
      DOM.publishButton,
      false
    );
  }
}

function validateBuilder() {
  const businessName =
    normalizeText(
      DOM.businessName
        ? DOM.businessName.value
        : "",
      CONFIG.MAX_TEXT_LENGTH
    );

  const tagline =
    normalizeText(
      DOM.tagline
        ? DOM.tagline.value
        : "",
      CONFIG.MAX_TEXT_LENGTH
    );

  const address =
    normalizeText(
      DOM.address
        ? DOM.address.value
        : "",
      CONFIG.MAX_TEXT_LENGTH
    );

  const mobile =
    normalizeText(
      DOM.mobile
        ? DOM.mobile.value
        : "",
      CONFIG.MAX_PHONE_LENGTH
    );

  const email =
    normalizeText(
      DOM.email
        ? DOM.email.value
        : "",
      CONFIG.MAX_EMAIL_LENGTH
    );

  const whatsapp =
    normalizeText(
      DOM.whatsapp
        ? DOM.whatsapp.value
        : "",
      CONFIG.MAX_WHATSAPP_LENGTH
    );

  const logoUrl =
    normalizeText(
      DOM.logoUrl
        ? DOM.logoUrl.value
        : "",
      CONFIG.MAX_LOGO_URL_LENGTH
    );

  const subscriptionId =
    normalizeText(
      DOM.subscriptionId
        ? DOM.subscriptionId.value
        : "",
      200
    );

  if (!businessName) {
    return invalid(
      "Please enter the business name.",
      DOM.businessName
    );
  }

  if (!tagline) {
    return invalid(
      "Please enter the business tagline.",
      DOM.tagline
    );
  }

  if (!address) {
    return invalid(
      "Please enter the business address.",
      DOM.address
    );
  }

  if (!mobile) {
    return invalid(
      "Please enter the business mobile number.",
      DOM.mobile
    );
  }

  if (!email) {
    return invalid(
      "Please enter the business email address.",
      DOM.email
    );
  }

  if (!isValidEmail(email)) {
    return invalid(
      "Please enter a valid email address.",
      DOM.email
    );
  }

  if (!whatsapp) {
    return invalid(
      "Please enter the business WhatsApp number.",
      DOM.whatsapp
    );
  }

  if (!logoUrl) {
    return invalid(
      "Please enter the public logo URL.",
      DOM.logoUrl
    );
  }

  if (!isValidHttpsUrl(logoUrl)) {
    return invalid(
      "Logo URL must be a valid HTTPS URL.",
      DOM.logoUrl
    );
  }

  if (!subscriptionId) {
    return invalid(
      "Please enter your Subscription ID.",
      DOM.subscriptionId
    );
  }

  if (
    !state.location.verified ||
    !Number.isFinite(
      state.location.latitude
    ) ||
    !Number.isFinite(
      state.location.longitude
    )
  ) {
    return invalid(
      "Please verify the business location before publishing.",
      DOM.verifyLocationButton
    );
  }

  if (state.categories.length === 0) {
    return invalid(
      "Please add at least one category.",
      DOM.categoryName
    );
  }

  const totalItems =
    state.categories.reduce(
      (total, category) =>
        total + category.items.length,
      0
    );

  if (totalItems === 0) {
    return invalid(
      "Please add at least one item.",
      DOM.itemName
    );
  }

  for (
    const category of state.categories
  ) {
    if (!category.name) {
      return invalid(
        "Every category must have a name.",
        DOM.categoryName
      );
    }

    for (
      const item of category.items
    ) {
      if (!item.name) {
        return invalid(
          "Every item must have a name.",
          DOM.itemName
        );
      }

      if (
        !Number.isFinite(item.price) ||
        item.price < 0
      ) {
        return invalid(
          "Every item must have a valid price.",
          DOM.itemPrice
        );
      }

      if (
        !Number.isFinite(item.quantity) ||
        item.quantity < 0
      ) {
        return invalid(
          "Every item must have a valid quantity.",
          DOM.itemQuantity
        );
      }

      if (!item.unit) {
        return invalid(
          "Every item must have a unit.",
          DOM.itemUnit
        );
      }

      if (
        item.youtubeUrl &&
        !isValidYoutubeUrl(
          item.youtubeUrl
        )
      ) {
        return invalid(
          "Every YouTube URL must be valid.",
          DOM.itemYoutube
        );
      }
    }
  }

  return {
    valid: true,
    message: ""
  };
}

function buildPublishPayload() {
  return {
    template: CONFIG.TEMPLATE_ID,

    subscriptionId:
      normalizeText(
        DOM.subscriptionId
          ? DOM.subscriptionId.value
          : "",
        200
      ),

    business: {
      name: normalizeText(
        DOM.businessName
          ? DOM.businessName.value
          : "",
        CONFIG.MAX_TEXT_LENGTH
      ),

      tagline: normalizeText(
        DOM.tagline
          ? DOM.tagline.value
          : "",
        CONFIG.MAX_TEXT_LENGTH
      ),

      address: normalizeText(
        DOM.address
          ? DOM.address.value
          : "",
        CONFIG.MAX_TEXT_LENGTH
      ),

      mobile: normalizeText(
        DOM.mobile
          ? DOM.mobile.value
          : "",
        CONFIG.MAX_PHONE_LENGTH
      ),

      email: normalizeText(
        DOM.email
          ? DOM.email.value
          : "",
        CONFIG.MAX_EMAIL_LENGTH
      ),

      whatsapp: normalizeText(
        DOM.whatsapp
          ? DOM.whatsapp.value
          : "",
        CONFIG.MAX_WHATSAPP_LENGTH
      ),

      logoUrl: normalizeText(
        DOM.logoUrl
          ? DOM.logoUrl.value
          : "",
        CONFIG.MAX_LOGO_URL_LENGTH
      )
    },

    location: {
      verified:
        state.location.verified,

      latitude:
        state.location.latitude,

      longitude:
        state.location.longitude,

      verifiedAt:
        state.location.verifiedAt
    },

    categories:
      state.categories.map(
        (category) => ({
          id: category.id,
          name: category.name,
          items: category.items.map(
            (item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              unit: item.unit,
              description:
                item.description || "",
              youtubeUrl:
                item.youtubeUrl || ""
            })
          )
        })
      )
  };
}

async function publishBusiness(payload) {
  const workerUrl =
    getWorkerUrl();

  if (!workerUrl) {
    throw new Error(
      "Business Worker URL is not configured."
    );
  }

  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => controller.abort(),
      CONFIG.REQUEST_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        `${workerUrl}/publish`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body: JSON.stringify(
            payload
          ),

          cache: "no-store",

          credentials: "omit",

          signal:
            controller.signal
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let result = null;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      result =
        await response.json();
    } else {
      const text =
        await response.text();

      result = {
        success: false,
        message:
          text ||
          `Worker returned HTTP ${response.status}.`
      };
    }

    if (!response.ok) {
      throw new Error(
        result &&
        result.message
          ? result.message
          : `Worker returned HTTP ${response.status}.`
      );
    }

    return result;

  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

function getWorkerUrl() {
  return normalizeBaseUrl(
    CONFIG.WORKER_URL
  );
}

function showSuccess(result) {
  hideError();

  if (!DOM.successState) {
    return;
  }

  const url =
    typeof result.url === "string"
      ? result.url.trim()
      : "";

  if (DOM.successDescription) {
    DOM.successDescription.textContent =
      result.message ||
      "Your business app has been published successfully.";
  }

  if (DOM.successUrl) {
    DOM.successUrl.textContent =
      url || "Published successfully.";

    if (url) {
      DOM.successUrl.dataset.url =
        url;
    } else {
      delete DOM.successUrl.dataset.url;
    }
  }

  if (DOM.successOpenButton) {
    DOM.successOpenButton.disabled =
      !isSafeHttpsUrl(url);
  }

  DOM.successState.hidden = false;

  DOM.successState.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function openPublishedApp() {
  const url =
    DOM.successUrl
      ? DOM.successUrl.dataset.url || ""
      : "";

  if (!isSafeHttpsUrl(url)) {
    showToast(
      "Published app URL is not available.",
      "error"
    );
    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

function hideSuccess() {
  if (DOM.successState) {
    DOM.successState.hidden = true;
  }
}

function showError(message) {
  if (!DOM.errorState) {
    return;
  }

  if (DOM.errorMessage) {
    DOM.errorMessage.textContent =
      message || "Something went wrong.";
  }

  DOM.errorState.hidden = false;
}

function hideError() {
  if (DOM.errorState) {
    DOM.errorState.hidden = true;
  }
}

function showLoading(message) {
  if (!DOM.loadingOverlay) {
    return;
  }

  if (DOM.loadingMessage) {
    DOM.loadingMessage.textContent =
      message ||
      "Please wait...";
  }

  DOM.loadingOverlay.hidden = false;
}

function hideLoading() {
  if (DOM.loadingOverlay) {
    DOM.loadingOverlay.hidden = true;
  }
}

function updateLocationStatus(
  message = "",
  verified = state.location.verified
) {
  if (!DOM.locationStatus) {
    return;
  }

  DOM.locationStatus.textContent =
    message ||
    (
      verified
        ? "Business location verified."
        : "Business location not verified."
    );

  DOM.locationStatus.classList.toggle(
    "is-verified",
    Boolean(verified)
  );
}

function clearItemForm() {
  if (DOM.itemName) {
    DOM.itemName.value = "";
  }

  if (DOM.itemPrice) {
    DOM.itemPrice.value = "";
  }

  if (DOM.itemQuantity) {
    DOM.itemQuantity.value = "";
  }

  if (DOM.itemUnit) {
    DOM.itemUnit.value = "";
  }

  if (DOM.itemDescription) {
    DOM.itemDescription.value = "";
  }

  if (DOM.itemYoutube) {
    DOM.itemYoutube.value = "";
  }

  state.editingItemId = null;

  if (DOM.addItemButton) {
    DOM.addItemButton.textContent =
      "Add Item";
  }
}

function resetBuilder() {
  if (
    !window.confirm(
      "Reset all business information, categories, items, and location verification?"
    )
  ) {
    return;
  }

  if (DOM.form) {
    DOM.form.reset();
  }

  state.categories = [];
  state.editingCategoryId = null;
  state.editingItemId = null;
  state.selectedCategoryId = null;

  state.location = {
    verified: false,
    latitude: null,
    longitude: null,
    verifiedAt: null
  };

  if (DOM.addCategoryButton) {
    DOM.addCategoryButton.textContent =
      "Add Category";
  }

  if (DOM.addItemButton) {
    DOM.addItemButton.textContent =
      "Add Item";
  }

  renderCategories();
  renderItems();
  updateCategorySelect();
  updateLocationStatus();
  hideError();
  hideSuccess();

  showToast(
    "Builder reset.",
    "success"
  );
}

function createActionButton(
  text,
  action,
  categoryId
) {
  const button =
    document.createElement("button");

  button.type = "button";
  button.dataset.categoryAction =
    action;
  button.dataset.categoryId =
    categoryId;
  button.textContent = text;

  return button;
}

function setButtonBusy(
  button,
  busy,
  busyText = "Please wait..."
) {
  if (!button) {
    return;
  }

  if (busy) {
    if (
      !button.dataset.originalText
    ) {
      button.dataset.originalText =
        button.textContent;
    }

    button.disabled = true;
    button.setAttribute(
      "aria-busy",
      "true"
    );
    button.textContent =
      busyText;
  } else {
    button.disabled = false;
    button.removeAttribute(
      "aria-busy"
    );

    if (
      button.dataset.originalText
    ) {
      button.textContent =
        button.dataset.originalText;

      delete button.dataset.originalText;
    }
  }
}

function showToast(
  message,
  type = "info"
) {
  if (!DOM.toastContainer) {
    return;
  }

  const toast =
    document.createElement("div");

  toast.className =
    `toast toast-${type}`;

  toast.setAttribute(
    "role",
    "status"
  );

  toast.textContent =
    message || "Done.";

  DOM.toastContainer.appendChild(
    toast
  );

  window.setTimeout(
    () => {
      toast.remove();
    },
    4000
  );
}

function normalizeText(
  value,
  maxLength
) {
  const text =
    String(value ?? "")
      .trim();

  if (
    Number.isFinite(maxLength) &&
    text.length > maxLength
  ) {
    return text.slice(
      0,
      maxLength
    );
  }

  return text;
}

function parsePositiveNumber(value) {
  const text =
    String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number =
    Number(text);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return null;
  }

  return number;
}

function parseNonNegativeNumber(
  value
) {
  const number =
    parsePositiveNumber(value);

  return number === null
    ? null
    : number;
}

function formatNumber(value) {
  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2
    }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}

function isValidHttpsUrl(value) {
  try {
    const url =
      new URL(value);

    return (
      url.protocol === "https:" &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function isSafeHttpsUrl(value) {
  return isValidHttpsUrl(value);
}

function normalizeBaseUrl(value) {
  const text =
    String(value ?? "").trim();

  if (!text) {
    return "";
  }

  try {
    const url =
      new URL(text);

    if (
      url.protocol !== "https:"
    ) {
      return "";
    }

    return url.origin;
  } catch {
    return "";
  }
}

function isValidYoutubeUrl(value) {
  try {
    const url =
      new URL(value);

    const hostname =
      url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    if (
      hostname === "youtu.be"
    ) {
      return Boolean(
        url.pathname
          .replace("/", "")
          .trim()
      );
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (
        url.pathname.startsWith(
          "/shorts/"
        )
      ) {
        return Boolean(
          url.pathname
            .split("/")
            .filter(Boolean)[1]
        );
      }

      if (
        url.pathname ===
        "/watch"
      ) {
        return Boolean(
          url.searchParams.get(
            "v"
          )
        );
      }

      if (
        url.pathname.startsWith(
          "/embed/"
        )
      ) {
        return Boolean(
          url.pathname
            .split("/")
            .filter(Boolean)[1]
        );
      }

      if (
        url.pathname.startsWith(
          "/v/"
        )
      ) {
        return Boolean(
          url.pathname
            .split("/")
            .filter(Boolean)[1]
        );
      }
    }

    return false;
  } catch {
    return false;
  }
}

function createId(prefix) {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      "function"
  ) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return (
    `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`
  );
}

function invalid(
  message,
  element = null
) {
  return {
    valid: false,
    message,
    element
  };
}

function focusElement(element) {
  if (!element) {
    return;
  }

  try {
    element.focus({
      preventScroll: false
    });
  } catch {
    element.focus();
  }
}

function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong.";
  }

  if (
    error.name ===
    "AbortError"
  ) {
    return "The request timed out. Please try again.";
  }

  if (
    typeof error.code ===
    "number"
  ) {
    switch (error.code) {
      case 1:
        return "Location permission was denied.";
      case 2:
        return "Your current location could not be determined.";
      case 3:
        return "Location request timed out.";
      default:
        break;
    }
  }

  if (
    error.message
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
