export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-teal text-white px-4 py-2 rounded-lg font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2"
      data-testid="skip-to-content"
    >
      Saltar al contenido principal
    </a>
  );
}