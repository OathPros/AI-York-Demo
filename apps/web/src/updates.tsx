import React, { useState } from "react";
import type { Activity, ContentItem } from "@ai-york/contracts";
import { exampleStories } from "./demo-records";
import { Icon } from "./public-ui";
import eventImage from "./assets/banners/teach.webp";
import researchImage from "./assets/banners/research.webp";
import studyImage from "./assets/banners/study.webp";
import workImage from "./assets/banners/work.webp";

const topics: Record<Activity, string> = { study: "Study", teach: "Teaching", research: "Research", work: "Work" };
const dateFormat = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
const dateLabel = (value: string) => dateFormat.format(new Date(value + "T00:00:00Z"));

const yorkNews = [
  { date: "2026-09-09", source: "YFile", url: "https://www.yorku.ca/yfile/2026/09/09/york-professor-explores-how-ai-can-deepen-learning-in-the-classroom/", title: "Using AI to support deeper learning", summary: "A York instructor explores how AI-generated questions can encourage students to explain their reasoning and engage more deeply with course material.", activities: ["study", "teach"] },
  { date: "2026-07-15", source: "YFile", url: "https://www.yorku.ca/yfile/2026/07/15/ai-innovation-at-york-u-starts-with-human-intelligence/", title: "A closer look at AI innovation across York", summary: "Discover research and innovation spanning health, climate and business, and the people shaping how AI is used.", activities: ["research", "work"] },
  { date: "2026-07-15", source: "YFile", url: "https://www.yorku.ca/yfile/2026/07/15/how-york-researchers-are-using-ai-to-support-cancer-care/", title: "Supporting cancer care with AI research", summary: "York researchers are exploring ways AI can help specialists analyze medical images and make more informed decisions.", activities: ["research"] },
  { date: "2026-07-15", source: "YFile", url: "https://www.yorku.ca/yfile/2026/07/15/can-ai-be-trusted-to-assess-climate-risks-a-york-study-investigates/", title: "Investigating AI and climate risk", summary: "Research at York examines the responsible use of AI in understanding environmental and climate-related risks.", activities: ["research"] }
] satisfies { date: string; source: string; url: string; title: string; summary: string; activities: Activity[] }[];

const news = [
  ...yorkNews,
  ...exampleStories.map((story) => ({ ...story, source: "AI @ York", url: `#/news?story=${story.id}` }))
].sort((a, b) => b.date.localeCompare(a.date));

export function NewsStory({ id }: { id: string }) {
  const story = exampleStories.find((item) => item.id === id);
  return <article className="section updates-page story-page">
    <a className="text-link" href="#/news">All AI news</a>
    {story ? <>
      <p className="update-meta"><time dateTime={story.date}>{dateLabel(story.date)}</time> · AI @ York</p>
      <h1>{story.title}</h1><p className="lead">{story.summary}</p>
      <Tags activities={story.activities} />
      {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <h2>Related records</h2>
      <ul>{story.related.map(({ title, href }) => <li key={href}><a className="text-link" href={href}>{title}</a></li>)}</ul>
    </> : <h1>Story not found</h1>}
  </article>;
}

function TopicSelect({ value, change }: { value: string; change: (value: string) => void }) {
  return <label>Topic<select value={value} onChange={(event) => change(event.target.value)}>
    <option value="">All topics</option>
    {Object.entries(topics).map(([key, title]) => <option key={key} value={key}>{title}</option>)}
  </select></label>;
}

function Tags({ activities }: { activities?: Activity[] }) {
  if (!activities?.length) return null;
  return <ul className="update-tags" aria-label="Topics">{activities.map((key) => <li key={key}>{topics[key]}</li>)}</ul>;
}

export function News({ compact = false }: { compact?: boolean }) {
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const items = news.filter((item) => (!topic || item.activities.some((tag) => tag === topic)) && (!source || item.source === source));
  const Heading = compact ? "h4" : "h2";
  return <div className={compact ? "news-feed news-feed--compact" : "news-feed"}>
    {!compact && <div className="updates-filters">
      <TopicSelect value={topic} change={setTopic} />
      <label>Source<select value={source} onChange={(event) => setSource(event.target.value)}>
        <option value="">All sources</option>
        {[...new Set(news.map((item) => item.source))].map((name) => <option key={name}>{name}</option>)}
      </select></label>
    </div>}
    <div className="news-cards">
      {(compact ? items.slice(0, 2) : items).map((item, index) => (
        <article className={`update-item news-card${!compact && index === 0 ? " news-spotlight" : ""}`} key={item.title}>
          {!compact && index === 0 && <img src={item.activities.some((activity) => activity === "study") ? studyImage : item.activities.some((activity) => activity === "research") ? researchImage : workImage} alt="" />}
          <div className="news-copy">
          <p className="update-meta">
            <span>{item.source}</span>
            <time dateTime={item.date}>{dateLabel(item.date)}</time>
          </p>
          <Heading>{item.title}</Heading>
          <p>{item.summary}</p>
          <Tags activities={item.activities} />
          <a className="text-link" href={item.url}>Read the story</a>
          </div>
        </article>
      ))}
    </div>
    {!items.length && <p role="status">No stories match these filters</p>}
  </div>;
}

const eventType = (event: ContentItem) => event.data.category ??
  (/\broundtable\b/i.test(event.title) ? "Roundtable" : event.data.type === "training" ? "Workshop" : "Event");
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const todayAtYork = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Toronto", dateStyle: "short" }).format(new Date());
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayMonth = new Intl.DateTimeFormat("en-CA", { month: "short", timeZone: "UTC" });

function EventDate({ date }: { date: string }) {
  return <time className="event-date" dateTime={date} aria-label={dateLabel(date)}>
    <span>{dayMonth.format(new Date(date + "T00:00:00Z"))}</span><strong>{Number(date.slice(8))}</strong>
  </time>;
}

function eventTime(startTime?: string, timezone?: string) {
  if (!startTime) return "";
  const clock = new Date(`2000-01-01T${startTime}Z`);
  const time = Number.isNaN(clock.getTime()) ? startTime
    : new Intl.DateTimeFormat("en-CA", { hour: "numeric", minute: "numeric", timeZone: "UTC" }).format(clock);
  return [time, timezone === "America/Toronto" ? "ET" : timezone].filter(Boolean).join(" ");
}

function EventDetails({ event, heading: Heading }: { event: ContentItem; heading: "h2" | "h3" | "h4" }) {
  const { startTime, allDay, timezone, organizer, location, audience, summary, onlineLink, sourceUrl, activities, demo } = event.data;
  const link = onlineLink || sourceUrl;
  const host = demo && organizer === "AI @ York demo" ? "AI @ York" : organizer;
  return <div className="event-details">
    <p className="status">{eventType(event)}</p>
    <Heading>{event.title}</Heading>
    {summary && <p>{summary}</p>}
    <p className="event-logistics">{[allDay ? "All day" : eventTime(startTime, timezone), location, host, audience].filter(Boolean).join(" · ")}</p>
    <Tags activities={activities} />
    {link && <a className="text-link" href={link}>Event details<span className="visually-hidden"> for {event.title}</span></a>}
  </div>;
}

function EventRows({ events, compact }: { events: ContentItem[]; compact?: boolean }) {
  return <div className="event-agenda">{events.map((event) => <article className="event-entry" key={event.id}>
    <EventDate date={event.data.date} />
    <EventDetails event={event} heading={compact ? "h4" : "h3"} />
  </article>)}</div>;
}

function UpcomingAgenda({ events }: { events: ContentItem[] }) {
  const byMonth = new Map<string, ContentItem[]>();
  for (const event of events) {
    const month = event.data.date.slice(0, 7);
    const group = byMonth.get(month) ?? [];
    group.push(event);
    byMonth.set(month, group);
  }
  return <>{[...byMonth].map(([month, items]) =>
    <section className="agenda-month" key={month} aria-labelledby={`agenda-month-${month}`}>
      <h3 id={`agenda-month-${month}`}>{monthFormat.format(new Date(month + "-01T00:00:00Z"))}</h3>
      <EventRows events={items} compact />
    </section>
  )}</>;
}

export function Calendar({ events }: { events: ContentItem[] }) {
  const today = todayAtYork();
  const [mode, setMode] = useState<"agenda" | "month">("agenda");
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState("");
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState("");
  const start = new Date(month + "-01T00:00:00Z");
  const move = (offset: number) => {
    setMonth(isoDate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1))).slice(0, 7));
    setSelectedDay("");
  };
  const dates = Array.from({ length: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate() }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`);
  const filtered = events.filter((event) => (!topic || event.data.activities?.includes(topic)) &&
    (!kind || (["event", "training"].includes(kind) ? event.data.type === kind : eventType(event) === kind)));
  const upcoming = filtered.filter(({ data }) => data.date >= today);
  const featured = upcoming[0];
  const monthEvents = filtered.filter(({ data }) => data.date.startsWith(month));
  const eventsByDay = new Map<string, number>();
  for (const { data } of monthEvents) eventsByDay.set(data.date, (eventsByDay.get(data.date) ?? 0) + 1);
  const visible = selectedDay ? monthEvents.filter(({ data }) => data.date === selectedDay) : monthEvents;
  const next = filtered.find(({ data }) => data.date.slice(0, 7) > month);
  const categories = [...new Set(events.map(eventType))].filter((label) => label !== "Event" && label !== "Workshop");

  return <div className="calendar-page">
    <header className="calendar-cover"><div className="shell">
      <div className="listing-head"><h1>AI calendar</h1><p className="lead">Workshops, roundtables and community sessions across York</p></div>
      {featured && <article className="event-feature">
        <div className="event-feature-copy" key={featured.id}>
          <div className="event-feature-meta"><p className="eyebrow">Next up</p><EventDate date={featured.data.date} /></div>
          <EventDetails event={featured} heading="h2" />
        </div>
        <div className="event-feature-media">
          <img src={featured.data.activities?.includes("research") ? researchImage : featured.data.activities?.includes("teach") ? eventImage : workImage} alt="" />
        </div>
      </article>}
    </div></header>
    <section className="shell calendar-layout" aria-label="Browse events">
      <div className="calendar-controls">
        <div className="view-selector" role="group" aria-label="Event view">
          <button type="button" aria-pressed={mode === "agenda"} onClick={() => setMode("agenda")}><Icon name="agenda" />Agenda</button>
          <button type="button" aria-pressed={mode === "month"} onClick={() => setMode("month")}><Icon name="calendar" />Month</button>
        </div>
        <div className="updates-filters">
          <TopicSelect value={topic} change={(value) => { setTopic(value); setSelectedDay(""); }} />
          <label>Event type<select value={kind} onChange={(event) => { setKind(event.target.value); setSelectedDay(""); }}>
            <option value="">All types</option><option value="event">Event</option><option value="training">Workshop</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select></label>
        </div>
      </div>
      {mode === "agenda" ? <div className="calendar-agenda">
        {upcoming.length > 1 && <><h2>Upcoming events</h2><UpcomingAgenda events={upcoming.slice(1)} /></>}
        {!upcoming.length && <p role="status">No upcoming events match these filters.</p>}
      </div> : <div className="calendar-month">
        <div className="calendar-board">
          <div className="calendar-toolbar">
            <h2 aria-live="polite">{monthFormat.format(start)}</h2>
            <div className="month-actions">
              <button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Previous month"><Icon name="previous" /></button>
              <button type="button" className="icon-button" onClick={() => move(1)} aria-label="Next month"><Icon name="next" /></button>
            </div>
          </div>
          <div className="calendar-grid" role="group" aria-label={monthFormat.format(start)}>
            {weekdays.map((day) => <span key={day} className="calendar-weekday">{day}</span>)}
            {Array.from({ length: start.getUTCDay() }, (_, index) => <span key={index} aria-hidden="true" />)}
            {dates.map((date, index) => {
              const count = eventsByDay.get(date);
              const current = date === today ? "date" : undefined;
              return count ? <button key={date} aria-current={current} aria-pressed={selectedDay === date} aria-label={`${dateLabel(date)}, ${count} ${count === 1 ? "event" : "events"}`}
                onClick={() => setSelectedDay(selectedDay === date ? "" : date)}>{index + 1}<span aria-hidden="true" className="calendar-dot" /></button> :
                <span key={date} className="calendar-day" aria-current={current}>{index + 1}</span>;
            })}
          </div>
          {next && <button className="text-button" onClick={() => { setMonth(next.data.date.slice(0, 7)); setSelectedDay(""); }}>Next month with events</button>}
        </div>
        <div className="calendar-month-events">
          <h2>{selectedDay ? dateLabel(selectedDay) : "This month"}</h2>
          {selectedDay && <button className="text-button" onClick={() => setSelectedDay("")}>Show all events this month</button>}
          <div aria-live="polite">{visible.length ? <EventRows events={visible} /> : <p>No events match this view.</p>}</div>
        </div>
      </div>}
    </section>
  </div>;
}

export function Upcoming({ events }: { events: ContentItem[] }) {
  const upcoming = events.filter(({ data }) => data.date >= todayAtYork()).slice(0, 2);
  return upcoming.length ? <EventRows events={upcoming} compact /> : <p>No upcoming events are listed</p>;
}
