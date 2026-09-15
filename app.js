"use strict";

/*
 * Vidhwaan Business Apps
 * Business Builder
 *
 * Step 8
 * File: business/app.js
 *
 * Responsibilities:
 * - Template selection
 * - Ecommerce builder
 * - Business information management
 * - Category management
 * - Item management
 * - YouTube Shorts validation
 * - Logo preview
 * - GPS location verification
 * - Client-side validation
 * - Business creation/update request
 * - Success handling
 *
 * IMPORTANT:
 * Client-side validation is for user experience only.
 * The Cloudflare Worker remains authoritative for:
 * - subscription validation
 * - template validation
 * - business identity
 * - category/item limits
 * - data validation
 * - GitHub generation/update
 */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const CONFIG = Object.freeze({
  /*
   * Step 9 will provide the final deployed Worker URL.
   * Keep this as one centralized configuration value.
   */
  WORKER_URL: "",

  TEMPLATE: "ECM",

  LOCATION_TIMEOUT_MS: 15000,

  MAX_CATEGORIES: 50,
  MAX_ITEMS: 500,

  MAX_NAME_LENGTH: 120,
  MAX_TAGLINE_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_LOGO_URL_LENGTH: 2000,

  MAX_CATEGORY_NAME_LENGTH: 100,

  MAX_ITEM_NAME_LENGTH: 150,
  MAX_ITEM_DESCRIPTION_LENGTH: 1000,
  MAX_ITEM_UNIT_LENGTH: 50,
  MAX_YOUTUBE_URL_LENGTH: 2000,

  MAX_ITEM_PRICE: 99999999,
  MAX_ITEM_QUANTITY: 999999999
});


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {
  selectedTemplate: null,

  editingCategoryIndex: -1,

  editingItemIndex: -1,

  categories: [],

  items: [],

  location: {
    verified: false,
    latitude: null,
    longitude: null,
    verifiedAt: null
  },

  publishing: false,

  lastBusinessUrl: ""
};


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const DOM = {};


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  initializeApplication();
});


function cacheDom() {
  DOM.templateSection = document.getElementById(
    "template-section"
  );

  DOM.templateGrid = document.getElementById(
    "template-grid"
  );

  DOM.ecommerceSection = document.getElementById(
    "ecommerce-section"
  );

  DOM.successSection = document.getElementById(
    "success-section"
  );

  DOM.backToTemplates = document.getElementById(
    "back-to-templates"
  );

  DOM.connectionStatus = document.getElementById(
    "connection-status"
  );

  DOM.connectionText = document.getElementById(
    "connection-text"
  );

  DOM.subscriptionId = document.getElementById(
    "subscription-id"
  );

  DOM.businessName = document.getElementById(
    "business-name"
  );

  DOM.businessTagline = document.getElementById(
    "business-tagline"
  );

  DOM.businessAddress = document.getElementById(
    "business-address"
  );

  DOM.businessMobile = document.getElementById(
    "business-mobile"
  );

  DOM.businessEmail = document.getElementById(
    "business-email"
  );

  DOM.businessWhatsapp = document.getElementById(
    "business-whatsapp"
  );

  DOM.businessLogo = document.getElementById(
    "business-logo"
  );

  DOM.logoPreview = document.getElementById(
    "logo-preview"
  );

  DOM.logoPreviewImage = document.getElementById(
    "logo-preview-image"
  );

  DOM.verifyLocation = document.getElementById(
    "verify-location"
  );

  DOM.locationStatus = document.getElementById(
    "location-status"
  );

  DOM.locationStatusIndicator = document.getElementById(
    "location-status-indicator"
  );

  DOM.locationStatusText = document.getElementById(
    "location-status-text"
  );

  DOM.locationDetails = document.getElementById(
    "location-details"
  );

  DOM.locationLatitude = document.getElementById(
    "location-latitude"
  );

  DOM.locationLongitude = document.getElementById(
    "location-longitude"
  );

  DOM.locationVerifiedAt = document.getElementById(
    "location-verified-at"
  );

  DOM.addCategory = document.getElementById(
    "add-category"
  );

  DOM.addFirstCategory = document.getElementById(
    "add-first-category"
  );

  DOM.categoryList = document.getElementById(
    "category-list"
  );

  DOM.categoryEmpty = document.getElementById(
    "category-empty"
  );

  DOM.categoryModal = document.getElementById(
    "category-modal"
  );

  DOM.categoryModalClose = document.getElementById(
    "category-modal-close"
  );

  DOM.categoryCancel = document.getElementById(
    "category-cancel"
  );

  DOM.categorySave = document.getElementById(
    "category-save"
  );

  DOM.categoryName = document.getElementById(
    "category-name"
  );

  DOM.categoryNameError = document.getElementById(
    "category-name-error"
  );

  DOM.addItem = document.getElementById(
    "add-item"
  );

  DOM.addFirstItem = document.getElementById(
    "add-first-item"
  );

  DOM.itemList = document.getElementById(
    "item-list"
  );

  DOM.itemEmpty = document.getElementById(
    "item-empty"
  );

  DOM.itemModal = document.getElementById(
    "item-modal"
  );

  DOM.itemModalClose = document.getElementById(
    "item-modal-close"
  );

  DOM.itemCancel = document.getElementById(
    "item-cancel"
  );

  DOM.itemSave = document.getElementById(
    "item-save"
  );

  DOM.itemName = document.getElementById(
    "item-name"
  );

  DOM.itemPrice = document.getElementById(
    "item-price"
  );

  DOM.itemQuantity = document.getElementById(
    "item-quantity"
  );

  DOM.itemUnit = document.getElementById(
    "item-unit"
  );

  DOM.itemCategory = document.getElementById(
    "item-category"
  );

  DOM.itemDescription = document.getElementById(
    "item-description"
  );

  DOM.itemYoutube = document.getElementById(
    "item-youtube"
  );

  DOM.itemFormError = document.getElementById(
    "item-form-error"
  );

  DOM.validationSummary = document.getElementById(
    "validation-summary"
  );

  DOM.validationList = document.getElementById(
    "validation-list"
  );

  DOM.publishBusiness = document.getElementById(
    "publish-business"
  );

  DOM.publishSpinner = document.getElementById(
    "publish-spinner"
  );

  DOM.publishButtonText = document.getElementById(
    "publish-button-text"
  );

  DOM.publishStatus = document.getElementById(
    "publish-status"
  );

  DOM.applicationLoader = document.getElementById(
    "application-loader"
  );

  DOM.loaderText = document.getElementById(
    "loader-text"
  );

  DOM.toastContainer = document.getElementById(
    "toast-container"
  );

  DOM.businessAppUrl = document.getElementById(
    "business-app-url"
  );

  DOM.openBusinessApp = document.getElementById(
    "open-business-app"
  );

  DOM.editBusiness = document.getElementById(
    "edit-business"
  );

  DOM.createAnother = document.getElementById(
    "create-another"
  );
}


/* ============================================================
   APPLICATION SETUP
   ============================================================ */

function initializeApplication() {
  bindEvents();

  initializeConnectionStatus();

  initializeDefaultCategories();

  renderCategories();

  renderItems();

  updateItemCategoryOptions();

  resetLocationDisplay();

  setPublishState(false);
}


/* ============================================================
   EVENT BINDING
   ============================================================ */

function bindEvents() {
  if (DOM.templateGrid) {
    DOM.templateGrid.addEventListener(
      "click",
      handleTemplateSelection
    );
  }

  DOM.backToTemplates?.addEventListener(
    "click",
    showTemplateSelection
  );

  DOM.addCategory?.addEventListener(
    "click",
    () => openCategoryModal()
  );

  DOM.addFirstCategory?.addEventListener(
    "click",
    () => openCategoryModal()
  );

  DOM.categoryModalClose?.addEventListener(
    "click",
    closeCategoryModal
  );

  DOM.categoryCancel?.addEventListener(
    "click",
    closeCategoryModal
  );

  DOM.categorySave?.addEventListener(
    "click",
    saveCategory
  );

  DOM.categoryList?.addEventListener(
    "click",
    handleCategoryListClick
  );

  DOM.addItem?.addEventListener(
    "click",
    () => openItemModal()
  );

  DOM.addFirstItem?.addEventListener(
    "click",
    () => openItemModal()
  );

  DOM.itemModalClose?.addEventListener(
    "click",
    closeItemModal
  );

  DOM.itemCancel?.addEventListener(
    "click",
    closeItemModal
  );

  DOM.itemSave?.addEventListener(
    "click",
    saveItem
  );

  DOM.itemList?.addEventListener(
    "click",
    handleItemListClick
  );

  DOM.verifyLocation?.addEventListener(
    "click",
    verifyBusinessLocation
  );

  DOM.businessLogo?.addEventListener(
    "input",
    handleLogoPreview
  );

  DOM.publishBusiness?.addEventListener(
    "click",
    publishBusiness
  );

  DOM.editBusiness?.addEventListener(
    "click",
    showEcommerceBuilder
  );

  DOM.createAnother?.addEventListener(
    "click",
    resetBuilder
  );

  DOM.openBusinessApp?.addEventListener(
    "click",
    openBusinessApplication
  );

  DOM.businessAppUrl?.addEventListener(
    "click",
    handleBusinessUrlClick
  );

  document.addEventListener(
    "click",
    handleModalBackdropClick
  );

  document.addEventListener(
    "keydown",
    handleGlobalKeydown
  );

  window.addEventListener(
    "online",
    updateConnectionStatus
  );

  window.addEventListener(
    "offline",
    updateConnectionStatus
  );
}


/* ============================================================
   CONNECTION STATUS
   ============================================================ */

function initializeConnectionStatus() {
  updateConnectionStatus();
}


function updateConnectionStatus() {
  if (!DOM.connectionStatus || !DOM.connectionText) {
    return;
  }

  const online = navigator.onLine;

  DOM.connectionStatus.classList.toggle(
    "is-online",
    online
  );

  DOM.connectionStatus.classList.toggle(
    "is-offline",
    !online
  );

  DOM.connectionText.textContent = online
    ? "Ready"
    : "Offline";
}


/* ============================================================
   TEMPLATE SELECTION
   ============================================================ */

function handleTemplateSelection(event) {
  const card = event.target.closest(
    "[data-template]"
  );

  if (!card) {
    return;
  }

  const template = String(
    card.dataset.template || ""
  ).trim().toUpperCase();

  if (template !== CONFIG.TEMPLATE) {
    showToast(
      "This template is not currently available.",
      "warning"
    );

    return;
  }

  state.selectedTemplate = template;

  showEcommerceBuilder();
}


function showTemplateSelection() {
  if (state.publishing) {
    return;
  }

  DOM.successSection.hidden = true;
  DOM.ecommerceSection.hidden = true;
  DOM.templateSection.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function showEcommerceBuilder() {
  if (state.selectedTemplate !== CONFIG.TEMPLATE) {
    state.selectedTemplate = CONFIG.TEMPLATE;
  }

  DOM.templateSection.hidden = true;
  DOM.successSection.hidden = true;
  DOM.ecommerceSection.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ============================================================
   DEFAULT CATEGORIES
   ============================================================ */

function initializeDefaultCategories() {
  if (state.categories.length > 0) {
    return;
  }

  state.categories = [
    createCategory("Grocery"),
    createCategory("Clothes"),
    createCategory("General Goods")
  ];
}


function createCategory(name) {
  return {
    id: createId("cat"),
    name: cleanText(name),
  };
}


/* ============================================================
   CATEGORY MANAGEMENT
   ============================================================ */

function openCategoryModal(index = -1) {
  if (state.publishing) {
    return;
  }

  if (
    index === -1 &&
    state.categories.length >= CONFIG.MAX_CATEGORIES
  ) {
    showToast(
      `Maximum ${CONFIG.MAX_CATEGORIES} categories allowed.`,
      "warning"
    );

    return;
  }

  state.editingCategoryIndex = index;

  clearFieldError(
    DOM.categoryName,
    DOM.categoryNameError
  );

  if (index >= 0 && state.categories[index]) {
    DOM.categoryName.value =
      state.categories[index].name;

    document.getElementById(
      "category-modal-title"
    ).textContent = "Edit Category";

    DOM.categorySave.textContent = "Save Category";
  } else {
    DOM.categoryName.value = "";

    document.getElementById(
      "category-modal-title"
    ).textContent = "Add Category";

    DOM.categorySave.textContent = "Add Category";
  }

  openModal(DOM.categoryModal);

  window.setTimeout(() => {
    DOM.categoryName?.focus();
  }, 50);
}


function closeCategoryModal() {
  closeModal(DOM.categoryModal);

  state.editingCategoryIndex = -1;

  DOM.categoryName.value = "";

  clearFieldError(
    DOM.categoryName,
    DOM.categoryNameError
  );
}


function saveCategory() {
  const name = cleanText(
    DOM.categoryName.value
  );

  if (!name) {
    setFieldError(
      DOM.categoryName,
      DOM.categoryNameError,
      "Please enter a category name."
    );

    return;
  }

  if (
    name.length >
    CONFIG.MAX_CATEGORY_NAME_LENGTH
  ) {
    setFieldError(
      DOM.categoryName,
      DOM.categoryNameError,
      `Category name must be ${CONFIG.MAX_CATEGORY_NAME_LENGTH} characters or fewer.`
    );

    return;
  }

  const duplicate = state.categories.some(
    (category, index) =>
      index !== state.editingCategoryIndex &&
      normalizeForComparison(category.name) ===
        normalizeForComparison(name)
  );

  if (duplicate) {
    setFieldError(
      DOM.categoryName,
      DOM.categoryNameError,
      "A category with this name already exists."
    );

    return;
  }

  if (state.editingCategoryIndex >= 0) {
    state.categories[
      state.editingCategoryIndex
    ].name = name;
  } else {
    state.categories.push(
      createCategory(name)
    );
  }

  closeCategoryModal();

  renderCategories();

  updateItemCategoryOptions();

  renderItems();

  clearValidationSummary();

  showToast(
    state.editingCategoryIndex >= 0
      ? "Category updated."
      : "Category added.",
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

  const index = Number(
    button.dataset.categoryIndex
  );

  if (
    !Number.isInteger(index) ||
    !state.categories[index]
  ) {
    return;
  }

  const action = button.dataset.categoryAction;

  if (action === "edit") {
    openCategoryModal(index);
    return;
  }

  if (action === "delete") {
    deleteCategory(index);
  }
}


function deleteCategory(index) {
  const category = state.categories[index];

  if (!category) {
    return;
  }

  const hasItems = state.items.some(
    item => item.categoryId === category.id
  );

  if (hasItems) {
    showToast(
      "Remove or move the items in this category before deleting it.",
      "warning"
    );

    return;
  }

  state.categories.splice(index, 1);

  renderCategories();

  updateItemCategoryOptions();

  clearValidationSummary();

  showToast(
    "Category removed.",
    "success"
  );
}


function renderCategories() {
  if (!DOM.categoryList) {
    return;
  }

  DOM.categoryList.replaceChildren();

  DOM.categoryEmpty.hidden =
    state.categories.length !== 0;

  DOM.addCategory.disabled =
    state.categories.length >=
    CONFIG.MAX_CATEGORIES;

  if (state.categories.length === 0) {
    return;
  }

  const fragment =
    document.createDocumentFragment();

  state.categories.forEach(
    (category, index) => {
      const row =
        document.createElement("div");

      row.className = "category-row";

      const name =
        document.createElement("span");

      name.className =
        "category-row__name";

      name.textContent = category.name;

      const actions =
        document.createElement("div");

      actions.className =
        "category-row__actions";

      const editButton =
        createRowButton(
          "Edit",
          "edit",
          index,
          false
        );

      const deleteButton =
        createRowButton(
          "Delete",
          "delete",
          index,
          true
        );

      actions.append(
        editButton,
        deleteButton
      );

      row.append(
        name,
        actions
      );

      fragment.appendChild(row);
    }
  );

  DOM.categoryList.appendChild(
    fragment
  );
}


/* ============================================================
   ITEM MANAGEMENT
   ============================================================ */

function openItemModal(index = -1) {
  if (state.publishing) {
    return;
  }

  if (state.categories.length === 0) {
    showToast(
      "Add at least one category before adding an item.",
      "warning"
    );

    return;
  }

  if (
    index === -1 &&
    state.items.length >= CONFIG.MAX_ITEMS
  ) {
    showToast(
      `Maximum ${CONFIG.MAX_ITEMS} items allowed.`,
      "warning"
    );

    return;
  }

  state.editingItemIndex = index;

  clearItemForm();

  updateItemCategoryOptions();

  if (index >= 0 && state.items[index]) {
    const item = state.items[index];

    DOM.itemName.value = item.name;
    DOM.itemPrice.value = String(
      item.price
    );

    DOM.itemQuantity.value =
      item.quantity === null
        ? ""
        : String(item.quantity);

    DOM.itemUnit.value =
      item.unit || "";

    DOM.itemCategory.value =
      item.categoryId || "";

    DOM.itemDescription.value =
      item.description || "";

    DOM.itemYoutube.value =
      item.youtubeUrl || "";

    document.getElementById(
      "item-modal-title"
    ).textContent = "Edit Item";

    DOM.itemSave.textContent =
      "Save Item";
  } else {
    document.getElementById(
      "item-modal-title"
    ).textContent = "Add Item";

    DOM.itemSave.textContent =
      "Add Item";
  }

  openModal(DOM.itemModal);

  window.setTimeout(() => {
    DOM.itemName?.focus();
  }, 50);
}


function closeItemModal() {
  closeModal(DOM.itemModal);

  state.editingItemIndex = -1;

  clearItemForm();
}


function clearItemForm() {
  DOM.itemName.value = "";
  DOM.itemPrice.value = "";
  DOM.itemQuantity.value = "";
  DOM.itemUnit.value = "";
  DOM.itemCategory.value = "";
  DOM.itemDescription.value = "";
  DOM.itemYoutube.value = "";

  clearFieldError(
    DOM.itemName,
    DOM.itemFormError
  );
}


function saveItem() {
  clearItemFormError();

  const result =
    collectAndValidateItem();

  if (!result.valid) {
    showItemFormError(
      result.errors.join(" ")
    );

    return;
  }

  const item = result.item;

  if (state.editingItemIndex >= 0) {
    state.items[
      state.editingItemIndex
    ] = {
      ...state.items[
        state.editingItemIndex
      ],
      ...item
    };
  } else {
    state.items.push(item);
  }

  const wasEditing =
    state.editingItemIndex >= 0;

  closeItemModal();

  renderItems();

  clearValidationSummary();

  showToast(
    wasEditing
      ? "Item updated."
      : "Item added.",
    "success"
  );
}


function collectAndValidateItem() {
  const errors = [];

  const name = cleanText(
    DOM.itemName.value
  );

  const rawPrice =
    String(
      DOM.itemPrice.value || ""
    ).trim();

  const rawQuantity =
    String(
      DOM.itemQuantity.value || ""
    ).trim();

  const unit = cleanText(
    DOM.itemUnit.value
  );

  const categoryId =
    String(
      DOM.itemCategory.value || ""
    ).trim();

  const description = cleanText(
    DOM.itemDescription.value
  );

  const youtubeUrl = cleanUrlText(
    DOM.itemYoutube.value
  );

  if (!name) {
    errors.push(
      "Item name is required."
    );
  } else if (
    name.length >
    CONFIG.MAX_ITEM_NAME_LENGTH
  ) {
    errors.push(
      `Item name must be ${CONFIG.MAX_ITEM_NAME_LENGTH} characters or fewer.`
    );
  }

  if (!rawPrice) {
    errors.push(
      "Item price is required."
    );
  }

  const price =
    rawPrice === ""
      ? NaN
      : Number(rawPrice);

  if (
    rawPrice &&
    (
      !Number.isFinite(price) ||
      price < 0 ||
      price > CONFIG.MAX_ITEM_PRICE
    )
  ) {
    errors.push(
      "Enter a valid item price."
    );
  }

  if (rawQuantity) {
    const quantity =
      Number(rawQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > CONFIG.MAX_ITEM_QUANTITY
    ) {
      errors.push(
        "Enter a valid whole-number quantity."
      );
    }
  }

  if (
    unit.length >
    CONFIG.MAX_ITEM_UNIT_LENGTH
  ) {
    errors.push(
      `Unit must be ${CONFIG.MAX_ITEM_UNIT_LENGTH} characters or fewer.`
    );
  }

  if (!categoryId) {
    errors.push(
      "Please select a category."
    );
  } else if (
    !state.categories.some(
      category =>
        category.id === categoryId
    )
  ) {
    errors.push(
      "The selected category is invalid."
    );
  }

  if (
    description.length >
    CONFIG.MAX_ITEM_DESCRIPTION_LENGTH
  ) {
    errors.push(
      `Description must be ${CONFIG.MAX_ITEM_DESCRIPTION_LENGTH} characters or fewer.`
    );
  }

  if (
    youtubeUrl.length >
    CONFIG.MAX_YOUTUBE_URL_LENGTH
  ) {
    errors.push(
      "YouTube link is too long."
    );
  }

  let normalizedYoutubeUrl = "";

  if (youtubeUrl) {
    normalizedYoutubeUrl =
      normalizeYouTubeUrl(
        youtubeUrl
      );

    if (!normalizedYoutubeUrl) {
      errors.push(
        "Please enter a valid YouTube or YouTube Shorts link."
      );
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      item: null
    };
  }

  return {
    valid: true,
    errors: [],
    item: {
      id:
        state.editingItemIndex >= 0 &&
        state.items[
          state.editingItemIndex
        ]
          ? state.items[
              state.editingItemIndex
            ].id
          : createId("item"),

      name,

      price: Number(
        price.toFixed(2)
      ),

      quantity:
        rawQuantity === ""
          ? null
          : Number(rawQuantity),

      unit,

      categoryId,

      description,

      youtubeUrl:
        normalizedYoutubeUrl
    }
  };
}


function handleItemListClick(event) {
  const button = event.target.closest(
    "[data-item-action]"
  );

  if (!button) {
    return;
  }

  const index = Number(
    button.dataset.itemIndex
  );

  if (
    !Number.isInteger(index) ||
    !state.items[index]
  ) {
    return;
  }

  const action =
    button.dataset.itemAction;

  if (action === "edit") {
    openItemModal(index);
    return;
  }

  if (action === "delete") {
    deleteItem(index);
  }
}


function deleteItem(index) {
  if (!state.items[index]) {
    return;
  }

  state.items.splice(index, 1);

  renderItems();

  clearValidationSummary();

  showToast(
    "Item removed.",
    "success"
  );
}


function renderItems() {
  if (!DOM.itemList) {
    return;
  }

  DOM.itemList.replaceChildren();

  DOM.itemEmpty.hidden =
    state.items.length !== 0;

  DOM.addItem.disabled =
    state.items.length >=
    CONFIG.MAX_ITEMS ||
    state.categories.length === 0;

  if (state.items.length === 0) {
    return;
  }

  const fragment =
    document.createDocumentFragment();

  state.items.forEach(
    (item, index) => {
      const row =
        document.createElement("div");

      row.className = "item-row";

      const main =
        document.createElement("div");

      main.className =
        "item-row__main";

      const name =
        document.createElement("p");

      name.className =
        "item-row__name";

      name.textContent =
        item.name;

      const meta =
        document.createElement("div");

      meta.className =
        "item-row__meta";

      const price =
        document.createElement("span");

      price.textContent =
        formatCurrency(item.price);

      const category =
        document.createElement("span");

      category.textContent =
        getCategoryName(
          item.categoryId
        );

      meta.append(
        price,
        category
      );

      if (
        item.quantity !== null
      ) {
        const quantity =
          document.createElement("span");

        quantity.textContent =
          item.unit
            ? `Qty: ${item.quantity} ${item.unit}`
            : `Qty: ${item.quantity}`;

        meta.appendChild(
          quantity
        );
      }

      if (item.youtubeUrl) {
        const video =
          document.createElement("span");

        video.textContent =
          "YouTube video added";

        meta.appendChild(
          video
        );
      }

      main.append(
        name,
        meta
      );

      const actions =
        document.createElement("div");

      actions.className =
        "item-row__actions";

      actions.append(
        createRowButton(
          "Edit",
          "edit",
          index,
          false,
          "item"
        ),
        createRowButton(
          "Delete",
          "delete",
          index,
          true,
          "item"
        )
      );

      row.append(
        main,
        actions
      );

      fragment.appendChild(row);
    }
  );

  DOM.itemList.appendChild(
    fragment
  );
}


function updateItemCategoryOptions() {
  if (!DOM.itemCategory) {
    return;
  }

  const currentValue =
    DOM.itemCategory.value;

  DOM.itemCategory.replaceChildren();

  const defaultOption =
    document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent =
    "Select category";

  DOM.itemCategory.appendChild(
    defaultOption
  );

  state.categories.forEach(
    category => {
      const option =
        document.createElement("option");

      option.value =
        category.id;

      option.textContent =
        category.name;

      DOM.itemCategory.appendChild(
        option
      );
    }
  );

  if (
    state.categories.some(
      category =>
        category.id === currentValue
    )
  ) {
    DOM.itemCategory.value =
      currentValue;
  }
}


/* ============================================================
   LOCATION VERIFICATION
   ============================================================ */

async function verifyBusinessLocation() {
  if (state.publishing) {
    return;
  }

  if (
    !navigator.geolocation
  ) {
    setLocationError(
      "Your browser does not support location verification."
    );

    return;
  }

  if (!window.isSecureContext) {
    setLocationError(
      "Location verification requires a secure HTTPS connection."
    );

    return;
  }

  DOM.verifyLocation.disabled = true;

  setLocationStatus(
    "Checking your current business location...",
    "default"
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
        "The device returned an invalid location."
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        "The device returned an invalid GPS coordinate."
      );
    }

    const verifiedAt =
      new Date().toISOString();

    state.location = {
      verified: true,
      latitude,
      longitude,
      verifiedAt
    };

    DOM.locationLatitude.textContent =
      latitude.toFixed(7);

    DOM.locationLongitude.textContent =
      longitude.toFixed(7);

    DOM.locationVerifiedAt.textContent =
      formatDateTime(
        verifiedAt
      );

    DOM.locationDetails.hidden =
      false;

    setLocationStatus(
      Number.isFinite(accuracy)
        ? `Business location verified. GPS accuracy: approximately ${Math.round(accuracy)} m.`
        : "Business location verified.",
      "verified"
    );

    showToast(
      "Business location verified successfully.",
      "success"
    );

    clearValidationSummary();
  } catch (error) {
    state.location = {
      verified: false,
      latitude: null,
      longitude: null,
      verifiedAt: null
    };

    DOM.locationDetails.hidden =
      true;

    setLocationError(
      getGeolocationErrorMessage(
        error
      )
    );
  } finally {
    DOM.verifyLocation.disabled = false;
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
          timeout:
            CONFIG.LOCATION_TIMEOUT_MS,
          maximumAge: 0
        }
      );
    }
  );
}


function getGeolocationErrorMessage(
  error
) {
  if (
    error &&
    typeof error.code === "number"
  ) {
    if (
      error.code ===
      error.PERMISSION_DENIED
    ) {
      return "Location permission was denied. Allow location access and try again.";
    }

    if (
      error.code ===
      error.POSITION_UNAVAILABLE
    ) {
      return "Your current location could not be determined. Move to an area with better GPS availability and try again.";
    }

    if (
      error.code ===
      error.TIMEOUT
    ) {
      return "Location detection timed out. Please try again.";
    }
  }

  return (
    error?.message ||
    "Business location verification failed."
  );
}


function setLocationStatus(
  message,
  type
) {
  DOM.locationStatus.classList.remove(
    "is-verified",
    "is-error"
  );

  if (type === "verified") {
    DOM.locationStatus.classList.add(
      "is-verified"
    );
  }

  if (type === "error") {
    DOM.locationStatus.classList.add(
      "is-error"
    );
  }

  DOM.locationStatusText.textContent =
    message;
}


function setLocationError(message) {
  setLocationStatus(
    message,
    "error"
  );

  showToast(
    message,
    "error"
  );
}


function resetLocationDisplay() {
  state.location = {
    verified: false,
    latitude: null,
    longitude: null,
    verifiedAt: null
  };

  DOM.locationDetails.hidden =
    true;

  setLocationStatus(
    "Location not verified",
    "default"
  );
}


/* ============================================================
   LOGO PREVIEW
   ============================================================ */

function handleLogoPreview() {
  const value =
    cleanUrlText(
      DOM.businessLogo.value
    );

  if (!value) {
    DOM.logoPreview.hidden =
      true;

    DOM.logoPreviewImage.removeAttribute(
      "src"
    );

    return;
  }

  const url =
    normalizeHttpUrl(value);

  if (!url) {
    DOM.logoPreview.hidden =
      true;

    DOM.logoPreviewImage.removeAttribute(
      "src"
    );

    return;
  }

  DOM.logoPreview.hidden =
    false;

  DOM.logoPreviewImage.src =
    url;

  DOM.logoPreviewImage.onerror =
    () => {
      DOM.logoPreview.hidden =
        true;

      DOM.logoPreviewImage.removeAttribute(
        "src"
      );
    };
}


/* ============================================================
   BUSINESS VALIDATION
   ============================================================ */

function validateBusinessForm() {
  const errors = [];

  const subscriptionId =
    cleanText(
      DOM.subscriptionId.value
    );

  const name =
    cleanText(
      DOM.businessName.value
    );

  const tagline =
    cleanText(
      DOM.businessTagline.value
    );

  const address =
    cleanText(
      DOM.businessAddress.value
    );

  const mobile =
    cleanText(
      DOM.businessMobile.value
    );

  const email =
    cleanText(
      DOM.businessEmail.value
    );

  const whatsapp =
    cleanText(
      DOM.businessWhatsapp.value
    );

  const logoUrl =
    cleanUrlText(
      DOM.businessLogo.value
    );

  if (!subscriptionId) {
    errors.push(
      "Subscription ID is required."
    );
  }

  if (!name) {
    errors.push(
      "Business name is required."
    );
  } else if (
    name.length >
    CONFIG.MAX_NAME_LENGTH
  ) {
    errors.push(
      `Business name must be ${CONFIG.MAX_NAME_LENGTH} characters or fewer.`
    );
  }

  if (
    tagline.length >
    CONFIG.MAX_TAGLINE_LENGTH
  ) {
    errors.push(
      `Tagline must be ${CONFIG.MAX_TAGLINE_LENGTH} characters or fewer.`
    );
  }

  if (!address) {
    errors.push(
      "Business address is required."
    );
  } else if (
    address.length >
    CONFIG.MAX_ADDRESS_LENGTH
  ) {
    errors.push(
      `Business address must be ${CONFIG.MAX_ADDRESS_LENGTH} characters or fewer.`
    );
  }

  if (!mobile) {
    errors.push(
      "Mobile number is required."
    );
  } else if (
    !isValidPhone(mobile)
  ) {
    errors.push(
      "Enter a valid mobile number."
    );
  }

  if (
    email.length >
    CONFIG.MAX_EMAIL_LENGTH
  ) {
    errors.push(
      "Email address is too long."
    );
  } else if (
    email &&
    !isValidEmail(email)
  ) {
    errors.push(
      "Enter a valid email address."
    );
  }

  if (!whatsapp) {
    errors.push(
      "Business WhatsApp number is required."
    );
  } else if (
    !isValidPhone(whatsapp)
  ) {
    errors.push(
      "Enter a valid WhatsApp number."
    );
  }

  if (
    logoUrl.length >
    CONFIG.MAX_LOGO_URL_LENGTH
  ) {
    errors.push(
      "Logo URL is too long."
    );
  } else if (
    logoUrl &&
    !normalizeHttpUrl(logoUrl)
  ) {
    errors.push(
      "Logo URL must be a valid HTTPS URL."
    );
  }

  if (
    state.categories.length === 0
  ) {
    errors.push(
      "Add at least one product category."
    );
  }

  if (
    state.categories.length >
    CONFIG.MAX_CATEGORIES
  ) {
    errors.push(
      `You can have a maximum of ${CONFIG.MAX_CATEGORIES} categories.`
    );
  }

  if (
    state.items.length >
    CONFIG.MAX_ITEMS
  ) {
    errors.push(
      `You can have a maximum of ${CONFIG.MAX_ITEMS} items.`
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
    errors.push(
      "Verify the physical business location before publishing."
    );
  }

  const categoryIds =
    new Set(
      state.categories.map(
        category => category.id
      )
    );

  state.items.forEach(
    (item, index) => {
      if (
        !item.name ||
        !categoryIds.has(
          item.categoryId
        )
      ) {
        errors.push(
          `Item ${index + 1} contains invalid information.`
        );
      }

      if (
        !Number.isFinite(
          Number(item.price)
        ) ||
        Number(item.price) < 0
      ) {
        errors.push(
          `Item ${index + 1} has an invalid price.`
        );
      }

      if (item.youtubeUrl) {
        if (
          !normalizeYouTubeUrl(
            item.youtubeUrl
          )
        ) {
          errors.push(
            `Item ${index + 1} has an invalid YouTube link.`
          );
        }
      }
    }
  );

  return {
    valid: errors.length === 0,
    errors,

    data: {
      subscriptionId,
      template: CONFIG.TEMPLATE,

      business: {
        name,
        tagline,
        address,
        mobile,
        email,
        whatsapp,
        logoUrl:
          logoUrl
            ? normalizeHttpUrl(
                logoUrl
              )
            : ""
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
          category => ({
            id: category.id,
            name: category.name
          })
        ),

      items:
        state.items.map(
          item => ({
            id: item.id,
            name: item.name,
            price: Number(
              Number(
                item.price
              ).toFixed(2)
            ),
            quantity:
              item.quantity === null
                ? null
                : Number(
                    item.quantity
                  ),
            unit:
              item.unit || "",
            categoryId:
              item.categoryId,
            description:
              item.description || "",
            youtubeUrl:
              item.youtubeUrl
                ? normalizeYouTubeUrl(
                    item.youtubeUrl
                  )
                : ""
          })
        )
    }
  };
}


/* ============================================================
   VALIDATION DISPLAY
   ============================================================ */

function showValidationSummary(
  errors
) {
  if (
    !DOM.validationSummary ||
    !DOM.validationList
  ) {
    return;
  }

  DOM.validationList.replaceChildren();

  errors.forEach(
    error => {
      const li =
        document.createElement("li");

      li.textContent = error;

      DOM.validationList.appendChild(
        li
      );
    }
  );

  DOM.validationSummary.hidden =
    false;
}


function clearValidationSummary() {
  if (
    !DOM.validationSummary ||
    !DOM.validationList
  ) {
    return;
  }

  DOM.validationList.replaceChildren();

  DOM.validationSummary.hidden =
    true;
}


/* ============================================================
   PUBLISH / WORKER REQUEST
   ============================================================ */

async function publishBusiness() {
  if (state.publishing) {
    return;
  }

  clearValidationSummary();

  const validation =
    validateBusinessForm();

  if (!validation.valid) {
    showValidationSummary(
      validation.errors
    );

    showToast(
      "Please review the highlighted requirements before publishing.",
      "warning"
    );

    return;
  }

  if (!navigator.onLine) {
    showToast(
      "You are offline. Connect to the internet and try again.",
      "error"
    );

    return;
  }

  if (!CONFIG.WORKER_URL) {
    showToast(
      "The Business Worker has not been configured yet.",
      "error"
    );

    return;
  }

  state.publishing = true;

  setPublishState(true);

  showLoader(
    "Verifying subscription and creating your business app..."
  );

  try {
    const result =
      await sendBusinessRequest(
        validation.data
      );

    const businessUrl =
      extractBusinessUrl(
        result
      );

    if (!businessUrl) {
      throw new Error(
        "The server completed the request but did not return a business app URL."
      );
    }

    state.lastBusinessUrl =
      businessUrl;

    showSuccess(
      businessUrl,
      result
    );

    showToast(
      "Your business app was created successfully.",
      "success"
    );
  } catch (error) {
    console.error(
      "Business app creation failed:",
      error
    );

    const message =
      getPublishErrorMessage(
        error
      );

    DOM.publishStatus.textContent =
      message;

    showToast(
      message,
      "error"
    );
  } finally {
    state.publishing = false;

    setPublishState(false);

    hideLoader();
  }
}


async function sendBusinessRequest(
  data
) {
  const workerUrl =
    normalizeHttpUrl(
      CONFIG.WORKER_URL
    );

  if (!workerUrl) {
    throw new Error(
      "Invalid Worker URL."
    );
  }

  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => controller.abort(),
      30000
    );

  try {
    const response =
      await fetch(
        workerUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify(data),

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
      contentType
        .toLowerCase()
        .includes(
          "application/json"
        )
    ) {
      result =
        await response.json();
    } else {
      const text =
        await response.text();

      try {
        result =
          JSON.parse(text);
      } catch {
        result = {
          message:
            text || ""
        };
      }
    }

    if (!response.ok) {
      const error =
        new Error(
          result?.message ||
          result?.error ||
          `Request failed with HTTP ${response.status}.`
        );

      error.status =
        response.status;

      error.code =
        result?.code ||
        null;

      throw error;
    }

    if (
      !result ||
      typeof result !== "object"
    ) {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (
      result.success === false
    ) {
      throw new Error(
        result.message ||
        result.error ||
        "The business app could not be created."
      );
    }

    return result;
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "The request timed out. Please try again."
      );
    }

    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "Unable to connect to the Business Worker. Check your internet connection and try again."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}


function extractBusinessUrl(
  result
) {
  const candidates = [
    result?.businessUrl,
    result?.url,
    result?.appUrl,
    result?.business?.url
  ];

  for (
    const candidate of candidates
  ) {
    if (
      typeof candidate !==
      "string"
    ) {
      continue;
    }

    const url =
      normalizeHttpUrl(
        candidate
      );

    if (url) {
      return url;
    }
  }

  return "";
}


function getPublishErrorMessage(
  error
) {
  if (
    error?.status === 401 ||
    error?.status === 403
  ) {
    return (
      error.message ||
      "Subscription authorization failed. Please verify your subscription ID."
    );
  }

  if (
    error?.status === 409
  ) {
    return (
      error.message ||
      "This business could not be updated because another business is already using the same identity."
    );
  }

  if (
    error?.status === 429
  ) {
    return (
      "Too many requests. Please wait a moment and try again."
    );
  }

  if (
    error?.status >= 500
  ) {
    return (
      "The Business Worker encountered a server error. Please try again shortly."
    );
  }

  return (
    error?.message ||
    "Business app creation failed. Please try again."
  );
}


/* ============================================================
   PUBLISH STATE
   ============================================================ */

function setPublishState(
  publishing
) {
  if (
    !DOM.publishBusiness
  ) {
    return;
  }

  DOM.publishBusiness.disabled =
    publishing;

  DOM.publishSpinner.hidden =
    !publishing;

  DOM.publishButtonText.textContent =
    publishing
      ? "Creating Business App..."
      : "Create Business App";

  if (publishing) {
    DOM.publishStatus.textContent =
      "Please keep this page open while your business app is being created.";
  } else if (
    DOM.publishStatus.textContent.startsWith(
      "Please keep"
    )
  ) {
    DOM.publishStatus.textContent =
      "";
  }
}


/* ============================================================
   SUCCESS SCREEN
   ============================================================ */

function showSuccess(
  businessUrl,
  result
) {
  DOM.ecommerceSection.hidden =
    true;

  DOM.templateSection.hidden =
    true;

  DOM.successSection.hidden =
    false;

  DOM.businessAppUrl.href =
    businessUrl;

  DOM.businessAppUrl.textContent =
    businessUrl;

  DOM.successDescription.textContent =
    result?.updated
      ? "Your business app has been successfully updated and published."
      : "Your business app has been successfully created and published.";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function openBusinessApplication() {
  const url =
    normalizeHttpUrl(
      state.lastBusinessUrl
    );

  if (!url) {
    showToast(
      "Business app URL is unavailable.",
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


function handleBusinessUrlClick(
  event
) {
  const url =
    normalizeHttpUrl(
      state.lastBusinessUrl
    );

  if (!url) {
    event.preventDefault();

    showToast(
      "Business app URL is unavailable.",
      "error"
    );
  }
}


/* ============================================================
   RESET BUILDER
   ============================================================ */

function resetBuilder() {
  if (state.publishing) {
    return;
  }

  state.selectedTemplate =
    null;

  state.editingCategoryIndex =
    -1;

  state.editingItemIndex =
    -1;

  state.categories = [];

  state.items = [];

  state.lastBusinessUrl =
    "";

  DOM.subscriptionId.value =
    "";

  DOM.businessName.value =
    "";

  DOM.businessTagline.value =
    "";

  DOM.businessAddress.value =
    "";

  DOM.businessMobile.value =
    "";

  DOM.businessEmail.value =
    "";

  DOM.businessWhatsapp.value =
    "";

  DOM.businessLogo.value =
    "";

  DOM.logoPreview.hidden =
    true;

  DOM.logoPreviewImage.removeAttribute(
    "src"
  );

  DOM.publishStatus.textContent =
    "";

  clearValidationSummary();

  initializeDefaultCategories();

  renderCategories();

  renderItems();

  updateItemCategoryOptions();

  resetLocationDisplay();

  DOM.successSection.hidden =
    true;

  DOM.ecommerceSection.hidden =
    true;

  DOM.templateSection.hidden =
    false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ============================================================
   MODAL MANAGEMENT
   ============================================================ */

function openModal(
  modal
) {
  if (!modal) {
    return;
  }

  modal.hidden = false;

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}


function closeModal(
  modal
) {
  if (!modal) {
    return;
  }

  modal.hidden = true;

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  if (
    !document.querySelector(
      ".modal:not([hidden])"
    )
  ) {
    document.body.style.overflow =
      "";
  }
}


function handleModalBackdropClick(
  event
) {
  const backdrop =
    event.target.closest(
      "[data-modal-close]"
    );

  if (!backdrop) {
    return;
  }

  const modalId =
    backdrop.dataset.modalClose;

  const modal =
    document.getElementById(
      modalId
    );

  closeModal(modal);
}


function handleGlobalKeydown(
  event
) {
  if (
    event.key === "Escape"
  ) {
    if (
      !DOM.categoryModal.hidden
    ) {
      closeCategoryModal();
      return;
    }

    if (
      !DOM.itemModal.hidden
    ) {
      closeItemModal();
    }
  }

  if (
    event.key === "Enter" &&
    event.target === DOM.categoryName
  ) {
    event.preventDefault();

    saveCategory();
  }
}


/* ============================================================
   LOADING
   ============================================================ */

function showLoader(
  message
) {
  if (!DOM.applicationLoader) {
    return;
  }

  DOM.loaderText.textContent =
    message || "Processing...";

  DOM.applicationLoader.hidden =
    false;
}


function hideLoader() {
  if (!DOM.applicationLoader) {
    return;
  }

  DOM.applicationLoader.hidden =
    true;
}


/* ============================================================
   TOASTS
   ============================================================ */

function showToast(
  message,
  type = "default"
) {
  if (
    !DOM.toastContainer ||
    !message
  ) {
    return;
  }

  const toast =
    document.createElement("div");

  toast.className =
    "toast";

  if (
    type === "success" ||
    type === "error" ||
    type === "warning"
  ) {
    toast.classList.add(
      `toast--${type}`
    );
  }

  toast.setAttribute(
    "role",
    "status"
  );

  toast.textContent =
    String(message);

  DOM.toastContainer.appendChild(
    toast
  );

  window.setTimeout(
    () => {
      toast.remove();
    },
    5000
  );
}


/* ============================================================
   FIELD ERRORS
   ============================================================ */

function setFieldError(
  input,
  errorElement,
  message
) {
  if (input) {
    input.setAttribute(
      "aria-invalid",
      "true"
    );
  }

  if (errorElement) {
    errorElement.textContent =
      message;

    errorElement.hidden =
      false;
  }
}


function clearFieldError(
  input,
  errorElement
) {
  if (input) {
    input.removeAttribute(
      "aria-invalid"
    );
  }

  if (errorElement) {
    errorElement.textContent =
      "";

    errorElement.hidden =
      true;
  }
}


function showItemFormError(
  message
) {
  if (!DOM.itemFormError) {
    return;
  }

  DOM.itemFormError.textContent =
    message;

  DOM.itemFormError.hidden =
    false;
}


function clearItemFormError() {
  if (!DOM.itemFormError) {
    return;
  }

  DOM.itemFormError.textContent =
    "";

  DOM.itemFormError.hidden =
    true;
}


/* ============================================================
   ROW BUTTONS
   ============================================================ */

function createRowButton(
  label,
  action,
  index,
  danger,
  type = "category"
) {
  const button =
    document.createElement("button");

  button.type = "button";

  button.className =
    "row-button";

  if (danger) {
    button.classList.add(
      "row-button--danger"
    );
  }

  button.textContent =
    label;

  if (type === "item") {
    button.dataset.itemAction =
      action;

    button.dataset.itemIndex =
      String(index);
  } else {
    button.dataset.categoryAction =
      action;

    button.dataset.categoryIndex =
      String(index);
  }

  return button;
}


/* ============================================================
   YOUTUBE
   ============================================================ */

function normalizeYouTubeUrl(
  value
) {
  const input =
    cleanUrlText(value);

  if (!input) {
    return "";
  }

  const url =
    normalizeHttpUrl(input);

  if (!url) {
    return "";
  }

  const hostname =
    url.hostname
      .toLowerCase()
      .replace(
        /^www\./,
        ""
      );

  let videoId = "";

  if (
    hostname === "youtu.be"
  ) {
    videoId =
      url.pathname
        .replace(
          /^\/+/,
          ""
        )
        .split(
          "/"
        )[0]
        .trim();
  }

  if (
    hostname ===
      "youtube.com" ||
    hostname ===
      "m.youtube.com"
  ) {
    const shortsMatch =
      url.pathname.match(
        /^\/shorts\/([^/?#]+)/i
      );

    const embedMatch =
      url.pathname.match(
        /^\/embed\/([^/?#]+)/i
      );

    if (shortsMatch) {
      videoId =
        shortsMatch[1];
    } else if (embedMatch) {
      videoId =
        embedMatch[1];
    } else if (
      url.pathname === "/watch"
    ) {
      videoId =
        url.searchParams.get(
          "v"
        ) || "";
    } else if (
      url.pathname.startsWith(
        "/v/"
      )
    ) {
      videoId =
        url.pathname
          .split(
            "/"
          )[2] || "";
    }
  }

  videoId =
    String(videoId)
      .trim()
      .replace(
        /[^A-Za-z0-9_-]/g,
        ""
      );

  if (
    !/^[A-Za-z0-9_-]{6,20}$/.test(
      videoId
    )
  ) {
    return "";
  }

  return (
    `https://www.youtube.com/watch?v=${encodeURIComponent(
      videoId
    )}`
  );
}


/* ============================================================
   URL HELPERS
   ============================================================ */

function normalizeHttpUrl(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  const input =
    value.trim();

  if (!input) {
    return "";
  }

  try {
    const url =
      new URL(input);

    if (
      url.protocol !==
      "https:"
    ) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}


function cleanUrlText(
  value
) {
  return String(
    value ?? ""
  ).trim();
}


/* ============================================================
   TEXT HELPERS
   ============================================================ */

function cleanText(
  value
) {
  return String(
    value ?? ""
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function normalizeForComparison(
  value
) {
  return cleanText(
    value
  ).toLocaleLowerCase();
}


/* ============================================================
   PHONE / EMAIL VALIDATION
   ============================================================ */

function isValidPhone(
  value
) {
  const digits =
    String(value)
      .replace(
        /\D/g,
        ""
      );

  return (
    digits.length >= 7 &&
    digits.length <= 15
  );
}


function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value)
      .trim()
  );
}


/* ============================================================
   ID GENERATION
   ============================================================ */

function createId(
  prefix
) {
  const timestamp =
    Date.now()
      .toString(36);

  const random =
    Math.random()
      .toString(36)
      .slice(2, 10);

  return `${prefix}-${timestamp}-${random}`;
}


/* ============================================================
   CATEGORY HELPERS
   ============================================================ */

function getCategoryName(
  categoryId
) {
  const category =
    state.categories.find(
      item =>
        item.id ===
        categoryId
    );

  return (
    category?.name ||
    "Uncategorized"
  );
}


/* ============================================================
   FORMATTERS
   ============================================================ */

function formatCurrency(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "₹0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(number);
}


function formatDateTime(
  isoValue
) {
  if (!isoValue) {
    return "—";
  }

  const date =
    new Date(isoValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(date);
}


/* ============================================================
   FINAL SAFETY
   ============================================================ */

window.addEventListener(
  "error",
  event => {
    console.error(
      "Vidhwaan Business Apps error:",
      event.error ||
        event.message
    );
  }
);

window.addEventListener(
  "unhandledrejection",
  event => {
    console.error(
      "Vidhwaan Business Apps unhandled rejection:",
      event.reason
    );
  }
);
