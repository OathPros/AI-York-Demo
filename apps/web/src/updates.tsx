import React, { useState } from "react";
import type { Activity, ContentItem } from "@ai-york/contracts";

const topics: Record<Activity, string> = { study: "Study", teach: "Teaching", research: "Research", work: "Work" };
const dateFormat = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
const dateLabel = (value: string) => dateFormat.format(new Date(value + "T00:00:00Z"));

const news = [
  { date: "2026-09-09", source: "YFile", url: "https://www.yorku.ca/yfile/2026/09/09/york-professor-explores-how-ai-can-deepen-learning-in-the-classroom/", title: "Using AI to support deeper learning", summary: "A York instructor explores how AI-generated questions can encourage students to explain their reasoning and engage more deeply with course material.", activities: ["study", "teach"] },
  { date: "2026-07-15", source: "YFile", url: "https://www.yorku.ca/yfile/2026/07/15/ai-innovation-at-york-u-starts-with-human-intelligence/", title: "A closer look at AI innovation across York", summary: "Discover research and innovation spanning health, climate and business, and the people shaping how AI is used.", activities: ["research", "work"] },
  { date: "2026-07-15", source: "YFile", url: "https://www.yorku.ca/yfile/2026/07/15/how-york-researchers-are-using-ai-to-support-cancer-care/", title: "Supporting cancer care with AI research", summary: "York researchers are exploring ways AI can help specialists analyze medical images and make more informed decisions.", activities: ["research"] },
  { date: "2026-07-15", source: "YFile", url: "https://www.yorku.ca/yfile/2026/07/15/can-ai-be-trusted-to-assess-climate-risks-a-york-study-investigates/", title: "Investigating AI and climate risk", summary: "Research at York examines the responsible use of AI in understanding environmental and climate-related risks.", activities: ["research"] }
] satisfies { date: string; source: string; url: string; title: string; summary: string; activities: Activity[] }[];

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
      {(compact ? items.slice(0, 2) : items).map((item) => (
        <article className="update-item news-card" key={item.title}>
          <p className="update-meta">
            <span>{item.source}</span>
            <time dateTime={item.date}>{dateLabel(item.date)}</time>
          </p>
          <Heading>{item.title}</Heading>
          <p>{item.summary}</p>
          <Tags activities={item.activities} />
          <a className="text-link" href={item.url}>Read the story <span aria-hidden="true">→</span></a>
        </article>
      ))}
    </div>
    {!items.length && <p role="status">No stories match these filters</p>}
  </div>;
}

function EventRows({ events, compact }: { events: ContentItem[]; compact?: boolean }) {
  const Heading = compact ? "h4" : "h2";
  return <div className="event-agenda">{events.map((event) => {
    const { date, startTime, allDay, timezone, organizer, location, audience, summary, onlineLink, sourceUrl, activities, demo, type } = event.data;
    const link = onlineLink || sourceUrl;
    return <article className="update-item" key={event.id}>
      <p className="update-meta"><time dateTime={date}>{dateLabel(date)}</time> · {type === "training" ? "Workshop" : "Event"}</p>
      <Heading>{event.title}</Heading>
      <p>{[allDay ? "All day" : startTime && `${startTime} (${timezone})`, location, demo && organizer === "AI @ York demo" ? "AI @ York" : organizer, audience].filter(Boolean).join(" · ")}</p>
      {summary && <p>{summary}</p>}
      <Tags activities={activities} />
      {link && <a className="text-link" href={link}>Event details</a>}
    </article>;
  })}</div>;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function Calendar({ events }: { events: ContentItem[] }) {
  const [month, setMonth] = useState(() => isoDate(new Date()).slice(0, 7));
  const [selectedDay, setSelectedDay] = useState("");
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState("");
  const start = new Date(month + "-01T00:00:00Z");
  const move = (offset: number) => {
    setMonth(isoDate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1))).slice(0, 7));
    setSelectedDay("");
  };
  const dates = Array.from({ length: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate() }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`);
  const filtered = events.filter(({ data }) => (!topic || data.activities?.includes(topic)) && (!kind || data.type === kind));
  const monthEvents = filtered.filter(({ data }) => data.date.startsWith(month));
  const visible = selectedDay ? monthEvents.filter(({ data }) => data.date === selectedDay) : monthEvents;
  const next = filtered.find(({ data }) => data.date.slice(0, 7) > month);

  return <div className="calendar-layout">
    <div className="updates-filters">
      <TopicSelect value={topic} change={(value) => { setTopic(value); setSelectedDay(""); }} />
      <label>Event type<select value={kind} onChange={(event) => { setKind(event.target.value); setSelectedDay(""); }}>
        <option value="">All types</option><option value="event">Event</option><option value="training">Workshop</option>
      </select></label>
    </div>
    <div className="calendar-toolbar">
      <button type="button" onClick={() => move(-1)} aria-label="Previous month">‹</button>
      <h2 aria-live="polite">{monthFormat.format(start)}</h2>
      <button type="button" onClick={() => move(1)} aria-label="Next month">›</button>
    </div>
    <div className="calendar-grid" role="group" aria-label={monthFormat.format(start)}>
      {weekdays.map((day) => <span key={day} className="calendar-weekday">{day}</span>)}
      {Array.from({ length: start.getUTCDay() }, (_, index) => <span key={index} aria-hidden="true" />)}
      {dates.map((date, index) => {
        const count = monthEvents.filter(({ data }) => data.date === date).length;
        return count ? <button key={date} aria-pressed={selectedDay === date} aria-label={`${dateLabel(date)}, ${count} ${count === 1 ? "event" : "events"}`}
          onClick={() => setSelectedDay(selectedDay === date ? "" : date)}>{index + 1}<span aria-hidden="true" className="calendar-dot" /></button> :
          <span key={date} className="calendar-day">{index + 1}</span>;
      })}
    </div>
    {selectedDay && <button className="text-button" onClick={() => setSelectedDay("")}>Show all events this month</button>}
    <div aria-live="polite">
      {visible.length ? <EventRows events={visible} /> : <p>No events match this view</p>}
    </div>
    {next && <button className="button" onClick={() => { setMonth(next.data.date.slice(0, 7)); setSelectedDay(""); }}>Next month with events</button>}
  </div>;
}

export function Upcoming({ events }: { events: ContentItem[] }) {
  const upcoming = events.filter(({ data }) => data.date >= isoDate(new Date())).slice(0, 2);
  return upcoming.length ? <EventRows events={upcoming} compact /> : <p>No upcoming events are listed</p>;
}
