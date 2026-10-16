"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { checkByPhone } from "@/lib/phone";
import { INTERESTS, leadMessages, type FieldErrors, type Interest, type LeadField } from "@/lib/lead-shared";
import { readAttribution, rememberTouch } from "@/lib/attribution";
import { coffees, contacts } from "@/content/site";
import s from "./LeadForm.module.css";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "created" }
  | { kind: "duplicate" }
  | { kind: "failed"; reason: keyof typeof failText };

const TIMEOUT_MS = 12_000;

const failText = {
  offline: "Похоже, пропал интернет.",
  timeout: "Сервер долго не отвечает.",
  network: "Не удалось связаться с сервером.",
  server: "У нас что-то сломалось на сервере.",
};

function validate(values: { name: string; phone: string; interest: Interest | "" }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = leadMessages.name;
  const phone = checkByPhone(values.phone);
  if (!phone.ok) errors.phone = phone.message;
  if (!values.interest) errors.interest = leadMessages.interest;
  return errors;
}

export function LeadForm() {
  const id = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState<Interest | "">("");
  const [comment, setComment] = useState("");
  const [coffee, setCoffee] = useState<string | undefined>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const sendingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // метки рекламы запоминаем сразу при заходе, а не при отправке
  useEffect(() => rememberTouch(), []);

  // кнопки «Заказать» и «Оформить подписку» на странице заполняют форму
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const trigger = (event.target as HTMLElement).closest<HTMLElement>("[data-lead-interest]");
      if (!trigger) return;
      setInterest(trigger.dataset.leadInterest as Interest);
      const picked = coffees.find((c) => c.id === trigger.dataset.leadCoffee);
      setCoffee(picked?.id);
      if (picked) setComment((prev) => (prev.trim() ? prev : `${picked.name}, ${picked.weight}. `));
      setStatus((prev) => (prev.kind === "created" || prev.kind === "duplicate" ? prev : { kind: "idle" }));
      window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 450);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function fieldProps(field: LeadField) {
    return {
      id: `${id}-${field}`,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined,
    };
  }

  function clearError(field: LeadField) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function focusFirstError(next: FieldErrors) {
    const first = (["name", "phone", "interest", "comment"] as const).find((f) => next[f]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingRef.current) return; // двойной клик

    const clientErrors = validate({ name, phone, interest });
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      focusFirstError(clientErrors);
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus({ kind: "failed", reason: "offline" });
      return;
    }

    sendingRef.current = true;
    setStatus({ kind: "sending" });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value;

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          interest,
          comment,
          coffee,
          website: honeypot,
          attribution: readAttribution(),
        }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => null)) as
        | { ok: true; status: "created" | "duplicate" }
        | { ok: false; error: string; fields?: FieldErrors }
        | null;

      if (data?.ok) {
        setStatus({ kind: data.status });
      } else if (response.status === 422 && data && !data.ok && data.fields) {
        setErrors(data.fields);
        setStatus({ kind: "idle" });
        focusFirstError(data.fields);
      } else {
        setStatus({ kind: "failed", reason: "server" });
      }
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      setStatus({ kind: "failed", reason: aborted ? "timeout" : navigator.onLine === false ? "offline" : "network" });
    } finally {
      window.clearTimeout(timer);
      sendingRef.current = false;
    }
  }

  if (status.kind === "created" || status.kind === "duplicate") {
    return (
      <div className={s.done} role="status">
        <p className={s.doneTitle}>{status.kind === "created" ? "Заявка у нас" : "Эта заявка уже у нас"}</p>
        <p>
          {status.kind === "created"
            ? "Менеджер перезвонит, уточнит сорт и помол и запишет вас в ближайшую партию."
            : "С этого номера заявка пришла несколько минут назад, второй раз её не создаём. Менеджер перезвонит, и всё можно будет уточнить по телефону."}
        </p>
        <p className={s.doneNote}>
          Звоним в рабочее время: {contacts.hoursWeekdays}, {contacts.hoursWeekend}.
        </p>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form ref={formRef} className={s.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
      <div className={s.field}>
        <label className={s.label} htmlFor={`${id}-name`}>
          Имя
        </label>
        <input
          ref={nameRef}
          {...fieldProps("name")}
          className={s.input}
          name="name"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError("name");
          }}
        />
        {errors.name && (
          <p className={s.error} id={`${id}-name-error`}>
            {errors.name}
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor={`${id}-phone`}>
          Телефон
        </label>
        <input
          {...fieldProps("phone")}
          className={s.input}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+375 29 123-45-67"
          maxLength={40}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone && checkByPhone(e.target.value).ok) clearError("phone");
          }}
          onBlur={() => {
            if (!phone.trim()) return;
            const res = checkByPhone(phone);
            if (res.ok) setPhone(res.pretty);
            else setErrors((prev) => ({ ...prev, phone: res.message }));
          }}
        />
        {errors.phone && (
          <p className={s.error} id={`${id}-phone-error`}>
            {errors.phone}
          </p>
        )}
      </div>

      <fieldset
        className={s.choices}
        aria-describedby={errors.interest ? `${id}-interest-error` : undefined}
      >
        <legend className={s.label}>Что интересует</legend>
        <div className={s.segments}>
          {(Object.keys(INTERESTS) as Interest[]).map((key) => (
            <label key={key} className={s.segment}>
              <input
                type="radio"
                name="interest"
                value={key}
                checked={interest === key}
                onChange={() => {
                  setInterest(key);
                  clearError("interest");
                }}
              />
              <span>{INTERESTS[key]}</span>
            </label>
          ))}
        </div>
        {errors.interest && (
          <p className={s.error} id={`${id}-interest-error`}>
            {errors.interest}
          </p>
        )}
      </fieldset>

      <div className={s.field}>
        <label className={s.label} htmlFor={`${id}-comment`}>
          Комментарий <span className={s.optional}>— если нужно</span>
        </label>
        <textarea
          {...fieldProps("comment")}
          className={s.input}
          name="comment"
          rows={3}
          maxLength={1000}
          placeholder="Сорт, помол, удобное время для звонка"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            clearError("comment");
          }}
        />
        {errors.comment && (
          <p className={s.error} id={`${id}-comment-error`}>
            {errors.comment}
          </p>
        )}
      </div>

      {/* ловушка для ботов: люди это поле не видят */}
      <div className={s.trap} aria-hidden="true">
        <label>
          Сайт
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status.kind === "failed" && (
        <div className={s.failed} role="alert">
          <p>
            <strong>Заявка не отправилась.</strong> {failText[status.reason]} Всё, что вы ввели, осталось в форме —
            нажмите «Отправить заявку» ещё раз.
          </p>
          <p>
            Не получается? Позвоните нам: <a href={contacts.phoneHref}>{contacts.phone}</a>
          </p>
        </div>
      )}

      <button className={`button ${s.submit}`} type="submit" disabled={sending}>
        {sending ? "Отправляем…" : "Отправить заявку"}
      </button>

      <p className={s.consent}>
        Нажимая кнопку, вы соглашаетесь на&nbsp;<Link href="/privacy">обработку персональных данных</Link>.
      </p>
    </form>
  );
}
