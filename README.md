# Wedding Vendor Lead Finder

**Extract highly targeted B2B lead profiles of wedding photographers, makeup artists, decorators, and venues from major wedding directories like WedMeGood.**

The wedding industry is a massive, high-spending market. Event planners, marketing agencies, and local B2B vendors are constantly looking to build partnerships with high-quality wedding professionals. This actor automates the extraction of these leads from top wedding directories.

## What can this Actor do?

- ✅ **Vendor Details** - Extracts the name of the vendor and their specific category (e.g., "Bridal Makeup", "Wedding Photographer").
- ✅ **Location Data** - Grabs the city or specific neighborhood where the vendor operates.
- ✅ **Reputation** - Extracts the vendor's overall star rating and total number of reviews.
- ✅ **Pricing** - Extracts the standard pricing package advertised on their card (e.g., "₹50,000 per day" or "₹1,500 per plate").
- ✅ **High Speed** - Bypasses bot protections using advanced TLS fingerprinting (`got-scraping`).

## Why use this Actor?

- 🎯 **Event Planners** - Rapidly build a database of local vendors to partner with for upcoming weddings.
- 🤝 **B2B Marketing** - Sell your photography editing software, CRM tools, or wholesale supplies directly to active vendors.
- 📊 **Market Analysis** - Analyze standard pricing models for specific services in different cities.

## How to use it

1. Go to WedMeGood (or a supported directory) and navigate to the specific vendor category in your target city (e.g., "Wedding Photographers in Delhi NCR").
2. Copy the URL from your browser (e.g., `https://www.wedmegood.com/vendors/delhi-ncr/wedding-photographers/`) and paste it into the **Directory URLs** field.
3. Set the **Max Leads to Extract** limit (default is 500).
4. Click Start!

## How much does it cost?

This actor uses a **Pay-Per-Event (PPE)** pricing model. You only pay for the exact number of leads successfully extracted!
- **$1.50 per 1,000 vendor leads extracted.**

## Output Example

When a vendor lead is extracted, the actor pushes this data to your dataset:

```json
{
  "vendorName": "Studio Kelly Photography",
  "category": "Wedding Photographers",
  "locality": "Delhi NCR",
  "pricing": "₹ 80,000 per day",
  "rating": "4.9",
  "reviews": "142 reviews",
  "profileUrl": "https://www.wedmegood.com/profile/Studio-Kelly-Photography-12345",
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```
