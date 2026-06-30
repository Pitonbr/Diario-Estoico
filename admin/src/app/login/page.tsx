import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100">
      <form
        action={login}
        className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold text-stone-900">
          🏛️ Diário Estoico
        </h1>
        <p className="mb-6 text-sm text-stone-500">Painel administrativo</p>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-stone-700">
          E-mail
        </label>
        <input
          name="email"
          type="email"
          required
          className="mb-4 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-stone-700">
          Senha
        </label>
        <input
          name="password"
          type="password"
          required
          className="mb-6 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
