/**
 * High-Converting Conversational Knowledge Base & Multi-Agent Heuristic Brain
 * Ensures 100% reliable, context-specific answers for every user question
 * without repetitive default greetings across all agents and the main AI assistant.
 */

export function getSmartAssistantAnswer(
  query: string,
  historyLength: number = 0,
  agentId?: string
): string {
  const q = query.toLowerCase().trim();

  // ==========================================
  // A. AGENT-SPECIFIC DOMAIN LOGIC (When simulating agents)
  // ==========================================

  // 1. Restaurant / Cafe SmartDine Agent
  if (agentId === 'restaurant-smart-dine' || agentId === 'food') {
    if (q.includes('table') || q.includes('book') || q.includes('seat') || q.includes('reservation')) {
      return 'Table booking confirm karne ke liye please batayein: Aap kitne guests ke liye aur kis timing (Lunch 1-3 PM ya Dinner 8-11 PM) par table reserve karna chahte hain? Rooftop booth aur Indoor AC hall dono available hain!';
    }
    if (q.includes('menu') || q.includes('food') || q.includes('dish') || q.includes('order')) {
      return 'Hamara digital food & cocktail menu ready hai! Pizza, Pasta, Nachos aur Mocktails ke top combos par aaj 15% discount chal raha hai. Kya aap table ke sath food pre-order karna chahenge?';
    }
    if (q.includes('party') || q.includes('birthday') || q.includes('anniversary')) {
      return 'Happy Celebrations! 🎉 Hum 10 se 50 guests tak ke private party lounge bookings offer karte hain with custom decoration aur special chef menu. Aap kis date ke liye plan kar rahe hain?';
    }
    return 'Namaste! Main SmartDine Table Booking AI Agent hu (jaise Nacho G aur The Bunker Cafe ke liye deployed). Main 24/7 table reservations aur digital menu share karta hu. Aap kitne persons ke liye table dekh rahe hain?';
  }

  // 2. Clinic / Healthcare CareSlot Agent
  if (agentId === 'clinic-care-slot' || agentId === 'healthcare') {
    if (q.includes('appointment') || q.includes('book') || q.includes('slot') || q.includes('doctor')) {
      return 'Doctor appointment ke liye aaj 2 slots available hain:\n• Morning: 10:30 AM - 01:00 PM\n• Evening: 05:30 PM - 08:30 PM\n\nAap kiske naam se appointment book karna chahte hain aur patient ki kya age hai?';
    }
    if (q.includes('fees') || q.includes('price') || q.includes('cost') || q.includes('charge')) {
      return 'General OPD consultation fee ₹400 hai aur Specialist Consultation fee ₹700 hai. Follow-up visit 7 days ke andar complimentary hai.';
    }
    if (q.includes('address') || q.includes('location') || q.includes('kahan') || q.includes('timing')) {
      return 'Clinic timings: Subah 9:00 AM se Raat 9:00 PM tak (Sunday open till 2 PM). Live token status aur clinic ka Google Maps direction link aapke WhatsApp par send kar diya jata hai.';
    }
    return 'Namaste! Main CareSlot Clinic & Patient AI Agent hu. Hum doctors aur diagnostics ke liye 24/7 patient appointments book karte hain aur automated tokens bhejte hain. Aap kis specialist ya treatment ke liye consult karna chahte hain?';
  }

  // 3. D2C COD Verification & Anti-RTO Shield
  if (agentId === 'd2c-cod-shield' || agentId === 'd2c') {
    if (q.includes('rto') || q.includes('cod') || q.includes('fake') || q.includes('order')) {
      return 'Hamara Anti-RTO Shield automated WhatsApp flow se COD orders ko 2 second me verify karta hai:\n1. Customer ko 1-tap WhatsApp button milta hai (Confirm ya Cancel).\n2. Pincode blacklist & fake address check hota hai.\n3. Prepaid conversion par ₹50 off dekar COD ko direct prepaid me convert karta hai! (35% RTO drop deliver kiya Amparo me).';
    }
    if (q.includes('delhi') || q.includes('delivery') || q.includes('days') || q.includes('track')) {
      return 'Metro cities (Delhi, Mumbai, Bengaluru) me standard delivery 2-3 business days me hoti hai. Order dispatch hote hi automated WhatsApp live tracking number share ho jata hai.';
    }
    if (q.includes('price') || q.includes('serum') || q.includes('product') || q.includes('cost')) {
      return 'Hamara bestseller Organic Glow Serum ₹899 me available hai (Free Cash on Delivery + 10% extra off on UPI payment). Kya aap 1 bottle COD book karna chahte hain?';
    }
    return 'Namaste! Main D2C Anti-RTO & COD Verification Shield hu. Hum Shopify aur WooCommerce stores ke Cash on Delivery orders verify karke returns 35% tak cut karte hain. Aapka store kis product category me hai?';
  }

  // 4. School / Coaching EduEnroll Agent
  if (agentId === 'edu-enroll-agent' || agentId === 'education') {
    if (q.includes('fee') || q.includes('fees') || q.includes('cost') || q.includes('structure')) {
      return 'Detailed fee structure aur installment options ka PDF brochure WhatsApp par bhej diya jata hai. Isme tuition, lab aur activity fees transparently mention hoti hain. Aap kis class ya batch ke liye janna chahte hain?';
    }
    if (q.includes('admission') || q.includes('seat') || q.includes('demo') || q.includes('visit')) {
      return 'Admissions open hain! Hum weekend par Free Demo Class aur Campus Tour organize kar rahe hain. Aap kis day par student ke sath visit karna chahenge?';
    }
    return 'Namaste! Main EduEnroll School & Coaching Admission AI Agent hu. Hum parents ke admission queries, demo class bookings aur fee structure distribution ko 24/7 automate karte hain. Aap kis grade ya competitive exam (JEE/NEET/Foundation) ke liye dekh rahe hain?';
  }

  // 5. Real Estate EstateMatch Agent
  if (agentId === 'real-estate-lead-matcher' || agentId === 'realestate') {
    if (q.includes('price') || q.includes('budget') || q.includes('bhk') || q.includes('flat')) {
      return 'Hamare premium projects me 2 BHK (₹55L - ₹75L) aur 3 BHK Luxury (₹95L - ₹1.4 Cr) options available hain with clubhouse, swimming pool aur covered parking. Aapka estimated budget kya hai?';
    }
    if (q.includes('visit') || q.includes('site') || q.includes('location') || q.includes('sample')) {
      return 'Sample flat live walkthrough aur site visit ke liye hamari shuttle service available hai. Aap is Saturday ya Sunday me se kis time visit prefer karenge? Sales manager aapke sath direct coordinate karenge.';
    }
    return 'Namaste! Main EstateMatch Property AI Agent hu. Hum verified buyers ka budget filter karke floor plan brochures aur direct site visits schedule karte hain. Aap kis location aur BHK configuration me property search kar rahe hain?';
  }

  // 6. WhatsApp AI Sales Pilot
  if (agentId === 'whatsapp-autopilot') {
    if (q.includes('feature') || q.includes('kaise') || q.includes('karta hai') || q.includes('demo')) {
      return 'WhatsApp AI Sales Pilot aapke official number par connect hokar:\n• ⚡ 2-second me customer ko instant replies deta hai\n• 🛒 Catalogs, photos aur payment links share karta hai\n• 📊 Leads ko qualify karke CRM ya Google Sheet me sync karta hai\n• 🌙 Raat ke 2 baje bhi sales close karta hai!';
    }
    return 'Namaste! Main MSR Next Gen ka 24/7 WhatsApp AI Sales Pilot hu. Hum aapke business WhatsApp number ko ek autonomous sales machine me convert kar dete hain. Aap kis business ke liye ise setup karna chahte hain?';
  }

  // 7. OmniDesk Support Bot
  if (agentId === 'omni-support-bot') {
    return 'Namaste! Main OmniDesk AI Support Assistant hu. Hum customer support tickets, refund/return requests aur FAQs ko 24/7 bina human staff ke resolve karte hain. Main aapki kya help kar sakta hu?';
  }

  // ==========================================
  // B. GENERAL MSR NEXT GEN AGENCY LOGIC (Maya)
  // ==========================================

  // 1. Food / Restaurant / Cafe / Dining
  if (
    q.includes('restaurant') ||
    q.includes('cafe') ||
    q.includes('food') ||
    q.includes('table') ||
    q.includes('dining') ||
    q.includes('nacho')
  ) {
    return 'Restaurants aur Cafes ke liye hamara SmartDine AI Agent (jaise Nacho G aur The Bunker Cafe) WhatsApp par automated table reservations aur menu sharing karta hai — bina kisi staff ke! Weekend rush me zero customers miss hote hain. Aapka cafe/restaurant kahan located hai?';
  }

  // 2. Doctor / Clinic / Healthcare
  if (
    q.includes('clinic') ||
    q.includes('doctor') ||
    q.includes('health') ||
    q.includes('hospital') ||
    q.includes('patient') ||
    q.includes('opd')
  ) {
    return 'Doctors aur Clinics ke liye hamara CareSlot AI Agent 24/7 patient appointments book karta hai, token timings aur clinic GPS directions automatically WhatsApp par bhejta hai. OPD rush 60% tak smooth ho jata hai!';
  }

  // 3. School / Coaching / Education
  if (
    q.includes('school') ||
    q.includes('coaching') ||
    q.includes('admission') ||
    q.includes('edu') ||
    q.includes('student') ||
    q.includes('class')
  ) {
    return 'Schools aur Coaching Institutes (jaise Elite Futuristic School) ke liye hamara EduEnroll AI Agent parents ke fee structure, syllabus aur timings queries ko instantly solve karke verified campus visits schedule karta hai.';
  }

  // 4. Real Estate / Builder / Flat
  if (
    q.includes('real estate') ||
    q.includes('builder') ||
    q.includes('property') ||
    q.includes('flat') ||
    q.includes('bhk') ||
    q.includes('site visit')
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
    q.includes('ecommerce')
  ) {
    return 'D2C brands ke liye humne D2C Anti-RTO Shield develop kiya hai (jaise Amparo ke liye 340% ROAS aur 28% RTO drop deliver kiya). Ye fake addresses filter karta hai aur Cash-on-Delivery orders ko WhatsApp par 1-click me auto-verify karta hai. Aapka store kis product category me hai?';
  }

  // 6. Meta & Google Ads
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

  // 7. Pricing & Packages
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

  // 8. WhatsApp AI Bot
  if (
    q.includes('whatsapp') ||
    q.includes('bot') ||
    q.includes('agent') ||
    q.includes('automation') ||
    q.includes('autopilot')
  ) {
    return 'MSR Next Gen ka 24/7 AI WhatsApp Agent aapke business phone number par live connect hokar:\n\n• ⚡ 2-Second Instant Reply: Raat ke 2 baje bhi customer ko instant jawab deta hai.\n• 📦 Catalogs & Pricing: Products, photos aur payment links automatically share karta hai.\n• 🛡️ Anti-RTO & Fake Filter: COD orders verify karta hai aur fake addresses block karta hai.\n• 📅 Auto-Bookings: Table, appointment aur site visit schedule karta hai.\n\nAap ise abhi live test kar sakte hain: WhatsApp par tap karein +91 95193 42440.';
  }

  // 9. Free 15-Minute Audit
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

  // 12. Conversational greetings: hi, hello, namaste, kon ho, etc.
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hlo' ||
    q === 'hey' ||
    q === 'namaste' ||
    q.includes('kon ho') ||
    q.includes('who are you') ||
    q.includes('kya karte ho')
  ) {
    return 'Namaste! 🙏 Main Maya hu, MSR Next Gen ki AI Assistant. Hum aapke business ke liye high-converting Meta/Google Ads aur 24/7 AI WhatsApp Agents banate hain jisse daily leads aur sales grow hoti hain.\n\nAap kis business ke liye marketing ya AI bot explore karna chahte hain?';
  }

  // 13. Contextual follow-up if conversation continues
  if (historyLength > 1) {
    return 'Aapka requirement bohot clear hai! Isko detail me samajhne aur aapke ad spend par maximum ROI nikalne ke liye hamari team aapko ek personalized strategy roadmap bhej sakti hai. Aap apna business name aur WhatsApp number share karenge ya direct WhatsApp par connect karein: +91 95193 42440?';
  }

  return 'Namaste! MSR Next Gen me aapka swagat hai. Hum Meta & Google Ads aur 24/7 AI WhatsApp Automation se Indian businesses aur D2C brands ke sales scale karte hain. Aap kis business ke liye marketing ya AI bot explore karna chahte hain?';
}
