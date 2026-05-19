(function () {
  var ctaTimer = null;
  var ctaDelay = 10000;
  var initialFinalMessageHtml = null;

  function isSachsenPage() {
    return document.body && document.body.classList.contains("page-sachsen-anhalt");
  }

  // Show the Sachsen-Anhalt share CTA after users send or copy their letter.
  function showShareCta() {
    document.body.classList.add("sachsen-share-cta-visible");

    if (window.matchMedia("(max-width: 74.999rem)").matches) {
      window.requestAnimationFrame(function () {
        var shareCta = document.getElementById("sachsen-share-cta");

        if (shareCta) {
          shareCta.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      });
    }
  }

  function scheduleShareCta() {
    if (ctaTimer) {
      window.clearTimeout(ctaTimer);
    }

    ctaTimer = window.setTimeout(showShareCta, ctaDelay);
  }

  // Reset the Sachsen-Anhalt share CTA when users go back to edit their form data.
  function resetShareCta() {
    if (ctaTimer) {
      window.clearTimeout(ctaTimer);
      ctaTimer = null;
    }

    document.body.classList.remove("sachsen-share-cta-visible");

    var finalMessage = document.getElementById("final-message");
    var sendButton = document.getElementById("send-email");

    if (finalMessage && initialFinalMessageHtml !== null) {
      finalMessage.innerHTML = initialFinalMessageHtml;
      finalMessage.classList.remove("success");
    }

    if (sendButton) {
      sendButton.setAttribute("href", "#");
    }
  }

  function initShareCta() {
    var sendButton = document.getElementById("send-email");
    var copyButton = document.getElementById("copy-text");
    var stepTwoTab = document.getElementById("step-2-tab");
    var finalMessage = document.getElementById("final-message");

    if (finalMessage) {
      initialFinalMessageHtml = finalMessage.innerHTML;
    }

    if (sendButton) {
      sendButton.addEventListener("click", scheduleShareCta);
    }

    if (copyButton) {
      copyButton.addEventListener("click", scheduleShareCta);
    }

    if (stepTwoTab) {
      stepTwoTab.addEventListener("shown.bs.tab", resetShareCta);
    }

    if (typeof window.backtosecondpage === "function") {
      var originalBackToSecondPage = window.backtosecondpage;

      window.backtosecondpage = function () {
        resetShareCta();
        return originalBackToSecondPage.apply(this, arguments);
      };
    }
  }

  // Move through the split birthday fields after valid day/month input.
  function initBirthdayAutoAdvance() {
    var fields = [
      {
        current: document.getElementById("form-day"),
        next: document.getElementById("form-month"),
      },
      {
        current: document.getElementById("form-month"),
        next: document.getElementById("form-year"),
      },
    ];

    fields.forEach(function (field) {
      if (!field.current || !field.next) {
        return;
      }

      field.current.addEventListener("input", function (event) {
        var isDeleting = event.inputType && event.inputType.indexOf("delete") === 0;

        if (isDeleting) {
          return;
        }

        if (
          field.current.value.length >= field.current.maxLength &&
          field.current.validity.valid
        ) {
          field.next.focus();
        }
      });
    });
  }

  function init() {
    if (!isSachsenPage()) {
      return;
    }

    initShareCta();
    initBirthdayAutoAdvance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
