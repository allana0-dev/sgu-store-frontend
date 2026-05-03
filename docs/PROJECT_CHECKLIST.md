# SGU Store Frontend Checklist

Last updated: 2026-05-03

## Open Tasks

- [ ] Ratings filter not working reliably
  - Scope: Confirm the rating selection UI updates results correctly on desktop and mobile.
  - Done when: Selecting `5/4/3/2/1 Star` changes product results as expected.

- [ ] Configure backend-backed wishlist
  - Scope: Replace localStorage wishlist persistence with backend API integration (auth required).
  - Done when: Wishlist survives device/browser changes and is tied to the authenticated user account.

- [ ] Finish Contact Us flow
  - Scope: Ensure form validation, submission handling, success/error states, and destination (API/email) are all wired.
  - Done when: A submitted message is delivered to the intended destination with clear user feedback.

- [ ] Footer links should all navigate to valid pages
  - Scope: Audit every footer hyperlink and implement pages/routes or redirect targets for missing destinations.
  - Done when: No footer link is dead, placeholder, or non-functional.

## Notes

- Keep this file as the single source of truth for remaining launch tasks.
- Mark items complete by changing `[ ]` to `[x]` and adding the completion date.
