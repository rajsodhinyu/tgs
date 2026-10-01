import LoginForm from "./LoginForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only same-site relative paths, never "//host" or absolute URLs.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center">
      <h1 className="font-title text-4xl uppercase">tgos</h1>
      <LoginForm next={safeNext} />
    </div>
  );
}
