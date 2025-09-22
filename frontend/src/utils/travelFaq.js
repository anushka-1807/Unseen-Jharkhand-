// Offline travel FAQ generator (100+ Q&A) for Jharkhand and general travel
// Builds 100 place-specific Q&As (20 places x 5 question types)

const places = [
  { key: 'netarhat', label: 'Netarhat' },
  { key: 'betla', label: 'Betla National Park' },
  { key: 'hundru', label: 'Hundru Falls' },
  { key: 'dassam', label: 'Dassam Falls' },
  { key: 'jonha', label: 'Jonha Falls' },
  { key: 'patratu', label: 'Patratu Valley' },
  { key: 'ranchi', label: 'Ranchi' },
  { key: 'jamshedpur', label: 'Jamshedpur' },
  { key: 'deoghar', label: 'Deoghar' },
  { key: 'parasnath', label: 'Parasnath' },
  { key: 'hazaribagh', label: 'Hazaribagh' },
  { key: 'mccluskieganj', label: 'McCluskieganj' },
  { key: 'maithon', label: 'Maithon Dam' },
  { key: 'shikharji', label: 'Shikharji' },
  { key: 'chandil', label: 'Chandil Dam' },
  { key: 'seraikela', label: 'Seraikela' },
  { key: 'khunti', label: 'Khunti' },
  { key: 'simdega', label: 'Simdega' },
  { key: 'chaibasa', label: 'Chaibasa' },
  { key: 'latehar', label: 'Latehar' },
  { key: 'medininagar', label: 'Medininagar (Daltonganj)' },
  { key: 'dumka', label: 'Dumka' },
  { key: 'pakur', label: 'Pakur' },
  { key: 'itkhori', label: 'Itkhori' },
  { key: 'ghatshila', label: 'Ghatshila' },
]

const types = [
  {
    key: 'best-time',
    patterns: ['best time', 'season', 'when to visit', 'weather'],
    answer: (p) => `Best time to visit ${p} is October–March for pleasant weather; monsoon (Jul–Sep) is great for waterfalls but expect slippery trails.`,
  },
  {
    key: 'reach',
    patterns: ['how to reach', 'reach', 'getting there', 'route', 'train', 'bus'],
    answer: (p) => `To reach ${p}, connect via Ranchi or nearest major city by train/flight, then take a taxi or state bus. Roads are generally good—start early for daytime travel.`,
  },
  {
    key: 'attractions',
    patterns: ['attractions', 'things to do', 'places to see', 'itinerary'],
    answer: (p) => `Top attractions around ${p}: scenic viewpoints, nature walks, and local handicrafts. Plan 1–2 days; carry cash for small vendors and keep plastic use minimal.`,
  },
  {
    key: 'food',
    patterns: ['food', 'local food', 'what to eat', 'cuisine'],
    answer: (p) => `Around ${p}, try local dishes like handia (fermented rice), dhuska, pittha, and seasonal saag. Opt for popular, hygienic stalls and carry bottled water.`,
  },
  {
    key: 'budget',
    patterns: ['budget', 'cost', 'price', 'how much'],
    answer: (p) => `A basic day trip at ${p} can be ₹800–₹2000 per person (local travel, food, entry). Costs vary with guide, season, and transport choice.`,
  },
]

// Hindi versions
const typesHi = [
  {
    key: 'best-time',
    patterns: types.find(t=>t.key==='best-time').patterns,
    answer: (p) => `${p} जाने का सर्वोत्तम समय अक्टूबर–मार्च है; मानसून (जुलाई–सितंबर) में झरने शानदार होते हैं पर रास्ते फिसलन भरे हो सकते हैं।`,
  },
  {
    key: 'reach',
    patterns: types.find(t=>t.key==='reach').patterns,
    answer: (p) => `${p} पहुँचने के लिए रांची या नजदीकी बड़े शहर तक ट्रेन/फ्लाइट लें, फिर टैक्सी या राज्य बस। सड़कें ठीक हैं—दिन में यात्रा शुरू करें।`,
  },
  {
    key: 'attractions',
    patterns: types.find(t=>t.key==='attractions').patterns,
    answer: (p) => `${p} के आसपास शीर्ष आकर्षण: व्यूपॉइंट, नेचर वॉक और स्थानीय हस्तशिल्प। 1–2 दिन दें; छोटे दुकानदारों के लिए नकद रखें और प्लास्टिक कम करें।`,
  },
  {
    key: 'food',
    patterns: types.find(t=>t.key==='food').patterns,
    answer: (p) => `${p} के पास हैंडिया, धुस्का, पिठ्ठा और मौसमी साग ज़रूर आज़माएँ। साफ-सुथरी दुकानों को प्राथमिकता दें और पानी साथ रखें।`,
  },
  {
    key: 'budget',
    patterns: types.find(t=>t.key==='budget').patterns,
    answer: (p) => `${p} के लिए बेसिक डे-ट्रिप ₹800–₹2000 प्रति व्यक्ति (लोकल ट्रैवल, खाना, एंट्री)। लागत गाइड/सीज़न/ट्रांसपोर्ट पर निर्भर करती है।`,
  },
]

// Jharkhandi versions (simplified Magahi/Bhojpuri-toned)
const typesJh = [
  {
    key: 'best-time',
    patterns: types.find(t=>t.key==='best-time').patterns,
    answer: (p) => `${p} जाए के बढ़िया बेरा अक्टूबर–मार्च ह। मानसून (जुलाई–सितंबर) में झरना जबरदस्त, बाकि राह फिसलन हो सकेला।`,
  },
  {
    key: 'reach',
    patterns: types.find(t=>t.key==='reach').patterns,
    answer: (p) => `${p} पहुँचे खातिर रांची या नजदीकी शहर तक ट्रेन/प्लेन, ओकर बाद टैक्सी/राज्य बस। दिन में निकले त बढ़िया।`,
  },
  {
    key: 'attractions',
    patterns: types.find(t=>t.key==='attractions').patterns,
    answer: (p) => `${p} लगे व्यूपॉइंट, नेचर वाक आ स्थानीय हस्तशिल्प देखे लायक बा। 1–2 दिन राखीं; छोट दुकान खातिर नकद राखीं।`,
  },
  {
    key: 'food',
    patterns: types.find(t=>t.key==='food').patterns,
    answer: (p) => `${p} के आसपास हैंडिया, धुस्का, पिठ्ठा, मौसमी साग जरूर चखी। साफ-सुथरी दुकान चुनी।`,
  },
  {
    key: 'budget',
    patterns: types.find(t=>t.key==='budget').patterns,
    answer: (p) => `${p} के साधारण दिन-भर के खर्चा करीब ₹800–₹2000/व्यक्ति (लोकल यात्रा, खाना, एंट्री)। खर्चा गाइड/सीजन/ट्रांसपोर्ट पर निर्भर।`,
  },
]

// Prebuild KB per language
function buildKB(answersArray) {
  const out = []
  for (const place of places) {
    for (const t of answersArray) {
      out.push({
        id: `${place.key}-${t.key}`,
        patterns: [place.key, place.label.toLowerCase(), ...t.patterns],
        answer: t.answer(place.label),
      })
    }
  }
  return out
}

const kbEn = buildKB(types)
const kbHi = buildKB(typesHi)
const kbJh = buildKB(typesJh)

// Add general FAQs
const general = [
  {
    id: 'booking-how',
    patterns: ['how to book', 'booking', 'book a guide', 'reserve guide'],
    answer: 'Go to the Bookings page, choose your dates, and select an available guide. You will receive confirmation and contact details.'
  },
  {
    id: 'safety',
    patterns: ['safety', 'safe', 'is it safe', 'travel safety'],
    answer: 'Travel in daylight, keep emergency contacts, and let someone know your itinerary. Prefer registered guides and verified stays.'
  },
  {
    id: 'transport',
    patterns: ['transport', 'cab', 'taxi', 'bus', 'train', 'car rental'],
    answer: 'For local transport, use cabs or shared autos from hubs. For intercity, trains to Ranchi/Jamshedpur then road. Start early to avoid night travel.'
  },
  {
    id: 'permits',
    patterns: ['permit', 'entry pass', 'permissions'],
    answer: 'Most tourist spots don’t require permits. Some parks or religious sites may have entry fees; carry ID and cash for tickets.'
  },
  {
    id: 'packing',
    patterns: ['packing', 'what to carry', 'essentials'],
    answer: 'Carry light layers, rain protection (Jun–Sep), sturdy shoes, reusable water bottle, power bank, and basic first aid.'
  },
  {
    id: 'festivals',
    patterns: ['festival', 'festivals', 'events'],
    answer: 'Key festivals: Sarhul, Karma, Sohrai. Visiting during festivals offers rich cultural experiences; check local dates ahead.'
  },
  {
    id: 'guide-benefits',
    patterns: ['why guide', 'need guide', 'benefit of guide'],
    answer: 'Local guides add safety, language help, hidden spots, and culture. They optimize time and support local livelihoods.'
  },
  {
    id: 'waterfalls-season',
    patterns: ['waterfalls', 'best season for waterfalls'],
    answer: 'Monsoon and post-monsoon (Jul–Nov) are best for waterfalls like Hundru, Dassam, and Jonha. Exercise caution on wet rocks.'
  },
  {
    id: 'stay-areas',
    patterns: ['where to stay', 'stay', 'accommodation'],
    answer: 'In Ranchi/Jamshedpur choose areas near the city center for connectivity. For hill/forest spots, check eco-stays or government resorts in advance.'
  },
  {
    id: 'cash-atm',
    patterns: ['atm', 'cash', 'payment methods'],
    answer: 'ATMs are available in major towns. Carry some cash for remote areas where digital payments may be patchy.'
  },
]

const generalHi = [
  { id:'booking-how', patterns: general.find(g=>g.id==='booking-how').patterns, answer: 'बुकिंग करने के लिए बुकिंग्स पेज पर जाएँ, तारीख चुनें और उपलब्ध गाइड चुनें। आपको कन्फर्मेशन और संपर्क विवरण मिलेंगे।' },
  { id:'safety', patterns: general.find(g=>g.id==='safety').patterns, answer: 'दिन में यात्रा करें, इमरजेंसी कॉन्टैक्ट रखें और अपनी यात्रा किसी को बताएं। रजिस्टर्ड गाइड और वेरिफाइड स्टे को प्राथमिकता दें।' },
  { id:'transport', patterns: general.find(g=>g.id==='transport').patterns, answer: 'लोकल के लिए कैब/शेयर ऑटो, इंटरसिटी के लिए रांची/जमशेदपुर तक ट्रेन, फिर सड़क मार्ग। रात की यात्रा से बचें।' },
  { id:'permits', patterns: general.find(g=>g.id==='permits').patterns, answer: 'ज्यादातर जगहों पर परमिट की जरूरत नहीं। कुछ पार्क/धार्मिक स्थलों पर एंट्री फीस हो सकती है; आईडी और नकद रखें।' },
  { id:'packing', patterns: general.find(g=>g.id==='packing').patterns, answer: 'हल्के कपड़े, बारिश से बचाव (जून–सितंबर), मज़बूत जूते, पानी की बोतल, पावर बैंक और फर्स्ट एड रखें।' },
  { id:'festivals', patterns: general.find(g=>g.id==='festivals').patterns, answer: 'मुख्य त्योहार: सरहुल, करमा, Sohrai। त्योहारों में आना सांस्कृतिक अनुभव समृद्ध करता है; तिथियाँ पहले देख लें।' },
  { id:'guide-benefits', patterns: general.find(g=>g.id==='guide-benefits').patterns, answer: 'लोकल गाइड सुरक्षा, भाषा, छुपे स्थान और संस्कृति में मदद करते हैं। समय बचाते हैं और स्थानीय आजीविका को सपोर्ट करते हैं।' },
  { id:'waterfalls-season', patterns: general.find(g=>g.id==='waterfalls-season').patterns, answer: 'झरनों के लिए मानसून/पोस्ट-मानसून (जुलाई–नवंबर) सबसे अच्छा। गीले पत्थरों पर सावधानी रखें।' },
  { id:'stay-areas', patterns: general.find(g=>g.id==='stay-areas').patterns, answer: 'रांची/जमशेदपुर में कनेक्टिविटी के लिए सिटी सेंटर बढ़िया। हिल/फॉरेस्ट स्पॉट्स के लिए ईको-स्टे या गवर्नमेंट रिज़ॉर्ट पहले से देखें।' },
  { id:'cash-atm', patterns: general.find(g=>g.id==='cash-atm').patterns, answer: 'बड़े शहरों में एटीएम उपलब्ध। दूर-दराज़ जगहों के लिए कुछ नकद रखें; डिजिटल पेमेंट कमजोर हो सकता है।' },
]

const generalJh = [
  { id:'booking-how', patterns: general.find(g=>g.id==='booking-how').patterns, answer: 'बुकिंग खातिर बुकिंग्स पेज जाईं, तारीख चुनि के उपलब्ध गाइड ले लीं। कन्फर्मेशन आ सम्पर्क बियौरा मिली।' },
  { id:'safety', patterns: general.find(g=>g.id==='safety').patterns, answer: 'दिन में यात्रा करीं, इमरजेंसी नंबर राखीं, आपन प्लान घरवालन के बताईं। रजिस्टर्ड गाइड/स्टे चुनीं।' },
  { id:'transport', patterns: general.find(g=>g.id==='transport').patterns, answer: 'लोकल खातिर कैब/शेयर ऑटो, शहरन बीचे ट्रेन से रांची/जमशेदपुर, फेर सड़क। रात में यात्रा से बंचीं।' },
  { id:'permits', patterns: general.find(g=>g.id==='permits').patterns, answer: 'अधिकांश जगह परमिट नइखे लागे। कुछ पार्क/धार्मिक स्थल पर फीस हो सकेला; आईडी आ नकद राखीं।' },
  { id:'packing', patterns: general.find(g=>g.id==='packing').patterns, answer: 'हल्का कपड़ा, बरखा से बचाव, मजबूती जूता, पानी, पावर बैंक, फर्स्ट एड साथे राखीं।' },
  { id:'festivals', patterns: general.find(g=>g.id==='festivals').patterns, answer: 'मुख्य परब: सरहुल, करमा, सोहराय। परब में आएं त संस्कृति देखे के बढ़िया मौका, तारीख पहिले देखि लीं।' },
  { id:'guide-benefits', patterns: general.find(g=>g.id==='guide-benefits').patterns, answer: 'लोकल गाइड सुरक्षा, भाषा, छुपल जगह आ संस्कृति में मदत करेला। समय बचे आ स्थानीय रोजी-रोटी के सहारा।' },
  { id:'waterfalls-season', patterns: general.find(g=>g.id==='waterfalls-season').patterns, answer: 'झरना खातिर मानसून/पोस्ट-मानसून (जुलाई–नवम्बर) बढ़िया। गीला पत्थर पर सावधानी।' },
  { id:'stay-areas', patterns: general.find(g=>g.id==='stay-areas').patterns, answer: 'रांची/जमशेदपुर में सिटी सेंटर नज़दीक ठिहरला से सुविधा। पहाड़ी/जंगल इलाका खातिर इको-स्टे या सरकारी रिजॉर्ट पहिले देखि लीं।' },
  { id:'cash-atm', patterns: general.find(g=>g.id==='cash-atm').patterns, answer: 'बड़ शहर में एटीएम बा। दूर इलाका खातिर कुछ नकद साथे राखीं; डिजिटल पेमेंट कम चलेला।' },
]

// Extended general categories
const extraEn = [
  { id:'trek-safety', patterns:['trek','trekking','hike','trail','safety'], answer:'For treks: start early, carry water and a torch, wear sturdy shoes, avoid risky selfies at edges, and never litter.' },
  { id:'monsoon-travel', patterns:['monsoon','rain','flood','landslide','slippery'], answer:'Monsoon travel: expect slippery rocks and localized flooding. Keep rain gear, buffer travel time, and verify road conditions before departure.' },
  { id:'etiquette', patterns:['etiquette','custom','respect','local culture'], answer:'Respect local culture: ask before photographing people, dress modestly near villages and temples, and support community-run shops.' },
  { id:'photography', patterns:['photo','photography','camera','drone'], answer:'Photography: sunrise/sunset are best; keep distance from wildlife; drones may need permission—check local rules.' },
  { id:'emergency', patterns:['emergency','help','police','helpline'], answer:'Emergency contacts: Police 100, Ambulance 108. Share itinerary with someone, and keep offline maps downloaded.' },
  { id:'healthcare', patterns:['hospital','clinic','healthcare','medical'], answer:'Healthcare: bigger facilities are in Ranchi/Jamshedpur. Carry basic meds, ORS, and your prescriptions; for remote spots, plan ahead.' },
  { id:'transport-timing', patterns:['bus timing','last bus','first bus','timing','schedule'], answer:'Transport timings vary by route; most last buses leave before dusk. Confirm latest timings at the local bus stand.' },
]

const extraHi = [
  { id:'trek-safety', patterns:extraEn.find(x=>x.id==='trek-safety').patterns, answer:'ट्रेकिंग के लिए: सुबह जल्दी निकलें, पानी/टॉर्च रखें, मजबूत जूते पहनें, किनारों पर सेल्फी से बचें और कचरा न फैलाएँ।' },
  { id:'monsoon-travel', patterns:extraEn.find(x=>x.id==='monsoon-travel').patterns, answer:'मानसून यात्रा: फिसलन और पानी भराव संभव। रेन गियर रखें, समय का बफर रखें और सड़क हालात पहले जाँच लें।' },
  { id:'etiquette', patterns:extraEn.find(x=>x.id==='etiquette').patterns, answer:'स्थानीय संस्कृति का सम्मान करें: लोगों की फोटो लेने से पहले अनुमति लें, गाँव/मंदिरों में सादगी से रहें, सामुदायिक दुकानों का समर्थन करें।' },
  { id:'photography', patterns:extraEn.find(x=>x.id==='photography').patterns, answer:'फोटोग्राफी: सूर्योदय/सूर्यास्त सर्वश्रेष्ठ; वन्यजीव से दूरी रखें; ड्रोन के लिए अनुमति आवश्यक हो सकती है—स्थानीय नियम देखें।' },
  { id:'emergency', patterns:extraEn.find(x=>x.id==='emergency').patterns, answer:'आपातकाल: पुलिस 100, एम्बुलेंस 108। यात्रा योजना किसी को बताएं और ऑफ़लाइन मैप्स रखें।' },
  { id:'healthcare', patterns:extraEn.find(x=>x.id==='healthcare').patterns, answer:'स्वास्थ्य सुविधा: बड़े अस्पताल रांची/जमशेदपुर में हैं। बेसिक दवाएँ, ORS और प्रिस्क्रिप्शन साथ रखें; दूरस्थ इलाकों के लिए पहले योजना बनाएं।' },
  { id:'transport-timing', patterns:extraEn.find(x=>x.id==='transport-timing').patterns, answer:'परिवहन समय सारिणी रूट पर निर्भर; अधिकतर आख़िरी बसें साँझ से पहले चलती हैं। बस स्टैंड पर नवीनतम समय की पुष्टि करें।' },
]

const extraJh = [
  { id:'trek-safety', patterns:extraEn.find(x=>x.id==='trek-safety').patterns, answer:'ट्रेक खातिर भोरहीं निकलीं, पानी/टार्च राखीं, मजबूत जूता पहिनीं, किनारा पर सेल्फी से बचीं, कचरा मत फेंकीं।' },
  { id:'monsoon-travel', patterns:extraEn.find(x=>x.id==='monsoon-travel').patterns, answer:'बरखा में राह फिसलन हो सकेला, कहीं-कहीं पानी भरि जाला। रेन गियर राखीं, समय के गुंजाइश राखीं, रोड हाल-चाल पूछीं।' },
  { id:'etiquette', patterns:extraEn.find(x=>x.id==='etiquette').patterns, answer:'लोकल संस्कृति के मान राखीं; फोटो से पहिले अनुमति लीं, गाँव/मंदिर में सादगी राखीं, समुदाय वाला दुकानन से खरीदीं।' },
  { id:'photography', patterns:extraEn.find(x=>x.id==='photography').patterns, answer:'फोटो: सुरजउगे/ढलते बेर बढ़िया; जनवरन से दूरी राखीं; ड्रोन खातिर अनुमति लागे सकेला—नियम देखि लीं।' },
  { id:'emergency', patterns:extraEn.find(x=>x.id==='emergency').patterns, answer:'आपातकाल: पुलिस 100, एंबुलेंस 108। अपना यात्रा के प्लान घरे बताईं, ऑफलाइन नक्शा रखीं।' },
  { id:'healthcare', patterns:extraEn.find(x=>x.id==='healthcare').patterns, answer:'इलाज खातिर बड़ अस्पताल रांची/जमशेदपुर में बा। बेसिक दवाई, ORS, प्रिस्क्रिप्शन साथे रखीं; दूर इलाका खातिर पहिले सोच-समझ के चलीं।' },
  { id:'transport-timing', patterns:extraEn.find(x=>x.id==='transport-timing').patterns, answer:'बस के टाइम रूट पर निर्भर; ज्यादातर आखिरी बस साँझ से पहिले। बस स्टैंड पर नया टाइम पूछीं।' },
]

// Add stay tips by city patterns
const stayTipEn = places.map(p => ({ id:`stay-${p.key}`, patterns:[p.key, p.label.toLowerCase(), 'stay tips', 'where to stay'], answer:`Stay tips for ${p.label}: choose central areas for connectivity; for nature spots, look for eco-stays/homestays; prebook on weekends/holidays.` }))
const stayTipHi = places.map(p => ({ id:`stay-${p.key}`, patterns:[p.key, p.label.toLowerCase(), 'stay tips', 'where to stay'], answer:`${p.label} में ठहरने के सुझाव: कनेक्टिविटी के लिए सेंट्रल एरिया चुनें; नेचर स्पॉट्स हेतु ईको-स्टे/होमस्टे देखें; वीकेंड/त्योहार पर पहले से बुक करें।` }))
const stayTipJh = places.map(p => ({ id:`stay-${p.key}`, patterns:[p.key, p.label.toLowerCase(), 'stay tips', 'where to stay'], answer:`${p.label} खातिर ठिहरला के सलाह: कनेक्टिविटी खातिर बीचुक इलाका; नेचर जगह पर इको-स्टे/होमस्टे देखि लीं; वीकेंड/त्योहार पर पहिले से बुक।` }))

const kbMap = {
  en: [...kbEn, ...general, ...extraEn, ...stayTipEn],
  hi: [...kbHi, ...generalHi, ...extraHi, ...stayTipHi],
  jh: [...kbJh, ...generalJh, ...extraJh, ...stayTipJh],
}

// Simple matcher: checks if all tokens in a pattern set are present in text
function matchAnswer(text, lang='en') {
  const q = (text || '').toLowerCase()
  const kb = kbMap[lang] || kbMap.en
  // Try exact place+type matches first (by counting keyword hits)
  let best = { score: 0, answer: null }
  for (const item of kb) {
    const tokens = item.patterns
    let score = 0
    for (const token of tokens) {
      if (q.includes(token)) score += 1
    }
    if (score > best.score) {
      best = { score, answer: item.answer }
    }
  }

  if (best.answer && best.score >= 2) return best.answer

  // Fallback: fuzzy contains for any single strong keyword
  const strong = kb.find(item => item.patterns.some(p => q.includes(p)))
  if (strong) return strong.answer

  return null
}

export function getOfflineAnswer(userText, lang='en') {
  const ans = matchAnswer(userText, lang)
  if (ans) return ans
  if (lang === 'hi') return 'सटीक मिलान नहीं मिला। स्थान का नाम और आवश्यकता बताएँ: सर्वोत्तम समय, कैसे पहुँचे, आकर्षण, लोकल खाना, या बजट।'
  if (lang === 'jh') return 'ठीक-ठीक मेल ना मिलल। जगह आ जरूरत बताईं: बढ़िया बेरा, कइसे पहुँची, जगह-दर्शन, खाना, या बजट।'
  return "I didn't find an exact match. Tell me the place and what you need: best time, how to reach, attractions, local food, or budget."
}
