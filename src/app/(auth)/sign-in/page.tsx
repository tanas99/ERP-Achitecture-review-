import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Tana&apos;s Bakery Shop</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa a tu ERP
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
