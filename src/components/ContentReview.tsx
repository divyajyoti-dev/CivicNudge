"use client";
import { useState } from "react";
import {
  Bill,
  PersonaParams,
  GeneratedContent,
  Platform,
  StoryContent,
  ImageContent,
  AudioContent,
  SMSContent,
  EmailContent,
} from "@/lib/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  story: "Story",
  image: "Image Post",
  audio: "Audio",
  sms: "SMS",
  email: "Email",
};

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function EditableBlock({ value: init, rows = 3 }: { value: string; rows?: number }) {
  const [val, setVal] = useState(init || "");
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <textarea
        autoFocus
        value={val}
        rows={rows}
        onChange={e => setVal(e.target.value)}
        onBlur={() => setEditing(false)}
        style={{
          width: "100%",
          border: "1.5px solid #0f172a",
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 13,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          lineHeight: 1.6,
          background: "#fff",
        }}
      />
    );
  }
  return (
    <p
      onClick={() => setEditing(true)}
      style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7, cursor: "text" }}
    >
      {val || <span style={{ color: "#cbd5e1" }}>No content</span>}
      {val && <span style={{ fontSize: 10, color: "#cbd5e1", marginLeft: 4 }}>✏</span>}
    </p>
  );
}

function StorySlide({
  text,
  bg,
  index,
  total,
}: {
  text: string;
  bg: string;
  index: number;
  total: number;
}) {
  const [val, setVal] = useState(text);
  const [editing, setEditing] = useState(false);
  const labels = ["Hook", "Context", "CTA"];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        onClick={() => !editing && setEditing(true)}
        style={{
          width: 124,
          height: 216,
          borderRadius: 18,
          background: bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 12,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {index + 1}/{total}
        </div>
        {editing ? (
          <textarea
            autoFocus
            value={val}
            rows={4}
            onChange={e => setVal(e.target.value)}
            onBlur={() => setEditing(false)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 11,
              lineHeight: 1.5,
              resize: "none",
              outline: "none",
              padding: "6px 8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <p style={{ margin: 0, color: "#fff", fontSize: 11, lineHeight: 1.6, fontWeight: 500 }}>{val}</p>
        )}
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#94a3b8",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {labels[index]}
      </span>
    </div>
  );
}

function StoryTab({ content }: { content: StoryContent }) {
  const bgs = [
    "linear-gradient(160deg, #1e293b, #334155)",
    "linear-gradient(160deg, #0c4a6e, #0369a1)",
    "linear-gradient(160deg, #1e1b4b, #3730a3)",
  ];
  const slides = [content.slide1, content.slide2, content.slide3].filter(Boolean);

  return (
    <div>
      <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 20 }}>
        {slides.map((text, i) => (
          <StorySlide key={i} text={text} bg={bgs[i % bgs.length]} index={i} total={slides.length} />
        ))}
      </div>
      {content.caption && (
        <ContentCard title="Caption">
          <EditableBlock value={content.caption} rows={2} />
        </ContentCard>
      )}
    </div>
  );
}

function ImageTab({ content }: { content: ImageContent }) {
  return (
    <div>
      <div
        style={{
          background: "#1e293b",
          borderRadius: 14,
          aspectRatio: "1/1",
          maxWidth: 280,
          margin: "0 auto 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <p
          style={{
            margin: 0,
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
          }}
        >
          {content.headline}
        </p>
        {content.body && (
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.5 }}>
            {content.body}
          </p>
        )}
      </div>
      {content.caption && (
        <ContentCard title="Caption">
          <EditableBlock value={content.caption} rows={2} />
        </ContentCard>
      )}
    </div>
  );
}

function AudioTab({ content }: { content: AudioContent }) {
  return (
    <div>
      <ContentCard title="Intro">
        <EditableBlock value={content.intro} rows={3} />
      </ContentCard>
      <ContentCard title="Body">
        <EditableBlock value={content.body} rows={5} />
      </ContentCard>
      <ContentCard title="CTA">
        <EditableBlock value={content.cta} rows={2} />
      </ContentCard>
    </div>
  );
}

function SMSTab({ content }: { content: SMSContent }) {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [textEn, setTextEn] = useState(content.text || "");
  const [textEs, setTextEs] = useState(content.text_es || "");
  const [editing, setEditing] = useState(false);
  const current = lang === "en" ? textEn : textEs;
  const setCurrent = lang === "en" ? setTextEn : setTextEs;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div
          style={{
            width: 252,
            background: "#1a1a1a",
            borderRadius: 32,
            padding: "26px 14px 18px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ width: 48, height: 4, background: "#333", borderRadius: 2 }} />
          </div>
          <div style={{ background: "#f1f5f9", borderRadius: 18, padding: "14px 12px", minHeight: 90 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginBottom: 10 }}>
              Today 9:41 AM
            </div>
            {current ? (
              <div
                style={{
                  background: "#0f172a",
                  color: "#fff",
                  borderRadius: "16px 16px 4px 16px",
                  padding: "10px 13px",
                  fontSize: 12,
                  lineHeight: 1.6,
                  maxWidth: "88%",
                  wordBreak: "break-word",
                }}
              >
                {editing ? (
                  <textarea
                    autoFocus
                    value={current}
                    rows={4}
                    onChange={e => setCurrent(e.target.value)}
                    onBlur={() => setEditing(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: 12,
                      outline: "none",
                      width: "100%",
                      resize: "none",
                      lineHeight: 1.6,
                      padding: 0,
                    }}
                  />
                ) : (
                  <span onClick={() => setEditing(true)} style={{ cursor: "text" }}>
                    {current}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: 12 }}>
                No content for this language
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 0",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {(["en", "es"] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: `1.5px solid ${lang === l ? "#0f172a" : "rgba(0,0,0,0.1)"}`,
                background: lang === l ? "#f1f5f9" : "#fff",
                color: lang === l ? "#0f172a" : "#64748b",
                fontSize: 12,
                fontWeight: lang === l ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {l === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
        <span
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: 12,
            color: current.length > 160 ? "#dc2626" : "#94a3b8",
          }}
        >
          {current.length}/160
        </span>
      </div>
    </div>
  );
}

function EmailTab({ content }: { content: EmailContent }) {
  return (
    <div>
      <ContentCard title="Subject Line">
        <EditableBlock value={content.subject} rows={1} />
      </ContentCard>
      <ContentCard title="Preview Text">
        <EditableBlock value={content.preview} rows={1} />
      </ContentCard>
      <ContentCard title="Body">
        <EditableBlock value={content.body} rows={6} />
      </ContentCard>
    </div>
  );
}

interface ContentReviewProps {
  bill: Bill;
  persona: PersonaParams;
  content: GeneratedContent;
  onApprove: () => void;
  approved: boolean;
}

export default function ContentReview({
  bill,
  persona,
  content,
  onApprove,
  approved,
}: ContentReviewProps) {
  const platforms = persona.platforms || [];
  const [activeTab, setActiveTab] = useState<Platform>(platforms[0] || "story");

  const renderContent = (platform: Platform) => {
    const pc = content.platforms?.[platform];
    if (!pc)
      return (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>
          No content generated for this platform.
        </div>
      );
    if (platform === "story") return <StoryTab content={pc as StoryContent} />;
    if (platform === "image") return <ImageTab content={pc as ImageContent} />;
    if (platform === "audio") return <AudioTab content={pc as AudioContent} />;
    if (platform === "sms") return <SMSTab content={pc as SMSContent} />;
    if (platform === "email") return <EmailTab content={pc as EmailContent} />;
    return null;
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "252px 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 10,
                color: "#94a3b8",
                marginBottom: 4,
              }}
            >
              {bill.code}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#0f172a",
                marginBottom: 14,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {bill.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#475569",
                lineHeight: 1.7,
                background: "#f8fafc",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              {content.relevanceSummary}
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "16px 18px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Community
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
              {persona.description}
            </p>
          </div>

          <button
            onClick={onApprove}
            disabled={approved}
            style={{
              padding: 14,
              borderRadius: 12,
              background: approved ? "#f0fdf4" : "#0f172a",
              color: approved ? "#16a34a" : "#fff",
              border: approved ? "1.5px solid #bbf7d0" : "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: approved ? "default" : "pointer",
              letterSpacing: "-0.02em",
              transition: "all 0.3s",
              boxShadow: approved ? "none" : "0 4px 14px rgba(0,0,0,0.18)",
              width: "100%",
            }}
          >
            {approved ? "✓ Campaign Queued" : "Approve & Distribute →"}
          </button>
          {approved && (
            <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", margin: 0 }}>
              Queued for <strong>10,000 recipients</strong>
            </p>
          )}
        </div>

        {/* Right column */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "20px 22px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: activeTab === p ? "#f1f5f9" : "transparent",
                  color: activeTab === p ? "#0f172a" : "#94a3b8",
                  fontSize: 13,
                  fontWeight: activeTab === p ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                {PLATFORM_LABELS[p] || p}
              </button>
            ))}
          </div>
          {renderContent(activeTab)}
        </div>
      </div>
    </div>
  );
}
