(() => {
  "use strict";

  const CONFIG = Object.freeze({
    DATA_URL: "./ecommerce.json",
    SERVICE_WORKER_URL: "./sw.js",
    MANIFEST_URL: "./manifest.json",
    FETCH_TIMEOUT_MS: 15000,
    CURRENCY: "INR",
    CURRENCY_SYMBOL: "₹",
    MAX_CART_QUANTITY: 999
  });

  const state = {
    data: null,
    categories: [],
    activeCategoryId: null,
    cart: new Map(),
    deferredInstallPrompt: null,
    lastFocusedElement: null,
    videoOpen: false,
    cartOpen: false,
    loading: false
  };

  const DOM = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheDom();
    bindEvents();
    setupInstallPrompt();
    registerServiceWorker();
    await loadBusiness();
  }

  function cacheDom() {
    DOM.businessLogoWrap =
      document.getElementById("business-logo-wrap");

    DOM.businessLogo =
      document.getElementById("business-logo");

    DOM.businessName =
      document.getElementById("business-name");

    DOM.businessTagline =
      document.getElementById("business-tagline");

    DOM.businessPhone =
      document.getElementById("business-phone");

    DOM.businessEmail =
      document.getElementById("business-email");

    DOM.businessAddress =
      document.getElementById("business-address");

    DOM.businessLocationButton =
      document.getElementById("business-location-button");

    DOM.categoryList =
      document.getElementById("category-list");

    DOM.productGrid =
      document.getElementById("product-grid");

    DOM.productsHeading =
      document.getElementById("products-heading");

    DOM.productsEmpty =
      document.getElementById("products-empty");

    DOM.cartPanel =
      document.getElementById("cart-panel");

    DOM.cartBackdrop =
      document.getElementById("cart-backdrop");

    DOM.cartClose =
      document.getElementById("cart-close");

    DOM.cartItems =
      document.getElementById("cart-items");

    DOM.cartEmpty =
      document.getElementById("cart-empty");

    DOM.cartSummary =
      document.getElementById("cart-summary");

    DOM.cartItemCount =
      document.getElementById("cart-item-count");

    DOM.cartTotal =
      document.getElementById("cart-total");

    DOM.whatsappOrderButton =
      document.getElementById("whatsapp-order-button");

    DOM.cartOpen =
      document.getElementById("cart-open");

    DOM.cartCount =
      document.getElementById("cart-count");

    DOM.installButton =
      document.getElementById("install-button");

    DOM.videoModal =
      document.getElementById("video-modal");

    DOM.videoModalBackdrop =
      document.getElementById("video-modal-backdrop");

    DOM.videoModalClose =
      document.getElementById("video-modal-close");

    DOM.videoModalTitle =
      document.getElementById("video-modal-title");

    DOM.videoModalContent =
      document.getElementById("video-modal-content");

    DOM.toastContainer =
      document.getElementById("toast-container");

    DOM.loadingOverlay =
      document.getElementById("loading-overlay");

    DOM.loadingMessage =
      document.getElementById("loading-message");

    DOM.applicationError =
      document.getElementById("application-error");

    DOM.applicationErrorMessage =
      document.getElementById("application-error-message");

    DOM.applicationRetry =
      document.getElementById("application-retry");
  }

  function bindEvents() {
    DOM.categoryList.addEventListener(
      "click",
      handleCategoryClick
    );

    DOM.productGrid.addEventListener(
      "click",
      handleProductGridClick
    );

    DOM.cartOpen.addEventListener(
      "click",
      () => setCartOpen(true)
    );

    DOM.cartClose.addEventListener(
      "click",
      () => setCartOpen(false)
    );

    DOM.cartBackdrop.addEventListener(
      "click",
      () => setCartOpen(false)
    );

    DOM.cartItems.addEventListener(
      "click",
      handleCartClick
    );

    DOM.whatsappOrderButton.addEventListener(
      "click",
      submitWhatsAppOrder
    );

    DOM.businessLocationButton.addEventListener(
      "click",
      openBusinessLocation
    );

    DOM.installButton.addEventListener(
      "click",
      installApplication
    );

    DOM.videoModalBackdrop.addEventListener(
      "click",
      closeVideoModal
    );

    DOM.videoModalClose.addEventListener(
      "click",
      closeVideoModal
    );

    DOM.applicationRetry.addEventListener(
      "click",
      loadBusiness
    );

    document.addEventListener(
      "keydown",
      handleGlobalKeydown
    );

    window.addEventListener(
      "beforeunload",
      cleanupTemporaryState
    );
  }

  async function loadBusiness() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    hideApplicationError();
    setLoading(true, "Loading business...");

    try {
      const response = await fetchWithTimeout(
        CONFIG.DATA_URL,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json"
          }
        },
        CONFIG.FETCH_TIMEOUT_MS
      );

      if (!response.ok) {
        throw new Error(
          `Business data request failed with status ${response.status}.`
        );
      }

      const contentType =
        response.headers.get("content-type") || "";

      if (
        contentType &&
        !contentType.toLowerCase().includes("json")
      ) {
        throw new Error(
          "The business data response is not valid JSON."
        );
      }

      const rawData = await response.json();

      const normalizedData =
        normalizeBusinessData(rawData);

      if (!normalizedData) {
        throw new Error(
          "The business data is incomplete or invalid."
        );
      }

      state.data = normalizedData;
      state.categories = normalizedData.categories;

      if (
        state.activeCategoryId &&
        !state.categories.some(
          (category) =>
            category.id === state.activeCategoryId
        )
      ) {
        state.activeCategoryId = null;
      }

      renderBusiness();
      renderCategories();
      renderProducts();
      renderCart();
      updateInstallButtonVisibility();
    } catch (error) {
      console.error(
        "Vidhwaan Ecommerce: unable to load business.",
        error
      );

      showApplicationError(
        getUserFriendlyLoadError(error)
      );
    } finally {
      state.loading = false;
      setLoading(false);
    }
  }

  function normalizeBusinessData(rawData) {
    if (
      !rawData ||
      typeof rawData !== "object" ||
      Array.isArray(rawData)
    ) {
      return null;
    }

    const rawBusiness =
      rawData.business &&
      typeof rawData.business === "object" &&
      !Array.isArray(rawData.business)
        ? rawData.business
        : {};

    const rawLocation =
      rawData.location &&
      typeof rawData.location === "object" &&
      !Array.isArray(rawData.location)
        ? rawData.location
        : {};

    const rawCategories =
      Array.isArray(rawData.categories)
        ? rawData.categories
        : [];

    const business = {
      name: cleanText(rawBusiness.name),
      tagline: cleanText(rawBusiness.tagline),
      address: cleanText(rawBusiness.address),
      mobile: normalizePhone(rawBusiness.mobile),
      email: normalizeEmail(rawBusiness.email),
      whatsapp: normalizePhone(rawBusiness.whatsapp),
      logoUrl: normalizeHttpUrl(rawBusiness.logoUrl)
    };

    if (!business.name) {
      return null;
    }

    const location = {
      verified:
        rawLocation.verified === true,
      latitude:
        normalizeCoordinate(rawLocation.latitude, -90, 90),
      longitude:
        normalizeCoordinate(
          rawLocation.longitude,
          -180,
          180
        ),
      verifiedAt:
        normalizeTimestamp(rawLocation.verifiedAt)
    };

    if (
      !location.verified ||
      location.latitude === null ||
      location.longitude === null
    ) {
      location.verified = false;
      location.latitude = null;
      location.longitude = null;
    }

    const categories = [];

    rawCategories.forEach(
      (rawCategory, categoryIndex) => {
        if (
          !rawCategory ||
          typeof rawCategory !== "object" ||
          Array.isArray(rawCategory)
        ) {
          return;
        }

        const name =
          cleanText(rawCategory.name);

        if (!name) {
          return;
        }

        const id =
          normalizeEntityId(
            rawCategory.id,
            `category-${categoryIndex + 1}`
          );

        const rawItems =
          Array.isArray(rawCategory.items)
            ? rawCategory.items
            : [];

        const items = [];

        rawItems.forEach(
          (rawItem, itemIndex) => {
            const item =
              normalizeItem(
                rawItem,
                id,
                itemIndex
              );

            if (item) {
              items.push(item);
            }
          }
        );

        categories.push({
          id,
          name,
          items
        });
      }
    );

    return {
      template:
        cleanText(rawData.template) || "ECM",
      version:
        Number.isFinite(Number(rawData.version))
          ? Number(rawData.version)
          : 1,
      business,
      location,
      categories
    };
  }

  function normalizeItem(
    rawItem,
    categoryId,
    itemIndex
  ) {
    if (
      !rawItem ||
      typeof rawItem !== "object" ||
      Array.isArray(rawItem)
    ) {
      return null;
    }

    const name =
      cleanText(rawItem.name);

    if (!name) {
      return null;
    }

    const price =
      normalizePrice(rawItem.price);

    if (price === null || price < 0) {
      return null;
    }

    const quantity =
      normalizeQuantity(rawItem.quantity);

    const unit =
      cleanText(rawItem.unit);

    const youtubeUrl =
      normalizeYouTubeUrl(
        rawItem.youtubeUrl
      );

    return {
      id: normalizeEntityId(
        rawItem.id,
        `${categoryId}-item-${itemIndex + 1}`
      ),
      name,
      price,
      quantity,
      unit,
      youtubeUrl
    };
  }

  function renderBusiness() {
    const business =
      state.data.business;

    document.title =
      business.name || "Business";

    setText(
      DOM.businessName,
      business.name || "Business"
    );

    setOptionalText(
      DOM.businessTagline,
      business.tagline
    );

    renderLogo(business);
    renderContactDetails(business);

    setOptionalText(
      DOM.businessAddress,
      business.address
    );

    renderLocationButton();
  }

  function renderLogo(business) {
    if (!business.logoUrl) {
      DOM.businessLogoWrap.hidden = true;
      DOM.businessLogo.removeAttribute("src");
      DOM.businessLogo.alt = "";
      return;
    }

    DOM.businessLogo.alt =
      `${business.name} logo`;

    DOM.businessLogoWrap.hidden = false;

    DOM.businessLogo.onload = () => {
      DOM.businessLogoWrap.hidden = false;
    };

    DOM.businessLogo.onerror = () => {
      DOM.businessLogoWrap.hidden = true;
      DOM.businessLogo.removeAttribute("src");
      DOM.businessLogo.alt = "";
    };

    DOM.businessLogo.src =
      business.logoUrl;
  }

  function renderContactDetails(business) {
    if (business.mobile) {
      DOM.businessPhone.href =
        `tel:${business.mobile}`;

      DOM.businessPhone.hidden = false;
    } else {
      DOM.businessPhone.hidden = true;
      DOM.businessPhone.removeAttribute("href");
    }

    if (business.email) {
      DOM.businessEmail.href =
        `mailto:${business.email}`;

      DOM.businessEmail.hidden = false;
    } else {
      DOM.businessEmail.hidden = true;
      DOM.businessEmail.removeAttribute("href");
    }
  }

  function renderLocationButton() {
    const location =
      state.data.location;

    const available =
      location.verified === true &&
      Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude);

    DOM.businessLocationButton.hidden =
      !available;
  }

  function renderCategories() {
    DOM.categoryList.replaceChildren();

    const categories =
      state.categories;

    if (!categories.length) {
      return;
    }

    const allButton =
      createCategoryButton(
        null,
        "All"
      );

    DOM.categoryList.appendChild(allButton);

    categories.forEach(
      (category) => {
        const button =
          createCategoryButton(
            category.id,
            category.name
          );

        DOM.categoryList.appendChild(button);
      }
    );

    updateCategoryButtonStates();
  }

  function createCategoryButton(
    categoryId,
    label
  ) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "category-button";
    button.dataset.categoryId =
      categoryId || "";
    button.textContent = label;

    return button;
  }

  function handleCategoryClick(event) {
    const button =
      event.target.closest(
        ".category-button"
      );

    if (!button) {
      return;
    }

    const categoryId =
      button.dataset.categoryId || null;

    state.activeCategoryId =
      categoryId;

    updateCategoryButtonStates();
    renderProducts();
  }

  function updateCategoryButtonStates() {
    const buttons =
      DOM.categoryList.querySelectorAll(
        ".category-button"
      );

    buttons.forEach((button) => {
      const buttonCategoryId =
        button.dataset.categoryId || null;

      const active =
        buttonCategoryId ===
        state.activeCategoryId;

      button.classList.toggle(
        "is-active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  }

  function renderProducts() {
    DOM.productGrid.replaceChildren();

    const category =
      getActiveCategory();

    let items = [];

    if (category) {
      items = category.items;
    } else {
      state.categories.forEach(
        (currentCategory) => {
          currentCategory.items.forEach(
            (item) => {
              items.push({
                ...item,
                categoryName:
                  currentCategory.name
              });
            }
          );
        }
      );
    }

    if (!items.length) {
      DOM.productGrid.hidden = true;
      DOM.productsEmpty.hidden = false;

      setText(
        DOM.productsHeading,
        category
          ? category.name
          : "Products"
      );

      return;
    }

    DOM.productGrid.hidden = false;
    DOM.productsEmpty.hidden = true;

    setText(
      DOM.productsHeading,
      category
        ? category.name
        : "Products"
    );

    const fragment =
      document.createDocumentFragment();

    items.forEach(
      (item) => {
        fragment.appendChild(
          createProductCard(item)
        );
      }
    );

    DOM.productGrid.appendChild(
      fragment
    );
  }

  function getActiveCategory() {
    if (!state.activeCategoryId) {
      return null;
    }

    return (
      state.categories.find(
        (category) =>
          category.id ===
          state.activeCategoryId
      ) || null
    );
  }

  function createProductCard(item) {
    const article =
      document.createElement("article");

    article.className =
      "product-card";

    article.dataset.itemId =
      item.id;

    const media =
      document.createElement("div");

    media.className =
      "product-card__media";

    if (item.youtubeUrl) {
      const thumbnail =
        createYouTubeThumbnail(item.youtubeUrl);

      if (thumbnail) {
        thumbnail.className =
          "product-card__thumbnail";

        thumbnail.alt =
          `${item.name} video thumbnail`;

        thumbnail.loading =
          "lazy";

        thumbnail.decoding =
          "async";

        media.appendChild(
          thumbnail
        );
      }

      const videoButton =
        document.createElement("button");

      videoButton.type = "button";
      videoButton.className =
        "product-card__video-button";

      videoButton.dataset.action =
        "play-video";

      videoButton.dataset.itemId =
        item.id;

      videoButton.setAttribute(
        "aria-label",
        `Play video for ${item.name}`
      );

      videoButton.innerHTML =
        '<span aria-hidden="true">▶</span>';

      media.appendChild(
        videoButton
      );
    } else {
      const placeholder =
        document.createElement("div");

      placeholder.className =
        "product-card__thumbnail";

      placeholder.setAttribute(
        "aria-hidden",
        "true"
      );

      media.appendChild(
        placeholder
      );
    }

    const body =
      document.createElement("div");

    body.className =
      "product-card__body";

    const name =
      document.createElement("h3");

    name.className =
      "product-card__name";

    name.textContent =
      item.name;

    body.appendChild(name);

    const price =
      document.createElement("p");

    price.className =
      "product-card__price";

    price.textContent =
      formatCurrency(item.price);

    body.appendChild(price);

    if (
      item.quantity !== null ||
      item.unit
    ) {
      const quantity =
        document.createElement("p");

      quantity.className =
        "product-card__quantity";

      quantity.textContent =
        formatAvailability(
          item.quantity,
          item.unit
        );

      body.appendChild(quantity);
    }

    const actions =
      document.createElement("div");

    actions.className =
      "product-card__actions";

    const addButton =
      document.createElement("button");

    addButton.type = "button";
    addButton.className =
      "product-card__add";

    addButton.dataset.action =
      "add-to-cart";

    addButton.dataset.itemId =
      item.id;

    addButton.textContent =
      "Add to Cart";

    actions.appendChild(
      addButton
    );

    body.appendChild(actions);
    article.appendChild(media);
    article.appendChild(body);

    return article;
  }

  function handleProductGridClick(event) {
    const actionElement =
      event.target.closest(
        "[data-action]"
      );

    if (!actionElement) {
      return;
    }

    const action =
      actionElement.dataset.action;

    const itemId =
      actionElement.dataset.itemId;

    if (!itemId) {
      return;
    }

    if (action === "add-to-cart") {
      addToCart(itemId);
      return;
    }

    if (action === "play-video") {
      openVideoForItem(itemId);
    }
  }

  function addToCart(itemId) {
    const item =
      findItemById(itemId);

    if (!item) {
      showToast(
        "This product is no longer available.",
        "error"
      );

      return;
    }

    const existing =
      state.cart.get(itemId);

    const currentQuantity =
      existing
        ? existing.quantity
        : 0;

    if (
      currentQuantity >=
      CONFIG.MAX_CART_QUANTITY
    ) {
      showToast(
        "Maximum quantity reached.",
        "error"
      );

      return;
    }

    state.cart.set(itemId, {
      item,
      quantity:
        currentQuantity + 1
    });

    renderCart();

    showToast(
      `${item.name} added to cart.`,
      "success"
    );
  }

  function removeFromCart(itemId) {
    state.cart.delete(itemId);
    renderCart();
  }

  function changeCartQuantity(
    itemId,
    change
  ) {
    const cartEntry =
      state.cart.get(itemId);

    if (!cartEntry) {
      return;
    }

    const nextQuantity =
      cartEntry.quantity + change;

    if (nextQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (
      nextQuantity >
      CONFIG.MAX_CART_QUANTITY
    ) {
      showToast(
        "Maximum quantity reached.",
        "error"
      );

      return;
    }

    state.cart.set(itemId, {
      item: cartEntry.item,
      quantity: nextQuantity
    });

    renderCart();
  }

  function renderCart() {
    DOM.cartItems.replaceChildren();

    let totalItems = 0;
    let totalAmount = 0;

    state.cart.forEach(
      (entry) => {
        totalItems +=
          entry.quantity;

        totalAmount +=
          entry.item.price *
          entry.quantity;

        DOM.cartItems.appendChild(
          createCartItem(entry)
        );
      }
    );

    const hasItems =
      totalItems > 0;

    DOM.cartEmpty.hidden =
      hasItems;

    DOM.cartSummary.hidden =
      !hasItems;

    DOM.whatsappOrderButton.disabled =
      !hasItems ||
      !isWhatsAppAvailable();

    DOM.cartOpen.hidden =
      !hasItems;

    DOM.cartItemCount.textContent =
      String(totalItems);

    DOM.cartTotal.textContent =
      formatCurrency(totalAmount);

    DOM.cartCount.textContent =
      String(totalItems);

    DOM.cartCount.setAttribute(
      "aria-label",
      `${totalItems} ${
        totalItems === 1
          ? "item"
          : "items"
      }`
    );
  }

  function createCartItem(entry) {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "cart-item";

    const details =
      document.createElement("div");

    const name =
      document.createElement("p");

    name.className =
      "cart-item__name";

    name.textContent =
      entry.item.name;

    details.appendChild(name);

    const price =
      document.createElement("p");

    price.className =
      "cart-item__price";

    price.textContent =
      `${formatCurrency(entry.item.price)} each`;

    details.appendChild(price);

    const controls =
      document.createElement("div");

    controls.className =
      "cart-item__controls";

    const decrease =
      document.createElement("button");

    decrease.type = "button";
    decrease.className =
      "cart-item__quantity-button";

    decrease.dataset.action =
      "decrease";

    decrease.dataset.itemId =
      entry.item.id;

    decrease.setAttribute(
      "aria-label",
      `Decrease ${entry.item.name} quantity`
    );

    decrease.textContent =
      "−";

    const quantity =
      document.createElement("span");

    quantity.className =
      "cart-item__quantity";

    quantity.textContent =
      String(entry.quantity);

    quantity.setAttribute(
      "aria-label",
      `Quantity ${entry.quantity}`
    );

    const increase =
      document.createElement("button");

    increase.type = "button";
    increase.className =
      "cart-item__quantity-button";

    increase.dataset.action =
      "increase";

    increase.dataset.itemId =
      entry.item.id;

    increase.setAttribute(
      "aria-label",
      `Increase ${entry.item.name} quantity`
    );

    increase.textContent =
      "+";

    controls.appendChild(
      decrease
    );

    controls.appendChild(
      quantity
    );

    controls.appendChild(
      increase
    );

    wrapper.appendChild(details);
    wrapper.appendChild(controls);

    return wrapper;
  }

  function handleCartClick(event) {
    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    const itemId =
      button.dataset.itemId;

    if (!itemId) {
      return;
    }

    if (
      button.dataset.action ===
      "increase"
    ) {
      changeCartQuantity(
        itemId,
        1
      );

      return;
    }

    if (
      button.dataset.action ===
      "decrease"
    ) {
      changeCartQuantity(
        itemId,
        -1
      );
    }
  }

  function setCartOpen(open) {
    state.cartOpen = open;

    if (open) {
      state.lastFocusedElement =
        document.activeElement;

      DOM.cartPanel.hidden = false;
      DOM.cartPanel.setAttribute(
        "aria-hidden",
        "false"
      );

      DOM.cartOpen.setAttribute(
        "aria-expanded",
        "true"
      );

      document.body.classList.add(
        "is-modal-open"
      );

      window.requestAnimationFrame(
        () => {
          DOM.cartClose.focus();
        }
      );

      return;
    }

    DOM.cartPanel.hidden = true;

    DOM.cartPanel.setAttribute(
      "aria-hidden",
      "true"
    );

    DOM.cartOpen.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove(
      "is-modal-open"
    );

    restoreFocus();
  }

  function submitWhatsAppOrder() {
    if (
      !state.cart.size ||
      !isWhatsAppAvailable()
    ) {
      return;
    }

    const whatsapp =
      normalizeWhatsAppTarget(
        state.data.business.whatsapp
      );

    if (!whatsapp) {
      showToast(
        "WhatsApp ordering is not available for this business.",
        "error"
      );

      return;
    }

    const lines = [
      `New Order — ${state.data.business.name}`,
      ""
    ];

    let totalItems = 0;
    let totalAmount = 0;

    state.cart.forEach(
      (entry, index) => {
        const lineTotal =
          entry.item.price *
          entry.quantity;

        totalItems +=
          entry.quantity;

        totalAmount +=
          lineTotal;

        lines.push(
          `${index + 1}. ${entry.item.name}`
        );

        lines.push(
          `   Quantity: ${entry.quantity}`
        );

        lines.push(
          `   Price: ${formatCurrency(entry.item.price)}`
        );

        lines.push(
          `   Total: ${formatCurrency(lineTotal)}`
        );

        lines.push("");
      }
    );

    lines.push(
      `Items: ${totalItems}`
    );

    lines.push(
      `Order Total: ${formatCurrency(totalAmount)}`
    );

    const message =
      lines.join("\n");

    const url =
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function isWhatsAppAvailable() {
    return Boolean(
      normalizeWhatsAppTarget(
        state.data?.business?.whatsapp
      )
    );
  }

  function normalizeWhatsAppTarget(value) {
    const normalized =
      String(value || "")
        .replace(/\D/g, "");

    if (!normalized) {
      return null;
    }

    if (
      normalized.length < 8 ||
      normalized.length > 15
    ) {
      return null;
    }

    return normalized;
  }

  function openBusinessLocation() {
    const location =
      state.data?.location;

    if (
      !location ||
      location.verified !== true ||
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude)
    ) {
      showToast(
        "Business location is not available.",
        "error"
      );

      return;
    }

    const latitude =
      encodeURIComponent(
        String(location.latitude)
      );

    const longitude =
      encodeURIComponent(
        String(location.longitude)
      );

    const mapsUrl =
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openVideoForItem(itemId) {
    const item =
      findItemById(itemId);

    if (
      !item ||
      !item.youtubeUrl
    ) {
      return;
    }

    const videoId =
      extractYouTubeVideoId(
        item.youtubeUrl
      );

    if (!videoId) {
      showToast(
        "This product video link is invalid.",
        "error"
      );

      return;
    }

    state.lastFocusedElement =
      document.activeElement;

    DOM.videoModalTitle.textContent =
      item.name;

    DOM.videoModalContent.replaceChildren();

    const iframe =
      document.createElement("iframe");

    iframe.src =
      `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;

    iframe.title =
      `${item.name} product video`;

    iframe.loading =
      "eager";

    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

    iframe.referrerPolicy =
      "strict-origin-when-cross-origin";

    iframe.allowFullscreen = true;

    DOM.videoModalContent.appendChild(
      iframe
    );

    DOM.videoModal.hidden = false;

    DOM.videoModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "is-modal-open"
    );

    state.videoOpen = true;

    window.requestAnimationFrame(
      () => {
        DOM.videoModalClose.focus();
      }
    );
  }

  function closeVideoModal() {
    if (!state.videoOpen) {
      return;
    }

    DOM.videoModalContent.replaceChildren();

    DOM.videoModal.hidden = true;

    DOM.videoModal.setAttribute(
      "aria-hidden",
      "true"
    );

    state.videoOpen = false;

    if (!state.cartOpen) {
      document.body.classList.remove(
        "is-modal-open"
      );
    }

    restoreFocus();
  }

  function setupInstallPrompt() {
    window.addEventListener(
      "beforeinstallprompt",
      (event) => {
        event.preventDefault();

        state.deferredInstallPrompt =
          event;

        updateInstallButtonVisibility();
      }
    );

    window.addEventListener(
      "appinstalled",
      () => {
        state.deferredInstallPrompt =
          null;

        DOM.installButton.hidden =
          true;

        showToast(
          "App installed successfully.",
          "success"
        );
      }
    );

    updateInstallButtonVisibility();
  }

  function updateInstallButtonVisibility() {
    const isStandalone =
      isRunningAsInstalledPWA();

    DOM.installButton.hidden =
      isStandalone ||
      !state.deferredInstallPrompt;
  }

  async function installApplication() {
    if (
      !state.deferredInstallPrompt
    ) {
      return;
    }

    const promptEvent =
      state.deferredInstallPrompt;

    state.deferredInstallPrompt =
      null;

    DOM.installButton.hidden =
      true;

    try {
      await promptEvent.prompt();

      await promptEvent.userChoice;
    } catch (error) {
      console.error(
        "Vidhwaan Ecommerce: PWA installation failed.",
        error
      );
    } finally {
      updateInstallButtonVisibility();
    }
  }

  function isRunningAsInstalledPWA() {
    return (
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true
    );
  }

  async function registerServiceWorker() {
    if (
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    try {
      await navigator.serviceWorker.register(
        CONFIG.SERVICE_WORKER_URL,
        {
          scope: "./"
        }
      );
    } catch (error) {
      console.error(
        "Vidhwaan Ecommerce: service worker registration failed.",
        error
      );
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
      "toast";

    if (
      type === "success" ||
      type === "error"
    ) {
      toast.classList.add(
        `toast--${type}`
      );
    }

    toast.setAttribute(
      "role",
      type === "error"
        ? "alert"
        : "status"
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
      3500
    );
  }

  function showApplicationError(
    message
  ) {
    DOM.applicationErrorMessage.textContent =
      message;

    DOM.applicationError.hidden =
      false;

    DOM.applicationRetry.focus();
  }

  function hideApplicationError() {
    DOM.applicationError.hidden =
      true;
  }

  function setLoading(
    visible,
    message
  ) {
    DOM.loadingOverlay.hidden =
      !visible;

    if (message) {
      DOM.loadingMessage.textContent =
        message;
    }
  }

  function findItemById(itemId) {
    for (
      const category of state.categories
    ) {
      const item =
        category.items.find(
          (currentItem) =>
            currentItem.id === itemId
        );

      if (item) {
        return item;
      }
    }

    return null;
  }

  function createYouTubeThumbnail(
    youtubeUrl
  ) {
    const videoId =
      extractYouTubeVideoId(
        youtubeUrl
      );

    if (!videoId) {
      return null;
    }

    const image =
      document.createElement("img");

    image.src =
      `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;

    return image;
  }

  function normalizeYouTubeUrl(value) {
    const url =
      normalizeHttpUrl(value);

    if (!url) {
      return null;
    }

    return extractYouTubeVideoId(url)
      ? url
      : null;
  }

  function extractYouTubeVideoId(value) {
    let url;

    try {
      url =
        new URL(String(value));
    } catch {
      return null;
    }

    const hostname =
      url.hostname.toLowerCase();

    if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      const id =
        url.pathname
          .split("/")
          .filter(Boolean)[0];

      return isValidYouTubeId(id)
        ? id
        : null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const shortsMatch =
        url.pathname.match(
          /^\/shorts\/([^/?#]+)/
        );

      if (shortsMatch) {
        return isValidYouTubeId(
          shortsMatch[1]
        )
          ? shortsMatch[1]
          : null;
      }

      const embedMatch =
        url.pathname.match(
          /^\/embed\/([^/?#]+)/
        );

      if (embedMatch) {
        return isValidYouTubeId(
          embedMatch[1]
        )
          ? embedMatch[1]
          : null;
      }

      const videoId =
        url.searchParams.get("v");

      return isValidYouTubeId(videoId)
        ? videoId
        : null;
    }

    return null;
  }

  function isValidYouTubeId(value) {
    return Boolean(
      typeof value === "string" &&
      /^[A-Za-z0-9_-]{11}$/.test(value)
    );
  }

  function normalizeHttpUrl(value) {
    const text =
      String(value || "").trim();

    if (!text) {
      return null;
    }

    try {
      const url =
        new URL(text);

      if (
        url.protocol !== "https:" &&
        url.protocol !== "http:"
      ) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  function normalizeEmail(value) {
    const email =
      String(value || "")
        .trim()
        .toLowerCase();

    if (!email) {
      return null;
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return null;
    }

    return email;
  }

  function normalizePhone(value) {
    const text =
      String(value || "").trim();

    if (!text) {
      return null;
    }

    const digits =
      text.replace(/\D/g, "");

    if (
      digits.length < 7 ||
      digits.length > 15
    ) {
      return null;
    }

    return text;
  }

  function normalizePrice(value) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    if (
      number < 0 ||
      number > 999999999
    ) {
      return null;
    }

    return Math.round(
      (number + Number.EPSILON) *
        100
    ) / 100;
  }

  function normalizeQuantity(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    if (
      number < 0 ||
      number > 999999999
    ) {
      return null;
    }

    return number;
  }

  function normalizeCoordinate(
    value,
    min,
    max
  ) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    if (
      number < min ||
      number > max
    ) {
      return null;
    }

    return number;
  }

  function normalizeTimestamp(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const number =
      Number(value);

    if (
      !Number.isFinite(number) ||
      number < 0
    ) {
      return null;
    }

    return number;
  }

  function normalizeEntityId(
    value,
    fallback
  ) {
    const text =
      String(value || "")
        .trim();

    if (!text) {
      return fallback;
    }

    return text.slice(0, 200);
  }

  function cleanText(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 2000);
  }

  function formatCurrency(value) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return `${CONFIG.CURRENCY_SYMBOL}0`;
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: CONFIG.CURRENCY,
        minimumFractionDigits:
          Number.isInteger(number)
            ? 0
            : 2,
        maximumFractionDigits: 2
      }
    ).format(number);
  }

  function formatAvailability(
    quantity,
    unit
  ) {
    if (
      quantity === null &&
      !unit
    ) {
      return "";
    }

    if (
      quantity !== null &&
      unit
    ) {
      return `${quantity} ${unit}`;
    }

    if (quantity !== null) {
      return `${quantity}`;
    }

    return unit;
  }

  function setText(
    element,
    value
  ) {
    if (!element) {
      return;
    }

    element.textContent =
      String(value || "");
  }

  function setOptionalText(
    element,
    value
  ) {
    if (!element) {
      return;
    }

    const text =
      String(value || "").trim();

    element.textContent =
      text;

    element.hidden =
      !text;
  }

  function restoreFocus() {
    const element =
      state.lastFocusedElement;

    state.lastFocusedElement =
      null;

    if (
      element &&
      typeof element.focus ===
        "function" &&
      document.contains(element)
    ) {
      window.requestAnimationFrame(
        () => element.focus()
      );
    }
  }

  function handleGlobalKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }

    if (state.videoOpen) {
      closeVideoModal();
      return;
    }

    if (state.cartOpen) {
      setCartOpen(false);
    }
  }

  function cleanupTemporaryState() {
    state.deferredInstallPrompt =
      null;
  }

  function getUserFriendlyLoadError(
    error
  ) {
    if (
      error &&
      error.name === "AbortError"
    ) {
      return "The business information took too long to load. Please try again.";
    }

    if (
      error instanceof SyntaxError
    ) {
      return "The business information is not valid JSON.";
    }

    if (
      error instanceof TypeError
    ) {
      return "The business information could not be reached. Please check your connection and try again.";
    }

    return "The business information could not be loaded. Please try again.";
  }

  async function fetchWithTimeout(
    url,
    options,
    timeoutMs
  ) {
    const controller =
      new AbortController();

    const timeoutId =
      window.setTimeout(
        () => controller.abort(),
        timeoutMs
      );

    try {
      return await fetch(
        url,
        {
          ...options,
          signal:
            controller.signal
        }
      );
    } finally {
      window.clearTimeout(
        timeoutId
      );
    }
  }
})();
