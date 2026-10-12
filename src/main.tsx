import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, ArrowRight, Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import catalog from '@/content/catalog.json'
import legacyPages from '@/content/legacy-pages.json'
import './index.css'
import './site.css'

const root = document.querySelector<HTMLMetaElement>('meta[name="quanta-root"]')?.content ?? './'
const url = (path: string) => `${root}${path}`
const route = decodeURIComponent(window.location.pathname).split('/').filter(Boolean)
const current = route.length && route.at(-1)?.endsWith('.html') ? (route.at(-2) === 'circles' || route.at(-2) === 'news' ? route.slice(-2).join('/') : route.at(-3) === 'circles' ? route.slice(-3).join('/') : route.at(-1)!) : 'index.html'
const page = (legacyPages as Record<string, { title: string; html: string }>)[current]
const nav = [
  ['About', 'index.html#about'], ['Circles', 'index.html#circles'],
  ['News', 'index.html#news'], ['Gallery', 'gallery.html'],
  ['People', 'people.html'], ['Contact', 'index.html#contact'],
]

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><div className="shell header-inner">
    <a className="brand" href={url('index.html')} aria-label="Quanta home"><img src={url('images/quanta-logo.png')} alt="" /><span><strong>Quanta</strong><small>PHYSICS STUDY CIRCLES · SUT</small></span></a>
    <Button variant="ghost" size="icon" className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>{open ? <X /> : <Menu />}</Button>
    <nav className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">{nav.map(([name, href]) => <a key={name} href={url(href)} onClick={() => setOpen(false)}>{name}</a>)}</nav>
  </div></header>
}

function Footer() { return <footer className="site-footer"><div className="shell footer-inner"><span className="footer-name">Quanta <span>·</span> A space to think together.</span><span>Physics Department, Sharif University of Technology</span><a href="mailto:quantasut@gmail.com">Get in touch <ArrowUpRight aria-hidden="true" /></a></div></footer> }
function Kicker({ children }: { children: React.ReactNode }) { return <div className="kicker"><span className="kicker-mark" />{children}</div> }
function SectionTitle({ overline, title, description }: { overline: string; title: string; description?: string }) { return <div className="section-heading"><Kicker>{overline}</Kicker><h2>{title}</h2>{description && <p>{description}</p>}</div> }

function CircleDirectory() {
  const [search, setSearch] = useState('')
  const categories = useMemo(() => catalog.circles.map(category => ({ ...category, items: category.items.filter(item => item.title.toLowerCase().includes(search.trim().toLowerCase())) })).filter(category => category.items.length), [search])
  return <section className="section directory" id="circles"><div className="shell">
    <div className="directory-top"><SectionTitle overline="THE ARCHIVE" title="Find your next question." description="From first principles to seminal papers. Explore the circles, then follow a topic wherever it leads." />
      <label className="search-field"><Search aria-hidden="true" /><span className="sr-only">Search study circles</span><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a topic or paper…" aria-label="Search study circles" /></label></div>
    {categories.length ? <Accordion type="multiple" defaultValue={['Physics & Mathematics']} className="circle-accordion">{categories.map((category, index) => <AccordionItem key={category.label} value={category.label}><AccordionTrigger><span className="category-title"><span className="category-number">0{index + 1}</span>{category.label}</span><span className="category-count">{category.items.length} circles</span></AccordionTrigger><AccordionContent><div className="circle-links">{category.items.map(item => <a href={url(item.href)} key={item.href}><span>{item.title}</span><ArrowUpRight aria-hidden="true" /></a>)}</div></AccordionContent></AccordionItem>)}</Accordion> : <p className="empty-message" role="status">No circles match “{search}”. Try another topic.</p>}
  </div></section>
}
function NewsCards({ full = false }: { full?: boolean }) { return <div className="news-cards">{(full ? catalog.news : catalog.news.slice(0, 2)).map(item => <Card key={item.href} className="news-card"><a href={url(item.href)} className="news-card-link"><img src={url(item.image)} alt="" loading="lazy" /><CardHeader><span className="card-date">{item.date}</span><CardTitle>{item.title}</CardTitle><CardDescription>{item.summary}</CardDescription></CardHeader><CardContent><span className="inline-link">Read announcement <ArrowUpRight aria-hidden="true" /></span></CardContent></a></Card>)}</div> }
function NewsSection() { return <section className="section news-section" id="news"><div className="shell"><div className="section-row"><SectionTitle overline="FROM THE COMMUNITY" title="What’s happening." /><a className="text-link" href={url('all-news.html')}>All news <ArrowUpRight aria-hidden="true" /></a></div><NewsCards /></div></section> }

function Gallery({ preview = false }: { preview?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null)
  const images = preview ? catalog.gallery.slice(0, 3) : catalog.gallery
  useEffect(() => { if (selected === null) return; const handler = (event: KeyboardEvent) => { if (event.key === 'ArrowLeft') setSelected((selected + images.length - 1) % images.length); if (event.key === 'ArrowRight') setSelected((selected + 1) % images.length) }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [selected, images.length])
  return <><div className="gallery-grid">{images.map((item, index) => <button key={item.src} className="gallery-tile" onClick={() => setSelected(index)} aria-label={`Open gallery photo ${index + 1}`}><img src={url(item.src)} alt={item.caption} loading="lazy" /><span>View photo <ArrowUpRight aria-hidden="true" /></span></button>)}</div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}><DialogContent className="photo-dialog"><DialogTitle className="sr-only">Gallery photograph</DialogTitle>{selected !== null && <><img src={url(images[selected].src)} alt={images[selected].caption} /><div className="photo-controls"><Button variant="outline" onClick={() => setSelected((selected + images.length - 1) % images.length)}>Previous</Button><span>{selected + 1} / {images.length}</span><Button variant="outline" onClick={() => setSelected((selected + 1) % images.length)}>Next</Button></div></>}</DialogContent></Dialog></>
}
function Home() { return <><section className="hero" style={{ backgroundImage: `linear-gradient(90deg,#080d25fa 0%,#080d25e0 37%,#080d2590 73%,#080d2550 100%),url('${url('images/hero-bg.png')}')` }}><div className="shell hero-inner"><Kicker>SHARIF UNIVERSITY OF TECHNOLOGY · TEHRAN</Kicker><h1>Curiosity has<br /><em>no final answer.</em></h1><p>Student-led study circles for the questions that keep physicists thinking. Read, discuss, disagree, discover — together.</p><div className="hero-actions"><Button asChild size="lg"><a href="#circles">Explore the circles <ArrowRight data-icon="inline-end" /></a></Button><a className="hero-secondary" href="#about">What is Quanta? <ArrowUpRight aria-hidden="true" /></a></div><div className="hero-foot"><span>PHYSICS / MATHEMATICS / IDEAS</span><span>OPEN TO EVERY CURIOUS MIND</span></div></div></section>
    <section className="section about" id="about"><div className="shell about-grid"><SectionTitle overline="ABOUT QUANTA" title="Physics is better when we think out loud." /><div className="about-copy"><p>Quanta is a student-led initiative founded at Sharif University of Technology. We bring students and enthusiasts together to learn, discuss, and teach each other physics — from historic breakthroughs to current research.</p><p>Some circles start with the fundamentals. Others open a landmark paper or chase a question at the edge of a field. What they share is a room where everyone can take part.</p><div className="about-types"><div><span>01 /</span><strong>Physics & Mathematics</strong><small>Explore a subject in depth.</small></div><div><span>02 /</span><strong>Historical Papers</strong><small>Revisit the ideas that changed physics.</small></div><div><span>03 /</span><strong>Special Topics</strong><small>Follow new and unexpected connections.</small></div></div></div></div></section>
    <CircleDirectory /><NewsSection /><section className="section gallery-section" id="gallery"><div className="shell"><div className="section-row"><SectionTitle overline="LIFE AT QUANTA" title="Ideas have a place." description="A few moments from the circles and the people behind them." /><a className="text-link" href={url('gallery.html')}>Explore gallery <ArrowUpRight aria-hidden="true" /></a></div><Gallery preview /></div></section>
    <section className="section people-section" id="people"><div className="shell people-feature"><div><Kicker>THE PEOPLE</Kicker><h2>A circle is made<br />of people.</h2><p>Meet the students and organisers keeping the conversations going.</p><Button asChild variant="outline"><a href={url('people.html')}>Meet the team <ArrowUpRight data-icon="inline-end" /></a></Button></div><div className="portrait-row">{['SohrabMaleki.jpg', 'ZahraAmiri.jpg', 'AliJavidanPak.jpg'].map((person) => <img key={person} src={url(`images/people/${person}`)} alt={person.replace('.jpg', '').replace(/([a-z])([A-Z])/g, '$1 $2')} loading="lazy" />)}</div></div></section>
    <section className="section contact" id="contact"><div className="shell contact-grid"><div><Kicker>GET INVOLVED</Kicker><h2>The next good question<br />could be yours.</h2><p>Have a topic in mind, want to join a circle, or just want to say hello? We'd love to hear from you.</p><a href="mailto:quantasut@gmail.com">quantasut@gmail.com <ArrowUpRight aria-hidden="true" /></a><a href="https://t.me/QuantaSC">Telegram community <ArrowUpRight aria-hidden="true" /></a></div><form action="https://formspree.io/f/xjkedevl" method="POST"><label htmlFor="name">Your name</label><Input id="name" name="name" required autoComplete="name" /><label htmlFor="email">Email address</label><Input id="email" name="email" type="email" required autoComplete="email" /><label htmlFor="message">What’s on your mind?</label><textarea id="message" name="message" rows={5} required /><Button type="submit">Send message <ArrowUpRight data-icon="inline-end" /></Button></form></div></section></> }

function LegacyArticle({ html, title }: { html: string; title: string }) {
  const [preview, setPreview] = useState<string | null>(null)
  useEffect(() => {
    const area = document.querySelector('.legacy-content'); if (!area) return
    const click = (event: Event) => { const target = event.target as HTMLElement; if (target.matches('.session-image img')) setPreview((target as HTMLImageElement).src) }
    area.addEventListener('click', click); return () => area.removeEventListener('click', click)
  }, [html])
  return <><div className="article-head"><div className="shell"><Kicker>{current.startsWith('circles/') ? 'STUDY CIRCLE / THE ARCHIVE' : 'QUANTA / NEWS'}</Kicker><a href={url(current.startsWith('news/') ? 'all-news.html' : 'index.html#circles')} className="back-link">← Back to {current.startsWith('news/') ? 'news' : 'circles'}</a></div></div><div className="legacy-content" aria-label={title} dangerouslySetInnerHTML={{ __html: html.replace(/\b(src|href)="(?!https?:|mailto:|tel:|#|\/)([^"]+)"/g, (_match, attribute: string, path: string) => `${attribute}="${url(path)}"`) }} /><Dialog open={!!preview} onOpenChange={open => { if (!open) setPreview(null) }}><DialogContent className="photo-dialog"><DialogTitle className="sr-only">Session poster</DialogTitle>{preview && <img src={preview} alt="Session poster preview" />}</DialogContent></Dialog></>
}
function People() { const people = [
  { name: 'Sohrab Maleki', image: 'SohrabMaleki.jpg', time: '2025 – Present' }, { name: 'Zahra Amiri', image: 'ZahraAmiri.jpg', time: '2025 – Present' }, { name: 'Ali Javidan Pak', image: 'AliJavidanPak.jpg', time: '2025 – Present' }, { name: 'Radmehr Fathi', image: 'RadmehrFathi.jpg', time: '2025 – Present' }, { name: 'Alireza Talebi', image: 'AlirezaTalebi.jpg', time: '2023 – 2025' }, { name: 'Ali Ekramian', image: 'AliEkramian.jpg', time: '2023' }, { name: 'Elham Davoudi', image: 'ElhamDavoudi.jpg', time: '2022 – 2023' }, { name: 'Parsa Rangriz', image: 'ParsaRangriz.jpg', time: '2020 – 2022' }, { name: 'Mohammad Ebrahimi', image: 'MohammadEbrahimi.jpg', time: '2020 – 2022' },
]; return <section className="section standalone"><div className="shell"><SectionTitle overline="THE PEOPLE BEHIND QUANTA" title="Meet the minds." description="From founding conversations to the circles happening now, these are the people who have helped Quanta grow." /><div className="people-grid">{people.map(person => <Card className="people-card" key={person.name}><CardContent><img src={url(`images/people/${person.image}`)} alt={person.name} loading="lazy" /><span className="card-date">{person.time}</span><h3>{person.name}</h3></CardContent></Card>)}</div></div></section> }
function App() { useEffect(() => { document.title = `${current === 'index.html' ? 'Quanta — Physics Study Circles at SUT' : page?.title ?? 'Quanta'} | Quanta`; }, []); return <><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{current === 'index.html' ? <Home /> : current === 'all-news.html' ? <section className="section standalone"><div className="shell"><SectionTitle overline="FROM THE COMMUNITY" title="News & announcements." description="Updates from our study circles and the Quanta community." /><NewsCards full /></div></section> : current === 'gallery.html' ? <section className="section standalone"><div className="shell"><SectionTitle overline="LIFE AT QUANTA" title="The gallery." description="Snapshots from our study circles and events." /><Gallery /></div></section> : current === 'people.html' ? <People /> : page ? <LegacyArticle title={page.title} html={page.html} /> : <section className="section standalone shell"><h1>Page not found</h1><p>This page may have moved. Find your way back to our study circles.</p><Button asChild><a href={url('index.html#circles')}>Explore circles</a></Button></section>}</main><Footer /></> }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
