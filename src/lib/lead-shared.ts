// То, что нужно и форме в браузере, и серверу. Без zod: иначе библиотека схем
// уезжает в клиентский бандл и тормозит загрузку на телефоне.

export const INTERESTS = {
  subscription: "Подписка",
  order: "Разовый заказ",
  question: "Вопрос",
} as const;
export type Interest = keyof typeof INTERESTS;

export const leadMessages = {
  name: "Напишите, как к вам обращаться",
  interest: "Выберите, что вас интересует",
  comment: "Комментарий длинноват: уложитесь в 1000 знаков",
};

export const LEAD_FIELDS = ["name", "phone", "interest", "comment"] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];
export type FieldErrors = Partial<Record<LeadField, string>>;
