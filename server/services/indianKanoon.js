/**
 * server/services/indianKanoon.js — Week 9 fix
 * Added: exponential backoff retry (3 attempts) + 1s delay between calls
 * so results are no longer empty due to rate-limit / timeout.
 */

const axios   = require('axios');
const cheerio = require('cheerio');

const BASE_URL    = 'https://indiankanoon.org';
const SEARCH_URL  = `${BASE_URL}/search/`;
const TIMEOUT_MS  = 10000;   // bumped from 8000
const MAX_RESULTS = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1200;    // ms between retry attempts

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml',
  'Accept-Language': 'en-IN,en;q=0.9',
  'Referer':         BASE_URL,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, params, attempt = 1) {
  try {
    const { data: html } = await axios.get(url, {
      params,
      headers: HEADERS,
      timeout: TIMEOUT_MS,
    });
    return html;
  } catch (err) {
    const isRetryable =
      err.code === 'ECONNABORTED' ||            // timeout
      err.code === 'ECONNRESET' ||
      (err.response?.status >= 500) ||          // server error
      err.response?.status === 429;             // rate-limited

    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY * attempt;      // 1.2s, 2.4s, 3.6s
      console.warn(`[IndianKanoon] retry ${attempt}/${MAX_RETRIES} after ${delay}ms — ${err.message}`);
      await sleep(delay);
      return fetchWithRetry(url, params, attempt + 1);
    }
    throw err;
  }
}

// ── Main scraper ──────────────────────────────────────────────────────────────
const searchIndianKanoon = async (keyword) => {
  try {
    const html = await fetchWithRetry(SEARCH_URL, { formInput: keyword, pagenum: 0 });

    const $       = cheerio.load(html);
    const results = [];

    $('.result').each((i, el) => {
      if (results.length >= MAX_RESULTS) return false;
      const $el = $(el);

      const $titleLink = $el.find('.result_title a').first();
      const title      = $titleLink.text().trim();
      const href       = $titleLink.attr('href');
      const url        = href ? `${BASE_URL}${href}` : null;
      if (!title || !url) return;

      const meta      = $el.find('.docsource_main').text().trim();
      const dateMatch = meta.match(/(\d{1,2}\s+\w+,?\s+\d{4})/);
      const date      = dateMatch ? dateMatch[1] : null;
      const court     = dateMatch
        ? meta.replace(dateMatch[0], '').replace(/[,\s]+$/, '').trim()
        : meta;
      const snippet   = $el.find('.snippet').text().replace(/\s+/g, ' ').trim().slice(0, 300);

      results.push({ title, court, date, snippet, url });
    });

    return results;
  } catch (err) {
    console.error('[IndianKanoon] scrape error after retries:', err.message);
    return [];
  }
};

// ── Keyword builder (unchanged) ───────────────────────────────────────────────
const buildKanoonKeyword = (userQuery, bnsCitations = []) => {
  const sectionRefs  = bnsCitations.slice(0, 2).map((c) => c.section).join(' ');
  const trimmedQuery = userQuery.slice(0, 60).replace(/[?!।]/g, '').trim();
  return sectionRefs ? `${trimmedQuery} ${sectionRefs}` : trimmedQuery;
};

module.exports = { searchIndianKanoon, buildKanoonKeyword };
