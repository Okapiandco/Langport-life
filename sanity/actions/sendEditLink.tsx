import { useCallback, useEffect, useState } from "react";
import { Box, Button, Card, Flex, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { EnvelopeIcon } from "@sanity/icons";
import { useClient, type DocumentActionComponent, type DocumentActionProps } from "sanity";

/** Types whose owners can be sent an edit link */
export const EDIT_LINK_TYPES = ["businessListing", "event", "venue", "group"] as const;

const EMAIL_FIELDS = ["email", "contactEmail"] as const;

/**
 * "Send edit link" document action.
 *
 * The Studio cannot reach Neon or Resend, so it writes a short-lived
 * `editLinkRequest` document and asks the server to act on it. Writing that
 * document needs a token, which is what makes this editors-only.
 */
export const SendEditLinkAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, draft, published, onComplete } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const toast = useToast();

  const doc = (draft ?? published) as Record<string, unknown> | null;
  const suggested =
    EMAIL_FIELDS.map((f) => doc?.[f]).find((v) => typeof v === "string" && v.includes("@")) ?? "";

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(String(suggested));
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setEmail(String(suggested));
  }, [open, suggested]);

  const listingName = (doc?.title ?? doc?.name ?? "this listing") as string;

  const send = useCallback(async () => {
    const address = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) {
      toast.push({ status: "warning", title: "Enter a valid email address" });
      return;
    }
    setSending(true);
    try {
      // Published id, so the link points at the live document rather than a draft
      const targetId = id.replace(/^drafts\./, "");
      const request = await client.create({
        _type: "editLinkRequest",
        targetId,
        targetType: type,
        email: address,
        recipientName: (doc?.contactName as string) ?? undefined,
        requestedAt: new Date().toISOString(),
      });

      const res = await fetch("/api/admin/send-edit-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId: request._id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // The server deletes the request itself; tidy up if it never got that far
        await client.delete(request._id).catch(() => {});
        toast.push({ status: "error", title: "Not sent", description: data.error ?? "Please try again." });
        return;
      }

      toast.push({
        status: "success",
        title: `Edit link sent to ${data.email}`,
        description: "Any previous link for this listing has stopped working.",
      });
      setOpen(false);
      onComplete();
    } catch (err) {
      toast.push({ status: "error", title: "Not sent", description: String(err) });
    } finally {
      setSending(false);
    }
  }, [client, doc, email, id, onComplete, toast, type]);

  return {
    label: "Send edit link",
    icon: EnvelopeIcon,
    disabled: !published && !draft,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "dialog" as const,
      header: `Send an edit link for ${listingName}`,
      onClose: () => {
        setOpen(false);
        onComplete();
      },
      content: (
        <Stack space={4}>
          <Text size={1}>
            The owner gets a private link that lets them update this listing themselves. Their
            changes come back to Approvals before they appear on the site.
          </Text>
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Send to
            </Text>
            <TextInput
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            {suggested ? (
              <Text size={1} muted>
                Suggested from the listing&apos;s own contact details. Change it if the owner uses a
                different address.
              </Text>
            ) : (
              <Text size={1} muted>
                This listing has no contact email saved, so type the owner&apos;s address.
              </Text>
            )}
          </Stack>
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>
              Anyone with the link can edit this listing, so send it only to the owner. Sending a new
              link stops any previous one working.
            </Text>
          </Card>
          <Flex gap={2} justify="flex-end">
            <Box>
              <Button
                mode="bleed"
                text="Cancel"
                disabled={sending}
                onClick={() => {
                  setOpen(false);
                  onComplete();
                }}
              />
            </Box>
            <Box>
              <Button
                tone="primary"
                text={sending ? "Sending…" : "Send link"}
                disabled={sending}
                onClick={send}
              />
            </Box>
          </Flex>
        </Stack>
      ),
    },
  };
};
