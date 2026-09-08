import { useCallback, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Select,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import { TrashIcon, UploadIcon } from "@sanity/icons";
import { useClient } from "sanity";

// Mirrors the tag list in sanity/schemaTypes/councilDocument.ts
const COMMITTEES: { value: string; label: string }[] = [
  { value: "full-council", label: "Full Council" },
  { value: "finance-personnel", label: "Finance & Personnel" },
  { value: "tourism-marketing", label: "Tourism & Marketing" },
  { value: "annual-assembly", label: "Annual Assembly" },
  { value: "joint-committee", label: "Joint Committee" },
  { value: "governance", label: "Governance" },
  { value: "finance", label: "Finance" },
  { value: "archived", label: "Archived" },
];

// Mirrors the documentType list in the schema
const DOC_TYPES: { value: string; label: string }[] = [
  { value: "agenda", label: "Agenda" },
  { value: "minutes", label: "Minutes" },
  { value: "policy", label: "Policy" },
  { value: "decision", label: "Decision" },
  { value: "agm", label: "AGM Notes" },
  { value: "financial", label: "Financial Report" },
  { value: "other", label: "Other" },
];

function guessType(filename: string): string {
  const f = filename.toLowerCase();
  if (/agenda/.test(f)) return "agenda";
  if (/minute/.test(f)) return "minutes";
  if (/policy|standing.?order|regulation/.test(f)) return "policy";
  if (/agm|annual.?assembly/.test(f)) return "agm";
  if (/financ|budget|agar|payment|receipt|income|expenditure|balance|precept|audit/.test(f)) return "financial";
  return "other";
}

function cleanTitle(filename: string): string {
  return filename
    .replace(/\.(pdf|docx?|xlsx?)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type RowStatus = "pending" | "uploading" | "done" | "error";

interface Row {
  id: string;
  file: File;
  title: string;
  docType: string;
  status: RowStatus;
  error?: string;
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx";

export function BulkUploadTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [committee, setCommittee] = useState("full-council");
  const [meetingDate, setMeetingDate] = useState(todayISO());
  const [clerksOnly, setClerksOnly] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted = /\.(pdf|docx?|xlsx?)$/i;
    const next: Row[] = [];
    for (const file of Array.from(files)) {
      if (!accepted.test(file.name)) continue;
      next.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        title: cleanTitle(file.name),
        docType: guessType(file.name),
        status: "pending",
      });
    }
    setRows((prev) => [...prev, ...next]);
  }, []);

  const updateRow = useCallback((id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const uploadAll = useCallback(async () => {
    if (!meetingDate) {
      toast.push({ status: "warning", title: "Set the meeting date first" });
      return;
    }
    setBusy(true);
    let ok = 0;
    let failed = 0;

    for (const row of rows) {
      if (row.status === "done") continue;
      updateRow(row.id, { status: "uploading", error: undefined });
      try {
        const asset = await client.assets.upload("file", row.file, {
          filename: row.file.name,
        });
        await client.create({
          _type: "councilDocument",
          title: row.title,
          slug: { _type: "slug", current: slugify(row.title) },
          documentType: row.docType,
          date: meetingDate,
          meetingDate,
          visibility: clerksOnly ? "clerksOnly" : "public",
          tags: [committee],
          file: {
            _type: "file",
            asset: { _type: "reference", _ref: asset._id },
          },
        });
        updateRow(row.id, { status: "done" });
        ok++;
      } catch (err) {
        updateRow(row.id, { status: "error", error: String(err) });
        failed++;
      }
    }

    setBusy(false);
    toast.push({
      status: failed ? "warning" : "success",
      title: failed
        ? `${ok} uploaded, ${failed} failed — see the list for details`
        : `${ok} document${ok === 1 ? "" : "s"} uploaded and published`,
    });
  }, [client, clerksOnly, committee, meetingDate, rows, toast, updateRow]);

  const pendingCount = rows.filter((r) => r.status !== "done").length;

  return (
    <Container width={2} padding={4}>
      <Stack space={4}>
        <Heading as="h1" size={2}>
          Bulk Upload Meeting Documents
        </Heading>
        <Text muted size={1}>
          Choose the committee and meeting date once, then drop in every document for
          that meeting — agenda, minutes and supporting papers together. Titles are
          taken from the filenames and the type is guessed; adjust either before
          uploading. Documents publish immediately.
        </Text>

        <Card padding={3} radius={2} border>
          <Flex gap={3} wrap="wrap" align="flex-end">
            <Stack space={2} style={{ minWidth: 220 }}>
              <Text size={1} weight="semibold">
                Committee
              </Text>
              <Select
                value={committee}
                onChange={(e) => setCommittee(e.currentTarget.value)}
              >
                {COMMITTEES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Stack>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Meeting date
              </Text>
              <TextInput
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.currentTarget.value)}
              />
            </Stack>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Visibility
              </Text>
              <Select
                value={clerksOnly ? "clerksOnly" : "public"}
                onChange={(e) => setClerksOnly(e.currentTarget.value === "clerksOnly")}
              >
                <option value="public">Public</option>
                <option value="clerksOnly">Clerk only</option>
              </Select>
            </Stack>
          </Flex>
        </Card>

        <Card
          padding={5}
          radius={2}
          border
          tone="primary"
          style={{ borderStyle: "dashed", cursor: "pointer", textAlign: "center" }}
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          <Stack space={3}>
            <Text align="center" muted>
              <UploadIcon style={{ fontSize: 24 }} />
            </Text>
            <Text align="center" weight="semibold">
              Drop files here, or click to choose
            </Text>
            <Text align="center" muted size={1}>
              PDF, Word or Excel — as many as you like
            </Text>
          </Stack>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={ACCEPT}
            style={{ display: "none" }}
            onChange={(e) => {
              addFiles(e.currentTarget.files);
              e.currentTarget.value = "";
            }}
          />
        </Card>

        {rows.length > 0 && (
          <Stack space={2}>
            {rows.map((row) => (
              <Card key={row.id} padding={3} radius={2} border>
                <Flex gap={3} align="center" wrap="wrap">
                  <Box flex={2} style={{ minWidth: 200 }}>
                    <Stack space={2}>
                      <TextInput
                        value={row.title}
                        disabled={row.status === "uploading" || row.status === "done"}
                        onChange={(e) =>
                          updateRow(row.id, { title: e.currentTarget.value })
                        }
                      />
                      <Text size={0} muted>
                        {row.file.name} · {(row.file.size / 1024).toFixed(0)} KB
                      </Text>
                    </Stack>
                  </Box>
                  <Box style={{ minWidth: 150 }}>
                    <Select
                      value={row.docType}
                      disabled={row.status === "uploading" || row.status === "done"}
                      onChange={(e) =>
                        updateRow(row.id, { docType: e.currentTarget.value })
                      }
                    >
                      {DOC_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    {row.status === "pending" && <Badge tone="default">Ready</Badge>}
                    {row.status === "uploading" && <Badge tone="caution">Uploading…</Badge>}
                    {row.status === "done" && <Badge tone="positive">Published</Badge>}
                    {row.status === "error" && <Badge tone="critical">Failed</Badge>}
                  </Box>
                  {row.status !== "done" && (
                    <Button
                      icon={TrashIcon}
                      mode="bleed"
                      tone="critical"
                      disabled={busy}
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove"
                    />
                  )}
                </Flex>
                {row.error && (
                  <Box marginTop={2}>
                    <Text size={1} muted>
                      {row.error}
                    </Text>
                  </Box>
                )}
              </Card>
            ))}
          </Stack>
        )}

        <Flex gap={3}>
          <Button
            text={
              busy
                ? "Uploading…"
                : `Upload ${pendingCount} document${pendingCount === 1 ? "" : "s"}`
            }
            tone="primary"
            icon={UploadIcon}
            disabled={busy || pendingCount === 0}
            onClick={uploadAll}
          />
          {rows.some((r) => r.status === "done") && !busy && (
            <Button
              text="Clear finished"
              mode="ghost"
              onClick={() => setRows((prev) => prev.filter((r) => r.status !== "done"))}
            />
          )}
        </Flex>
      </Stack>
    </Container>
  );
}
