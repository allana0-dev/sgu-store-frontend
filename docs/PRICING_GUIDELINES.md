# Pricing and Discount Guidelines

This document defines the UI and data model standards for pricing across the SGU Campus Store.

## Pricing States

The UI must support four distinct pricing states to ensure clarity and professional retail behavior.

### 1. Standard Price State (Default)
Most of the time, products show their current active price without extra decoration.
- **Required Fields**: Product name, Current price, Stock status, Pickup/delivery note.
- **Example**: 
  - Anatomy Textbook
  - USD 10.00
  - In stock

### 2. Price Updated (No Discount)
If a price increases or decreases due to cost changes, supplier updates, or policy, the UI shows **only the current active price**.
- **Rule**: Do NOT show a strikethrough of the old price. This is a pricing update, not a promotion.
- **Example**: 
  - Show USD 20.00 (previously 10.00)
  - No strikethrough.

### 3. Discount State (Promotional)
Used only during active sales or marketing campaigns.
- **Visuals**: Original price struck through, Discounted price emphasized, Optional "Sale" or "X% Off" badge.
- **Example**:
  - ~~USD 20.00~~
  - **USD 15.00**
  - [Sale]

### 4. Special Pricing (Future)
Reserved for program-based or role-based pricing (e.g., faculty discounts).
- **Show**: Standard price, Special price label, Eligibility note.

## Data Model (Technical Specification)

Design pricing as a flexible object to support these states without hardcoding logic into every component.

```typescript
type ProductPricing = {
  currency: "USD" | "XCD";
  basePrice: number;          // current normal price
  salePrice?: number | null;  // only present if on promotion
  compareAtPrice?: number | null; // original price for discount display
  priceLabel?: string | null; // e.g. "Sale", "Limited Offer"
};
```

### Rendering Logic
```typescript
if (salePrice && compareAtPrice && salePrice < compareAtPrice) {
  // Show Discount UI (Strikethrough + Bold + Badge)
} else {
  // Show Standard UI (Current/Base Price only)
}
```

## UI & UX Rules

### Product Cards
- **Default Card**: Image, title, current price, stock, quick action.
- **Discount Card**: Image, title, old price crossed out, discounted price bold, badge.
- **No "Fake" Sales**: Do not use red "sale" colors or strikethroughs unless there is an actual active promotion.

### Homepage Sections
The homepage must be **promotion-capable but not promotion-dependent**.
- **Always Visible**: Hero, Categories, Popular on Campus, Featured Products, Services, Recently Added.
- **Conditional (Only when active)**: Promotional banners, Sale sections, Discount badges.

## Visual Patterns summary
- **Regular**: `USD 10.00`
- **Updated (Not Discounted)**: `USD 20.00`
- **Discounted**: `~~USD 20.00~~` **USD 15.00** [Sale]
