<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- BEGIN:pricing-rules -->

# Pricing UI & Data Model Rules

Follow these rules for all pricing implementations:

1. **Flexible Data Model**: Use a pricing object (currency, basePrice, salePrice, compareAtPrice).
2. **Three States**:
   - **Regular**: Show only current price.
   - **Updated (No Discount)**: Show only current price (no strikethrough).
   - **Discounted**: Show compare-at price (struck through) and sale price (bold) + optional badge.
3. **Smart UI**: The site must look complete without discounts. Only use "Sale" styling (red colors/strikethroughs) for active promotions.
<!-- END:pricing-rules -->
