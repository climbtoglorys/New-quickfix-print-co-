import { Link } from '../lib/router';
import {
  BUSINESS,
  CATEGORIES,
  GENERAL_MESSAGE,
  whatsappLink,
} from '../lib/core';
import { ContactBand, useMeta } from '../components/Layout';
import { MessageCircle, Phone } from 'lucide-react';

export function About() {
  useMeta(
    'About Us | Quickfix Print & Co',
    'Quickfix Print & Co is a printing equipment and consumables business in Area 10, Garki, Abuja.'
  );
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>About Us</h1>
          <p>Printing equipment and supplies from Area 10, Garki, Abuja.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div className="prose">
            <h2>Quickfix Print &amp; Co</h2>
            <p>
              Quickfix Print &amp; Co is a printing equipment and consumables
              business located in Area 10, Garki, Abuja. The business deals in
              Konica Minolta printing equipment, toners, consumables, and
              related supplies. Customers can contact the team to ask about
              products, pricing, availability, and compatibility.
            </p>
            <h3>Product areas</h3>
            <ul className="check-list">
              {CATEGORIES.map(c => (
                <li key={c.value}>
                  <Link to={`products?category=${c.value}`}>{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <aside className="fact-card" aria-label="Business details">
            <h3>Business details</h3>
            <dl>
              <dt>Business name</dt>
              <dd>{BUSINESS.name}</dd>
              <dt>Registration number</dt>
              <dd>{BUSINESS.registration}</dd>
              <dt>Location</dt>
              <dd>{BUSINESS.address}</dd>
              <dt>Telephone</dt>
              <dd>
                {BUSINESS.phones.map(p => (
                  <a key={p.tel} href={`tel:${p.tel}`} className="block-link">
                    {p.display}
                  </a>
                ))}
              </dd>
            </dl>
          </aside>
        </div>
      </section>
      <ContactBand />
    </>
  );
}

const SERVICES = [
  {
    title: 'Printing equipment enquiries',
    text: 'Ask about printing machines and multifunction photocopiers, including price and availability.',
  },
  {
    title: 'Toner and consumables enquiries',
    text: 'Ask about toner cartridges and printing consumables for your machine.',
  },
  {
    title: 'Printer parts and accessories enquiries',
    text: 'Ask about printer spare parts, accessories, and components.',
  },
  {
    title: 'Help identifying a product',
    text: 'Tell us your printer model and we will help you enquire about the right product. Compatibility is confirmed by the business before you buy.',
  },
];

export function Services() {
  useMeta(
    'Services | Quickfix Print & Co',
    'Enquire about printing equipment, toners, consumables, and printer parts from Quickfix Print & Co in Abuja.'
  );
  const wa = whatsappLink(GENERAL_MESSAGE);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Services</h1>
          <p>
            The product areas we handle and the enquiries we can help you with.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ul className="grid grid-2">
            {SERVICES.map(s => (
              <li key={s.title} className="service-card">
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
          <div className="cta-card">
            <h2>Not sure which part or toner you need?</h2>
            <p>
              Contact us with your printer model and we will help you enquire
              about the right product.
            </p>
            <div className="cta-actions">
              <a
                className="btn btn-wa"
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} aria-hidden="true" /> Enquire on
                WhatsApp
              </a>
              <a
                className="btn btn-navy"
                href={`tel:${BUSINESS.phones[0].tel}`}
              >
                <Phone size={18} aria-hidden="true" /> Call{' '}
                {BUSINESS.phones[0].display}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Privacy() {
  useMeta(
    'Privacy Policy | Quickfix Print & Co',
    'How Quickfix Print & Co handles information submitted through its website enquiry form.'
  );
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>Last updated: October 2026</p>
        </div>
      </section>
      <section className="section">
        <div className="container prose prose-narrow">
          <h2>What we collect</h2>
          <p>
            If you use the enquiry form on the Contact page, we collect the
            details you type in: your name, telephone number, message, and, if
            you choose to give them, your email address, enquiry category, and a
            product or model reference.
          </p>
          <h2>Why we collect it</h2>
          <p>
            We use these details only to read and respond to your enquiry about
            products, pricing, availability, or compatibility.
          </p>
          <h2>How it is stored and who can see it</h2>
          <p>
            Enquiries are saved in a database provided by Supabase. Only
            authorised Quickfix Print &amp; Co staff who sign in to the admin
            area can read them. We do not publish enquiries, and we do not sell
            them.
          </p>
          <h2>WhatsApp and telephone</h2>
          <p>
            If you choose to contact us through WhatsApp or by telephone, that
            communication is handled by WhatsApp or your telephone provider
            under their own terms. Nothing is sent to WhatsApp until you press
            send in the WhatsApp app yourself.
          </p>
          <h2>Cookies and tracking</h2>
          <p>
            This website does not use advertising or analytics cookies. Signing
            in to the staff area stores a sign-in session in the browser of the
            staff member who signs in.
          </p>
          <h2>Your questions and requests</h2>
          <p>
            To ask about, correct, or request deletion of an enquiry you sent
            us, contact us on{' '}
            {BUSINESS.phones.map((p, i) => (
              <span key={p.tel}>
                {i > 0 && ' or '}
                <a href={`tel:${p.tel}`}>{p.display}</a>
              </span>
            ))}
            , or visit us at {BUSINESS.address}.
          </p>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  useMeta(
    'Page not found | Quickfix Print & Co',
    'The page you are looking for could not be found.'
  );
  return (
    <section className="section">
      <div className="container prose">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link to="" className="btn btn-primary">
          Go to the home page
        </Link>
      </div>
    </section>
  );
}
