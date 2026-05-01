# Vendor Add Product Form — Design Spec

**Date:** 2026-04-27  
**Status:** Approved

---

## Overview

Vendor-facing form to create new products. Built with TanStack Form + Zod adapter. Requires model/schema changes before UI implementation.

---

## Scope

### In Scope
- Product model: add `brand`, `availabilityStatus`, `currency` fields
- Zod `productSchema`: extend with new fields
- New page: `src/app/vendor/products/new/page.tsx`
- Dependent category → subcategory dropdowns
- Cloudinary image upload (reuse `ImageUploader` component)
- Field-level async SKU uniqueness validation
- Submit to existing `POST /api/vendor/products`

### Out of Scope
- Variants (separate feature)
- Draft/autosave
- Image reordering (drag-and-drop)

---

## Model Changes

### `src/models/Product.ts`

Add three fields:

```ts
brand: { type: String }                          // optional
currency: { type: String, default: 'INR' }       // required
availabilityStatus: {
  type: String,
  enum: ['in_stock', 'out_of_stock', 'preorder'],
  default: 'in_stock',
  required: true,
}
```

### `src/lib/validations/index.ts`

Extend `productSchema`:

```ts
brand: z.string().optional(),
currency: z.string().default('INR'),
availabilityStatus: z.enum(['in_stock', 'out_of_stock', 'preorder']).default('in_stock'),
```

---

## API

No new endpoints needed. Existing `POST /api/vendor/products` already:
- Requires vendor auth (`requireVendor`)
- Validates against `productSchema`
- Attaches `vendor: user._id`
- Invalidates `products:list` Redis cache

---

## Form Page

**Path:** `src/app/vendor/products/new/page.tsx`  
**Auth:** Vendor only — redirect to `/vendor/dashboard` if not vendor

### Sections

| # | Section | Fields |
|---|---------|--------|
| 1 | Basic Info | `name`, `shortDescription`, `description` (textarea) |
| 2 | Pricing | `price`, `comparePrice` (optional), `currency` (select, default INR) |
| 3 | Inventory | `sku`, `stock`, `availabilityStatus` (select), `brand` (optional) |
| 4 | Category | `category` dropdown → `subcategory` dependent dropdown |
| 5 | Images | Cloudinary uploader via existing `ImageUploader` component |

### TanStack Form Setup

```ts
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { productSchema } from '@/lib/validations'

const form = useForm({
  defaultValues: { ... },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => { /* POST /api/vendor/products */ }
})
```

Field-level validation runs on blur. Async SKU check fires on blur against existing vendor products.

### Dependent Category Dropdowns

1. On mount: `GET /api/categories` → fetch all categories
2. Split into parents (`parentCategory === null`) and children (have `parentCategory`)
3. First dropdown: parent categories only
4. On parent select: filter children where `parentCategory === selected._id` → populate second dropdown
5. If no subcategories exist for selected parent: hide second dropdown

### SKU Async Validation

On SKU field blur:
- `GET /api/vendor/products` → fetch vendor's existing products
- Check if any existing product has matching `sku`
- Return field error `'SKU already in use'` if match found

### Image Upload

Reuse `ImageUploader` component. On upload success, append `{ url, publicId, alt }` to form's `images` array field. Min 1 image required (enforced by Zod schema).

---

## Data Flow

```
Mount
  → GET /api/categories (fetch all)
  → split parent/child categories

Category select
  → filter children by parentCategory
  → populate subcategory dropdown

SKU blur
  → GET /api/vendor/products
  → validate uniqueness client-side

Submit
  → TanStack Form validates all fields via Zod
  → POST /api/vendor/products { Bearer token }
  → 201 → redirect /vendor/dashboard
  → 400 → show field errors from API response
  → 500 → show generic error toast
```

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Zod field error | Show inline below field on blur |
| SKU taken | Inline error on SKU field |
| API 400 | Map `error.fieldErrors` back to form fields |
| API 500 | Toast notification via `uiStore` |
| Image upload fail | Inline error in image section |
| Categories fetch fail | Show error state, disable category dropdown |

---

## File Checklist

| File | Change |
|------|--------|
| `src/models/Product.ts` | Add `brand`, `currency`, `availabilityStatus` |
| `src/lib/validations/index.ts` | Extend `productSchema` |
| `src/app/vendor/products/new/page.tsx` | New — form page |
| `package.json` | Add `@tanstack/react-form`, `@tanstack/zod-form-adapter` |
