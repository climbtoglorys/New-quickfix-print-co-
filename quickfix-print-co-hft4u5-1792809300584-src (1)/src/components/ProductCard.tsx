import type { MouseEvent } from 'react';
import { Link } from '../lib/router';
import {
  availabilityLabel,
  categoryLabel,
  priceLabel,
  productMessage,
  whatsappLink,
  type Availability,
  type Product,
} from '../lib/core';
import { ProductImage } from './art';
import { MessageCircle } from 'lucide-react';

export function AvailabilityBadge({ value }: { value: Availability }) {
  return (
    <span className={`badge badge-${value}`}>{availabilityLabel(value)}</span>
  );
}

export function ProductCard({
  product,
  preview = false,
}: {
  product: Product;
  preview?: boolean;
}) {
  const href = `/products/${product.slug}`;
  const wa = whatsappLink(productMessage(product.name, product.model_code));
  const guard = (e: MouseEvent) => {
    if (preview) e.preventDefault();
  };

  return (
    <article className="product-card">
      <Link
        to={href}
        className="product-media"
        tabIndex={-1}
        aria-hidden="true"
        onClick={guard}
      >
        <ProductImage
          src={product.image_url}
          name={product.name}
          category={product.category}
        />
      </Link>
      <div className="product-body">
        {product.is_demo && (
          <span className="badge badge-sample">
            Sample listing \u2014 confirm with Quickfix
          </span>
        )}
        <p className="product-cat">{categoryLabel(product.category)}</p>
        <h3 className="product-name">
          <Link to={href} onClick={guard}>
            {product.name}
          </Link>
        </h3>
        {product.model_code && (
          <p className="product-code">Model / code: {product.model_code}</p>
        )}
        {product.short_description && (
          <p className="product-desc">{product.short_description}</p>
        )}
        <p className="product-price">{priceLabel(product)}</p>
        <AvailabilityBadge value={product.availability} />
        <div className="product-actions">
          <Link to={href} className="btn btn-navy btn-sm" onClick={guard}>
            View Details
          </Link>
          <a
            className="btn btn-wa btn-sm"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={guard}
          >
            <MessageCircle size={16} aria-hidden="true" /> Enquire on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
