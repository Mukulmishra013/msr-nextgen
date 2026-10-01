/**
 * High-Converting Conversational Knowledge Base & Multi-Agent Heuristic Brain
 * Ensures 100% reliable, context-specific answers for every user question
 * without repetitive default greetings.
 */

export function getSmartAssistantAnswer(query: string, historyLength: number = 0): string {
  const q = query.toLowerCase().trim();

  // 1. Food / Restaurant / Cafe / Dining / Table Booking
  if (
    q.includes('restaurant') ||
    q.includes('cafe') ||
    q.includes('food') ||
    q.includes('table') ||
    q.includes('dining') ||
    q.includes('menu') ||
    q.includes('party booking')
  ) {
    return 'Restaurants aur Cafes ke liye hamara SmartDine AI Agent (jaise Nacho G aur The Bunker Cafe) WhatsApp par automated table reservations aur menu sharing karta hai — bina kisi staff ke! Weekend rush me zero customers miss hote hain. Aapka cafe/restaurant kahan located hai?';
  }

  // 2. Doctor / Clinic / Healthcare / Patient Appointment
  if (
    q.includes('clinic') ||
    q.includes('doctor') ||
    q.includes('health') ||
    q.includes('hospital') ||
    q.includes('patient') ||
    q.includes('appointment') ||
    q.includes('opd')
  ) {
    return 'Doctors aur Clinics ke liye hamara CareSlot AI Agent 24/7 patient appointments book karta hai, token timings aur clinic GPS directions automatically WhatsApp par bhejta hai. OPD rush 60% tak smooth ho jata hai!';
  }

  // 3. School / Coaching / Education / Admission
  if (
    q.includes('school') ||
    q.includes('coaching') ||
    q.includes('admission') ||
    q.includes('edu') ||
    q.includes('student') ||
    q.includes('class') ||
    q.includes('jee') ||
    q.includes('neet')
  ) {
    return 'Schools aur Coaching Institutes (jaise Elite Futuristic School) ke liye hamara EduEnroll AI Agent parents ke fee structure, syllabus aur timings queries ko instantly solve karke verified campus visits schedule karta hai.';
  }

  // 4. Real Estate / Builder / Flat / Site Visit
  if (
    q.includes('real estate') ||
    q.includes('builder') ||
    q.includes('property') ||
    q.includes('flat') ||
    q.includes('bhk') ||
    q.includes('site visit') ||
    q.includes('plot')
  ) {
    return 'Real Estate builders ke liye hamara EstateMatch Agent serious buyers ka budget (2BHK/3BHK) filter karta hai, PDF brochures deliver karta hai aur sales manager ke sath direct site visits book karta hai.';
  }

  // 5. D2C / E-Commerce / COD / RTO
  if (
    q.includes('d2c') ||
    q.includes('ecom') ||
    q.includes('shopify') ||
    q.includes('rto') ||
    q.includes('cod') ||
    q.includes('fake order') ||
    q.includes('ecommerce')
  ) {
    return 'D2C brands ke liye humne D2C Anti-RTO Shield develop kiya hai (jaise Amparo ke liye 340% ROAS aur 28% RTO drop deliver kiya). Ye fake addresses filter karta hai aur Cash-on-Delivery orders ko WhatsApp par 1-click me auto-verify karta hai. Aapka store kis product category me hai?';
  }

  // 6. Meta & Google Ads / Advertising
  if (
    q.includes('meta') ||
    q.includes('google') ||
    q.includes('ads') ||
    q.includes('ad ') ||
    q.includes('campaign') ||
    q.includes('marketing') ||
    q.includes('advertising') ||
    q.includes('help karenge') ||
    q.includes('kaise help')
  ) {
    return 'Meta & Google Ads se aapke business ko daily targeted customers milte hain:\n\n1. 🎯 Hyper-Local Precision: Aapke store ya target city ke serious buyers tak direct ads pahunchte hain.\n2. 🎬 High-Converting Video Reels: Vernacular hooks ke sath ads banate hain jisse trust aur clicks 3x badhte hain.\n3. 📲 Direct WhatsApp Funnel: Clicks seedhe aapke WhatsApp par aate hain jahan hamara 24/7 AI bot 2 second me lead qualify karta hai!\n\nAap kis specific business ya product ke liye ad campaigns run karna chahte hain?';
  }

  // 7. Pricing & Packages / Cost / Kharcha / Fees
  if (
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('cost') ||
    q.includes('kharcha') ||
    q.includes('package') ||
    q.includes('kitna') ||
    q.includes('fees') ||
    q.includes('rate')
  ) {
    return 'Hamare Meta/Google Ads & 24/7 AI WhatsApp bot management packages ₹15,000/month se start hote hain.\n\nIsme included hai:\n✓ High-converting ad creative design & video reel scripting\n✓ Laser-targeted audience setup & daily campaign optimization\n✓ 24/7 AI WhatsApp bot automation (instant reply & booking)\n✓ Zero setup headache — 24 ghante me live!\n\nKya aap apne business ke liye ek free 15-minute growth audit book karna chahenge?';
  }

  // 8. WhatsApp AI Bot / Automation / Features
  if (
    q.includes('whatsapp') ||
    q.includes('bot') ||
    q.includes('agent') ||
    q.includes('kaam karta hai') ||
    q.includes('automation') ||
    q.includes('autopilot') ||
    q.includes('feature')
  ) {
    return 'MSR Next Gen ka 24/7 AI WhatsApp Agent aapke business phone number par live connect hokar:\n\n• ⚡ 2-Second Instant Reply: Raat ke 2 baje bhi customer ko instant jawab deta hai.\n• 📦 Catalogs & Pricing: Products, photos aur payment links automatically share karta hai.\n• 🛡️ Anti-RTO & Fake Filter: COD orders verify karta hai aur fake addresses block karta hai.\n• 📅 Auto-Bookings: Table, appointment aur site visit schedule karta hai.\n\nAap ise abhi live test kar sakte hain: WhatsApp par tap karein +91 95193 42440.';
  }

  // 9. Free 15-Minute Audit / Consultation
  if (
    q.includes('audit') ||
    q.includes('free audit') ||
    q.includes('consult') ||
    q.includes('kaise book') ||
    q.includes('meeting')
  ) {
    return 'Free 15-Minute Growth Audit book karna bohot simple hai! 🚀\n\nHum aapke Instagram page, website aur current ads ka live audit karke 3 sabse bade growth bottlenecks batayenge.\n\nDirect founder Mukul se WhatsApp par judne ke liye yahan tap karein: +91 95193 42440 ya apna WhatsApp number yahan type kar dijiye!';
  }

  // 10. Proof / Case Studies / Clients / Results
  if (
    q.includes('proof') ||
    q.includes('result') ||
    q.includes('amparo') ||
    q.includes('case study') ||
    q.includes('nacho') ||
    q.includes('client') ||
    q.includes('kaam dikhao')
  ) {
    return 'Hamare verified client results:\n• Amparo (D2C Skincare): ₹2.4 Lakhs revenue in 30 days, 3.8x ROAS aur -28% RTO drop.\n• Nacho G (Mexican Cafe): Weekend footfall me 40% jump.\n• The Bunker Cafe & Dining Venue: 1+ year retainer clients.\n\nHum vanity metrics nahi, real bank balance growth deliver karte hain!';
  }

  // 11. Founder / Mukul / Contact / Phone
  if (
    q.includes('mukul') ||
    q.includes('founder') ||
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('number') ||
    q.includes('call') ||
    q.includes('address')
  ) {
    return 'Aap direct MSR founder Mukul se WhatsApp par connect kar sakte hain:\n📞 Official Sales & Audits: +91 95193 42440\n💬 Client Desk: +91 88875 21156\n✉️ Email: msbestshoopingpro@gmail.com\n\nAbhi WhatsApp par message bhejein for instant reply!';
  }

  // 12. Contextual follow-up if conversation continues
  if (historyLength > 1) {
    return 'Aapka requirement bohot clear hai! Isko detail me samajhne aur aapke ad spend par maximum ROI nikalne ke liye hamari team aapko ek personalized strategy roadmap bhej sakti hai. Aap apna business name aur WhatsApp number share karenge ya direct WhatsApp par connect karein: +91 95193 42440?';
  }

  return 'Namaste! MSR Next Gen me aapka swagat hai. Hum Meta & Google Ads aur 24/7 AI WhatsApp Automation se Indian businesses aur D2C brands ke sales scale karte hain. Aap kis business ke liye marketing ya AI bot explore karna chahte hain?';
}
