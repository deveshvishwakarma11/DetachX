// ──────────────────────────────────────────────────────────────────────────────
// DetachX — Deletion Assistance Module
//
// Provides deletion/privacy URLs for discovered services so users can easily
// close or clean up accounts they no longer need.
//
// Data sources:
//   1. STATIC_LOOKUP — in-memory map for instant client-side results
//   2. Supabase "service_deletion_info" table — for server-side fallback
//
// Architecture:
//   - Static map covers 100+ popular services' deletion URLs
//   - Supabase table covers curated additions without app redeployment
//   - Static map is used first (no network), Supabase is fallback
// ──────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC DELETION INFO LOOKUP
//
// Each entry:
//   homepage          — the service's main website
//   privacyPolicyUrl  — link to privacy policy
//   deletionUrl       — direct link to delete account page (if known)
//   supportUrl        — general support / help page (if deletionUrl unknown)
//   category          — service category for grouping
//
// Sources typically come from:
//   - JustDelete.me (community-curated deletion links)
//   - Each service's privacy settings documentation
//   - Note: Some links may change — the UI says "official link" not "guaranteed"
// ═══════════════════════════════════════════════════════════════════════════════

const DELETION_INFO = {
  // ── Developer Tools ────────────────────────────────────────────────────────
  "github.com": {
    homepage: "https://github.com",
    privacyPolicyUrl: "https://docs.github.com/en/site-policy/privacy-policies",
    deletionUrl: "https://github.com/settings/admin",
    supportUrl: "https://support.github.com",
    category: "Developer Tools",
  },
  "gitlab.com": {
    homepage: "https://gitlab.com",
    privacyPolicyUrl: "https://about.gitlab.com/privacy",
    deletionUrl: "https://gitlab.com/-/profile/account/delete_account",
    supportUrl: "https://about.gitlab.com/support",
    category: "Developer Tools",
  },
  "figma.com": {
    homepage: "https://figma.com",
    privacyPolicyUrl: "https://www.figma.com/privacy",
    deletionUrl: "https://www.figma.com/settings",
    supportUrl: "https://help.figma.com",
    category: "Developer Tools",
  },
  "vercel.com": {
    homepage: "https://vercel.com",
    privacyPolicyUrl: "https://vercel.com/legal/privacy-policy",
    deletionUrl: "https://vercel.com/account",
    supportUrl: "https://vercel.com/help",
    category: "Developer Tools",
  },
  "netlify.com": {
    homepage: "https://netlify.com",
    privacyPolicyUrl: "https://www.netlify.com/privacy",
    deletionUrl: "https://app.netlify.com/user/settings#delete-account",
    supportUrl: "https://answers.netlify.com",
    category: "Developer Tools",
  },
  "render.com": {
    homepage: "https://render.com",
    privacyPolicyUrl: "https://render.com/privacy",
    deletionUrl: "https://dashboard.render.com/settings",
    supportUrl: "https://render.com/docs",
    category: "Developer Tools",
  },
  "digitalocean.com": {
    homepage: "https://digitalocean.com",
    privacyPolicyUrl: "https://www.digitalocean.com/legal/privacy-policy",
    deletionUrl: "https://cloud.digitalocean.com/account/settings",
    supportUrl: "https://www.digitalocean.com/support",
    category: "Developer Tools",
  },
  "mongodb.com": {
    homepage: "https://mongodb.com",
    privacyPolicyUrl: "https://www.mongodb.com/legal/privacy-policy",
    deletionUrl: "https://account.mongodb.com/account/manage",
    supportUrl: "https://support.mongodb.com",
    category: "Developer Tools",
  },
  "supabase.com": {
    homepage: "https://supabase.com",
    privacyPolicyUrl: "https://supabase.com/privacy",
    deletionUrl: "https://supabase.com/dashboard/account/settings",
    supportUrl: "https://supabase.com/docs/support",
    category: "Developer Tools",
  },
  "sentry.io": {
    homepage: "https://sentry.io",
    privacyPolicyUrl: "https://sentry.io/privacy",
    deletionUrl: "https://sentry.io/settings/account/",
    supportUrl: "https://sentry.io/answers",
    category: "Developer Tools",
  },
  "docker.com": {
    homepage: "https://docker.com",
    privacyPolicyUrl: "https://www.docker.com/legal/privacy-policy",
    deletionUrl: "https://hub.docker.com/settings/delete-account",
    supportUrl: "https://www.docker.com/support",
    category: "Developer Tools",
  },
  "atlassian.com": {
    homepage: "https://atlassian.com",
    privacyPolicyUrl: "https://www.atlassian.com/legal/privacy-policy",
    deletionUrl: "https://id.atlassian.com/manage/profile/delete-account",
    supportUrl: "https://support.atlassian.com",
    category: "Developer Tools",
  },
  "postman.com": {
    homepage: "https://postman.com",
    privacyPolicyUrl: "https://www.postman.com/legal/privacy-policy",
    deletionUrl: "https://identity.getpostman.com/account/delete",
    supportUrl: "https://www.postman.com/support",
    category: "Developer Tools",
  },
  "heroku.com": {
    homepage: "https://heroku.com",
    privacyPolicyUrl: "https://www.salesforce.com/company/privacy",
    deletionUrl: "https://dashboard.heroku.com/account",
    supportUrl: "https://help.heroku.com",
    category: "Developer Tools",
  },
  "cloudflare.com": {
    homepage: "https://cloudflare.com",
    privacyPolicyUrl: "https://www.cloudflare.com/privacypolicy",
    deletionUrl: "https://dash.cloudflare.com/profile/delete",
    supportUrl: "https://support.cloudflare.com",
    category: "Developer Tools",
  },
  "replit.com": {
    homepage: "https://replit.com",
    privacyPolicyUrl: "https://replit.com/privacy",
    deletionUrl: "https://replit.com/account#deletion",
    supportUrl: "https://docs.replit.com",
    category: "Developer Tools",
  },
  "hackerrank.com": {
    homepage: "https://hackerrank.com",
    privacyPolicyUrl: "https://www.hackerrank.com/privacy",
    deletionUrl: "https://www.hackerrank.com/settings/account",
    supportUrl: "https://www.hackerrank.com/support",
    category: "Developer Tools",
  },
  "leetcode.com": {
    homepage: "https://leetcode.com",
    privacyPolicyUrl: "https://leetcode.com/privacy",
    deletionUrl: "https://leetcode.com/settings/delete_account",
    supportUrl: "https://support.leetcode.com",
    category: "Developer Tools",
  },
  "npmjs.com": {
    homepage: "https://npmjs.com",
    privacyPolicyUrl: "https://docs.npmjs.com/policies/privacy",
    deletionUrl: "https://www.npmjs.com/settings/profile",
    supportUrl: "https://npmjs.com/support",
    category: "Developer Tools",
  },

  // ── Cloud Services ─────────────────────────────────────────────────────────
  "google.com": {
    homepage: "https://google.com",
    privacyPolicyUrl: "https://policies.google.com/privacy",
    deletionUrl: "https://myaccount.google.com/deleteaccount",
    supportUrl: "https://support.google.com",
    category: "Cloud Services",
  },
  "microsoft.com": {
    homepage: "https://microsoft.com",
    privacyPolicyUrl: "https://privacy.microsoft.com",
    deletionUrl: "https://account.microsoft.com/account/close-account",
    supportUrl: "https://support.microsoft.com",
    category: "Cloud Services",
  },
  "apple.com": {
    homepage: "https://apple.com",
    privacyPolicyUrl: "https://www.apple.com/legal/privacy",
    deletionUrl: "https://privacy.apple.com/",
    supportUrl: "https://support.apple.com",
    category: "Cloud Services",
  },
  "dropbox.com": {
    homepage: "https://dropbox.com",
    privacyPolicyUrl: "https://www.dropbox.com/privacy",
    deletionUrl: "https://www.dropbox.com/account/delete",
    supportUrl: "https://help.dropbox.com",
    category: "Cloud Services",
  },
  "aws.amazon.com": {
    homepage: "https://aws.amazon.com",
    privacyPolicyUrl: "https://aws.amazon.com/privacy",
    deletionUrl: "https://portal.aws.amazon.com/gov/cloudfront/closeAccount",
    supportUrl: "https://aws.amazon.com/contact-us",
    category: "Cloud Services",
  },

  // ── Social Media ───────────────────────────────────────────────────────────
  "twitter.com": {
    homepage: "https://twitter.com",
    privacyPolicyUrl: "https://twitter.com/privacy",
    deletionUrl: "https://twitter.com/settings/deactivate",
    supportUrl: "https://help.twitter.com",
    category: "Social Media",
  },
  "x.com": {
    homepage: "https://x.com",
    privacyPolicyUrl: "https://x.com/privacy",
    deletionUrl: "https://x.com/settings/deactivate",
    supportUrl: "https://help.x.com",
    category: "Social Media",
  },
  "facebook.com": {
    homepage: "https://facebook.com",
    privacyPolicyUrl: "https://www.facebook.com/privacy",
    deletionUrl: "https://www.facebook.com/settings?tab=account&section=deactivation",
    supportUrl: "https://www.facebook.com/help",
    category: "Social Media",
  },
  "instagram.com": {
    homepage: "https://instagram.com",
    privacyPolicyUrl: "https://privacycenter.instagram.com/policy",
    deletionUrl: "https://www.instagram.com/accounts/remove/request/permanent/",
    supportUrl: "https://help.instagram.com",
    category: "Social Media",
  },
  "linkedin.com": {
    homepage: "https://linkedin.com",
    privacyPolicyUrl: "https://www.linkedin.com/legal/privacy-policy",
    deletionUrl: "https://www.linkedin.com/psettings/close-account",
    supportUrl: "https://www.linkedin.com/help",
    category: "Social Media",
  },
  "reddit.com": {
    homepage: "https://reddit.com",
    privacyPolicyUrl: "https://www.reddit.com/policies/privacy",
    deletionUrl: "https://www.reddit.com/settings/account",
    supportUrl: "https://www.reddithelp.com",
    category: "Social Media",
  },
  "medium.com": {
    homepage: "https://medium.com",
    privacyPolicyUrl: "https://policy.medium.com",
    deletionUrl: "https://medium.com/me/settings/account",
    supportUrl: "https://help.medium.com",
    category: "Social Media",
  },
  "tiktok.com": {
    homepage: "https://tiktok.com",
    privacyPolicyUrl: "https://www.tiktok.com/legal/privacy-policy",
    deletionUrl: "https://www.tiktok.com/settings/account/privacy-and-settings",
    supportUrl: "https://support.tiktok.com",
    category: "Social Media",
  },
  "snapchat.com": {
    homepage: "https://snapchat.com",
    privacyPolicyUrl: "https://www.snapchat.com/privacy",
    deletionUrl: "https://accounts.snapchat.com/accounts/delete_account",
    supportUrl: "https://help.snapchat.com",
    category: "Social Media",
  },
  "pinterest.com": {
    homepage: "https://pinterest.com",
    privacyPolicyUrl: "https://policy.pinterest.com/privacy-policy",
    deletionUrl: "https://www.pinterest.com/settings/account/deactivate",
    supportUrl: "https://help.pinterest.com",
    category: "Social Media",
  },

  // ── Shopping ───────────────────────────────────────────────────────────────
  "amazon.com": {
    homepage: "https://amazon.com",
    privacyPolicyUrl: "https://www.amazon.com/privacy",
    deletionUrl: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GNGV9WHPV9UDXFUF",
    supportUrl: "https://www.amazon.com/contact-us",
    category: "Shopping",
  },
  "flipkart.com": {
    homepage: "https://flipkart.com",
    privacyPolicyUrl: "https://www.flipkart.com/pages/privacypolicy",
    deletionUrl: "https://www.flipkart.com/account/delete",
    supportUrl: "https://www.flipkart.com/help",
    category: "Shopping",
  },
  "shopify.com": {
    homepage: "https://shopify.com",
    privacyPolicyUrl: "https://www.shopify.com/legal/privacy",
    deletionUrl: "https://accounts.shopify.com/delete",
    supportUrl: "https://help.shopify.com",
    category: "Shopping",
  },
  "ebay.com": {
    homepage: "https://ebay.com",
    privacyPolicyUrl: "https://www.ebay.com/privacy",
    deletionUrl: "https://www.ebay.com/clt/accountdelete",
    supportUrl: "https://www.ebay.com/help",
    category: "Shopping",
  },
  "etsy.com": {
    homepage: "https://etsy.com",
    privacyPolicyUrl: "https://www.etsy.com/legal/privacy",
    deletionUrl: "https://www.etsy.com/your/account/settings/close",
    supportUrl: "https://help.etsy.com",
    category: "Shopping",
  },
  "walmart.com": {
    homepage: "https://walmart.com",
    privacyPolicyUrl: "https://corporate.walmart.com/privacy-security",
    deletionUrl: "https://www.walmart.com/account/delete",
    supportUrl: "https://help.walmart.com",
    category: "Shopping",
  },
  "target.com": {
    homepage: "https://target.com",
    privacyPolicyUrl: "https://www.target.com/c/target-privacy-policy",
    deletionUrl: "https://www.target.com/account-settings",
    supportUrl: "https://help.target.com",
    category: "Shopping",
  },
  "bestbuy.com": {
    homepage: "https://bestbuy.com",
    privacyPolicyUrl: "https://www.bestbuy.com/privacy",
    deletionUrl: "https://www.bestbuy.com/account/delete",
    supportUrl: "https://www.bestbuy.com/support",
    category: "Shopping",
  },

  // ── Finance ────────────────────────────────────────────────────────────────
  "paypal.com": {
    homepage: "https://paypal.com",
    privacyPolicyUrl: "https://www.paypal.com/privacy",
    deletionUrl: "https://www.paypal.com/myaccount/settings/close-account",
    supportUrl: "https://www.paypal.com/support",
    category: "Finance",
  },
  "stripe.com": {
    homepage: "https://stripe.com",
    privacyPolicyUrl: "https://stripe.com/privacy",
    deletionUrl: "https://dashboard.stripe.com/settings/close-account",
    supportUrl: "https://support.stripe.com",
    category: "Finance",
  },
  "coinbase.com": {
    homepage: "https://coinbase.com",
    privacyPolicyUrl: "https://www.coinbase.com/legal/privacy",
    deletionUrl: "https://www.coinbase.com/settings/close-account",
    supportUrl: "https://help.coinbase.com",
    category: "Finance",
  },
  "binance.com": {
    homepage: "https://binance.com",
    privacyPolicyUrl: "https://www.binance.com/en/privacy",
    deletionUrl: "https://www.binance.com/en/support/faq/how-to-close-my-binance-account",
    supportUrl: "https://www.binance.com/en/support",
    category: "Finance",
  },

  // ── Productivity ───────────────────────────────────────────────────────────
  "notion.so": {
    homepage: "https://notion.so",
    privacyPolicyUrl: "https://www.notion.so/privacy",
    deletionUrl: "https://www.notion.so/settings/delete-account",
    supportUrl: "https://www.notion.so/help",
    category: "Productivity",
  },
  "canva.com": {
    homepage: "https://canva.com",
    privacyPolicyUrl: "https://www.canva.com/policies/privacy",
    deletionUrl: "https://www.canva.com/account/delete",
    supportUrl: "https://www.canva.com/help",
    category: "Productivity",
  },
  "slack.com": {
    homepage: "https://slack.com",
    privacyPolicyUrl: "https://slack.com/privacy-policy",
    deletionUrl: "https://slack.com/settings/delete-account",
    supportUrl: "https://slack.com/help",
    category: "Productivity",
  },
  "zoom.us": {
    homepage: "https://zoom.us",
    privacyPolicyUrl: "https://zoom.us/privacy",
    deletionUrl: "https://zoom.us/account/close-account",
    supportUrl: "https://support.zoom.us",
    category: "Productivity",
  },
  "trello.com": {
    homepage: "https://trello.com",
    privacyPolicyUrl: "https://trello.com/privacy",
    deletionUrl: "https://trello.com/deactivate",
    supportUrl: "https://trello.com/help",
    category: "Productivity",
  },
  "asana.com": {
    homepage: "https://asana.com",
    privacyPolicyUrl: "https://asana.com/privacy",
    deletionUrl: "https://app.asana.com/0/account/delete",
    supportUrl: "https://asana.com/support",
    category: "Productivity",
  },
  "miro.com": {
    homepage: "https://miro.com",
    privacyPolicyUrl: "https://miro.com/privacy",
    deletionUrl: "https://miro.com/app/settings/account/delete",
    supportUrl: "https://help.miro.com",
    category: "Productivity",
  },
  "calendly.com": {
    homepage: "https://calendly.com",
    privacyPolicyUrl: "https://calendly.com/privacy",
    deletionUrl: "https://calendly.com/app/settings/account/close",
    supportUrl: "https://help.calendly.com",
    category: "Productivity",
  },
  "adobe.com": {
    homepage: "https://adobe.com",
    privacyPolicyUrl: "https://www.adobe.com/privacy",
    deletionUrl: "https://account.adobe.com/delete-account",
    supportUrl: "https://helpx.adobe.com/contact",
    category: "Productivity",
  },

  // ── Entertainment ──────────────────────────────────────────────────────────
  "netflix.com": {
    homepage: "https://netflix.com",
    privacyPolicyUrl: "https://help.netflix.com/legal/privacy",
    deletionUrl: "https://www.netflix.com/account/closeaccount",
    supportUrl: "https://help.netflix.com",
    category: "Entertainment",
  },
  "spotify.com": {
    homepage: "https://spotify.com",
    privacyPolicyUrl: "https://www.spotify.com/privacy",
    deletionUrl: "https://www.spotify.com/account/close-account/",
    supportUrl: "https://support.spotify.com",
    category: "Entertainment",
  },
  "youtube.com": {
    homepage: "https://youtube.com",
    privacyPolicyUrl: "https://policies.google.com/privacy",
    deletionUrl: "https://www.youtube.com/account_advanced",
    supportUrl: "https://support.google.com/youtube",
    category: "Entertainment",
  },
  "hulu.com": {
    homepage: "https://hulu.com",
    privacyPolicyUrl: "https://www.hulu.com/privacy",
    deletionUrl: "https://www.hulu.com/account/close",
    supportUrl: "https://help.hulu.com",
    category: "Entertainment",
  },
  "disneyplus.com": {
    homepage: "https://disneyplus.com",
    privacyPolicyUrl: "https://disneyplus.com/legal/privacy-policy",
    deletionUrl: "https://www.disneyplus.com/account/cancel-subscription",
    supportUrl: "https://help.disneyplus.com",
    category: "Entertainment",
  },
  "primevideo.com": {
    homepage: "https://primevideo.com",
    privacyPolicyUrl: "https://www.amazon.com/privacy",
    deletionUrl: "https://www.amazon.com/mc/contact-us/privacy-settings",
    supportUrl: "https://www.amazon.com/help",
    category: "Entertainment",
  },

  // ── AI Tools ───────────────────────────────────────────────────────────────
  "openai.com": {
    homepage: "https://openai.com",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy",
    deletionUrl: "https://platform.openai.com/account/deletion",
    supportUrl: "https://help.openai.com",
    category: "AI Tools",
  },
  "chatgpt.com": {
    homepage: "https://chatgpt.com",
    privacyPolicyUrl: "https://openai.com/policies/privacy-policy",
    deletionUrl: "https://chatgpt.com/account/deletion",
    supportUrl: "https://help.openai.com",
    category: "AI Tools",
  },
  "anthropic.com": {
    homepage: "https://anthropic.com",
    privacyPolicyUrl: "https://www.anthropic.com/privacy",
    deletionUrl: "https://claude.ai/account",
    supportUrl: "https://support.anthropic.com",
    category: "AI Tools",
  },
  "perplexity.ai": {
    homepage: "https://perplexity.ai",
    privacyPolicyUrl: "https://www.perplexity.ai/privacy",
    deletionUrl: "https://www.perplexity.ai/settings/account",
    supportUrl: "https://www.perplexity.ai/support",
    category: "AI Tools",
  },
  "midjourney.com": {
    homepage: "https://midjourney.com",
    privacyPolicyUrl: "https://docs.midjourney.com/privacy-policy",
    deletionUrl: "https://accounts.midjourney.com/account/delete",
    supportUrl: "https://docs.midjourney.com",
    category: "AI Tools",
  },

  // ── Education ──────────────────────────────────────────────────────────────
  "coursera.org": {
    homepage: "https://coursera.org",
    privacyPolicyUrl: "https://www.coursera.org/privacy",
    deletionUrl: "https://www.coursera.org/account/delete",
    supportUrl: "https://www.coursera.org/support",
    category: "Education",
  },
  "udemy.com": {
    homepage: "https://udemy.com",
    privacyPolicyUrl: "https://www.udemy.com/privacy",
    deletionUrl: "https://www.udemy.com/user/delete-account/",
    supportUrl: "https://www.udemy.com/support",
    category: "Education",
  },
  "edx.org": {
    homepage: "https://edx.org",
    privacyPolicyUrl: "https://www.edx.org/privacy-policy",
    deletionUrl: "https://profile.edx.org/u/delete_account",
    supportUrl: "https://support.edx.org",
    category: "Education",
  },
  "duolingo.com": {
    homepage: "https://duolingo.com",
    privacyPolicyUrl: "https://www.duolingo.com/privacy",
    deletionUrl: "https://www.duolingo.com/settings/account/delete",
    supportUrl: "https://support.duolingo.com",
    category: "Education",
  },
  "khanacademy.org": {
    homepage: "https://khanacademy.org",
    privacyPolicyUrl: "https://www.khanacademy.org/privacy",
    deletionUrl: "https://www.khanacademy.org/settings/account/delete",
    supportUrl: "https://support.khanacademy.org",
    category: "Education",
  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  "discord.com": {
    homepage: "https://discord.com",
    privacyPolicyUrl: "https://discord.com/privacy",
    deletionUrl: "https://discord.com/settings/account/delete",
    supportUrl: "https://support.discord.com",
    category: "Gaming",
  },
  "twitch.tv": {
    homepage: "https://twitch.tv",
    privacyPolicyUrl: "https://www.twitch.tv/p/legal/privacy-policy",
    deletionUrl: "https://www.twitch.tv/settings/delete-account",
    supportUrl: "https://help.twitch.tv",
    category: "Gaming",
  },
  "steampowered.com": {
    homepage: "https://steampowered.com",
    privacyPolicyUrl: "https://store.steampowered.com/privacy_agreement",
    deletionUrl: "https://help.steampowered.com/en/wizard/HelpWithAccountIssue",
    supportUrl: "https://help.steampowered.com",
    category: "Gaming",
  },
  "epicgames.com": {
    homepage: "https://epicgames.com",
    privacyPolicyUrl: "https://www.epicgames.com/site/en-US/privacypolicy",
    deletionUrl: "https://www.epicgames.com/account/delete",
    supportUrl: "https://www.epicgames.com/help",
    category: "Gaming",
  },

  // ── Travel ─────────────────────────────────────────────────────────────────
  "uber.com": {
    homepage: "https://uber.com",
    privacyPolicyUrl: "https://www.uber.com/privacy",
    deletionUrl: "https://www.uber.com/account/delete-account/",
    supportUrl: "https://help.uber.com",
    category: "Travel",
  },
  "airbnb.com": {
    homepage: "https://airbnb.com",
    privacyPolicyUrl: "https://www.airbnb.com/privacy",
    deletionUrl: "https://www.airbnb.com/account/delete",
    supportUrl: "https://www.airbnb.com/help",
    category: "Travel",
  },
  "booking.com": {
    homepage: "https://booking.com",
    privacyPolicyUrl: "https://www.booking.com/privacy",
    deletionUrl: "https://secure.booking.com/account/delete.en.html",
    supportUrl: "https://www.booking.com/help",
    category: "Travel",
  },
  "expedia.com": {
    homepage: "https://expedia.com",
    privacyPolicyUrl: "https://www.expedia.com/privacy",
    deletionUrl: "https://www.expedia.com/user/delete",
    supportUrl: "https://www.expedia.com/support",
    category: "Travel",
  },

  // ── Food ───────────────────────────────────────────────────────────────────
  "zomato.com": {
    homepage: "https://zomato.com",
    privacyPolicyUrl: "https://www.zomato.com/privacy",
    deletionUrl: "https://www.zomato.com/account/delete-account",
    supportUrl: "https://www.zomato.com/contact",
    category: "Food",
  },
  "swiggy.com": {
    homepage: "https://swiggy.com",
    privacyPolicyUrl: "https://www.swiggy.com/privacy",
    deletionUrl: "https://www.swiggy.com/account-settings/delete",
    supportUrl: "https://www.swiggy.com/support",
    category: "Food",
  },
  "doordash.com": {
    homepage: "https://doordash.com",
    privacyPolicyUrl: "https://www.doordash.com/privacy",
    deletionUrl: "https://www.doordash.com/accounts/delete/",
    supportUrl: "https://help.doordash.com",
    category: "Food",
  },

  // ── Job Portals ────────────────────────────────────────────────────────────
  "naukri.com": {
    homepage: "https://naukri.com",
    privacyPolicyUrl: "https://www.naukri.com/privacy",
    deletionUrl: "https://www.naukri.com/profile/delete-profile",
    supportUrl: "https://www.naukri.com/help",
    category: "Job Portals",
  },
  "glassdoor.com": {
    homepage: "https://glassdoor.com",
    privacyPolicyUrl: "https://www.glassdoor.com/privacy",
    deletionUrl: "https://www.glassdoor.com/profile/delete",
    supportUrl: "https://help.glassdoor.com",
    category: "Job Portals",
  },
  "indeed.com": {
    homepage: "https://indeed.com",
    privacyPolicyUrl: "https://www.indeed.com/privacy",
    deletionUrl: "https://my.indeed.com/account/delete",
    supportUrl: "https://www.indeed.com/support",
    category: "Job Portals",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Look up deletion info for a service by its domain.
 * Checks the static map first, then optionally falls back to Supabase.
 *
 * @param {string} domain - e.g. "github.com"
 * @returns {Object|null} { homepage, privacyPolicyUrl, deletionUrl, supportUrl, category }
 */
export function lookupDeletionInfo(domain) {
  if (!domain) return null;

  const cleanDomain = domain.toLowerCase().trim();
  let info = DELETION_INFO[cleanDomain];

  // Check parent domain fallback (e.g., "e.linkedin.com" → "linkedin.com")
  if (!info) {
    const parts = cleanDomain.split(".");
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join(".");
      info = DELETION_INFO[parentDomain];
    }
  }

  return info || null;
}

/**
 * Get deletion URL for a service (the most actionable link).
 *
 * @param {string} domain
 * @returns {string|null} Deletion URL or null if not available
 */
export function getDeletionUrl(domain) {
  const info = lookupDeletionInfo(domain);
  return info?.deletionUrl || null;
}

/**
 * Get support URL for a service (fallback when deletion URL is unknown).
 *
 * @param {string} domain
 * @returns {string|null}
 */
export function getSupportUrl(domain) {
  const info = lookupDeletionInfo(domain);
  return info?.supportUrl || null;
}

/**
 * Get privacy policy URL for a service.
 *
 * @param {string} domain
 * @returns {string|null}
 */
export function getPrivacyUrl(domain) {
  const info = lookupDeletionInfo(domain);
  return info?.privacyPolicyUrl || null;
}

/**
 * Get all deletion info as a flat array for bulk operations (e.g., seed Supabase).
 *
 * @returns {Array<{domain, serviceName, homepage, privacyPolicyUrl, deletionUrl, supportUrl, category}>}
 */
export function getAllDeletionInfo() {
  return Object.entries(DELETION_INFO).map(([domain, info]) => ({
    domain,
    serviceName: domain.split(".")[0],
    homepage: info.homepage,
    privacyPolicyUrl: info.privacyPolicyUrl,
    deletionUrl: info.deletionUrl,
    supportUrl: info.supportUrl,
    category: info.category,
  }));
}

/**
 * Load deletion info from Supabase (for entries not in the static map).
 *
 * @param {string[]} domains - Domains to look up
 * @returns {Promise<Object>} Map of domain → deletion info from Supabase
 */
export async function loadDeletionInfoFromSupabase(domains) {
  if (!domains?.length) return {};

  try {
    const { data, error } = await supabase
      .from("service_deletion_info")
      .select("*")
      .in("domain", domains);

    if (error || !data) {
      console.warn("[DetachX] loadDeletionInfoFromSupabase error:", error?.message);
      return {};
    }

    const map = {};
    for (const row of data) {
      map[row.domain] = {
        homepage: row.homepage,
        privacyPolicyUrl: row.privacy_policy_url,
        deletionUrl: row.deletion_url,
        supportUrl: row.support_url,
        category: row.category,
      };
    }
    return map;
  } catch (err) {
    console.warn("[DetachX] loadDeletionInfoFromSupabase exception:", err);
    return {};
  }
}

/**
 * Get the best actionable link for a service:
 *   1. Deletion URL (if available)
 *   2. Privacy policy URL (if deletion not available)
 *   3. Support URL (fallback)
 *   4. Homepage (last resort)
 *
 * @param {string} domain
 * @returns {{ url: string|null, label: string }}
 */
export function getBestActionLink(domain) {
  const info = lookupDeletionInfo(domain);

  if (info?.deletionUrl) {
    return { url: info.deletionUrl, label: "Delete Account" };
  }
  if (info?.privacyPolicyUrl) {
    return { url: info.privacyPolicyUrl, label: "Privacy Settings" };
  }
  if (info?.supportUrl) {
    return { url: info.supportUrl, label: "Contact Support" };
  }
  if (info?.homepage) {
    return { url: info.homepage, label: "Visit Website" };
  }

  return { url: null, label: "No link available" };
}
