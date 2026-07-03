import { armKillSwitch, disarmKillSwitch } from './utils/timeoutManager.js';
import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.directoryUrls || input.directoryUrls.length === 0) {
        throw new Error('directoryUrls input is required!');
    }

    const { directoryUrls, maxLeads = 500 } = input;

    let totalLeadsExtracted = 0;

    const crawler = new CheerioCrawler({
        maxConcurrency: 5,
        maxRequestRetries: 3,
        
        async requestHandler({ request, $, log }) {
            const url = request.url;
            log.info(`Scraping Wedding Vendor Directory: ${url}`);
            
            // Check for bot block
            if ($('title').text().toLowerCase().includes('robot') || $('title').text().toLowerCase().includes('captcha')) {
                throw new Error('Blocked by security check. Retrying with new fingerprint...');
            }

            // Target Next.js data hydration for robust extraction
            const nextDataScript = $('#__NEXT_DATA__').html();
            let vendorsArray = [];

            if (nextDataScript) {
                try {
                    const nextData = JSON.parse(nextDataScript);
                    // Standard path for WedMeGood SSR data
                    const vendorResults = nextData?.props?.pageProps?.initialState?.vendorList?.data || 
                                          nextData?.props?.pageProps?.vendorData?.data || [];
                    
                    if (vendorResults && vendorResults.length > 0) {
                        vendorsArray = vendorResults;
                    }
                } catch (e) {
                    log.warning('Could not parse __NEXT_DATA__. Falling back to DOM parsing.');
                }
            }

            let leadsOnPage = 0;

            if (vendorsArray.length > 0) {
                // Parse from JSON payload
                for (const vendor of vendorsArray) {
                    if (totalLeadsExtracted >= maxLeads) break;

                    const output = {
                        vendorName: vendor.name || null,
                        category: vendor.category_name || vendor.category || null,
                        locality: vendor.city_name || vendor.city || null,
                        pricing: vendor.price_text || (vendor.price ? `₹ ${vendor.price}` : null),
                        rating: vendor.rating || null,
                        reviews: vendor.review_count ? `${vendor.review_count} reviews` : null,
                        profileUrl: vendor.slug ? `https://www.wedmegood.com/profile/${vendor.slug}` : null,
                        scrapedAt: new Date().toISOString()
                    };

                    if (output.vendorName) {
                        await pushLead(output);
                        leadsOnPage++;
                    }
                }
            } else {
                // Fallback to DOM extraction
                const vendorCards = $('.vendor-card, .vendor-item, div[data-testid="vendor-card"]').toArray();
                
                for (const card of vendorCards) {
                    if (totalLeadsExtracted >= maxLeads) break;

                    const el = $(card);
                    
                    let vendorName = el.find('.vendor-name, .vendor-detail h4, a.vendor-detail-text').text().trim() || null;
                    let category = el.find('.vendor-category, .cat-name').text().trim() || null;
                    let locality = el.find('.vendor-location, .loc-name').text().trim() || null;
                    let pricing = el.find('.vendor-price, .price-text, .package-price').text().trim() || null;
                    let rating = el.find('.vendor-rating, .star-rating, .rating-score').text().trim() || null;
                    let reviews = el.find('.vendor-reviews, .review-count').text().trim() || null;
                    
                    let profileHref = el.find('a.vendor-detail-text, a.vendor-card-link').attr('href') || null;
                    let profileUrl = profileHref ? (profileHref.startsWith('http') ? profileHref : `https://www.wedmegood.com${profileHref}`) : null;

                    if (!vendorName) continue;

                    const output = {
                        vendorName,
                        category,
                        locality,
                        pricing,
                        rating,
                        reviews,
                        profileUrl,
                        scrapedAt: new Date().toISOString()
                    };

                    await pushLead(output);
                    leadsOnPage++;
                }
            }

            log.info(`✅ Extracted ${leadsOnPage} wedding vendor leads from this page. Total so far: ${totalLeadsExtracted}`);
            
            // Pagination logic (Usually handled via query string ?page=2 or Next buttons)
            if (totalLeadsExtracted < maxLeads) {
                const nextBtn = $('a.next, a[rel="next"], li.next a').attr('href');
                if (nextBtn) {
                    let nextUrl = nextBtn.startsWith('http') ? nextBtn : new URL(nextBtn, 'https://www.wedmegood.com').href;
                    log.info(`Enqueueing next page: ${nextUrl}`);
                    await crawler.addRequests([nextUrl]);
                }
            }
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Failed to scrape ${request.url} after multiple retries.`);
        },
    });

    async function pushLead(output) {
        await Actor.pushData(output);
        totalLeadsExtracted++;
        
        // PPE Monetization - $1.50 per 1000 leads
        await Actor.charge({ eventName: 'lead-extracted', count: 1 });
    }

    log.info(`Starting Wedding Vendor Lead Finder for ${directoryUrls.length} start URLs...`);
    
    await crawler.addRequests(directoryUrls);
    armKillSwitch(crawler);
    await crawler.run();
    disarmKillSwitch();

    log.info(`🎉 Finished! Extracted ${totalLeadsExtracted} vendor leads.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
