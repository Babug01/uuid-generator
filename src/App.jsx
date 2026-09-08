import { useState } from "react";
import Header from "./components/Header";

const REPO_URL = "https://github.com/Babug01/uuid-generator";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

const VERSION_LABELS = {
  1: "Time-based (v1)",
  2: "DCE Security (v2)",
  3: "Name-based, MD5 (v3)",
  4: "Random (v4)",
  5: "Name-based, SHA-1 (v5)",
  6: "Reordered time-based (v6)",
  7: "Unix Epoch time-based (v7)",
  8: "Custom (v8)",
};

function variantLabel(nibble) {
  if (nibble >= 0 && nibble <= 7) return "Reserved, NCS backward compatibility";
  if (nibble >= 8 && nibble <= 11) return "RFC 4122 / RFC 9562";
  if (nibble === 12 || nibble === 13) return "Reserved, Microsoft backward compatibility";
  return "Reserved for future definition";
}

// The version nibble is the first hex digit of the 3rd group; the variant
// nibble is the first hex digit of the 4th group — fixed positions (14 and
// 19) in the canonical 8-4-4-4-12 string, regardless of what version/variant
// the UUID actually turns out to be.
function decodeUuid(input) {
  const str = String(input || "").trim().toLowerCase();
  if (!UUID_RE.test(str)) return { valid: false };

  if (str === NIL_UUID) return { valid: true, special: "nil", uuid: str };
  if (str === MAX_UUID) return { valid: true, special: "max", uuid: str };

  const versionNibble = parseInt(str[14], 16);
  const variantNibble = parseInt(str[19], 16);

  return {
    valid: true,
    uuid: str,
    version: versionNibble,
    versionLabel: VERSION_LABELS[versionNibble] || `Unrecognized version nibble (${versionNibble})`,
    variant: variantLabel(variantNibble),
  };
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const styles = {
  root: { minHeight: "100dvh", display: "flex", flexDirection: "column" },
  content: { fontFamily: "system-ui, sans-serif", padding: "24px 32px", maxWidth: 800, margin: "0 auto", color: "var(--text, #1a1a1a)", width: "100%", boxSizing: "border-box", background: "var(--bg-subtle, #f0efed)", flex: 1 },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 13, opacity: 0.6, margin: "4px 0 20px" },
  tabs: { display: "flex", gap: 8, marginBottom: 20 },
  tabBtn: (active) => ({
    padding: "8px 16px", borderRadius: 8, border: active ? "none" : "1px solid var(--border, #e5e7eb)",
    background: active ? "var(--accent, #4f46e5)" : "transparent", color: active ? "#fff" : "var(--text, #1a1a1a)",
    cursor: "pointer", fontSize: 13, fontWeight: 600,
  }),
  card: {
    padding: "20px 24px", borderRadius: 10, border: "1px solid var(--border, #e5e7eb)", background: "var(--input-bg, #f9fafb)",
    marginBottom: 20,
  },
  bigUuid: {
    fontSize: 20, fontFamily: "'SFMono-Regular', Consolas, monospace", wordBreak: "break-all",
    marginBottom: 14, color: "var(--text, #1a1a1a)",
  },
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  btn: (kind) => ({
    padding: "9px 18px", borderRadius: 6, border: kind === "primary" ? "none" : "1px solid var(--border, #e5e7eb)",
    background: kind === "primary" ? "var(--accent, #4f46e5)" : "transparent",
    color: kind === "primary" ? "#fff" : "var(--text, #1a1a1a)", cursor: "pointer", fontSize: 13, fontWeight: 600,
  }),
  sectionTitle: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", opacity: 0.6, marginBottom: 10 },
  input: {
    padding: "9px 12px", borderRadius: 6, border: "1px solid var(--border, #e5e7eb)",
    background: "var(--input-bg, #f9fafb)", color: "var(--text, #1a1a1a)", fontSize: 13, width: 100,
    fontFamily: "'SFMono-Regular', Consolas, monospace",
  },
  textInput: {
    padding: "9px 12px", borderRadius: 6, border: "1px solid var(--border, #e5e7eb)",
    background: "var(--input-bg, #f9fafb)", color: "var(--text, #1a1a1a)", fontSize: 13, width: "100%", boxSizing: "border-box",
    fontFamily: "'SFMono-Regular', Consolas, monospace",
  },
  list: {
    width: "100%", minHeight: 160, padding: 12, borderRadius: 8, border: "1px solid var(--border, #e5e7eb)",
    background: "var(--input-bg, #f9fafb)", color: "var(--text, #1a1a1a)", fontSize: 12, boxSizing: "border-box",
    fontFamily: "'SFMono-Regular', Consolas, monospace", resize: "vertical",
  },
  grid: { display: "grid", gridTemplateColumns: "160px 1fr", gap: "8px 16px", fontSize: 13, marginTop: 4 },
  gridLabel: { opacity: 0.6 },
  gridValue: { fontFamily: "'SFMono-Regular', Consolas, monospace", wordBreak: "break-all" },
  badge: (variant) => ({
    display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: variant === "ok" ? "rgba(63,185,80,0.12)" : variant === "special" ? "rgba(79,70,229,0.12)" : "rgba(224,92,92,0.12)",
    color: variant === "ok" ? "#3fb950" : variant === "special" ? "var(--accent, #4f46e5)" : "#e05c5c",
    marginBottom: 12,
  }),
};

function GenerateTab() {
  const [single, setSingle] = useState(() => crypto.randomUUID());
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(10);
  const [bulk, setBulk] = useState([]);
  const [bulkCopied, setBulkCopied] = useState(false);

  function copy(text, setter) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  }

  function generateBulk() {
    const n = Math.min(Math.max(Number(count) || 1, 1), 1000);
    setBulk(Array.from({ length: n }, () => crypto.randomUUID()));
  }

  return (
    <>
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Single UUID v4</div>
        <div style={styles.bigUuid}>{single}</div>
        <div style={styles.row}>
          <button style={styles.btn("primary")} onClick={() => setSingle(crypto.randomUUID())}>Generate New</button>
          <button style={styles.btn("secondary")} onClick={() => copy(single, setCopied)}>{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Bulk Generate</div>
        <div style={{ ...styles.row, marginBottom: 12 }}>
          <input style={styles.input} type="number" min="1" max="1000" value={count} onChange={(e) => setCount(e.target.value)} />
          <button style={styles.btn("primary")} onClick={generateBulk}>Generate {count || 1} UUIDs</button>
          {bulk.length > 0 && (
            <>
              <button style={styles.btn("secondary")} onClick={() => copy(bulk.join("\n"), setBulkCopied)}>{bulkCopied ? "Copied All" : "Copy All"}</button>
              <button style={styles.btn("secondary")} onClick={() => downloadText("uuids.txt", bulk.join("\n"))}>Download .txt</button>
            </>
          )}
        </div>
        {bulk.length > 0 && <textarea style={styles.list} readOnly value={bulk.join("\n")} spellCheck={false} />}
      </div>
    </>
  );
}

function ValidateTab() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  function check(value) {
    setInput(value);
    if (!value.trim()) {
      setResult(null);
      return;
    }
    setResult(decodeUuid(value));
  }

  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>Validate / Decode</div>
      <input
        style={styles.textInput}
        value={input}
        onChange={(e) => check(e.target.value)}
        placeholder="Paste a UUID to validate..."
        spellCheck={false}
      />

      {result && (
        <div style={{ marginTop: 16 }}>
          {!result.valid ? (
            <span style={styles.badge("bad")}>Not a valid UUID — expected 8-4-4-4-12 hex digits</span>
          ) : result.special === "nil" ? (
            <>
              <span style={styles.badge("special")}>Nil UUID</span>
              <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>All-zero UUID, defined by RFC 4122/9562 as a sentinel meaning "no value" — never generated randomly.</p>
            </>
          ) : result.special === "max" ? (
            <>
              <span style={styles.badge("special")}>Max UUID</span>
              <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>All-F UUID, defined by RFC 9562 as the maximum-value sentinel — the counterpart to the nil UUID.</p>
            </>
          ) : (
            <>
              <span style={styles.badge("ok")}>Valid UUID</span>
              <div style={styles.grid}>
                <div style={styles.gridLabel}>Version</div>
                <div style={styles.gridValue}>{result.version} — {result.versionLabel}</div>
                <div style={styles.gridLabel}>Variant</div>
                <div style={styles.gridValue}>{result.variant}</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("generate");

  return (
    <div style={styles.root}>
      <Header repoUrl={REPO_URL} />
      <div style={styles.content}>
        <h1 style={styles.title}>UUID Generator</h1>
        <p style={styles.subtitle}>
          Generate UUID v4s one at a time or in bulk, and validate/decode any UUID-shaped string —
          version, variant, and the nil/max special cases. Nothing leaves your browser.
        </p>

        <div style={styles.tabs}>
          <button style={styles.tabBtn(tab === "generate")} onClick={() => setTab("generate")}>Generate</button>
          <button style={styles.tabBtn(tab === "validate")} onClick={() => setTab("validate")}>Validate / Decode</button>
        </div>

        {tab === "generate" ? <GenerateTab /> : <ValidateTab />}
      </div>
    </div>
  );
}
