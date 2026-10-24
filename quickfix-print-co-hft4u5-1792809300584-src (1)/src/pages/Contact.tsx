import { useState, type FormEvent } from 'react';
import type { Route } from '../lib/router';
import { BUSINESS, GENERAL_MESSAGE, whatsappLink } from '../lib/core';
import { submitEnquiry } from '../lib/data';
import { useMeta } from '../components/Layout';
import {
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Printing machines',
  'Toners & cartridges',
  'Consumables',
  'Spare parts & accessories',
  'Compatibility question',
  'Other',
];

interface Values {
  full_name: string;
  phone: string;
  email: string;
  enquiry_category: string;
  product_reference: string;
  message: string;
  website: string;
}

type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const errors: Errors = {};
  const name = v.full_name.trim();
  const phone = v.phone.trim();
  const email = v.email.trim();
  const message = v.message.trim();
  if (!name) errors.full_name = 'Please enter your full name.';
  else if (name.length > 120)
    errors.full_name = 'Please keep your name under 120 characters.';
  if (!phone) errors.phone = 'Please enter your phone number.';
  else if (!/^[0-9+()\-\s]{5,40}$/.test(phone))
    errors.phone = 'Enter a valid phone number, for example 0818 543 8551.';
  if (
    email &&
    (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
  ) {
    errors.email = 'Enter a valid email address, or leave this blank.';
  }
  if (v.product_reference.trim().length > 200)
    errors.product_reference = 'Please keep this under 200 characters.';
  if (!message)
    errors.message = 'Please tell us what you would like to enquire about.';
  else if (message.length > 4000)
    errors.message = 'Please keep your message under 4000 characters.';
  return errors;
}

export function Contact({ route }: { route: Route }) {
  useMeta(
    'Contact Us | Quickfix Print & Co',
    'Contact Quickfix Print & Co in Area 10, Garki, Abuja by telephone, WhatsApp, or enquiry form.'
  );
  const initial: Values = {
    full_name: '',
    phone: '',
    email: '',
    enquiry_category: '',
    product_reference: route.query.get('product') ?? '',
    message: '',
    website: '',
  };
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues(v => ({ ...v, [key]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFailed(false);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      document.getElementById(`field-${first}`)?.focus();
      return;
    }
    if (values.website.trim() !== '') {
      setDone(true);
      return;
    }
    setSubmitting(true);
    try {
      await submitEnquiry({
        full_name: values.full_name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || null,
        enquiry_category: values.enquiry_category || null,
        product_reference: values.product_reference.trim() || null,
        message: values.message.trim(),
      });
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues({ ...initial, product_reference: '' });
    setErrors({});
    setDone(false);
    setFailed(false);
  };

  const waText = [
    GENERAL_MESSAGE,
    values.product_reference.trim()
      ? `Product/model: ${values.product_reference.trim()}.`
      : '',
    values.message.trim() ? `Message: ${values.message.trim()}` : '',
    values.full_name.trim() ? `Name: ${values.full_name.trim()}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const waUrl = whatsappLink(waText);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>
            Call, message on WhatsApp, or send an enquiry. Please confirm exact
            price and availability directly with us.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <h2>{BUSINESS.name}</h2>
              <ul className="info-list">
                <li>
                  <MapPin size={18} aria-hidden="true" />
                  <span>{BUSINESS.address}</span>
                </li>
                {BUSINESS.phones.map(p => (
                  <li key={p.tel}>
                    <Phone size={18} aria-hidden="true" />
                    <a href={`tel:${p.tel}`}>{p.display}</a>
                  </li>
                ))}
                <li>
                  <Clock size={18} aria-hidden="true" />
                  <span>Opening hours: contact us to confirm.</span>
                </li>
              </ul>
              <p className="muted small">
                Registration number: {BUSINESS.registration}
              </p>
              <div className="info-actions">
                <a
                  className="btn btn-wa"
                  href={whatsappLink(GENERAL_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Enquire on
                  WhatsApp
                </a>
                <a
                  className="btn btn-outline"
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={18} aria-hidden="true" /> View on Google
                  Maps
                </a>
              </div>
            </div>
            <p className="info-note">
              Exact product availability and prices should be confirmed directly
              with Quickfix Print &amp; Co.
            </p>
          </div>

          <div className="form-card">
            <h2>Send an enquiry</h2>
            {done ? (
              <div className="success-box" role="status">
                <strong>Your enquiry has been saved.</strong>
                <p>
                  The Quickfix Print &amp; Co team can now see it. If your
                  request is urgent, please also call or message us on WhatsApp.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={reset}
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {failed && (
                  <div className="notice notice-error" role="alert">
                    <span>
                      We could not save your enquiry right now. Please call{' '}
                      {BUSINESS.phones[0].display} or use WhatsApp below
                      instead.
                    </span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="field-full_name">Full name *</label>
                  <input
                    id="field-full_name"
                    className="input"
                    value={values.full_name}
                    onChange={set('full_name')}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.full_name)}
                    aria-describedby={
                      errors.full_name ? 'err-full_name' : undefined
                    }
                  />
                  {errors.full_name && (
                    <p id="err-full_name" className="field-error">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="field-phone">Phone number *</label>
                  <input
                    id="field-phone"
                    className="input"
                    type="tel"
                    value={values.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                  />
                  {errors.phone && (
                    <p id="err-phone" className="field-error">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="field-email">Email address (optional)</label>
                  <input
                    id="field-email"
                    className="input"
                    type="email"
                    value={values.email}
                    onChange={set('email')}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'err-email' : undefined}
                  />
                  {errors.email && (
                    <p id="err-email" className="field-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="field-enquiry_category">
                    Enquiry category (optional)
                  </label>
                  <select
                    id="field-enquiry_category"
                    className="input"
                    value={values.enquiry_category}
                    onChange={set('enquiry_category')}
                  >
                    <option value="">Choose a category</option>
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="field-product_reference">
                    Product or model reference (optional)
                  </label>
                  <input
                    id="field-product_reference"
                    className="input"
                    value={values.product_reference}
                    onChange={set('product_reference')}
                    aria-invalid={Boolean(errors.product_reference)}
                    aria-describedby={
                      errors.product_reference
                        ? 'err-product_reference'
                        : undefined
                    }
                  />
                  {errors.product_reference && (
                    <p id="err-product_reference" className="field-error">
                      {errors.product_reference}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="field-message">Message *</label>
                  <textarea
                    id="field-message"
                    className="input textarea"
                    rows={5}
                    value={values.message}
                    onChange={set('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? 'err-message' : undefined
                    }
                  />
                  {errors.message && (
                    <p id="err-message" className="field-error">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="field-website">Leave this field empty</label>
                  <input
                    id="field-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.website}
                    onChange={set('website')}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send enquiry'}
                </button>

                <p className="muted small form-foot">
                  Prefer WhatsApp?{' '}
                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    Open WhatsApp with this message ready
                  </a>
                  . Nothing is sent until you press send in WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
