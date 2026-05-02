# SGU Campus Store App Overview

This document captures the full product direction shared for the SGU ecommerce project.

## Project Vision

Build a centralized, SGU-branded campus ecommerce platform that combines campus retail into one digital store experience.

- Institution: `St. George's University`
- Location: `Grenada, West Indies`
- Brand voice: friendly, direct, confident, community-driven
- Core goal: make campus purchasing fast, accessible, and reliable on mobile, tablet, and desktop

## Problem Being Solved

Current campus purchasing often requires physically visiting stores to check availability. This app solves that by giving users one place to:

- Browse products with clear organization
- See inventory/availability
- Buy online with secure checkout flow
- Choose convenient fulfillment options

## Target Users

- Students (primary)
- Faculty and staff
- Campus retail operators and administrators

## Product Model

Unified-store model (single storefront), with filtering and browsing by:

- Vendor
- Category
- Product type

This supports the "one campus store experience" while still representing different retail units.

## Core Functional Scope

### Shopper Experience

- Home page and product discovery
- Store browsing and category exploration
- Product detail and cart flow
- Account access
- Search
- Contact/Support entry point

### Fulfillment and Service

- Pickup option
- Delivery option
- Account signup flow

### Operations/Admin (planned)

- Inventory visibility and stock awareness
- Sales and reporting support
- Operational dashboards and oversight

## Brand and UX Requirements

The app must stay aligned to SGU brand standards across UI, messaging, and interaction behavior.

- Use official SGU logo assets only (no edits/recolor/distortion)
- SGU color system with navy as dominant color
- Montserrat as the only font family
- Accessible contrast and clear focus states
- Mobile-first responsive behavior

Primary implementation rules are maintained in:

- `docs/SGU_BRAND_GUIDELINES.md`

## Navigation and Layout Direction

Current IA direction:

- Primary nav: `Home`, `Store`, `Categories`, `Contact Us`
- Action nav: `Search`, `Cart`, `Account`
- Logo click returns to Home
- Header behavior: fixed smart header (hides on downward scroll, returns on stop/upward scroll)
- Footer: 4-column structure (`Campus`, `Categories`, `Services`, `Help`) plus accepted payment methods and official SGU social links

## Business Context (From Proposal Direction)

- Primary operating model: campus retail direct to users through one web platform
- Institutional alignment: SGU-focused deployment with potential future expansion
- Platform intent: improve accessibility, convenience, and campus retail efficiency

## Phased Build Approach

Development follows iterative phases:

1. Brand foundation and design tokens
2. Shared layout and navigation shell
3. Page-by-page UI implementation and feature buildout
4. Enhanced store functionality (filtering, product flows, operations support)

