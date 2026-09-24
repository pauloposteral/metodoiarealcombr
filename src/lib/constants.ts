export const COURSE_PRICE_ID = 'price_1TAKj1K7VFRW1YcZZSZSsb3n';
export const CONTACT_EMAIL = 'contato@metodoiareal.com.br';
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim();
export const HAS_WHATSAPP = Boolean(whatsappNumber && /^[1-9]\d{9,14}$/.test(whatsappNumber));
export const SUPPORT_URL = HAS_WHATSAPP
  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Tenho interesse no Método IA Real')}`
  : `mailto:${CONTACT_EMAIL}`;
