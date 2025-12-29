export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* No navigation/header - strict flow */}
      {children}
      {/* No footer - strict flow */}
    </div>
  );
}

