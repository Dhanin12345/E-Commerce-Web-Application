import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const TRANSLATIONS = {
  en: {
    nav_home: 'Home',
    nav_shop: 'Shop',
    nav_categories: 'Categories',
    nav_deals: 'Deals',
    nav_admin: 'Admin Console',
    nav_support: 'Support',
    search_placeholder: 'Search products, brands, or ask AI (e.g. "laptops under 60000")...',
    btn_add_to_cart: 'Add to Cart',
    btn_added: 'Added to Cart',
    btn_view_details: 'View Details',
    btn_compare: 'Compare',
    btn_checkout: 'Proceed to Checkout',
    hero_title: 'Future-Ready Smart E-Commerce',
    hero_subtitle: 'Discover intelligent product recommendations, real-time tracking, and voice-assisted shopping.',
    trending_title: '🔥 Trending Products',
    recommended_title: '✨ Recommended For You',
    frequently_bought_title: '🤝 Frequently Bought Together',
    loyalty_pts: 'Reward Points',
  },
  ta: {
    nav_home: 'முகப்பு',
    nav_shop: 'அங்காடி',
    nav_categories: 'வகைகள்',
    nav_deals: 'சலுகைகள்',
    nav_admin: 'நிர்வாக மையம்',
    nav_support: 'உதவி மையம்',
    search_placeholder: 'தயாரிப்புகளை தேடுங்கள் அல்லது குரல் மூலம் பேசுங்கள்...',
    btn_add_to_cart: 'கூடையில் சேர்',
    btn_added: 'கூடையில் சேர்க்கப்பட்டது',
    btn_view_details: 'விவரங்கள்',
    btn_compare: 'ஒப்பிடுக',
    btn_checkout: 'வாங்குதல்',
    hero_title: 'நவீன ஸ்மார்ட்கார்ட் வணிகம்',
    hero_subtitle: 'ஸ்மார்ட் தேடல் மற்றும் நிகழ்நேர விநியோக கண்காணிப்புடன் சிறந்த பொருட்களை கண்டறியுங்கள்.',
    trending_title: '🔥 பிரபலமான தயாரிப்புகள்',
    recommended_title: '✨ உங்களுக்கான பரிந்துரைகள்',
    frequently_bought_title: '🤝 ஒன்றாக வாங்கப்படும் பொருட்கள்',
    loyalty_pts: 'வெகுமதி புள்ளிகள்',
  },
  hi: {
    nav_home: 'होम',
    nav_shop: 'दुकान',
    nav_categories: 'श्रेणियाँ',
    nav_deals: 'ऑफ़र',
    nav_admin: 'एडमिन पैनल',
    nav_support: 'सहायता',
    search_placeholder: 'उत्पाद खोजें या वॉयस से बोलें...',
    btn_add_to_cart: 'कार्ट में जोड़ें',
    btn_added: 'जोड़ दिया गया',
    btn_view_details: 'विवरण देखें',
    btn_compare: 'तुलना करें',
    btn_checkout: 'चेकआउट करें',
    hero_title: 'स्मार्टकार्ट अगली पीढ़ी का ई-कॉमर्स',
    hero_subtitle: 'स्मार्ट एआई सिफारिशों और वास्तविक समय ट्रैकिंग के साथ सर्वोत्तम उत्पाद खोजें।',
    trending_title: '🔥 ट्रेंडिंग उत्पाद',
    recommended_title: '✨ आपके लिए अनुशंसित',
    frequently_bought_title: '🤝 अक्सर साथ खरीदे जाने वाले उत्पाद',
    loyalty_pts: 'लॉयल्टी पॉइंट्स',
  },
  de: {
    nav_home: 'Startseite',
    nav_shop: 'Shop',
    nav_categories: 'Kategorien',
    nav_deals: 'Angebote',
    nav_admin: 'Admin-Bereich',
    nav_support: 'Kundenservice',
    search_placeholder: 'Produkte suchen oder Sprachsuche nutzen...',
    btn_add_to_cart: 'In den Warenkorb',
    btn_added: 'Hinzugefügt',
    btn_view_details: 'Details anzeigen',
    btn_compare: 'Vergleichen',
    btn_checkout: 'Zur Kasse',
    hero_title: 'Modernes Smart E-Commerce',
    hero_subtitle: 'Entdecken Sie KI-Empfehlungen, Echtzeit-Sendungsverfolgung und erstklassiges Shopping.',
    trending_title: '🔥 Beliebte Produkte',
    recommended_title: '✨ Für Sie empfohlen',
    frequently_bought_title: '🤝 Oft zusammen gekauft',
    loyalty_pts: 'Treuepunkte',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('smartcart_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('smartcart_lang', lang);
  }, [lang]);

  const t = (key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
