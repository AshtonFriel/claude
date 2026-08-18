"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES, topicPath } from "@/lib/catalog";
import { TOPICS } from "@/lib/topics";

/** Global ⌘K / Ctrl+K palette: jump to any topic, the dashboard, or race mode. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Jump to a topic" className="cmdk">
      <Command.Input placeholder="Jump to a topic…" />
      <Command.List>
        <Command.Empty>No topic matches.</Command.Empty>
        <Command.Group heading="Pages">
          <Command.Item onSelect={() => go("/dashboard")}>📊 Dashboard</Command.Item>
          <Command.Item onSelect={() => go("/race")}>🏁 Algorithm Race</Command.Item>
        </Command.Group>
        {CATEGORIES.map((cat) => {
          const items = TOPICS.filter((t) => t.category === cat.title);
          if (!items.length) return null;
          return (
            <Command.Group key={cat.slug} heading={cat.title}>
              {items.map((t) => (
                <Command.Item key={t.id} value={`${t.title} ${cat.title}`} onSelect={() => go(topicPath(t))}>
                  {t.title}
                  <span className="cmdk-tag">{t.tagline}</span>
                </Command.Item>
              ))}
            </Command.Group>
          );
        })}
      </Command.List>
    </Command.Dialog>
  );
}
