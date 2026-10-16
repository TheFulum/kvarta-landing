-- Схема заявок. Идемпотентна: прогоняется перед каждой сборкой (scripts/migrate.mjs).

CREATE TABLE IF NOT EXISTS leads (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  status        text NOT NULL DEFAULT 'new',
  name          text NOT NULL,
  phone         text NOT NULL,          -- E.164: +375XXXXXXXXX
  interest      text NOT NULL CHECK (interest IN ('subscription', 'order', 'question')),
  comment       text NOT NULL DEFAULT '',
  coffee        text,                   -- сорт, если пришли с кнопки «Заказать»
  -- откуда клиент: последнее касание (реклама, которая привела сейчас)
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,                   -- обычно id объявления
  utm_term      text,
  click_id      text,                   -- yclid / fbclid / gclid
  click_id_type text,
  landing_url   text,                   -- страница входа с метками
  referrer      text,
  page_url      text,                   -- страница, с которой отправили форму
  touches       jsonb,                  -- первое и последнее касание целиком
  user_agent    text
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- Замок на номер: пока locked_until в будущем, вторая заявка с этого номера не создаётся
CREATE TABLE IF NOT EXISTS lead_locks (
  phone        text PRIMARY KEY,
  locked_until timestamptz NOT NULL
);
