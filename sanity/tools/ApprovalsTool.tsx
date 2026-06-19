import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@sanity/ui";
import { CheckmarkCircleIcon, CloseIcon, RefreshIcon } from "@sanity/icons";
import { useClient } from "sanity";

// The four submittable types and what "approved" / "rejected" means for each.
// These mirror the status filters used by the public GROQ queries in lib/queries.ts.
const TYPE_META: Record<
  string,
  { label: string; approve: string; reject: string }
> = {
  event: { label: "Events", approve: "published", reject: "rejected" },
  venue: { label: "Venues", approve: "active", reject: "inactive" },
  businessListing: { label: "Business Listings", approve: "published", reject: "draft" },
  group: { label: "Groups", approve: "approved", reject: "rejected" },
};

// Groups use status "pending"; everything else uses "pendingApproval".
const PENDING_QUERY = `*[
  (_type == "event" && status == "pendingApproval") ||
  (_type == "venue" && status == "pendingApproval") ||
  (_type == "businessListing" && status == "pendingApproval") ||
  (_type == "group" && status == "pending")
] | order(_createdAt desc) {
  _id, _type, _createdAt,
  "displayTitle": coalesce(title, name),
  submittedBy,
  "contact": coalesce(contactEmail, email, ownerEmail),
  date
}`;

interface PendingDoc {
  _id: string;
  _type: keyof typeof TYPE_META | string;
  _createdAt: string;
  displayTitle?: string;
  submittedBy?: string;
  contact?: string;
  date?: string;
}

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ApprovalsTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const toast = useToast();
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await client.fetch<PendingDoc[]>(PENDING_QUERY);
      setDocs(result);
    } catch (err) {
      toast.push({ status: "error", title: "Could not load pending items", description: String(err) });
    } finally {
      setLoading(false);
    }
  }, [client, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Patch a single document's status. approvedAt is only set on events (the
  // only schema with that field) to avoid "unknown field" warnings elsewhere.
  const setStatus = useCallback(
    (doc: PendingDoc, status: string) => {
      const patch: Record<string, unknown> = { status };
      if (doc._type === "event") patch.approvedAt = new Date().toISOString();
      return client.patch(doc._id).set(patch).commit();
    },
    [client]
  );

  const approveOne = useCallback(
    async (doc: PendingDoc) => {
      const meta = TYPE_META[doc._type];
      if (!meta) return;
      setBusy((b) => ({ ...b, [doc._id]: true }));
      try {
        await setStatus(doc, meta.approve);
        toast.push({ status: "success", title: `Approved: ${doc.displayTitle ?? doc._id}` });
        setDocs((d) => d.filter((x) => x._id !== doc._id));
      } catch (err) {
        toast.push({ status: "error", title: "Approve failed", description: String(err) });
      } finally {
        setBusy((b) => ({ ...b, [doc._id]: false }));
      }
    },
    [setStatus, toast]
  );

  const rejectOne = useCallback(
    async (doc: PendingDoc) => {
      const meta = TYPE_META[doc._type];
      if (!meta) return;
      if (!window.confirm(`Reject "${doc.displayTitle ?? doc._id}"? It will stay in Studio but not appear on the site.`)) {
        return;
      }
      setBusy((b) => ({ ...b, [doc._id]: true }));
      try {
        await setStatus(doc, meta.reject);
        toast.push({ status: "success", title: `Rejected: ${doc.displayTitle ?? doc._id}` });
        setDocs((d) => d.filter((x) => x._id !== doc._id));
      } catch (err) {
        toast.push({ status: "error", title: "Reject failed", description: String(err) });
      } finally {
        setBusy((b) => ({ ...b, [doc._id]: false }));
      }
    },
    [setStatus, toast]
  );

  const approveAll = useCallback(
    async (type: string) => {
      const group = docs.filter((d) => d._type === type);
      const meta = TYPE_META[type];
      if (!group.length || !meta) return;
      if (!window.confirm(`Approve all ${group.length} pending ${meta.label.toLowerCase()}? They will go live on the site.`)) {
        return;
      }
      const ids = group.map((d) => d._id);
      setBusy((b) => ({ ...b, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      try {
        let tx = client.transaction();
        for (const doc of group) {
          const patch: Record<string, unknown> =
            doc._type === "event"
              ? { status: meta.approve, approvedAt: new Date().toISOString() }
              : { status: meta.approve };
          tx = tx.patch(doc._id, (p) => p.set(patch));
        }
        await tx.commit();
        toast.push({ status: "success", title: `Approved all ${group.length} ${meta.label.toLowerCase()}` });
        setDocs((d) => d.filter((x) => x._type !== type));
      } catch (err) {
        toast.push({ status: "error", title: "Approve all failed", description: String(err) });
      } finally {
        setBusy((b) => ({ ...b, ...Object.fromEntries(ids.map((id) => [id, false])) }));
      }
    },
    [client, docs, toast]
  );

  const types = Object.keys(TYPE_META).filter((t) => docs.some((d) => d._type === t));

  return (
    <Container width={4} paddingX={4} paddingY={5}>
      <Flex align="center" justify="space-between" paddingBottom={4}>
        <Heading size={2}>Approvals</Heading>
        <Button
          icon={RefreshIcon}
          mode="ghost"
          text="Refresh"
          onClick={load}
          disabled={loading}
        />
      </Flex>

      {loading ? (
        <Flex align="center" justify="center" padding={5}>
          <Spinner muted />
          <Box marginLeft={3}>
            <Text muted>Loading pending submissions…</Text>
          </Box>
        </Flex>
      ) : docs.length === 0 ? (
        <Card padding={5} radius={2} tone="positive" border>
          <Text align="center">🎉 Nothing waiting for approval. You are all caught up.</Text>
        </Card>
      ) : (
        <Stack space={5}>
          {types.map((type) => {
            const group = docs.filter((d) => d._type === type);
            const meta = TYPE_META[type];
            return (
              <Card key={type} padding={4} radius={2} shadow={1}>
                <Flex align="center" justify="space-between" paddingBottom={3}>
                  <Flex align="center" gap={2}>
                    <Heading size={1}>{meta.label}</Heading>
                    <Badge tone="caution">{group.length}</Badge>
                  </Flex>
                  <Button
                    icon={CheckmarkCircleIcon}
                    tone="positive"
                    text={`Approve all ${group.length}`}
                    onClick={() => approveAll(type)}
                  />
                </Flex>
                <Stack space={2}>
                  {group.map((doc) => (
                    <Card key={doc._id} padding={3} radius={2} tone="transparent" border>
                      <Flex align="center" justify="space-between" gap={3}>
                        <Box flex={1}>
                          <Text weight="semibold">{doc.displayTitle ?? "(untitled)"}</Text>
                          <Box marginTop={2}>
                            <Text size={1} muted>
                              {[
                                doc.date ? `When: ${fmtDate(doc.date)}` : null,
                                doc.submittedBy ? `By: ${doc.submittedBy}` : doc.contact ? `Contact: ${doc.contact}` : null,
                                `Submitted: ${fmtDate(doc._createdAt)}`,
                              ]
                                .filter(Boolean)
                                .join("  ·  ")}
                            </Text>
                          </Box>
                        </Box>
                        <Flex gap={2}>
                          <Button
                            icon={CheckmarkCircleIcon}
                            tone="positive"
                            mode="ghost"
                            text="Approve"
                            disabled={busy[doc._id]}
                            onClick={() => approveOne(doc)}
                          />
                          <Button
                            icon={CloseIcon}
                            tone="critical"
                            mode="ghost"
                            text="Reject"
                            disabled={busy[doc._id]}
                            onClick={() => rejectOne(doc)}
                          />
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}

export default ApprovalsTool;
