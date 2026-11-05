// Section 1's leaderboard data, curated from platforms.csv (values in millions; every value there
// carries a source id into sources.md). A point at year Y is the figure closest to the end of Y.
//
// Choices:
// - Monthly active users only, so bars compare like with like. Left out: LinkedIn and Google+
//   (registered accounts), Snapchat and Douyin (daily users only until 2023), Messenger (no figures
//   after 2017), Qzone (a second Tencent network beside QQ), Tumblr (blogs, not people).
// - Early networks (MySpace, Friendster, Hi5, Orkut) and YouTube 2006 are comScore monthly unique
//   visitors, the only figures there are. MySpace 2009 (US only) and Orkut 2010–11 (Brazil only)
//   are dropped. These networks leave the race after their last figure.
// - Twitter switched to daily users in 2019 and Reddit in 2020; both hold their last monthly figure,
//   shown with its year. YouTube holds "2B+" from 2019.
// - Between reported years, values are drawn as straight lines (said on screen).
import type { RaceSeries } from '../../../engine/index.ts';

/** Who owned a platform from when (decimal years), for drawing its roots from the owner's ground. */
export const owners: Record<string, [number, string][]> = {
  facebook: [[0, 'meta']],
  instagram: [[0, 'instagram-inc'], [2012.3, 'meta']],
  whatsapp: [[0, 'whatsapp-inc'], [2014.15, 'meta']],
  youtube: [[0, 'youtube-inc'], [2006.85, 'google']],
  qq: [[0, 'tencent']],
  wechat: [[0, 'tencent']],
  myspace: [[0, 'newscorp'], [2011.5, 'specific-media']],
  friendster: [[0, 'friendster-inc'], [2009.95, 'mol']],
  hi5: [[0, 'hi5']],
  orkut: [[0, 'google']],
  twitter: [[0, 'twitter']],
  tiktok: [[0, 'bytedance']],
  telegram: [[0, 'telegram']],
  pinterest: [[0, 'pinterest']],
  reddit: [[0, 'advance']],
};

export function ownerAt(id: string, year: number): string | undefined {
  const list = owners[id];
  if (!list) return undefined;
  let o = list[0][1];
  for (const [from, who] of list) if (year >= from) o = who;
  return o;
}

const y = (from: number, values: number[]): [number, number][] => values.map((v, i) => [from + i, v]);

/** Platforms, 2004 onwards (the race shows 2006–2021). */
export const platforms: RaceSeries[] = [
  { id: 'facebook', label: 'Facebook', points: y(2004, [1, 6, 12, 58, 145, 360, 608, 845, 1060, 1230, 1390, 1590, 1860, 2130, 2320, 2500, 2800, 2910, 2960, 3070]) },
  { id: 'youtube', label: 'YouTube', points: [[2006, 81], [2013, 1000], [2017, 1500], [2018, 1800], [2019, 2000]] },
  { id: 'qq', label: 'QQ', points: y(2004, [135, 201.9, 232.6, 300.2, 376.6, 522.9, 647.6, 721, 798.2, 808, 815, 853, 868, 783.4, 807.1, 647, 594.9, 552.1, 572.1]) },
  { id: 'myspace', label: 'MySpace', after: 'end', points: [[2006, 66.4], [2007, 114.1], [2008, 125], [2010, 101], [2011, 74]] },
  { id: 'friendster', label: 'Friendster', after: 'end', points: y(2006, [14.9, 24.7, 31, 75]) },
  { id: 'hi5', label: 'Hi5', after: 'end', points: y(2006, [18.1, 28.2, 58]) },
  { id: 'orkut', label: 'Orkut', after: 'end', points: y(2006, [13.6, 24.1, 46]) },
  { id: 'twitter', label: 'Twitter', points: y(2010, [54, 117, 184.9, 240.9, 288, 305, 319, 330, 321]) },
  { id: 'instagram', label: 'Instagram', points: [...y(2010, [1, 10, 90, 150, 300, 400, 600, 800, 1000]), [2022, 2000]] },
  { id: 'whatsapp', label: 'WhatsApp', points: [...y(2013, [400, 700, 1000, 1200, 1500]), [2019, 2000], [2025, 3000]] },
  { id: 'wechat', label: 'WeChat', points: y(2013, [355, 500, 697, 889, 988.6, 1097.6, 1164.8, 1225, 1268.2, 1313.2]) },
  { id: 'tiktok', label: 'TikTok', points: y(2018, [271.19, 507.55, 689.17, 1000]) },
  { id: 'telegram', label: 'Telegram', points: [...y(2014, [50, 60, 100, 180, 200, 300, 500]), [2022, 700]] },
  { id: 'pinterest', label: 'Pinterest', points: y(2015, [100, 160, 216, 265, 335, 459, 431]) },
  { id: 'reddit', label: 'Reddit', points: [[2018, 330], [2019, 430]] },
];

/**
 * Today, by company: each one's latest reported figure, with its year when older. Meta's is its own
 * count of people using any of its apps daily (Dec 2025, Meta Q4 2025 results), counting each
 * person once; the rest are their biggest platform's monthly users.
 */
export const companies: RaceSeries[] = [
  { id: 'meta', label: 'Meta', points: [[2025, 3580]], meta: { note: 'daily', sub: 'Facebook · Instagram · WhatsApp · Messenger' } },
  { id: 'google', label: 'Alphabet', points: [[2019, 2000]], meta: { sub: 'YouTube' } },
  { id: 'tencent', label: 'Tencent', points: [[2025, 1418]], meta: { sub: 'WeChat · QQ' } },
  { id: 'bytedance', label: 'ByteDance', points: [[2021, 1000]], meta: { sub: 'TikTok' } },
  { id: 'telegram', label: 'Telegram', points: [[2025, 1000]] },
  { id: 'snap', label: 'Snap', points: [[2025, 946]] },
  { id: 'pinterest', label: 'Pinterest', points: [[2025, 619]] },
  { id: 'x', label: 'X', points: [[2025, 600]], meta: { note: 'claimed' } },
  { id: 'bluesky', label: 'Bluesky', points: [[2025, 41.41]], meta: { alt: true, note: 'registered' } },
  { id: 'mastodon', label: 'Mastodon', points: [[2025, 0.73]], meta: { alt: true } },
];

export const sourceLines = {
  race: 'Monthly active users, from company reports. MySpace, Friendster, Hi5, Orkut: comScore monthly visitors. Straight lines between reported years.',
  today: 'Latest reported figure; its year where older. Meta: people using any of its apps each day, Dec 2025. Others: monthly users.',
};
