/* =========================================================
   VIDHWAAN GLOBAL WEBSITE
   Universal Business Website Renderer
   ========================================================= */

(() => {
  "use strict";


  /* =========================================================
     CONFIGURATION
     ========================================================= */

  const CONFIG = Object.freeze({
    DATA_FILE: "./website.json",
    SERVICE_WORKER: "./sw.js",
    MAX_SECTIONS: 200,
    MAX_BLOCKS_PER_SECTION: 500,
    MAX_IMAGES_PER_BLOCK: 100,
    MAX_VIDEOS_PER_BLOCK: 100,
    MAX_LINKS_PER_BLOCK: 100
  });


  /* =========================================================
     DOM
     ========================================================= */

  const DOM = {};


  /* =========================================================
     STATE
     ========================================================= */

  const state = {
    data: null,
    activeVideo: null,
    activeImage: null
  };

  let deferredInstallPrompt = null;

  window.addEventListener(
    "beforeinstallprompt",
    event => {
      event.preventDefault();

      deferredInstallPrompt =
        event;

      updateInstallButton();
    }
  );

  window.addEventListener(
    "appinstalled",
    () => {
      deferredInstallPrompt =
        null;

      updateInstallButton();
    }
  );


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );


  async function initialize() {

    cacheDom();

    bindEvents();

    setCurrentYear();

    await loadWebsiteData();

    registerServiceWorker();
  }


  /* =========================================================
     DOM CACHE
     ========================================================= */

  function cacheDom() {

    DOM.pageTitle =
      document.getElementById(
        "page-title"
      );

    DOM.metaDescription =
      document.getElementById(
        "meta-description"
      );

    DOM.brandName =
      document.getElementById(
        "website-brand-name"
      );

    DOM.brandTagline =
      document.getElementById(
        "website-brand-tagline"
      );

    DOM.brandLogo =
      document.getElementById(
        "website-brand-logo-image"
      );

    DOM.hero =
      document.getElementById(
        "website-hero"
      );

    DOM.heroEyebrow =
      document.getElementById(
        "website-hero-eyebrow"
      );

    DOM.heroTitle =
      document.getElementById(
        "website-hero-title"
      );

    DOM.heroTagline =
      document.getElementById(
        "website-hero-tagline"
      );

    DOM.heroActions =
      document.getElementById(
        "website-hero-actions"
      );

    DOM.heroWhatsapp =
      document.getElementById(
        "website-hero-whatsapp"
      );

    DOM.heroContact =
      document.getElementById(
        "website-hero-contact"
      );

    DOM.heroLocation =
      document.getElementById(
        "website-hero-location"
      );

    DOM.heroVisual =
      document.getElementById(
        "website-hero-visual"
      );

    DOM.heroLogo =
      document.getElementById(
        "website-hero-logo"
      );

    DOM.headerPhone =
      document.getElementById(
        "website-header-phone"
      );

    DOM.headerWhatsapp =
      document.getElementById(
        "website-header-whatsapp"
      );

    DOM.sections =
      document.getElementById(
        "website-sections"
      );

    DOM.contactPhone =
      document.getElementById(
        "website-contact-phone"
      );

    DOM.contactPhoneValue =
      document.getElementById(
        "website-contact-phone-value"
      );

    DOM.contactEmail =
      document.getElementById(
        "website-contact-email"
      );

    DOM.contactEmailValue =
      document.getElementById(
        "website-contact-email-value"
      );

    DOM.contactWhatsapp =
      document.getElementById(
        "website-contact-whatsapp"
      );

    DOM.contactWhatsappValue =
      document.getElementById(
        "website-contact-whatsapp-value"
      );

    DOM.contactAddress =
      document.getElementById(
        "website-contact-address"
      );

    DOM.contactAddressValue =
      document.getElementById(
        "website-contact-address-value"
      );

    DOM.footerName =
      document.getElementById(
        "website-footer-name"
      );

    DOM.footerLogo =
      document.getElementById(
        "website-footer-logo-image"
      );

    DOM.footerTagline =
      document.getElementById(
        "website-footer-tagline"
      );

    DOM.footerLinks =
      document.getElementById(
        "website-footer-links"
      );

    DOM.footerYear =
      document.getElementById(
        "website-footer-year"
      );

    DOM.footerCopyrightName =
      document.getElementById(
        "website-footer-copyright-name"
      );

    DOM.lightbox =
      document.getElementById(
        "website-lightbox"
      );

    DOM.lightboxImage =
      document.getElementById(
        "website-lightbox-image"
      );

    DOM.lightboxClose =
      document.getElementById(
        "website-lightbox-close"
      );

    DOM.videoModal =
      document.getElementById(
        "website-video-modal"
      );

    DOM.videoFrame =
      document.getElementById(
        "website-video-modal-frame"
      );

    DOM.videoModalClose =
      document.getElementById(
        "website-video-modal-close"
      );

    DOM.installButton =
      document.getElementById(
        "website-install-button"
      );
  }


  /* =========================================================
     EVENTS
     ========================================================= */

  function bindEvents() {

    if (DOM.lightboxClose) {
      DOM.lightboxClose.addEventListener(
        "click",
        closeLightbox
      );
    }

    if (DOM.videoModalClose) {
      DOM.videoModalClose.addEventListener(
        "click",
        closeVideoModal
      );
    }

    if (DOM.lightbox) {

      const backdrop =
        DOM.lightbox.querySelector(
          ".website-lightbox__backdrop"
        );

      if (backdrop) {
        backdrop.addEventListener(
          "click",
          closeLightbox
        );
      }
    }

    if (DOM.videoModal) {

      const backdrop =
        DOM.videoModal.querySelector(
          ".website-video-modal__backdrop"
        );

      if (backdrop) {
        backdrop.addEventListener(
          "click",
          closeVideoModal
        );
      }
    }

    if (DOM.installButton) {
      DOM.installButton.addEventListener(
        "click",
        installWebsite
      );

      updateInstallButton();
    }

    document.addEventListener(
      "keydown",
      handleKeyboard
    );
  }


  function handleKeyboard(event) {

    if (event.key !== "Escape") {
      return;
    }

    if (
      DOM.lightbox &&
      !DOM.lightbox.hidden
    ) {
      closeLightbox();
      return;
    }

    if (
      DOM.videoModal &&
      !DOM.videoModal.hidden
    ) {
      closeVideoModal();
    }
  }


  /* =========================================================
     LOAD DATA
     ========================================================= */

  async function loadWebsiteData() {

    try {

      const response =
        await fetch(
          CONFIG.DATA_FILE,
          {
            cache: "no-store",
            headers: {
              Accept: "application/json"
            }
          }
        );

      if (!response.ok) {
        throw new Error(
          `Unable to load website data: ${response.status}`
        );
      }

      const data =
        await response.json();

      state.data =
        normalizeWebsiteData(data);

      renderWebsite();

    } catch (error) {

      console.error(
        "Website data loading failed:",
        error
      );

      renderFallbackWebsite();
    }
  }


  /* =========================================================
     NORMALIZATION
     ========================================================= */

  function normalizeWebsiteData(data) {

    const source =
      isObject(data)
        ? data
        : {};

    const business =
      isObject(source.business)
        ? source.business
        : {};

    const location =
      isObject(source.location)
        ? source.location
        : {};

    const sections =
      Array.isArray(source.sections)
        ? source.sections
            .slice(
              0,
              CONFIG.MAX_SECTIONS
            )
        : [];

    const footer =
      isObject(source.footer)
        ? source.footer
        : {};

    const footerItems =
      Array.isArray(footer.items)
        ? footer.items.slice(
            0,
            CONFIG.MAX_LINKS_PER_BLOCK
          )
        : [];

    return {
      version:
        Number(source.version) || 1,

      template:
        String(
          source.template || "WEB"
        ),

      business: {
        name:
          cleanText(
            business.name
          ),

        tagline:
          cleanText(
            business.tagline
          ),

        mobile:
          cleanText(
            business.mobile
          ),

        email:
          cleanText(
            business.email
          ),

        whatsapp:
          cleanText(
            business.whatsapp
          ),

        logoUrl:
          cleanUrl(
            business.logoUrl
          ),

        address:
          cleanText(
            business.address
          )
      },

      location: {
        verified:
          Boolean(location.verified),

        latitude:
          location.latitude,

        longitude:
          location.longitude,

        verifiedAt:
          cleanText(
            location.verifiedAt
          )
      },

      sections:
        sections.map(
          normalizeSection
        ),

      footer: {
        items:
          footerItems.map(
            normalizeFooterItem
          )
      }
    };
  }


  function normalizeSection(section) {

    const source =
      isObject(section)
        ? section
        : {};

    const blocks =
      Array.isArray(source.blocks)
        ? source.blocks.slice(
            0,
            CONFIG.MAX_BLOCKS_PER_SECTION
          )
        : [];

    return {
      id:
        cleanText(
          source.id
        ),

      heading:
        cleanText(
          source.heading
        ),

      blocks:
        blocks.map(
          normalizeBlock
        )
    };
  }


  function normalizeBlock(block) {

    const source =
      isObject(block)
        ? block
        : {};

    const type =
      cleanText(
        source.type
      ).toLowerCase();

    if (
      type === "paragraph" ||
      type === "subheading" ||
      type === "subparagraph"
    ) {

      return {
        type,
        text:
          cleanText(
            source.text
          )
      };
    }


    if (type === "images") {

      const items =
        Array.isArray(source.items)
          ? source.items.slice(
              0,
              CONFIG.MAX_IMAGES_PER_BLOCK
            )
          : [];

      return {
        type,
        items:
          items
            .map(normalizeImage)
            .filter(
              item =>
                Boolean(item.url)
            )
      };
    }


    if (type === "videos") {

      const items =
        Array.isArray(source.items)
          ? source.items.slice(
              0,
              CONFIG.MAX_VIDEOS_PER_BLOCK
            )
          : [];

      return {
        type,
        items:
          items
            .map(normalizeVideo)
            .filter(
              item =>
                Boolean(item.url)
            )
      };
    }


    if (type === "links") {

      const items =
        Array.isArray(source.items)
          ? source.items.slice(
              0,
              CONFIG.MAX_LINKS_PER_BLOCK
            )
          : [];

      return {
        type,
        items:
          items
            .map(normalizeLink)
            .filter(
              item =>
                Boolean(
                  item.name &&
                  item.url
                )
            )
      };
    }


    return {
      type,
      text:
        cleanText(
          source.text
        )
    };
  }


  function normalizeImage(item) {

    const source =
      isObject(item)
        ? item
        : {};

    if (
      typeof item === "string"
    ) {
      return {
        url: cleanUrl(item),
        alt: ""
      };
    }

    return {
      url:
        cleanUrl(
          source.url ||
          source.imageUrl ||
          source.src
        ),

      alt:
        cleanText(
          source.alt ||
          source.name ||
          ""
        )
    };
  }


  function normalizeVideo(item) {

    const source =
      isObject(item)
        ? item
        : {};

    if (
      typeof item === "string"
    ) {
      return {
        url: cleanUrl(item),
        title: "",
        type: ""
      };
    }

    return {
      url:
        cleanUrl(
          source.url ||
          source.videoUrl
        ),

      title:
        cleanText(
          source.title ||
          source.name ||
          ""
        ),

      type:
        cleanText(
          source.type
        ).toLowerCase()
    };
  }


  function normalizeLink(item) {

    const source =
      isObject(item)
        ? item
        : {};

    if (
      typeof item === "string"
    ) {
      return {
        name: "Learn More",
        url: cleanUrl(item)
      };
    }

    return {
      name:
        cleanText(
          source.name ||
          source.label ||
          source.title
        ),

      url:
        cleanUrl(
          source.url ||
          source.href
        )
    };
  }


  function normalizeFooterItem(item) {

    const source =
      isObject(item)
        ? item
        : {};

    if (
      typeof item === "string"
    ) {
      return {
        name: "Link",
        url: cleanUrl(item)
      };
    }

    return {
      name:
        cleanText(
          source.name ||
          source.label ||
          source.title
        ),

      url:
        cleanUrl(
          source.url ||
          source.href
        )
    };
  }


  /* =========================================================
     RENDER WEBSITE
     ========================================================= */

  function renderWebsite() {

    if (!state.data) {
      return;
    }

    renderBusiness();

    renderHero();

    renderSections();

    renderContact();

    renderFooter();
  }


  /* =========================================================
     BUSINESS
     ========================================================= */

  function renderBusiness() {

    const business =
      state.data.business;

    const name =
      business.name ||
      "Business";

    document.title =
      name;

    if (DOM.pageTitle) {
      DOM.pageTitle.textContent =
        name;
    }

    if (DOM.metaDescription) {

      DOM.metaDescription.setAttribute(
        "content",
        business.tagline ||
        name
      );
    }

    setText(
      DOM.brandName,
      name
    );

    setOptionalText(
      DOM.brandTagline,
      business.tagline
    );

    setLogo(
      DOM.brandLogo,
      business.logoUrl,
      name
    );

    setLogo(
      DOM.heroLogo,
      business.logoUrl,
      name
    );

    setLogo(
      DOM.footerLogo,
      business.logoUrl,
      name
    );

    setText(
      DOM.footerName,
      name
    );

    setText(
      DOM.footerCopyrightName,
      name
    );

    setOptionalText(
      DOM.footerTagline,
      business.tagline
    );
  }


  /* =========================================================
     HERO
     ========================================================= */

  function renderHero() {

    const business =
      state.data.business;

    const name =
      business.name ||
      "Business";

    setText(
      DOM.heroTitle,
      name
    );

    if (
      DOM.heroEyebrow
    ) {

      DOM.heroEyebrow.textContent =
        "Welcome";

      DOM.heroEyebrow.hidden =
        false;
    }

    setOptionalText(
      DOM.heroTagline,
      business.tagline
    );

    if (
      DOM.heroVisual
    ) {

      DOM.heroVisual.hidden =
        !business.logoUrl;
    }

    const whatsappUrl =
      buildWhatsAppUrl(
        business.whatsapp ||
        business.mobile
      );

    const phoneUrl =
      buildPhoneUrl(
        business.mobile
      );

    const location =
      state.data.location;

    const latitude =
      Number(
        location.latitude
      );

    const longitude =
      Number(
        location.longitude
      );

    const hasValidLocation =
      location.verified === true &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180;

    const locationUrl =
      hasValidLocation
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${latitude},${longitude}`
          )}`
        : "";

    let hasHeroAction =
      false;


    if (
      DOM.heroWhatsapp
    ) {

      if (whatsappUrl) {

        DOM.heroWhatsapp.href =
          whatsappUrl;

        DOM.heroWhatsapp.hidden =
          false;

        hasHeroAction =
          true;

      } else {

        DOM.heroWhatsapp.hidden =
          true;
      }
    }


    if (
      DOM.heroContact
    ) {

      DOM.heroContact.hidden =
        false;

      hasHeroAction =
        true;
    }


    if (
      DOM.heroLocation
    ) {

      if (
        locationUrl
      ) {

        DOM.heroLocation.href =
          locationUrl;

        DOM.heroLocation.hidden =
          false;

        hasHeroAction =
          true;

      } else {

        DOM.heroLocation.removeAttribute(
          "href"
        );

        DOM.heroLocation.hidden =
          true;
      }
    }


    if (
      DOM.heroActions
    ) {



      DOM.heroActions.hidden =
        !hasHeroAction;
    }


    if (
      DOM.headerPhone
    ) {

      if (phoneUrl) {

        DOM.headerPhone.href =
          phoneUrl;

        DOM.headerPhone.hidden =
          false;

      } else {

        DOM.headerPhone.hidden =
          true;
      }
    }


    if (
      DOM.headerWhatsapp
    ) {

      if (whatsappUrl) {

        DOM.headerWhatsapp.href =
          whatsappUrl;

        DOM.headerWhatsapp.hidden =
          false;

      } else {

        DOM.headerWhatsapp.hidden =
          true;
      }
    }
  }


  /* =========================================================
     SECTIONS
     ========================================================= */

  function renderSections() {

    if (!DOM.sections) {
      return;
    }

    DOM.sections.replaceChildren();

    const sections =
      state.data.sections;

    if (!sections.length) {
      return;
    }

    sections.forEach(
      (section, index) => {

        const element =
          renderSection(
            section,
            index
          );

        if (element) {
          DOM.sections.appendChild(
            element
          );
        }
      }
    );
  }


  function renderSection(
    section,
    index
  ) {

    if (
      !section.heading &&
      !section.blocks.length
    ) {
      return null;
    }

    const sectionElement =
      document.createElement(
        "section"
      );

    sectionElement.className =
      "website-content-section";

    if (section.id) {

      sectionElement.id =
        createSafeId(
          section.id,
          index
        );
    }


    const inner =
      document.createElement(
        "div"
      );

    inner.className =
      "website-content-section__inner";


    if (section.heading) {

      const header =
        document.createElement(
          "div"
        );

      header.className =
        "website-content-section__header";


      const eyebrow =
        document.createElement(
          "p"
        );

      eyebrow.className =
        "website-section-eyebrow";

      eyebrow.textContent =
        String(
          index + 1
        ).padStart(2, "0");


      const heading =
        document.createElement(
          "h2"
        );

      heading.className =
        "website-content-section__heading";

      heading.textContent =
        section.heading;


      header.appendChild(
        eyebrow
      );

      header.appendChild(
        heading
      );

      inner.appendChild(
        header
      );
    }


    const body =
      document.createElement(
        "div"
      );

    body.className =
      "website-content-section__body";


    section.blocks.forEach(
      block => {

        const element =
          renderBlock(
            block
          );

        if (element) {
          body.appendChild(
            element
          );
        }
      }
    );


    if (
      body.childNodes.length
    ) {
      inner.appendChild(
        body
      );
    }


    sectionElement.appendChild(
      inner
    );

    return sectionElement;
  }


  /* =========================================================
     BLOCK RENDERER
     ========================================================= */

  function renderBlock(block) {

    switch (block.type) {

      case "paragraph":
        return renderParagraph(
          block.text,
          false
        );

      case "subheading":
        return renderSubheading(
          block.text
        );

      case "subparagraph":
        return renderParagraph(
          block.text,
          true
        );

      case "images":
        return renderImages(
          block.items
        );

      case "videos":
        return renderVideos(
          block.items
        );

      case "links":
        return renderLinks(
          block.items
        );

      default:
        return null;
    }
  }


  /* =========================================================
     SUBHEADINGS
     ========================================================= */

  function renderSubheading(
    text
  ) {

    if (!text) {
      return null;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "website-content-block website-content-block--subheading";

    const heading =
      document.createElement(
        "h3"
      );

    heading.textContent =
      text;

    wrapper.appendChild(
      heading
    );

    return wrapper;
  }


  /* =========================================================
     PARAGRAPHS
     ========================================================= */

  function renderParagraph(
    text,
    isSubparagraph
  ) {

    if (!text) {
      return null;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      isSubparagraph
        ? "website-content-block website-content-block--subparagraph"
        : "website-content-block website-content-block--paragraph";


    const paragraph =
      document.createElement(
        "p"
      );

    paragraph.textContent =
      text;


    wrapper.appendChild(
      paragraph
    );

    return wrapper;
  }


  /* =========================================================
     IMAGES
     ========================================================= */

  function renderImages(items) {

    if (!items.length) {
      return null;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "website-content-block";


    const grid =
      document.createElement(
        "div"
      );

    grid.className =
      "website-image-grid";


    items.forEach(
      (item, index) => {

        const imageItem =
          document.createElement(
            "button"
          );

        imageItem.type =
          "button";

        imageItem.className =
          "website-image-item";

        imageItem.setAttribute(
          "aria-label",
          item.alt ||
          `Open image ${index + 1}`
        );


        const image =
          document.createElement(
            "img"
          );

        image.src =
          item.url;

        image.alt =
          item.alt ||
          "";

        image.loading =
          index === 0
            ? "eager"
            : "lazy";

        image.decoding =
          "async";


        image.addEventListener(
          "error",
          () => {

            imageItem.remove();
          }
        );


        imageItem.addEventListener(
          "click",
          () => {

            openLightbox(
              item.url,
              item.alt
            );
          }
        );


        imageItem.appendChild(
          image
        );

        grid.appendChild(
          imageItem
        );
      }
    );


    wrapper.appendChild(
      grid
    );

    return wrapper;
  }


  /* =========================================================
     VIDEOS
     ========================================================= */

  function renderVideos(items) {

    if (!items.length) {
      return null;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "website-content-block";


    const grid =
      document.createElement(
        "div"
      );

    grid.className =
      "website-video-grid";


    items.forEach(
      (item, index) => {

        const parsed =
          parseYouTubeUrl(
            item.url
          );

        if (!parsed) {
          return;
        }


        const card =
          document.createElement(
            "article"
          );

        card.className =
          parsed.isShort
            ? "website-video-card website-video-card--short"
            : "website-video-card";


        const thumbnail =
          document.createElement(
            "div"
          );

        thumbnail.className =
          "website-video-card__thumbnail";

        thumbnail.setAttribute(
          "role",
          "button"
        );

        thumbnail.setAttribute(
          "tabindex",
          "0"
        );

        thumbnail.setAttribute(
          "aria-label",
          item.title ||
          "Play video"
        );


        const image =
          document.createElement(
            "img"
          );

        image.src =
          buildYouTubeThumbnail(
            parsed.id
          );

        image.onerror =
          () => {

            image.onerror =
              null;

            image.src =
              `https://i.ytimg.com/vi/${encodeURIComponent(parsed.id)}/hqdefault.jpg`;
          };

        image.alt =
          item.title ||
          "YouTube video";

        image.loading =
          "lazy";

        image.decoding =
          "async";


        const play =
          document.createElement(
            "button"
          );

        play.type =
          "button";

        play.className =
          "website-video-card__play";

        play.setAttribute(
          "aria-label",
          item.title ||
          "Play video"
        );


        const openVideo =
          () => {

            openVideoModal(
              parsed
            );
          };


        thumbnail.addEventListener(
          "click",
          openVideo
        );

        thumbnail.addEventListener(
          "keydown",
          event => {

            if (
              event.key === "Enter" ||
              event.key === " "
            ) {

              event.preventDefault();

              openVideo();
            }
          }
        );


        play.addEventListener(
          "click",
          event => {

            event.stopPropagation();

            openVideo();
          }
        );


        thumbnail.appendChild(
          image
        );

        thumbnail.appendChild(
          play
        );

        card.appendChild(
          thumbnail
        );


        if (item.title) {

          const body =
            document.createElement(
              "div"
            );

          body.className =
            "website-video-card__body";


          const title =
            document.createElement(
              "p"
            );

          title.className =
            "website-video-card__title";

          title.textContent =
            item.title;


          body.appendChild(
            title
          );

          card.appendChild(
            body
          );
        }


        grid.appendChild(
          card
        );
      }
    );


    if (
      grid.childNodes.length === 0
    ) {
      return null;
    }


    wrapper.appendChild(
      grid
    );

    return wrapper;
  }


  /* =========================================================
     LINKS
     ========================================================= */

  function renderLinks(items) {

    if (!items.length) {
      return null;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "website-content-block";


    const list =
      document.createElement(
        "div"
      );

    list.className =
      "website-link-list";


    items.forEach(
      item => {

        const link =
          createExternalLink(
            item.url,
            item.name
          );

        if (!link) {
          return;
        }

        link.className =
          "website-link-button";

        list.appendChild(
          link
        );
      }
    );


    if (
      !list.childNodes.length
    ) {
      return null;
    }


    wrapper.appendChild(
      list
    );

    return wrapper;
  }


  /* =========================================================
     CONTACT
     ========================================================= */

  function renderContact() {

    const business =
      state.data.business;


    const phone =
      business.mobile;

    const email =
      business.email;

    const whatsapp =
      business.whatsapp ||
      business.mobile;

    const address =
      business.address;


    if (DOM.contactPhone) {

      if (phone) {

        DOM.contactPhone.href =
          buildPhoneUrl(phone);

        DOM.contactPhoneValue.textContent =
          phone;

        DOM.contactPhone.hidden =
          false;

      } else {

        DOM.contactPhone.hidden =
          true;
      }
    }


    if (DOM.contactEmail) {

      if (email) {

        DOM.contactEmail.href =
          buildEmailUrl(email);

        DOM.contactEmailValue.textContent =
          email;

        DOM.contactEmail.hidden =
          false;

      } else {

        DOM.contactEmail.hidden =
          true;
      }
    }


    if (DOM.contactWhatsapp) {

      const url =
        buildWhatsAppUrl(
          whatsapp
        );

      if (url) {

        DOM.contactWhatsapp.href =
          url;

        DOM.contactWhatsappValue.textContent =
          whatsapp;

        DOM.contactWhatsapp.hidden =
          false;

      } else {

        DOM.contactWhatsapp.hidden =
          true;
      }
    }


    if (DOM.contactAddress) {

      if (address) {

        DOM.contactAddressValue.textContent =
          address;

        DOM.contactAddress.hidden =
          false;

      } else {

        DOM.contactAddress.hidden =
          true;
      }
    }
  }


  /* =========================================================
     FOOTER
     ========================================================= */

  function renderFooter() {

    if (!DOM.footerLinks) {
      return;
    }

    DOM.footerLinks.replaceChildren();

    const items =
      state.data.footer.items;

    items.forEach(
      item => {

        const link =
          createExternalLink(
            item.url,
            item.name
          );

        if (!link) {
          return;
        }

        link.className =
          "website-footer__link";

        DOM.footerLinks.appendChild(
          link
        );
      }
    );
  }


  /* =========================================================
     LIGHTBOX
     ========================================================= */

  function openLightbox(
    url,
    alt
  ) {

    if (
      !DOM.lightbox ||
      !DOM.lightboxImage
    ) {
      return;
    }

    state.activeImage =
      url;

    DOM.lightboxImage.src =
      url;

    DOM.lightboxImage.alt =
      alt ||
      "";

    DOM.lightbox.hidden =
      false;

    DOM.lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";

    if (DOM.lightboxClose) {
      DOM.lightboxClose.focus();
    }
  }


  function closeLightbox() {

    if (!DOM.lightbox) {
      return;
    }

    DOM.lightbox.hidden =
      true;

    DOM.lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    if (DOM.lightboxImage) {
      DOM.lightboxImage.removeAttribute(
        "src"
      );
    }

    state.activeImage =
      null;

    restoreBodyScroll();
  }


  /* =========================================================
     VIDEO MODAL
     ========================================================= */

  function openVideoModal(video) {

    if (
      !DOM.videoModal ||
      !DOM.videoFrame ||
      !video
    ) {
      return;
    }

    const iframe =
      document.createElement(
        "iframe"
      );

    iframe.src =
      buildYouTubeEmbedUrl(
        video.id
      );

    iframe.title =
      "YouTube video";

    iframe.loading =
      "eager";

    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

    iframe.allowFullscreen =
      true;

    DOM.videoFrame.classList.toggle(
      "website-video-modal__frame--short",
      Boolean(video.isShort)
    );

    DOM.videoFrame.classList.toggle(
      "website-video-modal__frame--normal",
      !video.isShort
    );

    DOM.videoFrame.replaceChildren(
      iframe
    );

    DOM.videoModal.hidden =
      false;

    DOM.videoModal.setAttribute(
      "aria-hidden",
      "false"
    );

    state.activeVideo =
      video;

    document.body.style.overflow =
      "hidden";

    if (DOM.videoModalClose) {
      DOM.videoModalClose.focus();
    }
  }


  function closeVideoModal() {

    if (!DOM.videoModal) {
      return;
    }

    DOM.videoModal.hidden =
      true;

    DOM.videoModal.setAttribute(
      "aria-hidden",
      "true"
    );

    if (DOM.videoFrame) {

      DOM.videoFrame.classList.remove(
        "website-video-modal__frame--short",
        "website-video-modal__frame--normal"
      );

      DOM.videoFrame.replaceChildren();
    }

    state.activeVideo =
      null;

    restoreBodyScroll();
  }


  function restoreBodyScroll() {

    if (
      DOM.lightbox &&
      !DOM.lightbox.hidden
    ) {
      return;
    }

    if (
      DOM.videoModal &&
      !DOM.videoModal.hidden
    ) {
      return;
    }

    document.body.style.overflow =
      "";
  }


  /* =========================================================
     YOUTUBE
     ========================================================= */

  function parseYouTubeUrl(
    value
  ) {

    const url =
      cleanUrl(
        value
      );

    if (!url) {
      return null;
    }

    let parsed;

    try {
      parsed =
        new URL(
          url
        );
    } catch {
      return null;
    }


    const hostname =
      parsed.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );


    let id =
      "";

    let isShort =
      false;


    if (
      hostname === "youtu.be"
    ) {

      id =
        parsed.pathname
          .replace(
            /^\/+/,
            ""
          )
          .split(
            "/"
          )[0];

    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {

      const path =
        parsed.pathname;


      if (
        path === "/watch"
      ) {

        id =
          parsed.searchParams.get(
            "v"
          ) ||
          "";

      } else if (
        path.startsWith(
          "/shorts/"
        )
      ) {

        id =
          path
            .split(
              "/shorts/"
            )[1]
            ?.split(
              "/"
            )[0] ||
          "";

        isShort =
          true;

      } else if (
        path.startsWith(
          "/embed/"
        )
      ) {

        id =
          path
            .split(
              "/embed/"
            )[1]
            ?.split(
              "/"
            )[0] ||
          "";

      } else if (
        path.startsWith(
          "/live/"
        )
      ) {

        id =
          path
            .split(
              "/live/"
            )[1]
            ?.split(
              "/"
            )[0] ||
          "";
      }
    }


    if (!isValidYouTubeId(id)) {
      return null;
    }


    return {
      id,
      isShort
    };
  }


  function isValidYouTubeId(
    id
  ) {

    return /^[A-Za-z0-9_-]{6,20}$/.test(
      id
    );
  }


  function buildYouTubeThumbnail(
    id
  ) {

    return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/maxresdefault.jpg`;
  }


  function buildYouTubeEmbedUrl(
    id
  ) {

    return (
      `https://www.youtube.com/embed/${encodeURIComponent(id)}` +
      "?autoplay=1&rel=0&modestbranding=1"
    );
  }


  /* =========================================================
     URL HELPERS
     ========================================================= */

  function buildWhatsAppUrl(
    value
  ) {

    const number =
      normalizePhone(
        value
      );

    if (!number) {
      return "";
    }

    return (
      `https://wa.me/${number}`
    );
  }


  function buildPhoneUrl(
    value
  ) {

    const number =
      cleanText(
        value
      );

    if (!number) {
      return "";
    }

    return (
      `tel:${encodeURIComponent(number)}`
    );
  }


  function buildEmailUrl(
    value
  ) {

    const email =
      cleanText(
        value
      );

    if (!email) {
      return "";
    }

    return (
      `mailto:${encodeURIComponent(email)}`
    );
  }


  function normalizePhone(
    value
  ) {

    const raw =
      cleanText(
        value
      );

    if (!raw) {
      return "";
    }

    const digits =
      raw.replace(
        /\D/g,
        ""
      );

    if (!digits) {
      return "";
    }

    if (
      raw.trim().startsWith("+")
    ) {
      return digits;
    }

    return digits;
  }


  function createExternalLink(
    url,
    text
  ) {

    const safeUrl =
      cleanUrl(
        url
      );

    const label =
      cleanText(
        text
      );

    if (
      !safeUrl ||
      !label
    ) {
      return null;
    }

    const link =
      document.createElement(
        "a"
      );

    link.href =
      safeUrl;

    link.textContent =
      label;

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";

    return link;
  }


  /* =========================================================
     LOGO
     ========================================================= */

  function setLogo(
    element,
    url,
    businessName
  ) {

    if (!element) {
      return;
    }

    if (!url) {

      element.removeAttribute(
        "src"
      );

      element.alt =
        businessName ||
        "";

      return;
    }

    element.src =
      url;

    element.alt =
      businessName ||
      "";
  }


  /* =========================================================
     TEXT HELPERS
     ========================================================= */

  function setText(
    element,
    value
  ) {

    if (!element) {
      return;
    }

    element.textContent =
      value ||
      "";
  }


  function setOptionalText(
    element,
    value
  ) {

    if (!element) {
      return;
    }

    element.textContent =
      value ||
      "";

    element.hidden =
      !value;
  }


  function cleanText(
    value
  ) {

    if (
      typeof value !== "string"
    ) {
      return "";
    }

    return value
      .replace(
        /\u0000/g,
        ""
      )
      .trim();
  }


  function cleanUrl(
    value
  ) {

    const text =
      cleanText(
        value
      );

    if (!text) {
      return "";
    }

    try {

      const url =
        new URL(
          text,
          window.location.href
        );

      if (
        url.protocol !== "https:" &&
        url.protocol !== "http:"
      ) {
        return "";
      }

      return url.href;

    } catch {

      return "";
    }
  }


  function isObject(
    value
  ) {

    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }


  function createSafeId(
    value,
    index
  ) {

    const base =
      cleanText(
        value
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9_-]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        );

    return (
      `section-${base || index + 1}`
    );
  }


  /* =========================================================
     YEAR
     ========================================================= */

  function setCurrentYear() {

    if (DOM.footerYear) {

      DOM.footerYear.textContent =
        String(
          new Date().getFullYear()
        );
    }
  }


  /* =========================================================
     FALLBACK
     ========================================================= */

  function renderFallbackWebsite() {

    const fallback =
      {
        business: {
          name: "Business Website",
          tagline: "",
          mobile: "",
          email: "",
          whatsapp: "",
          logoUrl: "",
          address: ""
        },

        location: {
          verified: false,
          latitude: null,
          longitude: null,
          verifiedAt: ""
        },

        sections: [],

        footer: {
          items: []
        }
      };

    state.data =
      fallback;

    renderBusiness();

    renderHero();

    renderContact();

    renderFooter();
  }

  /* =========================================================
     PWA INSTALL
     ========================================================= */

  function isWebsiteInstalled() {

    return (
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true
    );
  }


  function updateInstallButton() {

    if (!DOM.installButton) {
      return;
    }

    const canInstall =
      Boolean(
        deferredInstallPrompt
      );

    const installed =
      isWebsiteInstalled();

    DOM.installButton.hidden =
      installed ||
      !canInstall;
  }


  async function installWebsite() {

    if (!deferredInstallPrompt) {
      return;
    }

    const promptEvent =
      deferredInstallPrompt;

    deferredInstallPrompt =
      null;

    updateInstallButton();

    try {

      await promptEvent.prompt();

      await promptEvent.userChoice;

    } catch (error) {

      console.warn(
        "Website install prompt failed:",
        error
      );

    } finally {

      updateInstallButton();
    }
  }

  /* =========================================================
     SERVICE WORKER
     ========================================================= */

  function registerServiceWorker() {

    if (
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register(
            CONFIG.SERVICE_WORKER,
            {
              scope: "./"
            }
          )
          .catch(
            error => {

              console.error(
                "Service worker registration failed:",
                error
              );
            }
          );
      }
    );
  }

})();