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

  CATEGORY_ITEM_STORAGE_KEY:
    "vidhwaan_business_ecommerce_categories_items",

  WEBSITE_STORAGE_KEY:
    "vidhwaan_business_website_data",

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

  DEPLOYMENT_CHECK_INTERVAL_MS: 
    3000,

  DEPLOYMENT_TIMEOUT_MS: 
    120000,

  MAX_LOCATION_ACCURACY_METERS:
    500,

  LOCATION_TIMEOUT_MS:
    45000

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

  website: {
    sections: [],
    footer: {
      items: []
    }
  },

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

  DOM.templateWebsite =
    document.getElementById(
      "template-website"
    );

  DOM.ecommerceSection =
    document.getElementById(
      "ecommerce-section"
    );

  DOM.websiteSection =
    document.getElementById(
      "website-section"
    );

  DOM.websiteBackToTemplates =
    document.getElementById(
      "website-back-to-templates"
    );

  DOM.websiteSubscriptionId =
    document.getElementById(
      "website-subscription-id"
    );

  DOM.websiteBusinessName =
    document.getElementById(
      "website-business-name"
    );

  DOM.websiteAddress =
    document.getElementById(
      "website-business-address"
    );

  DOM.websiteTagline =
    document.getElementById(
      "website-tagline"
    );

  DOM.websiteMobile =
    document.getElementById(
      "website-mobile"
    );

  DOM.websiteEmail =
    document.getElementById(
      "website-email"
    );

  DOM.websiteWhatsapp =
    document.getElementById(
      "website-whatsapp"
    );

  DOM.websitePassword =
    document.getElementById(
      "website-password"
    );

  DOM.websitePasswordToggle =
    document.getElementById(
      "website-password-toggle"
    );

  DOM.websiteLogo =
    document.getElementById(
      "website-logo"
    );

  DOM.websiteLogoPreview =
    document.getElementById(
      "website-logo-preview"
    );

  DOM.websiteLogoPreviewImage =
    document.getElementById(
      "website-logo-preview-image"
    );

  DOM.websiteVerifyLocation =
    document.getElementById(
      "website-verify-location"
    );

  DOM.websiteLocationStatus =
    document.getElementById(
      "website-location-status"
    );

  DOM.websiteLocationStatusIndicator =
    document.getElementById(
      "website-location-status-indicator"
    );

  DOM.websiteLocationStatusText =
    document.getElementById(
      "website-location-status-text"
    );

  DOM.websiteLocationDetails =
    document.getElementById(
      "website-location-details"
    );

  DOM.websiteLocationLatitude =
    document.getElementById(
      "website-location-latitude"
    );

  DOM.websiteLocationLongitude =
    document.getElementById(
      "website-location-longitude"
    );

  DOM.websiteLocationVerifiedAt =
    document.getElementById(
      "website-location-verified-at"
    );

  DOM.websiteAddSection =
    document.getElementById(
      "website-add-section"
    );

  DOM.websiteAddFirstSection =
    document.getElementById(
      "website-add-first-section"
    );

  DOM.websiteSections =
    document.getElementById(
      "website-sections"
    );

  DOM.websiteSectionsEmpty =
    document.getElementById(
      "website-sections-empty"
    );

  DOM.websiteAddFooterLink =
    document.getElementById(
      "website-add-footer-link"
    );

  DOM.websiteFooterLinks =
    document.getElementById(
      "website-footer-links"
    );

  DOM.websiteFooterEmpty =
    document.getElementById(
      "website-footer-empty"
    );

  DOM.websiteValidationSummary =
    document.getElementById(
      "website-validation-summary"
    );

  DOM.websiteValidationList =
    document.getElementById(
      "website-validation-list"
    );

  DOM.websitePublish =
    document.getElementById(
      "website-publish"
    );

  DOM.websitePublishSpinner =
    document.getElementById(
      "website-publish-spinner"
    );

  DOM.websitePublishButtonText =
    document.getElementById(
      "website-publish-button-text"
    );

  DOM.websitePublishStatus =
    document.getElementById(
      "website-publish-status"
    );

  DOM.websitePublishResult =
    document.getElementById(
      "website-publish-result"
    );

  DOM.websitePublishedUrl =
    document.getElementById(
      "website-published-url"
    );


  DOM.websiteContentModal =
    document.getElementById(
      "website-content-modal"
    );

  DOM.websiteContentModalClose =
    document.getElementById(
      "website-content-modal-close"
    );

  DOM.websiteContentModalTitle =
    document.getElementById(
      "website-content-modal-title"
    );

  DOM.websiteContentModalDescription =
    document.getElementById(
      "website-content-modal-description"
    );

  DOM.websiteContentTextField =
    document.getElementById(
      "website-content-text-field"
    );

  DOM.websiteContentTextLabel =
    document.getElementById(
      "website-content-text-label"
    );

  DOM.websiteContentText =
    document.getElementById(
      "website-content-text"
    );

  DOM.websiteContentRepeatableField =
    document.getElementById(
      "website-content-repeatable-field"
    );

  DOM.websiteContentRepeatableLabel =
    document.getElementById(
      "website-content-repeatable-label"
    );

  DOM.websiteContentRepeatableHelp =
    document.getElementById(
      "website-content-repeatable-help"
    );

  DOM.websiteContentAddRow =
    document.getElementById(
      "website-content-add-row"
    );

  DOM.websiteContentRowList =
    document.getElementById(
      "website-content-row-list"
    );

  DOM.websiteContentFormError =
    document.getElementById(
      "website-content-form-error"
    );

  DOM.websiteContentCancel =
    document.getElementById(
      "website-content-cancel"
    );

  DOM.websiteContentSave =
    document.getElementById(
      "website-content-save"
    );


  DOM.backToTemplates =
    document.getElementById(
      "back-to-templates"
    );

  DOM.subscriptionId =
    document.getElementById(
      "subscription-id"
    );

  DOM.businessPassword =
    document.getElementById(
      "business-password"
    );

  DOM.businessPasswordToggle =
    document.getElementById(
      "business-password-toggle"
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

  DOM.deploymentStatus =
    document.getElementById(
      "deployment-status"
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

  if (DOM.templateWebsite) {
    DOM.templateWebsite.addEventListener(
      "click",
      () => selectTemplate("WEB")
    );
  }

  if (DOM.backToTemplates) {
    DOM.backToTemplates.addEventListener(
      "click",
      showTemplateSelection
    );
  }

  if (DOM.websiteBackToTemplates) {
    DOM.websiteBackToTemplates.addEventListener(
      "click",
      showTemplateSelection
    );
  }

  if (DOM.websitePasswordToggle) {
    DOM.websitePasswordToggle.addEventListener(
      "click",
      toggleWebsitePassword
    );
  }

  if (DOM.websiteLogo) {
    DOM.websiteLogo.addEventListener(
      "input",
      previewWebsiteLogo
    );

    DOM.websiteLogo.addEventListener(
      "change",
      previewWebsiteLogo
    );
  }

  if (DOM.websiteVerifyLocation) {
    DOM.websiteVerifyLocation.addEventListener(
      "click",
      verifyWebsiteLocation
    );
  }

  if (DOM.websiteAddSection) {
    DOM.websiteAddSection.addEventListener(
      "click",
      addWebsiteSection
    );
  }

  if (DOM.websiteAddFirstSection) {
    DOM.websiteAddFirstSection.addEventListener(
      "click",
      addWebsiteSection
    );
  }

  if (DOM.websiteSections) {
    DOM.websiteSections.addEventListener(
      "click",
      handleWebsiteSectionAction
    );
  }

  if (DOM.websiteAddFooterLink) {
    DOM.websiteAddFooterLink.addEventListener(
      "click",
      addWebsiteFooterLink
    );
  }


  if (DOM.websiteContentModalClose) {
    DOM.websiteContentModalClose.addEventListener(
      "click",
      closeWebsiteContentModal
    );
  }

  if (DOM.websiteContentCancel) {
    DOM.websiteContentCancel.addEventListener(
      "click",
      closeWebsiteContentModal
    );
  }

  if (DOM.websiteContentSave) {
    DOM.websiteContentSave.addEventListener(
      "click",
      saveWebsiteContentModal
    );
  }

  if (DOM.websiteContentAddRow) {
    DOM.websiteContentAddRow.addEventListener(
      "click",
      addWebsiteContentModalRow
    );
  }

  if (DOM.websiteContentRowList) {
    DOM.websiteContentRowList.addEventListener(
      "click",
      handleWebsiteContentModalRowAction
    );
  }



  if (DOM.websiteFooterLinks) {
    DOM.websiteFooterLinks.addEventListener(
      "click",
      handleWebsiteFooterAction
    );
  }

  if (DOM.websitePublish) {
    DOM.websitePublish.addEventListener(
      "click",
      publishWebsite
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


  if (DOM.businessPasswordToggle) {
    DOM.businessPasswordToggle.addEventListener(
      "click",
      toggleBusinessPassword
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



function toggleBusinessPassword() {
  if (
    !DOM.businessPassword ||
    !DOM.businessPasswordToggle
  ) {
    return;
  }

  const icon =
    DOM.businessPasswordToggle.querySelector(
      ".password-toggle__icon"
    );

  const isHidden =
    DOM.businessPassword.type ===
    "password";

  DOM.businessPassword.type =
    isHidden
      ? "text"
      : "password";

  DOM.businessPasswordToggle.setAttribute(
    "aria-label",
    isHidden
      ? "Hide password"
      : "Show password"
  );

  DOM.businessPasswordToggle.setAttribute(
    "aria-pressed",
    isHidden
      ? "true"
      : "false"
  );

  if (icon) {
    icon.textContent =
      isHidden
        ? "◉"
        : "👁";
  }
}


/* =========================================================
 * APPLICATION START
 * ========================================================= */


function initializeApplication() {
  state.selectedTemplate = null;

  loadWebsiteData();

  renderWebsiteSections();

  renderWebsiteFooter();

  updateWebsiteLocationDetails();

  const restored =
    loadCategoryItemData();

  if (!restored) {
    seedDefaultCategories();
  }

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
  if (
    templateId !== "ECM" &&
    templateId !== "WEB"
  ) {
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
    DOM.ecommerceSection.hidden =
      templateId !== "ECM";
  }

  if (DOM.websiteSection) {
    DOM.websiteSection.hidden =
      templateId !== "WEB";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  showToast(
    templateId === "WEB"
      ? "Global Website selected."
      : "Ecommerce app selected.",
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

  if (DOM.websiteSection) {
    DOM.websiteSection.hidden = true;
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
 * CATEGORY & ITEM PERSISTENCE
 * ========================================================= */

function saveCategoryItemData() {
  try {
    localStorage.setItem(
      CONFIG.CATEGORY_ITEM_STORAGE_KEY,
      JSON.stringify({
        categories:
          state.categories
      })
    );
  } catch (error) {
    console.warn(
      "Could not save category and item data.",
      error
    );
  }
}


function loadCategoryItemData() {
  try {
    const stored =
      localStorage.getItem(
        CONFIG.CATEGORY_ITEM_STORAGE_KEY
      );

    if (!stored) {
      return false;
    }

    const parsed =
      JSON.parse(stored);

    if (
      !parsed ||
      !Array.isArray(
        parsed.categories
      )
    ) {
      return false;
    }

    state.categories =
      parsed.categories;

    return true;
  } catch (error) {
    console.warn(
      "Could not load saved category and item data.",
      error
    );

    return false;
  }
}


function clearCategoryItemData() {
  try {
    localStorage.removeItem(
      CONFIG.CATEGORY_ITEM_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Could not clear saved category and item data.",
      error
    );
  }
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

    saveCategoryItemData();

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

  saveCategoryItemData();

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

  saveCategoryItemData();

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

    saveCategoryItemData();

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

  saveCategoryItemData();

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

  saveCategoryItemData();

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

  const businessPassword =
    DOM.businessPassword
      ? DOM.businessPassword.value
      : "";

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

  if (!businessPassword) {
    errors.push(
      "Please create your Business Password."
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
  if (state.publishing) return;

  hideValidation();
  hideSuccess();
  clearSubscriptionError();

  const validation = validateBuilder();

  if (!validation.valid) {
    showValidation(validation.errors);
    showToast(
      validation.errors[0] || "Please review the form.",
      "error"
    );
    return;
  }

  const payload = buildPublishPayload();

  state.publishing = true;
  state.lastPublishedUrl = "";

  setPublishBusy(true);
  setPublishStatus(
    "Verifying your subscription and creating your business app..."
  );

  showLoader(
    "Verifying subscription and publishing your business app..."
  );

  try {
    const result = await sendPublishRequest(payload);

    if (!result || result.success !== true) {
      throw new Error(
        result && result.message
          ? result.message
          : "The business app could not be created."
      );
    }

    if (!isValidHttpsUrl(result.url)) {
      throw new Error(
        "The Worker did not return a valid business app URL."
      );
    }

    state.lastPublishedUrl = result.url;

    hideLoader();

    showSuccess(result);

    setPublishStatus(
      "Business app is being published..."
    );

    if (DOM.successDescription) {
      DOM.successDescription.textContent =
        "Your business app has been created. We are waiting for the public app files to become available.";
    }

    if (DOM.deploymentStatus) {
      DOM.deploymentStatus.textContent =
        "Publishing your business app...";
      DOM.deploymentStatus.classList.remove("is-live");
      DOM.deploymentStatus.classList.add("is-waiting");
    }

    const deploymentReady =
      await waitForDeployment(result.url);

    if (!deploymentReady) {
      if (DOM.deploymentStatus) {
        DOM.deploymentStatus.textContent =
          "The app is still being published. Please wait a little longer and try opening it again.";
        DOM.deploymentStatus.classList.remove("is-live");
        DOM.deploymentStatus.classList.add("is-waiting");
      }

      setPublishStatus(
        "Business app is still being published."
      );

      return;
    }

    enablePublishedBusiness(result.url);

    if (DOM.successDescription) {
      DOM.successDescription.textContent =
        "Your business app is live and ready to open.";
    }

    if (DOM.deploymentStatus) {
      DOM.deploymentStatus.textContent =
        "Business app is live.";
      DOM.deploymentStatus.classList.remove("is-waiting");
      DOM.deploymentStatus.classList.add("is-live");
    }

    setPublishStatus(
      "Business app created and published successfully."
    );

    showToast(
      "Your business app is now live.",
      "success"
    );
  } catch (error) {
    hideLoader();

    const message = getErrorMessage(error);

    setPublishStatus(message);

    showValidation([message]);

    showToast(
      message,
      "error"
    );
  } finally {
    state.publishing = false;
    setPublishBusy(false);
  }
}


async function waitForDeployment(url) {
  const startedAt = Date.now();

  while (
    Date.now() - startedAt <
    CONFIG.DEPLOYMENT_TIMEOUT_MS
  ) {
    if (await isDeploymentReady(url)) {
      return true;
    }

    const elapsedSeconds =
      Math.floor(
        (Date.now() - startedAt) / 1000
      );

    const remainingSeconds = Math.max(
      0,
      Math.ceil(
        (CONFIG.DEPLOYMENT_TIMEOUT_MS -
          (Date.now() - startedAt)) /
          1000
      )
    );

    if (DOM.deploymentStatus) {
      DOM.deploymentStatus.textContent =
        `Publishing your business app... ${elapsedSeconds}s elapsed.`;
    }

    setPublishStatus(
      `Waiting for your business app to become live... ${remainingSeconds}s remaining.`
    );

    await sleep(
      CONFIG.DEPLOYMENT_CHECK_INTERVAL_MS
    );
  }

  return false;
}


async function isDeploymentReady(url) {
  try {
    const pageUrl = new URL(url);

    const dataUrl = new URL(
      "ecommerce.json",
      pageUrl
    );

    const [pageResponse, dataResponse] =
      await Promise.all([
        fetchDeploymentResource(
          pageUrl.href
        ),
        fetchDeploymentResource(
          dataUrl.href
        )
      ]);

    return (
      pageResponse &&
      pageResponse.ok &&
      dataResponse &&
      dataResponse.ok
    );
  } catch (error) {
    return false;
  }
}


async function fetchDeploymentResource(url) {
  try {
    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(
        () => controller.abort(),
        CONFIG.REQUEST_TIMEOUT_MS
      );

    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        redirect: "follow",
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    return response;
  } catch (error) {
    return null;
  }
}


function enablePublishedBusiness(url) {
  if (!isValidHttpsUrl(url)) {
    return;
  }

  state.lastPublishedUrl = url;

  if (DOM.businessAppUrl) {
    DOM.businessAppUrl.href = url;
    DOM.businessAppUrl.textContent = url;
    DOM.businessAppUrl.dataset.url = url;

    DOM.businessAppUrl.classList.remove(
      "is-pending"
    );

    DOM.businessAppUrl.removeAttribute(
      "aria-disabled"
    );

    DOM.businessAppUrl.removeAttribute(
      "tabindex"
    );
  }

  if (DOM.openBusinessApp) {
    DOM.openBusinessApp.disabled = false;
  }
}


function sleep(milliseconds) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}


function buildPublishPayload() {
  return {
    template:
      CONFIG.TEMPLATE_ID,

    subscriptionId:
      getValue(
        DOM.subscriptionId
      ),

    businessPassword:
      DOM.businessPassword
        ? DOM.businessPassword.value
        : "",

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


function showSuccess(result) {
  if (!DOM.successSection) return;

  const url =
    typeof result.url === "string"
      ? result.url.trim()
      : "";

  state.lastPublishedUrl = url;

  if (DOM.successDescription) {
    DOM.successDescription.textContent =
      "Your business app has been created. We are waiting for the public app files to become available.";
  }

  if (DOM.businessAppUrl) {
    DOM.businessAppUrl.href = "#";
    DOM.businessAppUrl.textContent =
      "Preparing Business App...";
    DOM.businessAppUrl.dataset.url = "";

    DOM.businessAppUrl.classList.add(
      "is-pending"
    );

    DOM.businessAppUrl.setAttribute(
      "aria-disabled",
      "true"
    );

    DOM.businessAppUrl.setAttribute(
      "tabindex",
      "-1"
    );
  }

  if (DOM.openBusinessApp) {
    DOM.openBusinessApp.disabled = true;
  }

  if (DOM.deploymentStatus) {
    DOM.deploymentStatus.textContent =
      "Publishing your business app...";
    DOM.deploymentStatus.classList.remove(
      "is-live"
    );
    DOM.deploymentStatus.classList.add(
      "is-waiting"
    );
  }

  DOM.successSection.hidden = false;

  DOM.successSection.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
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
          ""
        : ""
    );

  if (!isValidHttpsUrl(url)) {
    showToast(
      "Your business app is not live yet. Please wait for publishing to finish.",
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
    DOM.websiteContentModal &&
    DOM.categoryModal.hidden &&
    DOM.itemModal.hidden &&
    DOM.websiteContentModal.hidden
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

  if (
    modalId ===
    "website-content-modal"
  ) {
    closeWebsiteContentModal();
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

    return;
  }

  if (
    DOM.websiteContentModal &&
    !DOM.websiteContentModal.hidden
  ) {
    closeWebsiteContentModal();
  }
}


/* =========================================================
 * GLOBAL WEBSITE BUILDER
 * ========================================================= */

const WEBSITE_MAX_SECTIONS = 100;

const WEBSITE_MAX_BLOCKS_PER_SECTION = 100;

const WEBSITE_MAX_IMAGES_PER_BLOCK = 50;

const WEBSITE_MAX_VIDEOS_PER_BLOCK = 50;

const WEBSITE_MAX_LINKS_PER_BLOCK = 50;

const WEBSITE_MAX_FOOTER_LINKS = 50;

const WEBSITE_MAX_TEXT_LENGTH = 10000;

const WEBSITE_MAX_URL_LENGTH = 2000;


/* ---------------------------------------------------------
 * WEBSITE PASSWORD
 * --------------------------------------------------------- */

function toggleWebsitePassword() {
  if (
    !DOM.websitePassword ||
    !DOM.websitePasswordToggle
  ) {
    return;
  }

  const icon =
    DOM.websitePasswordToggle.querySelector(
      ".password-toggle__icon"
    );

  const hidden =
    DOM.websitePassword.type === "password";

  DOM.websitePassword.type =
    hidden
      ? "text"
      : "password";

  DOM.websitePasswordToggle.setAttribute(
    "aria-label",
    hidden
      ? "Hide password"
      : "Show password"
  );

  DOM.websitePasswordToggle.setAttribute(
    "aria-pressed",
    hidden
      ? "true"
      : "false"
  );

  if (icon) {
    icon.textContent =
      hidden
        ? "◉"
        : "👁";
  }
}


/* ---------------------------------------------------------
 * WEBSITE LOGO
 * --------------------------------------------------------- */

function previewWebsiteLogo() {
  if (
    !DOM.websiteLogo ||
    !DOM.websiteLogoPreview ||
    !DOM.websiteLogoPreviewImage
  ) {
    return;
  }

  const url =
    getValue(
      DOM.websiteLogo
    );

  if (
    !url ||
    !isValidHttpsUrl(url)
  ) {
    DOM.websiteLogoPreview.hidden =
      true;

    DOM.websiteLogoPreviewImage.removeAttribute(
      "src"
    );

    return;
  }

  const requestId =
    ++state.logoPreviewRequest;

  const image =
    new Image();

  image.onload = () => {
    if (
      requestId !==
      state.logoPreviewRequest
    ) {
      return;
    }

    DOM.websiteLogoPreviewImage.src =
      url;

    DOM.websiteLogoPreview.hidden =
      false;
  };

  image.onerror = () => {
    if (
      requestId !==
      state.logoPreviewRequest
    ) {
      return;
    }

    DOM.websiteLogoPreview.hidden =
      true;

    DOM.websiteLogoPreviewImage.removeAttribute(
      "src"
    );
  };

  image.referrerPolicy =
    "no-referrer";

  image.src =
    url;
}


/* ---------------------------------------------------------
 * WEBSITE LOCATION
 * --------------------------------------------------------- */

async function verifyWebsiteLocation() {
  if (
    !navigator.geolocation
  ) {
    setWebsiteLocationText(
      "Location services are not supported by this browser.",
      false
    );

    return;
  }

  setButtonBusy(
    DOM.websiteVerifyLocation,
    true,
    "Verifying..."
  );

  setWebsiteLocationText(
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
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        "The browser returned invalid GPS coordinates."
      );
    }

    if (
      !Number.isFinite(accuracy) ||
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
        new Date()
          .toISOString()
    };

    updateWebsiteLocationDetails();

    setWebsiteLocationText(
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

    updateWebsiteLocationDetails();

    setWebsiteLocationText(
      getLocationErrorMessage(
        error
      ),
      false
    );

  } finally {
    setButtonBusy(
      DOM.websiteVerifyLocation,
      false
    );
  }
}


function setWebsiteLocationText(
  message,
  verified
) {
  if (
    DOM.websiteLocationStatusText
  ) {
    DOM.websiteLocationStatusText.textContent =
      message;
  }

  if (
    DOM.websiteLocationStatusIndicator
  ) {
    DOM.websiteLocationStatusIndicator.classList.toggle(
      "is-verified",
      Boolean(verified)
    );
  }
}


function updateWebsiteLocationDetails() {
  const location =
    state.location;

  if (
    DOM.websiteLocationLatitude
  ) {
    DOM.websiteLocationLatitude.textContent =
      Number.isFinite(
        location.latitude
      )
        ? location.latitude.toFixed(6)
        : "—";
  }

  if (
    DOM.websiteLocationLongitude
  ) {
    DOM.websiteLocationLongitude.textContent =
      Number.isFinite(
        location.longitude
      )
        ? location.longitude.toFixed(6)
        : "—";
  }

  if (
    DOM.websiteLocationVerifiedAt
  ) {
    DOM.websiteLocationVerifiedAt.textContent =
      location.verifiedAt
        ? new Date(
            location.verifiedAt
          ).toLocaleString(
            "en-IN"
          )
        : "—";
  }

  if (
    DOM.websiteLocationDetails
  ) {
    DOM.websiteLocationDetails.hidden =
      !location.verified;
  }
}


/* ---------------------------------------------------------
 * WEBSITE STORAGE
 * --------------------------------------------------------- */

function saveWebsiteData() {
  try {
    localStorage.setItem(
      CONFIG.WEBSITE_STORAGE_KEY,
      JSON.stringify({
        sections:
          state.website.sections,

        footer:
          state.website.footer
      })
    );
  } catch (error) {
    console.warn(
      "Could not save Website data.",
      error
    );
  }
}


function loadWebsiteData() {
  try {
    const stored =
      localStorage.getItem(
        CONFIG.WEBSITE_STORAGE_KEY
      );

    if (!stored) {
      state.website = {
        sections: [],
        footer: {
          items: []
        }
      };

      return false;
    }

    const parsed =
      JSON.parse(
        stored
      );

    if (
      !parsed ||
      !Array.isArray(
        parsed.sections
      )
    ) {
      return false;
    }

    state.website = {
      sections:
        sanitizeWebsiteSections(
          parsed.sections
        ),

      footer: {
        items:
          sanitizeWebsiteFooter(
            parsed.footer &&
            Array.isArray(
              parsed.footer.items
            )
              ? parsed.footer.items
              : []
          )
      }
    };

    return true;

  } catch (error) {
    console.warn(
      "Could not load Website data.",
      error
    );

    return false;
  }
}


function clearWebsiteData() {
  try {
    localStorage.removeItem(
      CONFIG.WEBSITE_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Could not clear Website data.",
      error
    );
  }

  state.website = {
    sections: [],

    footer: {
      items: []
    }
  };
}


/* ---------------------------------------------------------
 * WEBSITE SANITIZATION
 * --------------------------------------------------------- */

function sanitizeWebsiteSections(
  sections
) {
  return sections
    .slice(
      0,
      WEBSITE_MAX_SECTIONS
    )
    .map(
      (section, index) => ({
        id:
          typeof section.id === "string" &&
          section.id
            ? section.id
            : createId(
                "section"
              ),

        heading:
          normalizeText(
            section.heading,
            300
          ) ||
          `Section ${index + 1}`,

        blocks:
          sanitizeWebsiteBlocks(
            Array.isArray(
              section.blocks
            )
              ? section.blocks
              : []
          )
      })
    );
}


function sanitizeWebsiteBlocks(
  blocks
) {
  return blocks
    .slice(
      0,
      WEBSITE_MAX_BLOCKS_PER_SECTION
    )
    .map(
      (block) => {
        if (
          !block ||
          typeof block.type !== "string"
        ) {
          return null;
        }

        if (
          block.type ===
          "paragraph"
        ) {
          return {
            id:
              typeof block.id === "string"
                ? block.id
                : createId(
                    "block"
                  ),

            type:
              "paragraph",

            text:
              normalizeText(
                block.text,
                WEBSITE_MAX_TEXT_LENGTH
              )
          };
        }

        if (
          block.type ===
          "subparagraph"
        ) {
          return {
            id:
              typeof block.id === "string"
                ? block.id
                : createId(
                    "block"
                  ),

            type:
              "subparagraph",

            text:
              normalizeText(
                block.text,
                WEBSITE_MAX_TEXT_LENGTH
              )
          };
        }

        if (
          block.type ===
          "images"
        ) {
          return {
            id:
              typeof block.id === "string"
                ? block.id
                : createId(
                    "block"
                  ),

            type:
              "images",

            items:
              sanitizeUrlItems(
                block.items,
                WEBSITE_MAX_IMAGES_PER_BLOCK
              )
          };
        }

        if (
          block.type ===
          "videos"
        ) {
          return {
            id:
              typeof block.id === "string"
                ? block.id
                : createId(
                    "block"
                  ),

            type:
              "videos",

            items:
              sanitizeUrlItems(
                block.items,
                WEBSITE_MAX_VIDEOS_PER_BLOCK
              )
          };
        }

        if (
          block.type ===
          "links"
        ) {
          return {
            id:
              typeof block.id === "string"
                ? block.id
                : createId(
                    "block"
                  ),

            type:
              "links",

            items:
              Array.isArray(
                block.items
              )
                ? block.items
                    .slice(
                      0,
                      WEBSITE_MAX_LINKS_PER_BLOCK
                    )
                    .map(
                      (item) => ({
                        name:
                          normalizeText(
                            item &&
                            item.name,
                            150
                          ),

                        url:
                          normalizeText(
                            item &&
                            item.url,
                            WEBSITE_MAX_URL_LENGTH
                          )
                      })
                    )
                    .filter(
                      (item) =>
                        item.name ||
                        item.url
                    )
                : []
          };
        }

        return null;
      }
    )
    .filter(Boolean);
}


function sanitizeUrlItems(
  items,
  max
) {
  if (
    !Array.isArray(items)
  ) {
    return [];
  }

  return items
    .slice(
      0,
      max
    )
    .map(
      (item) =>
        typeof item === "string"
          ? item
          : item &&
            typeof item.url === "string"
            ? item.url
            : ""
    )
    .map(
      (url) =>
        normalizeText(
          url,
          WEBSITE_MAX_URL_LENGTH
        )
    )
    .filter(Boolean);
}


function sanitizeWebsiteFooter(
  items
) {
  return items
    .slice(
      0,
      WEBSITE_MAX_FOOTER_LINKS
    )
    .map(
      (item) => ({
        id:
          typeof item.id === "string"
            ? item.id
            : createId(
                "footer"
              ),

        name:
          normalizeText(
            item.name,
            150
          ),

        url:
          normalizeText(
            item.url,
            WEBSITE_MAX_URL_LENGTH
          )
      })
    )
    .filter(
      (item) =>
        item.name ||
        item.url
    );
}


/* ---------------------------------------------------------
 * WEBSITE SECTIONS
 * --------------------------------------------------------- */

function addWebsiteSection() {
  if (
    state.website.sections.length >=
    WEBSITE_MAX_SECTIONS
  ) {
    showToast(
      `Maximum ${WEBSITE_MAX_SECTIONS} sections are allowed.`,
      "error"
    );

    return;
  }

  const heading =
    window.prompt(
      "Enter section heading:"
    );

  if (
    heading === null
  ) {
    return;
  }

  const cleanHeading =
    normalizeText(
      heading,
      300
    );

  if (!cleanHeading) {
    showToast(
      "Please enter a section heading.",
      "error"
    );

    return;
  }

  state.website.sections.push({
    id:
      createId(
        "section"
      ),

    heading:
      cleanHeading,

    blocks:
      []
  });

  saveWebsiteData();

  renderWebsiteSections();

  showToast(
    "Website section added.",
    "success"
  );
}


function editWebsiteSection(
  sectionId
) {
  const section =
    findWebsiteSection(
      sectionId
    );

  if (!section) {
    return;
  }

  const heading =
    window.prompt(
      "Edit section heading:",
      section.heading
    );

  if (
    heading === null
  ) {
    return;
  }

  const cleanHeading =
    normalizeText(
      heading,
      300
    );

  if (!cleanHeading) {
    showToast(
      "Section heading cannot be empty.",
      "error"
    );

    return;
  }

  section.heading =
    cleanHeading;

  saveWebsiteData();

  renderWebsiteSections();

  showToast(
    "Section updated.",
    "success"
  );
}


function moveWebsiteSection(
  sectionId,
  direction
) {
  const index =
    state.website.sections.findIndex(
      (section) =>
        section.id ===
        sectionId
    );

  if (
    index < 0
  ) {
    return;
  }

  const targetIndex =
    direction === "up"
      ? index - 1
      : index + 1;

  if (
    targetIndex < 0 ||
    targetIndex >=
      state.website.sections.length
  ) {
    return;
  }

  const current =
    state.website.sections[index];

  state.website.sections[index] =
    state.website.sections[
      targetIndex
    ];

  state.website.sections[
    targetIndex
  ] = current;

  saveWebsiteData();

  renderWebsiteSections();
}


function deleteWebsiteSection(
  sectionId
) {
  const section =
    findWebsiteSection(
      sectionId
    );

  if (!section) {
    return;
  }

  if (
    !window.confirm(
      `Delete section "${section.heading}"?`
    )
  ) {
    return;
  }

  state.website.sections =
    state.website.sections.filter(
      (entry) =>
        entry.id !==
        sectionId
    );

  saveWebsiteData();

  renderWebsiteSections();

  showToast(
    "Website section deleted.",
    "success"
  );
}


function findWebsiteSection(
  sectionId
) {
  return (
    state.website.sections.find(
      (section) =>
        section.id ===
        sectionId
    ) ||
    null
  );
}


/* ---------------------------------------------------------
 * WEBSITE SECTION RENDER
 * --------------------------------------------------------- */

function renderWebsiteSections() {
  if (
    !DOM.websiteSections
  ) {
    return;
  }

  DOM.websiteSections.replaceChildren();

  const sections =
    state.website.sections;

  if (
    DOM.websiteSectionsEmpty
  ) {
    DOM.websiteSectionsEmpty.hidden =
      sections.length > 0;
  }

  sections.forEach(
    (
      section,
      index
    ) => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "website-section-card";

      const header =
        document.createElement(
          "div"
        );

      header.className =
        "website-section-card__header";

      const title =
        document.createElement(
          "div"
        );

      title.className =
        "website-section-card__title";

      const heading =
        document.createElement(
          "h4"
        );

      const order =
        document.createElement(
          "span"
        );

      order.className =
        "website-section-order";

      order.textContent =
        String(
          index + 1
        );

      heading.appendChild(
        order
      );

      heading.appendChild(
        document.createTextNode(
          section.heading
        )
      );

      title.appendChild(
        heading
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "website-section-card__actions";

      actions.appendChild(
        createWebsiteActionButton(
          "Edit",
          "edit-section",
          section.id
        )
      );

      actions.appendChild(
        createWebsiteActionButton(
          "↑",
          "move-up",
          section.id,
          index === 0
        )
      );

      actions.appendChild(
        createWebsiteActionButton(
          "↓",
          "move-down",
          section.id,
          index ===
            sections.length - 1
        )
      );

      actions.appendChild(
        createWebsiteActionButton(
          "Delete",
          "delete-section",
          section.id
        )
      );

      header.appendChild(
        title
      );

      header.appendChild(
        actions
      );

      const body =
        document.createElement(
          "div"
        );

      body.className =
        "website-section-card__body";

      const content =
        document.createElement(
          "div"
        );

      content.className =
        "website-section-card__content";

      section.blocks.forEach(
        (block) => {
          content.appendChild(
            renderWebsiteBlock(
              section,
              block
            )
          );
        }
      );

      if (
        section.blocks.length ===
        0
      ) {
        const empty =
          document.createElement(
            "div"
          );

        empty.className =
          "website-content-empty";

        empty.textContent =
          "No content added yet. Use Add Content below.";

        content.appendChild(
          empty
        );
      }

      body.appendChild(
        content
      );

      const addContent =
        document.createElement(
          "div"
        );

      addContent.className =
        "website-add-content";

      [
        ["Paragraph", "paragraph"],
        ["Sub-paragraph", "subparagraph"],
        ["Images", "images"],
        ["YouTube Videos", "videos"],
        ["Link Buttons", "links"]
      ].forEach(
        ([label, type]) => {
          const button =
            document.createElement(
              "button"
            );

          button.type =
            "button";

          button.className =
            "secondary-button secondary-button--small";

          button.dataset.websiteAction =
            "add-content";

          button.dataset.sectionId =
            section.id;

          button.dataset.contentType =
            type;

          button.textContent =
            `+ ${label}`;

          addContent.appendChild(
            button
          );
        }
      );

      body.appendChild(
        addContent
      );

      card.appendChild(
        header
      );

      card.appendChild(
        body
      );

      DOM.websiteSections.appendChild(
        card
      );
    }
  );
}


function createWebsiteActionButton(
  text,
  action,
  sectionId,
  disabled = false
) {
  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "secondary-button secondary-button--small";

  button.dataset.websiteAction =
    action;

  button.dataset.sectionId =
    sectionId;

  button.textContent =
    text;

  button.disabled =
    disabled;

  return button;
}


/* ---------------------------------------------------------
 * WEBSITE BLOCKS
 * --------------------------------------------------------- */

function renderWebsiteBlock(
  section,
  block
) {
  const card =
    document.createElement(
      "div"
    );

  card.className =
    "website-content-block";

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "website-content-block__header";

  const type =
    document.createElement(
      "span"
    );

  type.className =
    "website-content-block__type";

  type.textContent =
    getWebsiteBlockLabel(
      block.type
    );

  const actions =
    document.createElement(
      "div"
    );

  actions.className =
    "website-content-block__actions";

  const edit =
    document.createElement(
      "button"
    );

  edit.type =
    "button";

  edit.textContent =
    "Edit";

  edit.className =
    "secondary-button secondary-button--small";

  edit.dataset.websiteAction =
    "edit-block";

  edit.dataset.sectionId =
    section.id;

  edit.dataset.blockId =
    block.id;

  const remove =
    document.createElement(
      "button"
    );

  remove.type =
    "button";

  remove.textContent =
    "Delete";

  remove.className =
    "secondary-button secondary-button--small";

  remove.dataset.websiteAction =
    "delete-block";

  remove.dataset.sectionId =
    section.id;

  remove.dataset.blockId =
    block.id;

  actions.appendChild(
    edit
  );

  actions.appendChild(
    remove
  );

  header.appendChild(
    type
  );

  header.appendChild(
    actions
  );

  const preview =
    document.createElement(
      "div"
    );

  preview.className =
    "website-block-preview";

  renderWebsiteBlockPreview(
    preview,
    block
  );

  card.appendChild(
    header
  );

  card.appendChild(
    preview
  );

  return card;
}


function getWebsiteBlockLabel(
  type
) {
  const labels = {
    paragraph:
      "Paragraph",

    subparagraph:
      "Sub-paragraph",

    images:
      "Images",

    videos:
      "YouTube Videos",

    links:
      "Link Buttons"
  };

  return (
    labels[type] ||
    "Content"
  );
}


function renderWebsiteBlockPreview(
  container,
  block
) {
  if (
    block.type ===
    "paragraph"
  ) {
    const p =
      document.createElement(
        "p"
      );

    p.textContent =
      block.text ||
      "Empty paragraph.";

    container.appendChild(
      p
    );

    return;
  }

  if (
    block.type ===
    "subparagraph"
  ) {
    const p =
      document.createElement(
        "p"
      );

    p.style.fontSize =
      "0.95rem";

    p.style.color =
      "var(--text-secondary)";

    p.textContent =
      block.text ||
      "Empty sub-paragraph.";

    container.appendChild(
      p
    );

    return;
  }

  if (
    block.type ===
    "images"
  ) {
    const list =
      document.createElement(
        "div"
      );

    list.className =
      "website-image-list";

    block.items.forEach(
      (url) => {
        const image =
          document.createElement(
            "img"
          );

        image.src =
          url;

        image.alt =
          "Website image";

        image.loading =
          "lazy";

        image.referrerPolicy =
          "no-referrer";

        list.appendChild(
          image
        );
      }
    );

    if (
      block.items.length ===
      0
    ) {
      list.textContent =
        "No images added.";
    }

    container.appendChild(
      list
    );

    return;
  }

  if (
    block.type ===
    "videos"
  ) {
    const list =
      document.createElement(
        "div"
      );

    list.className =
      "website-video-list";

    block.items.forEach(
      (url) => {
        const embed =
          getYoutubeEmbedData(
            url
          );

        if (!embed) {
          return;
        }

        const wrapper =
          document.createElement(
            "div"
          );

        wrapper.className =
          "website-video-preview";

        if (
          embed.short
        ) {
          wrapper.classList.add(
            "website-video-preview--short"
          );
        }

        const iframe =
          document.createElement(
            "iframe"
          );

        iframe.src =
          embed.url;

        iframe.title =
          "YouTube video";

        iframe.loading =
          "lazy";

        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

        iframe.allowFullscreen =
          true;

        wrapper.appendChild(
          iframe
        );

        list.appendChild(
          wrapper
        );
      }
    );

    if (
      list.children.length ===
      0
    ) {
      list.textContent =
        "No valid YouTube videos added.";
    }

    container.appendChild(
      list
    );

    return;
  }

  if (
    block.type ===
    "links"
  ) {
    block.items.forEach(
      (item) => {
        if (
          !item.name ||
          !isValidHttpsUrl(
            item.url
          )
        ) {
          return;
        }

        const link =
          document.createElement(
            "a"
          );

        link.className =
          "website-link-preview";

        link.href =
          item.url;

        link.target =
          "_blank";

        link.rel =
          "noopener noreferrer";

        link.textContent =
          item.name;

        container.appendChild(
          link
        );
      }
    );

    if (
      container.children.length ===
      0
    ) {
      container.textContent =
        "No valid links added.";
    }
  }
}


/* ---------------------------------------------------------
 * WEBSITE ACTIONS
 * --------------------------------------------------------- */

function handleWebsiteSectionAction(
  event
) {
  const button =
    event.target.closest(
      "[data-website-action]"
    );

  if (!button) {
    return;
  }

  const action =
    button.dataset.websiteAction;

  const sectionId =
    button.dataset.sectionId;

  if (
    action ===
    "edit-section"
  ) {
    editWebsiteSection(
      sectionId
    );

    return;
  }

  if (
    action ===
    "move-up"
  ) {
    moveWebsiteSection(
      sectionId,
      "up"
    );

    return;
  }

  if (
    action ===
    "move-down"
  ) {
    moveWebsiteSection(
      sectionId,
      "down"
    );

    return;
  }

  if (
    action ===
    "delete-section"
  ) {
    deleteWebsiteSection(
      sectionId
    );

    return;
  }

  if (
    action ===
    "add-content"
  ) {
    addWebsiteContent(
      sectionId,
      button.dataset.contentType
    );

    return;
  }

  if (
    action ===
    "edit-block"
  ) {
    editWebsiteContent(
      sectionId,
      button.dataset.blockId
    );

    return;
  }

  if (
    action ===
    "delete-block"
  ) {
    deleteWebsiteContent(
      sectionId,
      button.dataset.blockId
    );
  }
}


/* ---------------------------------------------------------
 * WEBSITE CONTENT EDITOR
 * --------------------------------------------------------- */

let websiteContentModalState = {
  mode: "add",
  sectionId: null,
  blockId: null,
  type: null
};


function openWebsiteContentModal(
  sectionId,
  type,
  block = null
) {
  const section =
    findWebsiteSection(
      sectionId
    );

  if (!section) {
    return;
  }

  websiteContentModalState = {
    mode:
      block
        ? "edit"
        : "add",

    sectionId:
      sectionId,

    blockId:
      block
        ? block.id
        : null,

    type:
      type
  };

  clearWebsiteContentModal();

  const isText =
    type === "paragraph" ||
    type === "subparagraph";

  const isImages =
    type === "images";

  const isVideos =
    type === "videos";

  const isLinks =
    type === "links";

  const label =
    getWebsiteBlockLabel(
      type
    );

  if (
    DOM.websiteContentModalTitle
  ) {
    DOM.websiteContentModalTitle.textContent =
      websiteContentModalState.mode ===
      "edit"
        ? `Edit ${label}`
        : `Add ${label}`;
  }

  if (
    DOM.websiteContentModalDescription
  ) {
    DOM.websiteContentModalDescription.textContent =
      isText
        ? "Write your content clearly and comfortably. Long paragraphs are supported."
        : isImages
        ? "Add one or more HTTPS image URLs."
        : isVideos
        ? "Add YouTube video or YouTube Shorts URLs."
        : isLinks
        ? "Create one or more professional link buttons."
        : "Add website content.";
  }

  if (
    DOM.websiteContentTextField
  ) {
    DOM.websiteContentTextField.hidden =
      !isText;
  }

  if (
    DOM.websiteContentRepeatableField
  ) {
    DOM.websiteContentRepeatableField.hidden =
      isText;
  }

  if (isText) {
    if (
      DOM.websiteContentTextLabel
    ) {
      DOM.websiteContentTextLabel.innerHTML =
        `${label} <span class="required-mark">*</span>`;
    }

    if (
      DOM.websiteContentText
    ) {
      DOM.websiteContentText.value =
        block &&
        typeof block.text ===
          "string"
          ? block.text
          : "";

      DOM.websiteContentText.placeholder =
        type === "paragraph"
          ? "Write your paragraph here..."
          : "Write your sub-paragraph here...";
    }
  }

  if (!isText) {
    configureWebsiteRepeatableModal(
      type,
      block
    );
  }

  if (
    DOM.websiteContentSave
  ) {
    DOM.websiteContentSave.textContent =
      websiteContentModalState.mode ===
      "edit"
        ? `Save ${label}`
        : `Add ${label}`;
  }

  showModal(
    DOM.websiteContentModal
  );

  if (isText) {
    requestAnimationFrame(
      () => {
        if (
          DOM.websiteContentText
        ) {
          DOM.websiteContentText.focus();
        }
      }
    );
  }
}


function clearWebsiteContentModal() {
  if (
    DOM.websiteContentText
  ) {
    DOM.websiteContentText.value =
      "";
  }

  if (
    DOM.websiteContentRowList
  ) {
    DOM.websiteContentRowList.replaceChildren();
  }

  clearWebsiteContentModalError();
}


function clearWebsiteContentModalError() {
  if (
    DOM.websiteContentFormError
  ) {
    DOM.websiteContentFormError.hidden =
      true;

    DOM.websiteContentFormError.textContent =
      "";
  }
}


function showWebsiteContentModalError(
  message
) {
  if (
    DOM.websiteContentFormError
  ) {
    DOM.websiteContentFormError.hidden =
      false;

    DOM.websiteContentFormError.textContent =
      message;
  }
}


function closeWebsiteContentModal() {
  websiteContentModalState = {
    mode: "add",
    sectionId: null,
    blockId: null,
    type: null
  };

  hideModal(
    DOM.websiteContentModal
  );
}


function configureWebsiteRepeatableModal(
  type,
  block
) {
  let label =
    "Items";

  let help =
    "Add one or more items.";

  if (
    type === "images"
  ) {
    label =
      "Image URLs";

    help =
      "Use HTTPS image URLs. Add as many images as you need.";
  }

  if (
    type === "videos"
  ) {
    label =
      "YouTube URLs";

    help =
      "You can add normal YouTube videos and YouTube Shorts.";
  }

  if (
    type === "links"
  ) {
    label =
      "Link Buttons";

    help =
      "Give each button a clear name and destination URL.";
  }

  if (
    DOM.websiteContentRepeatableLabel
  ) {
    DOM.websiteContentRepeatableLabel.innerHTML =
      `${label} <span class="required-mark">*</span>`;
  }

  if (
    DOM.websiteContentRepeatableHelp
  ) {
    DOM.websiteContentRepeatableHelp.textContent =
      help;
  }

  const items =
    block &&
    Array.isArray(
      block.items
    )
      ? block.items
      : [];

  if (
    items.length === 0
  ) {
    addWebsiteContentModalRow();
    return;
  }

  items.forEach(
    (item) => {
      addWebsiteContentModalRow(
        item
      );
    }
  );
}


function addWebsiteContentModalRow(
  value = null
) {
  if (
    !DOM.websiteContentRowList
  ) {
    return;
  }

  const type =
    websiteContentModalState.type;

  const currentRows =
    DOM.websiteContentRowList.children.length;

  let maximum =
    WEBSITE_MAX_IMAGES_PER_BLOCK;

  if (
    type === "videos"
  ) {
    maximum =
      WEBSITE_MAX_VIDEOS_PER_BLOCK;
  }

  if (
    type === "links"
  ) {
    maximum =
      WEBSITE_MAX_LINKS_PER_BLOCK;
  }

  if (
    currentRows >=
    maximum
  ) {
    showWebsiteContentModalError(
      `Maximum ${maximum} items are allowed.`
    );

    return;
  }

  const row =
    document.createElement(
      "div"
    );

  row.className =
    type === "links"
      ? "website-link-row"
      : type === "images"
      ? "website-image-row"
      : "website-video-row";

  if (
    type === "links"
  ) {
    row.innerHTML = `
      <div class="form-group">
        <label class="form-label">
          Button Name
          <span class="required-mark">*</span>
        </label>

        <input
          type="text"
          class="form-input website-modal-link-name"
          maxlength="150"
          placeholder="e.g. Contact Us"
          autocomplete="off"
        >
      </div>

      <div class="form-group">
        <label class="form-label">
          Button URL
          <span class="required-mark">*</span>
        </label>

        <input
          type="url"
          class="form-input website-modal-link-url"
          maxlength="${WEBSITE_MAX_URL_LENGTH}"
          placeholder="https://example.com"
          inputmode="url"
          autocomplete="url"
        >
      </div>

      <button
        type="button"
        class="secondary-button website-field-row__remove"
        data-website-modal-remove-row
        aria-label="Remove link button"
        title="Remove"
      >
        −
      </button>
    `;

    const nameInput =
      row.querySelector(
        ".website-modal-link-name"
      );

    const urlInput =
      row.querySelector(
        ".website-modal-link-url"
      );

    if (
      value &&
      typeof value ===
        "object"
    ) {
      nameInput.value =
        typeof value.name ===
        "string"
          ? value.name
          : "";

      urlInput.value =
        typeof value.url ===
        "string"
          ? value.url
          : "";
    }
  } else {
    const placeholder =
      type === "images"
        ? "https://example.com/image.jpg"
        : "https://youtube.com/watch?v=...";

    const label =
      type === "images"
        ? "Image URL"
        : "YouTube URL";

    row.innerHTML = `
      <div class="form-group">
        <label class="form-label">
          ${label}
          <span class="required-mark">*</span>
        </label>

        <input
          type="url"
          class="form-input website-modal-url"
          maxlength="${WEBSITE_MAX_URL_LENGTH}"
          placeholder="${placeholder}"
          inputmode="url"
          autocomplete="url"
        >
      </div>

      <button
        type="button"
        class="secondary-button website-field-row__remove"
        data-website-modal-remove-row
        aria-label="Remove item"
        title="Remove"
      >
        −
      </button>
    `;

    const input =
      row.querySelector(
        ".website-modal-url"
      );

    if (
      typeof value ===
      "string"
    ) {
      input.value =
        value;
    }
  }

  DOM.websiteContentRowList.appendChild(
    row
  );

  clearWebsiteContentModalError();
}


function handleWebsiteContentModalRowAction(
  event
) {
  const removeButton =
    event.target.closest(
      "[data-website-modal-remove-row]"
    );

  if (!removeButton) {
    return;
  }

  const row =
    removeButton.closest(
      ".website-image-row, .website-video-row, .website-link-row"
    );

  if (!row) {
    return;
  }

  row.remove();

  if (
    DOM.websiteContentRowList.children.length ===
    0
  ) {
    addWebsiteContentModalRow();
  }
}


function saveWebsiteContentModal() {
  clearWebsiteContentModalError();

  const section =
    findWebsiteSection(
      websiteContentModalState.sectionId
    );

  if (!section) {
    closeWebsiteContentModal();
    return;
  }

  const type =
    websiteContentModalState.type;

  if (
    type === "paragraph" ||
    type === "subparagraph"
  ) {
    const text =
      normalizeText(
        DOM.websiteContentText
          ? DOM.websiteContentText.value
          : "",
        WEBSITE_MAX_TEXT_LENGTH
      );

    if (!text) {
      showWebsiteContentModalError(
        "Please enter your content."
      );

      if (
        DOM.websiteContentText
      ) {
        DOM.websiteContentText.focus();
      }

      return;
    }

    if (
      websiteContentModalState.mode ===
      "edit"
    ) {
      const block =
        section.blocks.find(
          (entry) =>
            entry.id ===
            websiteContentModalState.blockId
        );

      if (!block) {
        closeWebsiteContentModal();
        return;
      }

      block.text =
        text;
    } else {
      section.blocks.push({
        id:
          createId(
            "block"
          ),

        type:
          type,

        text:
          text
      });
    }

    finishWebsiteContentModalSave(
      websiteContentModalState.mode ===
        "edit"
        ? "Website content updated."
        : "Paragraph added."
    );

    return;
  }

  const rows =
    Array.from(
      DOM.websiteContentRowList
        ? DOM.websiteContentRowList.children
        : []
    );

  if (
    rows.length ===
    0
  ) {
    showWebsiteContentModalError(
      "Please add at least one item."
    );

    return;
  }

  if (
    type === "images"
  ) {
    const items =
      rows
        .map(
          (row) => {
            const input =
              row.querySelector(
                ".website-modal-url"
              );

            return input
              ? input.value.trim()
              : "";
          }
        )
        .filter(Boolean);

    const invalid =
      items.filter(
        (url) =>
          !isValidHttpsUrl(
            url
          )
      );

    if (
      items.length ===
      0
    ) {
      showWebsiteContentModalError(
        "Please add at least one image URL."
      );

      return;
    }

    if (
      invalid.length > 0
    ) {
      showWebsiteContentModalError(
        "Every image URL must be a valid HTTPS URL."
      );

      return;
    }

    saveWebsiteRepeatableBlock(
      section,
      "images",
      items
    );

    return;
  }

  if (
    type === "videos"
  ) {
    const items =
      rows
        .map(
          (row) => {
            const input =
              row.querySelector(
                ".website-modal-url"
              );

            return input
              ? input.value.trim()
              : "";
          }
        )
        .filter(Boolean);

    if (
      items.length ===
      0
    ) {
      showWebsiteContentModalError(
        "Please add at least one YouTube URL."
      );

      return;
    }

    const invalid =
      items.filter(
        (url) =>
          !isValidYoutubeUrl(
            url
          )
      );

    if (
      invalid.length > 0
    ) {
      showWebsiteContentModalError(
        "Please enter valid YouTube video or YouTube Shorts URLs."
      );

      return;
    }

    saveWebsiteRepeatableBlock(
      section,
      "videos",
      items
    );

    return;
  }

  if (
    type === "links"
  ) {
    const items =
      rows
        .map(
          (row) => {
            const nameInput =
              row.querySelector(
                ".website-modal-link-name"
              );

            const urlInput =
              row.querySelector(
                ".website-modal-link-url"
              );

            const name =
              normalizeText(
                nameInput
                  ? nameInput.value
                  : "",
                150
              );

            const url =
              normalizeText(
                urlInput
                  ? urlInput.value
                  : "",
                WEBSITE_MAX_URL_LENGTH
              );

            if (
              !name ||
              !isValidHttpsUrl(
                url
              )
            ) {
              return null;
            }

            return {
              name,
              url
            };
          }
        )
        .filter(Boolean);

    if (
      items.length ===
      0
    ) {
      showWebsiteContentModalError(
        "Please enter at least one valid button name and HTTPS URL."
      );

      return;
    }

    if (
      items.length !==
      rows.length
    ) {
      showWebsiteContentModalError(
        "Please complete every link button with a valid name and HTTPS URL."
      );

      return;
    }

    saveWebsiteRepeatableBlock(
      section,
      "links",
      items
    );
  }
}


function saveWebsiteRepeatableBlock(
  section,
  type,
  items
) {
  if (
    websiteContentModalState.mode ===
    "edit"
  ) {
    const block =
      section.blocks.find(
        (entry) =>
          entry.id ===
          websiteContentModalState.blockId
      );

    if (!block) {
      closeWebsiteContentModal();
      return;
    }

    block.items =
      items;
  } else {
    section.blocks.push({
      id:
        createId(
          "block"
        ),

      type:
        type,

      items:
        items
    });
  }

  finishWebsiteContentModalSave(
    websiteContentModalState.mode ===
      "edit"
      ? "Website content updated."
      : `${getWebsiteBlockLabel(type)} added.`
  );
}


function finishWebsiteContentModalSave(
  message
) {
  saveWebsiteData();

  renderWebsiteSections();

  closeWebsiteContentModal();

  showToast(
    message,
    "success"
  );
}


/* ---------------------------------------------------------
 * WEBSITE CONTENT CREATION
 * --------------------------------------------------------- */

function addWebsiteContent(
  sectionId,
  type
) {
  const section =
    findWebsiteSection(
      sectionId
    );

  if (!section) {
    return;
  }

  if (
    section.blocks.length >=
    WEBSITE_MAX_BLOCKS_PER_SECTION
  ) {
    showToast(
      `Maximum ${WEBSITE_MAX_BLOCKS_PER_SECTION} content blocks are allowed in one section.`,
      "error"
    );

    return;
  }

  openWebsiteContentModal(
    sectionId,
    type
  );
}


/* ---------------------------------------------------------
 * WEBSITE CONTENT EDIT / DELETE
 * --------------------------------------------------------- */

function editWebsiteContent(
  sectionId,
  blockId
) {
  const section =
    findWebsiteSection(
      sectionId
    );

  if (!section) {
    return;
  }

  const block =
    section.blocks.find(
      (entry) =>
        entry.id ===
        blockId
    );

  if (!block) {
    return;
  }

  openWebsiteContentModal(
    sectionId,
    block.type,
    block
  );
}

function deleteWebsiteContent(
  sectionId,
  blockId
) {
  const section =
    findWebsiteSection(
      sectionId
    );

  if (!section) {
    return;
  }

  const block =
    section.blocks.find(
      (entry) =>
        entry.id ===
        blockId
    );

  if (!block) {
    return;
  }

  if (
    !window.confirm(
      `Delete this ${getWebsiteBlockLabel(
        block.type
      ).toLowerCase()} block?`
    )
  ) {
    return;
  }

  section.blocks =
    section.blocks.filter(
      (entry) =>
        entry.id !==
        blockId
    );

  saveWebsiteData();

  renderWebsiteSections();

  showToast(
    "Website content deleted.",
    "success"
  );
}


/* ---------------------------------------------------------
 * WEBSITE FOOTER
 * --------------------------------------------------------- */

function addWebsiteFooterLink() {
  if (
    state.website.footer.items.length >=
    WEBSITE_MAX_FOOTER_LINKS
  ) {
    showToast(
      `Maximum ${WEBSITE_MAX_FOOTER_LINKS} footer links are allowed.`,
      "error"
    );

    return;
  }

  const name =
    window.prompt(
      "Enter footer link name:"
    );

  if (
    name === null
  ) {
    return;
  }

  const cleanName =
    normalizeText(
      name,
      150
    );

  const url =
    window.prompt(
      "Enter footer link URL:"
    );

  if (
    url === null
  ) {
    return;
  }

  const cleanUrl =
    normalizeText(
      url,
      WEBSITE_MAX_URL_LENGTH
    );

  if (
    !cleanName ||
    !isValidHttpsUrl(
      cleanUrl
    )
  ) {
    showToast(
      "Please enter a valid link name and HTTPS URL.",
      "error"
    );

    return;
  }

  state.website.footer.items.push({
    id:
      createId(
        "footer"
      ),

    name:
      cleanName,

    url:
      cleanUrl
  });

  saveWebsiteData();

  renderWebsiteFooter();

  showToast(
    "Footer link added.",
    "success"
  );
}


function renderWebsiteFooter() {
  if (
    !DOM.websiteFooterLinks
  ) {
    return;
  }

  DOM.websiteFooterLinks.replaceChildren();

  const items =
    state.website.footer.items;

  if (
    DOM.websiteFooterEmpty
  ) {
    DOM.websiteFooterEmpty.hidden =
      items.length > 0;
  }

  items.forEach(
    (item) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "website-footer-link-card";

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "website-footer-link-card__info";

      const name =
        document.createElement(
          "p"
        );

      name.className =
        "website-footer-link-card__name";

      name.textContent =
        item.name;

      const url =
        document.createElement(
          "p"
        );

      url.className =
        "website-footer-link-card__url";

      url.textContent =
        item.url;

      info.appendChild(
        name
      );

      info.appendChild(
        url
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "website-footer-link-card__actions";

      const edit =
        document.createElement(
          "button"
        );

      edit.type =
        "button";

      edit.className =
        "secondary-button secondary-button--small";

      edit.textContent =
        "Edit";

      edit.dataset.websiteFooterAction =
        "edit";

      edit.dataset.footerId =
        item.id;

      const remove =
        document.createElement(
          "button"
        );

      remove.type =
        "button";

      remove.className =
        "secondary-button secondary-button--small";

      remove.textContent =
        "Delete";

      remove.dataset.websiteFooterAction =
        "delete";

      remove.dataset.footerId =
        item.id;

      actions.appendChild(
        edit
      );

      actions.appendChild(
        remove
      );

      card.appendChild(
        info
      );

      card.appendChild(
        actions
      );

      DOM.websiteFooterLinks.appendChild(
        card
      );
    }
  );
}


function handleWebsiteFooterAction(
  event
) {
  const button =
    event.target.closest(
      "[data-website-footer-action]"
    );

  if (!button) {
    return;
  }

  const action =
    button.dataset.websiteFooterAction;

  const footerId =
    button.dataset.footerId;

  const item =
    state.website.footer.items.find(
      (entry) =>
        entry.id ===
        footerId
    );

  if (!item) {
    return;
  }

  if (
    action === "delete"
  ) {
    if (
      !window.confirm(
        `Delete footer link "${item.name}"?`
      )
    ) {
      return;
    }

    state.website.footer.items =
      state.website.footer.items.filter(
        (entry) =>
          entry.id !==
          footerId
      );

    saveWebsiteData();

    renderWebsiteFooter();

    return;
  }

  if (
    action === "edit"
  ) {
    const name =
      window.prompt(
        "Edit footer link name:",
        item.name
      );

    if (
      name === null
    ) {
      return;
    }

    const url =
      window.prompt(
        "Edit footer link URL:",
        item.url
      );

    if (
      url === null
    ) {
      return;
    }

    const cleanName =
      normalizeText(
        name,
        150
      );

    const cleanUrl =
      normalizeText(
        url,
        WEBSITE_MAX_URL_LENGTH
      );

    if (
      !cleanName ||
      !isValidHttpsUrl(
        cleanUrl
      )
    ) {
      showToast(
        "Please enter a valid link name and HTTPS URL.",
        "error"
      );

      return;
    }

    item.name =
      cleanName;

    item.url =
      cleanUrl;

    saveWebsiteData();

    renderWebsiteFooter();
  }
}


/* ---------------------------------------------------------
 * WEBSITE VALIDATION
 * --------------------------------------------------------- */

function validateWebsiteBuilder() {
  const errors = [];

  const subscriptionId =
    getValue(
      DOM.websiteSubscriptionId
    );

  const businessName =
    getValue(
      DOM.websiteBusinessName
    );

  const address =
    getValue(
      DOM.websiteAddress
    );

  const tagline =
    getValue(
      DOM.websiteTagline
    );

  const mobile =
    getValue(
      DOM.websiteMobile
    );

  const email =
    getValue(
      DOM.websiteEmail
    );

  const whatsapp =
    getValue(
      DOM.websiteWhatsapp
    );

  const password =
    DOM.websitePassword
      ? DOM.websitePassword.value
      : "";

  const logo =
    getValue(
      DOM.websiteLogo
    );

  if (!subscriptionId) {
    errors.push(
      "Please enter your Subscription ID."
    );
  }

  if (!password) {
    errors.push(
      "Please create your Business Password."
    );
  }

  if (!businessName) {
    errors.push(
      "Please enter the business name."
    );
  }

  if (!address) {
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
    logo &&
    !isValidHttpsUrl(
      logo
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
    state.website.sections.length ===
    0
  ) {
    errors.push(
      "Please add at least one website section."
    );
  }

  state.website.sections.forEach(
    (section) => {
      if (
        !section.heading
      ) {
        errors.push(
          "Every website section must have a heading."
        );
      }

      if (
        !Array.isArray(
          section.blocks
        )
      ) {
        errors.push(
          `Section "${section.heading}" has invalid content.`
        );
      }

      section.blocks.forEach(
        (block) => {
          if (
            block.type ===
              "paragraph" ||
            block.type ===
              "subparagraph"
          ) {
            if (
              !block.text
            ) {
              errors.push(
                `Section "${section.heading}" contains empty text content.`
              );
            }
          }

          if (
            block.type ===
            "images"
          ) {
            if (
              block.items.length ===
              0
            ) {
              errors.push(
                `Section "${section.heading}" contains an empty image block.`
              );
            }

            block.items.forEach(
              (url) => {
                if (
                  !isValidHttpsUrl(
                    url
                  )
                ) {
                  errors.push(
                    `Section "${section.heading}" contains an invalid image URL.`
                  );
                }
              }
            );
          }

          if (
            block.type ===
            "videos"
          ) {
            if (
              block.items.length ===
              0
            ) {
              errors.push(
                `Section "${section.heading}" contains an empty video block.`
              );
            }

            block.items.forEach(
              (url) => {
                if (
                  !isValidYoutubeUrl(
                    url
                  )
                ) {
                  errors.push(
                    `Section "${section.heading}" contains an invalid YouTube URL.`
                  );
                }
              }
            );
          }

          if (
            block.type ===
            "links"
          ) {
            if (
              block.items.length ===
              0
            ) {
              errors.push(
                `Section "${section.heading}" contains an empty link block.`
              );
            }

            block.items.forEach(
              (item) => {
                if (
                  !item.name ||
                  !isValidHttpsUrl(
                    item.url
                  )
                ) {
                  errors.push(
                    `Section "${section.heading}" contains an invalid link.`
                  );
                }
              }
            );
          }
        }
      );
    }
  );

  state.website.footer.items.forEach(
    (item) => {
      if (
        !item.name ||
        !isValidHttpsUrl(
          item.url
        )
      ) {
        errors.push(
          "Every footer link must have a name and valid HTTPS URL."
        );
      }
    }
  );

  return {
    valid:
      errors.length ===
      0,

    errors:
      uniqueStrings(
        errors
      )
  };
}


/* ---------------------------------------------------------
 * WEBSITE VALIDATION UI
 * --------------------------------------------------------- */

function showWebsiteValidation(
  errors
) {
  if (
    !DOM.websiteValidationSummary ||
    !DOM.websiteValidationList
  ) {
    return;
  }

  DOM.websiteValidationList.replaceChildren();

  errors.forEach(
    (error) => {
      const li =
        document.createElement(
          "li"
        );

      li.textContent =
        error;

      DOM.websiteValidationList.appendChild(
        li
      );
    }
  );

  DOM.websiteValidationSummary.hidden =
    false;

  DOM.websiteValidationSummary.scrollIntoView({
    behavior:
      "smooth",

    block:
      "center"
  });
}


function hideWebsiteValidation() {
  if (
    DOM.websiteValidationSummary
  ) {
    DOM.websiteValidationSummary.hidden =
      true;
  }

  if (
    DOM.websiteValidationList
  ) {
    DOM.websiteValidationList.replaceChildren();
  }
}


/* ---------------------------------------------------------
 * WEBSITE PAYLOAD
 * --------------------------------------------------------- */

function buildWebsitePublishPayload() {
  return {
    template:
      "WEB",

    subscriptionId:
      getValue(
        DOM.websiteSubscriptionId
      ),

    businessPassword:
      DOM.websitePassword
        ? DOM.websitePassword.value
        : "",

    business: {
      name:
        getValue(
          DOM.websiteBusinessName
        ),

      address:
        getValue(
          DOM.websiteAddress
        ),

      tagline:
        getValue(
          DOM.websiteTagline
        ),

      mobile:
        getValue(
          DOM.websiteMobile
        ),

      email:
        getValue(
          DOM.websiteEmail
        ),

      whatsapp:
        getValue(
          DOM.websiteWhatsapp
        ),

      logoUrl:
        getValue(
          DOM.websiteLogo
        )
    },

    location: {
      verified:
        state.location.verified,

      latitude:
        state.location.latitude,

      longitude:
        state.location.longitude,

      accuracy:
        state.location.accuracy,

      verifiedAt:
        state.location.verifiedAt
    },

    sections:
      state.website.sections.map(
        (section) => ({
          id:
            section.id,

          heading:
            section.heading,

          blocks:
            section.blocks
        })
      ),

    footer: {
      items:
        state.website.footer.items.map(
          (item) => ({
            id:
              item.id,

            name:
              item.name,

            url:
              item.url
          })
        )
    }
  };
}


/* ---------------------------------------------------------
 * WEBSITE PUBLISH
 * --------------------------------------------------------- */

async function publishWebsite() {
  if (
    state.publishing
  ) {
    return;
  }

  hideWebsiteValidation();

  const validation =
    validateWebsiteBuilder();

  if (
    !validation.valid
  ) {
    showWebsiteValidation(
      validation.errors
    );

    showToast(
      validation.errors[0] ||
        "Please review the website.",
      "error"
    );

    return;
  }

  const payload =
    buildWebsitePublishPayload();

  state.publishing =
    true;

  setWebsitePublishBusy(
    true
  );

  setWebsitePublishStatus(
    "Verifying subscription and publishing your Global Website..."
  );

  try {
    const result =
      await sendPublishRequest(
        payload
      );

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result &&
        result.message
          ? result.message
          : "The Global Website could not be created."
      );
    }

    if (
      !isValidHttpsUrl(
        result.url
      )
    ) {
      throw new Error(
        "The Worker did not return a valid website URL."
      );
    }

    setWebsitePublishStatus(
      "Website created. Waiting for the public files to become available..."
    );

    const ready =
      await waitForWebsiteDeployment(
        result.url
      );

    if (!ready) {
      setWebsitePublishStatus(
        "Website created, but the public files are still being published. Please try again shortly."
      );

      showToast(
        "Website created and is still being published.",
        "info"
      );

      return;
    }

    if (
      DOM.websitePublishedUrl
    ) {
      DOM.websitePublishedUrl.href =
        result.url;

      DOM.websitePublishedUrl.textContent =
        result.url;
    }

    if (
      DOM.websitePublishResult
    ) {
      DOM.websitePublishResult.hidden =
        false;
    }

    setWebsitePublishStatus(
      "Your Global Website is live."
    );

    showToast(
      "Your Global Website is now live.",
      "success"
    );

  } catch (error) {
    const message =
      getErrorMessage(
        error
      );

    setWebsitePublishStatus(
      message
    );

    showWebsiteValidation([
      message
    ]);

    showToast(
      message,
      "error"
    );

  } finally {
    state.publishing =
      false;

    setWebsitePublishBusy(
      false
    );
  }
}


async function waitForWebsiteDeployment(
  url
) {
  const startedAt =
    Date.now();

  while (
    Date.now() -
      startedAt <
    CONFIG.DEPLOYMENT_TIMEOUT_MS
  ) {
    if (
      await isWebsiteDeploymentReady(
        url
      )
    ) {
      return true;
    }

    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            CONFIG.DEPLOYMENT_TIMEOUT_MS -
            (
              Date.now() -
              startedAt
            )
          ) /
            1000
        )
      );

    setWebsitePublishStatus(
      `Waiting for website files to become live... ${remaining}s remaining.`
    );

    await sleep(
      CONFIG.DEPLOYMENT_CHECK_INTERVAL_MS
    );
  }

  return false;
}


async function isWebsiteDeploymentReady(
  url
) {
  try {
    const pageUrl =
      new URL(
        url
      );

    const dataUrl =
      new URL(
        "website.json",
        pageUrl
      );

    const [
      pageResponse,
      dataResponse
    ] =
      await Promise.all([
        fetchDeploymentResource(
          pageUrl.href
        ),

        fetchDeploymentResource(
          dataUrl.href
        )
      ]);

    return Boolean(
      pageResponse &&
      pageResponse.ok &&
      dataResponse &&
      dataResponse.ok
    );

  } catch {
    return false;
  }
}


function setWebsitePublishBusy(
  busy
) {
  if (
    !DOM.websitePublish
  ) {
    return;
  }

  DOM.websitePublish.disabled =
    busy;

  DOM.websitePublish.setAttribute(
    "aria-busy",
    busy
      ? "true"
      : "false"
  );

  if (
    DOM.websitePublishSpinner
  ) {
    DOM.websitePublishSpinner.hidden =
      !busy;
  }

  if (
    DOM.websitePublishButtonText
  ) {
    DOM.websitePublishButtonText.textContent =
      busy
        ? "Publishing..."
        : "Create Website";
  }
}


function setWebsitePublishStatus(
  message
) {
  if (
    DOM.websitePublishStatus
  ) {
    DOM.websitePublishStatus.textContent =
      message ||
      "";
  }
}


/* ---------------------------------------------------------
 * WEBSITE YOUTUBE
 * --------------------------------------------------------- */

function getYoutubeEmbedData(
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

    let id =
      "";

    let short =
      false;

    if (
      hostname ===
      "youtu.be"
    ) {
      id =
        url.pathname
          .split("/")
          .filter(Boolean)[0] ||
        "";
    } else if (
      hostname ===
        "youtube.com" ||
      hostname ===
        "m.youtube.com"
    ) {
      if (
        url.pathname.startsWith(
          "/shorts/"
        )
      ) {
        id =
          url.pathname
            .split("/")
            .filter(Boolean)[1] ||
          "";

        short =
          true;
      } else if (
        url.pathname ===
        "/watch"
      ) {
        id =
          url.searchParams.get(
            "v"
          ) ||
          "";
      } else if (
        url.pathname.startsWith(
          "/embed/"
        )
      ) {
        id =
          url.pathname
            .split("/")
            .filter(Boolean)[1] ||
          "";
      }
    }

    if (!id) {
      return null;
    }

    return {
      short,

      url:
        `https://www.youtube.com/embed/${encodeURIComponent(
          id
        )}?rel=0`
    };

  } catch {
    return null;
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

  clearCategoryItemData();

  clearWebsiteData();

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
    DOM.logoUrl,

    DOM.websiteSubscriptionId,
    DOM.websiteBusinessName,
    DOM.websiteAddress,
    DOM.websiteTagline,
    DOM.websiteMobile,
    DOM.websiteEmail,
    DOM.websiteWhatsapp,
    DOM.websitePassword,
    DOM.websiteLogo
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
    DOM.websiteLogoPreview
  ) {
    DOM.websiteLogoPreview.hidden =
      true;
  }

  if (
    DOM.websiteLogoPreviewImage
  ) {
    DOM.websiteLogoPreviewImage.removeAttribute(
      "src"
    );
  }

  renderWebsiteSections();

  renderWebsiteFooter();

  if (
    DOM.websitePublishResult
  ) {
    DOM.websitePublishResult.hidden =
      true;
  }

  setWebsitePublishStatus(
    ""
  );

  hideWebsiteValidation();

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
