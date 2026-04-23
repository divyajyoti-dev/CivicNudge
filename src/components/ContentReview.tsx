"use client";
import { useRef, useState } from "react";
import { Bill, GeneratedCampaign, Platform } from "@/lib/types";

type MediaTab = "image" | "audio" | "music" | "video";

function MediaPanel({
  campaign,
}: {
  campaign: GeneratedCampaign;
}) {
  const [activeMedia, setActiveMedia] = useState<MediaTab>("image");
  const [imageData, setImageData] = useState<{ base64: string; mime: string } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<"idle" | "pending" | "done" | "failed">("idle");
  const [loadingMedia, setLoadingMedia] = useState<MediaTab | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const contextText = campaign.instagram?.slide2 ?? campaign.tweet?.[0] ?? "";
  const hookText = campaign.instagram?.slide1 ?? "";

  async function generateImage() {
    setLoadingMedia("image");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Civic advocacy graphic. ${hookText}. Clean minimal design, bold typography, empowering tone, 9:16 vertical format.`,
        }),
      });
      const data = await res.json();
      if (data.imageBase64) setImageData({ base64: data.imageBase64, mime: data.mimeType });
    } finally {
      setLoadingMedia(null);
    }
  }

  async function generateAudio() {
    setLoadingMedia("audio");
    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: contextText }),
      });
      if (res.ok) {
        const blob = await res.blob();
        setAudioUrl(URL.createObjectURL(blob));
      }
    } finally {
      setLoadingMedia(null);
    }
  }

  async function generateMusic() {
    setLoadingMedia("music");
    try {
      const res = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Uplifting civic background music, 30 seconds, community empowerment theme, hopeful and energetic`,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        setMusicUrl(URL.createObjectURL(blob));
      }
    } finally {
      setLoadingMedia(null);
    }
  }

  async function generateVideo() {
    setLoadingMedia("video");
    setVideoStatus("pending");
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Short vertical video (9:16), civic empowerment theme. ${hookText}. Uplifting, community-focused, 5 seconds.`,
        }),
      });
      const data = await res.json();
      if (!data.taskId) { setVideoStatus("failed"); return; }

      pollRef.current = setInterval(async () => {
        const poll = await fetch(`/api/generate-video?taskId=${data.taskId}`);
        const pollData = await poll.json();
        if (pollData.status === "succeed" && pollData.videoUrl) {
          setVideoUrl(pollData.videoUrl);
          setVideoStatus("done");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (pollData.status === "failed") {
          setVideoStatus("failed");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 5000);
    } finally {
      setLoadingMedia(null);
    }
  }

  const MEDIA_TABS: { id: MediaTab; label: string; icon: string }[] = [
    { id: "image", label: "Image", icon: "🎨" },
    { id: "audio", label: "Narration", icon: "🔊" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "video", label: "Video", icon: "🎬" },
  ];

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Media Generation</p>
      <div className="flex gap-1">
        {MEDIA_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveMedia(t.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeMedia === t.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeMedia === "image" && (
        <div className="space-y-3">
          {!imageData && (
            <button
              onClick={generateImage}
              disabled={loadingMedia === "image"}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMedia === "image" ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating…</> : "🎨 Generate Graphic"}
            </button>
          )}
          {imageData && (
            <div className="space-y-2">
              <img src={`data:${imageData.mime};base64,${imageData.base64}`} alt="Generated graphic" className="max-h-64 rounded-xl border border-slate-200 mx-auto block" />
              <div className="flex gap-2">
                <a href={`data:${imageData.mime};base64,${imageData.base64}`} download="campaign-graphic.png" className="text-sm text-indigo-600 hover:underline">↓ Download</a>
                <button onClick={() => setImageData(null)} className="text-sm text-slate-400 hover:underline">Regenerate</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMedia === "audio" && (
        <div className="space-y-3">
          {!audioUrl && (
            <button
              onClick={generateAudio}
              disabled={loadingMedia === "audio"}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMedia === "audio" ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating…</> : "🔊 Generate Narration"}
            </button>
          )}
          {audioUrl && (
            <div className="space-y-2">
              <audio controls src={audioUrl} className="w-full" />
              <p className="text-xs text-slate-400">Suitable for phone call campaigns and audio ads</p>
              <div className="flex gap-2">
                <a href={audioUrl} download="narration.mp3" className="text-sm text-indigo-600 hover:underline">↓ Download MP3</a>
                <button onClick={() => setAudioUrl(null)} className="text-sm text-slate-400 hover:underline">Regenerate</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMedia === "music" && (
        <div className="space-y-3">
          {!musicUrl && (
            <button
              onClick={generateMusic}
              disabled={loadingMedia === "music"}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMedia === "music" ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating…</> : "🎵 Generate Music"}
            </button>
          )}
          {musicUrl && (
            <div className="space-y-2">
              <audio controls src={musicUrl} className="w-full" />
              <p className="text-xs text-slate-400">30-second background track — export to Spotify ads or social video</p>
              <div className="flex gap-2">
                <a href={musicUrl} download="background-music.mp3" className="text-sm text-indigo-600 hover:underline">↓ Download MP3</a>
                <button onClick={() => setMusicUrl(null)} className="text-sm text-slate-400 hover:underline">Regenerate</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMedia === "video" && (
        <div className="space-y-3">
          {videoStatus === "idle" && (
            <button
              onClick={generateVideo}
              disabled={loadingMedia === "video"}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
            >
              🎬 Generate Video
            </button>
          )}
          {videoStatus === "pending" && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              Generating video — usually ~30s. Polling every 5s…
            </div>
          )}
          {videoStatus === "done" && videoUrl && (
            <div className="space-y-2">
              <video controls src={videoUrl} className="max-h-64 rounded-xl mx-auto block" />
              <a href={videoUrl} download="campaign-video.mp4" className="text-sm text-indigo-600 hover:underline">↓ Download MP4</a>
            </div>
          )}
          {videoStatus === "failed" && (
            <div className="text-sm text-red-500">
              Video generation failed. <button onClick={() => setVideoStatus("idle")} className="underline">Try again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InstagramPreview({ content }: { content: GeneratedCampaign["instagram"] }) {
  const [editedSlide1, setEditedSlide1] = useState(content.slide1);
  const [editedSlide2, setEditedSlide2] = useState(content.slide2);
  const [editedSlide3, setEditedSlide3] = useState(content.slide3);
  const [editedCaption, setEditedCaption] = useState(content.caption);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Slide 1 — Hook", value: editedSlide1, set: setEditedSlide1, bg: "bg-indigo-600" },
          { label: "Slide 2 — Context", value: editedSlide2, set: setEditedSlide2, bg: "bg-slate-700" },
          { label: "Slide 3 — Action", value: editedSlide3, set: setEditedSlide3, bg: "bg-emerald-600" },
        ].map(({ label, value, set, bg }) => (
          <div key={label} className="space-y-1">
            <div className={`${bg} text-white rounded-xl aspect-[9/16] flex items-center justify-center p-3`}>
              <p className="text-xs text-center font-medium leading-relaxed">{value}</p>
            </div>
            <p className="text-xs text-slate-400 text-center">{label}</p>
            <textarea
              rows={2}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="w-full text-xs px-2 py-1 border border-slate-200 rounded resize-none focus:outline-none focus:border-indigo-400"
            />
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-semibold mb-1">Caption</p>
        <textarea
          rows={2}
          value={editedCaption}
          onChange={(e) => setEditedCaption(e.target.value)}
          className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:border-indigo-400"
        />
      </div>
    </div>
  );
}

function TwitterPreview({ tweets }: { tweets: string[] }) {
  const [edited, setEdited] = useState(tweets);
  return (
    <div className="space-y-3">
      {edited.map((tweet, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
              CN
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">CivicNudge</p>
              <p className="text-xs text-slate-400">@civicnudge</p>
            </div>
            <span className="ml-auto text-xs text-slate-400">{i + 1}/{edited.length}</span>
          </div>
          <textarea
            rows={3}
            value={tweet}
            onChange={(e) => {
              const next = [...edited];
              next[i] = e.target.value;
              setEdited(next);
            }}
            className="w-full text-sm text-slate-700 resize-none focus:outline-none"
          />
          <p className="text-xs text-slate-400 text-right">{tweet.length}/280</p>
        </div>
      ))}
    </div>
  );
}

function SMSPreview({ sms, sms_es }: { sms: string; sms_es?: string }) {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [editedEn, setEditedEn] = useState(sms);
  const [editedEs, setEditedEs] = useState(sms_es ?? "");
  const current = lang === "en" ? editedEn : editedEs;

  return (
    <div className="space-y-4">
      {sms_es && (
        <div className="flex gap-2">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                lang === l ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {l === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
      )}
      <div className="bg-slate-100 rounded-2xl p-4 max-w-xs mx-auto">
        <div className="bg-indigo-500 text-white text-sm px-4 py-3 rounded-2xl rounded-bl-sm">
          {current}
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">{current.length}/160 chars</p>
      </div>
      <textarea
        rows={3}
        value={current}
        onChange={(e) => lang === "en" ? setEditedEn(e.target.value) : setEditedEs(e.target.value)}
        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:border-indigo-400"
      />
    </div>
  );
}

export default function ContentReview({
  bill,
  campaign,
  platforms,
  contentMode,
  onApprove,
}: {
  bill: Bill;
  campaign: GeneratedCampaign;
  platforms: Platform[];
  contentMode?: "educate" | "advocate";
  onApprove: () => void;
}) {
  const tabs = platforms.filter((p) =>
    (p === "instagram" && campaign.instagram) ||
    (p === "twitter" && campaign.tweet?.length) ||
    (p === "sms" && campaign.sms)
  );
  const [activeTab, setActiveTab] = useState<Platform>(tabs[0]);
  const [approved, setApproved] = useState(false);

  const TAB_LABELS: Record<Platform, string> = {
    instagram: "📸 Instagram",
    twitter: "𝕏 Twitter",
    sms: "💬 SMS",
  };

  function handleApprove() {
    setApproved(true);
    onApprove();
  }

  return (
    <div className="space-y-4">
      {contentMode === "advocate" && (
        <div className="bg-amber-50 border border-amber-300 text-amber-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 mb-2">
          <span>⚠</span>
          <span>Advocacy content — represents your organization&apos;s position. A neutral version is also available.</span>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-indigo-800">{bill.title}</p>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
            {campaign.relevanceScore}/10
          </span>
        </div>
        <p className="text-sm text-indigo-700 mt-1">{campaign.relevanceSummary}</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {activeTab === "instagram" && <InstagramPreview content={campaign.instagram} />}
        {activeTab === "twitter" && <TwitterPreview tweets={campaign.tweet} />}
        {activeTab === "sms" && <SMSPreview sms={campaign.sms} sms_es={campaign.sms_es} />}
      </div>

      <MediaPanel campaign={campaign} />

      {approved ? (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold text-center py-3 rounded-xl">
          ✓ Campaign queued for 10,000+ recipients
        </div>
      ) : (
        <button
          onClick={handleApprove}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Approve & Distribute →
        </button>
      )}
    </div>
  );
}
