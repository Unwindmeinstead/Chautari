// Chautari i18n — lightweight translation dictionary
// Languages: en (English), ne (Nepali), hi (Hindi)
// Used across all patient-facing UI. Agency/admin UI stays English-only.

export type Lang = "en" | "ne" | "hi";

export const translations = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  nav_dashboard:      { en: "Dashboard",      ne: "ड्यासबोर्ड",      hi: "डैशबोर्ड" },
  nav_switch:         { en: "Switch Agency",  ne: "एजेन्सी बदल्नुस्", hi: "एजेंसी बदलें" },
  nav_profile:        { en: "Profile",        ne: "प्रोफाइल",         hi: "प्रोफ़ाइल" },
  nav_notifications:  { en: "Notifications",  ne: "सूचनाहरू",          hi: "सूचनाएं" },
  nav_sign_out:       { en: "Sign out",       ne: "साइन आउट",         hi: "साइन आउट" },

  // ── Common actions ──────────────────────────────────────────────────────────
  btn_continue:  { en: "Continue",    ne: "जारी राख्नुस्", hi: "जारी रखें" },
  btn_submit:    { en: "Submit",      ne: "पेश गर्नुस्",  hi: "जमा करें" },
  btn_save:      { en: "Save",        ne: "सुरक्षित गर्नुस्", hi: "सहेजें" },
  btn_cancel:    { en: "Cancel",      ne: "रद्द गर्नुस्",  hi: "रद्द करें" },
  btn_back:      { en: "Back",        ne: "पछाडि",         hi: "वापस" },
  btn_close:     { en: "Close",       ne: "बन्द गर्नुस्",  hi: "बंद करें" },
  btn_search:    { en: "Search",      ne: "खोज्नुस्",      hi: "खोजें" },
  btn_upload:    { en: "Upload",      ne: "अपलोड गर्नुस्", hi: "अपलोड करें" },
  btn_sign:      { en: "Sign",        ne: "हस्ताक्षर गर्नुस्", hi: "हस्ताक्षर करें" },
  btn_open_chat: { en: "Open chat",   ne: "च्याट खोल्नुस्", hi: "चैट खोलें" },
  btn_view:      { en: "View",        ne: "हेर्नुस्",       hi: "देखें" },

  // ── Status labels ───────────────────────────────────────────────────────────
  status_submitted:    { en: "Submitted",    ne: "पेश गरिएको",      hi: "जमा किया गया" },
  status_under_review: { en: "Under Review", ne: "समीक्षामा",        hi: "समीक्षाधीन" },
  status_accepted:     { en: "Accepted",     ne: "स्वीकृत",          hi: "स्वीकृत" },
  status_completed:    { en: "Completed",    ne: "पूरा भयो",         hi: "पूर्ण" },
  status_denied:       { en: "Denied",       ne: "अस्वीकृत",         hi: "अस्वीकृत" },
  status_cancelled:    { en: "Cancelled",    ne: "रद्द गरिएको",      hi: "रद्द किया गया" },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dash_greeting_morning:  { en: "Good morning",  ne: "शुभ प्रभात",    hi: "सुप्रभात" },
  dash_greeting_afternoon:{ en: "Good afternoon",ne: "शुभ अपराह्न",   hi: "शुभ दोपहर" },
  dash_greeting_evening:  { en: "Good evening",  ne: "शुभ साँझ",      hi: "शुभ संध्या" },
  dash_subtitle:          {
    en: "Here's everything happening with your home care switch.",
    ne: "यहाँ तपाईंको होम केयर स्विचको बारेमा सबै जानकारी छ।",
    hi: "यहाँ आपके होम केयर स्विच के बारे में सब कुछ है।",
  },
  dash_no_requests:       {
    en: "No switch requests yet",
    ne: "अहिलेसम्म कुनै स्विच अनुरोध छैन",
    hi: "अभी तक कोई स्विच अनुरोध नहीं",
  },
  dash_start_switch:      {
    en: "Start a switch",
    ne: "स्विच सुरु गर्नुस्",
    hi: "स्विच शुरू करें",
  },
  dash_your_requests:     { en: "Your Requests",  ne: "तपाईंका अनुरोधहरू", hi: "आपके अनुरोध" },
  dash_notifications:     { en: "Notifications",  ne: "सूचनाहरू",           hi: "सूचनाएं" },

  // ── Agency search ───────────────────────────────────────────────────────────
  search_title:          { en: "Find an agency",        ne: "एजेन्सी खोज्नुस्",    hi: "एजेंसी खोजें" },
  search_placeholder:    { en: "Search by name or NPI", ne: "नाम वा NPI द्वारा खोज्नुस्", hi: "नाम या NPI से खोजें" },
  search_results:        { en: "results",               ne: "परिणामहरू",             hi: "परिणाम" },
  search_no_results:     { en: "No agencies found",     ne: "कुनै एजेन्सी फेला परेन", hi: "कोई एजेंसी नहीं मिली" },
  search_verified:       { en: "Verified Partner",      ne: "प्रमाणित साझेदार",      hi: "सत्यापित भागीदार" },
  search_select_agency:  { en: "Select this agency",   ne: "यो एजेन्सी छान्नुस्",   hi: "यह एजेंसी चुनें" },

  // ── Payers ──────────────────────────────────────────────────────────────────
  payer_medicare:         { en: "Medicare",          ne: "मेडिकेयर",      hi: "मेडिकेयर" },
  payer_medicaid:         { en: "Medicaid",          ne: "मेडिकेड",       hi: "मेडिकेड" },
  payer_private:          { en: "Private Pay",       ne: "निजी भुक्तानी", hi: "निजी भुगतान" },
  payer_managed_care:     { en: "Managed Care",      ne: "मैनेज्ड केयर",  hi: "मैनेज्ड केयर" },

  // ── Care types ──────────────────────────────────────────────────────────────
  care_home_health:       { en: "Home Health",       ne: "होम स्वास्थ्य", hi: "होम हेल्थ" },
  care_home_care:         { en: "Home Care",         ne: "होम केयर",      hi: "होम केयर" },
  care_hospice:           { en: "Hospice",           ne: "होस्पिस",       hi: "हॉस्पिस" },
  care_adult_day:         { en: "Adult Day Services",ne: "वयस्क दिन सेवाहरू", hi: "वयस्क दिन सेवाएं" },

  // ── Switch request wizard ───────────────────────────────────────────────────
  wizard_step_agency:     { en: "Choose Agency",     ne: "एजेन्सी छान्नुस्",  hi: "एजेंसी चुनें" },
  wizard_step_care:       { en: "Care Details",      ne: "हेरचाह विवरण",     hi: "देखभाल विवरण" },
  wizard_step_reason:     { en: "Reason for Switch", ne: "स्विचको कारण",     hi: "स्विच का कारण" },
  wizard_step_review:     { en: "Review & Sign",     ne: "समीक्षा र हस्ताक्षर", hi: "समीक्षा और हस्ताक्षर" },
  wizard_submitted_title: { en: "Request Submitted!", ne: "अनुरोध पेश गरियो!", hi: "अनुरोध जमा हुआ!" },
  wizard_submitted_desc:  {
    en: "Your agency switch request has been submitted. The agency will review and respond within 2 business days.",
    ne: "तपाईंको एजेन्सी स्विच अनुरोध पेश गरिएको छ। एजेन्सीले २ कार्य दिनभित्र समीक्षा र जवाफ दिनेछ।",
    hi: "आपका एजेंसी स्विच अनुरोध जमा कर दिया गया है। एजेंसी 2 कार्य दिनों के भीतर समीक्षा करेगी और जवाब देगी।",
  },

  // ── Documents ───────────────────────────────────────────────────────────────
  docs_title:             { en: "Documents",           ne: "कागजातहरू",        hi: "दस्तावेज़" },
  docs_upload:            { en: "Upload document",      ne: "कागजात अपलोड गर्नुस्", hi: "दस्तावेज़ अपलोड करें" },
  docs_needs_signature:   { en: "Needs signature",     ne: "हस्ताक्षर चाहिन्छ", hi: "हस्ताक्षर की आवश्यकता है" },
  docs_signed:            { en: "Signed",               ne: "हस्ताक्षरित",      hi: "हस्ताक्षरित" },
  docs_download:          { en: "View / Download",      ne: "हेर्नुस् / डाउनलोड", hi: "देखें / डाउनलोड" },
  docs_sign_document:     { en: "Sign document",        ne: "कागजातमा हस्ताक्षर गर्नुस्", hi: "दस्तावेज़ पर हस्ताक्षर करें" },

  // ── Messaging ───────────────────────────────────────────────────────────────
  msg_title:              { en: "Secure Messages",       ne: "सुरक्षित सन्देशहरू", hi: "सुरक्षित संदेश" },
  msg_placeholder:        { en: "Type a message…",       ne: "सन्देश टाइप गर्नुस्…", hi: "संदेश टाइप करें…" },
  msg_send:               { en: "Send",                  ne: "पठाउनुस्",           hi: "भेजें" },
  msg_empty:              {
    en: "No messages yet. Say hello!",
    ne: "अहिलेसम्म कुनै सन्देश छैन। नमस्ते भन्नुस्!",
    hi: "अभी तक कोई संदेश नहीं। नमस्ते कहें!",
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile_title:          { en: "Your Profile",         ne: "तपाईंको प्रोफाइल",  hi: "आपकी प्रोफ़ाइल" },
  profile_full_name:      { en: "Full Name",             ne: "पूरा नाम",           hi: "पूरा नाम" },
  profile_phone:          { en: "Phone",                 ne: "फोन",                hi: "फ़ोन" },
  profile_language:       { en: "Preferred Language",   ne: "मनपर्ने भाषा",       hi: "पसंदीदा भाषा" },
  profile_save:           { en: "Save Changes",         ne: "परिवर्तनहरू सुरक्षित गर्नुस्", hi: "परिवर्तन सहेजें" },

  // ── Notifications ───────────────────────────────────────────────────────────
  notif_no_notifs:        { en: "No notifications yet", ne: "अहिलेसम्म कुनै सूचना छैन", hi: "अभी तक कोई सूचना नहीं" },
  notif_mark_read:        { en: "Mark all read",        ne: "सबै पढिएको मान्नुस्",       hi: "सभी को पढ़ा हुआ मानें" },

  // ── Errors & toasts ─────────────────────────────────────────────────────────
  err_generic:            { en: "Something went wrong. Please try again.", ne: "केही गलत भयो। कृपया फेरि प्रयास गर्नुस्।", hi: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।" },
  err_required:           { en: "This field is required.", ne: "यो फिल्ड आवश्यक छ।", hi: "यह फ़ील्ड आवश्यक है।" },
  err_not_found:          { en: "Not found.",              ne: "फेला परेन।",          hi: "नहीं मिला।" },
  err_unauthorized:       { en: "You don't have access to this page.", ne: "तपाईंलाई यो पृष्ठमा पहुँच छैन।", hi: "आपको इस पेज तक पहुँच नहीं है।" },
  success_saved:          { en: "Changes saved.",          ne: "परिवर्तनहरू सुरक्षित भए।", hi: "परिवर्तन सहेज लिए गए।" },
  success_submitted:      { en: "Request submitted.",      ne: "अनुरोध पेश गरियो।",        hi: "अनुरोध जमा किया गया।" },

  // ── Language names ──────────────────────────────────────────────────────────
  lang_en: { en: "English",  ne: "अंग्रेजी",  hi: "अंग्रेजी" },
  lang_ne: { en: "Nepali",   ne: "नेपाली",    hi: "नेपाली" },
  lang_hi: { en: "Hindi",    ne: "हिन्दी",    hi: "हिन्दी" },
} satisfies Record<string, Record<Lang, string>>;

export type TranslationKey = keyof typeof translations;

// Core translation function — used in server components with a known lang
export function t(key: TranslationKey, lang: Lang = "en"): string {
  return translations[key][lang] ?? translations[key]["en"] ?? key;
}

// Status key helper
export function statusKey(status: string): TranslationKey | null {
  const map: Record<string, TranslationKey> = {
    submitted:    "status_submitted",
    under_review: "status_under_review",
    accepted:     "status_accepted",
    completed:    "status_completed",
    denied:       "status_denied",
    cancelled:    "status_cancelled",
  };
  return map[status] ?? null;
}

// Greeting based on hour
export function greetingKey(hour: number): TranslationKey {
  if (hour < 12) return "dash_greeting_morning";
  if (hour < 17) return "dash_greeting_afternoon";
  return "dash_greeting_evening";
}

// Get user's language from cookie (for client-side use)
export function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/chautari_lang=([^;]+)/);
  const lang = match?.[1];
  return (["en", "ne", "hi"].includes(lang ?? "") ? lang : "en") as Lang;
}

// Set language cookie (30-day expiry)
export function setLangCookie(lang: Lang) {
  document.cookie = `chautari_lang=${lang};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
}
