"use strict";

/*
 * Vidhwaan Business Apps
 * Builder Application
 *
 * Step 8
 * File: business/app.js
 *
 * Ecommerce builder frontend.
 *
 * IMPORTANT:
 * - This file is matched to the current index.html DOM.
 * - Subscription verification is performed by the Cloudflare Worker.
 * - The browser never treats the Subscription ID as proof of payment.
 * - The Worker is authoritative for payment, application and expiry checks.
 */

const CONFIG = Object.freeze({
  WORKER_URL:
    "https://divine-snowflake-aabd.propertiesgrouphyd.workers.dev",

  TEMPLATE_ID:
    "ECM",

  MAX_CATEGORIES:
    50,

  MAX_ITEMS_PER_CATEGORY:
    500,

  MAX_TOTAL_ITEMS:
    5000,

  MAX_CATEGORY_NAME_LENGTH:
    100,

  MAX_ITEM_NAME_LENGTH:
    150,

  MAX_BUSINESS_NAME_LENGTH:
    120,

  MAX_TAGLINE_LENGTH:
    200,

  MAX_ADDRESS_LENGTH:
    500,

  MAX_PHONE_LENGTH:
    30,

  MAX_EMAIL_LENGTH:
    254,

  MAX_WHATSAPP_LENGTH:
    30,

  MAX_LOGO_URL_LENGTH:
    2000,

  MAX_DESCRIPTION_LENGTH:
    1000,

  MAX_YOUTUBE_URL_LENGTH:
    2000,

  REQUEST_TIMEOUT_MS:
    30000,

  MAX_LOCATION_ACCURACY_METERS:
    100,

  LOCATION_TIMEOUT_MS:
    30000

});


const DEFAULT_CATEGORIES = Object.freeze([
  "Grocery",
  "Clothing",
  "Food",
  "Electronics",
  "Home & Kitchen",
  "Beauty & Personal Care"
]);


const state = {
  selectedTemplate:
    null,

  categories:
    [],

  editingCategoryId:
    null,

  editingItemId:
    null,

  editingItemCategoryId:
    null,

  location: {
    verified:
      false,

    latitude:
      null,

    longitude:
      null,

    accuracy:
      null,

    verifiedAt:
      null
  },

  publishing:
    false,

  lastPublishedUrl:
    "",

  logoPreviewRequest:
    0
};


const DOM = {};


document.addEventListener(
  "DOMContentLoaded",
  initialize
);


function initialize() {
  cacheDom();
  bindEvents();
  initializeApplication();
}


/* =========================================================
 * DOM
 * ========================================================= */


function cacheDom() {
  DOM.connectionStatus =
    document.getElementById(
      "connection-status"
    );

  DOM.connectionText =
    document.getElementById(
      "connection-text"
    );

  DOM.templateSection =
    document.getElementById(
      "template-section"
    );

  DOM.templateGrid =
    document.getElementById(
      "template-grid"
    );

  DOM.templateEcommerce =
    document.getElementById(
      "template-ecommerce"
    );

  DOM.ecommerceSection =
    document.getElementById(
      "ecommerce-section"
    );

  DOM.backToTemplates =
    document.getElementById(
      "back-to-templates"
    );

  DOM.subscriptionId =
    document.getElementById(
      "subscription-id"
    );

  DOM.subscriptionError =
    document.getElementById(
      "subscription-error"
    );

  DOM.businessName =
    document.getElementById(
      "business-name"
    );

  DOM.tagline =
    document.getElementById(
      "business-tagline"
    );

  DOM.address =
    document.getElementById(
      "business-address"
    );

  DOM.mobile =
    document.getElementById(
      "business-mobile"
    );

  DOM.email =
    document.getElementById(
      "business-email"
    );

  DOM.whatsapp =
    document.getElementById(
      "business-whatsapp"
    );

  DOM.logoUrl =
    document.getElementById(
      "business-logo"
    );

  DOM.logoPreview =
    document.getElementById(
      "logo-preview"
    );

  DOM.logoPreviewImage =
    document.getElementById(
      "logo-preview-image"
    );

  DOM.locationStatus =
    document.getElementById(
      "location-status"
    );

  DOM.locationStatusIndicator =
    document.getElementById(
      "location-status-indicator"
    );

  DOM.locationStatusText =
    document.getElementById(
      "location-status-text"
    );

  DOM.verifyLocation =
    document.getElementById(
      "verify-location"
    );

  DOM.locationDetails =
    document.getElementById(
      "location-details"
    );

  DOM.locationLatitude =
    document.getElementById(
      "location-latitude"
    );

  DOM.locationLongitude =
    document.getElementById(
      "location-longitude"
    );

  DOM.locationVerifiedAt =
    document.getElementById(
      "location-verified-at"
    );

  DOM.addCategory =
    document.getElementById(
      "add-category"
    );

  DOM.addFirstCategory =
    document.getElementById(
      "add-first-category"
    );

  DOM.categoryList =
    document.getElementById(
      "category-list"
    );

  DOM.categoryEmpty =
    document.getElementById(
      "category-empty"
    );

  DOM.categoryModal =
    document.getElementById(
      "category-modal"
    );

  DOM.categoryModalTitle =
    document.getElementById(
      "category-modal-title"
    );

  DOM.categoryModalClose =
    document.getElementById(
      "category-modal-close"
    );

  DOM.categoryName =
    document.getElementById(
      "category-name"
    );

  DOM.categoryNameError =
    document.getElementById(
      "category-name-error"
    );

  DOM.categoryCancel =
    document.getElementById(
      "category-cancel"
    );

  DOM.categorySave =
    document.getElementById(
      "category-save"
    );

  DOM.addItem =
    document.getElementById(
      "add-item"
    );

  DOM.addFirstItem =
    document.getElementById(
      "add-first-item"
    );

  DOM.itemList =
    document.getElementById(
      "item-list"
    );

  DOM.itemEmpty =
    document.getElementById(
      "item-empty"
    );

  DOM.itemModal =
    document.getElementById(
      "item-modal"
    );

  DOM.itemModalTitle =
    document.getElementById(
      "item-modal-title"
    );

  DOM.itemModalClose =
    document.getElementById(
      "item-modal-close"
    );

  DOM.itemName =
    document.getElementById(
      "item-name"
    );

  DOM.itemPrice =
    document.getElementById(
      "item-price"
    );

  DOM.itemQuantity =
    document.getElementById(
      "item-quantity"
    );

  DOM.itemUnit =
    document.getElementById(
      "item-unit"
    );

  DOM.itemCategory =
    document.getElementById(
      "item-category"
    );

  DOM.itemDescription =
    document.getElementById(
      "item-description"
    );

  DOM.itemYoutube =
    document.getElementById(
      "item-youtube"
    );

  DOM.itemFormError =
    document.getElementById(
      "item-form-error"
    );

  DOM.itemCancel =
    document.getElementById(
      "item-cancel"
    );

  DOM.itemSave =
    document.getElementById(
      "item-save"
    );

  DOM.validationSummary =
    document.getElementById(
      "validation-summary"
    );

  DOM.validationList =
    document.getElementById(
      "validation-list"
    );

  DOM.publishBusiness =
    document.getElementById(
      "publish-business"
    );

  DOM.publishSpinner =
    document.getElementById(
      "publish-spinner"
    );

  DOM.publishButtonText =
    document.getElementById(
      "publish-button-text"
    );

  DOM.publishStatus =
    document.getElementById(
      "publish-status"
    );

  DOM.successSection =
    document.getElementById(
      "success-section"
    );

  DOM.successDescription =
    document.getElementById(
      "success-description"
    );

  DOM.businessAppUrl =
    document.getElementById(
      "business-app-url"
    );

  DOM.openBusinessApp =
    document.getElementById(
      "open-business-app"
    );

  DOM.editBusiness =
    document.getElementById(
      "edit-business"
    );

  DOM.createAnother =
    document.getElementById(
      "create-another"
    );

  DOM.applicationLoader =
    document.getElementById(
      "application-loader"
    );

  DOM.loaderText =
    document.getElementById(
      "loader-text"
    );

  DOM.toastContainer =
    document.getElementById(
      "toast-container"
    );
}


/* =========================================================
 * EVENTS
 * ========================================================= */


function bindEvents() {
  if (DOM.templateEcommerce) {
    DOM.templateEcommerce.addEventListener(
      "click",
      () => selectTemplate("ECM")
    );
  }

  if (DOM.backToTemplates) {
    DOM.backToTemplates.addEventListener(
      "click",
      showTemplateSelection
    );
  }

  if (DOM.addCategory) {
    DOM.addCategory.addEventListener(
      "click",
      () => openCategoryModal()
    );
  }

  if (DOM.addFirstCategory) {
    DOM.addFirstCategory.addEventListener(
      "click",
      () => openCategoryModal()
    );
  }

  if (DOM.categoryModalClose) {
    DOM.categoryModalClose.addEventListener(
      "click",
      closeCategoryModal
    );
  }

  if (DOM.categoryCancel) {
    DOM.categoryCancel.addEventListener(
      "click",
      closeCategoryModal
    );
  }

  if (DOM.categorySave) {
    DOM.categorySave.addEventListener(
      "click",
      saveCategory
    );
  }

  if (DOM.categoryModal) {
    DOM.categoryModal.addEventListener(
      "click",
      handleModalBackdrop
    );
  }

  if (DOM.addItem) {
    DOM.addItem.addEventListener(
      "click",
      () => openItemModal()
    );
  }

  if (DOM.addFirstItem) {
    DOM.addFirstItem.addEventListener(
      "click",
      () => openItemModal()
    );
  }

  if (DOM.itemModalClose) {
    DOM.itemModalClose.addEventListener(
      "click",
      closeItemModal
    );
  }

  if (DOM.itemCancel) {
    DOM.itemCancel.addEventListener(
      "click",
      closeItemModal
    );
  }

  if (DOM.itemSave) {
    DOM.itemSave.addEventListener(
      "click",
      saveItem
    );
  }

  if (DOM.itemModal) {
    DOM.itemModal.addEventListener(
      "click",
      handleModalBackdrop
    );
  }

  if (DOM.categoryList) {
    DOM.categoryList.addEventListener(
      "click",
      handleCategoryAction
    );
  }

  if (DOM.itemList) {
    DOM.itemList.addEventListener(
      "click",
      handleItemAction
    );
  }

  if (DOM.verifyLocation) {
    DOM.verifyLocation.addEventListener(
      "click",
      verifyBusinessLocation
    );
  }

  if (DOM.logoUrl) {
    DOM.logoUrl.addEventListener(
      "input",
      previewLogo
    );

    DOM.logoUrl.addEventListener(
      "change",
      previewLogo
    );
  }

  if (DOM.publishBusiness) {
    DOM.publishBusiness.addEventListener(
      "click",
      publishBusiness
    );
  }

  if (DOM.openBusinessApp) {
    DOM.openBusinessApp.addEventListener(
      "click",
      openPublishedBusiness
    );
  }

  if (DOM.editBusiness) {
    DOM.editBusiness.addEventListener(
      "click",
      editBusiness
    );
  }

  if (DOM.createAnother) {
    DOM.createAnother.addEventListener(
      "click",
      createAnotherApp
    );
  }

  document.addEventListener(
    "keydown",
    handleKeyboard
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


/* =========================================================
 * APPLICATION START
 * ========================================================= */


function initializeApplication() {
  state.selectedTemplate = null;

  seedDefaultCategories();

  renderCategories();
  renderItems();
  updateItemCategorySelect();

  showTemplateSelection();
  updateConnectionStatus();

  hideSuccess();
  hideValidation();
}


/* =========================================================
 * TEMPLATE SELECTION
 * ========================================================= */


function selectTemplate(templateId) {
  if (templateId !== "ECM") {
    showToast(
      "This template is not currently available.",
      "error"
    );

    return;
  }

  state.selectedTemplate =
    templateId;

  hideSuccess();
  hideValidation();

  if (DOM.templateSection) {
    DOM.templateSection.hidden = true;
  }

  if (DOM.ecommerceSection) {
    DOM.ecommerceSection.hidden = false;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  showToast(
    "Ecommerce app selected.",
    "success"
  );
}


function showTemplateSelection() {
  state.selectedTemplate = null;

  if (DOM.templateSection) {
    DOM.templateSection.hidden = false;
  }

  if (DOM.ecommerceSection) {
    DOM.ecommerceSection.hidden = true;
  }

  hideSuccess();
  hideValidation();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
 * DEFAULT CATEGORIES
 * ========================================================= */


function seedDefaultCategories() {
  if (state.categories.length > 0) {
    return;
  }

  state.categories =
    DEFAULT_CATEGORIES.map(
      (name) => ({
        id: createId("cat"),
        name,
        items: []
      })
    );
}


/* =========================================================
 * CATEGORY MODAL
 * ========================================================= */


function openCategoryModal(
  categoryId = null
) {
  state.editingCategoryId =
    categoryId;

  clearCategoryError();

  if (categoryId) {
    const category =
      findCategory(categoryId);

    if (!category) {
      return;
    }

    if (DOM.categoryModalTitle) {
      DOM.categoryModalTitle.textContent =
        "Edit Category";
    }

    if (DOM.categorySave) {
      DOM.categorySave.textContent =
        "Update Category";
    }

    if (DOM.categoryName) {
      DOM.categoryName.value =
        category.name;
    }
  } else {
    if (DOM.categoryModalTitle) {
      DOM.categoryModalTitle.textContent =
        "Add Category";
    }

    if (DOM.categorySave) {
      DOM.categorySave.textContent =
        "Add Category";
    }

    if (DOM.categoryName) {
      DOM.categoryName.value =
        "";
    }
  }

  showModal(
    DOM.categoryModal
  );

  requestAnimationFrame(
    () => {
      focusElement(
        DOM.categoryName
      );
    }
  );
}


function closeCategoryModal() {
  state.editingCategoryId =
    null;

  clearCategoryError();

  if (DOM.categoryName) {
    DOM.categoryName.value =
      "";
  }

  hideModal(
    DOM.categoryModal
  );
}


function saveCategory() {
  clearCategoryError();

  const name =
    normalizeText(
      DOM.categoryName
        ? DOM.categoryName.value
        : "",
      CONFIG.MAX_CATEGORY_NAME_LENGTH
    );

  if (!name) {
    showCategoryError(
      "Please enter a category name."
    );

    focusElement(
      DOM.categoryName
    );

    return;
  }

  if (
    state.editingCategoryId
  ) {
    const category =
      findCategory(
        state.editingCategoryId
      );

    if (!category) {
      showCategoryError(
        "The selected category could not be found."
      );

      return;
    }

    const duplicate =
      state.categories.some(
        (entry) =>
          entry.id !==
            category.id &&
          entry.name.toLowerCase() ===
            name.toLowerCase()
      );

    if (duplicate) {
      showCategoryError(
        "A category with this name already exists."
      );

      return;
    }

    category.name =
      name;

    closeCategoryModal();

    renderCategories();
    renderItems();
    updateItemCategorySelect();

    showToast(
      "Category updated.",
      "success"
    );

    return;
  }

  if (
    state.categories.length >=
    CONFIG.MAX_CATEGORIES
  ) {
    showCategoryError(
      `Maximum ${CONFIG.MAX_CATEGORIES} categories are allowed.`
    );

    return;
  }

  const duplicate =
    state.categories.some(
      (entry) =>
        entry.name.toLowerCase() ===
        name.toLowerCase()
    );

  if (duplicate) {
    showCategoryError(
      "A category with this name already exists."
    );

    return;
  }

  state.categories.push({
    id: createId("cat"),
    name,
    items: []
  });

  closeCategoryModal();

  renderCategories();
  updateItemCategorySelect();

  showToast(
    "Category added.",
    "success"
  );
}


function handleCategoryAction(
  event
) {
  const button =
    event.target.closest(
      "[data-category-action]"
    );

  if (!button) {
    return;
  }

  const action =
    button.dataset.categoryAction;

  const categoryId =
    button.dataset.categoryId;

  if (!categoryId) {
    return;
  }

  if (action === "edit") {
    openCategoryModal(
      categoryId
    );

    return;
  }

  if (action === "delete") {
    deleteCategory(
      categoryId
    );

    return;
  }

  if (action === "add-item") {
    openItemModal(
      categoryId
    );
  }
}


function deleteCategory(
  categoryId
) {
  const category =
    findCategory(
      categoryId
    );

  if (!category) {
    return;
  }

  const hasItems =
    category.items.length > 0;

  const message =
    hasItems
      ? `Delete "${category.name}" and all ${category.items.length} item(s) inside it?`
      : `Delete "${category.name}"?`;

  if (
    !window.confirm(
      message
    )
  ) {
    return;
  }

  state.categories =
    state.categories.filter(
      (entry) =>
        entry.id !==
        categoryId
    );

  renderCategories();
  renderItems();
  updateItemCategorySelect();

  showToast(
    "Category deleted.",
    "success"
  );
}


/* =========================================================
 * CATEGORY RENDER
 * ========================================================= */


function renderCategories() {
  if (!DOM.categoryList) {
    return;
  }

  DOM.categoryList.replaceChildren();

  const hasCategories =
    state.categories.length > 0;

  if (DOM.categoryEmpty) {
    DOM.categoryEmpty.hidden =
      hasCategories;
  }

  if (!hasCategories) {
    return;
  }

  state.categories.forEach(
    (category) => {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "category-row";

      const name =
        document.createElement(
          "div"
        );

      name.className =
        "category-row__name";

      name.textContent =
        category.name;

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "category-row__actions";

      const count =
        document.createElement(
          "span"
        );

      count.textContent =
        `${category.items.length} item${
          category.items.length === 1
            ? ""
            : "s"
        }`;

      const addItem =
        createButton(
          "Add Item",
          "category-row__action",
          "add-item",
          category.id
        );

      const edit =
        createButton(
          "Edit",
          "category-row__action",
          "edit",
          category.id
        );

      const remove =
        createButton(
          "Delete",
          "category-row__action",
          "delete",
          category.id
        );

      actions.appendChild(
        count
      );

      actions.appendChild(
        addItem
      );

      actions.appendChild(
        edit
      );

      actions.appendChild(
        remove
      );

      row.appendChild(
        name
      );

      row.appendChild(
        actions
      );

      DOM.categoryList.appendChild(
        row
      );
    }
  );
}


/* =========================================================
 * ITEM MODAL
 * ========================================================= */


function openItemModal(
  categoryId = null,
  itemId = null
) {
  clearItemError();

  state.editingItemId =
    itemId;

  state.editingItemCategoryId =
    categoryId;

  updateItemCategorySelect();

  if (itemId) {
    const result =
      findItem(
        categoryId,
        itemId
      );

    if (!result) {
      return;
    }

    const item =
      result.item;

    if (DOM.itemModalTitle) {
      DOM.itemModalTitle.textContent =
        "Edit Item";
    }

    if (DOM.itemSave) {
      DOM.itemSave.textContent =
        "Update Item";
    }

    setValue(
      DOM.itemName,
      item.name
    );

    setValue(
      DOM.itemPrice,
      item.price
    );

    setValue(
      DOM.itemQuantity,
      item.quantity
    );

    setValue(
      DOM.itemUnit,
      item.unit
    );

    setValue(
      DOM.itemCategory,
      result.category.id
    );

    setValue(
      DOM.itemDescription,
      item.description || ""
    );

    setValue(
      DOM.itemYoutube,
      item.youtubeUrl || ""
    );
  } else {
    if (DOM.itemModalTitle) {
      DOM.itemModalTitle.textContent =
        "Add Item";
    }

    if (DOM.itemSave) {
      DOM.itemSave.textContent =
        "Add Item";
    }

    clearItemFields();

    if (
      categoryId &&
      DOM.itemCategory
    ) {
      DOM.itemCategory.value =
        categoryId;
    }
  }

  showModal(
    DOM.itemModal
  );

  requestAnimationFrame(
    () => {
      focusElement(
        DOM.itemName
      );
    }
  );
}


function closeItemModal() {
  state.editingItemId =
    null;

  state.editingItemCategoryId =
    null;

  clearItemError();
  clearItemFields();

  hideModal(
    DOM.itemModal
  );
}


function saveItem() {
  clearItemError();

  const categoryId =
    DOM.itemCategory
      ? DOM.itemCategory.value
      : "";

  const name =
    normalizeText(
      DOM.itemName
        ? DOM.itemName.value
        : "",
      CONFIG.MAX_ITEM_NAME_LENGTH
    );

  const price =
    parseNumber(
      DOM.itemPrice
        ? DOM.itemPrice.value
        : ""
    );

  const quantity =
    parseNumber(
      DOM.itemQuantity
        ? DOM.itemQuantity.value
        : ""
    );

  const unit =
    normalizeText(
      DOM.itemUnit
        ? DOM.itemUnit.value
        : "",
      50
    );

  const description =
    normalizeText(
      DOM.itemDescription
        ? DOM.itemDescription.value
        : "",
      CONFIG.MAX_DESCRIPTION_LENGTH
    );

  const youtubeUrl =
    normalizeText(
      DOM.itemYoutube
        ? DOM.itemYoutube.value
        : "",
      CONFIG.MAX_YOUTUBE_URL_LENGTH
    );

  if (!categoryId) {
    showItemError(
      "Please select a category."
    );

    focusElement(
      DOM.itemCategory
    );

    return;
  }

  const category =
    findCategory(
      categoryId
    );

  if (!category) {
    showItemError(
      "The selected category could not be found."
    );

    return;
  }

  if (!name) {
    showItemError(
      "Please enter an item name."
    );

    focusElement(
      DOM.itemName
    );

    return;
  }

  if (
    price === null ||
    price < 0
  ) {
    showItemError(
      "Please enter a valid price."
    );

    focusElement(
      DOM.itemPrice
    );

    return;
  }

  if (
    quantity !== null &&
    quantity < 0
  ) {
    showItemError(
      "Quantity cannot be negative."
    );

    focusElement(
      DOM.itemQuantity
    );

    return;
  }

  if (
    youtubeUrl &&
    !isValidYoutubeUrl(
      youtubeUrl
    )
  ) {
    showItemError(
      "Please enter a valid YouTube or YouTube Shorts URL."
    );

    focusElement(
      DOM.itemYoutube
    );

    return;
  }

  if (
    state.editingItemId
  ) {
    const result =
      findItem(
        state.editingItemCategoryId,
        state.editingItemId
      );

    if (!result) {
      showItemError(
        "The selected item could not be found."
      );

      return;
    }

    const duplicate =
      category.items.some(
        (item) =>
          item.id !==
            result.item.id &&
          item.name.toLowerCase() ===
            name.toLowerCase()
      );

    if (duplicate) {
      showItemError(
        "An item with this name already exists in this category."
      );

      return;
    }

    result.item.name =
      name;

    result.item.price =
      price;

    result.item.quantity =
      quantity === null
        ? 0
        : quantity;

    result.item.unit =
      unit;

    result.item.description =
      description;

    result.item.youtubeUrl =
      youtubeUrl;

    closeItemModal();

    renderItems();

    showToast(
      "Item updated.",
      "success"
    );

    return;
  }

  const totalItems =
    getTotalItemCount();

  if (
    totalItems >=
    CONFIG.MAX_TOTAL_ITEMS
  ) {
    showItemError(
      `Maximum ${CONFIG.MAX_TOTAL_ITEMS} total items are allowed.`
    );

    return;
  }

  if (
    category.items.length >=
    CONFIG.MAX_ITEMS_PER_CATEGORY
  ) {
    showItemError(
      `Maximum ${CONFIG.MAX_ITEMS_PER_CATEGORY} items are allowed in one category.`
    );

    return;
  }

  const duplicate =
    category.items.some(
      (item) =>
        item.name.toLowerCase() ===
        name.toLowerCase()
    );

  if (duplicate) {
    showItemError(
      "An item with this name already exists in this category."
    );

    return;
  }

  category.items.push({
    id:
      createId("item"),

    name:
      name,

    price:
      price,

    quantity:
      quantity === null
        ? 0
        : quantity,

    unit:
      unit,

    description:
      description,

    youtubeUrl:
      youtubeUrl
  });

  closeItemModal();

  renderItems();

  showToast(
    "Item added.",
    "success"
  );
}


function handleItemAction(
  event
) {
  const button =
    event.target.closest(
      "[data-item-action]"
    );

  if (!button) {
    return;
  }

  const action =
    button.dataset.itemAction;

  const categoryId =
    button.dataset.categoryId;

  const itemId =
    button.dataset.itemId;

  if (!categoryId || !itemId) {
    return;
  }

  if (action === "edit") {
    openItemModal(
      categoryId,
      itemId
    );

    return;
  }

  if (action === "delete") {
    deleteItem(
      categoryId,
      itemId
    );
  }
}


function deleteItem(
  categoryId,
  itemId
) {
  const result =
    findItem(
      categoryId,
      itemId
    );

  if (!result) {
    return;
  }

  if (
    !window.confirm(
      `Delete "${result.item.name}"?`
    )
  ) {
    return;
  }

  result.category.items =
    result.category.items.filter(
      (item) =>
        item.id !==
        itemId
    );

  renderItems();

  showToast(
    "Item deleted.",
    "success"
  );
}


/* =========================================================
 * ITEM RENDER
 * ========================================================= */


function renderItems() {
  if (!DOM.itemList) {
    return;
  }

  DOM.itemList.replaceChildren();

  const totalItems =
    getTotalItemCount();

  if (DOM.itemEmpty) {
    DOM.itemEmpty.hidden =
      totalItems > 0;
  }

  if (totalItems === 0) {
    return;
  }

  state.categories.forEach(
    (category) => {
      category.items.forEach(
        (item) => {
          const row =
            document.createElement(
              "div"
            );

          row.className =
            "item-row";

          const main =
            document.createElement(
              "div"
            );

          main.className =
            "item-row__main";

          const name =
            document.createElement(
              "div"
            );

          name.className =
            "item-row__name";

          name.textContent =
            item.name;

          const meta =
            document.createElement(
              "div"
            );

          meta.className =
            "item-row__meta";

          const quantityText =
            item.quantity > 0
              ? ` · ${formatNumber(
                  item.quantity
                )} ${item.unit || ""}`
              : "";

          meta.textContent =
            `${category.name} · ₹${formatNumber(
              item.price
            )}${quantityText}`;

          main.appendChild(
            name
          );

          main.appendChild(
            meta
          );

          if (
            item.description
          ) {
            const description =
              document.createElement(
                "div"
              );

            description.className =
              "item-row__description";

            description.textContent =
              item.description;

            main.appendChild(
              description
            );
          }

          if (
            item.youtubeUrl
          ) {
            const video =
              document.createElement(
                "div"
              );

            video.className =
              "item-row__video";

            video.textContent =
              "YouTube video attached";

            main.appendChild(
              video
            );
          }

          const actions =
            document.createElement(
              "div"
            );

          actions.className =
            "item-row__actions";

          const edit =
            createButton(
              "Edit",
              "item-row__action",
              "edit",
              category.id,
              item.id
            );

          const remove =
            createButton(
              "Delete",
              "item-row__action",
              "delete",
              category.id,
              item.id
            );

          actions.appendChild(
            edit
          );

          actions.appendChild(
            remove
          );

          row.appendChild(
            main
          );

          row.appendChild(
            actions
          );

          DOM.itemList.appendChild(
            row
          );
        }
      );
    }
  );
}


/* =========================================================
 * ITEM CATEGORY SELECT
 * ========================================================= */


function updateItemCategorySelect() {
  if (!DOM.itemCategory) {
    return;
  }

  const previousValue =
    DOM.itemCategory.value;

  DOM.itemCategory.replaceChildren();

  const placeholder =
    document.createElement(
      "option"
    );

  placeholder.value =
    "";

  placeholder.textContent =
    "Select category";

  DOM.itemCategory.appendChild(
    placeholder
  );

  state.categories.forEach(
    (category) => {
      const option =
        document.createElement(
          "option"
        );

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
      (category) =>
        category.id ===
        previousValue
    )
  ) {
    DOM.itemCategory.value =
      previousValue;
  }
}


/* =========================================================
 * LOCATION
 * ========================================================= */


async function verifyBusinessLocation() {
  if (
    !navigator.geolocation
  ) {
    setLocationError(
      "Location services are not supported by this browser."
    );

    return;
  }

  setButtonBusy(
    DOM.verifyLocation,
    true,
    "Verifying..."
  );

  setLocationText(
    "Getting an accurate GPS location. Please wait...",
    false
  );

  try {
    const position =
      await getCurrentPosition();

    const latitude =
      Number(
        position.coords.latitude
      );

    const longitude =
      Number(
        position.coords.longitude
      );

    const accuracy =
      Number(
        position.coords.accuracy
      );

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      throw new Error(
        "The browser returned an invalid location."
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        "The returned coordinates are invalid."
      );
    }

    if (
      !Number.isFinite(
        accuracy
      ) ||
      accuracy <= 0
    ) {
      throw new Error(
        "The device could not determine GPS accuracy. Please enable precise location and try again."
      );
    }

    if (
      accuracy >
      CONFIG.MAX_LOCATION_ACCURACY_METERS
    ) {
      throw new Error(
        `Location accuracy is too low (approximately ${Math.round(
          accuracy
        )} metres). Please enable precise location, stay at the business location, and try again.`
      );
    }

    const verifiedAt =
      new Date()
        .toISOString();

    state.location = {
      verified:
        true,

      latitude:
        latitude,

      longitude:
        longitude,

      accuracy:
        accuracy,

      verifiedAt:
        verifiedAt
    };

    updateLocationDetails();

    setLocationText(
      `Business location verified. Accuracy: approximately ${Math.round(
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
      verified:
        false,

      latitude:
        null,

      longitude:
        null,

      accuracy:
        null,

      verifiedAt:
        null
    };

    updateLocationDetails();

    setLocationError(
      getLocationErrorMessage(
        error
      )
    );

  } finally {
    setButtonBusy(
      DOM.verifyLocation,
      false
    );
  }
}


function getCurrentPosition() {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      let bestPosition =
        null;

      let settled =
        false;

      let watchId =
        null;

      let timerId =
        null;

      const cleanup = () => {
        if (
          timerId !== null
        ) {
          window.clearTimeout(
            timerId
          );

          timerId =
            null;
        }

        if (
          watchId !== null
        ) {
          navigator.geolocation.clearWatch(
            watchId
          );

          watchId =
            null;
        }
      };

      const finish = (
        position
      ) => {
        if (
          settled
        ) {
          return;
        }

        settled =
          true;

        cleanup();

        resolve(
          position
        );
      };

      const fail = (
        error
      ) => {
        if (
          settled
        ) {
          return;
        }

        settled =
          true;

        cleanup();

        reject(
          error
        );
      };

      const handlePosition = (
        position
      ) => {
        const accuracy =
          Number(
            position &&
            position.coords &&
            position.coords.accuracy
          );

        if (
          !Number.isFinite(
            accuracy
          ) ||
          accuracy <= 0
        ) {
          return;
        }

        if (
          !bestPosition ||
          accuracy <
            Number(
              bestPosition.coords.accuracy
            )
        ) {
          bestPosition =
            position;
        }

        if (
          accuracy <=
          CONFIG.MAX_LOCATION_ACCURACY_METERS
        ) {
          finish(
            position
          );
        }
      };

      const handleError = (
        error
      ) => {
        if (
          bestPosition &&
          Number(
            bestPosition.coords.accuracy
          ) <=
            CONFIG.MAX_LOCATION_ACCURACY_METERS
        ) {
          finish(
            bestPosition
          );
          return;
        }

        fail(
          error
        );
      };

      timerId =
        window.setTimeout(
          () => {
            if (
              bestPosition &&
              Number(
                bestPosition.coords.accuracy
              ) <=
                CONFIG.MAX_LOCATION_ACCURACY_METERS
            ) {
              finish(
                bestPosition
              );
              return;
            }

            fail(
              new Error(
                "Unable to obtain an accurate GPS location within 30 seconds. Please enable precise location and try again."
              )
            );
          },
          CONFIG.LOCATION_TIMEOUT_MS
        );

      try {
        watchId =
          navigator.geolocation.watchPosition(
            handlePosition,
            handleError,
            {
              enableHighAccuracy:
                true,

              timeout:
                CONFIG.LOCATION_TIMEOUT_MS,

              maximumAge:
                0
            }
          );
      } catch (error) {
        fail(
          error
        );
      }
    }
  );
}




function updateLocationDetails() {
  if (
    DOM.locationDetails
  ) {
    DOM.locationDetails.hidden =
      !state.location.verified;
  }

  if (
    DOM.locationLatitude
  ) {
    DOM.locationLatitude.textContent =
      state.location.verified
        ? formatCoordinate(
            state.location.latitude
          )
        : "—";
  }

  if (
    DOM.locationLongitude
  ) {
    DOM.locationLongitude.textContent =
      state.location.verified
        ? formatCoordinate(
            state.location.longitude
          )
        : "—";
  }

  if (
    DOM.locationVerifiedAt
  ) {
    DOM.locationVerifiedAt.textContent =
      state.location.verified
        ? formatDateTime(
            state.location.verifiedAt
          )
        : "—";
  }
}


function setLocationText(
  message,
  verified
) {
  if (
    DOM.locationStatusText
  ) {
    DOM.locationStatusText.textContent =
      message;
  }

  if (
    DOM.locationStatus
  ) {
    DOM.locationStatus.classList.toggle(
      "is-verified",
      Boolean(verified)
    );

    DOM.locationStatus.classList.toggle(
      "is-error",
      false
    );
  }

  if (
    DOM.locationStatusIndicator
  ) {
    DOM.locationStatusIndicator.classList.toggle(
      "is-verified",
      Boolean(verified)
    );
  }
}


function setLocationError(
  message
) {
  if (
    DOM.locationStatusText
  ) {
    DOM.locationStatusText.textContent =
      message;
  }

  if (
    DOM.locationStatus
  ) {
    DOM.locationStatus.classList.remove(
      "is-verified"
    );

    DOM.locationStatus.classList.add(
      "is-error"
    );
  }

  showToast(
    message,
    "error"
  );
}


function formatCoordinate(
  value
) {
  return Number(
    value
  ).toFixed(6);
}


function formatDateTime(
  value
) {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short"
    }
  );
}


/* =========================================================
 * LOGO PREVIEW
 * ========================================================= */


function previewLogo() {
  const requestId =
    ++state.logoPreviewRequest;

  const value =
    normalizeText(
      DOM.logoUrl
        ? DOM.logoUrl.value
        : "",
      CONFIG.MAX_LOGO_URL_LENGTH
    );

  if (
    !value ||
    !isValidHttpsUrl(
      value
    )
  ) {
    hideLogoPreview();

    return;
  }

  if (
    !DOM.logoPreview ||
    !DOM.logoPreviewImage
  ) {
    return;
  }

  DOM.logoPreview.hidden =
    false;

  DOM.logoPreviewImage.alt =
    "Business logo preview";

  DOM.logoPreviewImage.src =
    "";

  DOM.logoPreviewImage.onload =
    () => {
      if (
        requestId !==
        state.logoPreviewRequest
      ) {
        return;
      }

      DOM.logoPreview.hidden =
        false;
    };

  DOM.logoPreviewImage.onerror =
    () => {
      if (
        requestId !==
        state.logoPreviewRequest
      ) {
        return;
      }

      hideLogoPreview();
    };

  DOM.logoPreviewImage.src =
    value;
}


function hideLogoPreview() {
  if (
    DOM.logoPreview
  ) {
    DOM.logoPreview.hidden =
      true;
  }

  if (
    DOM.logoPreviewImage
  ) {
    DOM.logoPreviewImage.removeAttribute(
      "src"
    );
  }
}


/* =========================================================
 * VALIDATION
 * ========================================================= */


function validateBuilder() {
  const errors = [];

  const businessName =
    getValue(
      DOM.businessName
    );

  const tagline =
    getValue(
      DOM.tagline
    );

  const address =
    getValue(
      DOM.address
    );

  const mobile =
    getValue(
      DOM.mobile
    );

  const email =
    getValue(
      DOM.email
    );

  const whatsapp =
    getValue(
      DOM.whatsapp
    );

  const logoUrl =
    getValue(
      DOM.logoUrl
    );

  const subscriptionId =
    getValue(
      DOM.subscriptionId
    );

  if (
    !state.selectedTemplate
  ) {
    errors.push(
      "Please select a business app template."
    );
  }

  if (
    state.selectedTemplate !==
    CONFIG.TEMPLATE_ID
  ) {
    errors.push(
      "The selected application template is invalid."
    );
  }

  if (!subscriptionId) {
    errors.push(
      "Please enter your Subscription ID."
    );
  }

  if (!businessName) {
    errors.push(
      "Please enter the business name."
    );
  }

  if (
    !address
  ) {
    errors.push(
      "Please enter the business address."
    );
  }

  if (!mobile) {
    errors.push(
      "Please enter the business mobile number."
    );
  }

  if (
    email &&
    !isValidEmail(
      email
    )
  ) {
    errors.push(
      "Please enter a valid email address."
    );
  }

  if (!whatsapp) {
    errors.push(
      "Please enter the Business WhatsApp number."
    );
  }

  if (
    logoUrl &&
    !isValidHttpsUrl(
      logoUrl
    )
  ) {
    errors.push(
      "Logo URL must be a valid HTTPS URL."
    );
  }

  if (
    !state.location.verified
  ) {
    errors.push(
      "Please verify the business location."
    );
  }

  if (
    !Number.isFinite(
      state.location.latitude
    ) ||
    !Number.isFinite(
      state.location.longitude
    )
  ) {
    errors.push(
      "Valid business GPS coordinates are required."
    );
  }



  if (
    !Number.isFinite(
      state.location.accuracy
    ) ||
    state.location.accuracy <= 0 ||
    state.location.accuracy >
      CONFIG.MAX_LOCATION_ACCURACY_METERS
  ) {
    errors.push(
      `Business GPS accuracy must be ${CONFIG.MAX_LOCATION_ACCURACY_METERS} metres or better.`
    );
  }




  if (
    state.categories.length ===
    0
  ) {
    errors.push(
      "Please add at least one category."
    );
  }

  const totalItems =
    getTotalItemCount();

  if (
    totalItems === 0
  ) {
    errors.push(
      "Please add at least one item."
    );
  }

  state.categories.forEach(
    (category) => {
      if (!category.name) {
        errors.push(
          "Every category must have a name."
        );
      }

      if (
        category.items.length >
        CONFIG.MAX_ITEMS_PER_CATEGORY
      ) {
        errors.push(
          `Category "${category.name}" exceeds the item limit.`
        );
      }

      category.items.forEach(
        (item) => {
          if (!item.name) {
            errors.push(
              `An item in "${category.name}" is missing its name.`
            );
          }

          if (
            !Number.isFinite(
              item.price
            ) ||
            item.price < 0
          ) {
            errors.push(
              `Item "${item.name}" has an invalid price.`
            );
          }

          if (
            !Number.isFinite(
              item.quantity
            ) ||
            item.quantity < 0
          ) {
            errors.push(
              `Item "${item.name}" has an invalid quantity.`
            );
          }

          if (
            item.youtubeUrl &&
            !isValidYoutubeUrl(
              item.youtubeUrl
            )
          ) {
            errors.push(
              `Item "${item.name}" has an invalid YouTube URL.`
            );
          }
        }
      );
    }
  );

  if (
    totalItems >
    CONFIG.MAX_TOTAL_ITEMS
  ) {
    errors.push(
      `Maximum ${CONFIG.MAX_TOTAL_ITEMS} total items are allowed.`
    );
  }

  return {
    valid:
      errors.length === 0,

    errors:
      uniqueStrings(
        errors
      )
  };
}


function showValidation(
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
    (error) => {
      const li =
        document.createElement(
          "li"
        );

      li.textContent =
        error;

      DOM.validationList.appendChild(
        li
      );
    }
  );

  DOM.validationSummary.hidden =
    false;

  DOM.validationSummary.scrollIntoView(
    {
      behavior:
        "smooth",

      block:
        "center"
    }
  );
}


function hideValidation() {
  if (
    DOM.validationSummary
  ) {
    DOM.validationSummary.hidden =
      true;
  }

  if (
    DOM.validationList
  ) {
    DOM.validationList.replaceChildren();
  }
}


/* =========================================================
 * PUBLISH
 * ========================================================= */


async function publishBusiness() {
  if (
    state.publishing
  ) {
    return;
  }

  hideValidation();
  hideSuccess();
  clearSubscriptionError();

  const validation =
    validateBuilder();

  if (
    !validation.valid
  ) {
    showValidation(
      validation.errors
    );

    showToast(
      validation.errors[0] ||
        "Please review the form.",
      "error"
    );

    return;
  }

  const payload =
    buildPublishPayload();

  state.publishing =
    true;

  setPublishBusy(
    true
  );

  setPublishStatus(
    "Verifying your subscription and creating your business app..."
  );

  showLoader(
    "Verifying subscription and publishing your business app..."
  );

  try {
    const result =
      await sendPublishRequest(
        payload
      );

    if (
      !result ||
      result.success !==
        true
    ) {
      throw new Error(
        result &&
        result.message
          ? result.message
          : "The business app could not be created."
      );
    }

    if (
      !isValidHttpsUrl(
        result.url
      )
    ) {
      throw new Error(
        "The Worker did not return a valid business app URL."
      );
    }

    state.lastPublishedUrl =
      result.url;

    hideLoader();

    showSuccess(
      result
    );

    setPublishStatus(
      "Business app created successfully."
    );

  } catch (error) {
    hideLoader();

    const message =
      getErrorMessage(
        error
      );

    setPublishStatus(
      message
    );

    showValidation(
      [
        message
      ]
    );

    showToast(
      message,
      "error"
    );

  } finally {
    state.publishing =
      false;

    setPublishBusy(
      false
    );
  }
}


function buildPublishPayload() {
  return {
    template:
      CONFIG.TEMPLATE_ID,

    subscriptionId:
      getValue(
        DOM.subscriptionId
      ),

    business: {
      name:
        getValue(
          DOM.businessName
        ),

      tagline:
        getValue(
          DOM.tagline
        ),

      address:
        getValue(
          DOM.address
        ),

      mobile:
        getValue(
          DOM.mobile
        ),

      email:
        getValue(
          DOM.email
        ),

      whatsapp:
        getValue(
          DOM.whatsapp
        ),

      logoUrl:
        getValue(
          DOM.logoUrl
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
          id:
            category.id,

          name:
            category.name,

          items:
            category.items.map(
              (item) => ({
                id:
                  item.id,

                name:
                  item.name,

                price:
                  item.price,

                quantity:
                  item.quantity,

                unit:
                  item.unit,

                description:
                  item.description,

                youtubeUrl:
                  item.youtubeUrl
              })
            )
        })
      )
  };
}


async function sendPublishRequest(
  payload
) {
  const workerUrl =
    normalizeBaseUrl(
      CONFIG.WORKER_URL
    );

  if (!workerUrl) {
    throw new Error(
      "Business Worker URL is not configured."
    );
  }

  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => {
        controller.abort();
      },
      CONFIG.REQUEST_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        `${workerUrl}/publish`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            ),

          cache:
            "no-store",

          credentials:
            "omit",

          signal:
            controller.signal
        }
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let result;

    if (
      contentType
        .toLowerCase()
        .includes(
          "application/json"
        )
    ) {
      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "The Worker returned invalid JSON."
        );
      }
    } else {
      const text =
        await response.text();

      result = {
        success:
          false,

        message:
          text ||
          `Worker returned HTTP ${response.status}.`
      };
    }

    if (
      !response.ok
    ) {
      throw new Error(
        result &&
        result.message
          ? result.message
          : `Worker returned HTTP ${response.status}.`
      );
    }

    return result;

  } catch (error) {
    if (
      error &&
      error.name ===
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
        "Unable to connect to the Business Worker. Please check your internet connection and try again."
      );
    }

    throw error;

  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}


/* =========================================================
 * SUCCESS
 * ========================================================= */


function showSuccess(
  result
) {
  if (
    !DOM.successSection
  ) {
    return;
  }

  const url =
    typeof result.url ===
    "string"
      ? result.url.trim()
      : "";

  state.lastPublishedUrl =
    url;

  if (
    DOM.successDescription
  ) {
    DOM.successDescription.textContent =
      result.message ||
      "Your business app has been successfully created.";
  }

  if (
    DOM.businessAppUrl
  ) {
    DOM.businessAppUrl.href =
      url || "#";

    DOM.businessAppUrl.textContent =
      url ||
      "Business App";

    DOM.businessAppUrl.dataset.url =
      url;
  }

  if (
    DOM.openBusinessApp
  ) {
    DOM.openBusinessApp.disabled =
      !isValidHttpsUrl(
        url
      );
  }

  DOM.successSection.hidden =
    false;

  DOM.successSection.scrollIntoView(
    {
      behavior:
        "smooth",

      block:
        "center"
    }
  );
}


function hideSuccess() {
  if (
    DOM.successSection
  ) {
    DOM.successSection.hidden =
      true;
  }
}


function openPublishedBusiness() {
  const url =
    state.lastPublishedUrl ||
    (
      DOM.businessAppUrl
        ? DOM.businessAppUrl.dataset.url ||
          DOM.businessAppUrl.href
        : ""
    );

  if (
    !isValidHttpsUrl(
      url
    )
  ) {
    showToast(
      "Published business app URL is not available.",
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


function editBusiness() {
  hideSuccess();

  if (
    DOM.ecommerceSection
  ) {
    DOM.ecommerceSection.hidden =
      false;
  }

  if (
    DOM.templateSection
  ) {
    DOM.templateSection.hidden =
      true;
  }

  window.scrollTo({
    top:
      0,

    behavior:
      "smooth"
  });
}


function createAnotherApp() {
  resetBuilderData(
    false
  );

  showTemplateSelection();

  showToast(
    "Ready to create another business app.",
    "success"
  );
}


/* =========================================================
 * LOADING / BUTTON STATUS
 * ========================================================= */


function showLoader(
  message
) {
  if (
    DOM.loaderText
  ) {
    DOM.loaderText.textContent =
      message ||
      "Processing...";
  }

  if (
    DOM.applicationLoader
  ) {
    DOM.applicationLoader.hidden =
      false;
  }
}


function hideLoader() {
  if (
    DOM.applicationLoader
  ) {
    DOM.applicationLoader.hidden =
      true;
  }
}


function setPublishBusy(
  busy
) {
  if (
    DOM.publishBusiness
  ) {
    DOM.publishBusiness.disabled =
      busy;
  }

  if (
    DOM.publishSpinner
  ) {
    DOM.publishSpinner.hidden =
      !busy;
  }

  if (
    DOM.publishButtonText
  ) {
    DOM.publishButtonText.textContent =
      busy
        ? "Creating Business App..."
        : "Create Business App";
  }
}


function setPublishStatus(
  message
) {
  if (
    DOM.publishStatus
  ) {
    DOM.publishStatus.textContent =
      message || "";
  }
}


/* =========================================================
 * CONNECTION
 * ========================================================= */


function updateConnectionStatus() {
  const online =
    navigator.onLine;

  if (
    DOM.connectionText
  ) {
    DOM.connectionText.textContent =
      online
        ? "Ready"
        : "Offline";
  }

  if (
    DOM.connectionStatus
  ) {
    DOM.connectionStatus.classList.toggle(
      "is-online",
      online
    );

    DOM.connectionStatus.classList.toggle(
      "is-offline",
      !online
    );
  }
}


/* =========================================================
 * MODALS
 * ========================================================= */


function showModal(
  modal
) {
  if (!modal) {
    return;
  }

  modal.hidden =
    false;

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "modal-open"
  );
}


function hideModal(
  modal
) {
  if (!modal) {
    return;
  }

  modal.hidden =
    true;

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  if (
    DOM.categoryModal &&
    DOM.itemModal &&
    DOM.categoryModal.hidden &&
    DOM.itemModal.hidden
  ) {
    document.body.classList.remove(
      "modal-open"
    );
  }
}


function handleModalBackdrop(
  event
) {
  if (
    event.target !==
    event.currentTarget
  ) {
    return;
  }

  const closeTarget =
    event.target.closest(
      "[data-modal-close]"
    );

  if (!closeTarget) {
    return;
  }

  const modalId =
    closeTarget.dataset.modalClose;

  if (
    modalId ===
    "category-modal"
  ) {
    closeCategoryModal();
  }

  if (
    modalId ===
    "item-modal"
  ) {
    closeItemModal();
  }
}


function handleKeyboard(
  event
) {
  if (
    event.key !==
    "Escape"
  ) {
    return;
  }

  if (
    DOM.categoryModal &&
    !DOM.categoryModal.hidden
  ) {
    closeCategoryModal();

    return;
  }

  if (
    DOM.itemModal &&
    !DOM.itemModal.hidden
  ) {
    closeItemModal();
  }
}


/* =========================================================
 * RESET
 * ========================================================= */


function resetBuilderData(
  keepTemplate
) {
  if (
    !keepTemplate
  ) {
    state.selectedTemplate =
      null;
  }

  state.categories =
    [];

  state.editingCategoryId =
    null;

  state.editingItemId =
    null;

  state.editingItemCategoryId =
    null;

  state.location = {
    verified:
      false,

    latitude:
      null,

    longitude:
      null,

    accuracy:
      null,

    verifiedAt:
      null
  };

  state.lastPublishedUrl =
    "";

  clearAllFormFields();

  seedDefaultCategories();

  renderCategories();
  renderItems();
  updateItemCategorySelect();
  updateLocationDetails();

  hideValidation();
  hideSuccess();

  clearSubscriptionError();

  setPublishStatus(
    ""
  );
}


function clearAllFormFields() {
  const fields = [
    DOM.subscriptionId,
    DOM.businessName,
    DOM.tagline,
    DOM.address,
    DOM.mobile,
    DOM.email,
    DOM.whatsapp,
    DOM.logoUrl
  ];

  fields.forEach(
    (field) => {
      if (field) {
        field.value =
          "";
      }
    }
  );

  hideLogoPreview();

  if (
    DOM.itemCategory
  ) {
    DOM.itemCategory.value =
      "";
  }

  clearItemFields();

  setLocationText(
    "Location not verified",
    false
  );
}


function clearItemFields() {
  setValue(
    DOM.itemName,
    ""
  );

  setValue(
    DOM.itemPrice,
    ""
  );

  setValue(
    DOM.itemQuantity,
    ""
  );

  setValue(
    DOM.itemUnit,
    ""
  );

  setValue(
    DOM.itemCategory,
    ""
  );

  setValue(
    DOM.itemDescription,
    ""
  );

  setValue(
    DOM.itemYoutube,
    ""
  );
}


/* =========================================================
 * FIELD ERRORS
 * ========================================================= */


function showCategoryError(
  message
) {
  if (
    DOM.categoryNameError
  ) {
    DOM.categoryNameError.textContent =
      message;

    DOM.categoryNameError.hidden =
      false;
  }
}


function clearCategoryError() {
  if (
    DOM.categoryNameError
  ) {
    DOM.categoryNameError.textContent =
      "";

    DOM.categoryNameError.hidden =
      true;
  }
}


function showItemError(
  message
) {
  if (
    DOM.itemFormError
  ) {
    DOM.itemFormError.textContent =
      message;

    DOM.itemFormError.hidden =
      false;
  }
}


function clearItemError() {
  if (
    DOM.itemFormError
  ) {
    DOM.itemFormError.textContent =
      "";

    DOM.itemFormError.hidden =
      true;
  }
}


function clearSubscriptionError() {
  if (
    DOM.subscriptionError
  ) {
    DOM.subscriptionError.textContent =
      "";

    DOM.subscriptionError.hidden =
      true;
  }
}


/* =========================================================
 * TOAST
 * ========================================================= */


function showToast(
  message,
  type = "info"
) {
  if (
    !DOM.toastContainer
  ) {
    return;
  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast toast--${type}`;

  toast.setAttribute(
    "role",
    "status"
  );

  toast.textContent =
    message ||
    "Done.";

  DOM.toastContainer.appendChild(
    toast
  );

  window.setTimeout(
    () => {
      toast.remove();
    },
    4500
  );
}


/* =========================================================
 * DATA HELPERS
 * ========================================================= */


function findCategory(
  categoryId
) {
  return state.categories.find(
    (category) =>
      category.id ===
      categoryId
  ) || null;
}


function findItem(
  categoryId,
  itemId
) {
  const category =
    findCategory(
      categoryId
    );

  if (!category) {
    return null;
  }

  const item =
    category.items.find(
      (entry) =>
        entry.id ===
        itemId
    );

  if (!item) {
    return null;
  }

  return {
    category,
    item
  };
}


function getTotalItemCount() {
  return state.categories.reduce(
    (
      total,
      category
    ) =>
      total +
      category.items.length,
    0
  );
}


/* =========================================================
 * BUTTONS
 * ========================================================= */


function createButton(
  text,
  className,
  action,
  categoryId,
  itemId = null
) {
  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  if (className) {
    button.className =
      className;
  }

  if (categoryId) {
    button.dataset.categoryId =
      categoryId;
  }

  if (itemId) {
    button.dataset.itemId =
      itemId;
  }

  if (
    action === "add-item" ||
    action === "edit" ||
    action === "delete"
  ) {
    if (itemId) {
      button.dataset.itemAction =
        action;
    } else {
      button.dataset.categoryAction =
        action;
    }
  }

  button.textContent =
    text;

  return button;
}


function setButtonBusy(
  button,
  busy,
  busyText
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

    button.disabled =
      true;

    button.setAttribute(
      "aria-busy",
      "true"
    );

    button.textContent =
      busyText ||
      "Please wait...";
  } else {
    button.disabled =
      false;

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


/* =========================================================
 * GENERAL HELPERS
 * ========================================================= */


function getValue(
  element
) {
  return element
    ? String(
        element.value || ""
      ).trim()
    : "";
}


function setValue(
  element,
  value
) {
  if (!element) {
    return;
  }

  element.value =
    value === null ||
    value === undefined
      ? ""
      : String(value);
}


function normalizeText(
  value,
  maxLength
) {
  const text =
    String(
      value ?? ""
    ).trim();

  if (
    Number.isFinite(
      maxLength
    ) &&
    text.length >
      maxLength
  ) {
    return text.slice(
      0,
      maxLength
    );
  }

  return text;
}


function parseNumber(
  value
) {
  const text =
    String(
      value ?? ""
    ).trim();

  if (!text) {
    return null;
  }

  const number =
    Number(text);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  return number;
}


function formatNumber(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "0";
  }

  return number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits:
        2
    }
  );
}


function createId(
  prefix
) {
  if (
    window.crypto &&
    typeof window.crypto
      .randomUUID ===
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


function focusElement(
  element
) {
  if (!element) {
    return;
  }

  try {
    element.focus({
      preventScroll:
        false
    });
  } catch {
    element.focus();
  }
}


function uniqueStrings(
  values
) {
  return [
    ...new Set(
      values.filter(
        Boolean
      )
    )
  ];
}


/* =========================================================
 * URL VALIDATION
 * ========================================================= */


function isValidHttpsUrl(
  value
) {
  try {
    const url =
      new URL(
        value
      );

    return (
      url.protocol ===
        "https:" &&
      Boolean(
        url.hostname
      )
    );
  } catch {
    return false;
  }
}


function normalizeBaseUrl(
  value
) {
  const text =
    String(
      value ?? ""
    ).trim();

  if (!text) {
    return "";
  }

  try {
    const url =
      new URL(
        text
      );

    if (
      url.protocol !==
      "https:"
    ) {
      return "";
    }

    return url.origin;
  } catch {
    return "";
  }
}


function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      value
    );
}


function isValidYoutubeUrl(
  value
) {
  try {
    const url =
      new URL(
        value
      );

    const hostname =
      url.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );

    if (
      hostname ===
      "youtu.be"
    ) {
      return Boolean(
        url.pathname
          .split("/")
          .filter(
            Boolean
          )[0]
      );
    }

    if (
      hostname !==
        "youtube.com" &&
      hostname !==
        "m.youtube.com"
    ) {
      return false;
    }

    if (
      url.pathname.startsWith(
        "/shorts/"
      )
    ) {
      return Boolean(
        url.pathname
          .split("/")
          .filter(
            Boolean
          )[1]
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
          .filter(
            Boolean
          )[1]
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
          .filter(
            Boolean
          )[1]
      );
    }

    return false;

  } catch {
    return false;
  }
}


/* =========================================================
 * ERROR HANDLING
 * ========================================================= */


function getErrorMessage(
  error
) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (
    error.name ===
    "AbortError"
  ) {
    return "The request timed out. Please try again.";
  }

  if (
    error.message
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}


function getLocationErrorMessage(
  error
) {
  if (
    !error
  ) {
    return "Unable to verify your location.";
  }

  switch (
    error.code
  ) {
    case 1:
      return "Location permission was denied. Please allow location access and try again.";

    case 2:
      return "Your current location could not be determined. Please try again.";

    case 3:
      return "Location request timed out. Please try again.";

    default:
      return (
        error.message ||
        "Unable to verify your location."
      );
  }
}
