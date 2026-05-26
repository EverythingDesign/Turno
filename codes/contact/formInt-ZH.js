(function () {
    const ZOHO_ENDPOINT = "https://crm.zoho.in/crm/WebToLeadForm";

    // Webflow form IDs that submit to Zoho
    const ZOHO_FORM_IDS = ["Battery-Solution-Contact-Form"];

    // Hidden tokens from the Zoho Web-to-Lead source. Required — do not edit.
    const ZOHO_TOKENS = {
        xnQsjsdp: "1b8944a078f159783bd4f9facd4375810fd17ecb471a74ea7eb535e8cf314b79",
        xmIwtLD: "dd196437995e7df5b085fc10fdf49e64c6772f8482363c3350e39990c8d2c7712897989de24ae75b6b66b074bd756b7d",
        actionType: "TGVhZHM=",
        returnURL: "https://turnovolt.in/form-submit",
        aG9uZXlwb3Q: "",
        zc_gad: ""
    };

    // Webflow "solar installation" values → Zoho LEADCF37 picklist values
    const SOLAR_MAP = {
        "Installed": "installed",
        "Not Installed": "not installed",
        "Planned": "planned",
        "None": ""
    };

    function get(form, name) {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? (el.value || "").trim() : "";
    }

    function buildPayload(form) {
        const params = new URLSearchParams(location.search);
        const first = get(form, "First Name");
        const last = get(form, "Last Name");
        const fullName = [first, last].filter(Boolean).join(" ") || last || first;

        return {
            // Required Zoho fields
            "Full Name": fullName,
            "Mobile": get(form, "full_phone"),
            "Email": get(form, "Email Address"),
            "Company": get(form, "Company") || "NA",
            "LEADCF18": get(form, "Location (City / Town)"),

            // Optional Battery-form fields
            "LEADCF7": get(form, "establishment type"),
            "LEADCF37": SOLAR_MAP[get(form, "solar installation")] || "",
            "LEADCF102": get(form, "dg installation") === "Yes" ? "Yes" : "No",
            "Message": get(form, "Message"),

            // Lead source + tracking
            "Lead Source": "Website",
            "LEADCF3": params.get("utm_source") || "-",
            "LEADCF4": params.get("utm_medium") || "-",
            "LEADCF6": params.get("utm_campaign") || "-",
            "LEADCF2": params.get("utm_term") || "-",
            "LEADCF1": params.get("utm_content") || "-",
            "LEADCF26": params.get("gclid") || "-",
            "LEADCF19": params.get("fbclid") || "-",
            "LEADCF25": document.referrer || "-",
            "LEADCF21": location.href
        };
    }

    function ensureIframe() {
        let iframe = document.getElementById("zoho-target-iframe");
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.id = "zoho-target-iframe";
            iframe.name = "zoho-target-iframe";
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        }
        return iframe;
    }

    function submitToZoho(payload) {
        ensureIframe();

        const hidden = document.createElement("form");
        hidden.method = "POST";
        hidden.action = ZOHO_ENDPOINT;
        hidden.target = "zoho-target-iframe";
        hidden.acceptCharset = "UTF-8";
        hidden.style.display = "none";

        const all = Object.assign({}, ZOHO_TOKENS, payload);
        Object.keys(all).forEach(name => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = all[name] == null ? "" : String(all[name]);
            hidden.appendChild(input);
        });

        document.body.appendChild(hidden);
        hidden.submit();
        setTimeout(() => hidden.remove(), 2000);
    }

    function attach(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const payload = buildPayload(form);
            if (!payload["Mobile"]) {
                alert("Please enter a valid phone number.");
                return;
            }

            const wrap = form.closest(".w-form") || form.parentElement;
            const success = wrap && wrap.querySelector(".w-form-done");
            const submit = form.querySelector('input[type="submit"], button[type="submit"]');
            const originalLabel = submit ? (submit.value || submit.textContent) : "";
            if (submit) {
                submit.disabled = true;
                if ("value" in submit) submit.value = "Sending..."; else submit.textContent = "Sending...";
            }

            try {
                submitToZoho(payload);
                console.log("[Zoho] Lead submitted", { formId: form.id, payload });

                setTimeout(() => {
                    form.style.display = "none";
                    if (success) success.style.display = "block";
                    form.reset();
                    if (submit) {
                        submit.disabled = false;
                        if ("value" in submit) submit.value = originalLabel; else submit.textContent = originalLabel;
                    }
                }, 1200);
            } catch (err) {
                console.error("[Zoho]", err);
                if (submit) {
                    submit.disabled = false;
                    if ("value" in submit) submit.value = originalLabel; else submit.textContent = originalLabel;
                }
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        ZOHO_FORM_IDS.forEach(attach);
    });
})();
