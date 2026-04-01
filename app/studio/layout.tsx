export const metadata = {
  title: "Langport Life Studio",
  description: "Content management for Langport Life",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ height: "100vh", margin: 0 }}>{children}</div>
  );
}
