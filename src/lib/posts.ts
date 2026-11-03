import raw from '../data/posts.json';

export interface Post {
  id: number; slug: string; title: string; date: string; modified: string; excerpt: string; content: string;
  image: string | null; imageAlt: string; imageWidth: number | null; imageHeight: number | null;
  seoTitle: string; seoDescription: string;
}

export const posts = (raw as Post[]).slice().sort((a, b) => b.date.localeCompare(a.date));
export const PER_PAGE = 12;
export const pageCount = Math.ceil(posts.length / PER_PAGE);
export const pageSlice = (n: number) => posts.slice((n - 1) * PER_PAGE, n * PER_PAGE);
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' });
export const readMins = (html: string) => Math.max(2, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 230));
