import LoginForm from "./LoginForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Same-site relative paths only; browsers read "\" as "/" and drop tabs/newlines.
  const safeNext = next && /^\/(?!\/)[^\\\x00-\x1f]*$/.test(next) ? next : "/";
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center">
      <h1 className="font-title text-4xl uppercase">tgos</h1>
      <LoginForm next={safeNext} />
    </div>
  );
}
