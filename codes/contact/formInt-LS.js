(function () {
    const LEADQURE_URL = "https://non-prod-backend.turnocloud.com/leads/website";
    // Switch to https://api.turnoclub.com/leads/website on production

    // Capture UTM params once on page load and stash for the submit
    const params = new URLSearchParams(location.search);
    const utm = {
        UTM_SOURCE: params.get("utm_source") || "",
        UTM_CAMPAIGN: params.get("utm_campaign") || "",
        UTM_MEDIUM: params.get("utm_medium") || "",
        UTM_CONTENT: params.get("utm_content") || "",
        UTM_TERM: params.get("utm_term") || "",
        UTM_ENTIRE_URL: location.href,
        REFERRER_WEBSITE: document.referrer || ""
    };

    // Map each form ID (Webflow ID, exact match) to LEAD_FORM_SOURCE + intent.
    // Confirm `source` strings with Turno; intent is a guess until they confirm.
    const FORM_CONFIG = {
        // "Investor-Partner-Press-Contact-Form": { source: "investor_partner_press", intent: "LOW_INTENT" },
        "Finance-Solution-Contact-Form": { source: "finance_an_ev", intent: "HIGH_INTENT" },
        // "Leasing-Solution-Contact-Form":       { source: "leasing_solution", intent: "HIGH_INTENT" },
        // "Battery-Solution-Contact-Form":       { source: "battery_solution", intent: "HIGH_INTENT" }
    };

    function getVal(form, name) {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? (el.value || "").trim() : "";
    }

    function buildPayload(form, cfg) {
        // Webflow input names per the live form HTML
        const first = getVal(form, "First Name");
        const last = getVal(form, "Last Name");
        const fullName = [first, last].filter(Boolean).join(" ");

        // intl-tel-input writes the full +91XXXXXXXXXX value into the hidden "full_phone"
        const phone = getVal(form, "full_phone").replace(/\s+/g, "");

        // Required body fields
        const body = {
            phone: phone,
            createdBy: "turno-ev"
        };

        // Optional top-level fields — only set when present
        if (fullName) body.name = fullName;
        body.leadState = "New Lead";
        body.leadStatus = "Yet to Connect";
        body.language = (document.documentElement.lang || "en").toLowerCase().startsWith("hi") ? "hi" :
            "en";
        body.autoAssign = true;

        const location_ = getVal(form, "location");
        if (location_) body.geoState = location_;

        // Build metaDataList — only push entries that actually have values
        const meta = [];
        const push = (key, value) => { if (value) meta.push({ key, value: String(value) }); };

        push("SOURCE_NAME", "turno-ev");
        push("LEAD_FORM_SOURCE", cfg.source);
        push("LEAD_INTENT", cfg.intent);
        push("WEBSITE_LANGUAGE", body.language);

        push("UTM_SOURCE", utm.UTM_SOURCE);
        push("UTM_CAMPAIGN", utm.UTM_CAMPAIGN);
        push("UTM_MEDIUM", utm.UTM_MEDIUM);
        push("UTM_CONTENT", utm.UTM_CONTENT);
        push("UTM_TERM", utm.UTM_TERM);
        push("UTM_ENTIRE_URL", utm.UTM_ENTIRE_URL);
        push("REFERRER_WEBSITE", utm.REFERRER_WEBSITE);

        // Per-form extras stuffed into metaDataList (API schema is flat).
        // Field names below match each form's actual Webflow input names;
        // any field not present on a given form just returns "" and is skipped.
        push("VEHICLE_SHORTLISTED", getVal(form, "vehicle type"));
        push("FAQ_MESSAGE", getVal(form, "Message"));
        push("APP_INFO", JSON.stringify({
            email: getVal(form, "Email"),
            organisation: getVal(form, "Organisation"),
            role: getVal(form, "Role"),
            establishmentType: getVal(form, "Establishment Type"),
            solarInstalled: getVal(form, "Solar Installed"),
            dgInstalled: getVal(form, "DG Installed")
        }));

        body.metaDataList = meta;
        return body;
    }

    function attach(formId, cfg) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const wrap = form.closest(".w-form") || form.parentElement;
            const success = wrap && wrap.querySelector(".w-form-done");
            const error = wrap && wrap.querySelector(".w-form-fail");
            const submit = form.querySelector('input[type="submit"], button[type="submit"]');
            const originalLabel = submit ? submit.value || submit.textContent : "";
            if (submit) {
                submit.disabled = true; if ("value" in submit) submit.value = "Sending..."; else
                    submit.textContent = "Sending...";
            }

            try {
                const payload = buildPayload(form, cfg);
                if (!payload.phone) throw new Error("Phone is required");

                const res = await fetch(LEADQURE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("API " + res.status);

                console.log("[Leadqure] Lead submitted successfully", { formId: form.id, phone: payload.phone });

                form.style.display = "none";
                if (success) success.style.display = "block";
                form.reset();
            } catch (err) {
                console.error("[Leadqure]", err);
                if (error) error.style.display = "block";
            } finally {
                if (submit) {
                    submit.disabled = false; if ("value" in submit) submit.value = originalLabel;
                    else submit.textContent = originalLabel;
                }
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Object.keys(FORM_CONFIG).forEach(id => attach(id, FORM_CONFIG[id]));
    });
})();