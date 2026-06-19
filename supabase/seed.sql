-- ──────────────────────────────────────────────────────────────────────────────
-- DetachX — Seed data for Service Deletion Info
--
-- Pre-populates the service_deletion_info table with curated deletion,
-- privacy, and support URLs for known services.
--
-- Run AFTER migration 20240601000002_create_footprint_tables.sql.
--
-- Usage:
--   supabase db reset    (auto-loads this file)
--   or paste into Supabase SQL editor for production/remote project.
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO public.service_deletion_info (domain, service_name, homepage, privacy_policy_url, deletion_url, support_url, category)
VALUES
  -- Developer Tools
  ('github.com',       'GitHub',        'https://github.com',          'https://docs.github.com/en/site-policy/privacy-policies',              'https://github.com/settings/admin',                                     'https://support.github.com',       'Developer Tools'),
  ('gitlab.com',       'GitLab',        'https://gitlab.com',          'https://about.gitlab.com/privacy/',                                     'https://gitlab.com/-/profile/account/delete_account',                    'https://about.gitlab.com/support', 'Developer Tools'),
  ('figma.com',        'Figma',         'https://figma.com',           'https://www.figma.com/privacy/',                                        'https://www.figma.com/settings',                                         'https://help.figma.com',           'Developer Tools'),
  ('vercel.com',       'Vercel',        'https://vercel.com',          'https://vercel.com/legal/privacy-policy',                               'https://vercel.com/account',                                             'https://vercel.com/help',          'Developer Tools'),
  ('netlify.com',      'Netlify',       'https://netlify.com',         'https://www.netlify.com/privacy/',                                     'https://app.netlify.com/user/settings#delete-account',                   'https://answers.netlify.com',      'Developer Tools'),
  ('render.com',       'Render',        'https://render.com',          'https://render.com/privacy',                                           'https://dashboard.render.com/settings',                                  'https://render.com/docs',          'Developer Tools'),
  ('digitalocean.com', 'DigitalOcean',  'https://digitalocean.com',    'https://www.digitalocean.com/legal/privacy-policy/',                    'https://cloud.digitalocean.com/account/settings',                        'https://www.digitalocean.com/support', 'Developer Tools'),
  ('mongodb.com',      'MongoDB',       'https://mongodb.com',         'https://www.mongodb.com/legal/privacy-policy',                          'https://account.mongodb.com/account/manage',                             'https://support.mongodb.com',      'Developer Tools'),
  ('supabase.com',     'Supabase',      'https://supabase.com',        'https://supabase.com/privacy',                                         'https://supabase.com/dashboard/account/settings',                        'https://supabase.com/docs/support', 'Developer Tools'),
  ('docker.com',       'Docker',        'https://docker.com',          'https://www.docker.com/legal/privacy-policy',                          'https://hub.docker.com/settings/delete-account',                         'https://www.docker.com/support',   'Developer Tools'),
  ('atlassian.com',    'Atlassian',     'https://atlassian.com',       'https://www.atlassian.com/legal/privacy-policy',                       'https://id.atlassian.com/manage/profile/delete-account',                 'https://support.atlassian.com',    'Developer Tools'),
  ('postman.com',      'Postman',       'https://postman.com',         'https://www.postman.com/legal/privacy-policy',                          'https://identity.getpostman.com/account/delete',                         'https://www.postman.com/support',  'Developer Tools'),
  ('cloudflare.com',   'Cloudflare',    'https://cloudflare.com',      'https://www.cloudflare.com/privacypolicy/',                            'https://dash.cloudflare.com/profile/delete',                             'https://support.cloudflare.com',   'Developer Tools'),

  -- Cloud Services
  ('google.com',       'Google',        'https://google.com',          'https://policies.google.com/privacy',                                  'https://myaccount.google.com/deleteaccount',                             'https://support.google.com',       'Cloud Services'),
  ('microsoft.com',    'Microsoft',     'https://microsoft.com',       'https://privacy.microsoft.com',                                        'https://account.microsoft.com/account/close-account',                    'https://support.microsoft.com',    'Cloud Services'),
  ('apple.com',        'Apple',         'https://apple.com',           'https://www.apple.com/legal/privacy/',                                 'https://privacy.apple.com/',                                             'https://support.apple.com',        'Cloud Services'),
  ('dropbox.com',      'Dropbox',       'https://dropbox.com',         'https://www.dropbox.com/privacy',                                      'https://www.dropbox.com/account/delete',                                 'https://help.dropbox.com',         'Cloud Services'),
  ('aws.amazon.com',   'AWS',           'https://aws.amazon.com',      'https://aws.amazon.com/privacy/',                                      'https://portal.aws.amazon.com/gov/cloudfront/closeAccount',              'https://aws.amazon.com/contact-us/', 'Cloud Services'),

  -- Social Media
  ('twitter.com',      'Twitter / X',   'https://twitter.com',         'https://twitter.com/privacy',                                          'https://twitter.com/settings/deactivate',                                'https://help.twitter.com',         'Social Media'),
  ('x.com',            'X / Twitter',   'https://x.com',               'https://x.com/privacy',                                                'https://x.com/settings/deactivate',                                      'https://help.x.com',               'Social Media'),
  ('facebook.com',     'Facebook',      'https://facebook.com',        'https://www.facebook.com/privacy',                                    'https://www.facebook.com/settings?tab=account&section=deactivation',     'https://www.facebook.com/help',    'Social Media'),
  ('instagram.com',    'Instagram',     'https://instagram.com',        'https://privacycenter.instagram.com/policy',                           'https://www.instagram.com/accounts/remove/request/permanent/',           'https://help.instagram.com',       'Social Media'),
  ('linkedin.com',     'LinkedIn',      'https://linkedin.com',         'https://www.linkedin.com/legal/privacy-policy',                        'https://www.linkedin.com/psettings/close-account',                       'https://www.linkedin.com/help',    'Social Media'),
  ('reddit.com',       'Reddit',        'https://reddit.com',          'https://www.reddit.com/policies/privacy',                              'https://www.reddit.com/settings/account',                                'https://www.reddithelp.com',       'Social Media'),
  ('medium.com',       'Medium',        'https://medium.com',          'https://policy.medium.com',                                            'https://medium.com/me/settings/account',                                 'https://help.medium.com',          'Social Media'),

  -- Shopping
  ('amazon.com',       'Amazon',        'https://amazon.com',          'https://www.amazon.com/privacy',                                       'https://www.amazon.com/gp/help/customer/display.html?nodeId=GNGV9WHPV9UDXFUF', 'https://www.amazon.com/contact-us', 'Shopping'),
  ('shopify.com',      'Shopify',       'https://shopify.com',         'https://www.shopify.com/legal/privacy',                                'https://accounts.shopify.com/delete',                                    'https://help.shopify.com',         'Shopping'),
  ('ebay.com',         'eBay',          'https://ebay.com',            'https://www.ebay.com/privacy',                                         'https://www.ebay.com/clt/accountdelete',                                 'https://www.ebay.com/help',        'Shopping'),
  ('etsy.com',         'Etsy',          'https://etsy.com',            'https://www.etsy.com/legal/privacy',                                   'https://www.etsy.com/your/account/settings/close',                       'https://help.etsy.com',            'Shopping'),

  -- Finance
  ('paypal.com',       'PayPal',        'https://paypal.com',          'https://www.paypal.com/privacy',                                       'https://www.paypal.com/myaccount/settings/close-account',                'https://www.paypal.com/support',   'Finance'),
  ('stripe.com',       'Stripe',        'https://stripe.com',          'https://stripe.com/privacy',                                           'https://dashboard.stripe.com/settings/close-account',                    'https://support.stripe.com',       'Finance'),
  ('coinbase.com',     'Coinbase',      'https://coinbase.com',        'https://www.coinbase.com/legal/privacy',                               'https://www.coinbase.com/settings/close-account',                        'https://help.coinbase.com',        'Finance'),

  -- Productivity
  ('notion.so',        'Notion',        'https://notion.so',           'https://www.notion.so/privacy',                                        'https://www.notion.so/settings/delete-account',                          'https://www.notion.so/help',       'Productivity'),
  ('canva.com',        'Canva',         'https://canva.com',           'https://www.canva.com/policies/privacy',                               'https://www.canva.com/account/delete',                                   'https://www.canva.com/help',       'Productivity'),
  ('slack.com',        'Slack',         'https://slack.com',           'https://slack.com/privacy-policy',                                     'https://slack.com/settings/delete-account',                              'https://slack.com/help',           'Productivity'),
  ('zoom.us',          'Zoom',          'https://zoom.us',             'https://zoom.us/privacy',                                              'https://zoom.us/account/close-account',                                  'https://support.zoom.us',          'Productivity'),
  ('adobe.com',        'Adobe',         'https://adobe.com',           'https://www.adobe.com/privacy',                                        'https://account.adobe.com/delete-account',                               'https://helpx.adobe.com/contact',  'Productivity'),

  -- Entertainment
  ('netflix.com',      'Netflix',       'https://netflix.com',         'https://help.netflix.com/legal/privacy',                               'https://www.netflix.com/account/closeaccount',                           'https://help.netflix.com',         'Entertainment'),
  ('spotify.com',      'Spotify',       'https://spotify.com',         'https://www.spotify.com/privacy',                                      'https://www.spotify.com/account/close-account/',                         'https://support.spotify.com',      'Entertainment'),
  ('youtube.com',      'YouTube',       'https://youtube.com',         'https://policies.google.com/privacy',                                  'https://www.youtube.com/account_advanced',                               'https://support.google.com/youtube', 'Entertainment'),

  -- AI Tools
  ('openai.com',       'OpenAI',        'https://openai.com',          'https://openai.com/policies/privacy-policy',                           'https://platform.openai.com/account/deletion',                           'https://help.openai.com',          'AI Tools'),
  ('chatgpt.com',      'ChatGPT',       'https://chatgpt.com',         'https://openai.com/policies/privacy-policy',                           'https://chatgpt.com/account/deletion',                                   'https://help.openai.com',          'AI Tools'),

  -- Education
  ('coursera.org',     'Coursera',      'https://coursera.org',        'https://www.coursera.org/privacy',                                     'https://www.coursera.org/account/delete',                                'https://www.coursera.org/support', 'Education'),
  ('udemy.com',        'Udemy',         'https://udemy.com',           'https://www.udemy.com/privacy',                                        'https://www.udemy.com/user/delete-account/',                             'https://www.udemy.com/support',    'Education'),
  ('duolingo.com',     'Duolingo',      'https://duolingo.com',        'https://www.duolingo.com/privacy',                                     'https://www.duolingo.com/settings/account/delete',                       'https://support.duolingo.com',     'Education'),

  -- Gaming
  ('discord.com',      'Discord',       'https://discord.com',         'https://discord.com/privacy',                                          'https://discord.com/settings/account/delete',                            'https://support.discord.com',      'Gaming'),
  ('twitch.tv',        'Twitch',        'https://twitch.tv',           'https://www.twitch.tv/p/legal/privacy-policy',                         'https://www.twitch.tv/settings/delete-account',                          'https://help.twitch.tv',           'Gaming'),
  ('steampowered.com', 'Steam',         'https://steampowered.com',    'https://store.steampowered.com/privacy_agreement',                      'https://help.steampowered.com/en/wizard/HelpWithAccountIssue',           'https://help.steampowered.com',    'Gaming'),

  -- Travel
  ('uber.com',         'Uber',          'https://uber.com',            'https://www.uber.com/privacy',                                         'https://www.uber.com/account/delete-account/',                           'https://help.uber.com',            'Travel'),
  ('airbnb.com',       'Airbnb',        'https://airbnb.com',          'https://www.airbnb.com/privacy',                                       'https://www.airbnb.com/account/delete',                                 'https://www.airbnb.com/help',      'Travel'),

  -- Food
  ('zomato.com',       'Zomato',        'https://zomato.com',          'https://www.zomato.com/privacy',                                       'https://www.zomato.com/account/delete-account',                          'https://www.zomato.com/contact',   'Food'),
  ('swiggy.com',       'Swiggy',        'https://swiggy.com',          'https://www.swiggy.com/privacy',                                       'https://www.swiggy.com/account-settings/delete',                         'https://www.swiggy.com/support',   'Food'),

  -- Job Portals
  ('naukri.com',       'Naukri',        'https://naukri.com',          'https://www.naukri.com/privacy',                                       'https://www.naukri.com/profile/delete-profile',                          'https://www.naukri.com/help',      'Job Portals'),
  ('glassdoor.com',    'Glassdoor',     'https://glassdoor.com',       'https://www.glassdoor.com/privacy',                                    'https://www.glassdoor.com/profile/delete',                               'https://help.glassdoor.com',       'Job Portals'),
  ('indeed.com',       'Indeed',        'https://indeed.com',          'https://www.indeed.com/privacy',                                       'https://my.indeed.com/account/delete',                                   'https://www.indeed.com/support',   'Job Portals')
ON CONFLICT (domain) DO NOTHING;
