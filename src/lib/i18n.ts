// Chautari i18n — lightweight translation dictionary
// Languages: en (English), ne (Nepali), hi (Hindi)
// Used across all patient-facing UI. Agency/admin UI stays English-only.

export type Lang = "en" | "ne" | "hi";

export const translations = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  nav_dashboard: { en: "Dashboard", ne: "ड्यासबोर्ड", hi: "डैशबोर्ड" },
  nav_switch: { en: "Switch Agency", ne: "एजेन्सी बदल्नुस्", hi: "एजेंसी बदलें" },
  nav_profile: { en: "Profile", ne: "प्रोफाइल", hi: "प्रोफ़ाइल" },
  nav_notifications: { en: "Notifications", ne: "सूचनाहरू", hi: "सूचनाएं" },
  nav_sign_out: { en: "Sign out", ne: "साइन आउट", hi: "साइन आउट" },

  // ── Common actions ──────────────────────────────────────────────────────────
  btn_continue: { en: "Continue", ne: "जारी राख्नुस्", hi: "जारी रखें" },
  btn_submit: { en: "Submit", ne: "पेश गर्नुस्", hi: "जमा करें" },
  btn_save: { en: "Save", ne: "सुरक्षित गर्नुस्", hi: "सहेजें" },
  btn_cancel: { en: "Cancel", ne: "रद्द गर्नुस्", hi: "रद्द करें" },
  btn_back: { en: "Back", ne: "पछाडि", hi: "वापस" },
  btn_close: { en: "Close", ne: "बन्द गर्नुस्", hi: "बंद करें" },
  btn_search: { en: "Search", ne: "खोज्नुस्", hi: "खोजें" },
  btn_upload: { en: "Upload", ne: "अपलोड गर्नुस्", hi: "अपलोड करें" },
  btn_sign: { en: "Sign", ne: "हस्ताक्षर गर्नुस्", hi: "हस्ताक्षर करें" },
  btn_open_chat: { en: "Open chat", ne: "च्याट खोल्नुस्", hi: "चैट खोलें" },
  btn_view: { en: "View", ne: "हेर्नुस्", hi: "देखें" },

  // ── Status labels ───────────────────────────────────────────────────────────
  status_submitted: { en: "Submitted", ne: "पेश गरिएको", hi: "जमा किया गया" },
  status_under_review: { en: "Under Review", ne: "समीक्षामा", hi: "समीक्षाधीन" },
  status_accepted: { en: "Accepted", ne: "स्वीकृत", hi: "स्वीकृत" },
  status_completed: { en: "Completed", ne: "पूरा भयो", hi: "पूर्ण" },
  status_denied: { en: "Denied", ne: "अस्वीकृत", hi: "अस्वीकृत" },
  status_cancelled: { en: "Cancelled", ne: "रद्द गरिएको", hi: "रद्द किया गया" },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dash_greeting_morning: { en: "Good morning", ne: "शुभ प्रभात", hi: "सुप्रभात" },
  dash_greeting_afternoon: { en: "Good afternoon", ne: "शुभ अपराह्न", hi: "शुभ दोपहर" },
  dash_greeting_evening: { en: "Good evening", ne: "शुभ साँझ", hi: "शुभ संध्या" },
  dash_subtitle: {
    en: "Here's everything happening with your home care switch.",
    ne: "यहाँ तपाईंको होम केयर स्विचको बारेमा सबै जानकारी छ।",
    hi: "यहाँ आपके होम केयर स्विच के बारे में सब कुछ है।",
  },
  dash_no_requests: {
    en: "No switch requests yet",
    ne: "अहिलेसम्म कुनै स्विच अनुरोध छैन",
    hi: "अभी तक कोई स्विच अनुरोध नहीं",
  },
  dash_start_switch: {
    en: "Start a switch",
    ne: "स्विच सुरु गर्नुस्",
    hi: "स्विच शुरू करें",
  },
  dash_your_requests: { en: "Your Requests", ne: "तपाईंका अनुरोधहरू", hi: "आपके अनुरोध" },
  dash_notifications: { en: "Notifications", ne: "सूचनाहरू", hi: "सूचनाएं" },

  // ── Agency search ───────────────────────────────────────────────────────────
  search_title: { en: "Find an agency", ne: "एजेन्सी खोज्नुस्", hi: "एजेंसी खोजें" },
  search_placeholder: { en: "Search by name or NPI", ne: "नाम वा NPI द्वारा खोज्नुस्", hi: "नाम या NPI से खोजें" },
  search_results: { en: "results", ne: "परिणामहरू", hi: "परिणाम" },
  search_no_results: { en: "No agencies found", ne: "कुनै एजेन्सी फेला परेन", hi: "कोई एजेंसी नहीं मिली" },
  search_verified: { en: "Verified Partner", ne: "प्रमाणित साझेदार", hi: "सत्यापित भागीदार" },
  search_select_agency: { en: "Select this agency", ne: "यो एजेन्सी छान्नुस्", hi: "यह एजेंसी चुनें" },

  // ── Payers ──────────────────────────────────────────────────────────────────
  payer_medicare: { en: "Medicare", ne: "मेडिकेयर", hi: "मेडिकेयर" },
  payer_medicaid: { en: "Medicaid", ne: "मेडिकेड", hi: "मेडिकेड" },
  payer_private: { en: "Private Pay", ne: "निजी भुक्तानी", hi: "निजी भुगतान" },
  payer_managed_care: { en: "Managed Care", ne: "मैनेज्ड केयर", hi: "मैनेज्ड केयर" },

  // ── Care types ──────────────────────────────────────────────────────────────
  care_home_health: { en: "Home Health", ne: "होम स्वास्थ्य", hi: "होम हेल्थ" },
  care_home_care: { en: "Home Care", ne: "होम केयर", hi: "होम केयर" },
  care_hospice: { en: "Hospice", ne: "होस्पिस", hi: "हॉस्पिस" },
  care_adult_day: { en: "Adult Day Services", ne: "वयस्क दिन सेवाहरू", hi: "वयस्क दिन सेवाएं" },

  // ── Switch request wizard ───────────────────────────────────────────────────
  wizard_step_agency: { en: "Choose Agency", ne: "एजेन्सी छान्नुस्", hi: "एजेंसी चुनें" },
  wizard_step_care: { en: "Care Details", ne: "हेरचाह विवरण", hi: "देखभाल विवरण" },
  wizard_step_reason: { en: "Reason for Switch", ne: "स्विचको कारण", hi: "स्विच का कारण" },
  wizard_step_review: { en: "Review & Sign", ne: "समीक्षा र हस्ताक्षर", hi: "समीक्षा और हस्ताक्षर" },
  wizard_submitted_title: { en: "Request Submitted!", ne: "अनुरोध पेश गरियो!", hi: "अनुरोध जमा हुआ!" },
  wizard_submitted_desc: {
    en: "Your agency switch request has been submitted. The agency will review and respond within 2 business days.",
    ne: "तपाईंको एजेन्सी स्विच अनुरोध पेश गरिएको छ। एजेन्सीले २ कार्य दिनभित्र समीक्षा र जवाफ दिनेछ।",
    hi: "आपका एजेंसी स्विच अनुरोध जमा कर दिया गया है। एजेंसी 2 कार्य दिनों के भीतर समीक्षा करेगी और जवाब देगी।",
  },

  // ── Documents ───────────────────────────────────────────────────────────────
  docs_title: { en: "Documents", ne: "कागजातहरू", hi: "दस्तावेज़" },
  docs_upload: { en: "Upload document", ne: "कागजात अपलोड गर्नुस्", hi: "दस्तावेज़ अपलोड करें" },
  docs_needs_signature: { en: "Needs signature", ne: "हस्ताक्षर चाहिन्छ", hi: "हस्ताक्षर की आवश्यकता है" },
  docs_signed: { en: "Signed", ne: "हस्ताक्षरित", hi: "हस्ताक्षरित" },
  docs_download: { en: "View / Download", ne: "हेर्नुस् / डाउनलोड", hi: "देखें / डाउनलोड" },
  docs_sign_document: { en: "Sign document", ne: "कागजातमा हस्ताक्षर गर्नुस्", hi: "दस्तावेज़ पर हस्ताक्षर करें" },

  // ── Messaging ───────────────────────────────────────────────────────────────
  msg_title: { en: "Secure Messages", ne: "सुरक्षित सन्देशहरू", hi: "सुरक्षित संदेश" },
  msg_placeholder: { en: "Type a message…", ne: "सन्देश टाइप गर्नुस्…", hi: "संदेश टाइप करें…" },
  msg_send: { en: "Send", ne: "पठाउनुस्", hi: "भेजें" },
  msg_empty: {
    en: "No messages yet. Say hello!",
    ne: "अहिलेसम्म कुनै सन्देश छैन। नमस्ते भन्नुस्!",
    hi: "अभी तक कोई संदेश नहीं। नमस्ते कहें!",
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile_title: { en: "Your Profile", ne: "तपाईंको प्रोफाइल", hi: "आपकी प्रोफ़ाइल" },
  profile_full_name: { en: "Full Name", ne: "पूरा नाम", hi: "पूरा नाम" },
  profile_phone: { en: "Phone", ne: "फोन", hi: "फ़ोन" },
  profile_language: { en: "Preferred Language", ne: "मनपर्ने भाषा", hi: "पसंदीदा भाषा" },
  profile_save: { en: "Save Changes", ne: "परिवर्तनहरू सुरक्षित गर्नुस्", hi: "परिवर्तन सहेजें" },

  // ── Notifications ───────────────────────────────────────────────────────────
  notif_no_notifs: { en: "No notifications yet", ne: "अहिलेसम्म कुनै सूचना छैन", hi: "अभी तक कोई सूचना नहीं" },
  notif_mark_read: { en: "Mark all read", ne: "सबै पढिएको मान्नुस्", hi: "सभी को पढ़ा हुआ मानें" },

  // ── Errors & toasts ─────────────────────────────────────────────────────────
  err_generic: { en: "Something went wrong. Please try again.", ne: "केही गलत भयो। कृपया फेरि प्रयास गर्नुस्।", hi: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।" },
  err_required: { en: "This field is required.", ne: "यो फिल्ड आवश्यक छ।", hi: "यह फ़ील्ड आवश्यक है।" },
  err_not_found: { en: "Not found.", ne: "फेला परेन।", hi: "नहीं मिला।" },
  err_unauthorized: { en: "You don't have access to this page.", ne: "तपाईंलाई यो पृष्ठमा पहुँच छैन।", hi: "आपको इस पेज तक पहुँच नहीं है।" },
  success_saved: { en: "Changes saved.", ne: "परिवर्तनहरू सुरक्षित भए।", hi: "परिवर्तन सहेज लिए गए।" },
  success_submitted: { en: "Request submitted.", ne: "अनुरोध पेश गरियो।", hi: "अनुरोध जमा किया गया।" },

  // ── Language names ──────────────────────────────────────────────────────────
  lang_en: { en: "English", ne: "अंग्रेजी", hi: "अंग्रेजी" },
  lang_ne: { en: "Nepali", ne: "नेपाली", hi: "नेपाली" },
  lang_hi: { en: "Hindi", ne: "हिन्दी", hi: "हिन्दी" },

  // ── Landing page ──────────────────────────────────────────────────────────
  // Hero
  landing_badge: { en: "Serving Pennsylvania residents", ne: "पेन्सिल्भेनिया बासिन्दाहरूको सेवामा", hi: "पेनसिल्वेनिया निवासियों की सेवा में" },
  landing_hero_title_1: { en: "Find your perfect", ne: "आफ्नो उत्तम", hi: "अपनी सही" },
  landing_hero_title_2: { en: "home care", ne: "होम केयर", hi: "होम केयर" },
  landing_hero_title_3: { en: "agency", ne: "एजेन्सी खोज्नुस्", hi: "एजेंसी खोजें" },
  landing_hero_desc: {
    en: "Chautari guides Pennsylvania Medicaid and Medicare patients through finding and switching home health or home care agencies — simply, guided, and completely free.",
    ne: "चौतारीले पेन्सिल्भेनियाका मेडिकेड र मेडिकेयर बिरामीहरूलाई होम हेल्थ वा होम केयर एजेन्सी खोज्न र स्विच गर्न मार्गदर्शन गर्दछ — सरल, मार्गदर्शित, र पूर्ण रूपमा निःशुल्क।",
    hi: "चौतारी पेनसिल्वेनिया के मेडिकेड और मेडिकेयर रोगियों को होम हेल्थ या होम केयर एजेंसी खोजने और बदलने में मार्गदर्शन करती है — सरल, निर्देशित, और पूरी तरह मुफ्त।",
  },
  landing_search_placeholder: { en: "Enter your county or ZIP code…", ne: "आफ्नो काउन्टी वा ZIP कोड लेख्नुस्…", hi: "अपना काउंटी या ZIP कोड दर्ज करें…" },
  landing_cta_start: { en: "Start for free", ne: "निःशुल्क सुरु गर्नुस्", hi: "मुफ्त शुरू करें" },
  landing_cta_how: { en: "See how it works", ne: "कसरी काम गर्छ हेर्नुस्", hi: "देखें कैसे काम करता है" },
  landing_hipaa: { en: "HIPAA compliant", ne: "HIPAA अनुरूप", hi: "HIPAA अनुपालन" },
  landing_free: { en: "Free for patients", ne: "बिरामीहरूको लागि निःशुल्क", hi: "मरीज़ों के लिए मुफ़्त" },
  landing_verified: { en: "PA-verified agencies", ne: "PA-प्रमाणित एजेन्सीहरू", hi: "PA-सत्यापित एजेंसियाँ" },
  landing_available_in: { en: "Available in:", ne: "उपलब्ध भाषाहरू:", hi: "उपलब्ध भाषाएं:" },

  // Who is this for
  landing_who_badge: { en: "Who is this for?", ne: "यो कसको लागि हो?", hi: "यह किसके लिए है?" },
  landing_who_title: { en: "Switching is your right", ne: "स्विच गर्नु तपाईंको अधिकार हो", hi: "बदलना आपका अधिकार है" },
  landing_who_desc: {
    en: "Whether you're a patient, a family member, or a caregiver — Chautari makes switching home care agencies simple and stress-free.",
    ne: "तपाईं बिरामी होस्, परिवारको सदस्य होस्, वा हेरचाहकर्ता होस् — चौतारीले होम केयर एजेन्सी स्विच गर्न सरल र तनावमुक्त बनाउँछ।",
    hi: "चाहे आप मरीज़ हों, परिवार के सदस्य हों, या देखभालकर्ता — चौतारी होम केयर एजेंसी बदलना आसान और तनाव-मुक्त बनाती है।",
  },
  landing_persona_patient_title: { en: "Current patients", ne: "हालका बिरामीहरू", hi: "वर्तमान मरीज़" },
  landing_persona_patient_desc: {
    en: "Not happy with your current home care? You have the right to switch to a better agency any time.",
    ne: "हालको होम केयरबाट खुसी हुनुहुन्न? तपाईंलाई जुनसुकै बेला राम्रो एजेन्सीमा जान पाउने अधिकार छ।",
    hi: "अपनी मौजूदा होम केयर से संतुष्ट नहीं? आपको किसी भी समय बेहतर एजेंसी में बदलने का अधिकार है।",
  },
  landing_persona_family_title: { en: "Family members", ne: "परिवारका सदस्यहरू", hi: "परिवार के सदस्य" },
  landing_persona_family_desc: {
    en: "Helping a parent or loved one get better care? We'll guide you through every step of the process.",
    ne: "आमाबुबा वा प्रियजनलाई राम्रो हेरचाह दिलाउन मद्दत गर्दै हुनुहुन्छ? हामी प्रत्येक चरणमा मार्गदर्शन गर्छौं।",
    hi: "माता-पिता या किसी प्रियजन को बेहतर देखभाल दिलाने में मदद? हम प्रक्रिया के हर चरण में आपका मार्गदर्शन करेंगे।",
  },
  landing_persona_caregiver_title: { en: "Caregivers", ne: "हेरचाहकर्ताहरू", hi: "देखभालकर्ता" },
  landing_persona_caregiver_desc: {
    en: "Looking for an agency that respects your time and pays fairly? Find one that values you.",
    ne: "तपाईंको समयलाई सम्मान गर्ने र उचित तलब दिने एजेन्सी खोज्दै हुनुहुन्छ? तपाईंलाई मूल्यवान ठान्ने एक खोज्नुस्।",
    hi: "ऐसी एजेंसी ढूंढ रहे हैं जो आपके समय का सम्मान करे और उचित भुगतान करे? वो खोजें जो आपकी कद्र करे।",
  },

  // How it works
  landing_how_badge: { en: "Simple process", ne: "सरल प्रक्रिया", hi: "सरल प्रक्रिया" },
  landing_how_title: { en: "Switching is easier than you think", ne: "स्विच गर्नु तपाईंले सोच्नु भन्दा सजिलो छ", hi: "बदलना जितना आप सोचते हैं उससे आसान है" },
  landing_how_desc: {
    en: "We handle the complexity so you can focus on your care. Most switches complete within 5–7 business days.",
    ne: "हामीले जटिलता सम्हाल्छौं जसले गर्दा तपाईं आफ्नो हेरचाहमा ध्यान दिन सक्नुहुन्छ। अधिकांश स्विचहरू ५–७ कार्य दिनभित्र पूरा हुन्छन्।",
    hi: "हम जटिलता संभालते हैं ताकि आप अपनी देखभाल पर ध्यान दे सकें। अधिकांश स्विच 5–7 कार्य दिनों में पूरे हो जाते हैं।",
  },
  landing_step1_title: { en: "Tell us your situation", ne: "आफ्नो स्थिति बताउनुस्", hi: "अपनी स्थिति बताएं" },
  landing_step1_desc: {
    en: "Answer a few quick questions about your care needs, insurance, and location. Takes under 5 minutes.",
    ne: "आफ्नो हेरचाह आवश्यकता, बीमा, र स्थानबारे केही छिटो प्रश्नहरूको जवाफ दिनुस्। ५ मिनेट भन्दा कम लाग्छ।",
    hi: "अपनी देखभाल की ज़रूरतों, बीमा और स्थान के बारे में कुछ त्वरित सवालों के जवाब दें। 5 मिनट से कम लगता है।",
  },
  landing_step2_title: { en: "We match you to agencies", ne: "हामी तपाईंलाई एजेन्सीहरूसँग मिलाउँछौं", hi: "हम आपको एजेंसियों से मिलाते हैं" },
  landing_step2_desc: {
    en: "Browse verified Pennsylvania agencies that accept your insurance and serve your area.",
    ne: "तपाईंको बीमा स्वीकार गर्ने र तपाईंको क्षेत्रमा सेवा प्रदान गर्ने प्रमाणित पेन्सिल्भेनिया एजेन्सीहरू ब्राउज गर्नुस्।",
    hi: "उन सत्यापित पेनसिल्वेनिया एजेंसियों को ब्राउज़ करें जो आपका बीमा स्वीकार करती हैं और आपके क्षेत्र में सेवा करती हैं।",
  },
  landing_step3_title: { en: "We manage the switch", ne: "हामी स्विच व्यवस्थापन गर्छौं", hi: "हम स्विच का प्रबंधन करते हैं" },
  landing_step3_desc: {
    en: "Chautari coordinates directly with agencies, handles paperwork, and keeps you updated every step.",
    ne: "चौतारीले सिधै एजेन्सीहरूसँग समन्वय गर्छ, कागजपत्र सम्हाल्छ, र तपाईंलाई प्रत्येक चरणमा अपडेट राख्छ।",
    hi: "चौतारी सीधे एजेंसियों के साथ समन्वय करती है, कागज़ी कार्रवाई संभालती है, और आपको हर कदम पर अपडेट रखती है।",
  },

  // Stats
  landing_stat_counties: { en: "PA counties served", ne: "PA काउन्टीहरूमा सेवा", hi: "PA काउंटियों में सेवा" },
  landing_stat_agencies: { en: "Verified agencies", ne: "प्रमाणित एजेन्सीहरू", hi: "सत्यापित एजेंसियाँ" },
  landing_stat_payers: { en: "Payers accepted", ne: "स्वीकृत भुक्तानीकर्ता", hi: "स्वीकृत भुगतानकर्ता" },
  landing_stat_time: { en: "Average switch time", ne: "औसत स्विच समय", hi: "औसत स्विच समय" },

  // Testimonials
  landing_testimonials_badge: { en: "Real stories", ne: "वास्तविक कथाहरू", hi: "वास्तविक कहानियाँ" },
  landing_testimonials_title: { en: "Families trust Chautari", ne: "परिवारहरूले चौतारीमाथि विश्वास गर्छन्", hi: "परिवार चौतारी पर भरोसा करते हैं" },

  // FAQ
  landing_faq_badge: { en: "Common questions", ne: "सामान्य प्रश्नहरू", hi: "सामान्य प्रश्न" },
  landing_faq_title: { en: "Frequently asked questions", ne: "बारम्बार सोधिने प्रश्नहरू", hi: "अक्सर पूछे जाने वाले प्रश्न" },
  landing_faq1_q: { en: "Is switching really free?", ne: "के स्विच गर्नु साँच्चै निःशुल्क छ?", hi: "क्या बदलना वाकई मुफ्त है?" },
  landing_faq1_a: {
    en: "Yes! Chautari charges a one-time $97 coordination fee to manage the entire switch process. There are no hidden fees, and you never pay for the care itself through us.",
    ne: "हो! चौतारीले सम्पूर्ण स्विच प्रक्रिया व्यवस्थापन गर्न एक पटकको $९७ समन्वय शुल्क लिन्छ। कुनै लुकेका शुल्कहरू छैनन्।",
    hi: "हाँ! चौतारी पूरी स्विच प्रक्रिया के प्रबंधन के लिए एकमुश्त $97 समन्वय शुल्क लेती है। कोई छिपा हुआ शुल्क नहीं है।",
  },
  landing_faq2_q: { en: "Will I lose my current care during the switch?", ne: "स्विच गर्दा मेरो हालको हेरचाह गुम्छ?", hi: "क्या स्विच के दौरान मेरी मौजूदा देखभाल बंद हो जाएगी?" },
  landing_faq2_a: {
    en: "No. Your current care continues until the new agency is fully set up. There is no gap in service — we make sure of that.",
    ne: "होइन। नयाँ एजेन्सी पूर्ण रूपमा स्थापित नभएसम्म तपाईंको हालको हेरचाह जारी रहन्छ। सेवामा कुनै अन्तर छैन।",
    hi: "नहीं। आपकी मौजूदा देखभाल तब तक जारी रहती है जब तक नई एजेंसी पूरी तरह स्थापित न हो जाए। सेवा में कोई अंतर नहीं होता।",
  },
  landing_faq3_q: { en: "How long does the switch take?", ne: "स्विच गर्न कति समय लाग्छ?", hi: "स्विच में कितना समय लगता है?" },
  landing_faq3_a: {
    en: "Most switches complete in 5–7 business days. We keep you updated at every step through your dashboard and notifications.",
    ne: "अधिकांश स्विचहरू ५–७ कार्य दिनभित्र पूरा हुन्छन्। हामी तपाईंको ड्यासबोर्ड र सूचनाहरूमार्फत प्रत्येक चरणमा अपडेट राख्छौं।",
    hi: "अधिकांश स्विच 5–7 कार्य दिनों में पूरे हो जाते हैं। हम आपके डैशबोर्ड और सूचनाओं के ज़रिए हर कदम पर अपडेट रखते हैं।",
  },
  landing_faq4_q: { en: "Is my health information safe?", ne: "मेरो स्वास्थ्य जानकारी सुरक्षित छ?", hi: "क्या मेरी स्वास्थ्य जानकारी सुरक्षित है?" },
  landing_faq4_a: {
    en: "Absolutely. Chautari is fully HIPAA compliant. Your data is encrypted, never sold, and only shared with agencies you choose.",
    ne: "निश्चित रूपमा। चौतारी पूर्ण रूपमा HIPAA अनुरूप छ। तपाईंको डाटा इन्क्रिप्टेड छ, कहिल्यै बेचिँदैन, र तपाईंले छान्नुभएका एजेन्सीहरूसँग मात्र साझा गरिन्छ।",
    hi: "बिल्कुल। चौतारी पूरी तरह HIPAA अनुपालन है। आपका डेटा एन्क्रिप्टेड है, कभी बेचा नहीं जाता, और केवल उन एजेंसियों के साथ साझा किया जाता है जिन्हें आप चुनते हैं।",
  },
  landing_faq5_q: { en: "What types of insurance do you accept?", ne: "तपाईंले कुन प्रकारको बीमा स्वीकार गर्नुहुन्छ?", hi: "आप किस प्रकार का बीमा स्वीकार करते हैं?" },
  landing_faq5_a: {
    en: "We work with all major Pennsylvania payers including Medicaid, Medicare, UPMC Health Plan, Highmark, Aetna Better Health, and private pay options.",
    ne: "हामी मेडिकेड, मेडिकेयर, UPMC हेल्थ प्लान, हाइमार्क, एटना बेटर हेल्थ, र निजी भुक्तानी विकल्पहरू सहित सबै प्रमुख पेन्सिल्भेनिया भुक्तानीकर्ताहरूसँग काम गर्छौं।",
    hi: "हम मेडिकेड, मेडिकेयर, UPMC हेल्थ प्लान, हाइमार्क, एटना बेटर हेल्थ, और निजी भुगतान विकल्पों सहित सभी प्रमुख पेनसिल्वेनिया भुगतानकर्ताओं के साथ काम करते हैं।",
  },

  // Final CTA
  landing_final_title: { en: "Ready to find better home care?", ne: "राम्रो होम केयर खोज्न तयार हुनुहुन्छ?", hi: "बेहतर होम केयर खोजने के लिए तैयार?" },
  landing_final_desc: {
    en: "Create a free account and start your switch in minutes. No commitments, no pressure.",
    ne: "निःशुल्क खाता बनाउनुस् र मिनेटमा आफ्नो स्विच सुरु गर्नुस्। कुनै प्रतिबद्धता छैन, कुनै दबाब छैन।",
    hi: "मुफ्त खाता बनाएं और मिनटों में अपना स्विच शुरू करें। कोई प्रतिबद्धता नहीं, कोई दबाव नहीं।",
  },
  landing_cta_get_started: { en: "Get started free", ne: "निःशुल्क सुरु गर्नुस्", hi: "मुफ्त शुरू करें" },
  landing_cta_call: { en: "Or call us:", ne: "वा हामीलाई कल गर्नुस्:", hi: "या हमें कॉल करें:" },

  // Footer
  landing_footer_privacy: { en: "Privacy", ne: "गोपनीयता", hi: "गोपनीयता" },
  landing_footer_terms: { en: "Terms", ne: "सर्तहरू", hi: "शर्तें" },
  landing_footer_hipaa: { en: "HIPAA", ne: "HIPAA", hi: "HIPAA" },
  landing_footer_contact: { en: "Contact", ne: "सम्पर्क", hi: "संपर्क" },
  landing_footer_agencies: { en: "For Agencies", ne: "एजेन्सीहरूको लागि", hi: "एजेंसियों के लिए" },
  landing_footer_disclaimer: {
    en: "Not affiliated with DHHS or CMS.",
    ne: "DHHS वा CMS सँग सम्बद्ध छैन।",
    hi: "DHHS या CMS से संबद्ध नहीं।",
  },
} satisfies Record<string, Record<Lang, string>>;

export type TranslationKey = keyof typeof translations;

// Core translation function — used in server components with a known lang
export function t(key: TranslationKey, lang: Lang = "en"): string {
  return translations[key][lang] ?? translations[key]["en"] ?? key;
}

// Status key helper
export function statusKey(status: string): TranslationKey | null {
  const map: Record<string, TranslationKey> = {
    submitted: "status_submitted",
    under_review: "status_under_review",
    accepted: "status_accepted",
    completed: "status_completed",
    denied: "status_denied",
    cancelled: "status_cancelled",
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
